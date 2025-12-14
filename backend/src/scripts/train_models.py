# train_models.py - Hệ thống training và lưu models sử dụng MongoDB
import pandas as pd
import numpy as np
import pickle
import json
from datetime import datetime
from pathlib import Path
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, r2_score
import joblib
import os
from dotenv import load_dotenv

load_dotenv()

# ===========================
# CẤU HÌNH
# ===========================

MODELS_DIR = Path('ml_models')
MODELS_DIR.mkdir(exist_ok=True)

CONFIG = {
    'clustering': {
        'n_clusters': 3,
        'features': ['gdp_avg', 'population', 'area', 'num_borders']
    },
    'gdp_prediction': {
        'features': ['population', 'area', 'num_borders', 'gdp_growth'],
        'target': 'gdp_latest',
        'test_size': 0.2
    }
}

# ===========================
# TRAINING PIPELINE
# ===========================

class ModelTrainer:
    def __init__(self):
        self.df = None
        self.models = {}
        self.scalers = {}
        self.metrics = {}
        
    def load_data(self):
        """Load và preprocess data từ MongoDB"""
        print("📂 Loading data from MongoDB...")
        try:
            from ml_analysis import load_and_prepare_data
            self.df = load_and_prepare_data()
            print(f"✅ Loaded {len(self.df)} countries")
            return self
        except Exception as e:
            print(f"❌ Error loading data: {e}")
            raise
    
    def train_clustering_model(self):
        """Train K-Means clustering model"""
        print("\n🎯 Training Clustering Model...")
        
        features = CONFIG['clustering']['features']
        X = self.df[features].fillna(0)
        
        # Chuẩn hóa
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
        
        # Training
        kmeans = KMeans(
            n_clusters=CONFIG['clustering']['n_clusters'],
            random_state=42,
            n_init=10,
            max_iter=300
        )
        kmeans.fit(X_scaled)
        
        # Đánh giá
        silhouette = self._calculate_silhouette_score(X_scaled, kmeans.labels_)
        
        # Lưu
        self.models['clustering'] = kmeans
        self.scalers['clustering'] = scaler
        self.metrics['clustering'] = {
            'silhouette_score': silhouette,
            'n_clusters': CONFIG['clustering']['n_clusters'],
            'inertia': float(kmeans.inertia_)
        }
        
        print(f"✅ Clustering trained - Silhouette Score: {silhouette:.3f}")
        return self
    
    def train_gdp_prediction_models(self):
        """Train multiple models cho GDP prediction và chọn model tốt nhất"""
        print("\n📈 Training GDP Prediction Models...")
        
        feature_cols = CONFIG['gdp_prediction']['features']
        target_col = CONFIG['gdp_prediction']['target']
        
        X = self.df[feature_cols].fillna(0)
        y = self.df[target_col].fillna(0)
        
        # Loại bỏ GDP = 0
        valid_mask = y > 0
        X = X[valid_mask]
        y = y[valid_mask]
        
        if len(X) < 10:
            print(f"⚠️ Not enough valid samples for GDP prediction ({len(X)} < 10)")
            self.models['gdp_prediction'] = None
            self.metrics['gdp_prediction_best'] = 'no_model'
            return self
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=CONFIG['gdp_prediction']['test_size'], random_state=42
        )
        
        # Train nhiều models
        models_to_train = {
            'RandomForest': RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10, n_jobs=-1),
            'GradientBoosting': GradientBoostingRegressor(n_estimators=100, random_state=42, max_depth=5)
        }
        
        best_model = None
        best_score = -np.inf
        best_name = None
        
        for name, model in models_to_train.items():
            print(f"\n  Training {name}...")
            
            try:
                # Train
                model.fit(X_train, y_train)
                
                # Cross-validation
                cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='r2')
                
                # Test predictions
                y_pred = model.predict(X_test)
                
                # Metrics
                mse = mean_squared_error(y_test, y_pred)
                rmse = np.sqrt(mse)
                r2 = r2_score(y_test, y_pred)
                
                print(f"    R² Score: {r2:.4f}")
                print(f"    RMSE: ${rmse/1e9:.2f}B")
                print(f"    CV R² (mean): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
                
                # Lưu metrics
                self.metrics[f'gdp_prediction_{name}'] = {
                    'r2_score': float(r2),
                    'rmse': float(rmse),
                    'cv_r2_mean': float(cv_scores.mean()),
                    'cv_r2_std': float(cv_scores.std()),
                    'feature_importance': dict(zip(feature_cols, [float(x) for x in model.feature_importances_]))
                }
                
                # Chọn model tốt nhất
                if r2 > best_score:
                    best_score = r2
                    best_model = model
                    best_name = name
            except Exception as e:
                print(f"    ❌ Error training {name}: {e}")
                continue
        
        if best_model is None:
            print(f"⚠️ No valid GDP model trained")
            self.models['gdp_prediction'] = None
            self.metrics['gdp_prediction_best'] = 'no_model'
        else:
            print(f"\n✅ Best model: {best_name} (R²: {best_score:.4f})")
            self.models['gdp_prediction'] = best_model
            self.metrics['gdp_prediction_best'] = best_name
        
        return self
    
    def save_models(self, version=None):
        """Lưu tất cả models và metadata"""
        if version is None:
            version = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        version_dir = MODELS_DIR / version
        version_dir.mkdir(exist_ok=True)
        
        print(f"\n💾 Saving models to {version_dir}...")
        
        # Lưu models
        for name, model in self.models.items():
            if model is not None:
                model_path = version_dir / f'{name}_model.pkl'
                joblib.dump(model, model_path)
                print(f"  ✅ Saved {name} model")
        
        # Lưu scalers
        for name, scaler in self.scalers.items():
            scaler_path = version_dir / f'{name}_scaler.pkl'
            joblib.dump(scaler, scaler_path)
            print(f"  ✅ Saved {name} scaler")
        
        # Lưu metrics
        metrics_path = version_dir / 'metrics.json'
        with open(metrics_path, 'w') as f:
            json.dump(self.metrics, f, indent=2)
        print(f"  ✅ Saved metrics")
        
        # Lưu config
        config_path = version_dir / 'config.json'
        with open(config_path, 'w') as f:
            json.dump(CONFIG, f, indent=2)
        
        # Lưu metadata
        metadata = {
            'version': version,
            'created_at': datetime.now().isoformat(),
            'num_samples': len(self.df),
            'models': [k for k, v in self.models.items() if v is not None],
            'best_gdp_model': self.metrics.get('gdp_prediction_best', 'unknown')
        }
        metadata_path = version_dir / 'metadata.json'
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Cập nhật "latest" link (Windows-compatible: use txt file instead of symlink)
        latest_link = MODELS_DIR / 'latest'
        # On Windows, we use a text file as a marker instead of symlink
        if latest_link.exists():
            latest_link.unlink()
        try:
            # Try creating symlink for Linux/Mac
            latest_link.symlink_to(version_dir.name)
        except (OSError, NotImplementedError):
            # Fall back to creating a marker file on Windows
            with open(latest_link.with_suffix('.txt'), 'w') as f:
                f.write(version_dir.name)
        
        print(f"\n✅ All models saved to version: {version}")
        print(f"📍 Latest models linked to: {version}")
        
        return version
    
    def _calculate_silhouette_score(self, X, labels):
        """Tính Silhouette Score"""
        from sklearn.metrics import silhouette_score
        return silhouette_score(X, labels)
    
    def generate_report(self):
        """Tạo báo cáo training"""
        print("\n" + "="*60)
        print("📊 TRAINING REPORT")
        print("="*60)
        
        for model_name, metrics in self.metrics.items():
            print(f"\n{model_name.upper()}:")
            if isinstance(metrics, dict):
                for metric_name, value in metrics.items():
                    if isinstance(value, dict):
                        print(f"  {metric_name}:")
                        for k, v in list(value.items())[:5]:  # Show only first 5 features
                            print(f"    - {k}: {v:.4f}" if isinstance(v, float) else f"    - {k}: {v}")
                        if len(value) > 5:
                            print(f"    ... and {len(value) - 5} more features")
                    else:
                        if isinstance(value, float):
                            print(f"  {metric_name}: {value:.4f}")
                        else:
                            print(f"  {metric_name}: {value}")
            else:
                # If metrics is not a dict (e.g., string), just print it
                print(f"  Value: {metrics}")
        
        print("\n" + "="*60)

# ===========================
# MODEL LOADER (cho API)
# ===========================

class ModelLoader:
    def __init__(self, version='latest'):
        self.version = version
        self.models = {}
        self.scalers = {}
        self.metadata = {}
        self.load_models()
    
    def load_models(self):
        """Load models từ disk"""
        version_dir = MODELS_DIR / self.version
        
        # If version is 'latest', resolve it from latest.txt on Windows
        if self.version == 'latest' and not version_dir.exists():
            latest_file = MODELS_DIR / 'latest.txt'
            if latest_file.exists():
                with open(latest_file, 'r') as f:
                    actual_version = f.read().strip()
                version_dir = MODELS_DIR / actual_version
                print(f"📍 Resolved 'latest' to: {actual_version}")
            else:
                raise FileNotFoundError(f"No model versions found (checked for 'latest' directory and 'latest.txt')")
        
        if not version_dir.exists():
            raise FileNotFoundError(f"Model version {self.version} not found at {version_dir}")
        
        # Load metadata
        metadata_path = version_dir / 'metadata.json'
        with open(metadata_path) as f:
            self.metadata = json.load(f)
        
        print(f"📦 Loading models version: {self.metadata['version']}")
        
        # Load models
        for model_name in self.metadata['models']:
            model_path = version_dir / f'{model_name}_model.pkl'
            if model_path.exists():
                self.models[model_name] = joblib.load(model_path)
                print(f"  ✅ Loaded {model_name}")
        
        # Load scalers
        for scaler_file in version_dir.glob('*_scaler.pkl'):
            scaler_name = scaler_file.stem.replace('_scaler', '')
            self.scalers[scaler_name] = joblib.load(scaler_file)
            print(f"  ✅ Loaded {scaler_name} scaler")
    
    def get_model(self, name):
        """Lấy model"""
        return self.models.get(name)
    
    def get_scaler(self, name):
        """Lấy scaler"""
        return self.scalers.get(name)

# ===========================
# TRAINING SCHEDULER
# ===========================

def schedule_retraining():
    """Hàm để chạy định kỳ (có thể dùng Celery/cron)"""
    print("🔄 Starting scheduled retraining...")
    
    trainer = ModelTrainer()
    trainer.load_data()
    trainer.train_clustering_model()
    trainer.train_gdp_prediction_models()
    
    version = trainer.save_models()
    trainer.generate_report()
    
    return version

# ===========================
# MAIN
# ===========================

if __name__ == '__main__':
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'retrain':
        # Chạy retraining
        schedule_retraining()
    else:
        # Training ban đầu
        print("🚀 Starting initial training...")
        
        trainer = ModelTrainer()
        trainer.load_data()
        trainer.train_clustering_model()
        trainer.train_gdp_prediction_models()
        
        version = trainer.save_models()
        trainer.generate_report()
        
        print(f"\n✅ Training completed! Version: {version}")
        print(f"📁 Models saved in: models/{version}")
        print(f"\n💡 To use in API: ModelLoader(version='latest')")
        print(f"💡 To retrain: python train_models.py retrain")

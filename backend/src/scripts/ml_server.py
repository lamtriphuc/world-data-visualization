# ml_server.py - Flask API sử dụng pre-trained models từ MongoDB
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
from train_models import ModelLoader, schedule_retraining
from ml_analysis import load_and_prepare_data, find_similar_countries, analyze_geopolitical_network
import threading
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# ===========================
# GLOBAL STATE
# ===========================

# Load models khi start server
print("🔄 Initializing ML models...")
model_loader = None
df_cache = None
clusters_cache = None  # Cache cluster assignments

def init_models():
    global model_loader, df_cache, clusters_cache
    try:
        model_loader = ModelLoader(version='latest')
        df_cache = load_and_prepare_data()
        
        # Pre-calculate clusters and cache them
        kmeans = model_loader.get_model('clustering')
        scaler = model_loader.get_scaler('clustering')
        features = ['gdp_avg', 'population', 'area', 'num_borders']
        X = df_cache[features].fillna(0)
        X_scaled = scaler.transform(X)
        clusters_cache = kmeans.predict(X_scaled)
        df_cache['cluster'] = clusters_cache
        
        print("✅ Models loaded successfully!")
    except FileNotFoundError:
        print("⚠️ No trained models found. Please run training first:")
        print("   python src/scripts/train_models.py")
        model_loader = None
    except Exception as e:
        print(f"❌ Error initializing models: {e}")
        model_loader = None

init_models()

# ===========================
# HELPER FUNCTIONS
# ===========================

def ensure_models_loaded():
    """Middleware để check models đã load chưa"""
    if model_loader is None:
        return {
            'success': False,
            'error': 'Models not trained yet. Run: python src/scripts/train_models.py'
        }, 503
    return None

# ===========================
# API ENDPOINTS
# ===========================

@app.route('/api/ml/clusters', methods=['GET'])
def get_clusters():
    """Phân nhóm quốc gia (sử dụng pre-trained model)"""
    error = ensure_models_loaded()
    if error: return error
    
    try:
        # Lấy model đã train
        kmeans = model_loader.get_model('clustering')
        
        # Phân tích từng cluster - sử dụng cached clusters từ df_cache
        results = []
        for cluster_id in range(kmeans.n_clusters):
            cluster_data = df_cache[df_cache['cluster'] == cluster_id]
            
            results.append({
                'cluster_id': int(cluster_id),
                'count': len(cluster_data),
                'countries': cluster_data['name'].tolist()[:10],
                'avg_gdp': float(cluster_data['gdp_latest'].mean()),
                'avg_population': float(cluster_data['population'].mean()),
                'avg_area': float(cluster_data['area'].mean())
            })
        
        return jsonify({
            'success': True,
            'data': results,
            'model_version': model_loader.metadata['version']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/clusters-scatter', methods=['GET'])
def get_clusters_scatter():
    """Lấy dữ liệu scatter chart: dân số vs GDP bình quân đầu người"""
    error = ensure_models_loaded()
    if error: return error
    
    try:
        # Lấy model đã train
        kmeans = model_loader.get_model('clustering')
        
        # Prepare scatter data - sử dụng cached clusters
        scatter_data = []
        for idx, row in df_cache.iterrows():
            # Tính GDP per capita = GDP / population
            population = float(row['population']) if pd.notna(row['population']) else 0
            gdp = float(row.get('gdp_latest', 0)) if pd.notna(row.get('gdp_latest', 0)) else 0
            
            # Chỉ thêm dữ liệu hợp lệ (population > 0 để log scale hoạt động)
            if population > 0 and gdp > 0:
                gdp_per_capita = gdp / population
                scatter_data.append({
                    'country': row['name'],
                    'code': row.get('cca3', 'N/A'),
                    'population': population,
                    'gdp_per_capita': gdp_per_capita,
                    'cluster': int(row['cluster']),  # Sử dụng cluster từ df_cache
                    'gdp': gdp
                })
        
        return jsonify({
            'success': True,
            'data': scatter_data,
            'num_clusters': kmeans.n_clusters,
            'model_version': model_loader.metadata['version']
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/predict-gdp/<country_code>', methods=['GET'])
def predict_gdp(country_code):
    """Dự đoán GDP (sử dụng pre-trained model)"""
    error = ensure_models_loaded()
    if error: return error
    
    try:
        country_code = country_code.upper()
        country = df_cache[df_cache['cca3'] == country_code]
        
        if country.empty:
            return jsonify({
                'success': False,
                'error': f'Country {country_code} not found'
            }), 404
        
        # Lấy model đã train
        model = model_loader.get_model('gdp_prediction')
        
        if model is None:
            return jsonify({
                'success': False,
                'error': 'GDP prediction model not available'
            }), 503
        
        # Prepare features
        feature_cols = ['population', 'area', 'num_borders', 'gdp_growth']
        X = country[feature_cols].fillna(0)
        
        # Predict
        predicted_gdp = float(model.predict(X)[0])
        actual_gdp = float(country['gdp_latest'].values[0])
        
        result = {
            'country': country['name'].values[0],
            'country_code': country_code,
            'actual_gdp': actual_gdp,
            'predicted_gdp': predicted_gdp,
            'error_percent': abs(predicted_gdp - actual_gdp) / actual_gdp * 100 if actual_gdp > 0 else 0,
            'confidence': 'high' if hasattr(model, 'feature_importances_') else 'medium'
        }
        
        return jsonify({
            'success': True,
            'data': result,
            'model_version': model_loader.metadata['version'],
            'model_type': model_loader.metadata.get('best_gdp_model', 'RandomForest')
        })
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/similar/<country_code>', methods=['GET'])
def get_similar(country_code):
    """Tìm quốc gia tương đồng"""
    error = ensure_models_loaded()
    if error: return error
    
    try:
        top_n = int(request.args.get('top_n', 5))
        result = find_similar_countries(df_cache.copy(), country_code.upper(), top_n)
        
        if result is None:
            return jsonify({
                'success': False,
                'error': f'Country {country_code} not found'
            }), 404
        
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/network-analysis', methods=['GET'])
def network_analysis():
    """Phân tích mạng lưới địa chính trị"""
    error = ensure_models_loaded()
    if error: return error
    
    try:
        result = analyze_geopolitical_network(df_cache.copy())
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


@app.route('/api/ml/model-info', methods=['GET'])
def get_model_info():
    """Lấy thông tin về models hiện tại"""
    error = ensure_models_loaded()
    if error: return error
    
    return jsonify({
        'success': True,
        'data': {
            'version': model_loader.metadata['version'],
            'created_at': model_loader.metadata['created_at'],
            'models': model_loader.metadata['models'],
            'num_samples': model_loader.metadata['num_samples'],
            'best_gdp_model': model_loader.metadata.get('best_gdp_model', 'unknown')
        }
    })


@app.route('/api/ml/retrain', methods=['POST'])
def trigger_retrain():
    """
    Trigger retraining models (chạy background)
    
    POST /api/ml/retrain
    Body: {"async": true}  # Optional: chạy background
    """
    data = request.json or {}
    run_async = data.get('async', True)  # Default chạy background
    
    if run_async:
        # Chạy background
        thread = threading.Thread(target=_retrain_and_reload)
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'success': True,
            'message': 'Retraining started in background',
            'status': 'pending'
        })
    else:
        # Chạy sync (chặn request)
        try:
            version = schedule_retraining()
            _reload_models()
            
            return jsonify({
                'success': True,
                'message': 'Models retrained successfully',
                'version': version
            })
        except Exception as e:
            return jsonify({
                'success': False,
                'error': str(e)
            }), 500


def _retrain_and_reload():
    """Helper: retrain và reload models"""
    try:
        print("🔄 Background retraining started...")
        version = schedule_retraining()
        _reload_models()
        print(f"✅ Retraining completed! New version: {version}")
    except Exception as e:
        print(f"❌ Retraining failed: {e}")


def _reload_models():
    """Reload models sau khi retrain"""
    global model_loader, df_cache
    try:
        model_loader = ModelLoader(version='latest')
        df_cache = load_and_prepare_data()
        print("✅ Models reloaded in memory")
    except Exception as e:
        print(f"❌ Error reloading models: {e}")


@app.route('/health', methods=['GET'])
def health_check():
    """Health check"""
    status = 'ok' if model_loader is not None else 'models_not_loaded'
    
    return jsonify({
        'status': status,
        'service': 'ML Country Analysis API',
        'models_loaded': model_loader is not None,
        'version': model_loader.metadata['version'] if model_loader else None
    })


@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'message': 'ML Country Analysis API',
        'service': 'Clustering & GDP Prediction',
        'status': 'running',
        'health': '/health'
    })


if __name__ == '__main__':
    if model_loader is None:
        print("\n" + "="*60)
        print("⚠️  WARNING: No trained models found!")
        print("="*60)
        print("\nPlease train models first:")
        print("  cd src/scripts")
        print("  python train_models.py")
        print("\nThen restart this server.")
        print("="*60 + "\n")
    
    print("\n🚀 Starting ML API Server...")
    print("📊 Available endpoints:")
    print("   - GET  /api/ml/clusters")
    print("   - GET  /api/ml/predict-gdp/<code>")
    print("   - GET  /api/ml/similar/<code>")
    print("   - GET  /api/ml/network-analysis")
    print("   - GET  /api/ml/model-info")
    print("   - POST /api/ml/retrain")
    print("   - GET  /health")
    print(f"\n✅ Server running on http://localhost:{os.getenv('ML_PORT', 5000)}\n")
    
    port = int(os.getenv('ML_PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)

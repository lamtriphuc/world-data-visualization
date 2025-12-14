# ml_analysis.py - Phân tích dữ liệu từ MongoDB
import pandas as pd
import numpy as np
from pymongo import MongoClient
from urllib.parse import quote_plus
import os
from dotenv import load_dotenv

load_dotenv()

# ===========================
# MONGODB CONNECTION
# ===========================

def get_mongodb_connection():
    """Kết nối MongoDB"""
    mongo_uri = os.getenv('MONGO_URI')
    if not mongo_uri:
        raise ValueError("MONGO_URI not found in environment variables")
    
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Test connection
        client.admin.command('ping')
        return client
    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        raise

def get_database():
    """Lấy database object từ MONGO_URI"""
    client = get_mongodb_connection()
    
    # Ưu tiên: lấy tên database từ environment variable
    db_name = os.getenv('MONGO_DB_NAME')
    
    if db_name:
        db = client[db_name]
    else:
        # Fallback: parse từ MONGO_URI
        # Format: mongodb+srv://user:pass@host/databasename?...
        mongo_uri = os.getenv('MONGO_URI')
        
        if '/' in mongo_uri:
            parts = mongo_uri.split('/')
            if len(parts) > 0:
                db_with_query = parts[-1]  # database_name?params
                db_name = db_with_query.split('?')[0]  # database_name
                
                if db_name:
                    db = client[db_name]
                else:
                    # Nếu không có database name trong URI, mặc định 'world-data'
                    db = client['world-data']
            else:
                db = client['world-data']
        else:
            raise ValueError("Invalid MONGO_URI format")
    
    return client, db

# ===========================
# DATA LOADING FROM MONGODB
# ===========================

def load_data_from_mongodb():
    """Load dữ liệu quốc gia từ MongoDB"""
    print("📂 Loading data from MongoDB...")
    
    try:
        client, db = get_database()
        
        # Fetch countries collection (try multiple collection names)
        countries_list = []
        for collection_name in ['countries', 'Countries', 'country', 'Country']:
            try:
                countries_collection = db[collection_name]
                countries_list = list(countries_collection.find())
                if countries_list:
                    print(f"  Found '{collection_name}' collection")
                    break
            except Exception:
                continue
        
        client.close()
        
        if not countries_list:
            raise ValueError("No countries found in MongoDB (tried: countries, Countries, country, Country)")
        
        print(f"✅ Loaded {len(countries_list)} countries from MongoDB")
        return countries_list
    except Exception as e:
        print(f"❌ Error loading from MongoDB: {e}")
        raise

def prepare_dataframe(countries_data):
    """Chuyển đổi dữ liệu MongoDB thành DataFrame"""
    data = []
    
    for country in countries_data:
        try:
            # Extract basic info
            row = {
                'cca3': country.get('cca3', ''),
                'name': country.get('name', {}).get('common', ''),
                'area': country.get('area', 0) or 0,
                'borders': country.get('borders', []),
                'num_borders': len(country.get('borders', [])),
            }
            
            # Population (từ population object)
            pop_data = country.get('population', {})
            if isinstance(pop_data, dict):
                row['population'] = pop_data.get('value', 0) or 0
            else:
                row['population'] = pop_data or 0
            
            # GDP data
            gdp_data = country.get('gdp', [])
            if gdp_data and len(gdp_data) > 0:
                gdp_sorted = sorted(gdp_data, key=lambda x: x.get('year', 0), reverse=True)
                row['gdp_latest'] = gdp_sorted[0].get('value', 0) or 0
                
                # Calculate GDP average (last 5 years)
                gdp_last_5 = [g.get('value', 0) for g in gdp_sorted[:5] if g.get('value', 0)]
                row['gdp_avg'] = np.mean(gdp_last_5) if gdp_last_5 else 0
                
                # GDP growth (latest vs previous year)
                if len(gdp_sorted) > 1:
                    latest = gdp_sorted[0].get('value', 0) or 0
                    previous = gdp_sorted[1].get('value', 0) or 0
                    if previous > 0:
                        row['gdp_growth'] = ((latest - previous) / previous) * 100
                    else:
                        row['gdp_growth'] = 0
                else:
                    row['gdp_growth'] = 0
            else:
                row['gdp_latest'] = 0
                row['gdp_avg'] = 0
                row['gdp_growth'] = 0
            
            data.append(row)
        except Exception as e:
            print(f"⚠️ Error processing country {country.get('cca3', 'unknown')}: {e}")
            continue
    
    df = pd.DataFrame(data)
    
    # Fill NaN values
    numeric_cols = ['population', 'area', 'gdp_latest', 'gdp_avg', 'gdp_growth']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].fillna(0)
    
    print(f"✅ Prepared {len(df)} countries for analysis")
    return df

def load_and_prepare_data():
    """Load từ MongoDB và prepare DataFrame"""
    countries_data = load_data_from_mongodb()
    df = prepare_dataframe(countries_data)
    return df

# ===========================
# ANALYSIS FUNCTIONS
# ===========================

def find_similar_countries(df, country_code, top_n=5):
    """Tìm quốc gia tương đồng dựa trên các đặc trưng"""
    country_code = country_code.upper()
    
    country = df[df['cca3'] == country_code]
    if country.empty:
        return None
    
    # Features để so sánh
    features = ['gdp_avg', 'population', 'area', 'num_borders']
    
    # Chuẩn hóa features
    from sklearn.preprocessing import StandardScaler
    X = df[features].fillna(0)
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Tính khoảng cách Euclidean
    country_features = X_scaled[df[df['cca3'] == country_code].index[0]]
    distances = np.linalg.norm(X_scaled - country_features, axis=1)
    
    # Lấy top N country gần nhất (exclude country itself)
    similar_idx = np.argsort(distances)[1:top_n+1]
    
    similar_countries = []
    for idx in similar_idx:
        row = df.iloc[idx]
        similar_countries.append({
            'country': row['name'],
            'code': row['cca3'],
            'gdp': float(row['gdp_latest']),
            'population': int(row['population']),
            'area': float(row['area']),
            'similarity_score': float(1 / (1 + distances[idx]))  # Convert distance to similarity
        })
    
    return {
        'country': country['name'].values[0],
        'country_code': country_code,
        'similar_countries': similar_countries
    }

def analyze_geopolitical_network(df):
    """Phân tích mạng lưới địa chính trị"""
    # Thống kê chung
    total_borders = df['num_borders'].sum() // 2  # Each border counted twice
    
    # Top countries by number of borders
    top_borders = df.nlargest(10, 'num_borders')[['name', 'num_borders']].to_dict('records')
    
    # Regional analysis
    regions = {
        'Africa': df[df['region'] == 'Africa'] if 'region' in df.columns else pd.DataFrame(),
        'Europe': df[df['region'] == 'Europe'] if 'region' in df.columns else pd.DataFrame(),
        'Asia': df[df['region'] == 'Asia'] if 'region' in df.columns else pd.DataFrame(),
        'Americas': df[df['region'] == 'Americas'] if 'region' in df.columns else pd.DataFrame(),
        'Oceania': df[df['region'] == 'Oceania'] if 'region' in df.columns else pd.DataFrame(),
    }
    
    regional_stats = {}
    for region, region_df in regions.items():
        if not region_df.empty:
            regional_stats[region] = {
                'count': len(region_df),
                'total_gdp': float(region_df['gdp_latest'].sum()),
                'avg_population': int(region_df['population'].mean()),
                'total_area': float(region_df['area'].sum())
            }
    
    return {
        'total_countries': len(df),
        'total_borders': int(total_borders),
        'top_countries_by_borders': top_borders,
        'regional_stats': regional_stats,
        'global_gdp': float(df['gdp_latest'].sum()),
        'global_population': int(df['population'].sum())
    }

# ===========================
# TEST
# ===========================

if __name__ == '__main__':
    try:
        df = load_and_prepare_data()
        print(f"\n📊 Data shape: {df.shape}")
        print(f"\n🔝 Top 5 countries by GDP:")
        print(df.nlargest(5, 'gdp_latest')[['name', 'gdp_latest']])
        
        # Test similar countries
        similar = find_similar_countries(df, 'USA', top_n=5)
        print(f"\n🤝 Countries similar to {similar['country']}:")
        for c in similar['similar_countries']:
            print(f"  - {c['country']}")
        
        # Test network analysis
        network = analyze_geopolitical_network(df)
        print(f"\n🌍 Geopolitical Network:")
        print(f"  Total countries: {network['total_countries']}")
        print(f"  Global GDP: ${network['global_gdp']/1e12:.2f}T")
        
    except Exception as e:
        print(f"❌ Error in test: {e}")

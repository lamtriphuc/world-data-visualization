# ML Integration Guide

## Tổng Quan

Hệ thống ML được tích hợp vào project world-data-visualization bao gồm:

1. **ml_analysis.py** - Module phân tích dữ liệu từ MongoDB
2. **train_models.py** - Module training các models ML
3. **ml_server.py** - Flask API server cho ML
4. **ml.service.js** - Service gọi ML API từ Express
5. **ml.route.js** - Express routes cho ML features

## Kiến Trúc

```
Express Backend (Node.js)
    ↓
ml.route.js + ml.service.js
    ↓
Flask ML API (Python) - ml_server.py
    ↓
train_models.py + ml_analysis.py
    ↓
MongoDB (dữ liệu quốc gia)
```

## Setup & Installation

### 1. Cài đặt Python Dependencies

```bash
# Tại thư mục backend
cd src/scripts

# Cài các package từ requirements.txt
pip install -r ../../requirements.txt

# Hoặc cài thủ công:
pip install pandas numpy scikit-learn flask flask-cors pymongo python-dotenv

### 2. Cấu Hình Environment Variables

Thêm vào `.env` file ở thư mục backend:

```env
# MongoDB - QUAN TRỌNG: MONGO_URI phải bao gồm database name
# Format: mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/world-data?retryWrites=true&w=majority

# Hoặc nếu dùng local MongoDB:
# MONGO_URI=mongodb://localhost:27017/world-data

# Optional: Chỉ định tên database (nếu muốn override URI)
MONGO_DB_NAME=world-data

# Flask ML API
ML_API_URL=http://localhost:5000
ML_PORT=5000

# Express Backend
NODE_ENV=development
PORT=3001
```

**Lưu ý quan trọng:**
- MONGO_URI **PHẢI** chứa tên database (ví dụ: `/world-data?retryWrites=true`)
- Nếu không có database name trong URI, set `MONGO_DB_NAME` environment variable
- Collection name mặc định là `countries`

### 3. Training Models

Trước khi sử dụng ML API, cần train models lần đầu:

```bash
# Tại thư mục backend
npm run ml:train

# Hoặc trực tiếp:
python src/scripts/train_models.py
```

**Output:**
- Tạo thư mục `models/` với các trained models
- Tạo symlink `models/latest` pointing đến latest version
- In ra training report

### 4. Chạy ML API Server

Ở terminal riêng:

```bash
# Tại thư mục backend
npm run ml:server

# Hoặc trực tiếp:
python src/scripts/ml_server.py
```

Server sẽ chạy trên `http://localhost:5000`

### 5. Chạy Express Backend (bình thường)

Ở terminal khác:

```bash
# Tại thư mục backend
npm run dev

# Hoặc:
npm start
```

## API Endpoints

Tất cả endpoints được expose thông qua Express backend:

### 1. Clustering

```
GET /api/ml/clusters
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "cluster_id": 0,
      "count": 50,
      "countries": ["USA", "China", "Japan", ...],
      "avg_gdp": 1500000000000,
      "avg_population": 100000000,
      "avg_area": 5000000
    },
    ...
  ],
  "model_version": "20231213_120000"
}
```

### 2. GDP Prediction

```
GET /api/ml/predict-gdp/{countryCode}
```

Example: `/api/ml/predict-gdp/USA`

Response:
```json
{
  "success": true,
  "data": {
    "country": "United States",
    "country_code": "USA",
    "actual_gdp": 27360000000000,
    "predicted_gdp": 27100000000000,
    "error_percent": 0.95,
    "confidence": "high"
  },
  "model_version": "20231213_120000",
  "model_type": "RandomForest"
}
```

### 3. Similar Countries

```
GET /api/ml/similar/{countryCode}?top_n=5
```

Example: `/api/ml/similar/USA?top_n=5`

Response:
```json
{
  "success": true,
  "data": {
    "country": "United States",
    "country_code": "USA",
    "similar_countries": [
      {
        "country": "China",
        "code": "CHN",
        "gdp": 17734000000000,
        "population": 1412000000,
        "area": 9600000,
        "similarity_score": 0.98
      },
      ...
    ]
  }
}
```

### 4. Network Analysis

```
GET /api/ml/network-analysis
```

Response:
```json
{
  "success": true,
  "data": {
    "total_countries": 195,
    "total_borders": 420,
    "top_countries_by_borders": [
      {
        "name": "Russia",
        "num_borders": 14
      },
      ...
    ],
    "regional_stats": {
      "Africa": {
        "count": 54,
        "total_gdp": 3000000000000,
        "avg_population": 30000000,
        "total_area": 30000000
      },
      ...
    },
    "global_gdp": 100000000000000,
    "global_population": 8000000000
  }
}
```

### 5. Model Info

```
GET /api/ml/model-info
```

Response:
```json
{
  "success": true,
  "data": {
    "version": "20231213_120000",
    "created_at": "2023-12-13T12:00:00.000Z",
    "models": ["clustering", "gdp_prediction"],
    "num_samples": 195,
    "best_gdp_model": "RandomForest"
  }
}
```

### 6. Retrain Models

```
POST /api/ml/retrain
```

Body:
```json
{
  "async": true  // true = background, false = wait for completion
}
```

Response:
```json
{
  "success": true,
  "message": "Retraining started in background",
  "status": "pending"
}
```

### 7. Health Check

```
GET /api/ml/health
```

Response:
```json
{
  "status": "ok",
  "service": "ML Country Analysis API",
  "models_loaded": true,
  "version": "20231213_120000"
}
```

## Cách Sử Dụng trong Frontend

### JavaScript/Vue Example

```javascript
// Lấy clusters
const response = await fetch('http://localhost:3001/api/ml/clusters');
const data = await response.json();

// Dự đoán GDP
const gdpResponse = await fetch('http://localhost:3001/api/ml/predict-gdp/USA');
const gdpData = await gdpResponse.json();

// Tìm quốc gia tương đồng
const similarResponse = await fetch('http://localhost:3001/api/ml/similar/USA?top_n=5');
const similarData = await similarResponse.json();
```

## File Structure

```
backend/
├── src/
│   ├── scripts/
│   │   ├── ml_analysis.py         # Data loading & analysis
│   │   ├── train_models.py        # Model training
│   │   ├── ml_server.py           # Flask API server
│   │   └── ...
│   ├── services/
│   │   ├── ml.service.js          # ML API service
│   │   └── ...
│   ├── routes/
│   │   ├── ml.route.js            # ML routes
│   │   ├── index.js               # Main routes (includes ml)
│   │   └── ...
│   └── ...
├── models/                         # Trained ML models (auto-created)
│   ├── latest/                     # Symlink to latest version
│   │   ├── clustering_model.pkl
│   │   ├── clustering_scaler.pkl
│   │   ├── gdp_prediction_model.pkl
│   │   ├── metadata.json
│   │   ├── config.json
│   │   └── metrics.json
│   └── ...
├── package.json                    # Node scripts: ml:train, ml:retrain, ml:server
├── requirements.txt                # Python dependencies
└── .env                            # Environment variables
```

## Troubleshooting

### 1. "Models not trained yet" Error

**Giải pháp:**
```bash
npm run ml:train
```

### 2. MongoDB Connection Error

**Kiểm tra:**
- `MONGO_URI` đúng và **bao gồm database name** (ví dụ: `/world-data?`)
- Database có sẵn dữ liệu countries collection
- Network connection tới MongoDB
- Nếu URI không có database name, hãy set `MONGO_DB_NAME` environment variable

### 3. Flask API Not Responding

**Kiểm tra:**
- Flask server đang chạy: `npm run ml:server`
- Port 5000 không bị chiếm
- `ML_API_URL` đúng trong `.env`

### 4. Models Loading Fails

**Giải pháp:**
```bash
# Xóa thư mục models cũ và retrain
rm -r models/
npm run ml:train
```

## Performance Tips

1. **Caching:** Models được load vào memory khi server start
2. **Background Retraining:** Sử dụng `async: true` để không block requests
3. **Feature Selection:** Chỉ sử dụng cần thiết features để giảm computation
4. **Batch Processing:** Nếu cần predict nhiều countries, request tuần tự

## Development Commands

```bash
# Training
npm run ml:train                    # Train models lần đầu
npm run ml:retrain                  # Retrain models

# Server
npm run ml:server                   # Start Flask ML API
npm run dev                         # Start Express backend
npm start                           # Start Express (production)

# Python direct commands
python src/scripts/train_models.py                    # Train
python src/scripts/train_models.py retrain           # Retrain
python src/scripts/ml_server.py                      # Flask server
```

## Next Steps

1. ✅ Tích hợp ML features vào Frontend components
2. ✅ Thêm caching layer cho frequent requests
3. ✅ Implement scheduled retraining (cron job)
4. ✅ Add metrics/monitoring dashboard
5. ✅ Performance optimization (model compression)

---

**Last Updated:** December 2024

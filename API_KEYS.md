# API Keys Quick Reference

This file contains a summary of all API keys needed for MumbAI Trails and where to get them.

---

## 🔑 API Keys Summary

| API | Required? | Cost | Where to Get | Used For |
|-----|-----------|------|--------------|----------|
| **Google Gemini** | Recommended | FREE | https://aistudio.google.com/app/apikey | AI Chatbot |
| **OpenWeatherMap** | Optional | FREE | https://openweathermap.org/api | Real-time weather |
| **Google Maps** | Optional | FREE ($200 credit) | https://console.cloud.google.com/google/maps-apis | Route optimization |
| **Mapbox** | Optional | FREE | https://account.mapbox.com/ | Beautiful maps |

---

## 🚀 Quick Setup

### 1. Google Gemini API (RECOMMENDED)

**Get it here**: https://aistudio.google.com/app/apikey

**Steps**:
1. Sign in with Google
2. Click "Create API Key"
3. Copy the key

**Add to**: `ai-models/.env`
```bash
GEMINI_API_KEY=your_key_here
```

---

### 2. OpenWeatherMap (Optional)

**Get it here**: https://openweathermap.org/api

**Steps**:
1. Sign up for free account
2. Go to API keys tab
3. Copy default key

**Add to**: `backend/.env`
```bash
WEATHER_MODE=api
WEATHER_API_KEY=your_key_here
```

---

### 3. Google Maps API (Optional)

**Get it here**: https://console.cloud.google.com/google/maps-apis

**Steps**:
1. Create/select project
2. Enable APIs: Directions, Distance Matrix, Places
3. Create API Key in Credentials

**Add to**: `backend/.env`
```bash
GOOGLE_MAPS_API_KEY=your_key_here
```

---

### 4. Mapbox (Optional)

**Get it here**: https://account.mapbox.com/

**Steps**:
1. Sign up for free
2. Copy default public token

**Add to**: `frontend/.env`
```bash
VITE_MAP_TILE_URL=https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=your_token_here
```

---

## ✅ What Works Without API Keys?

The application is designed to work even without most API keys:

- ✅ User registration & authentication
- ✅ Browse POIs
- ✅ Map view (using OpenStreetMap)
- ✅ Itinerary generation
- ✅ Save/Load itineraries
- ✅ Basic chatbot (without Gemini)
- ✅ Admin dashboard
- ✅ Mock weather data

**With API Keys, you get**:
- 🎯 Enhanced AI chatbot (Gemini)
- 🌤️ Real-time weather (OpenWeatherMap)
- 🗺️ Accurate routes (Google Maps)
- ✨ Beautiful maps (Mapbox)

---

## 📝 Environment Files Checklist

After obtaining your API keys, update these files:

### backend/.env
```bash
# Required
DATABASE_URL=postgresql://...
PORT=4000
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-secret-key

# Optional
WEATHER_API_KEY=
GOOGLE_MAPS_API_KEY=
```

### frontend/.env
```bash
# Required
VITE_API_BASE=http://localhost:4000/api
VITE_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png

# Optional
VITE_GOOGLE_MAPS_API_KEY=
```

### ai-models/.env
```bash
# Required
PORT=8001

# Recommended
GEMINI_API_KEY=
GEMINI_REQUESTS_PER_MINUTE=15
```

---

## 🔒 Security Tips

1. **Never commit** `.env` files to Git
2. **Use different keys** for development and production
3. **Set domain restrictions** on API keys in production
4. **Rotate keys** regularly
5. **Monitor usage** to detect suspicious activity

---

## 💡 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Gemini | 15 RPM |
| OpenWeatherMap | 60 calls/min, 1M/month |
| Google Maps | $200 credit/month |
| Mapbox | 50,000 loads/month |

These limits are more than sufficient for development and small-scale deployment.

---

**Need help?** See `SETUP_GUIDE.md` for detailed instructions.

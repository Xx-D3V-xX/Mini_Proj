# MumbAI Trails - Setup Credentials

**⚠️ IMPORTANT: Keep this file secure and DO NOT commit to Git!**

This file contains all the credentials and configuration details for your MumbAI Trails project.

---

## 📊 Database Credentials

### PostgreSQL Database
- **Database Name**: `mumbai_trails_db`
- **Username**: `mumbai_trails_user`
- **Password**: `MumbaiTrails2024Secure`
- **Host**: `localhost`
- **Port**: `5432`

### Connection String
```
postgresql://mumbai_trails_user:MumbaiTrails2024Secure@localhost:5432/mumbai_trails_db
```

---

## 🔐 Default User Accounts

### Administrator Account
- **Email**: `admin@local.test`
- **Password**: `Admin123!`
- **Role**: Admin
- **Access**: Full system access, POI management, analytics

### Regular User Account
- **Email**: `user@local.test`
- **Password**: `User123!`
- **Role**: User
- **Access**: Browse POIs, create itineraries, use chatbot

---

## 🔑 API Keys (To Be Configured)

### Google Gemini AI (Recommended)
- **Purpose**: AI-powered chatbot
- **Get Key**: https://aistudio.google.com/app/apikey
- **File**: `ai-models/.env`
- **Variable**: `GEMINI_API_KEY=`
- **Status**: ⚠️ NOT CONFIGURED - Add your key to enable AI chat

### OpenWeatherMap (Optional)
- **Purpose**: Real-time weather data
- **Get Key**: https://openweathermap.org/api
- **File**: `backend/.env`
- **Variable**: `WEATHER_API_KEY=`
- **Status**: ⚠️ NOT CONFIGURED - Using mock weather data

### Google Maps API (Optional)
- **Purpose**: Enhanced routing and navigation
- **Get Key**: https://console.cloud.google.com/google/maps-apis
- **File**: `backend/.env`
- **Variable**: `GOOGLE_MAPS_API_KEY=`
- **Status**: ⚠️ NOT CONFIGURED - Using fallback calculations

---

## 🌐 Service URLs

### Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Backend API Docs**: http://localhost:4000/docs
- **AI Models Service**: http://localhost:8001
- **AI Models Docs**: http://localhost:8001/docs

### Ports Configuration
- **Frontend**: 5173 (Vite)
- **Backend**: 4000 (NestJS)
- **AI Models**: 8001 (FastAPI)
- **PostgreSQL**: 5432

---

## ✅ Setup Status

- [x] Python 3.12 installed
- [x] Virtual environment created (ai-models/.venv)
- [x] Python packages installed
- [x] PostgreSQL database created
- [x] Database user created with permissions
- [x] Database migrations completed
- [x] Environment files created
- [ ] Google Gemini API key configured
- [ ] OpenWeatherMap API key configured (optional)
- [ ] Google Maps API key configured (optional)

---

## 🚀 Next Steps

1. **Add Gemini API Key** (Recommended):
   ```bash
   # Get key from: https://aistudio.google.com/app/apikey
   # Edit ai-models/.env and add:
   GEMINI_API_KEY=your_key_here
   ```

2. **Start the Application**:
   ```bash
   ./start-all.sh
   ```

3. **Access the Application**:
   - Open http://localhost:5173
   - Login with admin@local.test / Admin123!

4. **Test Features**:
   - Browse POIs
   - Generate itinerary
   - Try chatbot
   - Access admin dashboard at /admin

---

## 🔒 Security Notes

1. **Change these passwords in production!**
2. Never commit `.env` files to Git
3. Use strong, unique passwords for production
4. Rotate API keys regularly
5. Set API key restrictions (domain, IP) in production
6. Enable HTTPS in production
7. Use environment-specific credentials

---

## 📝 Environment Files

### backend/.env
✅ Created and configured with database credentials

### frontend/.env
✅ Created with default configuration

### ai-models/.env
✅ Created - needs GEMINI_API_KEY

---

**Last Updated**: November 13, 2024

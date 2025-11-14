# MumbAI Trails - Complete Setup Guide

This guide will walk you through setting up the MumbAI Trails project from scratch, including all API key configurations and environment setup.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [API Keys Configuration](#api-keys-configuration)
5. [Database Setup](#database-setup)
6. [Running the Application](#running-the-application)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`

2. **Python** (v3.11 or higher)
   - Download from: https://www.python.org/
   - Verify installation: `python3 --version`

3. **PostgreSQL** (v14 or higher)
   - **macOS**: `brew install postgresql@14`
   - **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
   - **Windows**: Download from https://www.postgresql.org/download/windows/
   - Verify installation: `psql --version`

4. **Package Manager** (choose one)
   - npm (comes with Node.js)
   - pnpm: `npm install -g pnpm`
   - yarn: `npm install -g yarn`

### Optional Tools

- **Git**: For cloning the repository
- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Python

---

## 🚀 Quick Start

For experienced developers who want to get started quickly:

```bash
# 1. Clone and navigate to project
git clone <your-repo-url> mumbai-trails
cd mumbai-trails

# 2. Install dependencies
cd backend && npm install && cd ../frontend && npm install && cd ../ai-models && pip install -r requirements.txt && cd ..

# 3. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-models/.env.example ai-models/.env

# 4. Configure PostgreSQL (see Database Setup section)

# 5. Run database migrations
cd backend && npm run gen && npm run migrate && npm run seed && cd ..

# 6. Start all services
./start-all.sh  # macOS/Linux
# OR
./start-all.ps1  # Windows PowerShell

# 7. Open http://localhost:5173
```

---

## 📦 Detailed Setup

### Step 1: Clone the Repository

```bash
git clone <your-repo-url> mumbai-trails
cd mumbai-trails
```

### Step 2: Install Dependencies

#### Backend (Node.js/NestJS)
```bash
cd backend
npm install
# OR
pnpm install
# OR
yarn install
```

#### Frontend (React/Vite)
```bash
cd ../frontend
npm install
# OR
pnpm install
# OR
yarn install
```

#### AI Models (Python/FastAPI)

**Important**: If you have Python 3.14, you may encounter compatibility issues. Use Python 3.11-3.13 instead.

**Option A - Using Python 3.12 (Recommended)**:
```bash
cd ../ai-models

# Install Python 3.12 if needed
brew install python@3.12  # macOS

# Create virtual environment with Python 3.12
python3.12 -m venv .venv
source .venv/bin/activate  # macOS/Linux
# OR
.venv\Scripts\activate  # Windows

# Install requirements
pip install -r requirements.txt
```

**Option B - Install packages individually (if requirements.txt fails)**:
```bash
cd ai-models
source .venv/bin/activate  # If using venv

# Install packages one by one
pip install fastapi uvicorn python-dotenv requests
pip install pydantic>=2.10.0 pydantic-settings
pip install numpy pandas scikit-learn nltk sentence-transformers
pip install google-generativeai
```

**Option C - Using conda (most reliable)**:
```bash
conda create -n mumbai-trails python=3.12 -y
conda activate mumbai-trails
cd ai-models
pip install -r requirements.txt
```

### Step 3: Environment Configuration

Create `.env` files by copying from examples:

```bash
# From project root
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-models/.env.example ai-models/.env
```

---

## 🔑 API Keys Configuration

### Required API Keys

#### 1. Google Gemini API (Recommended for AI Chat)

**What it does**: Powers the intelligent chatbot for natural language travel queries.

**How to get it** (FREE):
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

**Where to add it**:
```bash
# ai-models/.env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Cost**: FREE tier includes 15 requests per minute, which is sufficient for development.

---

### Optional API Keys (for Enhanced Features)

#### 2. OpenWeatherMap API (for Real Weather Data)

**What it does**: Provides real-time weather information for travel planning.

**How to get it** (FREE):
1. Go to: https://openweathermap.org/api
2. Sign up for a free account
3. Navigate to "API keys" tab
4. Copy your default API key (or create a new one)

**Where to add it**:
```bash
# backend/.env
WEATHER_MODE=api  # Change from 'mock' to 'api'
WEATHER_API_KEY=your_openweather_api_key_here
```

**Cost**: FREE tier includes 60 calls/minute, 1,000,000 calls/month.

---

#### 3. Google Maps API (for Enhanced Routing)

**What it does**: Provides accurate route calculations, travel times, and directions.

**How to get it**:
1. Go to: https://console.cloud.google.com/google/maps-apis
2. Create a new project or select existing one
3. Enable these APIs:
   - Directions API
   - Distance Matrix API
   - Places API (optional)
   - Maps JavaScript API (optional)
4. Go to "Credentials" → "Create Credentials" → "API Key"
5. Copy the API key

**Where to add it**:
```bash
# backend/.env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# frontend/.env (optional, for map display)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

**Cost**: $200 free credit monthly (sufficient for development and small-scale use).

**Note**: The application will work without this key using fallback calculations.

---

#### 4. Mapbox API (Alternative to OpenStreetMap)

**What it does**: Provides beautiful, customizable maps.

**How to get it** (FREE):
1. Go to: https://account.mapbox.com/
2. Sign up for free account
3. Copy your default public token

**Where to add it**:
```bash
# frontend/.env
VITE_MAP_TILE_URL=https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=YOUR_MAPBOX_TOKEN
```

**Cost**: FREE tier includes 50,000 map loads/month.

---

## 🗄️ Database Setup

### Step 1: Install PostgreSQL

**macOS**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows**:
- Download installer from https://www.postgresql.org/download/windows/
- Run installer and follow setup wizard
- Remember the password you set for the postgres user

### Step 2: Create Database

**macOS/Linux**:
```bash
# Access PostgreSQL
sudo -u postgres psql

# Or if using your user account
psql postgres
```

**Windows**:
- Open "SQL Shell (psql)" from Start menu

**Run these SQL commands**:
```sql
-- Create database
CREATE DATABASE mumbai_trails;

-- (Optional) Create dedicated user
CREATE USER mumbai_user WITH PASSWORD 'mumbai_pass';
GRANT ALL PRIVILEGES ON DATABASE mumbai_trails TO mumbai_user;

-- Exit
\q
```

### Step 3: Configure Database URL

Edit `backend/.env`:

```bash
# Database credentials for this project:
# Database: mumbai_trails_db
# User: mumbai_trails_user
# Password: MumbaiTrails2024Secure

DATABASE_URL=postgresql://mumbai_trails_user:MumbaiTrails2024Secure@localhost:5432/mumbai_trails_db
```

**These credentials have been set up for you. The .env file is already configured.**

### Step 4: Run Migrations

```bash
cd backend

# Generate Prisma client
npm run gen

# Run database migrations
npm run migrate

# Seed database with sample POI data
npm run seed
```

**Expected output**:
```
✓ Generated Prisma Client
✓ Database migrations completed
✓ Seeded 50+ POIs successfully
```

---

## 🏃 Running the Application

### Option 1: Start All Services at Once (Recommended)

**macOS/Linux**:
```bash
./start-all.sh
```

**Windows PowerShell**:
```powershell
./start-all.ps1
```

This will start:
- Backend API: http://localhost:4000
- Frontend: http://localhost:5173
- AI Models: http://localhost:8001

### Option 2: Start Services Individually

#### Terminal 1 - AI Models Service
```bash
cd ai-models
python -m uvicorn app.main:app --port 8001
```

#### Terminal 2 - Backend API
```bash
cd backend
npm run start
# OR for development with auto-reload
npm run start:dev
```

#### Terminal 3 - Frontend
```bash
cd frontend
npm run dev
```

### Verify Services are Running

1. **Frontend**: Open http://localhost:5173
2. **Backend API Docs**: Open http://localhost:4000/docs
3. **AI Health Check**: Open http://localhost:8001/health

---

## 🧪 Testing

### Default Test Accounts

The application comes with pre-seeded test accounts:

**Regular User**:
- Email: `user@local.test`
- Password: `User123!`

**Administrator**:
- Email: `admin@local.test`
- Password: `Admin123!`

### Testing Features

1. **User Registration & Login**
   - Go to http://localhost:5173
   - Click "Sign In" → "Sign Up"
   - Create a new account

2. **Explore POIs**
   - Click "Explore" in navigation
   - Filter by category, price, rating
   - View POIs on map

3. **Generate Itinerary**
   - Select your mood on landing page
   - Click "Get Suggestions"
   - Add POIs to your plan
   - Click "Generate Itinerary"
   - Save and export as PDF

4. **Chatbot**
   - Click "Chat" in navigation
   - Ask: "Suggest family-friendly places in Mumbai"
   - Try: "Plan a romantic evening itinerary"

5. **Admin Dashboard** (login as admin)
   - Go to http://localhost:5173/admin
   - Add/Edit/Delete POIs
   - View analytics
   - Import CSV data

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Error**: `Port 4000/5173/8001 is already in use`

**Solution**:
```bash
# Find process using the port (macOS/Linux)
lsof -ti:4000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:8001 | xargs kill -9

# Windows PowerShell
Stop-Process -Id (Get-NetTCPConnection -LocalPort 4000).OwningProcess -Force
```

Or change ports in `.env` files.

#### 2. Database Connection Failed

**Error**: `Can't reach database server`

**Solutions**:
```bash
# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Ubuntu
sudo systemctl status postgresql

# Start PostgreSQL if not running
# macOS
brew services start postgresql@14

# Ubuntu
sudo systemctl start postgresql
```

Verify `DATABASE_URL` in `backend/.env` is correct.

#### 3. Prisma Migration Errors

**Error**: `Migration engine error`

**Solution**:
```bash
cd backend

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or delete migrations folder and recreate
rm -rf prisma/migrations
npm run gen
npm run migrate
npm run seed
```

#### 4. AI Models Download Issues

**Error**: `Failed to download sentence-transformers model`

**Solution**:
```bash
cd ai-models

# Pre-download model manually
python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
```

Or use VPN if download is blocked in your region.

#### 5. Python 3.14 Compatibility Issues

**Error**: `error: the configured Python interpreter version (3.14) is newer than PyO3's maximum supported version (3.13)`

**Solution**:
```bash
# Option 1: Install Python 3.12
brew install python@3.12
cd ai-models

# Remove old venv if exists
rm -rf .venv

# Create new venv with Python 3.12
python3.12 -m venv .venv
source .venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

**Option 2: Install packages individually**:
```bash
cd ai-models
source .venv/bin/activate

# Install one by one
pip install fastapi uvicorn python-dotenv requests
pip install pydantic>=2.10.0 pydantic-settings
pip install numpy pandas scikit-learn nltk sentence-transformers
pip install google-generativeai
```

#### 6. CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
Verify `CORS_ORIGIN` in `backend/.env` matches your frontend URL:
```bash
CORS_ORIGIN=http://localhost:5173
```

#### 6. Gemini API Rate Limit

**Error**: `429 Too Many Requests`

**Solution**:
Reduce request rate in `ai-models/.env`:
```bash
GEMINI_REQUESTS_PER_MINUTE=10  # Reduce from 15
```

---

## 📚 Additional Resources

### API Documentation
- Backend API: http://localhost:4000/docs (Swagger UI)
- AI Models API: http://localhost:8001/docs

### Useful Commands

```bash
# Backend
npm run start:dev    # Start with hot-reload
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Check code style

# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
npm run gen          # Generate Prisma client
npm run migrate      # Run migrations
npm run seed         # Seed database
npx prisma studio    # Open database GUI
```

---

## 🎯 Next Steps

After successful setup:

1. ✅ Test all features manually
2. ✅ Add your own POIs via Admin dashboard
3. ✅ Customize recommendation weights in `ai-models/.env`
4. ✅ Deploy to production (see deployment guide)
5. ✅ Set up monitoring and logging

---

## 📞 Support

If you encounter issues not covered in this guide:

1. Check existing GitHub issues
2. Review the `TROUBLESHOOTING.md` file
3. Check service logs:
   - Backend: `backend/logs/`
   - AI Models: Console output

---

## 🔒 Security Notes

**Important for Production**:

1. Change all secret keys in `.env` files
2. Use strong PostgreSQL passwords
3. Enable HTTPS
4. Restrict API key usage (set domain restrictions)
5. Use environment variables, never commit `.env` files
6. Enable rate limiting
7. Regular security updates

---

**Last Updated**: November 2024
**Version**: 1.0.0

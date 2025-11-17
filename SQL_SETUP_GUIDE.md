# SQL Database Setup Guide

## Free SQL Database Options

### Option 1: Railway (Recommended - Easiest)
- **PostgreSQL** - Free tier: 512MB RAM, 1GB storage
- **Auto-deploys** from GitHub
- **Free for 1 month**, then $5/month (or use free credits)

### Option 2: Render
- **PostgreSQL** - Free tier: 90 days, then $7/month
- **Free web services** for backend API

### Option 3: Supabase (PostgreSQL)
- **Free tier**: 500MB database, 1GB storage
- **Full PostgreSQL** access
- **Free forever** for small projects

### Option 4: PlanetScale (MySQL)
- **Free tier**: 1 database, 1GB storage
- **MySQL** compatible
- **Free forever**

### Option 5: Local Development (SQLite)
- **SQLite** - File-based, no server needed
- **Perfect for development**
- **Can migrate to PostgreSQL later**

## Recommended Setup: PostgreSQL + Express.js Backend

We'll create:
1. **Backend API** (Express.js + PostgreSQL)
2. **Frontend** (React - your current app)
3. **Database** (PostgreSQL on Railway/Supabase)

## Database Schema

```sql
-- Patients table
CREATE TABLE patients (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  age INTEGER NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  diagnosis TEXT NOT NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('Active', 'Recovered', 'Inactive')),
  notes TEXT DEFAULT '',
  photo_url TEXT,
  xray_url TEXT,
  medical_file_url TEXT,
  parents JSONB,
  emergency_contact JSONB,
  surgeries JSONB,
  files JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('doctor', 'admin', 'user')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_patients_code ON patients(code);
CREATE INDEX idx_patients_admission_date ON patients(admission_date);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_users_email ON users(email);
```

## Quick Start with Railway (Free)

1. **Sign up**: https://railway.app (use GitHub)
2. **Create PostgreSQL**: New → Database → PostgreSQL
3. **Copy connection string**: Click on database → Connect → Copy connection string
4. **Run SQL schema**: Use Railway's SQL editor or pgAdmin
5. **Deploy backend**: We'll create the backend API next

## Deployment Plan

### Backend (Node.js/Express)
- **Railway** or **Render** (free tier)
- Handles all database operations
- REST API endpoints

### Frontend (React)
- **Vercel** or **Netlify** (free forever)
- Calls backend API
- Static hosting

### Database (PostgreSQL)
- **Railway** or **Supabase** (free tier)
- Stores all data
- SQL queries

## Cost: $0/month (Free tier)

All services have generous free tiers for small projects!


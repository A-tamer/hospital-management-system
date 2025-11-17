# Migration from Firebase to Supabase - Complete Guide

## Why Supabase?

✅ **100% Free Tier** - 500MB database, 1GB storage, 50K monthly users
✅ **PostgreSQL Database** - More powerful than Firestore
✅ **Real-time Subscriptions** - Same as Firebase
✅ **File Storage** - Built-in storage bucket
✅ **Easy Migration** - Similar API to Firebase
✅ **Self-hostable** - Can run on your own server if needed

## Step 1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (free)
4. Click "New Project"
5. Fill in:
   - **Name**: hospital-management-system
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
6. Click "Create new project"
7. Wait 2-3 minutes for setup

## Step 2: Get Supabase Credentials

1. In your Supabase project, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (keep secret!)

## Step 3: Create Database Tables

Go to **SQL Editor** in Supabase and run:

```sql
-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL,
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female', 'Other')),
  diagnosis TEXT NOT NULL,
  admission_date DATE NOT NULL,
  discharge_date DATE,
  status TEXT NOT NULL CHECK (status IN ('Active', 'Recovered', 'Inactive')),
  notes TEXT DEFAULT '',
  photo_url TEXT,
  xray_url TEXT,
  medical_file_url TEXT,
  parents JSONB,
  emergency_contact JSONB,
  surgeries JSONB,
  files JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (for future use)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'admin', 'user')),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_patients_code ON patients(code);
CREATE INDEX idx_patients_admission_date ON patients(admission_date);
CREATE INDEX idx_patients_status ON patients(status);

-- Enable Row Level Security (RLS)
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now - you can restrict later)
CREATE POLICY "Allow all operations on patients" ON patients
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);
```

## Step 4: Set Up Storage Bucket

1. Go to **Storage** in Supabase
2. Click **New bucket**
3. Name: `patient-files`
4. Make it **Public** (or private with policies)
5. Click **Create bucket**

## Step 5: Install Supabase Client

The code has been updated to use Supabase. Just install:

```bash
npm install @supabase/supabase-js
```

## Step 6: Update Environment Variables

Create `.env` file in project root:

```env
REACT_APP_SUPABASE_URL=your-project-url
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

## Step 7: Deploy Frontend (Free Options)

### Option A: Vercel (Recommended - Easiest)
1. Push code to GitHub
2. Go to https://vercel.com
3. Import your GitHub repo
4. Add environment variables
5. Deploy (takes 2 minutes)
6. **Free forever** for personal projects

### Option B: Netlify
1. Push code to GitHub
2. Go to https://netlify.com
3. Import repo
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variables
7. **Free tier available**

### Option C: GitHub Pages (Static only)
1. Install: `npm install --save-dev gh-pages`
2. Add to package.json scripts:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d build"
   ```
3. Run: `npm run deploy`

## Migration Checklist

- [ ] Create Supabase account
- [ ] Create database tables
- [ ] Set up storage bucket
- [ ] Install @supabase/supabase-js
- [ ] Update .env file
- [ ] Test locally
- [ ] Deploy to Vercel/Netlify
- [ ] Update environment variables in hosting platform
- [ ] Test deployed app

## Cost Comparison

| Feature | Firebase | Supabase Free |
|---------|----------|---------------|
| Database | 1GB free | 500MB free |
| Storage | 5GB free | 1GB free |
| Bandwidth | 10GB/month | 5GB/month |
| Users | Unlimited | 50K/month |
| **Total Cost** | **$0** (limited) | **$0** (generous) |

## Next Steps After Migration

1. **Add Authentication** - Supabase Auth (free)
2. **Add Email Notifications** - Supabase Edge Functions
3. **Backup Strategy** - Supabase daily backups (free tier)
4. **Monitoring** - Supabase dashboard

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- GitHub: https://github.com/supabase/supabase


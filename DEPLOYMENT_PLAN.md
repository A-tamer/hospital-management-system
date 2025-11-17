# Complete Deployment Plan - Hospital Management System

## Architecture Overview

```
┌─────────────────┐
│   React App     │  (Frontend - Vercel/Netlify)
│   (Port 3000)   │
└────────┬────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│  Express API    │  (Backend - Railway/Render)
│   (Port 3001)   │
└────────┬────────┘
         │ SQL Queries
         ▼
┌─────────────────┐
│  PostgreSQL     │  (Database - Railway/Supabase)
│   Database      │
└─────────────────┘
```

## Step-by-Step Deployment

### Phase 1: Database Setup (5 minutes)

#### Option A: Railway (Easiest)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on database → "Connect" → Copy connection string
5. Go to "Data" tab → Run SQL schema from `SQL_SETUP_GUIDE.md`

#### Option B: Supabase (Free Forever)
1. Go to https://supabase.com
2. Create project
3. Go to SQL Editor
4. Run schema from `SQL_SETUP_GUIDE.md`
5. Copy connection string from Settings → Database

### Phase 2: Backend Deployment (10 minutes)

#### Using Railway:
1. In Railway dashboard, click "New" → "GitHub Repo"
2. Select your repository
3. Select `backend` folder as root
4. Add environment variable: `DATABASE_URL` (from Phase 1)
5. Deploy!
6. Copy the public URL (e.g., `https://your-app.railway.app`)

#### Using Render:
1. Go to https://render.com
2. "New" → "Web Service"
3. Connect GitHub repo
4. Root Directory: `backend`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variable: `DATABASE_URL`
8. Deploy!

### Phase 3: Frontend Deployment (5 minutes)

#### Using Vercel (Recommended):
1. Go to https://vercel.com
2. "Import Project" → Select GitHub repo
3. Root Directory: Leave empty (or `./`)
4. Build Command: `npm run build`
5. Output Directory: `build`
6. Add Environment Variable:
   - `REACT_APP_API_URL` = Your backend URL (from Phase 2)
7. Deploy!

#### Using Netlify:
1. Go to https://netlify.com
2. "Add new site" → "Import from Git"
3. Select repo
4. Build command: `npm run build`
5. Publish directory: `build`
6. Add environment variable: `REACT_APP_API_URL`
7. Deploy!

### Phase 4: Update Frontend Config

Update `.env` or environment variables:
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Free Tier Limits

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| **Railway** | $5 credit/month | $5-10/month |
| **Render** | 90 days free | $7/month |
| **Supabase** | 500MB DB, 1GB storage | Free forever |
| **Vercel** | Unlimited | Free forever |
| **Netlify** | 100GB bandwidth | Free forever |

**Total Cost: $0/month** (if using Supabase + Vercel/Netlify)

## Quick Start Commands

### Local Development:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev

# Terminal 2: Frontend
npm install
npm start
```

### Production Deployment:

1. **Database**: Set up PostgreSQL (Railway/Supabase)
2. **Backend**: Deploy to Railway/Render
3. **Frontend**: Deploy to Vercel/Netlify
4. **Update**: Set `REACT_APP_API_URL` in frontend

## Environment Variables

### Backend (.env):
```env
DATABASE_URL=postgresql://user:pass@host:port/db
PORT=3001
```

### Frontend (.env):
```env
REACT_APP_API_URL=https://your-backend.railway.app/api
```

## Testing Deployment

1. ✅ Check backend health: `https://your-backend.railway.app/api/health`
2. ✅ Check database connection in backend logs
3. ✅ Test frontend: `https://your-app.vercel.app`
4. ✅ Try creating a patient
5. ✅ Check database for new records

## Troubleshooting

### CORS Errors:
- Backend should have `cors()` middleware (already added)
- Check backend allows your frontend domain

### Database Connection:
- Verify `DATABASE_URL` is correct
- Check database is running
- Test connection in backend logs

### File Uploads:
- Backend serves files from `/uploads` directory
- Make sure uploads folder exists
- Check file permissions

## Security Notes

For production:
1. Add authentication to API
2. Use environment variables (never commit secrets)
3. Enable HTTPS (automatic on Vercel/Netlify)
4. Add rate limiting to API
5. Validate all inputs

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs


# Hospital Management System - Backend API

Express.js backend with PostgreSQL database.

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database connection string
```

3. **Create database tables:**
Run the SQL schema from `SQL_SETUP_GUIDE.md` in your PostgreSQL database.

4. **Start server:**
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `POST /api/upload` - Upload file (multipart/form-data)
- `GET /api/users` - Get all users
- `GET /api/health` - Health check

## Database Setup

See `SQL_SETUP_GUIDE.md` for database schema and setup instructions.

## Deployment

### Railway (Recommended)
1. Connect GitHub repo
2. Add PostgreSQL service
3. Set DATABASE_URL environment variable
4. Deploy!

### Render
1. Create PostgreSQL database
2. Create Web Service
3. Connect GitHub repo
4. Set DATABASE_URL
5. Deploy!


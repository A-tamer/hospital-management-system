const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err);
  } else {
    console.log('✅ Database connected:', res.rows[0].now);
  }
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const patientCode = req.body.patientCode || 'temp';
    const folder = req.body.folder || 'files';
    const dir = path.join(uploadsDir, patientCode, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ==================== PATIENT ROUTES ====================

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        code,
        full_name as "fullName",
        age,
        gender,
        diagnosis,
        admission_date as "admissionDate",
        discharge_date as "dischargeDate",
        status,
        notes,
        photo_url as "photoUrl",
        xray_url as "xrayUrl",
        medical_file_url as "medicalFileUrl",
        parents,
        emergency_contact as "emergencyContact",
        surgeries,
        files,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patients
      ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

// Get single patient
app.get('/api/patients/:id', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        code,
        full_name as "fullName",
        age,
        gender,
        diagnosis,
        admission_date as "admissionDate",
        discharge_date as "dischargeDate",
        status,
        notes,
        photo_url as "photoUrl",
        xray_url as "xrayUrl",
        medical_file_url as "medicalFileUrl",
        parents,
        emergency_contact as "emergencyContact",
        surgeries,
        files,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patients
      WHERE id = $1
    `, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

// Create patient
app.post('/api/patients', async (req, res) => {
  try {
    const {
      code, fullName, age, gender, diagnosis,
      admissionDate, dischargeDate, status, notes,
      photoUrl, xrayUrl, medicalFileUrl,
      parents, emergencyContact, surgeries
    } = req.body;

    const result = await pool.query(`
      INSERT INTO patients (
        code, full_name, age, gender, diagnosis,
        admission_date, discharge_date, status, notes,
        photo_url, xray_url, medical_file_url,
        parents, emergency_contact, surgeries
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, code, full_name as "fullName", age, gender, diagnosis,
        admission_date as "admissionDate", discharge_date as "dischargeDate",
        status, notes, photo_url as "photoUrl", xray_url as "xrayUrl",
        medical_file_url as "medicalFileUrl", parents, emergency_contact as "emergencyContact",
        surgeries, files, created_at as "createdAt", updated_at as "updatedAt"
    `, [
      code, fullName, age, gender, diagnosis,
      admissionDate || null, dischargeDate || null, status, notes || '',
      photoUrl || null, xrayUrl || null, medicalFileUrl || null,
      parents ? JSON.stringify(parents) : null,
      emergencyContact ? JSON.stringify(emergencyContact) : null,
      surgeries ? JSON.stringify(surgeries) : null
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Failed to create patient', details: error.message });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  try {
    const {
      code, fullName, age, gender, diagnosis,
      admissionDate, dischargeDate, status, notes,
      photoUrl, xrayUrl, medicalFileUrl,
      parents, emergencyContact, surgeries
    } = req.body;

    const result = await pool.query(`
      UPDATE patients SET
        code = $1,
        full_name = $2,
        age = $3,
        gender = $4,
        diagnosis = $5,
        admission_date = $6,
        discharge_date = $7,
        status = $8,
        notes = $9,
        photo_url = $10,
        xray_url = $11,
        medical_file_url = $12,
        parents = $13,
        emergency_contact = $14,
        surgeries = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING id, code, full_name as "fullName", age, gender, diagnosis,
        admission_date as "admissionDate", discharge_date as "dischargeDate",
        status, notes, photo_url as "photoUrl", xray_url as "xrayUrl",
        medical_file_url as "medicalFileUrl", parents, emergency_contact as "emergencyContact",
        surgeries, files, created_at as "createdAt", updated_at as "updatedAt"
    `, [
      code, fullName, age, gender, diagnosis,
      admissionDate || null, dischargeDate || null, status, notes || '',
      photoUrl || null, xrayUrl || null, medicalFileUrl || null,
      parents ? JSON.stringify(parents) : null,
      emergencyContact ? JSON.stringify(emergencyContact) : null,
      surgeries ? JSON.stringify(surgeries) : null,
      req.params.id
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Failed to update patient', details: error.message });
  }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM patients WHERE id = $1 RETURNING id', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

// ==================== FILE UPLOAD ROUTE ====================

app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.body.patientCode}/${req.body.folder}/${req.file.filename}`;
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, role, name, created_at, updated_at FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hospital Management API is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/health`);
});


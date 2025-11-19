// Import/Export Utilities for Patient Data
import { Patient } from '../types';
import { FirebaseService } from '../services/firebaseService';
import * as XLSX from 'xlsx';

/**
 * Generate patient code in format: YYYY/MM/XXXX
 * Example: 2024/11/0001
 */
export function generatePatientCode(patients: Patient[] = []): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Get all patients from current year/month
  const currentMonthPatients = patients.filter(p => {
    const patientDate = new Date(p.visitedDate || (p as any).admissionDate || p.createdAt);
    return patientDate.getFullYear() === year && 
           (patientDate.getMonth() + 1) === parseInt(month);
  });
  
  // Get the highest serial number for this month
  const serialNumbers = currentMonthPatients
    .map(p => {
      const parts = p.code.split('/');
      if (parts.length === 3 && parts[0] === year.toString() && parts[1] === month) {
        return parseInt(parts[2]) || 0;
      }
      return 0;
    })
    .filter(n => n > 0);
  
  const nextSerial = serialNumbers.length > 0 
    ? Math.max(...serialNumbers) + 1 
    : 1;
  
  return `${year}/${month}/${String(nextSerial).padStart(4, '0')}`;
}

/**
 * Export all database data for migration
 */
export async function exportDatabase(): Promise<{
  patients: Patient[];
  users: any[];
  exportDate: string;
  version: string;
}> {
  try {
    const patients = await FirebaseService.getPatients();
    const users = await FirebaseService.getUsers();
    
    return {
      patients,
      users,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
  } catch (error) {
    console.error('Error exporting database:', error);
    throw error;
  }
}

/**
 * Download database as JSON file
 */
export function downloadDatabaseAsJSON(data: any, filename: string = 'hospital-database-export.json'): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse Excel/CSV file and convert to Patient objects
 */
export function parseExcelFile(file: File): Promise<Patient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileName = file.name.toLowerCase();
    const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
    
    reader.onload = (e) => {
      try {
        let rows: any[][] = [];
        
        if (isExcel) {
          // Parse Excel file
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' }) as any[][];
        } else {
          // Parse CSV file
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          rows = lines.map(line => {
            // Handle CSV with quoted values
            const values: string[] = [];
            let current = '';
            let inQuotes = false;
            
            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
              } else {
                current += char;
              }
            }
            values.push(current.trim());
            return values;
          });
        }
        
        if (rows.length < 2) {
          reject(new Error('File must contain at least a header row and one data row'));
          return;
        }
        
        // Parse header (first row)
        const headers = rows[0].map((h: any) => String(h).trim().toLowerCase());
        
        // Find column indices (flexible matching)
        const nameIndex = headers.findIndex(h => {
          const hLower = String(h).toLowerCase();
          return (hLower.includes('name') && (hLower.includes('arabic') || hLower.includes('ar'))) ||
                 hLower.includes('الاسم') || hLower === 'name';
        });
        const ageIndex = headers.findIndex(h => 
          String(h).toLowerCase().includes('age') || String(h).toLowerCase().includes('العمر')
        );
        const genderIndex = headers.findIndex(h => 
          String(h).toLowerCase().includes('gender') || String(h).toLowerCase().includes('الجنس')
        );
        const diagnosisIndex = headers.findIndex(h => 
          String(h).toLowerCase().includes('diagnosis') || String(h).toLowerCase().includes('التشخيص')
        );
        const dateIndex = headers.findIndex(h => {
          const hLower = String(h).toLowerCase();
          return hLower.includes('date') || hLower.includes('visited') || 
                 hLower.includes('admission') || hLower.includes('التاريخ');
        });
        const statusIndex = headers.findIndex(h => 
          String(h).toLowerCase().includes('status') || String(h).toLowerCase().includes('الحالة')
        );
        const notesIndex = headers.findIndex(h => 
          String(h).toLowerCase().includes('note') || String(h).toLowerCase().includes('ملاحظ')
        );
        
        if (nameIndex === -1) {
          reject(new Error('Name (Arabic) column not found. Please ensure your file has a column for Arabic name. Expected column names: "Name", "Name (Arabic)", "الاسم", or similar.'));
          return;
        }
        
        // Parse data rows
        const patients: Patient[] = [];
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;
          
          const fullNameArabic = String(row[nameIndex] || '').trim();
          if (!fullNameArabic) continue; // Skip rows without name
          
          const age = parseInt(String(row[ageIndex] || '0')) || 0;
          const genderStr = String(row[genderIndex] || 'Male').trim();
          let gender: 'Male' | 'Female' | 'Other' = 'Male';
          if (genderStr.toLowerCase().includes('female') || genderStr.includes('أنثى') || genderStr.includes('انثى')) {
            gender = 'Female';
          } else if (genderStr.toLowerCase().includes('other') || genderStr.includes('أخرى')) {
            gender = 'Other';
          }
          
          const diagnosis = String(row[diagnosisIndex] || '').trim();
          let dateStr = String(row[dateIndex] || '').trim();
          
          // Handle Excel date format (serial number)
          if (dateStr && !isNaN(Number(dateStr)) && Number(dateStr) > 25569) {
            // Excel date serial number (days since 1900-01-01)
            const excelDate = new Date((Number(dateStr) - 25569) * 86400 * 1000);
            dateStr = excelDate.toISOString().split('T')[0];
          } else if (!dateStr || dateStr === '') {
            dateStr = new Date().toISOString().split('T')[0];
          }
          
          const statusStr = String(row[statusIndex] || 'Diagnosed').trim();
          let status: 'Diagnosed' | 'Pre-op' | 'Post-op' = 'Diagnosed';
          if (statusStr.toLowerCase().includes('pre') || statusStr.includes('قبل')) {
            status = 'Pre-op';
          } else if (statusStr.toLowerCase().includes('post') || statusStr.includes('بعد')) {
            status = 'Post-op';
          }
          
          const notes = String(row[notesIndex] || '').trim();
          
          // Generate code for this patient
          const serial = String(patients.length + 1).padStart(4, '0');
          const code = `${year}/${month}/${serial}`;
          
          const patient: Patient = {
            id: '', // Will be generated by Firebase
            code,
            fullNameArabic,
            age,
            gender,
            diagnosis,
            status,
            visitedDate: dateStr,
            notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          patients.push(patient);
        }
        
        if (patients.length === 0) {
          reject(new Error('No valid patient data found in file. Please check that your file has data rows with at least a name column.'));
          return;
        }
        
        resolve(patients);
      } catch (error: any) {
        reject(new Error(`Failed to parse file: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

/**
 * Parse JSON file (exported database format)
 */
export function parseJSONFile(file: File): Promise<Patient[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const data = JSON.parse(text);
        
        // Handle exported database format
        if (data.patients && Array.isArray(data.patients)) {
          const patients: Patient[] = data.patients.map((p: any) => {
            // Convert old format to new format
            const patient: Patient = {
              id: '', // Will be regenerated by Firebase
              code: p.code || generatePatientCode([]),
              fullNameArabic: p.fullNameArabic || p.fullName || 'Unknown',
              fullName: p.fullName, // Keep for backward compatibility
              age: p.age || 0,
              gender: p.gender || 'Male',
              diagnosis: p.diagnosis || '',
              diagnosisCategory: p.diagnosisCategory || '',
              status: (p.status === 'Active' ? 'Diagnosed' : p.status) || 'Diagnosed',
              visitedDate: p.visitedDate || p.admissionDate || new Date().toISOString().split('T')[0],
              notes: p.notes || '',
              contactInfo: p.contactInfo,
              files: p.files,
              surgeries: p.surgeries,
              followUps: p.followUps,
              createdAt: p.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            return patient;
          });
          resolve(patients);
        } else if (Array.isArray(data)) {
          // Handle direct array format
          const patients: Patient[] = data.map((p: any) => ({
            id: '',
            code: p.code || generatePatientCode([]),
            fullNameArabic: p.fullNameArabic || p.fullName || 'Unknown',
            fullName: p.fullName,
            age: p.age || 0,
            gender: p.gender || 'Male',
            diagnosis: p.diagnosis || '',
            diagnosisCategory: p.diagnosisCategory || '',
            status: (p.status === 'Active' ? 'Diagnosed' : p.status) || 'Diagnosed',
            visitedDate: p.visitedDate || p.admissionDate || new Date().toISOString().split('T')[0],
            notes: p.notes || '',
            contactInfo: p.contactInfo,
            files: p.files,
            surgeries: p.surgeries,
            followUps: p.followUps,
            createdAt: p.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
          resolve(patients);
        } else {
          reject(new Error('Invalid JSON format. Expected object with "patients" array or direct array.'));
        }
      } catch (error: any) {
        reject(new Error(`Failed to parse JSON: ${error.message}`));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Import patients from file
 */
export async function importPatients(patients: Patient[]): Promise<{ success: number; errors: string[] }> {
  const errors: string[] = [];
  let success = 0;
  
  for (const patient of patients) {
    try {
      // Remove id to let Firebase generate a new one
      const { id, ...patientWithoutId } = patient;
      await FirebaseService.addPatient(patientWithoutId);
      success++;
    } catch (error: any) {
      errors.push(`Failed to import ${patient.code || patient.fullNameArabic}: ${error.message}`);
    }
  }
  
  return { success, errors };
}


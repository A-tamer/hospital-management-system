export interface EmergencyContact {
  name: string;
  relation: string;
  phone: string;
}

export interface ParentsInfo {
  fatherName?: string;
  fatherPhone?: string;
  motherName?: string;
  motherPhone?: string;
}

export interface SurgeryRecord {
  date: string; // ISO date string
  type: string;
  surgeon?: string;
  notes?: string;
}

export interface MedicalFile {
  name: string;
  url: string;
  type: 'xray' | 'report' | 'other';
}

export interface Patient {
  id: string;
  code: string;
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string;
  admissionDate: string;
  dischargeDate?: string;
  status: 'Active' | 'Recovered' | 'Inactive';
  notes: string;
  createdAt: string;
  updatedAt: string;

  // New optional fields
  photoUrl?: string;
  parents?: ParentsInfo;
  emergencyContact?: EmergencyContact;
  surgeries?: SurgeryRecord[];
  xrayUrl?: string; // quick link for a primary x-ray
  medicalFileUrl?: string; // quick link for a primary medical file
  files?: MedicalFile[]; // additional attached files
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'doctor' | 'admin' | 'user'; // Keep for backward compatibility, but we use 'doctor' now
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  recoveredPatients: number;
  inactivePatients: number;
  patientsByDiagnosis: { [key: string]: number };
  monthlyAdmissions: { [key: string]: number };
}

export interface FilterOptions {
  search: string;
  diagnosis: string;
  status: string;
  year: string;
  month?: string; // '01'..'12'
  sortBy: 'name' | 'date' | 'status';
  sortOrder: 'asc' | 'desc';
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}


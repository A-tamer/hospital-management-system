export interface ContactInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  relation?: string;
}

export interface Surgeon {
  name: string;
  specialization?: string;
  phone?: string;
}

export interface SurgeryRecord {
  id?: string;
  date: string; // ISO date string
  type: string;
  operation?: string; // Operation performed
  surgeons: Surgeon[]; // Multiple surgeons
  notes?: string;
  cost?: number;
  costCurrency?: string;
}

export interface FollowUp {
  id?: string;
  number: number;
  date: string;
  notes: string;
  photos?: string[]; // Array of photo URLs
}

export interface PlannedSurgery {
  id?: string;
  operationCategory?: string;
  operation?: string;
  estimatedCost?: number;
  costCurrency?: string;
}

export interface PatientFiles {
  personalImage?: string;
  surgeryImage?: string;
  radiology?: string[];
  lab?: string[];
}

export interface DiagnosisHierarchy {
  category: string;
  subcategories?: string[];
}

export interface Patient {
  id: string;
  code: string;
  fullNameArabic: string; // Arabic name (required)
  fullName?: string; // English name (optional, for backward compatibility)
  age: number;
  weight?: number; // Weight in kg
  gender: 'Male' | 'Female' | 'Other';
  diagnosis: string; // Primary diagnosis (kept for backward compatibility)
  diagnoses?: string[]; // Multiple diagnoses support
  diagnosisCategory?: string; // For hierarchy (primary)
  diagnosisCategories?: string[]; // Multiple categories
  visitedDate: string; // Changed from admissionDate
  status: 'Diagnosed' | 'Pre-op' | 'Op' | 'Post-op'; // Updated status with Op
  notes: string;
  createdAt: string;
  updatedAt: string;

  // Contact information (replaces parents/emergency)
  contactInfo?: ContactInfo;
  
  // Multiple surgeries
  surgeries?: SurgeryRecord[];
  
  // Planned surgery
  plannedSurgery?: PlannedSurgery;
  
  // Multiple follow-ups
  followUps?: FollowUp[];
  
  // Reorganized files
  files?: PatientFiles;
  
  // Referring doctor
  referringDoctor?: string;
  
  // Clinic branch
  clinicBranch?: 'Cairo Clinic' | 'Mansoura Clinic';
  
  // Present at clinic (for check-in/check-out)
  presentAtClinic?: boolean;
  clinicCheckInTime?: string; // ISO timestamp
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'doctor' | 'user';
  name: string;
  canViewFinancial?: boolean; // Admin controls this
  createdAt?: string;
  updatedAt?: string;
}

// User without password (for storing in state/localStorage)
export type SafeUser = Omit<User, 'password'>;

export interface DashboardStats {
  totalPatients: number;
  diagnosedPatients: number;
  preOpPatients: number;
  opPatients: number;
  postOpPatients: number;
  patientsByDiagnosis: { [key: string]: number };
  monthlyVisits: { [key: string]: number };
}

export interface FilterOptions {
  search: string;
  diagnosis: string;
  status: string;
  year: string;
  month?: string;
  presentOnly?: boolean; // Show only patients present at clinic
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

// Diagnosis hierarchy structure
export const DIAGNOSIS_HIERARCHY: DiagnosisHierarchy[] = [
  {
    category: 'Cardiology',
    subcategories: ['Heart Disease', 'Arrhythmia', 'Hypertension', 'Heart Failure']
  },
  {
    category: 'Orthopedics',
    subcategories: ['Fracture', 'Arthritis', 'Joint Replacement', 'Spine Surgery']
  },
  {
    category: 'General Surgery',
    subcategories: ['Appendectomy', 'Cholecystectomy', 'Hernia Repair', 'Laparoscopy']
  },
  {
    category: 'Neurology',
    subcategories: ['Brain Tumor', 'Stroke', 'Epilepsy', 'Headache']
  },
  {
    category: 'Oncology',
    subcategories: ['Cancer Treatment', 'Chemotherapy', 'Radiation', 'Surgery']
  },
  {
    category: 'Pediatrics',
    subcategories: ['Child Illness', 'Vaccination', 'Development', 'Emergency']
  },
  {
    category: 'Other',
    subcategories: []
  }
];

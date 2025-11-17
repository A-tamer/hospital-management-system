import { Patient, User } from '../types';

export const samplePatients: Patient[] = [
  {
    id: '1',
    code: 'P20240001',
    fullName: 'John Smith',
    age: 45,
    gender: 'Male',
    diagnosis: 'Hypertension',
    admissionDate: '2024-01-15',
    dischargeDate: '2024-01-18',
    status: 'Recovered',
    notes: 'Patient responded well to treatment. Blood pressure normalized.',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-18T14:30:00Z',
  },
  {
    id: '2',
    code: 'P20240002',
    fullName: 'Sarah Johnson',
    age: 32,
    gender: 'Female',
    diagnosis: 'Diabetes Type 2',
    admissionDate: '2024-01-20',
    status: 'Active',
    notes: 'Requires ongoing monitoring and medication adjustment.',
    createdAt: '2024-01-20T09:15:00Z',
    updatedAt: '2024-01-20T09:15:00Z',
  },
  {
    id: '3',
    code: 'P20240003',
    fullName: 'Michael Brown',
    age: 67,
    gender: 'Male',
    diagnosis: 'Pneumonia',
    admissionDate: '2024-01-25',
    dischargeDate: '2024-02-02',
    status: 'Recovered',
    notes: 'Complete recovery after antibiotic treatment.',
    createdAt: '2024-01-25T16:45:00Z',
    updatedAt: '2024-02-02T11:20:00Z',
  },
  {
    id: '4',
    code: 'P20240004',
    fullName: 'Emily Davis',
    age: 28,
    gender: 'Female',
    diagnosis: 'Migraine',
    admissionDate: '2024-02-01',
    status: 'Active',
    notes: 'Chronic condition requiring pain management.',
    createdAt: '2024-02-01T08:30:00Z',
    updatedAt: '2024-02-01T08:30:00Z',
  },
  {
    id: '5',
    code: 'P20240005',
    fullName: 'Robert Wilson',
    age: 55,
    gender: 'Male',
    diagnosis: 'Heart Disease',
    admissionDate: '2024-02-05',
    status: 'Active',
    notes: 'Post-surgical monitoring required.',
    createdAt: '2024-02-05T12:00:00Z',
    updatedAt: '2024-02-05T12:00:00Z',
  },
  {
    id: '6',
    code: 'P20240006',
    fullName: 'Lisa Anderson',
    age: 41,
    gender: 'Female',
    diagnosis: 'Asthma',
    admissionDate: '2024-02-10',
    dischargeDate: '2024-02-12',
    status: 'Recovered',
    notes: 'Acute episode resolved with bronchodilator treatment.',
    createdAt: '2024-02-10T14:15:00Z',
    updatedAt: '2024-02-12T10:45:00Z',
  },
  {
    id: '7',
    code: 'P20240007',
    fullName: 'David Miller',
    age: 38,
    gender: 'Male',
    diagnosis: 'Hypertension',
    admissionDate: '2024-02-15',
    status: 'Active',
    notes: 'Newly diagnosed, starting medication regimen.',
    createdAt: '2024-02-15T11:30:00Z',
    updatedAt: '2024-02-15T11:30:00Z',
  },
  {
    id: '8',
    code: 'P20240008',
    fullName: 'Jennifer Taylor',
    age: 29,
    gender: 'Female',
    diagnosis: 'Anxiety Disorder',
    admissionDate: '2024-02-18',
    status: 'Active',
    notes: 'Requires psychological counseling and medication.',
    createdAt: '2024-02-18T13:20:00Z',
    updatedAt: '2024-02-18T13:20:00Z',
  },
  {
    id: '9',
    code: 'P20240009',
    fullName: 'William Garcia',
    age: 62,
    gender: 'Male',
    diagnosis: 'Arthritis',
    admissionDate: '2024-02-20',
    dischargeDate: '2024-02-22',
    status: 'Recovered',
    notes: 'Pain management successful, discharged with physiotherapy plan.',
    createdAt: '2024-02-20T09:45:00Z',
    updatedAt: '2024-02-22T16:10:00Z',
  },
  {
    id: '10',
    code: 'P20240010',
    fullName: 'Amanda Martinez',
    age: 35,
    gender: 'Female',
    diagnosis: 'Diabetes Type 1',
    admissionDate: '2024-02-25',
    status: 'Active',
    notes: 'Insulin-dependent, requires regular monitoring.',
    createdAt: '2024-02-25T15:30:00Z',
    updatedAt: '2024-02-25T15:30:00Z',
  },
];

export const sampleUsers: User[] = [
  {
    id: '1',
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
  },
  {
    id: '2',
    email: 'doctor@hospital.com',
    password: 'doctor123',
    role: 'user',
    name: 'Dr. Sarah Williams',
  },
  {
    id: '3',
    email: 'nurse@hospital.com',
    password: 'nurse123',
    role: 'user',
    name: 'Nurse Jennifer Lee',
  },
];

export const initializeSampleData = () => {
  // Check if data already exists
  const existingPatients = localStorage.getItem('patients');
  const existingUsers = localStorage.getItem('users');
  
  if (!existingPatients || JSON.parse(existingPatients).length === 0) {
    localStorage.setItem('patients', JSON.stringify(samplePatients));
  }
  
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    localStorage.setItem('users', JSON.stringify(sampleUsers));
  }
};


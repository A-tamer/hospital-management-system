import { Patient, User } from '../types';

// Comprehensive dummy data with ALL features for testing
export const samplePatients: Patient[] = [
  {
    id: '1',
    code: 'P20250001',
    fullName: 'Ahmed Al-Mansouri',
    fullNameArabic: 'أحمد المنصوري',
    age: 45,
    gender: 'Male',
    diagnosis: 'Cardiology - Heart Disease',
    diagnosisCategory: 'Cardiology',
    visitedDate: '2025-01-15',
    status: 'Post-op',
    notes: 'Patient underwent successful heart surgery. Recovery progressing well. Regular follow-ups scheduled.',
    createdAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
    contactInfo: {
      name: 'Fatima Al-Mansouri',
      phone: '+966501234567',
      email: 'fatima.almansouri@email.com',
      address: '123 King Fahd Road, Riyadh, Saudi Arabia',
      relation: 'Wife'
    },
    surgeries: [
      {
        id: 's1',
        date: '2025-01-18',
        type: 'Coronary Artery Bypass Graft',
        surgeons: [
          {
            name: 'Dr. Mohammed Al-Rashid',
            specialization: 'Cardiac Surgery',
            phone: '+966501111111'
          },
          {
            name: 'Dr. Sarah Al-Zahra',
            specialization: 'Cardiac Anesthesiology',
            phone: '+966502222222'
          }
        ],
        notes: 'Successful triple bypass surgery. Patient stable post-operation.',
        cost: 150000,
        costCurrency: 'SAR'
      }
    ],
    followUps: [
      {
        id: 'f1',
        number: 1,
        date: '2025-01-25',
        notes: 'First follow-up: Patient recovering well. Wound healing properly. Blood pressure stable.'
      },
      {
        id: 'f2',
        number: 2,
        date: '2025-02-05',
        notes: 'Second follow-up: Excellent progress. Patient can resume light activities. Medication adjusted.'
      },
      {
        id: 'f3',
        number: 3,
        date: '2025-02-20',
        notes: 'Third follow-up: Full recovery expected. Continue medication as prescribed.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      surgeryImage: 'https://via.placeholder.com/800x600?text=Surgery+Image',
      radiology: [
        'https://via.placeholder.com/800x600?text=X-Ray+1',
        'https://via.placeholder.com/800x600?text=CT+Scan',
        'https://via.placeholder.com/800x600?text=MRI+Scan'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Lab+Report+1',
        'https://via.placeholder.com/800x1100?text=Blood+Test+Results'
      ]
    }
  },
  {
    id: '2',
    code: 'P20250002',
    fullName: 'Sara Al-Hashimi',
    fullNameArabic: 'سارة الهاشمي',
    age: 32,
    gender: 'Female',
    diagnosis: 'Orthopedics - Fracture',
    diagnosisCategory: 'Orthopedics',
    visitedDate: '2025-01-20',
    status: 'Pre-op',
    notes: 'Patient with compound fracture of right tibia. Surgery scheduled for next week.',
    createdAt: '2025-01-20T09:15:00Z',
    updatedAt: '2025-01-22T11:30:00Z',
    contactInfo: {
      name: 'Khalid Al-Hashimi',
      phone: '+966507654321',
      email: 'khalid.hashimi@email.com',
      address: '456 Prince Sultan Street, Jeddah, Saudi Arabia',
      relation: 'Brother'
    },
    surgeries: [
      {
        id: 's2',
        date: '2025-01-28',
        type: 'Open Reduction Internal Fixation (ORIF)',
        surgeons: [
          {
            name: 'Dr. Abdullah Al-Mutairi',
            specialization: 'Orthopedic Surgery',
            phone: '+966503333333'
          }
        ],
        notes: 'Scheduled surgery for fracture repair using titanium plate and screws.',
        cost: 45000,
        costCurrency: 'SAR'
      }
    ],
    followUps: [
      {
        id: 'f4',
        number: 1,
        date: '2025-01-22',
        notes: 'Pre-op consultation: Patient prepared for surgery. All pre-operative tests completed.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=X-Ray+Fracture',
        'https://via.placeholder.com/800x600?text=Pre-Op+X-Ray'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Pre-Op+Lab+Report'
      ]
    }
  },
  {
    id: '3',
    code: 'P20250003',
    fullName: 'Mohammed Al-Otaibi',
    fullNameArabic: 'محمد العتيبي',
    age: 28,
    gender: 'Male',
    diagnosis: 'General Surgery - Appendectomy',
    diagnosisCategory: 'General Surgery',
    visitedDate: '2025-01-25',
    status: 'Post-op',
    notes: 'Emergency appendectomy performed. Patient recovered successfully and discharged.',
    createdAt: '2025-01-25T16:45:00Z',
    updatedAt: '2025-01-27T10:20:00Z',
    contactInfo: {
      name: 'Noura Al-Otaibi',
      phone: '+966509876543',
      email: 'noura.otaibi@email.com',
      address: '789 Al-Malaz District, Riyadh, Saudi Arabia',
      relation: 'Mother'
    },
    surgeries: [
      {
        id: 's3',
        date: '2025-01-25',
        type: 'Laparoscopic Appendectomy',
        surgeons: [
          {
            name: 'Dr. Fahad Al-Saud',
            specialization: 'General Surgery',
            phone: '+966504444444'
          },
          {
            name: 'Dr. Lina Al-Fahad',
            specialization: 'General Surgery',
            phone: '+966505555555'
          }
        ],
        notes: 'Emergency laparoscopic appendectomy. Procedure completed successfully with minimal complications.',
        cost: 25000,
        costCurrency: 'SAR'
      }
    ],
    followUps: [
      {
        id: 'f5',
        number: 1,
        date: '2025-01-27',
        notes: 'Post-op check: Wound healing well. Patient can resume normal activities. No complications.'
      },
      {
        id: 'f6',
        number: 2,
        date: '2025-02-05',
        notes: 'Follow-up: Complete recovery. Patient doing well. No further follow-up needed.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      surgeryImage: 'https://via.placeholder.com/800x600?text=Laparoscopic+Image',
      radiology: [
        'https://via.placeholder.com/800x600?text=CT+Scan+Abdomen'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Blood+Work+Results'
      ]
    }
  },
  {
    id: '4',
    code: 'P20250004',
    fullName: 'Fatima Al-Zahra',
    fullNameArabic: 'فاطمة الزهراء',
    age: 55,
    gender: 'Female',
    diagnosis: 'Neurology - Brain Tumor',
    diagnosisCategory: 'Neurology',
    visitedDate: '2025-02-01',
    status: 'Diagnosed',
    notes: 'Patient diagnosed with benign brain tumor. Treatment plan being developed. Multiple consultations scheduled.',
    createdAt: '2025-02-01T08:30:00Z',
    updatedAt: '2025-02-03T15:45:00Z',
    contactInfo: {
      name: 'Hassan Al-Zahra',
      phone: '+966506666666',
      email: 'hassan.zahra@email.com',
      address: '321 Al-Olaya Street, Riyadh, Saudi Arabia',
      relation: 'Husband'
    },
    surgeries: [],
    followUps: [
      {
        id: 'f7',
        number: 1,
        date: '2025-02-03',
        notes: 'Initial consultation: Discussed treatment options. Patient and family informed about procedure risks and benefits.'
      },
      {
        id: 'f8',
        number: 2,
        date: '2025-02-10',
        notes: 'Second opinion consultation: Confirmed diagnosis. Treatment plan finalized.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=MRI+Brain',
        'https://via.placeholder.com/800x600?text=CT+Brain',
        'https://via.placeholder.com/800x600?text=Contrast+MRI'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Neurological+Tests',
        'https://via.placeholder.com/800x1100?text=Blood+Panel'
      ]
    }
  },
  {
    id: '5',
    code: 'P20250005',
    fullName: 'Omar Al-Shammari',
    fullNameArabic: 'عمر الشمري',
    age: 38,
    gender: 'Male',
    diagnosis: 'Oncology - Cancer Treatment',
    diagnosisCategory: 'Oncology',
    visitedDate: '2025-02-05',
    status: 'Pre-op',
    notes: 'Patient diagnosed with early-stage cancer. Chemotherapy completed. Surgery scheduled for tumor removal.',
    createdAt: '2025-02-05T12:00:00Z',
    updatedAt: '2025-02-08T09:15:00Z',
    contactInfo: {
      name: 'Layla Al-Shammari',
      phone: '+966507777777',
      email: 'layla.shammari@email.com',
      address: '654 Al-Nakheel District, Dammam, Saudi Arabia',
      relation: 'Wife'
    },
    surgeries: [
      {
        id: 's4',
        date: '2025-02-15',
        type: 'Tumor Resection Surgery',
        surgeons: [
          {
            name: 'Dr. Majed Al-Ghamdi',
            specialization: 'Surgical Oncology',
            phone: '+966508888888'
          },
          {
            name: 'Dr. Reem Al-Mutawa',
            specialization: 'Medical Oncology',
            phone: '+966509999999'
          }
        ],
        notes: 'Scheduled tumor resection following successful chemotherapy. Pre-operative assessment completed.',
        cost: 200000,
        costCurrency: 'SAR'
      }
    ],
    followUps: [
      {
        id: 'f9',
        number: 1,
        date: '2025-02-08',
        notes: 'Pre-op assessment: Patient cleared for surgery. All pre-operative tests normal.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=CT+Scan+Tumor',
        'https://via.placeholder.com/800x600?text=PET+Scan',
        'https://via.placeholder.com/800x600?text=Post-Chemo+Scan'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Oncology+Report',
        'https://via.placeholder.com/800x1100?text=Biopsy+Results',
        'https://via.placeholder.com/800x1100?text=Blood+Markers'
      ]
    }
  },
  {
    id: '6',
    code: 'P20250006',
    fullName: 'Noura Al-Mutairi',
    fullNameArabic: 'نورة المطيري',
    age: 12,
    gender: 'Female',
    diagnosis: 'Pediatrics - Child Illness',
    diagnosisCategory: 'Pediatrics',
    visitedDate: '2025-02-10',
    status: 'Diagnosed',
    notes: 'Young patient with respiratory infection. Responding well to treatment. Parents advised on home care.',
    createdAt: '2025-02-10T14:15:00Z',
    updatedAt: '2025-02-12T10:45:00Z',
    contactInfo: {
      name: 'Khalid Al-Mutairi',
      phone: '+966501112233',
      email: 'khalid.mutairi@email.com',
      address: '987 Al-Yasmin District, Riyadh, Saudi Arabia',
      relation: 'Father'
    },
    surgeries: [],
    followUps: [
      {
        id: 'f10',
        number: 1,
        date: '2025-02-12',
        notes: 'Follow-up: Patient improving. Fever reduced. Continue medication for 3 more days.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=Chest+X-Ray'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Blood+Test',
        'https://via.placeholder.com/800x1100?text=Culture+Results'
      ]
    }
  },
  {
    id: '7',
    code: 'P20250007',
    fullName: 'Yusuf Al-Dosari',
    fullNameArabic: 'يوسف الدوسري',
    age: 60,
    gender: 'Male',
    diagnosis: 'Cardiology - Heart Failure',
    diagnosisCategory: 'Cardiology',
    visitedDate: '2025-02-15',
    status: 'Diagnosed',
    notes: 'Patient with chronic heart failure. Medication adjusted. Lifestyle modifications recommended.',
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-02-18T16:20:00Z',
    contactInfo: {
      name: 'Amina Al-Dosari',
      phone: '+966502223344',
      email: 'amina.dosari@email.com',
      address: '147 Al-Malqa District, Riyadh, Saudi Arabia',
      relation: 'Wife'
    },
    surgeries: [],
    followUps: [
      {
        id: 'f11',
        number: 1,
        date: '2025-02-18',
        notes: 'Follow-up: Medication working well. Patient feeling better. Continue current treatment plan.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/400x400?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=Echocardiogram',
        'https://via.placeholder.com/800x600?text=ECG'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Cardiac+Markers',
        'https://via.placeholder.com/800x1100?text=Blood+Panel'
      ]
    }
  },
  {
    id: '8',
    code: 'P20250008',
    fullName: 'Mariam Al-Ghamdi',
    fullNameArabic: 'مريم الغامدي',
    age: 35,
    gender: 'Female',
    diagnosis: 'Orthopedics - Joint Replacement',
    diagnosisCategory: 'Orthopedics',
    visitedDate: '2025-02-18',
    status: 'Pre-op',
    notes: 'Patient scheduled for hip replacement surgery. Pre-operative assessment completed.',
    createdAt: '2025-02-18T13:20:00Z',
    updatedAt: '2025-02-20T10:30:00Z',
    contactInfo: {
      name: 'Faisal Al-Ghamdi',
      phone: '+966503334455',
      email: 'faisal.ghamdi@email.com',
      address: '258 Al-Wurud District, Jeddah, Saudi Arabia',
      relation: 'Husband'
    },
    surgeries: [
      {
        id: 's5',
        date: '2025-02-25',
        type: 'Total Hip Replacement',
        surgeons: [
          {
            name: 'Dr. Turki Al-Harbi',
            specialization: 'Orthopedic Surgery',
            phone: '+966501010101'
          }
        ],
        notes: 'Scheduled total hip replacement using ceramic-on-ceramic implant.',
        cost: 75000,
        costCurrency: 'SAR'
      }
    ],
    followUps: [
      {
        id: 'f12',
        number: 1,
        date: '2025-02-20',
        notes: 'Pre-op consultation: Patient prepared. Physical therapy plan discussed.'
      }
    ],
    files: {
      personalImage: 'https://via.placeholder.com/000000/FFFFFF?text=Patient+Photo',
      radiology: [
        'https://via.placeholder.com/800x600?text=Hip+X-Ray',
        'https://via.placeholder.com/800x600?text=MRI+Hip'
      ],
      lab: [
        'https://via.placeholder.com/800x1100?text=Pre-Op+Lab+Report'
      ]
    }
  }
];

// Users with credentials for testing
export const sampleUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@surgicare.com',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    canViewFinancial: true, // Admin always has access
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'doctor-1',
    email: 'doctor@surgicare.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Ahmed Wafa',
    canViewFinancial: true, // Doctor has financial access
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'doctor-2',
    email: 'doctor2@surgicare.com',
    password: 'doctor123',
    role: 'doctor',
    name: 'Dr. Sarah Al-Zahra',
    canViewFinancial: false, // This doctor doesn't have financial access
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-1',
    email: 'user@surgicare.com',
    password: 'user123',
    role: 'user',
    name: 'Nurse Fatima',
    canViewFinancial: false, // Regular user no financial access
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    email: 'user2@surgicare.com',
    password: 'user123',
    role: 'user',
    name: 'Nurse Layla',
    canViewFinancial: true, // This user has financial access (granted by admin)
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

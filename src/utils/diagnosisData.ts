// Diagnosis hierarchy data
export interface DiagnosisCategory {
  category: string;
  subcategories: string[];
}

export const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  {
    category: 'Cardiology',
    subcategories: [
      'Heart Disease',
      'Arrhythmia',
      'Hypertension',
      'Heart Failure',
      'Coronary Artery Disease',
      'Valvular Heart Disease'
    ]
  },
  {
    category: 'Orthopedics',
    subcategories: [
      'Fracture',
      'Arthritis',
      'Joint Replacement',
      'Spine Surgery',
      'Sports Injury',
      'Bone Tumor'
    ]
  },
  {
    category: 'General Surgery',
    subcategories: [
      'Appendectomy',
      'Cholecystectomy',
      'Hernia Repair',
      'Laparoscopy',
      'Gastric Surgery',
      'Intestinal Surgery'
    ]
  },
  {
    category: 'Neurology',
    subcategories: [
      'Brain Tumor',
      'Stroke',
      'Epilepsy',
      'Headache',
      'Parkinson\'s Disease',
      'Multiple Sclerosis'
    ]
  },
  {
    category: 'Oncology',
    subcategories: [
      'Cancer Treatment',
      'Chemotherapy',
      'Radiation',
      'Surgery',
      'Immunotherapy',
      'Targeted Therapy'
    ]
  },
  {
    category: 'Pediatrics',
    subcategories: [
      'Child Illness',
      'Vaccination',
      'Development Issues',
      'Emergency Care',
      'Congenital Disorders',
      'Infectious Diseases'
    ]
  },
  {
    category: 'Other',
    subcategories: []
  }
];

export const getAllDiagnoses = (): string[] => {
  const diagnoses: string[] = [];
  DIAGNOSIS_CATEGORIES.forEach(category => {
    if (category.subcategories.length > 0) {
      category.subcategories.forEach(sub => {
        diagnoses.push(`${category.category} - ${sub}`);
      });
    } else {
      diagnoses.push(category.category);
    }
  });
  return diagnoses;
};


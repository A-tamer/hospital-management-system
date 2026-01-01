// Diagnosis hierarchy data
export interface DiagnosisCategory {
  category: string;
  subcategories: string[];
}

export const DIAGNOSIS_CATEGORIES: DiagnosisCategory[] = [
  {
    category: 'Thoracic Disorders',
    subcategories: [
      'CPAM (Right lung)',
      'CPAM (Left lung)',
      'Extra lobar Sequestration',
      'Intralobar Sequestration',
      'Congenital Lobar Over-inflation (Right lung)',
      'Congenital Lobar Over-inflation (Left lung)',
      'Bronchiectasis (Right lung)',
      'Bronchiectasis (Left lung)',
      'Empyema',
      'Spontaneous Pneumothorax',
      'Palmar and Plantar Hyperhidrosis',
      'Palmar, Plantar and Axillary Hyperhidrosis',
      'Recurrent Palmar and/ or Axillary Hyperhidrosis',
      'Mediastinal Mass (Under Investigations)',
      'Thymomas, thymic hyperplasia, Thymic cyst'
    ]
  },
  {
    category: 'Gastro-Esophageal Disorders',
    subcategories: [
      'GERD',
      'GERD with Esophageal Stricture',
      'Sliding Hiatus Hernia',
      'Paraesophageal Hiatus Hernia',
      'Mixed Hiatus Hernia',
      'Recurrent Hiatus Hernia',
      'Complications post GERD/Hiatal hernia Repair',
      'Esophageal atresia Gross type C',
      'Esophageal atresia (non type C)',
      'Tracheo-Esophageal H SHAPED FISTULA',
      'Congenital Esophageal Stenosis',
      'Esophageal Perforation (Iatrogenic, Post Corrosive, F.B)',
      'Esophageal Stricture (Anastomotic)',
      'Esophageal Stricture (Post Corrosive)',
      'Acquired Tracheo-Esophageal Fistula (TEF) (F.B/Battery Ingestion)',
      'Post Fundoplication complications (Wrap migration, Slipped wrap, recurrent GERD,Others)',
      'Achalasia of the Cardia'
    ]
  },
  {
    category: 'Stomach Disorders',
    subcategories: [
      'Infantile Hypertrophic Pyloric Stenosis (IHPS)',
      'Pyloric Atresia/ web',
      'Gastric Outlet Obstruction',
      'Gastric Bezoar',
      'Gastric Tumor',
      'Gastric Volvulus',
      'Gastric Duplication',
      'Leaking gastrostomy tube'
    ]
  },
  {
    category: 'Diaphragm Disorders',
    subcategories: [
      'CDH (Right: Bochdalek – Anterolateral)',
      'CDH (Left: Bochdalek – Anterolateral)',
      'CDH (Morgagni Hernia)',
      'CDH (Morgagni Larrey Hernia)',
      'Diaphragmatic Eventration(Right)',
      'Diaphragmatic Eventration(Left)',
      'Post traumatic diaphragmatic hernia'
    ]
  },
  {
    category: 'Duodenum and Intestine Disorders',
    subcategories: [
      'NIO (suspected Intestinal Atresia)',
      'NIO (suspected HD)',
      'Duodenal Atresia',
      'Partial Duodenal Obstruction',
      'Perforated Duodenal Ulcer',
      'Duodenal Obstruction (SMA Syndrome (Wilkie\'s Syndrome)',
      'Duodenal Duplication',
      'Intestinal Atresia',
      'Pneumoperitoneum (complicated intestinal atresia)',
      'Small Intestinal Duplication',
      'Adhesive Intestinal Obstruction',
      'Sigmoid Volvulus',
      'Peritonitis (anastomotic/ intestinal Leak)',
      'Retracted or Prolapsed Stoma',
      'Intestinal Malrotation',
      'Chronic Intestinal Pseudo Obstruction (CIPO)',
      'Midgut Volvulus on top of Intestinal Malrotation',
      'Short Bowel Syndrome',
      'Meconium Ileus',
      'Meconium Plug Syndrome',
      'Crohn\'s Disease',
      'Ulcerative Colitis',
      'Abdominal Cyst (Not yet Diagnosed)',
      'Ovarian Cyst',
      'Mesenteric Cyst',
      'Idiopathic Intussusception',
      'Secondary Intussusception',
      'Recurrent Intussusception',
      'Meckel Diverticulum (Diverticulitis , Lower GI Bleeding)',
      'Patent Vitello-intestinal Duct (Cyst , Sinus , Fistula)'
    ]
  },
  {
    category: 'Disorders of Colon, Rectum And anal canal',
    subcategories: [
      'Enterocolitis (suspected HAEC)',
      'Pneumoperitoneum (Suspected HD)',
      'Hirschsprung Disease (HD)',
      'Total Colonic Aganglionosis (TCA)',
      'Complications post HD surgery',
      'Hirschsprung\'s Associated Enterocolitis (HAEC)',
      'Idiopathic Constipation / Encopresis',
      'True Fecal Incontinence',
      'Small Left Colon Syndrome',
      'Necrotizing Enterocolitis (NEC)',
      'Complicated NEC (Pneumoperitoneum , Colonic Stricture)',
      'Colonic Or Rectal Duplication',
      'Perianal Fistula',
      'Perianal Abscess',
      'Pilonidal Sinus',
      'Anal Fissure',
      'Rectal Prolapse'
    ]
  },
  {
    category: 'Anorectal Atresia and Cloacal Malformations',
    subcategories: [
      'ARM: High Anomaly (⚦) (not yet specified)',
      'ARM: Recto- Urinary Fistula (not yet specified)',
      'ARM: Recto-Vestibular Fistula',
      'ARM: Recto-Perineal Fistula(Male)',
      'ARM: Recto-Perineal Fistula(Female)',
      'ARM: Recto-Vaginal Fistula',
      'ARM without Fistula',
      'Complications post ARM repair',
      'Persistent Cloaca',
      'Cloacal Exstrophy',
      'Covered Exstrophy',
      'Common Urogenital Sinus',
      'Currarino triad',
      'Vaginal Atresia',
      'Imperforate Hymen'
    ]
  },
  {
    category: 'Acute abdomen and Appendicitis',
    subcategories: [
      'Acute Abdomen (Not yet diagnosed)',
      'F.B impaction',
      'Acute intestinal obstruction',
      'Ovarian torsion (Right)',
      'Ovarian torsion (Left)',
      'Acute Appendicitis',
      'Acute Appendicitis (Perforated)',
      'Appendicular Mass',
      'Appendicular Abscess',
      'Elective Interval Appendectomy',
      'Abdominal /Pelvic Abscess post Appendectomy',
      'Stump Appendicitis',
      'Cecal Fistula Post Appendectomy'
    ]
  },
  {
    category: 'Abdominal Wall and hernias',
    subcategories: [
      'Exomphalos Major',
      'Exomphalos Minor',
      'Gastroschisis',
      'Umbilical Discharge (not yet specified)',
      'Umbilical granuloma or polyp',
      'Umbilical hernia',
      'Epigastric Hernia',
      'Supra umbilical hernia',
      'Fatty hernia of Linea alba',
      'Inguinal Hernia (Left)',
      'Inguinal Hernia(Right)',
      'Inguinal Hernia(Direct)',
      'Inguinal Hernia (Bilateral)',
      'Inguinal hernia (Recurrent)',
      'Incisional hernia',
      'Hydrocele(Right)',
      'Hydrocele(Left)',
      'Hydrocele (Bilateral)',
      'Hydrocele of the canal of nuck',
      'Hydrocele (Recurrent)',
      'Abdomino-scrotal hydrocele',
      'Hydrocele post Herniotomy or Varicocelectomy',
      'Encysted hydrocele of the cord',
      'Varicocele (Right)',
      'Varicocele (left)',
      'Varicocele (Bilateral)',
      'Varicocele (Recurrent)',
      'Femoral Hernia'
    ]
  },
  {
    category: 'Disorders of Sex Differentiation',
    subcategories: [
      'Neonatal DSD (Not Yet Investigated)',
      '46-XX DSD (final diagnosis not yet confirmed)',
      '46-XX DSD: Congenital Adrenal Hyperplasia (CAH)',
      '46-XY DSD (final diagnosis not yet confirmed)',
      '46-XY DSD: 5α-Reductase deficiency',
      '46-XY DSD: Complete Androgen Insensitivity (Testicular Feminization Syndrome)',
      '46-XY DSD: Partial Androgen Insensitivity',
      'Turner\'s Syndrome',
      'Klinefelter\'s Syndrome',
      'Primary amenorrhea'
    ]
  },
  {
    category: 'Pediatric Oncology',
    subcategories: [
      'Wilms tumor',
      'Renal cell carcinoma',
      'Other Renal Tumors',
      'Neuroblastoma/ Ganglioneuroma',
      'Hepatocellular Adenoma',
      'Hepatoblastoma',
      'Hepatocellular Carcinoma',
      'Other tumors of the liver',
      'Teratoma (Ovarian)',
      'Teratoma (Testicular)',
      'Sacrococcygeal Teratoma',
      'Teratoma (other)',
      'Dermoid Cyst (Ovarian)',
      'Epidermoid Cyst',
      'Abdominal Wall Tumor / Desmoid Tumor',
      'Neurofibroma',
      'Lymphoma (Hodgkin)',
      'Lymphoma (Non-Hodgkin)',
      'Intestinal Lymphoma',
      'Rhabdomyosarcoma',
      'Sarcoma botryoides',
      'Testicular Tumor (Under Investigations)',
      'Ovarian tumors (Under Investigations)',
      'Gastrointestinal Stromal Tumor (GIST)'
    ]
  },
  {
    category: 'Head and Neck',
    subcategories: [
      'Recurrent Thyroglossal Cyst or fistula',
      'Midline Neck Cystic Swelling (not yet specified)',
      'Dermoid Cyst',
      'Cervical Lymphangioma (Cystic Hygroma)',
      'Cervical Teratoma',
      'Median Cervical Cleft',
      'Sialadenitis',
      'Sialolithiasis',
      'Salivary Gland Neoplasm (not yet specified)',
      'Submandibular Duct stone',
      'Submandibular Sialadenitis',
      'Submandibular Gland Swelling',
      'Parotid haemangioma',
      'Parotid Lymphangioma',
      'Pleomorphic Adenoma',
      'Parotitis',
      'Torticollis',
      'Hyperparathyroidism',
      'Parathyroid swelling'
    ]
  },
  {
    category: 'Urinary tract',
    subcategories: [
      'Simple Renal Cyst',
      'Polycystic Kidney',
      'Congenital Hydronephrosis (under Investigation)',
      'Uretero-Pelvic Junction Obstruction (UPJO)',
      'Duplex System',
      'Ectopic Ureter',
      'Ureterocele',
      'Congenital Megaureter (Refluxing / Obstructed / Non)',
      'Urolithiasis',
      'Vesico-Ureteric Reflux (VUR)',
      'Patent Urachus',
      'Urachal Cyst / Sinus',
      'Mega-meatus Intact Prepuce (MIP)',
      'Urethral Fistula post Hypospadias Repair',
      'Complicated Hypospadias Repair',
      'Failed Hypospadias Repair',
      'Female Hypospadias (♀)',
      'Isolated Epispadias (Glanular, Penile , Penopubic)',
      'Urethral Fistula post Epispadias Repair',
      'Failed Epispadias Repair',
      'Uncircumcised Boy',
      'Uncircumcised (Deficient Hypospadiac Prepuce)',
      'Overzealous circumcision',
      'Buried penis',
      'Webbed Penis / Penoscrotal Fusion',
      'Complications post Circumcision',
      'Smegma (inclusion) Cyst',
      'Phimosis or Paraphimosis',
      'Penile Curvature without Hypospadias',
      'Penile Twist',
      'Congenital Urethral Diverticulum or Fistula',
      'Hair Coil Tourniquet Syndrome',
      'Undescended testis (Bilateral Palpable)',
      'Undescended testis (Bilateral Non- Palpable)',
      'Secondary Testicular Ascent post Herniotomy',
      'Recurrent Undescended testis',
      'Ascending Testis',
      'Ectopic Testis'
    ]
  },
  {
    category: 'Liver, Pancreas & Biliary tract',
    subcategories: [
      'Biliary Dyskinesia',
      'Gallbladder (Perforation, Pyocele / Mucocele)',
      'Post-Cholecystectomy Complications',
      'Obstructive Jaundice (Biliary Stricture)',
      'Obstructive Jaundice (Calculary)',
      'Complications post Choledochal Cyst Excision',
      'Ruptured Choledochal Cyst',
      'Acute Pancreatitis',
      'Chronic Pancreatitis',
      'Pseudo pancreatic Cyst',
      'Splenic Cyst',
      'Splenic mass',
      'Hepatic Cyst',
      'Hydatid Cyst',
      'Infantile Hepatic Hemangioma',
      'Portal Vein Cavernoma'
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

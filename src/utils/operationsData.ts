// Operations hierarchy data - Based on Pediatric Surgery System
export interface OperationCategory {
  category: string;
  subcategories: string[];
}

export const OPERATION_CATEGORIES: OperationCategory[] = [
  {
    category: 'Abdominal Wall and Hernia Operations',
    subcategories: [
      'Open Right inguinal herniotomy',
      'Open Left inguinal herniotomy',
      'Open Bilateral inguinal herniotomy',
      'Laparoscopic Right Inguinal Hernia Repair',
      'Laparoscopic Left Inguinal Hernia Repair',
      'Laparoscopic Bilateral Inguinal Hernia repair',
      'Laparoscopic Recurrent Inguinal Hernia repair',
      'Mesh Repair of hernia',
      'Umbilical Hernia Anatomical Repair',
      'Anatomical repair of ventral hernia',
      'Primary Repair of Exomphalos',
      'Primary Repair of Gastroschisis',
      'Staged Repair of Gastroschisis (Silo)',
      'Laparoscopic varicocelectomy',
      'Open varicocelectomy'
    ]
  },
  {
    category: 'Hypospadias and Penile Operations',
    subcategories: [
      'Meatal Advancement',
      'Meatotomy / meatoplasty',
      'MAGPI',
      'Y/V repair',
      'Meatal Mobilization (MEMO)',
      'KoV Urethral Mobilization',
      'Snodgrass (TIP) Urethroplasty',
      'Mathieu/ SLAM (Slit-Like Adjusted Mathieu) Repair',
      'Duplay Repair',
      'Glans Approximation Procedure (GAP)',
      'Onlay Island Flap Urethroplasty',
      'Double Face Onlay Island Flap',
      'Duckett (Tubularized Preputial Island Flap) Repair',
      'Double Face Duckett Repair',
      '1st Stage STAG (Staged Tubularized Auto Graft) Repair',
      '2nd Stage urethroplasty',
      'STAC (Straighten and Close) Procedure',
      '1st stage (Two-stage Byar\'s flap Repair)',
      '1st Stage Buccal Mucosal Graft',
      '1st Stage Koyanagi',
      'One stage Koyanagi',
      'Fistula Repair +/- Glanuloplasty',
      'Redo Urethroplasty + Glanuloplasty',
      'Circumcision',
      'Redo Circumcision',
      'Excision of smegma cyst',
      'Correction penile abnormalities',
      'Repair of epispadias'
    ]
  },
  {
    category: 'Head and Neck Operations',
    subcategories: [
      'Tongue Tie Division',
      'Excision of Thyroglossal Duct Cyst (Sistrunk Procedure)',
      'Excision of Branchial Cyst',
      'Excision of Branchial Fistula / Sinus',
      'Lymph Node Biopsy',
      'Excision of Enlarged Cervical Lymph Node',
      'Neck Dissection (Selective / Modified Radical)',
      'Excision of Dermoid Cyst (Neck / Chin)',
      'Excision of Preauricular Sinus',
      'Excision of Lymphangioma / Cystic Hygroma',
      'Excision of Hemangioma',
      'Excision of Cervical Teratoma',
      'Excision of Neck Lipoma / Fibroma',
      'Excision of Preauricular Sinus / Cyst',
      'Excision of Ranula / Plunging Ranula',
      'Excision of Parapharyngeal Mass',
      'Excision of Retropharyngeal Abscess (Drainage)',
      'Incision & Drainage of Neck Abscess',
      'Thyroid Lobectomy',
      'Total Thyroidectomy',
      'Near-Total Thyroidectomy',
      'Isthmusectomy',
      'Parathyroidectomy',
      'Exploration for Parathyroid Adenoma',
      'Parotidectomy (Superficial / Total)',
      'Submandibular Gland Excision',
      'Sublingual Gland Excision',
      'Sialolithotomy',
      'Sialadenectomy',
      'Excision of Oral Cavity Mass',
      'Cyst Enucleation (Dentigerous / Odontogenic)'
    ]
  },
  {
    category: 'Cleft Surgery',
    subcategories: [
      'Palatoplasty (for Cleft Palate)',
      'Palatoplasty Two flap',
      'Palatoplasty Intervelar Veloplasty',
      'Furlow palatoplasty',
      'Cleft Lip Repair (Unilateral / Bilateral)',
      'Cleft Lip and Palate Revision',
      'VPI repair',
      'Superiorly Based Pharyngeal Flap',
      'Sphincteroplasty',
      'Redo palatoplasty',
      'Buccinator Flap',
      'Palatal Fistula Repair',
      'Alveolar Bone Grafting'
    ]
  },
  {
    category: 'Thoracic Operations',
    subcategories: [
      'Thoracotomy Right lobectomy',
      'Thoracotomy Left Lobectomy',
      'Excision of Extra lobar Sequestration',
      'Excision of Intralobar Sequestration',
      'Thoracoscopic Right lobectomy',
      'Thoracoscopic Left Lobectomy',
      'Thoracoscopy & Drainage of Empyema',
      'Exploratory Thoracotomy',
      'Chest tube insertion',
      'Thoracoscopic sympathectomy',
      'Open Biopsy of mediastinal mass',
      'Thoracoscopic biopsy',
      'Thoracoscopic Thymectomy',
      'Segmental/Wedge Resection/ Partial Lobectomy Of Lung',
      'Biopsy/Excision of Thoracic Tumour',
      'Thoracoscopic Exploration'
    ]
  },
  {
    category: 'Diaphragm Operations',
    subcategories: [
      'Open repair of Left CDH/Eventration (Laparotomy)',
      'Open repair of Right CDH/Eventration (Laparotomy)',
      'Open repair of Left CDH/Eventration (Thoracotomy)',
      'Open repair of Right CDH/Eventration (Thoracotomy)',
      'Thoracoscopic repair of Right CDH/Eventration',
      'Thoracoscopic repair of Left CDH/Eventration',
      'Laparoscopic repair of CDH/Eventration',
      'Repair of Morgagni hernia (Laparoscopic)',
      'Repair of Morgagni hernia (Open)',
      'Diaphragm Patch Repair',
      'Open Diaphragmatic Plication',
      'Laparoscopic Diaphragmatic Plication'
    ]
  },
  {
    category: 'Gastroesophageal Operations',
    subcategories: [
      'Nissen fundoplication +/- gastrostomy',
      'Thal fundoplication +/- gastrostomy',
      'Toupet Fundoplication',
      'Snow-Hill Repair',
      'Laparoscopic repair of hiatus hernia with Fundoplication',
      'Laparotomy repair of hiatus hernia with Fundoplication',
      'Gastrostomy Tube Insertion',
      'Laparoscopic exploration',
      'Exploratory laparotomy',
      'Esophageal atresia repair (Thoracotomy)',
      'Esophageal atresia repair (Thoracoscopic)',
      'Esophagestomy and gastrostomy',
      'Esophegeal replacement with Colon',
      'Esophegeal replacement with Gastric Tube',
      'Gastric Pull-up',
      'Esophago-esophagostomy',
      'Partial esophegel resection',
      'Resection and anastomosis of the esophagus',
      'Laparoscopic heller cardio-myotomy',
      'Open heller cardio-myotomy'
    ]
  },
  {
    category: 'Stomach Operations',
    subcategories: [
      'Pyloromyotomy (Bianchi)',
      'Pyloromyotomy (laparoscopic)',
      'Pyloroplasty',
      'Creation Of Feeding Gastrostomy (Open)',
      'Creation Of Feeding Gastrostomy (Laparoscopic)',
      'Roux-en-Y gastrojejunostomy',
      'Open cysto-gastrostomy',
      'Laparoscopic cysto-gastrostomy',
      'Excision of pyloric web with pyloroplasty'
    ]
  },
  {
    category: 'Duodenum and Intestine Operations',
    subcategories: [
      'Laparotomy Exploration',
      '2nd Look Laparotomy',
      'Laparoscopic Exploration',
      'Duodeno-duodenostomy (kimura)',
      'Enterotomy with Excision Duodenal Web',
      'Primary Resection and anastomosis of small intestine',
      'Stoma reversal (Closure)',
      'Creation of double parallel ileostomy',
      'Creation of colostomy',
      'Creation of Jejunostomy',
      'Ladd\'s procedure',
      'Creation Of Defunctioning Ileostomy',
      'Duodenojejunostomy',
      'Insertion Of Abdominal Drain',
      'Adhesolysis',
      'Refashioning of stoma',
      'Ultrasound-guided Hydrostatic Reduction of Intussusception',
      'Simple surgical reduction of Intussusception',
      'Resection / Diverticulectomy and anastomosis',
      'Polypectomy with resection and anastomosis'
    ]
  },
  {
    category: 'Colon and Anal Operations',
    subcategories: [
      'Trans-anal pull through (Soave)',
      'Trans-anal pull through (Swenson)',
      'Laparoscopic-assisted Trans-anal pull through (Soave)',
      'Laparoscopic-assisted Trans-anal pull through (Swenson)',
      'Laparotomy-assisted Trans-anal pull through (Duhamel)',
      'Lynn myectomy',
      'Leveling colostomy/ileostomy frozen guided',
      'Resection of colon with stoma formation',
      'Right Hemicolectomy + Ileocolic Anastomosis',
      'Left Hemicolectomy + Anast Colon/Rectum',
      'Sigmoid Colectomy + Anast Colon/Rectum',
      'Colostomy/Hartman',
      'Reduction Of Prolapsed Stoma',
      'Colostomy/Ileostomy',
      'Creation Of Loop Colostomy',
      'Creation Of End Colostomy',
      'Insertion Of Abdominal Drain',
      'Fistulectomy/Fistulotomy/Seton',
      'Drainage of perianal abscess',
      'Mucosectomy for mucosal prolapse',
      'Malone procedure (ACE)',
      'Injection Sclerotherapy',
      'Injection Sclerotherapy and Cerclage',
      'Mucosal Plication',
      'Injection Sclerotherapy and Mucosal Plication',
      'Abdominal/ Laparoscopic Rectopexy',
      'Abdominal/ Laparoscopic Mesh Rectopexy',
      'Delorme Operation',
      'Internal sphincterotomy'
    ]
  },
  {
    category: 'Anorectal Atresia and Cloacal Malformations Operations',
    subcategories: [
      'Anoplasty +/- Cutback',
      'Posterior sagittal Anorectoplasty (PSARP)',
      'Limited PSARP',
      'Laparoscopic-assisted Anorectoplasty',
      'Laparotomy-assisted Anorectoplasty',
      'Anterior sagittal Anorectoplasty (ASARP)',
      'Sphincter saving Anorectoplasty (SSARP)',
      'Pull Through of the Proximal Stoma',
      'Descending Colostomy',
      'Descending Colostomy + Vaginostomy',
      'Posterior Sagittal Anorecto-Vagino-Urethroplasty (PSARVUP)',
      'Total Urogenital Mobilization (TUM)',
      'Partial Urogenital Mobilization (PUM)',
      'Urogenital Separation',
      'PSARP + Urogenital Separation (Hendren)',
      'Excision of Vitello-intestinal Duct remnants +/- resection and anastomosis'
    ]
  },
  {
    category: 'Acute Abdomen and Appendicitis Operations',
    subcategories: [
      'Laparotomy Exploration',
      'Laparoscopic Exploration',
      'Laparoscopic Ovarian Detorsion',
      'Laparoscopic Oophorectomy',
      'Laparoscopic Ovarian Sparing Cyst Excision',
      'Open Appendectomy',
      'Laparoscopic Appendectomy'
    ]
  },
  {
    category: 'Hepato-Biliary, Pancreas and Spleen Operations',
    subcategories: [
      'Laparoscopic Cholecystectomy',
      'Partial Hepatectomy (Segmentectomy / Lobectomy)',
      'Injection of Hepatic cyst',
      'Excision of Hepatic Cyst (simple / hydatid)',
      'Injection of splenic cyst',
      'Drainage of Liver Abscess',
      'Open Total Splenectomy',
      'Open Partial Splenectomy',
      'Laparoscopic Total Splenectomy',
      'Laparoscopic Partial Splenectomy',
      'Laparoscopic Devascularization procedure and splenectomy',
      'Open Devascularization procedure and splenectomy',
      'Rex shunt',
      'Warren shunt',
      'Shunt For Portal Hypertension',
      'Kasai portoenterostomy',
      'Laparoscopic Exploration for Biliary Atresia',
      'Excision of Choledochal cyst + Roux-en-Y hepaticojejunostomy',
      'Excision of Choledochal cyst + hepatico-duodeostomy',
      'Common Bile Duct Exploration',
      'Biliary Drainage Procedure',
      'Pancreatic Resection (Total/ Partial / Distal / Central)',
      'Pancreatic cysto-gastrostomy',
      'Pancreaticoduodenectomy (Whipple Procedure)',
      'Pancreatectomy',
      'Drainage for Necrotizing Pancreatitis'
    ]
  },
  {
    category: 'Urinary Tract Operations',
    subcategories: [
      'Right Orchidopexy',
      'Left Orchidopexy',
      'Bilateral Orchidopexy',
      'Laparoscopic 1st Stage traction of UDT',
      'Laparoscopic 1st stage Stephen fowler',
      'Laparoscopic 2nd Stage Orchidopexy',
      'Redo Orchidopexy',
      'High inguinal Orchiectomy',
      'Endoscopic ablation of PUV',
      'Ureteric reimplantation',
      'Pyeloplasty (open / laparoscopic)',
      'Nephrolithotomy / PCNL',
      'Nephrectomy (simple / partial / laparoscopic)',
      'Nephroureterectomy (Radical)',
      'Nephron sparing surgery',
      'Ureterocele (Excision)',
      'Ureterocele (injection)',
      'Ureterostomy',
      'Cystoscopy (diagnostic / operative)',
      'Suprapubic Cystostomy',
      'Bladder Exstrophy Repair (primary closure / staged repair)',
      'Epispadias-Exstrophy Complex Repair',
      'Mitrofanoff Appendico-vesicostomy',
      'Renal Transplantation (donor nephrectomy / recipient operation)',
      'Bladder augmentation with reconstruction of bladder neck',
      'Bladder augmentation with closure of bladder neck and outlet formation',
      'Vesicostomy/closure of vesicostomy',
      'Cloacal exstrophy repair'
    ]
  },
  {
    category: 'Disorders of Sex Differentiation Operations',
    subcategories: [
      'Pan-endoscopy',
      'Examination under anesthesia (EUA)',
      'Clitoroplasty (Reduction Clitoroplasty / Preservation Clitoroplasty)',
      'Vaginoplasty',
      'Total Uro-genital Mobilization',
      'Partial Uro-genital Mobilization',
      'Feminizing Genitoplasty'
    ]
  },
  {
    category: 'Pediatric Oncology Operations',
    subcategories: [
      'Tumor Biopsy (Incisional / Excisional)',
      'Lymph Node Biopsy',
      'Radical Nephrectomy',
      'Partial Nephrectomy',
      'Lymph Node Sampling / Dissection',
      'Adrenalectomy (Neuroblastoma / Adrenocortical Tumor)',
      'Retroperitoneal Neuroblastoma Resection',
      'Rhabdomyosarcoma Resection (Abdominal / Pelvic)',
      'Teratoma Excision (Retroperitoneal / Sacrococcygeal / Abdominal)',
      'Ovarian sparing Tumor Resection',
      'Oophorectomy',
      'Testicular Tumor Excision / Orchiectomy',
      'Mesenteric or Omental Tumor Excision',
      'Hepatoblastoma Resection / Partial Hepatectomy',
      'Splenectomy (for Tumor / Hypersplenism)',
      'Pancreatic Tumor Resection (Distal / Central)',
      'Gastrointestinal Stromal Tumor (GIST) Resection',
      'Biopsy of Recurrent Tumor',
      'Debulking Surgery for Advanced Tumor'
    ]
  },
  {
    category: 'Other',
    subcategories: []
  }
];

export const getAllOperations = (): string[] => {
  const operations: string[] = [];
  OPERATION_CATEGORIES.forEach(category => {
    if (category.subcategories.length > 0) {
      category.subcategories.forEach(sub => {
        operations.push(`${category.category} - ${sub}`);
      });
    } else {
      operations.push(category.category);
    }
  });
  return operations;
};

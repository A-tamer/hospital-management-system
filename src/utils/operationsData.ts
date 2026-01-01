// Operations hierarchy data
export interface OperationCategory {
  category: string;
  subcategories: string[];
}

export const OPERATION_CATEGORIES: OperationCategory[] = [
  {
    category: 'Thoracic operations',
    subcategories: [
      'Thoracotomy Right lobectomy',
      'Thoracotomy Left Lobectomy',
      'Excision of Extralobar Sequestration',
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
      'Biopsy/Excision Of Thoracic Tumour',
      'Thoracoscopic Exploration'
    ]
  },
  {
    category: 'Gastroesophageal operations',
    subcategories: [
      'Nissen fundoplication +/- gastrostomy',
      'Thal fundoplication +/- gastrostomy',
      'Laparoscopic repair of hiatus hernia with Fundoplication',
      'Laparotomy repair of hiatus hernia with Fundoplication',
      'Laparoscopic exploration',
      'Exploratory laparotomy',
      'Esophageal atresia repair (Thoracotomy)',
      'Esophageal atresia repair (Thoracoscopic)',
      'Esophagestomy and gastrostomy',
      'Esophageal replacement',
      'Plication Of Diaphragm (Eventration) Trans Thoracic',
      'Esophago-esophagostomy',
      'Partial esophageal resection',
      'Resection and anastomosis of the esophagus',
      'Thoracotomy exploration',
      'Thoracoscopic drainage',
      'Thoracoscopic exploration',
      'Laparoscopic heller cardio -myotomy',
      'Open heller cardio-myotomy'
    ]
  },
  {
    category: 'Stomach Operations',
    subcategories: [
      'Pyloromyotomy (Bianchi)',
      'Pyloromyotomy (laparoscopic)',
      'Pyloroplasty',
      'Creation Of Feeding Gastrostomy(Open)',
      'Creation Of Feeding Gastrostomy(Laparoscopic)',
      'Roux-en-Y gastrojejunostomy',
      'Open cysto-gasterostomy',
      'Laparoscopic cysto-gasterostomy',
      'Excision of pyloric web with pyloroplasty'
    ]
  },
  {
    category: 'Diaphragm Operations',
    subcategories: [
      'Open repair of CDH/Eventration (laparotomy/thoracotomy)',
      'Thoracoscopic repair CDH/Eventration',
      'Laparoscopic repair of CDH/Eventration',
      'Repair of Morgagni hernia ( Laparoscopic/open)',
      'Diaphragm Patch Repair',
      'Open Diaphragmatic Plication',
      'Laparoscopic Diaphragmatic Plication'
    ]
  },
  {
    category: 'Duodenal and Intestinal Operations',
    subcategories: [
      'Laparotomy Exploration',
      '2nd Look Laparotomy',
      'Laparoscopic Exploration',
      'Duodeno-duodenostomy (kimura)',
      'Enterotomy with Excision Duodenal Web',
      'Primary Resection and anastomosis of small intestine',
      'Stoma reversal(Closure)',
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
    category: 'Colon operations',
    subcategories: [
      'Trans-anal pull through for HD ( Soave / Swenson)',
      'Laparoscopic-assisted Trans-anal pull through for HD ( Soave / Swenson / Duhamel)',
      'Laparotomy-assisted Trans-anal pull through for HD ( Soave / Swenson / Duhamel)',
      'Lynn myectomy',
      'Leveling colostomy/ileostomy frozen guided',
      'Resection of colon with stoma formation',
      'Right Hemicolectomy + Ileocolic Anastomosis',
      'Left Hemicolectomy + Anast Colon/Rectum',
      'Sigmoid Colectomy + Anast Colon/Rectum',
      'Colostomy/Hartman',
      'Reduction Of Prolasped Stoma',
      'Colostomy/Ileostomy',
      'Formation Of Loop Colostomy',
      'Formation Of End Colostomy',
      'Insertion Of Abdominal Drain'
    ]
  },
  {
    category: 'Anorectal Atresia and Cloacal Malformations operations',
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
      'Partial Urogenital Mobilization(PUM)',
      'Urogenital Separation',
      'PSARP + Urogenital Separation (Hendren)',
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
      'Internal sphinceterotomy',
      'Excison of Vitello-intestinal Duct remnants +/- resection and anastmosis'
    ]
  },
  {
    category: 'Acute abdomen and Appendicitis operations',
    subcategories: [
      'Laparotomy Exploration',
      'Laparoscopic Exploration',
      'Laparoscopic ovarian detorsion',
      'Open appendectomy',
      'Laparoscopic appendectomy'
    ]
  },
  {
    category: 'Abdominal Wall and hernias operations',
    subcategories: [
      'Primary Repair of Exomphalos',
      'Primary Repair of Gastroschisis',
      'Staged Repair of Gastroschisis (Silo)',
      'Open Unilateral inguinal herniotomy',
      'Open Bilateral inguinal herniotomy',
      'Laparoscopic Unilateral inguinal repair',
      'Laparoscopic Bilateral inguinal repair',
      'Mesh Repair of hernia',
      'Laparoscopic varicocelectomy',
      'Open varicocelectomy',
      'Anatomical repair of ventral hernia'
    ]
  },
  {
    category: 'Liver and spleen operations',
    subcategories: [
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
      'Warren shunt'
    ]
  },
  {
    category: 'Biliary tract operations',
    subcategories: [
      'Kasai portoenterostomy',
      'Laparoscopic Exploration for Biliary Atresia',
      'Excision of Choledochal cyst + Roux-en-Y hepaticojejunostomy',
      'Excision of Choledochal cyst + hepatico-duodeostomy',
      'Laparoscopic Cholecystectomy',
      'Common Bile Duct Exploration',
      'Biliary Drainage Procedure'
    ]
  },
  {
    category: 'Pancreas',
    subcategories: [
      'Pancreatic Resection (Total/ Partial / Distal / Central)',
      'Pancreatic cysto-gastrostomy',
      'Pancreaticoduodenectomy (Whipple Procedure)',
      'Drainage for Necrotizing Pancreatitis'
    ]
  },
  {
    category: 'Hypospadias and penile operations',
    subcategories: [
      'Meatal Advancement',
      'Meatotomy / meatoplasty',
      'MAGPI',
      'Y/V repair',
      'Meatal Mobilization (MEMO)',
      'Koff Urethral Mobilization',
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
    category: 'Pediatric urology operations',
    subcategories: [
      'Endoscopic ablation of PUV',
      'Ureteric reimplantation',
      'Unilateral Orchidopexy',
      'Bilateral Orchidopexy',
      'Laparoscopic 1St Stage traction of UDT',
      'Laparoscopic 1st stage Stephen fowler',
      'Laparoscopic 2Nd Stage Orchidopexy',
      'Redo Orchidopexy',
      'High inguinal Orchiectomy',
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
    category: 'Disorders of Sex Differentiation',
    subcategories: [
      'Pan endoscopy',
      'Examination under anesthesia (EUA)',
      'Clitoroplasty (Reduction clitoroplasty / Preservation clitoroplasty)',
      'Vaginoplasty'
    ]
  },
  {
    category: 'Pediatric Oncology',
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
    category: 'Head and Neck cyst operations',
    subcategories: [
      'Excision of Branchial Cyst',
      'Excision of Branchial Fistula / Sinus',
      'Excision of Thyroglossal Duct Cyst (Sistrunk Procedure)',
      'Excision of Dermoid Cyst (Neck / Chin)',
      'Excision of Lymphangioma / Cystic Hygroma',
      'Excision of Hemangioma',
      'Excision of Cervical Teratoma',
      'Excision of Neck Lipoma / Fibroma',
      'Excision of Preauricular Sinus / Cyst',
      'Excision of Ranula / Plunging Ranula',
      'Excision of Parapharyngeal Mass',
      'Excision of Retropharyngeal Abscess (Drainage)',
      'Incision & Drainage of Neck Abscess'
    ]
  },
  {
    category: 'Thyroid & Parathyroid',
    subcategories: [
      'Thyroid Lobectomy',
      'Total Thyroidectomy',
      'Near-Total Thyroidectomy',
      'Isthmusectomy',
      'Parathyroidectomy',
      'Exploration for Parathyroid Adenom'
    ]
  },
  {
    category: 'Salivary Glands',
    subcategories: [
      'Parotidectomy (Superficial / Total)',
      'Submandibular Gland Excision',
      'Sublingual Gland Excision',
      'Sialolithotomy',
      'Sialadenectomy'
    ]
  },
  {
    category: 'Cervical Lymph Nodes & Neck Dissection',
    subcategories: [
      'Lymph Node Biopsy',
      'Excision of Enlarged Cervical Lymph Node',
      'Neck Dissection (Selective / Modified Radical)'
    ]
  },
  {
    category: 'Oral Cavity & lip and palate',
    subcategories: [
      'Tongue Tie Release (Frenulotomy / Frenuloplasty)',
      'Excision of Oral Cavity Mass',
      'Cyst Enucleation (Dentigerous / Odontogenic)',
      'Palatoplasty (for Cleft Palate)',
      'Cleft Lip Repair (Unilateral / Bilateral)',
      'Cleft Lip and Palate Revision',
      'VPI repair',
      'Alveolar Bone Grafting'
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


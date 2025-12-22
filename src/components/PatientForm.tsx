import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, Heart, Image as ImageIcon, DollarSign, FileText, Stethoscope, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { usePatientContext } from '../context/PatientContext';
import { Patient, Surgeon, SurgeryRecord, FollowUp, ContactInfo, PatientFiles } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { DIAGNOSIS_CATEGORIES } from '../utils/diagnosisData';
import CollapsibleSection from './CollapsibleSection';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './Toast';
import { validateImageFile, validatePdfFile, validateFileForFolder, formatFileSize } from '../utils/fileValidation';

interface PatientFormProps {
  patient?: Patient | null;
  onClose: () => void;
  generateCode: () => string;
  allPatients?: Patient[];
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onClose, generateCode, allPatients = [] }) => {
  const { addPatient, updatePatient, isLoading, error } = useFirebaseOperations();
  const { state } = usePatientContext();
  const { t } = useLanguage();
  const { showSuccess, showError } = useToast();
  
  // Check if user can view financial section
  const canViewFinancial = state.currentUser?.role === 'admin' || state.currentUser?.canViewFinancial === true;
  
  // Basic Info
  const [code, setCode] = useState('');
  const [fullNameArabic, setFullNameArabic] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [diagnosisCategory, setDiagnosisCategory] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [visitedDate, setVisitedDate] = useState('');
  const [status, setStatus] = useState<'Diagnosed' | 'Pre-op' | 'Post-op'>('Diagnosed');
  const [notes, setNotes] = useState('');

  // Contact Info
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    relation: ''
  });

  // Files
  const [files, setFiles] = useState<PatientFiles>({});
  const [personalImageFile, setPersonalImageFile] = useState<File | null>(null);
  const [surgeryImageFile, setSurgeryImageFile] = useState<File | null>(null);
  const [radiologyFiles, setRadiologyFiles] = useState<File[]>([]);
  const [labFiles, setLabFiles] = useState<File[]>([]);
  const [activeUploadTarget, setActiveUploadTarget] = useState<'personal' | 'surgery' | 'radiology' | 'lab' | null>(null);

  // Multiple Surgeries (each with its own surgeons)
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);

  // Follow-ups
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);


  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data
  useEffect(() => {
    if (patient) {
      setCode(patient.code);
      setFullNameArabic(patient.fullNameArabic || '');
      setAge(patient.age.toString());
      setGender(patient.gender);
      setDiagnosisCategory(patient.diagnosisCategory || '');
      setDiagnosis(patient.diagnosis);
      setVisitedDate(patient.visitedDate || (patient as any).admissionDate || '');
      setStatus(patient.status);
      setNotes(patient.notes || '');
      setContactInfo(patient.contactInfo || { name: '', phone: '', email: '', address: '', relation: '' });
      setFiles(patient.files || {});
      setSurgeries(patient.surgeries || []);
      setFollowUps(patient.followUps || []);
    } else {
      setCode(generateCode());
      setVisitedDate(new Date().toISOString().split('T')[0]);
    }
  }, [patient, generateCode]);

  // Get subcategories for selected category
  const getSubcategories = () => {
    const category = DIAGNOSIS_CATEGORIES.find(c => c.category === diagnosisCategory);
    return category?.subcategories || [];
  };

  // Add Surgery
  const addSurgery = () => {
    setSurgeries([...surgeries, {
      date: '',
      type: '',
      surgeons: [],
      notes: '',
      cost: undefined,
      costCurrency: 'USD'
    }]);
  };

  const updateSurgery = (index: number, field: keyof SurgeryRecord, value: any) => {
    const updated = [...surgeries];
    updated[index] = { ...updated[index], [field]: value };
    setSurgeries(updated);
  };

  const addSurgeonToSurgery = (surgeryIndex: number) => {
    const updated = [...surgeries];
    if (!updated[surgeryIndex].surgeons) {
      updated[surgeryIndex].surgeons = [];
    }
    updated[surgeryIndex].surgeons = [...updated[surgeryIndex].surgeons, { name: '', specialization: '', phone: '' }];
    setSurgeries(updated);
  };

  const updateSurgeonInSurgery = (surgeryIndex: number, surgeonIndex: number, field: keyof Surgeon, value: string) => {
    const updated = [...surgeries];
    if (!updated[surgeryIndex].surgeons) {
      updated[surgeryIndex].surgeons = [];
    }
    const surgeons = [...updated[surgeryIndex].surgeons];
    surgeons[surgeonIndex] = { ...surgeons[surgeonIndex], [field]: value };
    updated[surgeryIndex].surgeons = surgeons;
    setSurgeries(updated);
  };

  const removeSurgeonFromSurgery = (surgeryIndex: number, surgeonIndex: number) => {
    const updated = [...surgeries];
    if (updated[surgeryIndex].surgeons) {
      updated[surgeryIndex].surgeons = updated[surgeryIndex].surgeons.filter((_, i) => i !== surgeonIndex);
    }
    setSurgeries(updated);
  };

  const removeSurgery = (index: number) => {
    setSurgeries(surgeries.filter((_, i) => i !== index));
  };

  // Add Follow-up
  const addFollowUp = () => {
    setFollowUps([...followUps, {
      number: followUps.length + 1,
      date: new Date().toISOString().split('T')[0],
      notes: ''
    }]);
  };

  const updateFollowUp = (index: number, field: keyof FollowUp, value: string | number) => {
    const updated = [...followUps];
    updated[index] = { ...updated[index], [field]: value };
    setFollowUps(updated);
  };

  const removeFollowUp = (index: number) => {
    const renumbered = followUps.filter((_, i) => i !== index).map((fu, i) => ({
      ...fu,
      number: i + 1
    }));
    setFollowUps(renumbered);
  };

  // Shared file processing helpers (used by input change + paste handlers)
  const processPersonalImageFile = (file: File | null) => {
    if (!file) {
      setPersonalImageFile(null);
      setFileErrors({ ...fileErrors, personalImage: '' });
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileErrors({ ...fileErrors, personalImage: validation.error || '' });
      showError(validation.error || 'Invalid image file');
      return;
    }

    setPersonalImageFile(file);
    setFileErrors({ ...fileErrors, personalImage: '' });
  };

  const processSurgeryImageFile = (file: File | null) => {
    if (!file) {
      setSurgeryImageFile(null);
      setFileErrors({ ...fileErrors, surgeryImage: '' });
      return;
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setFileErrors({ ...fileErrors, surgeryImage: validation.error || '' });
      showError(validation.error || 'Invalid image file');
      return;
    }

    setSurgeryImageFile(file);
    setFileErrors({ ...fileErrors, surgeryImage: '' });
  };

  const processRadiologyFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setRadiologyFiles([]);
      setFileErrors({ ...fileErrors, radiology: '' });
      return;
    }

    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      const validation = validateFileForFolder(file, 'radiology');
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setFileErrors({ ...fileErrors, radiology: invalidFiles.join('; ') });
      showError(`Some radiology files are invalid: ${invalidFiles.join('; ')}`);
      return;
    }

    setRadiologyFiles(validFiles);
    setFileErrors({ ...fileErrors, radiology: '' });
  };

  const processLabFiles = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) {
      setLabFiles([]);
      setFileErrors({ ...fileErrors, lab: '' });
      return;
    }

    const invalidFiles: string[] = [];
    const validFiles: File[] = [];

    selectedFiles.forEach((file) => {
      const validation = validateFileForFolder(file, 'lab');
      if (!validation.valid) {
        invalidFiles.push(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setFileErrors({ ...fileErrors, lab: invalidFiles.join('; ') });
      showError(`Some lab files are invalid: ${invalidFiles.join('; ')}`);
      return;
    }

    setLabFiles(validFiles);
    setFileErrors({ ...fileErrors, lab: '' });
  };

  // File validation handlers (for input change)
  const handlePersonalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processPersonalImageFile(file);
    // Clear native input value so the same file can be re-selected if needed
    if (e.target) e.target.value = '';
  };

  const handleSurgeryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    processSurgeryImageFile(file);
    if (e.target) e.target.value = '';
  };

  const handleRadiologyFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processRadiologyFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  const handleLabFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processLabFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  // Global paste handler – allows Ctrl+V to upload files
  useEffect(() => {
    const handlePaste = (event: Event) => {
      const clipboardData = (event as any).clipboardData as DataTransfer | null;
      if (!clipboardData) return;

      const items = Array.from(clipboardData.items || []);
      const files: File[] = [];

      items.forEach((item) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      });

      if (files.length === 0) return;

      // We handle file pastes ourselves
      event.preventDefault();

      const target = activeUploadTarget || 'personal';

      if (target === 'personal') {
        processPersonalImageFile(files[0]);
      } else if (target === 'surgery') {
        processSurgeryImageFile(files[0]);
      } else if (target === 'radiology') {
        processRadiologyFiles(files);
      } else if (target === 'lab') {
        processLabFiles(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [activeUploadTarget, processPersonalImageFile, processSurgeryImageFile, processRadiologyFiles, processLabFiles]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullNameArabic.trim()) newErrors.fullNameArabic = t('form.fullNameAr') + ' ' + t('common.required');
    if (!age || isNaN(Number(age)) || Number(age) < 0) newErrors.age = t('form.age') + ' ' + t('common.required');
    if (!diagnosis.trim()) newErrors.diagnosis = t('form.diagnosis') + ' ' + t('common.required');
    if (!visitedDate) newErrors.visitedDate = t('form.visitedDate') + ' ' + t('common.required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);
    try {
      // Upload files
      const uploadedFiles: PatientFiles = { ...files };

      if (personalImageFile) {
        uploadedFiles.personalImage = await FirebaseService.uploadPatientFile(code, personalImageFile, 'personal-images');
      }
      if (surgeryImageFile) {
        uploadedFiles.surgeryImage = await FirebaseService.uploadPatientFile(code, surgeryImageFile, 'surgery-images');
      }

      const radiologyUrls: string[] = [];
      for (const file of radiologyFiles) {
        const url = await FirebaseService.uploadPatientFile(code, file, 'radiology');
        radiologyUrls.push(url);
      }
      if (radiologyUrls.length > 0) uploadedFiles.radiology = radiologyUrls;

      const labUrls: string[] = [];
      for (const file of labFiles) {
        const url = await FirebaseService.uploadPatientFile(code, file, 'lab');
        labUrls.push(url);
      }
      if (labUrls.length > 0) uploadedFiles.lab = labUrls;

      // Prepare surgeries with costs
      const finalSurgeries: SurgeryRecord[] = surgeries.map((surgery) => ({
        ...surgery,
        cost: surgery.cost ? Number(surgery.cost) : undefined,
        costCurrency: surgery.costCurrency || 'USD'
      }));

      const patientData: Omit<Patient, 'id'> = {
        code,
        fullNameArabic: fullNameArabic.trim(),
        age: Number(age),
        gender,
        diagnosis: diagnosis.trim(),
        diagnosisCategory,
        visitedDate,
        status,
        notes: notes.trim(),
        contactInfo: contactInfo.name || contactInfo.phone ? contactInfo : undefined,
        surgeries: finalSurgeries.length > 0 ? finalSurgeries : undefined,
        followUps: followUps.length > 0 ? followUps : undefined,
        files: Object.keys(uploadedFiles).length > 0 ? uploadedFiles : undefined,
        createdAt: patient?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (patient) {
        await updatePatient(patient.id, patientData);
        showSuccess(t('form.patientUpdated') || 'Patient information has been updated');
      } else {
        await addPatient(patientData);
        showSuccess(t('form.patientAdded') || 'New patient has been added to the system');
      }

      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      showError(t('form.saveError') || 'Unable to save patient information. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ overflow: 'auto', zIndex: 1000 }}>
      <div 
        className="modal animate-scale-in" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '1000px', 
          width: '95%', 
          maxHeight: '95vh', 
          overflow: 'auto',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="modal-header" style={{ 
          position: 'sticky', 
          top: 0, 
          background: 'white', 
          zIndex: 10, 
          borderBottom: '2px solid #e0e0e0', 
          paddingBottom: '1rem',
          marginBottom: '1.5rem'
        }}>
          <h2 className="modal-title">
            {patient ? t('form.updatePatient') : t('form.addPatient')}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form" style={{ padding: '0 1.5rem 1.5rem' }}>
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          {/* Basic Information - Collapsible */}
          <CollapsibleSection 
            title={t('form.basicInfo')} 
            icon={<User style={{ width: '20px', height: '20px', color: '#17a2b8' }} />}
            defaultOpen={true}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('patients.patientCode')}</label>
                <input
                  type="text"
                  value={code}
                  className="form-input"
                  disabled
                  style={{ background: '#e9ecef' }}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.fullNameAr')} *</label>
                <input
                  type="text"
                  value={fullNameArabic}
                  onChange={(e) => setFullNameArabic(e.target.value)}
                  className={`form-input ${errors.fullNameArabic ? 'error' : ''}`}
                  placeholder="الاسم الكامل بالعربية"
                  dir="rtl"
                />
                {errors.fullNameArabic && <span className="error-message">{errors.fullNameArabic}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.age')} *</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className={`form-input ${errors.age ? 'error' : ''}`}
                  min="0"
                  max="150"
                />
                {errors.age && <span className="error-message">{errors.age}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.gender')}</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                  className="form-select"
                >
                  <option value="Male">{t('gender.male')}</option>
                  <option value="Female">{t('gender.female')}</option>
                  <option value="Other">{t('gender.other')}</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.diagnosisCategory')}</label>
                <select
                  value={diagnosisCategory}
                  onChange={(e) => {
                    setDiagnosisCategory(e.target.value);
                    setDiagnosis(''); // Reset diagnosis when category changes
                  }}
                  className="form-select"
                >
                  <option value="">{t('form.selectCategory')}</option>
                  {DIAGNOSIS_CATEGORIES.map(cat => (
                    <option key={cat.category} value={cat.category}>{cat.category}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.diagnosis')} *</label>
                {diagnosisCategory ? (
                  <select
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className={`form-select ${errors.diagnosis ? 'error' : ''}`}
                  >
                    <option value="">{t('form.selectDiagnosis')}</option>
                    {getSubcategories().map(sub => (
                      <option key={sub} value={`${diagnosisCategory} - ${sub}`}>
                        {sub}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    className={`form-input ${errors.diagnosis ? 'error' : ''}`}
                    placeholder={t('form.enterDiagnosis')}
                  />
                )}
                {errors.diagnosis && <span className="error-message">{errors.diagnosis}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.visitedDate')} *</label>
                <input
                  type="date"
                  value={visitedDate}
                  onChange={(e) => setVisitedDate(e.target.value)}
                  className={`form-input ${errors.visitedDate ? 'error' : ''}`}
                />
                {errors.visitedDate && <span className="error-message">{errors.visitedDate}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.status')}</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'Diagnosed' | 'Pre-op' | 'Post-op')}
                  className="form-select"
                >
                  <option value="Diagnosed">{t('status.diagnosed')}</option>
                  <option value="Pre-op">{t('status.preOp')}</option>
                  <option value="Post-op">{t('status.postOp')}</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder={t('form.notes')}
                rows={3}
              />
            </div>
          </CollapsibleSection>

          {/* Contact Information - Collapsible */}
          <CollapsibleSection 
            title={t('form.contactInfo')} 
            icon={<Phone style={{ width: '20px', height: '20px', color: '#dc3545' }} />}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.contactName')}</label>
                <input
                  type="text"
                  value={contactInfo.name}
                  onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                  className="form-input"
                  placeholder={t('form.contactName')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.phone')}</label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="form-input"
                  placeholder={t('form.phone')}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('form.email')}</label>
                <input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="form-input"
                  placeholder={t('form.email')}
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('form.relation')}</label>
                <input
                  type="text"
                  value={contactInfo.relation}
                  onChange={(e) => setContactInfo({ ...contactInfo, relation: e.target.value })}
                  className="form-input"
                  placeholder={t('form.relation')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('form.address')}</label>
              <textarea
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="form-input"
                placeholder={t('form.address')}
                rows={2}
              />
            </div>
          </CollapsibleSection>

          {/* Files - Multiple Collapsible Sections */}
          <div onClick={() => setActiveUploadTarget('personal')}>
            <CollapsibleSection 
              title={t('form.personalImage')} 
              icon={<ImageIcon style={{ width: '20px', height: '20px', color: '#17a2b8' }} />}
            >
              <div className="form-group">
                <label className="form-label">{t('form.uploadPersonalPhoto')}</label>
                {files.personalImage && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img
                      src={files.personalImage}
                      alt="Personal"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                    />
                  </div>
                )}
                <label className="file-upload-button">
                  <span className="file-upload-label">
                    <ImageIcon style={{ width: '18px', height: '18px' }} />
                    <span>{t('form.chooseFile') || 'Choose image'}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePersonalImageChange}
                  />
                </label>
                {fileErrors.personalImage && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc3545' }}>
                    {fileErrors.personalImage}
                  </div>
                )}
                {personalImageFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
                    Selected: {personalImageFile.name} ({formatFileSize(personalImageFile.size)})
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          <div onClick={() => setActiveUploadTarget('surgery')}>
            <CollapsibleSection 
              title={t('form.surgeryImage')} 
              icon={<Stethoscope style={{ width: '20px', height: '20px', color: '#e83e8c' }} />}
            >
              <div className="form-group">
                <label className="form-label">{t('form.uploadSurgeryImage')}</label>
                {files.surgeryImage && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    <img
                      src={files.surgeryImage}
                      alt="Surgery"
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}
                    />
                  </div>
                )}
                <label className="file-upload-button file-upload-button-secondary">
                  <span className="file-upload-label">
                    <Stethoscope style={{ width: '18px', height: '18px' }} />
                    <span>{t('form.chooseFile') || 'Choose image'}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSurgeryImageChange}
                  />
                </label>
                {fileErrors.surgeryImage && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc3545' }}>
                    {fileErrors.surgeryImage}
                  </div>
                )}
                {surgeryImageFile && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
                    Selected: {surgeryImageFile.name} ({formatFileSize(surgeryImageFile.size)})
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          <div onClick={() => setActiveUploadTarget('radiology')}>
            <CollapsibleSection 
              title={t('form.radiologyFiles')} 
              icon={<FileText style={{ width: '20px', height: '20px', color: '#ffc107' }} />}
            >
              <div className="form-group">
                <label className="form-label">{t('form.uploadRadiology')}</label>
                <label className="file-upload-button file-upload-button-warning">
                  <span className="file-upload-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    <span>{t('form.chooseFiles') || 'Choose files'}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={handleRadiologyFilesChange}
                  />
                </label>
                {fileErrors.radiology && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc3545' }}>
                    {fileErrors.radiology}
                  </div>
                )}
                {radiologyFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
                    {radiologyFiles.length} {t('form.filesSelected')} ({radiologyFiles.reduce((sum, f) => sum + f.size, 0) > 0 ? formatFileSize(radiologyFiles.reduce((sum, f) => sum + f.size, 0)) : ''})
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          <div onClick={() => setActiveUploadTarget('lab')}>
            <CollapsibleSection 
              title={t('form.labFiles')} 
              icon={<FileText style={{ width: '20px', height: '20px', color: '#28a745' }} />}
            >
              <div className="form-group">
                <label className="form-label">{t('form.uploadLab')}</label>
                <label className="file-upload-button file-upload-button-success">
                  <span className="file-upload-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    <span>{t('form.chooseFiles') || 'Choose files'}</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={handleLabFilesChange}
                  />
                </label>
                {fileErrors.lab && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#dc3545' }}>
                    {fileErrors.lab}
                  </div>
                )}
                {labFiles.length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
                    {labFiles.length} {t('form.filesSelected')} ({labFiles.reduce((sum, f) => sum + f.size, 0) > 0 ? formatFileSize(labFiles.reduce((sum, f) => sum + f.size, 0)) : ''})
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>

          {/* Surgeries - Collapsible */}
          <CollapsibleSection 
            title={t('form.surgeries')} 
            icon={<Heart style={{ width: '20px', height: '20px', color: '#e83e8c' }} />}
          >
            {surgeries.map((surgery, index) => (
              <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{t('form.surgeries')} {index + 1}</h4>
                  <button type="button" onClick={() => removeSurgery(index)} className="btn btn-sm btn-danger">
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('form.surgeryDate')}</label>
                    <input
                      type="date"
                      value={surgery.date}
                      onChange={(e) => updateSurgery(index, 'date', e.target.value)}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('form.surgeryType')}</label>
                    <input
                      type="text"
                      value={surgery.type}
                      onChange={(e) => updateSurgery(index, 'type', e.target.value)}
                      className="form-input"
                      placeholder={t('form.surgeryType')}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('form.surgeryNotes')}</label>
                  <textarea
                    value={surgery.notes || ''}
                    onChange={(e) => updateSurgery(index, 'notes', e.target.value)}
                    className="form-input"
                    placeholder={t('form.surgeryNotes')}
                    rows={2}
                  />
                </div>
                
                {/* Surgeons for this surgery */}
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>{t('form.surgeons')}</label>
                    <button type="button" onClick={() => addSurgeonToSurgery(index)} className="btn btn-sm btn-secondary">
                      <Plus style={{ width: '14px', height: '14px' }} />
                      {t('form.addSurgeon')}
                    </button>
                  </div>
                  {surgery.surgeons && surgery.surgeons.map((surgeon, sIndex) => (
                    <div key={sIndex} style={{ marginBottom: '0.75rem', padding: '0.75rem', background: '#fff', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#666' }}>{t('form.surgeons')} {sIndex + 1}</span>
                        <button type="button" onClick={() => removeSurgeonFromSurgery(index, sIndex)} className="btn btn-sm btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                          <Trash2 style={{ width: '12px', height: '12px' }} />
                        </button>
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <input
                            type="text"
                            value={surgeon.name}
                            onChange={(e) => updateSurgeonInSurgery(index, sIndex, 'name', e.target.value)}
                            className="form-input"
                            placeholder={t('form.surgeonName')}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="text"
                            value={surgeon.specialization || ''}
                            onChange={(e) => updateSurgeonInSurgery(index, sIndex, 'specialization', e.target.value)}
                            className="form-input"
                            placeholder={t('form.specialization')}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="tel"
                            value={surgeon.phone || ''}
                            onChange={(e) => updateSurgeonInSurgery(index, sIndex, 'phone', e.target.value)}
                            className="form-input"
                            placeholder={t('form.phone')}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Financial info for this surgery */}
                {canViewFinancial && (
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e0e0e0' }}>
                    <label className="form-label">{t('form.surgeryCost')}</label>
                    <div className="form-row">
                      <div className="form-group">
                        <input
                          type="number"
                          value={surgery.cost?.toString() || ''}
                          onChange={(e) => updateSurgery(index, 'cost', e.target.value ? Number(e.target.value) : undefined)}
                          className="form-input"
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div className="form-group">
                        <select
                          value={surgery.costCurrency || 'USD'}
                          onChange={(e) => updateSurgery(index, 'costCurrency', e.target.value)}
                          className="form-select"
                        >
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                          <option value="GBP">GBP (£)</option>
                          <option value="SAR">SAR (﷼)</option>
                          <option value="EGP">EGP (E£)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={addSurgery} className="btn btn-secondary btn-sm">
              <Plus style={{ width: '16px', height: '16px' }} />
              {t('form.addSurgery') || 'Add surgery record'}
            </button>
          </CollapsibleSection>

          {/* Follow-ups - Collapsible */}
          <CollapsibleSection 
            title={t('form.followUps')} 
            icon={<Calendar style={{ width: '20px', height: '20px', color: '#20c997' }} />}
          >
            {followUps.map((followUp, index) => (
              <div key={index} style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>{t('detail.followUp')} #{followUp.number}</h4>
                  <button type="button" onClick={() => removeFollowUp(index)} className="btn btn-sm btn-danger">
                    <Trash2 style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('form.followUpDate')}</label>
                    <input
                      type="date"
                      value={followUp.date}
                      onChange={(e) => updateFollowUp(index, 'date', e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('form.followUpNotes')}</label>
                  <textarea
                    value={followUp.notes}
                    onChange={(e) => updateFollowUp(index, 'notes', e.target.value)}
                    className="form-input"
                    placeholder={t('form.followUpNotes')}
                    rows={2}
                  />
                </div>
              </div>
            ))}
            <button type="button" onClick={addFollowUp} className="btn btn-secondary btn-sm">
              <Plus style={{ width: '16px', height: '16px' }} />
              {t('form.addFollowUp') || 'Add follow-up visit'}
            </button>
          </CollapsibleSection>


          <div className="form-actions" style={{ 
            position: 'sticky', 
            bottom: 0, 
            background: 'white', 
            paddingTop: '1rem', 
            borderTop: '2px solid #e0e0e0',
            marginTop: '1rem'
          }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading || uploading}>
              {t('common.cancel')}
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || uploading}>
              {uploading ? (
                <>
                  <span className="btn-spinner" />
                  <span>{t('form.uploading') || 'Uploading files...'}</span>
                </>
              ) : (
                <>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>{isLoading ? (t('form.saving') || 'Saving...') : (patient ? t('form.updatePatient') : t('form.addPatient'))}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;


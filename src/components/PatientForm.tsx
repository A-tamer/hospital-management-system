import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, Heart, Image as ImageIcon, DollarSign, FileText, Stethoscope, Plus, Trash2, ChevronDown } from 'lucide-react';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { usePatientContext } from '../context/PatientContext';
import { Patient, Surgeon, SurgeryRecord, FollowUp, ContactInfo, PatientFiles } from '../types';
import { FirebaseService } from '../services/firebaseService';
import { DIAGNOSIS_CATEGORIES } from '../utils/diagnosisData';
import { OPERATION_CATEGORIES } from '../utils/operationsData';
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
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  // Multiple diagnoses support
  const [diagnoses, setDiagnoses] = useState<{ category: string; diagnosis: string }[]>([{ category: '', diagnosis: '' }]);
  const [visitedDate, setVisitedDate] = useState('');
  const [status, setStatus] = useState<'Diagnosed' | 'Pre-op' | 'Op' | 'Post-op'>('Diagnosed');
  const [notes, setNotes] = useState('');
  
  // New fields
  const [referringDoctor, setReferringDoctor] = useState('');
  const [clinicBranch, setClinicBranch] = useState<'Cairo Clinic' | 'Mansoura Clinic' | ''>('');

  // Contact Info
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    relation: ''
  });
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');

  // Files
  const [files, setFiles] = useState<PatientFiles>({});
  const [personalImageFile, setPersonalImageFile] = useState<File | null>(null);
  const [surgeryImageFile, setSurgeryImageFile] = useState<File | null>(null);
  const [radiologyFiles, setRadiologyFiles] = useState<File[]>([]);
  const [labFiles, setLabFiles] = useState<File[]>([]);
  const [activeUploadTarget, setActiveUploadTarget] = useState<'personal' | 'surgery' | 'radiology' | 'lab' | null>(null);

  // Multiple Surgeries (each with its own surgeons)
  const [surgeries, setSurgeries] = useState<SurgeryRecord[]>([]);
  
  // Track operation categories for each surgery (separate from the operation itself)
  const [surgeryOperationCategories, setSurgeryOperationCategories] = useState<{ [key: number]: string }>({});

  // Follow-ups
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [followUpPhotos, setFollowUpPhotos] = useState<{ [key: number]: File[] }>({});
  
  // Surgery Photos
  const [surgeryPhotos, setSurgeryPhotos] = useState<{ [key: number]: File[] }>({});
  
  // Planned Surgery
  const [plannedSurgery, setPlannedSurgery] = useState<{
    operationCategory?: string;
    operation?: string;
    estimatedCost?: string;
    costCurrency?: string;
  }>({});
  const [plannedSurgeryOperationCategory, setPlannedSurgeryOperationCategory] = useState('');


  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [fileErrors, setFileErrors] = useState<{ [key: string]: string }>({});

  // Initialize form data
  useEffect(() => {
    if (patient) {
      setCode(patient.code);
      setFullNameArabic(patient.fullNameArabic || '');
      
      // Handle date of birth - if we have age, estimate DOB
      if ((patient as any).dateOfBirth) {
        setDateOfBirth((patient as any).dateOfBirth);
      } else if (patient.age) {
        // Estimate DOB from age for backward compatibility
        const today = new Date();
        const estimatedYear = today.getFullYear() - Math.floor(patient.age);
        const estimatedDOB = new Date(estimatedYear, today.getMonth(), today.getDate());
        setDateOfBirth(estimatedDOB.toISOString().split('T')[0]);
      }
      
      setGender(patient.gender);
      setWeight((patient as any).weight?.toString() || '');
      
      // Handle multiple diagnoses (backward compatible with single diagnosis)
      if ((patient as any).diagnoses && (patient as any).diagnoses.length > 0) {
        // New format with multiple diagnoses
        const loadedDiagnoses = (patient as any).diagnoses.map((d: string) => {
          const match = d.match(/^(.+?) - (.+)$/);
          if (match) {
            return { category: match[1], diagnosis: d };
          }
          return { category: '', diagnosis: d };
        });
        setDiagnoses(loadedDiagnoses);
      } else if (patient.diagnosis) {
        // Old format with single diagnosis
        const match = patient.diagnosis.match(/^(.+?) - (.+)$/);
        if (match) {
          setDiagnoses([{ category: match[1], diagnosis: patient.diagnosis }]);
        } else {
          setDiagnoses([{ category: patient.diagnosisCategory || '', diagnosis: patient.diagnosis }]);
        }
      } else {
        setDiagnoses([{ category: '', diagnosis: '' }]);
      }
      
      setVisitedDate(patient.visitedDate || (patient as any).admissionDate || '');
      setStatus(patient.status);
      setNotes(patient.notes || '');
      setReferringDoctor((patient as any).referringDoctor || '');
      setClinicBranch((patient as any).clinicBranch || '');
      setContactInfo(patient.contactInfo || { name: '', phone: '', email: '', address: '', relation: '' });
      setGovernorate((patient as any).governorate || '');
      setCity((patient as any).city || '');
      setFiles(patient.files || {});
      setSurgeries(patient.surgeries || []);
      setFollowUps(patient.followUps || []);
      
      // Initialize planned surgery
      if ((patient as any).plannedSurgery) {
        const ps = (patient as any).plannedSurgery;
        setPlannedSurgery({
          operationCategory: ps.operationCategory || '',
          operation: ps.operation || '',
          estimatedCost: ps.estimatedCost?.toString() || '',
          costCurrency: ps.costCurrency || 'EGP'
        });
        setPlannedSurgeryOperationCategory(ps.operationCategory || '');
      }
      
      // Initialize operation categories from existing surgeries
      const opCategories: { [key: number]: string } = {};
      (patient.surgeries || []).forEach((surgery, index) => {
        if (surgery.operation) {
          // Extract category from operation string (format: "Category - Operation")
          const match = surgery.operation.match(/^(.+?) - /);
          if (match) {
            opCategories[index] = match[1];
          }
        }
      });
      setSurgeryOperationCategories(opCategories);
    } else {
      setCode(generateCode());
      setVisitedDate(new Date().toISOString().split('T')[0]);
    }
  }, [patient, generateCode]);

  // Get subcategories for selected category
  const getSubcategories = (categoryName: string) => {
    const category = DIAGNOSIS_CATEGORIES.find(c => c.category === categoryName);
    return category?.subcategories || [];
  };

  // Add a new diagnosis entry
  const addDiagnosis = () => {
    setDiagnoses([...diagnoses, { category: '', diagnosis: '' }]);
  };

  // Update a diagnosis entry
  const updateDiagnosis = (index: number, field: 'category' | 'diagnosis', value: string) => {
    const updated = [...diagnoses];
    if (field === 'category') {
      updated[index] = { category: value, diagnosis: '' };
    } else {
      updated[index] = { ...updated[index], diagnosis: value };
    }
    setDiagnoses(updated);
  };

  // Remove a diagnosis entry
  const removeDiagnosis = (index: number) => {
    if (diagnoses.length > 1) {
      setDiagnoses(diagnoses.filter((_, i) => i !== index));
    }
  };

  // Get operation subcategories for a given operation category
  const getOperationSubcategories = (operationCategory: string) => {
    const category = OPERATION_CATEGORIES.find(c => c.category === operationCategory);
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
      costCurrency: 'EGP'
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

  // Calculate age from date of birth
  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    const diffMs = today.getTime() - birthDate.getTime();
    const ageDate = new Date(diffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + (ageDate.getUTCMonth() / 12) + (ageDate.getUTCDate() / 365);
  };

  // Get age display text (e.g., "2 years 3 months" or "6 months" or "15 days")
  const getAgeDisplay = (dob: string): string => {
    if (!dob) return '';
    const birthDate = new Date(dob);
    const today = new Date();
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();
    
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years > 0) {
      return months > 0 ? `${years} years ${months} months` : `${years} years`;
    } else if (months > 0) {
      return days > 0 ? `${months} months ${days} days` : `${months} months`;
    } else {
      return `${days} days`;
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    // Validate unique serial number
    if (!code.trim()) {
      newErrors.code = 'Serial number is required';
    } else {
      const isDuplicate = allPatients.some(p => p.code === code && p.id !== patient?.id);
      if (isDuplicate) {
        newErrors.code = 'This serial number is already in use. Please use a unique number.';
      }
    }
    
    if (!fullNameArabic.trim()) newErrors.fullNameArabic = t('form.fullNameAr') + ' ' + t('common.required');
    if (!dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    // Diagnosis is now optional
    if (!visitedDate) newErrors.visitedDate = t('form.visitedDate') + ' ' + t('common.required');
    if (!clinicBranch) newErrors.clinicBranch = 'Clinic branch is required';
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

      // Prepare surgeries with costs and photos - remove undefined values
      const finalSurgeries: SurgeryRecord[] = await Promise.all(
        surgeries
          .filter(surgery => surgery.date || surgery.type) // Only include surgeries with some data
          .map(async (surgery, index) => {
            const cleanSurgery: any = {
              date: surgery.date || '',
              type: surgery.type || '',
              surgeons: (surgery.surgeons || []).filter(s => s.name), // Only include surgeons with names
              notes: surgery.notes || ''
            };
            
            // Only add operation if it exists
            if (surgery.operation) {
              cleanSurgery.operation = surgery.operation;
            }
            
            // Only add cost if it's a valid number
            if (surgery.cost && !isNaN(Number(surgery.cost))) {
              cleanSurgery.cost = Number(surgery.cost);
              cleanSurgery.costCurrency = 'EGP'; // Always EGP
            }
            
            // Upload surgery photos
            const surgeryPhotoUrls: string[] = [];
            if (surgeryPhotos[index] && surgeryPhotos[index].length > 0) {
              for (const photoFile of surgeryPhotos[index]) {
                const photoUrl = await FirebaseService.uploadPatientFile(code, photoFile, `surgery-${index}-photos`);
                surgeryPhotoUrls.push(photoUrl);
              }
              cleanSurgery.photos = surgeryPhotoUrls;
            }
            
            // Keep existing photos if editing
            if ((surgery as any).photos && (surgery as any).photos.length > 0) {
              cleanSurgery.photos = [...((surgery as any).photos || []), ...surgeryPhotoUrls];
            }
            
            return cleanSurgery as SurgeryRecord;
          })
      );

      // Calculate age from date of birth
      const calculatedAge = calculateAge(dateOfBirth);
      
      // Process multiple diagnoses
      const validDiagnoses = diagnoses
        .filter(d => d.diagnosis.trim())
        .map(d => d.diagnosis.trim());
      const primaryDiagnosis = validDiagnoses[0] || 'Undiagnosed';
      const primaryCategory = diagnoses[0]?.category || '';
      
      const patientData: Omit<Patient, 'id'> = {
        code,
        fullNameArabic: fullNameArabic.trim(),
        age: calculatedAge,
        gender,
        diagnosis: primaryDiagnosis, // Primary diagnosis for backward compatibility
        visitedDate,
        status,
        notes: notes.trim(),
        createdAt: patient?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add multiple diagnoses
      if (validDiagnoses.length > 0) {
        (patientData as any).diagnoses = validDiagnoses;
        (patientData as any).diagnosisCategories = diagnoses
          .filter(d => d.diagnosis.trim())
          .map(d => d.category);
      }
      
      // Add date of birth and location info
      (patientData as any).dateOfBirth = dateOfBirth;
      if (weight) (patientData as any).weight = Number(weight);
      if (governorate) (patientData as any).governorate = governorate;
      if (city) (patientData as any).city = city;
      if (referringDoctor) (patientData as any).referringDoctor = referringDoctor;
      if (clinicBranch) (patientData as any).clinicBranch = clinicBranch;
      
      // Only add optional fields if they have values
      if (primaryCategory) {
        patientData.diagnosisCategory = primaryCategory;
      }
      if (contactInfo.name || contactInfo.phone) {
        patientData.contactInfo = contactInfo;
      }
      if (finalSurgeries.length > 0) {
        patientData.surgeries = finalSurgeries;
      }
      
      // Process follow-ups with photos
      if (followUps.length > 0) {
        const finalFollowUps = await Promise.all(
          followUps.map(async (followUp, index) => {
            const cleanFollowUp: any = {
              number: followUp.number,
              date: followUp.date,
              notes: followUp.notes
            };
            
            // Upload follow-up photos
            const followUpPhotoUrls: string[] = [];
            if (followUpPhotos[index] && followUpPhotos[index].length > 0) {
              for (const photoFile of followUpPhotos[index]) {
                const photoUrl = await FirebaseService.uploadPatientFile(code, photoFile, `followup-${index}-photos`);
                followUpPhotoUrls.push(photoUrl);
              }
              cleanFollowUp.photos = followUpPhotoUrls;
            }
            
            // Keep existing photos if editing
            if ((followUp as any).photos && (followUp as any).photos.length > 0) {
              cleanFollowUp.photos = [...((followUp as any).photos || []), ...followUpPhotoUrls];
            }
            
            return cleanFollowUp;
          })
        );
        patientData.followUps = finalFollowUps;
      }
      
      // Add planned surgery if any field is filled
      if (plannedSurgery.operation || plannedSurgery.estimatedCost) {
        const ps: any = {};
        if (plannedSurgery.operationCategory) ps.operationCategory = plannedSurgery.operationCategory;
        if (plannedSurgery.operation) ps.operation = plannedSurgery.operation;
        if (plannedSurgery.estimatedCost) ps.estimatedCost = Number(plannedSurgery.estimatedCost);
        ps.costCurrency = 'EGP'; // Always EGP
        (patientData as any).plannedSurgery = ps;
      }
      
      if (Object.keys(uploadedFiles).length > 0) {
        patientData.files = uploadedFiles;
      }

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

          {/* Patient Registration (Reception/Assistant) - Collapsible */}
          <CollapsibleSection 
            title="Patient Registration" 
            icon={<User style={{ width: '20px', height: '20px', color: '#17a2b8' }} />}
            defaultOpen={true}
          >
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t('patients.patientCode')} / Serial Number *</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`form-input ${errors.code ? 'error' : ''}`}
                  placeholder="Enter unique patient serial number"
                />
                {errors.code && <span className="error-message">{errors.code}</span>}
                <span style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                  Must be unique for each patient
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">Clinic Branch *</label>
                <select
                  value={clinicBranch}
                  onChange={(e) => setClinicBranch(e.target.value as 'Cairo Clinic' | 'Mansoura Clinic')}
                  className={`form-select ${errors.clinicBranch ? 'error' : ''}`}
                >
                  <option value="">Select Clinic Branch</option>
                  <option value="Cairo Clinic">Cairo Clinic</option>
                  <option value="Mansoura Clinic">Mansoura Clinic</option>
                </select>
                {errors.clinicBranch && <span className="error-message">{errors.clinicBranch}</span>}
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
                <label className="form-label">Date of Birth *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                  max={new Date().toISOString().split('T')[0]} // Can't be in the future
                />
                {dateOfBirth && (
                  <span style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                    Current age: {getAgeDisplay(dateOfBirth)}
                  </span>
                )}
                {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
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
              <div className="form-group">
                <label className="form-label">Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="form-input"
                  placeholder="Enter weight in kg"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Referring Doctor</label>
                <input
                  type="text"
                  value={referringDoctor}
                  onChange={(e) => setReferringDoctor(e.target.value)}
                  className="form-input"
                  placeholder="Enter referring doctor's name"
                />
              </div>
            </div>

            {/* Contact Information - Inline in registration */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
              <h4 style={{ marginBottom: '1rem', color: '#555', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone style={{ width: '18px', height: '18px', color: '#dc3545' }} />
                Contact Information
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('form.phone')}</label>
                  <input
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="form-input"
                    placeholder="01012345678"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('form.relation')}</label>
                  <select
                    value={contactInfo.relation}
                    onChange={(e) => setContactInfo({ ...contactInfo, relation: e.target.value })}
                    className="form-select"
                  >
                    <option value="">Select Relation</option>
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Brother">Brother</option>
                    <option value="Sister">Sister</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Son">Son</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Guardian">Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('form.contactName')}</label>
                  <input
                    type="text"
                    value={contactInfo.name}
                    onChange={(e) => setContactInfo({ ...contactInfo, name: e.target.value })}
                    className="form-input"
                    placeholder="Contact person name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Governorate</label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Select Governorate</option>
                    <option value="Cairo">Cairo</option>
                    <option value="Alexandria">Alexandria</option>
                    <option value="Giza">Giza</option>
                    <option value="Qalyubia">Qalyubia</option>
                    <option value="Port Said">Port Said</option>
                    <option value="Suez">Suez</option>
                    <option value="Luxor">Luxor</option>
                    <option value="Aswan">Aswan</option>
                    <option value="Asyut">Asyut</option>
                    <option value="Beheira">Beheira</option>
                    <option value="Beni Suef">Beni Suef</option>
                    <option value="Dakahlia">Dakahlia</option>
                    <option value="Damietta">Damietta</option>
                    <option value="Faiyum">Faiyum</option>
                    <option value="Gharbia">Gharbia</option>
                    <option value="Ismailia">Ismailia</option>
                    <option value="Kafr El Sheikh">Kafr El Sheikh</option>
                    <option value="Matruh">Matruh</option>
                    <option value="Minya">Minya</option>
                    <option value="Monufia">Monufia</option>
                    <option value="New Valley">New Valley</option>
                    <option value="North Sinai">North Sinai</option>
                    <option value="Qena">Qena</option>
                    <option value="Red Sea">Red Sea</option>
                    <option value="Sharqia">Sharqia</option>
                    <option value="Sohag">Sohag</option>
                    <option value="South Sinai">South Sinai</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="form-input"
                    placeholder="Enter city name"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Clinical Information (Doctor fills) */}
          <CollapsibleSection 
            title="Clinical Information" 
            icon={<Stethoscope style={{ width: '20px', height: '20px', color: '#6f42c1' }} />}
            defaultOpen={true}
          >
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
                  onChange={(e) => setStatus(e.target.value as 'Diagnosed' | 'Pre-op' | 'Op' | 'Post-op')}
                  className="form-select"
                >
                  <option value="Diagnosed">{t('status.diagnosed')}</option>
                  <option value="Pre-op">{t('status.preOp')}</option>
                  <option value="Op">Op</option>
                  <option value="Post-op">{t('status.postOp')}</option>
                </select>
              </div>
            </div>

            {/* Multiple Diagnoses */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>{t('form.diagnosis')} (Multiple allowed)</label>
                <button type="button" onClick={addDiagnosis} className="btn btn-sm btn-secondary">
                  <Plus style={{ width: '14px', height: '14px' }} />
                  Add Diagnosis
                </button>
              </div>
              
              {diagnoses.map((diagEntry, index) => (
                <div key={index} style={{ 
                  marginBottom: '0.75rem', 
                  padding: '0.75rem', 
                  background: index === 0 ? '#e8f4f8' : '#f8f9fa', 
                  borderRadius: '8px',
                  border: index === 0 ? '2px solid #17a2b8' : '1px solid #e0e0e0'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666', fontWeight: '600' }}>
                      {index === 0 ? 'Primary Diagnosis' : `Diagnosis ${index + 1}`}
                    </span>
                    {diagnoses.length > 1 && (
                      <button type="button" onClick={() => removeDiagnosis(index)} className="btn btn-sm btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
                        <Trash2 style={{ width: '12px', height: '12px' }} />
                      </button>
                    )}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">{t('form.diagnosisCategory')}</label>
                      <select
                        value={diagEntry.category}
                        onChange={(e) => updateDiagnosis(index, 'category', e.target.value)}
                        className="form-select"
                      >
                        <option value="">{t('form.selectCategory')}</option>
                        {DIAGNOSIS_CATEGORIES.map(cat => (
                          <option key={cat.category} value={cat.category}>{cat.category}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t('form.diagnosis')}</label>
                      {diagEntry.category === 'Other' ? (
                        <input
                          type="text"
                          value={diagEntry.diagnosis.replace('Other - ', '')}
                          onChange={(e) => updateDiagnosis(index, 'diagnosis', e.target.value ? `Other - ${e.target.value}` : '')}
                          className="form-input"
                          placeholder="Enter custom diagnosis..."
                        />
                      ) : (
                        <select
                          value={diagEntry.diagnosis}
                          onChange={(e) => updateDiagnosis(index, 'diagnosis', e.target.value)}
                          className="form-select"
                          disabled={!diagEntry.category}
                        >
                          <option value="">Select diagnosis category first</option>
                          {diagEntry.category && getSubcategories(diagEntry.category).map(sub => (
                            <option key={sub} value={`${diagEntry.category} - ${sub}`}>
                              {sub}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <span style={{ fontSize: '0.875rem', color: '#666', display: 'block' }}>
                Optional - Leave empty for undiagnosed patients. Add multiple diagnoses if needed.
              </span>
            </div>

            {/* Planned Surgery - Inline in clinical info */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '2px solid #e0e0e0' }}>
              <h4 style={{ marginBottom: '1rem', color: '#555', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ width: '18px', height: '18px', color: '#6f42c1' }} />
                Planned Surgery
              </h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Operation Category</label>
                  <select
                    value={plannedSurgeryOperationCategory}
                    onChange={(e) => {
                      setPlannedSurgeryOperationCategory(e.target.value);
                      setPlannedSurgery({ ...plannedSurgery, operationCategory: e.target.value, operation: '' });
                    }}
                    className="form-select"
                  >
                    <option value="">Select Operation Category</option>
                    {OPERATION_CATEGORIES.map(cat => (
                      <option key={cat.category} value={cat.category}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Planned Operation</label>
                  {plannedSurgeryOperationCategory === 'Other' ? (
                    <input
                      type="text"
                      value={(plannedSurgery.operation || '').replace('Other - ', '')}
                      onChange={(e) => setPlannedSurgery({ ...plannedSurgery, operation: e.target.value ? `Other - ${e.target.value}` : '' })}
                      className="form-input"
                      placeholder="Enter custom operation..."
                    />
                  ) : (
                    <select
                      value={plannedSurgery.operation || ''}
                      onChange={(e) => setPlannedSurgery({ ...plannedSurgery, operation: e.target.value })}
                      className="form-select"
                      disabled={!plannedSurgeryOperationCategory}
                    >
                      <option value="">Select Operation</option>
                      {plannedSurgeryOperationCategory && getOperationSubcategories(plannedSurgeryOperationCategory).map(sub => (
                        <option key={sub} value={`${plannedSurgeryOperationCategory} - ${sub}`}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {canViewFinancial && (
                <div className="form-group">
                  <label className="form-label">Estimated Cost (EGP)</label>
                  <input
                    type="number"
                    value={plannedSurgery.estimatedCost || ''}
                    onChange={(e) => setPlannedSurgery({ ...plannedSurgery, estimatedCost: e.target.value })}
                    className="form-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}
            </div>

            {/* Notes - Single field for all clinical notes */}
            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label className="form-label">{t('form.notes')}</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="form-input"
                placeholder="Clinical notes, observations, planned surgery notes, etc."
                rows={4}
              />
            </div>
          </CollapsibleSection>


          {/* Files - Unified Upload Section */}
          <CollapsibleSection 
            title="Patient Files & Images" 
            icon={<ImageIcon style={{ width: '20px', height: '20px', color: '#0066cc' }} />}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '1rem'
            }}>
              {/* Personal Image */}
              <div onClick={() => setActiveUploadTarget('personal')} style={{ 
                padding: '1.25rem', 
                background: 'linear-gradient(135deg, #0066cc 0%, #004c99 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0, 102, 204, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 102, 204, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 102, 204, 0.2)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <ImageIcon style={{ width: '24px', height: '24px', color: '#fff', marginRight: '0.75rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    {t('form.personalImage') || 'Personal Image'}
                  </h3>
                </div>
                
                {files.personalImage && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img
                      src={files.personalImage}
                      alt="Personal"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '12px', 
                        border: '3px solid #fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)' 
                      }}
                    />
                  </div>
                )}
                
                <label className="file-upload-button" style={{ 
                  background: '#fff', 
                  color: '#0066cc',
                  border: 'none',
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span className="file-upload-label">
                    <ImageIcon style={{ width: '18px', height: '18px' }} />
                    <span>Upload image / file</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handlePersonalImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {fileErrors.personalImage && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ⚠️ {fileErrors.personalImage}
                  </div>
                )}
                {personalImageFile && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ {personalImageFile.name} ({formatFileSize(personalImageFile.size)})
                  </div>
                )}
              </div>

              {/* Patient Sheet Image */}
              <div onClick={() => setActiveUploadTarget('surgery')} style={{ 
                padding: '1.25rem', 
                background: 'linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(111, 66, 193, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(111, 66, 193, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(111, 66, 193, 0.2)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#fff', marginRight: '0.75rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    Patient Sheet Image
                  </h3>
                </div>
                
                {files.surgeryImage && (
                  <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                    <img
                      src={files.surgeryImage}
                      alt="Surgery"
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '12px', 
                        border: '3px solid #fff',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.2)' 
                      }}
                    />
                  </div>
                )}
                
                <label className="file-upload-button" style={{ 
                  background: '#fff', 
                  color: '#6f42c1',
                  border: 'none',
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span className="file-upload-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    <span>Upload image / file</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSurgeryImageChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {fileErrors.surgeryImage && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ⚠️ {fileErrors.surgeryImage}
                  </div>
                )}
                {surgeryImageFile && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ {surgeryImageFile.name} ({formatFileSize(surgeryImageFile.size)})
                  </div>
                )}
              </div>

              {/* Radiology Files */}
              <div onClick={() => setActiveUploadTarget('radiology')} style={{ 
                padding: '1.25rem', 
                background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(108, 117, 125, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(108, 117, 125, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(108, 117, 125, 0.2)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#fff', marginRight: '0.75rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    {t('form.radiologyFiles') || 'X-Ray / Radiology'}
                  </h3>
                </div>
                
                <label className="file-upload-button" style={{ 
                  background: '#fff', 
                  color: '#6c757d',
                  border: 'none',
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span className="file-upload-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    <span>Upload image / file</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={handleRadiologyFilesChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {fileErrors.radiology && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ⚠️ {fileErrors.radiology}
                  </div>
                )}
                {radiologyFiles.length > 0 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ {radiologyFiles.length} {t('form.filesSelected') || 'files'} ({radiologyFiles.reduce((sum, f) => sum + f.size, 0) > 0 ? formatFileSize(radiologyFiles.reduce((sum, f) => sum + f.size, 0)) : ''})
                  </div>
                )}
              </div>

              {/* Lab Files */}
              <div onClick={() => setActiveUploadTarget('lab')} style={{ 
                padding: '1.25rem', 
                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(23, 162, 184, 0.2)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.2)';
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <FileText style={{ width: '24px', height: '24px', color: '#fff', marginRight: '0.75rem' }} />
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600', color: '#fff' }}>
                    {t('form.labFiles') || 'Lab Results'}
                  </h3>
                </div>
                
                <label className="file-upload-button" style={{ 
                  background: '#fff', 
                  color: '#17a2b8',
                  border: 'none',
                  marginTop: '1rem',
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}>
                  <span className="file-upload-label">
                    <FileText style={{ width: '18px', height: '18px' }} />
                    <span>Upload image / file</span>
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                    multiple
                    onChange={handleLabFilesChange}
                    style={{ display: 'none' }}
                  />
                </label>
                
                {fileErrors.lab && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ⚠️ {fileErrors.lab}
                  </div>
                )}
                {labFiles.length > 0 && (
                  <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: '#fff', background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '6px' }}>
                    ✓ {labFiles.length} {t('form.filesSelected') || 'files'} ({labFiles.reduce((sum, f) => sum + f.size, 0) > 0 ? formatFileSize(labFiles.reduce((sum, f) => sum + f.size, 0)) : ''})
                  </div>
                )}
              </div>
            </div>
          </CollapsibleSection>


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
                
                {/* Operation Category and Operation Selection */}
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Operation Category</label>
                    <select
                      value={surgeryOperationCategories[index] || ''}
                      onChange={(e) => {
                        const newCategory = e.target.value;
                        setSurgeryOperationCategories({
                          ...surgeryOperationCategories,
                          [index]: newCategory
                        });
                        // Reset operation when category changes
                        updateSurgery(index, 'operation', '');
                      }}
                      className="form-select"
                    >
                      <option value="">Select Operation Category</option>
                      {OPERATION_CATEGORIES.map(cat => (
                        <option key={cat.category} value={cat.category}>
                          {cat.category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Operation</label>
                    {surgeryOperationCategories[index] === 'Other' ? (
                      <input
                        type="text"
                        value={(surgery.operation || '').replace('Other - ', '')}
                        onChange={(e) => updateSurgery(index, 'operation', e.target.value ? `Other - ${e.target.value}` : '')}
                        className="form-input"
                        placeholder="Enter custom operation..."
                      />
                    ) : surgeryOperationCategories[index] ? (
                      <select
                        value={surgery.operation || ''}
                        onChange={(e) => updateSurgery(index, 'operation', e.target.value)}
                        className="form-select"
                      >
                        <option value="">Select Operation</option>
                        {getOperationSubcategories(surgeryOperationCategories[index]).map(sub => (
                          <option key={sub} value={`${surgeryOperationCategories[index]} - ${sub}`}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={surgery.operation || ''}
                        onChange={(e) => updateSurgery(index, 'operation', e.target.value)}
                        className="form-input"
                        placeholder="Enter operation or select category first"
                      />
                    )}
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
                
                {/* Surgery Photos */}
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>Surgery Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        const existingFiles = surgeryPhotos[index] || [];
                        setSurgeryPhotos({ ...surgeryPhotos, [index]: [...existingFiles, ...newFiles] });
                        e.target.value = ''; // Reset input to allow selecting the same files again
                      }
                    }}
                    className="form-input"
                    style={{ 
                      padding: '0.75rem',
                      border: '2px dashed #e83e8c',
                      background: '#fff5f9',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                    Click to add more surgery photos (Before/After, During surgery, etc.)
                  </span>
                  {surgeryPhotos[index] && surgeryPhotos[index].length > 0 && (
                    <div style={{ 
                      marginTop: '0.75rem', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                      gap: '0.5rem' 
                    }}>
                      {surgeryPhotos[index].map((file, fIndex) => (
                        <div key={fIndex} style={{ position: 'relative', width: '100%', paddingTop: '100%', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e83e8c' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Surgery ${index + 1} photo ${fIndex + 1}`}
                            style={{ 
                              position: 'absolute', 
                              top: 0, 
                              left: 0, 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover' 
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = [...surgeryPhotos[index]];
                              newPhotos.splice(fIndex, 1);
                              setSurgeryPhotos({ ...surgeryPhotos, [index]: newPhotos });
                            }}
                            style={{
                              position: 'absolute',
                              top: '5px',
                              right: '5px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px',
                              fontWeight: 'bold',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(surgery as any).photos && (surgery as any).photos.length > 0 && (
                    <div style={{ marginTop: '0.75rem' }}>
                      <span style={{ fontSize: '0.875rem', color: '#666', fontWeight: '600', display: 'block', marginBottom: '0.5rem' }}>
                        Existing photos:
                      </span>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
                        gap: '0.5rem' 
                      }}>
                        {(surgery as any).photos.map((photoUrl: string, pIndex: number) => (
                          <div key={pIndex} style={{ width: '100%', paddingTop: '100%', position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #28a745' }}>
                            <img
                              src={photoUrl}
                              alt={`Existing surgery photo ${pIndex + 1}`}
                              style={{ 
                                position: 'absolute', 
                                top: 0, 
                                left: 0, 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover', 
                                cursor: 'pointer' 
                              }}
                              onClick={() => window.open(photoUrl, '_blank')}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    <label className="form-label">{t('form.surgeryCost')} (EGP)</label>
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
                
                {/* Follow-up Photos */}
                <div className="form-group">
                  <label className="form-label">Follow-up Photos</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        const newFiles = Array.from(e.target.files);
                        const existingFiles = followUpPhotos[index] || [];
                        setFollowUpPhotos({ ...followUpPhotos, [index]: [...existingFiles, ...newFiles] });
                        e.target.value = ''; // Reset input to allow selecting the same files again
                      }
                    }}
                    className="form-input"
                    style={{ 
                      padding: '0.75rem',
                      border: '2px dashed #17a2b8',
                      background: '#f0f9ff',
                      cursor: 'pointer',
                      borderRadius: '8px'
                    }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem', display: 'block' }}>
                    Click to add more follow-up photos
                  </span>
                  {followUpPhotos[index] && followUpPhotos[index].length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {followUpPhotos[index].map((file, fIndex) => (
                        <div key={fIndex} style={{ position: 'relative', width: '80px', height: '80px' }}>
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Follow-up ${index + 1} photo ${fIndex + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPhotos = [...followUpPhotos[index]];
                              newPhotos.splice(fIndex, 1);
                              setFollowUpPhotos({ ...followUpPhotos, [index]: newPhotos });
                            }}
                            style={{
                              position: 'absolute',
                              top: '-5px',
                              right: '-5px',
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {(followUp as any).photos && (followUp as any).photos.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.875rem', color: '#666', width: '100%' }}>Existing photos:</span>
                      {(followUp as any).photos.map((photoUrl: string, pIndex: number) => (
                        <div key={pIndex} style={{ width: '80px', height: '80px' }}>
                          <img
                            src={photoUrl}
                            alt={`Existing follow-up photo ${pIndex + 1}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => window.open(photoUrl, '_blank')}
                          />
                        </div>
                      ))}
                    </div>
                  )}
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


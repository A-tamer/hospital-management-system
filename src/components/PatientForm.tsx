import React, { useState, useEffect } from 'react';
import { X, Save, User, Calendar, Phone, Heart, Image as ImageIcon } from 'lucide-react';
import { useFirebaseOperations } from '../hooks/useFirebaseOperations';
import { Patient } from '../types';
import { FirebaseService } from '../services/firebaseService';

interface PatientFormProps {
  patient?: Patient | null;
  onClose: () => void;
  generateCode: () => string;
}

const PatientForm: React.FC<PatientFormProps> = ({ patient, onClose, generateCode }) => {
  const { addPatient, updatePatient, isLoading, error } = useFirebaseOperations();
  const [formData, setFormData] = useState({
    code: '',
    fullName: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    diagnosis: '',
    admissionDate: '',
    dischargeDate: '',
    status: 'Active' as 'Active' | 'Recovered' | 'Inactive',
    notes: '',
    fatherName: '',
    fatherPhone: '',
    motherName: '',
    motherPhone: '',
    emergencyName: '',
    emergencyRelation: '',
    emergencyPhone: '',
    surgeryDate: '',
    surgeryType: '',
    surgeon: '',
    surgeryNotes: '',
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (patient) {
      setFormData({
        code: patient.code,
        fullName: patient.fullName,
        age: patient.age.toString(),
        gender: patient.gender,
        diagnosis: patient.diagnosis,
        admissionDate: patient.admissionDate,
        dischargeDate: patient.dischargeDate || '',
        status: patient.status,
        notes: patient.notes || '',
        fatherName: patient.parents?.fatherName || '',
        fatherPhone: patient.parents?.fatherPhone || '',
        motherName: patient.parents?.motherName || '',
        motherPhone: patient.parents?.motherPhone || '',
        emergencyName: patient.emergencyContact?.name || '',
        emergencyRelation: patient.emergencyContact?.relation || '',
        emergencyPhone: patient.emergencyContact?.phone || '',
        surgeryDate: patient.surgeries && patient.surgeries.length > 0 ? patient.surgeries[0].date : '',
        surgeryType: patient.surgeries && patient.surgeries.length > 0 ? patient.surgeries[0].type : '',
        surgeon: patient.surgeries && patient.surgeries.length > 0 ? patient.surgeries[0].surgeon || '' : '',
        surgeryNotes: patient.surgeries && patient.surgeries.length > 0 ? patient.surgeries[0].notes || '' : '',
      });
      if (patient.photoUrl) {
        setPhotoPreview(patient.photoUrl);
      }
    } else {
      setFormData({
        code: generateCode(),
        fullName: '',
        age: '',
        gender: 'Male',
        diagnosis: '',
        admissionDate: new Date().toISOString().split('T')[0],
        dischargeDate: '',
        status: 'Active',
        notes: '',
        fatherName: '',
        fatherPhone: '',
        motherName: '',
        motherPhone: '',
        emergencyName: '',
        emergencyRelation: '',
        emergencyPhone: '',
        surgeryDate: '',
        surgeryType: '',
        surgeon: '',
        surgeryNotes: '',
      });
      setPhotoPreview(null);
    }
  }, [patient, generateCode]);

  useEffect(() => {
    if (photoFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(photoFile);
    }
  }, [photoFile]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) < 0) {
      newErrors.age = 'Please enter a valid age';
    }

    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }

    if (!formData.admissionDate) {
      newErrors.admissionDate = 'Admission date is required';
    }

    if (formData.dischargeDate && formData.admissionDate) {
      const admissionDate = new Date(formData.admissionDate);
      const dischargeDate = new Date(formData.dischargeDate);
      if (dischargeDate < admissionDate) {
        newErrors.dischargeDate = 'Discharge date cannot be before admission date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setUploading(true);
    try {
      // Upload files first (if provided) - handle each upload separately with error handling
      let photoUrl = patient?.photoUrl;
      let xrayUrl = patient?.xrayUrl;
      let medicalFileUrl = patient?.medicalFileUrl;

      if (photoFile) {
        try {
          console.log('Uploading photo...');
          photoUrl = await FirebaseService.uploadPatientFile(formData.code, photoFile, 'photos');
          console.log('Photo uploaded successfully:', photoUrl);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          alert('Failed to upload photo. Please try again or continue without it.');
        }
      }

      if (xrayFile) {
        try {
          console.log('Uploading x-ray...');
          xrayUrl = await FirebaseService.uploadPatientFile(formData.code, xrayFile, 'xrays');
          console.log('X-ray uploaded successfully:', xrayUrl);
        } catch (uploadError) {
          console.error('Error uploading x-ray:', uploadError);
          alert('Failed to upload x-ray. Please try again or continue without it.');
        }
      }

      if (medicalFile) {
        try {
          console.log('Uploading medical file...');
          medicalFileUrl = await FirebaseService.uploadPatientFile(formData.code, medicalFile, 'files');
          console.log('Medical file uploaded successfully:', medicalFileUrl);
        } catch (uploadError) {
          console.error('Error uploading medical file:', uploadError);
          alert('Failed to upload medical file. Please try again or continue without it.');
        }
      }

      const surgeries = formData.surgeryDate && formData.surgeryType ? [{
        date: formData.surgeryDate,
        type: formData.surgeryType,
        surgeon: formData.surgeon || undefined,
        notes: formData.surgeryNotes || undefined,
      }] : undefined;

      const patientData: Omit<Patient, 'id'> = {
        code: formData.code,
        fullName: formData.fullName.trim(),
        age: Number(formData.age),
        gender: formData.gender,
        diagnosis: formData.diagnosis.trim(),
        admissionDate: formData.admissionDate,
        dischargeDate: formData.dischargeDate || undefined,
        status: formData.status,
        notes: formData.notes?.trim() || '',
        createdAt: patient?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoUrl,
        xrayUrl,
        medicalFileUrl,
        parents: (formData.fatherName || formData.motherName) ? {
          fatherName: formData.fatherName || undefined,
          fatherPhone: formData.fatherPhone || undefined,
          motherName: formData.motherName || undefined,
          motherPhone: formData.motherPhone || undefined,
        } : undefined,
        emergencyContact: (formData.emergencyName || formData.emergencyPhone) ? {
          name: formData.emergencyName,
          relation: formData.emergencyRelation,
          phone: formData.emergencyPhone,
        } : undefined,
        surgeries,
      };

      console.log('Saving patient data...');
      if (patient) {
        await updatePatient(patient.id, patientData);
      } else {
        await addPatient(patientData);
      }

      console.log('Patient saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient. Please check the console for details.');
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ overflow: 'auto' }}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%', maxHeight: '95vh', overflow: 'auto' }}>
        <div className="modal-header" style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
          <h2 className="modal-title">
            {patient ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="patient-form" style={{ padding: '1.5rem' }}>
          {error && (
            <div className="error-message" style={{ marginBottom: '1rem', padding: '0.75rem', background: '#fee', border: '1px solid #fcc', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {/* Basic Information Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <User style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#007bff' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Basic Information</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Patient Code</label>
                <input
                  type="text"
                  value={formData.code}
                  className="form-input"
                  disabled
                  style={{ background: '#e9ecef', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.fullName && <span className="error-message" style={{ fontSize: '0.875rem', color: '#dc3545' }}>{errors.fullName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className={`form-input ${errors.age ? 'error' : ''}`}
                  placeholder="Enter age"
                  min="0"
                  max="150"
                />
                {errors.age && <span className="error-message" style={{ fontSize: '0.875rem', color: '#dc3545' }}>{errors.age}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="form-select"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Diagnosis *</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={(e) => handleInputChange('diagnosis', e.target.value)}
                className={`form-input ${errors.diagnosis ? 'error' : ''}`}
                placeholder="Enter diagnosis"
              />
              {errors.diagnosis && <span className="error-message" style={{ fontSize: '0.875rem', color: '#dc3545' }}>{errors.diagnosis}</span>}
            </div>
          </div>

          {/* Dates & Status Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Calendar style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#28a745' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Dates & Status</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Admission Date *</label>
                <input
                  type="date"
                  value={formData.admissionDate}
                  onChange={(e) => handleInputChange('admissionDate', e.target.value)}
                  className={`form-input ${errors.admissionDate ? 'error' : ''}`}
                />
                {errors.admissionDate && <span className="error-message" style={{ fontSize: '0.875rem', color: '#dc3545' }}>{errors.admissionDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Discharge Date</label>
                <input
                  type="date"
                  value={formData.dischargeDate}
                  onChange={(e) => handleInputChange('dischargeDate', e.target.value)}
                  className={`form-input ${errors.dischargeDate ? 'error' : ''}`}
                />
                {errors.dischargeDate && <span className="error-message" style={{ fontSize: '0.875rem', color: '#dc3545' }}>{errors.dischargeDate}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="form-select"
                >
                  <option value="Active">Active</option>
                  <option value="Recovered">Recovered</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Medical Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="form-input"
                placeholder="Additional notes (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Files & Images Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <ImageIcon style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#17a2b8' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Files & Images</h3>
            </div>
            
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Personal Photo</label>
                {photoPreview && (
                  <div style={{ marginBottom: '0.5rem', textAlign: 'center' }}>
                    <img src={photoPreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #ddd' }} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setPhotoFile(file);
                  }}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">X-ray Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setXrayFile(e.target.files?.[0] || null)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Medical File</label>
                <input
                  type="file"
                  onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Parents Information Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <User style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#ffc107' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Parents Information</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Father Name</label>
                <input
                  type="text"
                  value={formData.fatherName}
                  onChange={(e) => handleInputChange('fatherName', e.target.value)}
                  className="form-input"
                  placeholder="Enter father name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Father Phone</label>
                <input
                  type="tel"
                  value={formData.fatherPhone}
                  onChange={(e) => handleInputChange('fatherPhone', e.target.value)}
                  className="form-input"
                  placeholder="Enter father phone"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Mother Name</label>
                <input
                  type="text"
                  value={formData.motherName}
                  onChange={(e) => handleInputChange('motherName', e.target.value)}
                  className="form-input"
                  placeholder="Enter mother name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mother Phone</label>
                <input
                  type="tel"
                  value={formData.motherPhone}
                  onChange={(e) => handleInputChange('motherPhone', e.target.value)}
                  className="form-input"
                  placeholder="Enter mother phone"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Phone style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#dc3545' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Emergency Contact</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.emergencyName}
                  onChange={(e) => handleInputChange('emergencyName', e.target.value)}
                  className="form-input"
                  placeholder="Enter contact name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Relation</label>
                <input
                  type="text"
                  value={formData.emergencyRelation}
                  onChange={(e) => handleInputChange('emergencyRelation', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Parent, Spouse, Sibling"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  className="form-input"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>

          {/* Surgery Details Section */}
          <div className="form-section" style={{ 
            background: '#f8f9fa', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            marginBottom: '1.5rem',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <Heart style={{ width: '20px', height: '20px', marginRight: '0.5rem', color: '#e83e8c' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#333', margin: 0 }}>Surgery Details</h3>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Surgery Date</label>
                <input
                  type="date"
                  value={formData.surgeryDate}
                  onChange={(e) => handleInputChange('surgeryDate', e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Surgery Type</label>
                <input
                  type="text"
                  value={formData.surgeryType}
                  onChange={(e) => handleInputChange('surgeryType', e.target.value)}
                  className="form-input"
                  placeholder="e.g., Appendectomy, Heart Surgery"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Surgeon</label>
                <input
                  type="text"
                  value={formData.surgeon}
                  onChange={(e) => handleInputChange('surgeon', e.target.value)}
                  className="form-input"
                  placeholder="Surgeon name"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Surgery Notes</label>
              <textarea
                value={formData.surgeryNotes}
                onChange={(e) => handleInputChange('surgeryNotes', e.target.value)}
                className="form-input"
                placeholder="Additional surgery notes"
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions" style={{ 
            position: 'sticky', 
            bottom: 0, 
            background: 'white', 
            paddingTop: '1rem', 
            borderTop: '2px solid #e0e0e0',
            marginTop: '1rem',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem'
          }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isLoading || uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading || uploading}>
              <Save className="btn-icon" />
              {uploading ? 'Uploading files...' : isLoading ? 'Saving...' : (patient ? 'Update Patient' : 'Add Patient')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientForm;

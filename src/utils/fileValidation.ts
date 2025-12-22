// src/utils/fileValidation.ts

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB for images
  PDF: 10 * 1024 * 1024,   // 10MB for PDFs
  GENERAL: 10 * 1024 * 1024 // 10MB default
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  PDF: ['application/pdf'],
  ALL: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf']
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, maxSize: number = FILE_SIZE_LIMITS.GENERAL): FileValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`
    };
  }
  return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[] = ALLOWED_FILE_TYPES.ALL): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): FileValidationResult {
  // Check file type
  const typeCheck = validateFileType(file, ALLOWED_FILE_TYPES.IMAGE);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check file size
  const sizeCheck = validateFileSize(file, FILE_SIZE_LIMITS.IMAGE);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }

  return { valid: true };
}

/**
 * Validate PDF file
 */
export function validatePdfFile(file: File): FileValidationResult {
  // Check file type
  const typeCheck = validateFileType(file, ALLOWED_FILE_TYPES.PDF);
  if (!typeCheck.valid) {
    return typeCheck;
  }

  // Check file size
  const sizeCheck = validateFileSize(file, FILE_SIZE_LIMITS.PDF);
  if (!sizeCheck.valid) {
    return sizeCheck;
  }

  return { valid: true };
}

/**
 * Validate file based on folder type
 */
export function validateFileForFolder(file: File, folder: string): FileValidationResult {
  // Personal images and surgery images should be images
  if (folder === 'personal-images' || folder === 'surgery-images' || folder === 'personalImage' || folder === 'surgeryImage') {
    return validateImageFile(file);
  }

  // Radiology and lab files can be PDFs or images
  if (folder === 'radiology' || folder === 'lab') {
    const typeCheck = validateFileType(file, [...ALLOWED_FILE_TYPES.IMAGE, ...ALLOWED_FILE_TYPES.PDF]);
    if (!typeCheck.valid) {
      return typeCheck;
    }
    return validateFileSize(file, FILE_SIZE_LIMITS.GENERAL);
  }

  // Default validation for other folders
  return validateFileType(file);
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}




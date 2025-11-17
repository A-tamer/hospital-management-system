// API Service for SQL Backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // Patient methods
  async getPatients() {
    return this.request<any[]>('/patients');
  }

  async getPatient(id: string) {
    return this.request<any>(`/patients/${id}`);
  }

  async createPatient(patient: any) {
    return this.request<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  }

  async updatePatient(id: string, patient: any) {
    return this.request<any>(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patient),
    });
  }

  async deletePatient(id: string) {
    return this.request<void>(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // File upload
  async uploadFile(file: File, patientCode: string, folder: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientCode', patientCode);
    formData.append('folder', folder);

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      // Return full URL
      const baseUrl = API_BASE_URL.replace('/api', '');
      return `${baseUrl}${result.url}`;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  // Real-time subscription (polling fallback)
  subscribeToPatients(callback: (patients: any[]) => void): () => void {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;
      
      try {
        const patients = await this.getPatients();
        callback(patients);
      } catch (error) {
        console.error('Polling error:', error);
      }

      if (isActive) {
        setTimeout(poll, 2000); // Poll every 2 seconds
      }
    };

    poll();

    return () => {
      isActive = false;
    };
  }
}

export const apiService = new ApiService();


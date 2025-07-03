import { Application, CreateApplicationData } from '../types/application';

// Configure your API base URL here
const API_BASE_URL = 'http://127.0.0.1:8000';

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async fetchData<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getApplications(phoneNumber: string): Promise<Application[]> {
    return this.fetchData<Application[]>(`/applications?phone_number=${phoneNumber}`);
  }

  async getApplicationById(id: string, phoneNumber: string): Promise<Application> {
    return this.fetchData<Application>(`/applications/${id}?phone_number=${phoneNumber}`);
  }

  async createApplication(data: CreateApplicationData): Promise<Application> {
    return this.fetchData<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateApplication(id: string, data: Partial<CreateApplicationData>): Promise<Application> {
    return this.fetchData<Application>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    await this.fetchData<void>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Method to update base URL if needed
  setBaseURL(newBaseURL: string) {
    this.baseURL = newBaseURL;
  }
}

export const apiService = new ApiService();
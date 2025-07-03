import React, { createContext, useContext, useState, useCallback } from 'react';
import { Application, CreateApplicationData } from '../types/application';
import { apiService } from '../services/api';

interface ApplicationContextType {
  applications: Application[];
  loading: boolean;
  error: string | null;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  loadApplications: () => Promise<void>;
  createApplication: (data: CreateApplicationData) => Promise<void>;
  updateApplication: (id: string, data: Partial<CreateApplicationData>) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
  getApplicationById: (id: string, phoneNumber: string) => Promise<Application>;
}

const ApplicationContext = createContext<ApplicationContextType | undefined>(undefined);

export const useApplications = () => {
  const context = useContext(ApplicationContext);
  if (!context) {
    throw new Error('useApplications must be used within an ApplicationProvider');
  }
  return context;
};

interface ApplicationProviderProps {
  children: React.ReactNode;
}

export const ApplicationProvider: React.FC<ApplicationProviderProps> = ({ children }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(() => {
    return localStorage.getItem('phoneNumber') || '';
  });

  const setPhoneNumberWithStorage = (phone: string) => {
    setPhoneNumber(phone);
    localStorage.setItem('phoneNumber', phone);
  };

  const loadApplications = useCallback(async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getApplications(phoneNumber);
      setApplications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading applications');
    } finally {
      setLoading(false);
    }
  }, [phoneNumber]);

  const createApplication = async (data: CreateApplicationData) => {
    setLoading(true);
    setError(null);
    try {
      const newApplication = await apiService.createApplication(data);
      setApplications(prev => [newApplication, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating application');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (id: string, data: Partial<CreateApplicationData>) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await apiService.updateApplication(id, data);
      setApplications(prev => prev.map(app => app._id === id ? updated : app));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating application');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteApplication(id);
      setApplications(prev => prev.filter(app => app._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting application');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getApplicationById = async (id: string, phoneNumber: string): Promise<Application> => {
    try {
      return await apiService.getApplicationById(id, phoneNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching application details');
      throw err;
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        loading,
        error,
        phoneNumber,
        setPhoneNumber: setPhoneNumberWithStorage,
        loadApplications,
        createApplication,
        updateApplication,
        deleteApplication,
        getApplicationById,
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
};
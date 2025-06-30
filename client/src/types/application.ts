export interface Application {
  _id: string;
  company: string;
  role: string;
  salary: string;
  platform: string;
  status: 'Pendiente' | 'En proceso' | 'Rechazado' | 'Aceptado';
  contact: string | null;
  jobUrl: string;
  phone_number: string;
  interview: string | null;
  feedback: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationData {
  company: string;
  role: string;
  salary: string;
  platform: string;
  status: 'Pendiente' | 'En proceso' | 'Rechazado' | 'Aceptado';
  contact?: string;
  jobUrl: string;
  phone_number: string;
  interview?: string;
  feedback?: string;
}
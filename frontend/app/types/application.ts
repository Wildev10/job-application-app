export type Role = 'dev' | 'designer';
export type ApplicationStatus = 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
export type ApplicationStatusColor = 'gray' | 'blue' | 'yellow' | 'green' | 'red';

export interface Application {
  id: number;
  nom: string;
  email: string;
  role: Role;
  motivation: string;
  portfolio: string | null;
  cv: string | null;
  score: number;
  status: ApplicationStatus;
  status_label: string;
  status_color: ApplicationStatusColor;
  created_at: string;
  updated_at: string;
}

export interface UpdateStatusResponse {
  id: number;
  status: ApplicationStatus;
  status_label: string;
  status_color: ApplicationStatusColor;
}

export interface ApplicationsResponse {
  data: Application[];
  total: number;
}

export interface ApplicationFormData {
  nom: string;
  email: string;
  role: Role | '';
  motivation: string;
  portfolio: string;
  cv: File | null;
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

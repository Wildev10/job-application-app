export type Role = 'dev' | 'designer';

export interface Application {
  id: number;
  nom: string;
  email: string;
  role: Role;
  motivation: string;
  portfolio: string | null;
  cv: string | null;
  score: number;
  created_at: string;
  updated_at: string;
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

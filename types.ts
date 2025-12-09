export interface AppEntry {
  id: string;
  name: string;
  url: string;
  description: string;
  imageUrl?: string;
  category: string;
  createdAt: number;
}

export const DEFAULT_CATEGORIES = [
  'Work',
  'Social',
  'Development',
  'Media',
  'Other',
];

export interface CreateAppFormData {
  name: string;
  url: string;
  description: string;
  imageUrl: string;
  category: string;
}

export type IconName = 'Globe' | 'Briefcase' | 'Code' | 'Play' | 'Layers';

// Auth Types

export type UserRole = 'admin' | 'user';
export type UserStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  password?: string; // optional in API responses
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: number;
  isVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
}

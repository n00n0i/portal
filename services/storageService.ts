import { AppEntry, DEFAULT_CATEGORIES, User, UserStatus, AuthResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_APPS = 'portal_apps_v1';
const STORAGE_KEY_CATEGORIES = 'portal_categories_v1';
const STORAGE_KEY_USERS = 'portal_users_v1';
const STORAGE_KEY_SESSION = 'portal_session_v1';

const API_BASE = (
  (typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : '') ||
  process.env.API_BASE_URL ||
  ''
).replace(/\/+$/, '');
const USE_API = Boolean(API_BASE);

const api = async <T>(path: string, options?: RequestInit): Promise<T> => {
  if (!USE_API) {
    throw new Error('API_BASE_URL not configured');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.message) || 'Request failed');
  }
  return data as T;
};

// --- Default Data ---

const DEFAULT_APPS: AppEntry[] = [
  {
    id: '1',
    name: 'GitHub',
    url: 'https://github.com',
    description: 'Where the world builds software.',
    category: 'Development',
    imageUrl: 'https://picsum.photos/seed/github/400/200',
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'YouTube',
    url: 'https://youtube.com',
    description: 'Enjoy the videos and music you love.',
    category: 'Media',
    imageUrl: 'https://picsum.photos/seed/youtube/400/200',
    createdAt: Date.now() - 1000,
  },
  {
    id: '3',
    name: 'Gmail',
    url: 'https://mail.google.com',
    description: 'Secure, smart, and easy to use email.',
    category: 'Work',
    imageUrl: 'https://picsum.photos/seed/gmail/400/200',
    createdAt: Date.now() - 2000,
  }
];

const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  email: 'admin@portal.com',
  password: 'admin', // Simple password for demo
  name: 'System Admin',
  role: 'admin',
  status: 'approved',
  createdAt: Date.now(),
};

// --- App Management ---

export const getApps = async (): Promise<AppEntry[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_APPS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(DEFAULT_APPS));
      return DEFAULT_APPS;
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to parse apps from storage', e);
    return DEFAULT_APPS;
  }
};

export const saveApps = async (apps: AppEntry[]): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save apps to storage', e);
  }
};

export const addApp = async (app: AppEntry): Promise<AppEntry[]> => {
  const current = await getApps();
  const updated = [app, ...current];
  await saveApps(updated);
  return updated;
};

export const deleteApp = async (id: string): Promise<AppEntry[]> => {
  const current = await getApps();
  const updated = current.filter(app => app.id !== id);
  await saveApps(updated);
  return updated;
};

export const updateApp = async (updatedApp: AppEntry): Promise<AppEntry[]> => {
  const current = await getApps();
  const updated = current.map(app => app.id === updatedApp.id ? updatedApp : app);
  await saveApps(updated);
  return updated;
};

// --- Category Management ---

export const getCategories = async (): Promise<string[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
    return JSON.parse(stored);
  } catch (e) {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = async (categories: string[]): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const addCategory = async (category: string): Promise<string[]> => {
  const current = await getCategories();
  if (current.includes(category)) return current;
  const updated = [...current, category];
  await saveCategories(updated);
  return updated;
};

export const deleteCategory = async (category: string): Promise<string[]> => {
  const current = await getCategories();
  const updated = current.filter(c => c !== category);
  await saveCategories(updated);
  return updated;
};

// --- User Management & Auth ---

const ensureDefaultAdmin = (users: User[]): User[] => {
  // Guarantee root admin exists even if storage was modified/cleared incorrectly
  const hasAdmin = users.some(u => u.email?.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase());
  if (!hasAdmin && !USE_API) {
    users.push(DEFAULT_ADMIN);
  }
  return users;
};

export const getUsers = async (): Promise<User[]> => {
  if (USE_API) {
    const data = await api<{ success: boolean; users: User[] }>('/api/users');
    return data.users || [];
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (!stored) {
      const users = ensureDefaultAdmin([]);
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      return users;
    }
    const parsed: User[] = JSON.parse(stored);
    const withAdmin = ensureDefaultAdmin(parsed);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(withAdmin));
    return withAdmin;
  } catch (e) {
    return [DEFAULT_ADMIN];
  }
};

export const saveUsers = async (users: User[]): Promise<void> => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (USE_API) {
    try {
      const res = await api<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.success && res.user) {
        localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(res.user));
      }
      return res;
    } catch (e: any) {
      return { success: false, message: e.message || 'Login failed' };
    }
  }

  const users = await getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (user.password !== password) {
    return { success: false, message: 'Invalid password.' };
  }

  if (user.status === 'pending') {
    return { success: false, message: 'Account is pending approval by administrator.' };
  }

  if (user.status === 'rejected') {
    return { success: false, message: 'Account has been deactivated.' };
  }

  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  return { success: true, user };
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch {
    return null;
  }
};

export const signup = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  if (USE_API) {
    try {
      return await api<AuthResponse>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
    } catch (e: any) {
      return { success: false, message: e.message || 'Signup failed' };
    }
  }

  const users = await getUsers();
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Email already exists.' };
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role: 'user',
    status: 'pending',
    createdAt: Date.now(),
  };

  users.push(newUser);
  await saveUsers(users);

  return { success: true, message: 'Account created. Please wait for admin approval.' };
};

export const updateUserStatus = async (userId: string, status: UserStatus): Promise<void> => {
  if (USE_API) {
    await api('/api/users/' + userId + '/status', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return;
  }
  const users = await getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status } : u);
  await saveUsers(updated);
};

export const deleteUser = async (userId: string): Promise<void> => {
  if (USE_API) {
    await api('/api/users/' + userId, { method: 'DELETE' });
    return;
  }
  const users = await getUsers();
  const userToDelete = users.find(u => u.id === userId);
  if (userToDelete?.email === 'admin@portal.com') {
      throw new Error("Cannot delete the root admin.");
  }
  
  const updated = users.filter(u => u.id !== userId);
  await saveUsers(updated);
};

export const resetPassword = async (email: string): Promise<{ success: boolean; message: string; tempPassword?: string }> => {
  if (USE_API) {
    try {
      const res = await api<{ success: boolean; message: string; tempPassword?: string }>('/api/auth/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      return res;
    } catch (e: any) {
      return { success: false, message: e.message || 'Could not reset password.' };
    }
  }
  const users = await getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) {
    return { success: false, message: 'No account found for that email.' };
  }
  const tempPassword = Math.random().toString(36).slice(-10);
  users[idx] = { ...users[idx], password: tempPassword };
  await saveUsers(users);
  return { success: true, message: 'Temporary password generated.', tempPassword };
};

export const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
  if (USE_API) {
    return api('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ email, currentPassword, newPassword }),
    });
  }
  const users = await getUsers();
  const idx = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  if (idx === -1) throw new Error('User not found');
  if (users[idx].password !== currentPassword) throw new Error('Current password incorrect');
  users[idx] = { ...users[idx], password: newPassword };
  await saveUsers(users);
  return { success: true };
};

export const adminSetPassword = async (userId: string, newPassword: string) => {
  if (USE_API) {
    return api('/api/users/' + userId + '/password', {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  }
  const users = await getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx === -1) throw new Error('User not found');
  users[idx] = { ...users[idx], password: newPassword };
  await saveUsers(users);
  return { success: true };
};

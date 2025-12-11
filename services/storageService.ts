import { AppEntry, DEFAULT_CATEGORIES, User, UserStatus, AuthResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_SESSION = 'portal_session_v1';
const STORAGE_KEY_USERS = 'portal_users_v1';

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
  if (USE_API) {
    const res = await api<{ success: boolean; apps: AppEntry[] }>('/api/apps');
    return res.apps || [];
  }

  // Fallback for local/dev without API (non-prod only)
  console.warn('API_BASE_URL not configured. Using in-memory defaults for apps.');
  return [];
};

export const addApp = async (app: AppEntry): Promise<AppEntry[]> => {
  if (USE_API) {
    await api<{ success: boolean; app: AppEntry }>('/api/apps', {
      method: 'POST',
      body: JSON.stringify({
        name: app.name,
        url: app.url,
        description: app.description,
        imageUrl: app.imageUrl,
        category: app.category,
      }),
    });
    return getApps();
  }

  console.warn('API_BASE_URL not configured. Skipping addApp.');
  return [];
};

export const deleteApp = async (id: string): Promise<AppEntry[]> => {
  if (USE_API) {
    await api('/api/apps/' + id, { method: 'DELETE' });
    return getApps();
  }

  console.warn('API_BASE_URL not configured. Skipping deleteApp.');
  return [];
};

export const updateApp = async (updatedApp: AppEntry): Promise<AppEntry[]> => {
  if (USE_API) {
    await api('/api/apps/' + updatedApp.id, {
      method: 'PUT',
      body: JSON.stringify({
        name: updatedApp.name,
        url: updatedApp.url,
        description: updatedApp.description,
        imageUrl: updatedApp.imageUrl,
        category: updatedApp.category,
      }),
    });
    return getApps();
  }

  console.warn('API_BASE_URL not configured. Skipping updateApp.');
  return [];
};

// --- Category Management ---

export const getCategories = async (): Promise<string[]> => {
  if (USE_API) {
    const res = await api<{ success: boolean; categories: string[] }>('/api/categories');
    return res.categories || [];
  }

  console.warn('API_BASE_URL not configured. Using default categories.');
  return DEFAULT_CATEGORIES;
};

export const addCategory = async (category: string): Promise<string[]> => {
  if (USE_API) {
    await api('/api/categories', {
      method: 'POST',
      body: JSON.stringify({ name: category }),
    });
    return getCategories();
  }

  console.warn('API_BASE_URL not configured. Skipping addCategory.');
  return DEFAULT_CATEGORIES;
};

export const deleteCategory = async (category: string): Promise<string[]> => {
  if (USE_API) {
    await api('/api/categories/' + encodeURIComponent(category), { method: 'DELETE' });
    return getCategories();
  }

  console.warn('API_BASE_URL not configured. Skipping deleteCategory.');
  return DEFAULT_CATEGORIES;
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

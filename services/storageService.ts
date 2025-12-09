import { AppEntry, DEFAULT_CATEGORIES, User, UserRole, UserStatus, AuthResponse } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY_APPS = 'portal_apps_v1';
const STORAGE_KEY_CATEGORIES = 'portal_categories_v1';
const STORAGE_KEY_USERS = 'portal_users_v1';
const STORAGE_KEY_SESSION = 'portal_session_v1';

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

export const getApps = (): AppEntry[] => {
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

export const saveApps = (apps: AppEntry[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify(apps));
  } catch (e) {
    console.error('Failed to save apps to storage', e);
  }
};

export const addApp = (app: AppEntry): AppEntry[] => {
  const current = getApps();
  const updated = [app, ...current];
  saveApps(updated);
  return updated;
};

export const deleteApp = (id: string): AppEntry[] => {
  const current = getApps();
  const updated = current.filter(app => app.id !== id);
  saveApps(updated);
  return updated;
};

export const updateApp = (updatedApp: AppEntry): AppEntry[] => {
  const current = getApps();
  const updated = current.map(app => app.id === updatedApp.id ? updatedApp : app);
  saveApps(updated);
  return updated;
};

// --- Category Management ---

export const getCategories = (): string[] => {
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

export const saveCategories = (categories: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (e) {
    console.error('Failed to save categories', e);
  }
};

export const addCategory = (category: string): string[] => {
  const current = getCategories();
  if (current.includes(category)) return current;
  const updated = [...current, category];
  saveCategories(updated);
  return updated;
};

export const deleteCategory = (category: string): string[] => {
  const current = getCategories();
  const updated = current.filter(c => c !== category);
  saveCategories(updated);
  return updated;
};

// --- User Management & Auth ---

export const getUsers = (): User[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_USERS);
    if (!stored) {
      // Initialize with default admin
      const users = [DEFAULT_ADMIN];
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
      return users;
    }
    return JSON.parse(stored);
  } catch (e) {
    return [DEFAULT_ADMIN];
  }
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const login = (email: string, password: string): AuthResponse => {
  const users = getUsers();
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

  // Create Session
  localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(user));
  return { success: true, user };
};

export const logout = (): void => {
  localStorage.removeItem(STORAGE_KEY_SESSION);
};

export const getCurrentUser = (): User | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_SESSION);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const signup = (name: string, email: string, password: string): AuthResponse => {
  const users = getUsers();
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { success: false, message: 'Email already exists.' };
  }

  const newUser: User = {
    id: uuidv4(),
    name,
    email,
    password,
    role: 'user', // Default role
    status: 'pending', // Default status
    createdAt: Date.now(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: 'Account created. Please wait for admin approval.' };
};

export const updateUserStatus = (userId: string, status: UserStatus): void => {
  const users = getUsers();
  const updated = users.map(u => u.id === userId ? { ...u, status } : u);
  saveUsers(updated);
};

export const deleteUser = (userId: string): void => {
  const users = getUsers();
  // Prevent deleting self or the last admin
  const userToDelete = users.find(u => u.id === userId);
  if (userToDelete?.email === 'admin@portal.com') {
      throw new Error("Cannot delete the root admin.");
  }
  
  const updated = users.filter(u => u.id !== userId);
  saveUsers(updated);
};
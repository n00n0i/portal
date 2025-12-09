import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'th';

type Dictionary = Record<string, string>;

const translations: Record<Locale, Dictionary> = {
  en: {
    portal: 'Portal',
    welcome: 'Welcome',
    users: 'Users',
    design: 'Design',
    manage: 'Manage',
    done: 'Done',
    addApp: 'Add App',
    searchApps: 'Search apps...',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign up',
    changePassword: 'Change Password',
    account: 'Account',
    email: 'Email',
    password: 'Password',
    resetPassword: 'Reset password',
    fullName: 'Full Name',
    createAccount: 'Create Account',
    role: 'Role',
    admin: 'Admin',
    user: 'User',
    status: 'Status',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    deactivate: 'Deactivate',
    reactivate: 'Reactivate',
    approve: 'Approve',
    reject: 'Reject',
    deleteUser: 'Delete User',
    setPassword: 'Set Password',
    language: 'Language',
    maildev: 'Maildev',
    save: 'Save',
    cancel: 'Cancel',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    passwordsMismatch: 'Passwords do not match',
    passwordUpdated: 'Password updated',
    updateFailed: 'Failed to update password',
    verifyEmailInfo: 'Please verify your email from the inbox link.',
    actions: 'Actions',
    updatePasswordInfo: 'Update your password to keep your account secure.',
  },
  th: {
    portal: 'พอร์ทัล',
    welcome: 'ยินดีต้อนรับ',
    users: 'ผู้ใช้',
    design: 'ดีไซน์',
    manage: 'จัดการ',
    done: 'เสร็จสิ้น',
    addApp: 'เพิ่มแอป',
    searchApps: 'ค้นหาแอป...',
    logout: 'ออกจากระบบ',
    login: 'เข้าสู่ระบบ',
    signup: 'สมัครสมาชิก',
    changePassword: 'เปลี่ยนรหัสผ่าน',
    account: 'บัญชี',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    resetPassword: 'รีเซ็ตรหัสผ่าน',
    fullName: 'ชื่อเต็ม',
    createAccount: 'สร้างบัญชี',
    role: 'บทบาท',
    admin: 'ผู้ดูแล',
    user: 'ผู้ใช้',
    status: 'สถานะ',
    approved: 'อนุมัติ',
    pending: 'รออนุมัติ',
    rejected: 'ปฏิเสธ',
    deactivate: 'ปิดการใช้งาน',
    reactivate: 'เปิดใช้งาน',
    approve: 'อนุมัติ',
    reject: 'ปฏิเสธ',
    deleteUser: 'ลบผู้ใช้',
    setPassword: 'ตั้งรหัสผ่าน',
    language: 'ภาษา',
    maildev: 'กล่องจดหมาย',
    save: 'บันทึก',
    cancel: 'ยกเลิก',
    currentPassword: 'รหัสผ่านปัจจุบัน',
    newPassword: 'รหัสผ่านใหม่',
    confirmPassword: 'ยืนยันรหัสผ่าน',
    passwordsMismatch: 'รหัสผ่านไม่ตรงกัน',
    passwordUpdated: 'อัปเดตรหัสผ่านแล้ว',
    updateFailed: 'อัปเดตรหัสผ่านไม่สำเร็จ',
    verifyEmailInfo: 'กรุณายืนยันอีเมลผ่านลิงก์ในกล่องจดหมาย',
    actions: 'การจัดการ',
    updatePasswordInfo: 'อัปเดตรหัสผ่านเพื่อความปลอดภัยของบัญชี',
  },
};

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, fallback?: string) => string;
};

const STORAGE_KEY = 'portal_locale';
const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const translate = (locale: Locale, key: string, fallback?: string) => {
  return translations[locale]?.[key] ?? translations.en[key] ?? fallback ?? key;
};

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored && ['en', 'th'].includes(stored)) {
      setLocaleState(stored);
    } else if (navigator.language?.startsWith('th')) {
      setLocaleState('th');
    }
  }, []);

  const setLocale = (value: Locale) => {
    setLocaleState(value);
    localStorage.setItem(STORAGE_KEY, value);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: string, fallback?: string) => translate(locale, key, fallback),
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
};

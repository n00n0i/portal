import React, { useState } from 'react';
import { Button } from './Button';
import { User, AuthResponse } from '../types';
import * as storageService from '../services/storageService';
import { KeyRound, Mail, User as UserIcon, ArrowLeft, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useI18n } from '../i18n';

interface AuthScreensProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

export const AuthScreens: React.FC<AuthScreensProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useI18n();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const clearForm = () => {
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setShowPassword(false);
  };

  const switchView = (v: AuthView) => {
    clearForm();
    setView(v);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await storageService.login(email, password);
    if (res.success && res.user) {
      onLogin(res.user);
    } else {
      setError(res.message || t('login'));
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const res = await storageService.signup(name, email, password);
    if (res.success) {
      setSuccessMsg(res.message || 'Success');
      // Optional: switch to login after delay
      setTimeout(() => switchView('login'), 2000);
    } else {
      setError(res.message || t('signup'));
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await storageService.resetPassword(email);
    if (res.success && res.tempPassword) {
      setSuccessMsg(`Temporary password: ${res.tempPassword}`);
    } else {
      setError(res.message || t('resetPassword'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative z-10 animate-fade-in">
            {/* Header */}
            <div className="p-8 bg-slate-800/50 border-b border-slate-800 text-center">
                <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                    <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{t('portal')}</h2>
                <p className="text-slate-400 text-sm">
                    {view === 'login' && t('welcome')}
                    {view === 'signup' && t('createAccount')}
                    {view === 'forgot-password' && t('resetPassword')}
                </p>
            </div>

            <div className="p-8">
                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}
                {successMsg && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-sm text-center">
                        {successMsg}
                    </div>
                )}

                {view === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="name@company.com"
                                    autoComplete="username"
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-slate-400">{t('password')}</label>
                                <button type="button" onClick={() => switchView('forgot-password')} className="text-xs text-indigo-400 hover:text-indigo-300">
                                    {t('resetPassword')}
                                </button>
                            </div>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="********"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-2.5">{t('login')}</Button>
                        <div className="text-center mt-4">
                            <span className="text-slate-400 text-sm">Don't have an account? </span>
                            <button type="button" onClick={() => switchView('signup')} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                                {t('signup')}
                            </button>
                        </div>
                    </form>
                )}

                {view === 'signup' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('fullName')}</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" 
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="John Doe"
                                    autoComplete="name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="name@company.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('password')}</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="********"
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-2.5">{t('createAccount')}</Button>
                        <div className="text-center mt-4">
                            <button type="button" onClick={() => switchView('login')} className="text-slate-400 hover:text-white text-sm flex items-center justify-center w-full gap-2">
                                <ArrowLeft className="w-4 h-4" /> {t('login')}
                            </button>
                        </div>
                    </form>
                )}

                {view === 'forgot-password' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="text-sm text-slate-400 mb-4">
                            {t('resetPassword')}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">{t('email')}</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    required
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                                    placeholder="name@company.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full py-2.5">{t('resetPassword')}</Button>
                        <div className="text-center mt-4">
                             <button type="button" onClick={() => switchView('login')} className="text-slate-400 hover:text-white text-sm flex items-center justify-center w-full gap-2">
                                <ArrowLeft className="w-4 h-4" /> {t('login')}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    </div>
  );
};

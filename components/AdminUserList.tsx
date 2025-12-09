import React, { useEffect, useState } from 'react';
import { User } from '../types';
import * as storageService from '../services/storageService';
import { Button } from './Button';
import { Check, X, Trash2, Shield, User as UserIcon, Clock, KeyRound } from 'lucide-react';
import { useI18n } from '../i18n';

interface AdminUserListProps {
  currentUser: User;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const { t } = useI18n();

  const refreshUsers = async () => {
    const all = await storageService.getUsers();
    setUsers(all);
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleStatusChange = async (userId: string, status: 'approved' | 'rejected') => {
    await storageService.updateUserStatus(userId, status);
    await refreshUsers();
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        try {
            await storageService.deleteUser(userId);
            await refreshUsers();
        } catch (e: any) {
            alert(e.message);
        }
    }
  };

  const handleResetPassword = async (userId: string, email: string) => {
    const newPass = prompt(`Set a new password for ${email}`);
    if (!newPass) return;
    try {
      await storageService.adminSetPassword(userId, newPass);
      alert('Password updated');
    } catch (e: any) {
      alert(e.message || 'Failed to update password');
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
        pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    const icons: Record<string, React.ReactNode> = {
        pending: <Clock className="w-3 h-3 mr-1" />,
        approved: <Check className="w-3 h-3 mr-1" />,
        rejected: <X className="w-3 h-3 mr-1" />,
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
            {icons[status]} {t(status)}
        </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-fade-in">
        <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                {t('users')}
            </h2>
            <p className="text-slate-400 text-sm mt-1">{t('status')} &amp; password control</p>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400">
                    <tr>
                        <th className="px-6 py-3 font-medium">{t('user')}</th>
                        <th className="px-6 py-3 font-medium">{t('role')}</th>
                        <th className="px-6 py-3 font-medium">{t('status')}</th>
                        <th className="px-6 py-3 font-medium">Date Joined</th>
                        <th className="px-6 py-3 font-medium text-right">{t('actions')}</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {users.map(user => (
                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                        <UserIcon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white">{user.name}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-300">
                                {user.role === 'admin' ? (
                                    <span className="text-indigo-400 font-medium">Admin</span>
                                ) : 'User'}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={user.status} />
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {user.id !== currentUser.id && user.email !== 'admin@portal.com' && (
                                    <div className="flex items-center justify-end gap-2 flex-wrap">
                                        {user.status === 'pending' && (
                                            <>
                                                <Button
                                                  variant="secondary"
                                                  className="h-9 px-3 text-sm"
                                                  icon={<Check className="w-4 h-4" />}
                                                  onClick={() => handleStatusChange(user.id, 'approved')}
                                                >
                                                  {t('approve')}
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  className="h-9 px-3 text-sm text-amber-300"
                                                  icon={<X className="w-4 h-4" />}
                                                  onClick={() => handleStatusChange(user.id, 'rejected')}
                                                >
                                                  {t('reject')}
                                                </Button>
                                            </>
                                        )}
                                        {user.status === 'rejected' && (
                                             <Button
                                               variant="secondary"
                                               className="h-9 px-3 text-sm"
                                               icon={<Check className="w-4 h-4" />}
                                               onClick={() => handleStatusChange(user.id, 'approved')}
                                             >
                                               {t('reactivate')}
                                             </Button>
                                        )}
                                         {user.status === 'approved' && (
                                             <Button
                                               variant="ghost"
                                               className="h-9 px-3 text-sm text-amber-300"
                                               icon={<X className="w-4 h-4" />}
                                               onClick={() => handleStatusChange(user.id, 'rejected')}
                                             >
                                               {t('deactivate')}
                                             </Button>
                                        )}
                                        <Button
                                          variant="secondary"
                                          className="h-9 px-3 text-sm"
                                          icon={<KeyRound className="w-4 h-4" />}
                                          onClick={() => handleResetPassword(user.id, user.email)}
                                        >
                                          {t('setPassword')}
                                        </Button>
                                        <Button
                                          variant="danger"
                                          className="h-9 px-3 text-sm"
                                          icon={<Trash2 className="w-4 h-4" />}
                                          onClick={() => handleDelete(user.id)}
                                        >
                                          {t('deleteUser')}
                                        </Button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {users.length === 0 && (
                <div className="p-8 text-center text-slate-500">No users found.</div>
            )}
        </div>
    </div>
  );
};

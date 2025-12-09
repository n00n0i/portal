import React, { useEffect, useState } from 'react';
import { User } from '../types';
import * as storageService from '../services/storageService';
import { Button } from './Button';
import { Check, X, Trash2, Shield, User as UserIcon, Clock } from 'lucide-react';

interface AdminUserListProps {
  currentUser: User;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);

  const refreshUsers = () => {
    setUsers(storageService.getUsers());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  const handleStatusChange = (userId: string, status: 'approved' | 'rejected') => {
    storageService.updateUserStatus(userId, status);
    refreshUsers();
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
        try {
            storageService.deleteUser(userId);
            refreshUsers();
        } catch (e: any) {
            alert(e.message);
        }
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
            {icons[status]} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-fade-in">
        <div className="p-6 border-b border-slate-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-500" />
                User Management
            </h2>
            <p className="text-slate-400 text-sm mt-1">Manage access requests and user roles.</p>
        </div>
        
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-800/50 text-slate-400">
                    <tr>
                        <th className="px-6 py-3 font-medium">User</th>
                        <th className="px-6 py-3 font-medium">Role</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Date Joined</th>
                        <th className="px-6 py-3 font-medium text-right">Actions</th>
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
                                    <div className="flex items-center justify-end gap-2">
                                        {user.status === 'pending' && (
                                            <>
                                                <button 
                                                    onClick={() => handleStatusChange(user.id, 'approved')}
                                                    className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                                    title="Approve"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleStatusChange(user.id, 'rejected')}
                                                    className="p-1.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                                                    title="Reject"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                        {user.status === 'rejected' && (
                                             <button 
                                                onClick={() => handleStatusChange(user.id, 'approved')}
                                                className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors"
                                                title="Re-activate"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                         {user.status === 'approved' && (
                                             <button 
                                                onClick={() => handleStatusChange(user.id, 'rejected')}
                                                className="p-1.5 rounded bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 transition-colors"
                                                title="Deactivate"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(user.id)}
                                            className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors ml-2"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
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
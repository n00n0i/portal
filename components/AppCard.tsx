import React from 'react';
import { AppEntry } from '../types';
import { ExternalLink, Trash2, Edit2, Globe } from 'lucide-react';

interface AppCardProps {
  app: AppEntry;
  isEditMode: boolean;
  onDelete: (id: string) => void;
  onEdit: (app: AppEntry) => void;
}

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const getBadgeStyle = (cat: string) => {
    const styles = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
      'bg-slate-500/20 text-slate-300 border-slate-500/30',
    ];
    let hash = 0;
    for (let i = 0; i < cat.length; i++) {
      hash = cat.charCodeAt(i) + ((hash << 5) - hash);
    }
    return styles[Math.abs(hash) % styles.length];
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full border ${getBadgeStyle(category)} font-medium uppercase tracking-wider`}>
      {category}
    </span>
  );
};

export const AppCard: React.FC<AppCardProps> = ({ app, isEditMode, onDelete, onEdit }) => {
  
  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`Delete ${app.name}?`)) {
      onDelete(app.id);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit(app);
  };

  return (
    <a 
      href={app.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="group relative block w-full h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-600 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image / Header Area */}
      <div className="h-32 w-full overflow-hidden relative bg-slate-800">
        {app.imageUrl ? (
          <img 
            src={app.imageUrl} 
            alt={app.name} 
            className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
            onError={(e) => {
                // Fallback if image fails
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
             <Globe className="w-12 h-12 text-slate-600" />
          </div>
        )}
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-90" />

        {/* Category Badge - Top Right */}
        <div className="absolute top-3 right-3">
          <CategoryBadge category={app.category} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 relative -mt-6">
        <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors truncate pr-2">
            {app.name}
            </h3>
            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
        </div>
        
        <p className="text-slate-400 text-sm line-clamp-2 min-h-[2.5rem]">
          {app.description}
        </p>

        {/* Edit Mode Controls */}
        {isEditMode && (
          <div className="absolute top-[-5rem] right-2 flex gap-2">
             <button 
                onClick={handleEdit}
                className="p-2 bg-slate-800/90 hover:bg-indigo-600 text-white rounded-full backdrop-blur-sm border border-slate-600 transition-colors"
                title="Edit"
             >
                <Edit2 className="w-4 h-4" />
             </button>
             <button 
                onClick={handleDelete}
                className="p-2 bg-slate-800/90 hover:bg-red-600 text-white rounded-full backdrop-blur-sm border border-slate-600 transition-colors"
                title="Delete"
             >
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
        )}
      </div>
    </a>
  );
};
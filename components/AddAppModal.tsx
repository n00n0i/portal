import React, { useState, useEffect } from 'react';
import { CreateAppFormData, AppEntry } from '../types';
import { Button } from './Button';
import { X, Wand2 } from 'lucide-react';
import { generateAppDescription } from '../services/geminiService';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppFormData) => void;
  initialData?: AppEntry | null;
  availableCategories: string[];
}

export const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onSubmit, initialData, availableCategories }) => {
  const [formData, setFormData] = useState<CreateAppFormData>({
    name: '',
    url: '',
    description: '',
    imageUrl: '',
    category: availableCategories[0] || 'Other',
  });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name,
          url: initialData.url,
          description: initialData.description,
          imageUrl: initialData.imageUrl || '',
          category: initialData.category,
        });
      } else {
        setFormData({
          name: '',
          url: '',
          description: '',
          imageUrl: '',
          category: availableCategories[0] || 'Other',
        });
      }
    }
  }, [isOpen, initialData, availableCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleGenerateDescription = async () => {
    if (!formData.name && !formData.url) return;
    
    setIsGenerating(true);
    try {
      const desc = await generateAppDescription(formData.name, formData.url);
      setFormData(prev => ({ ...prev, description: desc }));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Application' : 'Add Application'}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. GitHub"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">URL</label>
            <input
              type="url"
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="https://..."
              value={formData.url}
              onChange={e => setFormData({...formData, url: e.target.value})}
            />
          </div>

          <div>
             <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating || (!formData.name && !formData.url)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 disabled:opacity-50"
                >
                    <Wand2 className="w-3 h-3" />
                    {isGenerating ? 'Magic...' : 'Auto-fill'}
                </button>
             </div>
            <textarea
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="A short description..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                <select
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                >
                {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                </select>
            </div>
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Image URL (Optional)</label>
                 <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {initialData ? 'Save Changes' : 'Add App'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
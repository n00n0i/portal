import React, { useState, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AppEntry, CreateAppFormData, User } from './types';
import * as storageService from './services/storageService';
import { AppCard } from './components/AppCard';
import { AddAppModal } from './components/AddAppModal';
import { Button } from './components/Button';
import { AuthScreens } from './components/AuthScreens';
import { AdminUserList } from './components/AdminUserList';
import { Plus, Settings, LayoutGrid, Search, X, LogOut, Users, UserCircle } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'portal' | 'admin_users'>('portal');

  // App Data State
  const [apps, setApps] = useState<AppEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<AppEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Category adding state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const categoryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check for existing session
    const user = storageService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
    }
    // Load apps and categories on mount
    setApps(storageService.getApps());
    setCategories(storageService.getCategories());
  }, []);

  useEffect(() => {
    if (isAddingCategory && categoryInputRef.current) {
        categoryInputRef.current.focus();
    }
  }, [isAddingCategory]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('portal');
  };

  const handleLogout = () => {
    storageService.logout();
    setCurrentUser(null);
    setIsEditMode(false);
    setCurrentView('portal');
  };

  const handleAddApp = (data: CreateAppFormData) => {
    if (editingApp) {
        // Update existing
        const updated: AppEntry = {
            ...editingApp,
            ...data,
        };
        const newApps = storageService.updateApp(updated);
        setApps(newApps);
    } else {
        // Create new
        const newApp: AppEntry = {
            id: uuidv4(),
            createdAt: Date.now(),
            ...data,
            // If no image provided, generate a seeded one for consistency
            imageUrl: data.imageUrl || `https://picsum.photos/seed/${Date.now()}/400/200`
        };
        const newApps = storageService.addApp(newApp);
        setApps(newApps);
    }
    closeModal();
  };

  const handleDeleteApp = (id: string) => {
    const newApps = storageService.deleteApp(id);
    setApps(newApps);
  };

  const submitNewCategory = () => {
    if (newCategoryName && newCategoryName.trim()) {
        const trimmed = newCategoryName.trim();
        const newCats = storageService.addCategory(trimmed);
        setCategories(newCats);
        setSelectedCategory(trimmed);
    }
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  const handleKeyDownCategory = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          submitNewCategory();
      } else if (e.key === 'Escape') {
          setNewCategoryName('');
          setIsAddingCategory(false);
      }
  };

  const handleDeleteCategory = (cat: string) => {
    // Using window.confirm explicitly
    if (window.confirm(`Are you sure you want to delete the category "${cat}"?`)) {
        const newCats = storageService.deleteCategory(cat);
        setCategories(newCats);
        if (selectedCategory === cat) {
            setSelectedCategory('All');
        }
    }
  };

  const openEditModal = (app: AppEntry) => {
      setEditingApp(app);
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingApp(null);
  };

  const filteredApps = useMemo(() => {
    return apps.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            app.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [apps, searchQuery, selectedCategory]);

  const isAdmin = currentUser?.role === 'admin';

  // --- Render Auth Screens if not logged in ---
  if (!currentUser) {
      return <AuthScreens onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-indigo-500/30">
      
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <div 
                className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20 cursor-pointer"
                onClick={() => setCurrentView('portal')}
            >
              <LayoutGrid className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Portal</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                 <span>Welcome, {currentUser.name}</span>
                 {isAdmin && <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">ADMIN</span>}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {/* Search - Only visible in Portal View */}
             {currentView === 'portal' && (
                <div className="relative group flex-grow lg:flex-grow-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search apps..." 
                        className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full lg:w-64 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
             )}
            
            <div className="h-8 w-px bg-slate-800 mx-2 hidden lg:block"></div>

            {/* Admin Controls */}
            {isAdmin && (
                <>
                    <Button 
                        variant={currentView === 'admin_users' ? 'primary' : 'ghost'}
                        onClick={() => {
                            setCurrentView(currentView === 'admin_users' ? 'portal' : 'admin_users');
                            setIsEditMode(false);
                        }}
                        icon={<Users className="w-4 h-4" />}
                    >
                        Users
                    </Button>

                    {currentView === 'portal' && (
                        <Button 
                            variant={isEditMode ? 'primary' : 'secondary'} 
                            onClick={() => setIsEditMode(!isEditMode)}
                            icon={<Settings className="w-4 h-4" />}
                            className={isEditMode ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-950" : ""}
                        >
                        {isEditMode ? 'Done' : 'Manage'}
                        </Button>
                    )}
                    
                    {currentView === 'portal' && isEditMode && (
                        <Button onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
                        Add App
                        </Button>
                    )}
                </>
            )}

            <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {currentView === 'admin_users' ? (
            <AdminUserList currentUser={currentUser} />
        ) : (
            <>
                {/* Categories */}
                <div className="flex flex-wrap gap-2 mb-8 items-center">
                    {['All', ...categories].map((cat) => (
                        <div 
                            key={cat} 
                            className={`
                                group/chip flex items-center rounded-full border text-sm font-medium transition-all whitespace-nowrap select-none overflow-hidden
                                ${selectedCategory === cat 
                                ? 'bg-white text-slate-900 border-white shadow-lg shadow-white/10' 
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'}
                            `}
                        >
                            <button
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    px-4 py-1.5 cursor-pointer outline-none bg-transparent border-none
                                    ${selectedCategory === cat ? '' : 'hover:text-white'}
                                `}
                            >
                                {cat}
                            </button>
                            {isEditMode && cat !== 'All' && (
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        // Prevent any event bubbling
                                        e.stopPropagation();
                                        e.preventDefault();
                                        handleDeleteCategory(cat);
                                    }}
                                    className={`
                                        pr-3 pl-0 py-1.5 flex items-center justify-center transition-colors outline-none bg-transparent border-none
                                        ${selectedCategory === cat 
                                            ? 'text-slate-400 hover:text-red-600' 
                                            : 'text-slate-600 hover:text-red-400 group-hover/chip:text-slate-500 group-hover/chip:hover:text-red-400'}
                                    `}
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                    
                    {isEditMode && (
                        isAddingCategory ? (
                            <div className="flex items-center">
                                <input
                                    ref={categoryInputRef}
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={handleKeyDownCategory}
                                    onBlur={submitNewCategory}
                                    placeholder="Category Name"
                                    className="bg-slate-900 border border-indigo-500 rounded-full px-4 py-1.5 text-sm text-white outline-none w-32 focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20 border border-indigo-600/30 flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" />
                                New
                            </button>
                        )
                    )}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredApps.map((app) => (
                    <div key={app.id} className="h-full">
                        <AppCard 
                            app={app} 
                            isEditMode={isEditMode} 
                            onDelete={handleDeleteApp}
                            onEdit={openEditModal}
                        />
                    </div>
                ))}
                
                {/* Empty State */}
                {filteredApps.length === 0 && (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                        <div className="inline-flex items-center justify-center p-4 bg-slate-800 rounded-full mb-4">
                            <Search className="w-6 h-6 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">No apps found</h3>
                        <p className="text-slate-400 max-w-sm mx-auto mb-6">
                            {searchQuery ? `No results for "${searchQuery}"` : "This portal is empty."}
                        </p>
                        {!searchQuery && isAdmin && (
                            <Button onClick={() => { setIsEditMode(true); setIsModalOpen(true); }} icon={<Plus className="w-4 h-4" />}>
                                Add your first app
                            </Button>
                        )}
                    </div>
                )}
                </div>
            </>
        )}
      </div>

      <AddAppModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSubmit={handleAddApp}
        initialData={editingApp}
        availableCategories={categories}
      />
    </div>
  );
};

export default App;
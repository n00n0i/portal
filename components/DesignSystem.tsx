import React, { useMemo, useState } from 'react';
import { Plus, Settings, LogOut, Trash2, Edit, Check, X, AlertCircle, Info } from 'lucide-react';
import { Button } from './Button';

type Tab = 'colors' | 'buttons' | 'badges' | 'inputs' | 'icons';

export const DesignSystem: React.FC = () => {
  const tabs: Tab[] = useMemo(() => ['colors', 'buttons', 'badges', 'inputs', 'icons'], []);
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 to-slate-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-indigo-500" />
          Design System
        </h2>
        <p className="text-slate-400 text-sm mt-1">Component library and design tokens for consistency.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/50">
        <div className="flex">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium text-sm transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-indigo-400 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* COLORS TAB */}
        {activeTab === 'colors' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Primary Palette</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Indigo 500', class: 'bg-indigo-500' },
                  { name: 'Indigo 400', class: 'bg-indigo-400' },
                  { name: 'Indigo 600', class: 'bg-indigo-600' },
                  { name: 'Indigo 700', class: 'bg-indigo-700' },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`h-20 rounded-lg mb-2 border border-slate-700 ${color.class}`} />
                    <p className="text-xs text-slate-400">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Semantic Colors</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: 'Success', class: 'bg-emerald-500' },
                  { name: 'Warning', class: 'bg-amber-500' },
                  { name: 'Error', class: 'bg-red-500' },
                  { name: 'Info', class: 'bg-blue-500' },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`h-20 rounded-lg mb-2 border border-slate-700 ${color.class}`} />
                    <p className="text-xs text-slate-400">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Neutral Scale</h3>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                  { name: '950', class: 'bg-slate-950' },
                  { name: '900', class: 'bg-slate-900' },
                  { name: '800', class: 'bg-slate-800' },
                  { name: '700', class: 'bg-slate-700' },
                  { name: '600', class: 'bg-slate-600' },
                  { name: '400', class: 'bg-slate-400' },
                ].map((color) => (
                  <div key={color.name} className="text-center">
                    <div className={`h-20 rounded-lg mb-2 border border-slate-700 ${color.class}`} />
                    <p className="text-xs text-slate-400">{color.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS TAB */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="danger">Danger Button</Button>
                <Button variant="ghost">Ghost Button</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Button Sizes</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Button States</h3>
              <div className="flex flex-wrap gap-4">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  With Icon
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status Badges</h3>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Check className="w-3 h-3 mr-1" /> Approved
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pending
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  <X className="w-3 h-3 mr-1" /> Rejected
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Role Badges</h3>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Admin
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-600/20 text-slate-300 border border-slate-600/40">
                  User
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Alert Badges</h3>
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Info className="w-3 h-3 mr-1" /> Info
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <AlertCircle className="w-3 h-3 mr-1" /> Warning
                </span>
              </div>
            </div>
          </div>
        )}

        {/* INPUTS TAB */}
        {activeTab === 'inputs' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Text Input</h3>
              <input
                type="text"
                placeholder="Placeholder text"
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Textarea</h3>
              <textarea
                placeholder="Enter multi-line text..."
                rows={4}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Select Dropdown</h3>
              <select className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-500 transition-colors">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Checkbox & Radio</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded" />
                  <span className="text-sm">Checkbox option</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="demo" className="w-4 h-4" />
                  <span className="text-sm">Radio option</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ICONS TAB */}
        {activeTab === 'icons' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Action Icons</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { icon: Plus, name: 'Add' },
                  { icon: Edit, name: 'Edit' },
                  { icon: Trash2, name: 'Delete' },
                  { icon: Settings, name: 'Settings' },
                  { icon: Check, name: 'Check' },
                  { icon: X, name: 'Close' },
                  { icon: LogOut, name: 'Logout' },
                  { icon: AlertCircle, name: 'Alert' },
                ].map(({ icon: Icon, name }) => (
                  <div key={name} className="flex flex-col items-center gap-2">
                    <Icon className="w-8 h-8 text-indigo-400" />
                    <p className="text-xs text-slate-400">{name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Icon Sizes</h3>
              <div className="flex items-center gap-8">
                <Plus className="w-4 h-4 text-indigo-400" />
                <Plus className="w-6 h-6 text-indigo-400" />
                <Plus className="w-8 h-8 text-indigo-400" />
                <Plus className="w-10 h-10 text-indigo-400" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

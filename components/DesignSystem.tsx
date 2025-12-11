import React, { useMemo, useState } from 'react';
import {
  Plus,
  Settings,
  LogOut,
  Trash2,
  Edit,
  Check,
  X,
  AlertCircle,
  Info,
  Search,
  Globe,
  Shield,
  Palette,
} from 'lucide-react';
import { Button } from './Button';

type Tab = 'colors' | 'buttons' | 'badges' | 'inputs' | 'icons';

const Swatch: React.FC<{ label: string; className: string; helper?: string }> = ({ label, className, helper }) => (
  <div className="flex flex-col gap-2">
    <div className={`h-16 rounded-xl border border-slate-800 ${className}`} />
    <div className="text-xs text-slate-300 font-medium">{label}</div>
    {helper && <div className="text-[11px] text-slate-500">{helper}</div>}
  </div>
);

export const DesignSystem: React.FC = () => {
  const tabs: Tab[] = useMemo(() => ['colors', 'buttons', 'badges', 'inputs', 'icons'], []);
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl shadow-indigo-500/10 animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-white text-xl font-bold">
          <Settings className="w-5 h-5 text-indigo-400" />
          Design System
        </div>
        <p className="text-slate-400 text-sm">Tokens and UI primitives that match the live portal experience.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 font-medium text-sm transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'text-indigo-300 border-indigo-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Swatch label="Primary Indigo 500" className="bg-indigo-500 shadow-lg shadow-indigo-500/30" helper="#6366f1" />
              <Swatch label="Electric Blue 500" className="bg-blue-500 shadow-lg shadow-blue-500/30" helper="#3b82f6" />
              <Swatch label="Accent Magenta 500" className="bg-fuchsia-500 shadow-lg shadow-fuchsia-500/30" helper="#d946ef" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Surfaces</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Swatch label="Slate 950 (page)" className="bg-slate-950" helper="Background" />
                <Swatch label="Slate 900 (card)" className="bg-slate-900" helper="Card surface" />
                <Swatch label="Slate 800 (border)" className="bg-slate-800" helper="Borders / input" />
                <Swatch label="Slate 700 (muted)" className="bg-slate-700" helper="Muted elements" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Text</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Swatch label="Text / Primary" className="bg-slate-200" helper="HEX: #e2e8f0" />
                <Swatch label="Text / Secondary" className="bg-slate-400" helper="HEX: #94a3b8" />
                <Swatch label="Text / Subtle" className="bg-slate-500" helper="HEX: #64748b" />
                <Swatch label="Text / Accent" className="bg-indigo-300" helper="HEX: #a5b4fc" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Swatch label="Success 500" className="bg-emerald-500" helper="Approvals" />
                <Swatch label="Warning 500" className="bg-amber-500" helper="Pending / warning" />
                <Swatch label="Error 500" className="bg-red-500" helper="Danger states" />
                <Swatch label="Info 500" className="bg-blue-500" helper="Informational" />
              </div>
            </div>
          </div>
        )}

        {/* BUTTONS TAB */}
        {activeTab === 'buttons' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Primary actions</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white border border-indigo-400/60 shadow-lg shadow-indigo-500/25"
                >
                  Primary (gradient)
                </Button>
                <Button
                  variant="secondary"
                  className="bg-slate-800 text-slate-100 border border-slate-700 hover:border-indigo-400/60"
                  icon={<Plus className="w-4 h-4" />}
                >
                  With Icon
                </Button>
                <Button
                  variant="ghost"
                  className="border border-slate-800 bg-slate-900/60 text-slate-100 hover:border-slate-700"
                >
                  Ghost
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Danger & states</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="danger"
                  className="bg-rose-500/10 text-rose-300 border border-rose-400/50 hover:bg-rose-500/15"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Delete
                </Button>
                <Button isLoading className="bg-slate-800 border border-slate-700 text-slate-100">
                  Loading…
                </Button>
                <Button disabled className="bg-slate-900 border border-slate-800 text-slate-500">
                  Disabled
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button className="px-3 py-1.5 text-sm">Small</Button>
                <Button className="px-4 py-2 text-sm">Medium</Button>
                <Button className="px-5 py-2.5 text-base">Large</Button>
              </div>
            </div>
          </div>
        )}

        {/* BADGES TAB */}
        {activeTab === 'badges' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Status badges</h3>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-400/40">
                  <Check className="w-3 h-3 mr-1" /> Approved
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-400/40">
                  Pending
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-300 border border-red-400/40">
                  <X className="w-3 h-3 mr-1" /> Rejected
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-300 border border-blue-400/40">
                  <Info className="w-3 h-3 mr-1" /> Info
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Roles & pills</h3>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-400/40">
                  <Shield className="w-3 h-3 mr-1" /> Admin
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                  User
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-200 border border-purple-400/40">
                  Beta Feature
                </span>
              </div>
            </div>
          </div>
        )}

        {/* INPUTS TAB */}
        {activeTab === 'inputs' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Text input</h3>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search or type here..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Select</h3>
                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30">
                    <option>English</option>
                    <option>Thai</option>
                    <option>Japanese</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Textarea</h3>
                <textarea
                  rows={4}
                  placeholder="Enter multi-line text..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Checkbox & Radio</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500" defaultChecked />
                    <span className="text-sm text-slate-200">Remember me</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="demo" className="w-4 h-4 border-slate-700 bg-slate-900 text-indigo-500" defaultChecked />
                    <span className="text-sm text-slate-200">Radio option</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ICONS TAB */}
        {activeTab === 'icons' && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Action icons</h3>
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
                    <Icon className="w-8 h-8 text-indigo-300" />
                    <p className="text-xs text-slate-400">{name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Decorative</h3>
              <div className="flex items-center gap-8">
                <Palette className="w-6 h-6 text-indigo-300" />
                <Shield className="w-6 h-6 text-blue-300" />
                <Globe className="w-6 h-6 text-fuchsia-300" />
                <Info className="w-6 h-6 text-emerald-300" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

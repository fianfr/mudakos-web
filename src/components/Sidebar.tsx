import React from 'react';
import { 
  LayoutDashboard, 
  PiggyBank, 
  Users, 
  ReceiptText, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Building,
  Wrench,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  trialDays: number;
  onResetTrial: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, trialDays, onResetTrial }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'financials', label: 'Financial Control', icon: PiggyBank },
    { id: 'users', label: 'Tenants & Reminders', icon: Users },
    { id: 'receipts', label: 'Payment Receipts', icon: ReceiptText },
    { id: 'complaints', label: 'Complaints / Repair', icon: Wrench },
    { id: 'ai', label: 'AI recommendations', icon: Sparkles },
    { id: 'sheets', label: 'Google Sheets Export', icon: FileSpreadsheet },
  ];

  const trialProgressPercentage = Math.max(0, Math.min(100, (trialDays / 30) * 100));

  return (
    <aside className="w-72 bg-white border-r border-soft-200 flex flex-col h-screen fixed top-0 left-0 z-20">
      {/* Branding Header */}
      <div className="p-6 border-b border-soft-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-forest-300 flex items-center justify-center text-white shadow-sm">
          <Building className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-display font-bold text-xl tracking-tight text-soft-900 leading-none">
            MudaKost
          </h1>
          <p className="text-xs text-soft-500 font-medium tracking-wide mt-1">
            ROOM RENTAL DASHBOARD
          </p>
        </div>
      </div>

      {/* Navigation menu list */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group text-left ${
                isActive
                  ? 'bg-forest-50 text-forest-700 shadow-xs border-l-4 border-forest-500'
                  : 'text-soft-650 hover:bg-soft-100 hover:text-soft-900'
              }`}
            >
              <Icon className={`w-4.5 h-4.5 transition-colors ${
                isActive ? 'text-forest-600' : 'text-soft-400 group-hover:text-soft-600'
              }`} />
              <span className="flex-1">{item.label}</span>
              {item.id === 'ai' && (
                <span className="text-[10px] bg-forest-300 text-white font-semibold py-0.5 px-1.5 rounded-full uppercase tracking-wider scale-90">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 30 Days Free Trial Block */}
      <div className="p-5 border-t border-soft-100 bg-soft-50/50">
        <div className="p-4 rounded-xl bg-white border border-soft-200 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-forest-700">
            <ShieldCheck className="w-4 h-4 text-forest-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Free Trial License</span>
          </div>
          
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-bold font-mono text-soft-900">
              {trialDays}
            </span>
            <span className="text-xs font-medium text-soft-500">
              of 30 days remains
            </span>
          </div>

          {/* Progress bar container */}
          <div className="w-full bg-soft-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-forest-300 h-full rounded-full transition-all duration-300"
              style={{ width: `${trialProgressPercentage}%` }}
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-[11px]">
            <span className="text-soft-450 font-medium">Evaluation Period</span>
            <button 
              onClick={onResetTrial}
              className="text-forest-600 hover:text-forest-800 font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-3 h-3" /> Reset Period
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

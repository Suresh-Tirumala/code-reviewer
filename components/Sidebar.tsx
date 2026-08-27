
import React from 'react';
import { TabType, User } from '../types';
import { RobotLogo } from './RobotLogo';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  user: User | null;
  customLogo: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onOpenProfile,
  user,
  customLogo
}) => {
  const menuItems = [
    { id: 'editor', icon: 'fa-code', label: 'Editor' },
    { id: 'review', icon: 'fa-magnifying-glass', label: 'Review' },
    { id: 'rewrite', icon: 'fa-wand-magic-sparkles', label: 'Rewrite' },
    { id: 'output', icon: 'fa-terminal', label: 'Output' },
    { id: 'history', icon: 'fa-clock-rotate-left', label: 'History' },
  ];

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : 'U';

  return (
    <aside className="fixed bottom-0 left-0 right-0 z-40 bg-obsidian text-slate-400 flex items-stretch border-t border-slate-800 safe-bottom md:static md:top-0 md:bottom-auto md:left-auto md:right-auto md:sticky md:h-screen md:w-64 md:flex-col md:items-stretch md:border-t-0 md:border-r md:z-30 md:transition-all md:pb-0">
      <div className="hidden md:flex p-6 items-center gap-3">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg overflow-hidden border border-white/10">
          {customLogo ? (
            <img 
              src={customLogo} 
              alt="Logo" 
              className="w-full h-full object-cover p-1" 
              referrerPolicy="no-referrer"
            />
          ) : (
            <RobotLogo className="w-full h-full p-1" />
          )}
        </div>
        <span className="hidden md:block font-bold text-white tracking-tight text-lg uppercase">CODING AGENT</span>
      </div>

      <nav className="flex-1 flex md:flex-col items-stretch md:items-stretch md:px-4 md:mt-8 md:space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            aria-label={item.label}
            title={item.label}
            className={`flex-1 md:flex-none md:w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-4 px-1 md:px-4 py-2 md:py-3 rounded-none md:rounded-xl transition-all active:bg-blue-600/40 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'md:hover:bg-slate-800/50 md:hover:text-slate-200'
            }`}
          >
            <i className={`fas ${item.icon} w-5 text-base md:text-sm`}></i>
            <span className="text-[8px] md:text-sm font-semibold md:font-medium uppercase md:normal-case tracking-tighter md:tracking-normal">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex md:hidden items-stretch border-l border-slate-800/50">
        <button 
          onClick={onOpenSettings}
          aria-label="Settings"
          title="Settings"
          className="w-12 flex items-center justify-center transition-all hover:bg-slate-800/50 text-slate-500 group"
        >
          <i className="fas fa-gear w-5 text-base group-hover:text-blue-400"></i>
        </button>
        <button 
          onClick={onOpenProfile}
          aria-label="Profile"
          title="Profile"
          className="w-12 flex items-center justify-center transition-all hover:bg-slate-800/50 text-slate-500 group"
        >
          <i className="fas fa-circle-user w-5 text-base group-hover:text-blue-400"></i>
        </button>
      </div>

      <div className="hidden md:block p-4 mt-auto border-t border-slate-800/50">
        <div className="space-y-1">
          <button 
            onClick={onOpenSettings}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-800/50 hover:text-slate-200 group"
          >
            <i className="fas fa-gear w-5 text-slate-500 group-hover:text-blue-400"></i>
            <span className="hidden md:block font-medium text-sm">Settings</span>
          </button>
          <button 
            onClick={onOpenProfile}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-slate-800/50 hover:text-slate-200 group"
          >
            <i className="fas fa-circle-user w-5 text-slate-500 group-hover:text-blue-400"></i>
            <span className="hidden md:block font-medium text-sm">Profile</span>
          </button>
        </div>
        
        <div className="hidden md:flex items-center gap-3 mt-4 p-3 bg-slate-900/50 rounded-xl border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">
            {userInitials}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'User'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

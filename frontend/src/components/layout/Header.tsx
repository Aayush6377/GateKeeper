import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
  role: string;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen, role }) => {
  const { username } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 flex items-center justify-between shadow-xs">
      
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-500/20 text-emerald-800 text-xs font-mono shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium">Gateway Cluster: <strong className="font-bold text-emerald-900">Active</strong></span>
        </div>
      </div>
   
      <div className="flex items-center gap-3">
        
        <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-200/80 px-3 py-1.5 rounded-xl shadow-2xs hover:bg-gray-100/60 transition-all">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-bold text-gray-900 leading-none">{username || 'Administrator'}</div>
            <div className="text-[10px] font-mono text-emerald-600 font-medium mt-0.5 uppercase tracking-wider">
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>

      </div>

    </header>
  );
};
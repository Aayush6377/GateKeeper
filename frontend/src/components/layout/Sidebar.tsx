import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  ShieldAlert, 
  Network, 
  Settings, 
  FileText, 
  LogOut, 
  X 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../common/Logo';

interface SidebarProps {
  role: 'PLATFORM_ADMIN' | 'TENANT_ADMIN';
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, isMobileOpen, setMobileOpen }) => {
  const { username, logout } = useAuth();

  const platformNavItems = [
    { label: 'Overview Dashboard', path: '/platform/dashboard', icon: LayoutDashboard },
    { label: 'Manage Organizations', path: '/platform/organizations', icon: Building2 },
    { label: 'System Audit Logs', path: '/platform/audit', icon: ShieldAlert },
  ];

  const tenantNavItems = [
    { label: 'Tenant Dashboard', path: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'API Routes & Proxies', path: '/tenant/routes', icon: Network },
    { label: 'Tenant Settings', path: '/tenant/settings', icon: Settings },
    { label: 'Tenant Audit Logs', path: '/tenant/audit', icon: FileText },
  ];

  const navItems = role === 'PLATFORM_ADMIN' ? platformNavItems : tenantNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 select-none">
      
      <div className="p-6 flex items-center justify-between border-b border-gray-100">
        <Logo size="sm" />
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-6 py-4 bg-gray-50/70 border-b border-gray-100">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 block mb-1">
          Active Workspace
        </span>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold font-mono text-gray-800">
            {role === 'PLATFORM_ADMIN' ? 'Platform Control Plane' : 'Tenant Organization'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <span className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-gray-400 block mb-3">
          Main Navigation
        </span>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-600/20 border border-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Profile Footer inside Sidebar */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50 m-3 rounded-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
            {username ? username.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-gray-900 truncate">{username || 'Administrator'}</h4>
            <span className="text-[10px] font-mono text-emerald-600 block truncate">
              {role.replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-medium hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all cursor-pointer shadow-sm"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign Out
        </button>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </aside>
    </>
  );
};
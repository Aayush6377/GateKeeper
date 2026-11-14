import React from 'react';
import { Sparkles } from 'lucide-react';

interface DemoCredentialsCardProps {
  onSelectDemo: (username: string, pass: string) => void;
}

export const DemoCredentialsCard: React.FC<DemoCredentialsCardProps> = ({ onSelectDemo }) => {
  const platformUser = import.meta.env.VITE_DEMO_PLATFORM_USER;
  const platformPass = import.meta.env.VITE_DEMO_PLATFORM_PASS;
  
  const tenantUser = import.meta.env.VITE_DEMO_TENANT_USER;
  const tenantPass = import.meta.env.VITE_DEMO_TENANT_PASS;

  return (
    <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Quick Demo Access</span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          Instant Login
        </span>
      </div>
      
      <p className="text-[11px] text-slate-500 leading-relaxed">
        Click below to auto-fill credentials and test platform or tenant dashboards instantly:
      </p>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onSelectDemo(platformUser, platformPass)}
          className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-xs"
        >
          <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
            Platform Admin
          </span>
          <span className="text-[10px] font-mono text-slate-400 block truncate">
            {platformUser}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectDemo(tenantUser, tenantPass)}
          className="p-2.5 rounded-xl bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 text-left transition-all group cursor-pointer shadow-xs"
        >
          <span className="text-xs font-bold text-slate-900 block group-hover:text-emerald-700 transition-colors">
            Tenant Admin
          </span>
          <span className="text-[10px] font-mono text-slate-400 block truncate">
            {tenantUser}
          </span>
        </button>
      </div>
    </div>
  );
};
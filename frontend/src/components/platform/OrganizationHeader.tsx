import React from 'react';
import { Building2, Plus } from 'lucide-react';

interface OrganizationHeaderProps {
  onOpenCreateModal: () => void;
}

export const OrganizationHeader: React.FC<OrganizationHeaderProps> = ({ onOpenCreateModal }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
      <div>
        <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
          <Building2 className="w-3.5 h-3.5" /> Tenant Directory
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Organizations Management</h1>
        <p className="text-xs text-gray-500 mt-1">
          Provision, monitor, and regulate enterprise tenants connected to the gateway.
        </p>
      </div>

      <button
        onClick={onOpenCreateModal}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Register Organization</span>
      </button>
    </div>
  );
};
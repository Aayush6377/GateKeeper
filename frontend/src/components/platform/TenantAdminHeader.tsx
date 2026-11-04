import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft } from 'lucide-react';

interface TenantAdminHeaderProps {
  orgName?: string;
  onOpenCreateModal: () => void;
}

export const TenantAdminHeader: React.FC<TenantAdminHeaderProps> = ({ orgName, onOpenCreateModal }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/platform/organizations')}
            className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
            <Users className="w-3.5 h-3.5" /> Workspace Control
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          {orgName ? `${orgName} — Administrators` : 'Tenant Administrators'}
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage access credentials, security status, and tenant administrator accounts.
        </p>
      </div>

      <button
        onClick={onOpenCreateModal}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-medium shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
      >
        <UserPlus className="w-4 h-4" />
        <span>Add Tenant User</span>
      </button>
    </div>
  );
};
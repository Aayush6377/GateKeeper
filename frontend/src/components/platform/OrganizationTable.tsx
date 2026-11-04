import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Edit3, Trash2, RotateCcw } from 'lucide-react';
import { type OrganizationResponse, type OrganizationStatus } from '../../services/organizationService';

interface OrganizationTableProps {
  organizations: OrganizationResponse[];
  isInitialLoading: boolean;
  isDeletedView?: boolean;
  onStatusChange: (id: string, status: OrganizationStatus) => void;
  onEdit: (org: OrganizationResponse) => void;
  onDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
}

export const OrganizationTable: React.FC<OrganizationTableProps> = ({
  organizations,
  isInitialLoading,
  isDeletedView = false,
  onStatusChange,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const navigate = useNavigate();

  const getStatusBadgeClass = (status: OrganizationStatus) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'DELETED':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 px-6">Organization Name</th>
              <th className="py-3.5 px-6">Slug Identifier</th>
              <th className="py-3.5 px-6">Status</th>
              <th className="py-3.5 px-6">Created Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isInitialLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gray-200" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 bg-gray-200 rounded-md" />
                        <div className="h-3 w-20 bg-gray-100 rounded-md" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6"><div className="h-5 w-24 bg-gray-200 rounded-md" /></td>
                  <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-lg" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded-md" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-8 w-24 bg-gray-200 rounded-xl ml-auto" /></td>
                </tr>
              ))
            ) : organizations.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-400 font-mono text-xs">
                  {isDeletedView ? 'No archived or deleted organizations found.' : 'No active organizations found matching your criteria.'}
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                        {org.name ? org.name.charAt(0).toUpperCase() : 'O'}
                      </div>
                      <div>
                        <span>{org.name}</span>
                        <span className="block text-[11px] font-mono text-gray-400 font-normal">ID: {org.id?.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-600">
                    <span className="px-2.5 py-1 rounded-md bg-gray-100 border border-gray-200">{org.slug}</span>
                  </td>
                  <td className="py-4 px-6">
                    {isDeletedView ? (
                      <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border bg-gray-100 text-gray-600 border-gray-200">
                        DELETED
                      </span>
                    ) : (
                      <select
                        value={org.status}
                        onChange={(e) => onStatusChange(org.id, e.target.value as OrganizationStatus)}
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border cursor-pointer outline-none transition-all ${getStatusBadgeClass(org.status)}`}
                      >
                        <option value="PENDING" disabled>PENDING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    )}
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">
                    {org.createdAt ? `${new Date(org.createdAt).toLocaleDateString()} ${new Date(org.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {!isDeletedView && (
                        <>
                          <button
                            onClick={() => navigate(`/platform/organizations/${org.id}/admins`)}
                            title="Manage Tenant Admins & Users"
                            className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                          >
                            <Users className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEdit(org)}
                            title="Edit Organization"
                            className="p-2 rounded-xl text-gray-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDelete(org.id, org.name)}
                            title="Archive Organization"
                            className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {isDeletedView && (
                        <button
                          onClick={() => onRestore(org.id, org.name)}
                          title="Restore Organization"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-medium transition-all cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
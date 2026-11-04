import React from 'react';
import { Edit3, Trash2, Power } from 'lucide-react';
import type { TenantAdminListItem } from '../../services/tenantAdminService';

interface TenantAdminTableProps {
  users: TenantAdminListItem[];
  isInitialLoading: boolean;
  onToggleEnable: (user: TenantAdminListItem) => void;
  onEdit: (user: TenantAdminListItem) => void;
  onDelete: (id: string, username: string) => void;
}

export const TenantAdminTable: React.FC<TenantAdminTableProps> = ({
  users,
  isInitialLoading,
  onToggleEnable,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 px-6">Username</th>
              <th className="py-3.5 px-6">Access Status</th>
              <th className="py-3.5 px-6">Created Date</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isInitialLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
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
                  <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-lg" /></td>
                  <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded-md" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-8 w-24 bg-gray-200 rounded-xl ml-auto" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 font-mono text-xs">
                  No tenant administrators found.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-semibold text-gray-900 font-mono">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-500/20 text-emerald-700 font-bold flex items-center justify-center text-xs shadow-2xs">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div>
                        <span>{user.username}</span>
                        <span className="block text-[10px] font-mono text-gray-400 font-normal">ID: {user.id?.substring(0, 10)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => onToggleEnable(user)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-semibold border cursor-pointer transition-all ${
                        user.enabled 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{user.enabled ? 'ENABLED' : 'DISABLED'}</span>
                    </button>
                  </td>
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">
                    {user.createdAt ? `${new Date(user.createdAt).toLocaleDateString()} ${new Date(user.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEdit(user)}
                        title="Edit User"
                        className="p-2 rounded-xl text-gray-500 hover:text-sky-600 hover:bg-sky-50 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(user.id, user.username)}
                        title="Delete User"
                        className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
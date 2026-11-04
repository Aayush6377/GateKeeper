import React from 'react';
import { Eye } from 'lucide-react';
import type { AuditRecordResponse, AuditResult } from '../../services/auditService';

interface AuditTableProps {
  audits: AuditRecordResponse[];
  isInitialLoading: boolean;
  isAdminPlatform?: boolean;
  onViewDetails: (audit: AuditRecordResponse) => void;
}

export const AuditTable: React.FC<AuditTableProps> = ({
  audits,
  isInitialLoading,
  isAdminPlatform = false,
  onViewDetails,
}) => {
  const getResultBadgeClass = (result: AuditResult) => {
    switch (result) {
      case 'SUCCESS':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'WARNING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'FAILURE':
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-[11px] font-mono font-semibold uppercase tracking-wider text-gray-500">
              <th className="py-3.5 px-6">Timestamp</th>
              {isAdminPlatform && <th className="py-3.5 px-6">Organization</th>}
              <th className="py-3.5 px-6">Actor</th>
              <th className="py-3.5 px-6">Action</th>
              <th className="py-3.5 px-6">Result</th>
              <th className="py-3.5 px-6 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {isInitialLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="py-4 px-6"><div className="h-4 w-32 bg-gray-200 rounded-md" /></td>
                  {isAdminPlatform && <td className="py-4 px-6"><div className="h-4 w-28 bg-gray-200 rounded-md" /></td>}
                  <td className="py-4 px-6"><div className="h-4 w-24 bg-gray-200 rounded-md" /></td>
                  <td className="py-4 px-6"><div className="h-5 w-32 bg-gray-200 rounded-md" /></td>
                  <td className="py-4 px-6"><div className="h-6 w-20 bg-gray-200 rounded-lg" /></td>
                  <td className="py-4 px-6 text-right"><div className="h-8 w-16 bg-gray-200 rounded-xl ml-auto" /></td>
                </tr>
              ))
            ) : audits.length === 0 ? (
              <tr>
                <td colSpan={isAdminPlatform ? 6 : 5} className="py-12 text-center text-gray-400 font-mono text-xs">
                  No audit logs found matching criteria.
                </td>
              </tr>
            ) : (
              audits.map((audit) => (
                <tr key={audit.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-gray-500">
                    {new Date(audit.createdAt).toLocaleDateString()} {new Date(audit.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  {isAdminPlatform && (
                    <td className="py-4 px-6 font-semibold text-gray-900">
                      {audit.organization ? (
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-xs border border-emerald-200">
                          {audit.organization.name}
                        </span>
                      ) : (
                        <span className="text-xs font-mono text-gray-400">System Core</span>
                      )}
                    </td>
                  )}
                  <td className="py-4 px-6 font-mono text-xs text-gray-800 font-semibold">{audit.actor}</td>
                  <td className="py-4 px-6 font-mono text-xs text-emerald-700 font-bold">{audit.action}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider border ${getResultBadgeClass(audit.result)}`}>
                      {audit.result}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onViewDetails(audit)}
                      title="Inspect Record Payload"
                      className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
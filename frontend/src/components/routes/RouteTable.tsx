import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RouteResponse } from '../../services/routeService';
import { Edit, Trash2, History, RotateCcw, ShieldCheck, ShieldAlert, Globe, Loader2 } from 'lucide-react';

interface Props {
  routes: RouteResponse[];
  isInitialLoading: boolean;
  isDeletedView: boolean;
  onStatusChange: (id: string, status: 'ACTIVE' | 'INACTIVE') => void;
  onDelete: (id: string, name: string) => void;
  onRestore: (id: string, name: string) => void;
  isStatusChanging?: boolean; 
}

export const RouteTable: React.FC<Props> = ({
  routes,
  isInitialLoading,
  isDeletedView,
  onStatusChange,
  onDelete,
  onRestore,
}) => {
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusClick = async (id: string, currentStatus: string) => {
    if (updatingId) return;
    setUpdatingId(id);
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    
    try {
      await onStatusChange(id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-6 font-semibold">Route & Path</th>
                <th className="py-3.5 px-6 font-semibold">Methods</th>
                <th className="py-3.5 px-6 font-semibold">Target Upstream</th>
                <th className="py-3.5 px-6 font-semibold">Throttling & Guard</th>
                <th className="py-3.5 px-6 font-semibold">Status</th>
                <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-24"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-5 bg-gray-200 rounded w-20"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-36"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <div className="h-7 w-7 bg-gray-200 rounded-lg"></div>
                      <div className="h-7 w-7 bg-gray-200 rounded-lg"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xs font-mono text-gray-400">
        {isDeletedView ? 'No archived routes found.' : 'No active API routes registered.'}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-mono text-gray-500 uppercase tracking-wider">
              <th className="py-3.5 px-6 font-semibold">Route & Path</th>
              <th className="py-3.5 px-6 font-semibold">Methods</th>
              <th className="py-3.5 px-6 font-semibold">Target Upstream</th>
              <th className="py-3.5 px-6 font-semibold">Throttling & Guard</th>
              <th className="py-3.5 px-6 font-semibold">Status</th>
              <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {routes.map(route => {
              const isActive = route.status === 'ACTIVE';
              const isUpdating = updatingId === route.id;

              return (
                <tr key={route.id} className="hover:bg-gray-50/50 transition-colors">
                  
                  {/* Route ID & Path */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900 mb-0.5">{route.name}</div>
                    <div className="font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded w-fit text-[11px] mb-1">
                      {route.pathPattern}
                    </div>
                    <div className="text-[10px] font-mono text-gray-400">ID: {route.routeId} (v{route.configurationVersion})</div>
                  </td>

                  {/* Allowed Methods */}
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {route.allowedMethods.map(m => (
                        <span key={m} className="px-1.5 py-0.5 bg-gray-100 text-gray-700 font-mono text-[10px] font-bold rounded">
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Target Base URL */}
                  <td className="py-4 px-6 font-mono text-gray-600">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]" title={route.targetBaseUrl}>
                      <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{route.targetBaseUrl}</span>
                    </div>
                    {route.targetPathPrefix && (
                      <div className="text-[10px] text-gray-400 mt-0.5">Prefix: {route.targetPathPrefix}</div>
                    )}
                  </td>

                  {/* Throttling & Idempotency */}
                  <td className="py-4 px-6 font-mono text-gray-600">
                    <div>{route.requestsPerMinute || 60} RPM</div>
                    <div className="text-[10px] text-gray-400">Timeout: {route.responseTimeoutMs || 5000}ms</div>
                    {route.idempotencyEnabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 font-sans">
                        <ShieldCheck className="w-3 h-3" /> Idempotent
                      </span>
                    )}
                  </td>

                  {/* Status Toggle  */}
                  <td className="py-4 px-6">
                    {!isDeletedView ? (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusClick(route.id, route.status)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : isActive ? (
                          <ShieldCheck className="w-3 h-3" />
                        ) : (
                          <ShieldAlert className="w-3 h-3" />
                        )}
                        {isUpdating ? 'Updating...' : route.status}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                        ARCHIVED
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {!isDeletedView ? (
                        <>
                          <button
                            type="button"
                            title="Version Audit History"
                            onClick={() => navigate(`/tenant/routes/${route.id}/versions`)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <History className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Edit Route"
                            onClick={() => navigate(`/tenant/routes/${route.id}/edit`)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            title="Archive Route"
                            onClick={() => onDelete(route.id, route.name)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-600 hover:bg-rose-50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          title="Restore Route"
                          onClick={() => onRestore(route.id, route.name)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      )}
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import React from 'react';
import type { RouteVersionResponse } from '../../services/routeService';
import { X, RotateCcw, Shield, Globe } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  version: RouteVersionResponse | null;
  onRestore: (versionId: string) => void;
  isRestoring: boolean;
}

export const RouteVersionSnapshotModal: React.FC<Props> = ({
  isOpen,
  onClose,
  version,
  onRestore,
  isRestoring,
}) => {
  if (!isOpen || !version) return null;

  const snapshot = version.configurationSnapshot;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Version #{version.versionNumber} Snapshot Inspection
              </h3>
              <p className="text-xs text-gray-500 font-mono">
                Recorded on {new Date(version.createdAt).toLocaleString()} • Change Type: <span className="font-bold text-emerald-600">{version.changeType}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Snapshot details */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          
          {/* Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Route Identifier</span>
              <span className="font-bold text-gray-900 text-sm">{snapshot.routeId}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Display Name</span>
              <span className="font-bold text-gray-900 text-sm">{snapshot.name}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Path Pattern (AntMatcher)</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded inline-block">{snapshot.pathPattern}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans flex items-center gap-1">
                <Globe className="w-3 h-3" /> Target Base URL
              </span>
              <span className="text-gray-800 break-all">{snapshot.targetBaseUrl}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Target Path Prefix</span>
              <span className="text-gray-800">{snapshot.targetPathPrefix || 'None'}</span>
            </div>
          </div>

          {/* Traffic Specs */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans mb-1">RPM Limit</span>
              <span className="font-bold text-gray-900 text-sm">{snapshot.requestsPerMinute || 60}</span>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans mb-1">Timeout</span>
              <span className="font-bold text-gray-900 text-sm">{snapshot.responseTimeoutMs || 5000}ms</span>
            </div>
            <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200/60 text-center">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans mb-1">Idempotency</span>
              <span className={`font-bold text-xs px-2 py-0.5 rounded inline-block ${snapshot.idempotencyEnabled ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>
                {snapshot.idempotencyEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>

          {/* Allowed Methods */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Allowed HTTP Methods</span>
            <div className="flex flex-wrap gap-1.5">
              {snapshot.allowedMethods.map(m => (
                <span key={m} className="px-2 py-1 bg-white border border-gray-200 text-gray-800 font-bold rounded-lg text-xs">
                  {m}
                </span>
              ))}
            </div>
          </div>

          {/* Header Rules */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-sans">Header Transformation Rules</span>
            {snapshot.headerRules.length === 0 ? (
              <p className="text-gray-400 italic">No header rules in this version snapshot.</p>
            ) : (
              <div className="space-y-2">
                {snapshot.headerRules.map((rule, idx) => (
                  <div key={idx} className="bg-white p-2.5 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-gray-100 font-bold rounded text-[10px]">{rule.direction}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded text-[10px]">{rule.action}</span>
                      <span className="font-bold text-gray-900">{rule.headerName}</span>
                    </div>
                    {rule.headerValue && <span className="text-gray-500 font-mono text-[11px]">= {rule.headerValue}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/75">
          <span className="text-xs text-gray-400 font-mono">Restoring will generate a new live configuration version.</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              disabled={isRestoring}
              onClick={() => onRestore(version.id)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{isRestoring ? 'Restoring Version...' : 'Restore This Version'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
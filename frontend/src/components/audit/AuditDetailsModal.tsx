import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';
import { type AuditRecordResponse } from '../../services/auditService';

interface AuditDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: AuditRecordResponse | null;
}

export const AuditDetailsModal: React.FC<AuditDetailsModalProps> = ({ isOpen, onClose, audit }) => {
  if (!audit) return null;

  const renderDetails = (details: string | null | undefined) => {
    if (!details) return 'No additional details logged.';
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return details;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden"
          >
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-900 text-white">
                  <ShieldAlert className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Audit Record Inspector</h3>
                  <p className="text-xs font-mono text-gray-500">ID: {audit.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Actor / Principal</span>
                  <strong className="text-gray-900 font-mono text-xs">{audit.actor}</strong>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Action</span>
                  <strong className="text-emerald-700 font-mono text-xs">{audit.action}</strong>
                </div>
              </div>

              {audit.organization && (
                <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-500/20">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-600">Organization Context</span>
                  <strong className="text-emerald-900">{audit.organization.name}</strong> <span className="text-xs font-mono text-gray-500">({audit.organization.id})</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Resource Type</span>
                  <span className="text-gray-800 font-mono text-xs">{audit.resourceType || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Resource ID</span>
                  <span className="text-gray-800 font-mono text-xs truncate block">{audit.resourceId || 'N/A'}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                  <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400">Duration</span>
                  <span className="text-gray-800 font-mono text-xs">{audit.durationMs} ms</span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200/60">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-gray-400 mb-1">Correlation ID</span>
                <span className="text-xs font-mono text-gray-700 bg-white px-2.5 py-1 rounded border border-gray-200 block">{audit.correlationId || 'N/A'}</span>
              </div>

              <div>
                <span className="block text-xs font-semibold text-gray-700 mb-1">Payload / Details</span>
                <pre className="p-3.5 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap">
                  {renderDetails(audit.details)}
                </pre>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
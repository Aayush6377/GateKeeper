import React from 'react';
import type { RouteVersionResponse } from '../../services/routeService';
import { Clock, Eye, ShieldCheck } from 'lucide-react';

interface Props {
  version: RouteVersionResponse;
  onViewSnapshot: (version: RouteVersionResponse) => void;
  isLatest: boolean;
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  CREATED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  UPDATED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ACTIVATED: 'bg-green-50 text-green-700 border-green-200',
  DEACTIVATED: 'bg-amber-50 text-amber-700 border-amber-200',
  DELETED: 'bg-rose-50 text-rose-700 border-rose-200',
  RESTORED: 'bg-blue-50 text-blue-700 border-blue-200',
};

export const RouteVersionTimelineItem: React.FC<Props> = ({ version, onViewSnapshot, isLatest }) => {
  const badgeClass = CHANGE_TYPE_COLORS[version.changeType] || 'bg-gray-50 text-gray-700 border-gray-200';
  const snapshot = version.configurationSnapshot;

  return (
    <div className="relative pl-8 sm:pl-10 pb-8 group last:pb-0">
      {/* Timeline Vertical Line */}
      <div className="absolute left-3.5 top-3.5 bottom-0 w-0.5 bg-gray-200 group-last:hidden" />

      {/* Timeline Node Bullet */}
      <div className={`absolute left-1.5 top-2.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all ${
        isLatest ? 'border-emerald-600 shadow-[0_0_0_4px_#ecfdf5]' : 'border-gray-400'
      }`}>
        {isLatest && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
      </div>

      {/* Card Content */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:border-emerald-300 transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-lg">
              v{version.versionNumber}
            </span>
            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badgeClass}`}>
              {version.changeType}
            </span>
            {isLatest && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
                <ShieldCheck className="w-3 h-3" /> Active Version
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-gray-400">
            <Clock className="w-3.5 h-3.5" />
            {new Date(version.createdAt).toLocaleString()}
          </div>
        </div>

        {/* Snapshot Summary Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100 text-xs font-mono mb-4">
          <div>
            <span className="text-gray-400 block text-[10px]">ROUTE NAME</span>
            <span className="font-bold text-gray-800">{snapshot.name}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">PATH PATTERN</span>
            <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{snapshot.pathPattern}</span>
          </div>
          <div>
            <span className="text-gray-400 block text-[10px]">UPSTREAM TARGET</span>
            <span className="text-gray-700 truncate block" title={snapshot.targetBaseUrl}>{snapshot.targetBaseUrl}</span>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => onViewSnapshot(version)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 border border-gray-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> View Configuration Snapshot
          </button>
        </div>
      </div>
    </div>
  );
};
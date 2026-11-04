import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, History } from 'lucide-react';

export const RouteVersionsHeader: React.FC<{  routeId: string | undefined}> = ({ routeId }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/tenant/routes')}
          className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
            <History className="w-3.5 h-3.5" /> Audit & Versioning
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Version History {routeId ? (
              <span className="font-mono text-emerald-700"> — {routeId ?? ''}</span>
            ) : ''}
          </h1>
        </div>
      </div>
    </div>
  );
};
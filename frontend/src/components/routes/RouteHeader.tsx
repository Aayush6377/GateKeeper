import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, Plus } from 'lucide-react';

export const RouteHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
          <Network className="w-6 h-6" />
        </div>
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1">
            API Gateway Control Plane
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Route Management & Proxies
          </h1>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/tenant/routes/new')}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Register New Route</span>
      </button>
    </div>
  );
};
import React from 'react';
import type { RouteResponse } from '../../services/routeService';
import { Search, ChevronLeft, ChevronRight, Terminal } from 'lucide-react';

interface Props {
  routes: RouteResponse[];
  selectedId?: string;
  onSelect: (id: string) => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const RouteDocSidebar: React.FC<Props> = ({
  routes,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  page,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 shadow-sm p-4 space-y-3 flex flex-col h-[calc(100vh-200px)] sticky top-6">
      
      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search endpoints via API..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        />
      </div>

      <div className="px-1 py-1 flex items-center justify-between">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-400">Endpoints</span>
        <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Page {page + 1} of {Math.max(1, totalPages)}</span>
      </div>

      {/* Routes List */}
      <div className="space-y-1.5 overflow-y-auto flex-1 pr-1">
        {routes.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <Terminal className="w-6 h-6 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-400 font-mono">No routes match query</p>
          </div>
        ) : (
          routes.map((route) => {
            const isSelected = selectedId === route.id;
            return (
              <button
                key={route.id}
                type="button"
                onClick={() => onSelect(route.id)}
                className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1.5 border ${
                  isSelected 
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs ring-2 ring-emerald-500/10' 
                    : 'bg-white border-transparent hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-gray-900 truncate">{route.name}</span>
                  <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase">
                    {route.routeId}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 truncate">
                  {route.pathPattern}
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <button
            type="button"
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-mono text-[11px]"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <span className="text-gray-500 font-mono text-[11px]">{page + 1} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 font-mono text-[11px]"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
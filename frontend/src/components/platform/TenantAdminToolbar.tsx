import React from 'react';
import { Search } from 'lucide-react';

interface TenantAdminToolbarProps {
  search: string;
  setSearch: (val: string) => void;
  totalElements: number;
}

export const TenantAdminToolbar: React.FC<TenantAdminToolbarProps> = ({ search, setSearch, totalElements }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
      <div className="relative flex-1 max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username..."
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
        />
      </div>

      <div className="text-xs font-mono text-gray-400">
        Total Users: <strong className="text-gray-700">{totalElements}</strong>
      </div>
    </div>
  );
};
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  search: string;
  setSearch: (val: string) => void;
  totalElements: number;
}

export const RouteToolbar: React.FC<Props> = ({ search, setSearch, totalElements }) => {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by route ID, name, or path pattern..."
          className="w-full pl-10 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
        />
      </div>

      <div className="text-xs font-mono text-gray-500 px-2">
        Total Routes: <span className="font-bold text-gray-900">{totalElements}</span>
      </div>
    </div>
  );
};
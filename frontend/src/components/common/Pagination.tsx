import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  hasNext: boolean;
  isFetching?: boolean;
  onPageChange: (newPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalElements,
  first,
  hasNext,
  isFetching = false,
  onPageChange,
}) => {
  if (totalPages <= 0) return null;

  return (
    <div className="px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs font-mono text-gray-500">
        Showing page <strong className="text-gray-800">{page + 1}</strong> of <strong className="text-gray-800">{totalPages}</strong> ({totalElements} total entries)
        {isFetching && <span className="ml-3 text-emerald-600 animate-pulse">Syncing...</span>}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(page - 1, 0))}
          disabled={first}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
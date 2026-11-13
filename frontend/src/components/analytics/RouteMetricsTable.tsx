import React, { useState, useMemo } from 'react';
import { type RouteMetric } from '../../services/analyticsService';
import { Search, ArrowUpDown } from 'lucide-react';

interface Props {
  routes: RouteMetric[];
}

type SortField = 'totalRequests' | 'successRate' | 'avgLatencyMs' | 'errorCount';

export const RouteMetricsTable: React.FC<Props> = ({ routes }) => {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('totalRequests');
  const [sortAsc, setSortAsc] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(field);
      setSortAsc(false);
    }
  };

  const filteredAndSorted = useMemo(() => {
    return routes
      .filter(
        (r) =>
          r.routeId.toLowerCase().includes(search.toLowerCase()) ||
          (r.routeName && r.routeName.toLowerCase().includes(search.toLowerCase()))
      )
      .sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return sortAsc ? diff : -diff;
      });
  }, [routes, search, sortBy, sortAsc]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">Route Performance</h4>
          <p className="text-xs text-slate-500">Per-route traffic breakdown and reliability</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by route..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="py-3.5 px-5">Route</th>
              <th
                onClick={() => handleSort('totalRequests')}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none"
              >
                <div className="flex items-center gap-1">
                  Requests <ArrowUpDown size={13} />
                </div>
              </th>
              <th
                onClick={() => handleSort('successRate')}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none"
              >
                <div className="flex items-center gap-1">
                  Success Rate <ArrowUpDown size={13} />
                </div>
              </th>
              <th
                onClick={() => handleSort('errorCount')}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none"
              >
                <div className="flex items-center gap-1">
                  Errors <ArrowUpDown size={13} />
                </div>
              </th>
              <th
                onClick={() => handleSort('avgLatencyMs')}
                className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none"
              >
                <div className="flex items-center gap-1">
                  Avg Latency <ArrowUpDown size={13} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">
                  No matching route metrics found.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((route) => (
                <tr key={route.routeId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="font-semibold text-slate-900">
                      {route.routeName || route.routeId}
                    </div>
                    {route.routeName && route.routeName !== route.routeId && (
                      <div className="text-xs text-slate-400 font-mono">{route.routeId}</div>
                    )}
                  </td>
                  <td className="py-3.5 px-5 font-medium">
                    {route.totalRequests.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            route.successRate >= 95
                              ? 'bg-emerald-500'
                              : route.successRate >= 80
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, route.successRate))}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {route.successRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                        route.errorCount > 0
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {route.errorCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-600">
                    {route.avgLatencyMs.toFixed(1)} ms
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredAndSorted.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No matching route metrics found.
          </div>
        ) : (
          filteredAndSorted.map((route) => (
            <div key={route.routeId} className="p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-slate-900">
                  {route.routeName || route.routeId}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    route.successRate >= 95
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {route.successRate.toFixed(1)}% OK
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block">Requests</span>
                  <span className="font-semibold text-slate-800">
                    {route.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Errors</span>
                  <span className="font-semibold text-rose-600">
                    {route.errorCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Latency</span>
                  <span className="font-semibold text-slate-800">
                    {route.avgLatencyMs.toFixed(0)} ms
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
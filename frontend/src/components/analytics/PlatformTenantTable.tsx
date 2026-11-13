import React, { useState, useMemo } from 'react';
import { type TenantUsageMetric } from '../../services/analyticsService';
import { Search, ArrowUpDown, Building2 } from 'lucide-react';

interface Props {
  tenants: TenantUsageMetric[];
}

type SortField = 'totalRequests' | 'successRate' | 'avgLatencyMs' | 'errorCount';

export const PlatformTenantTable: React.FC<Props> = ({ tenants }) => {
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
    const query = search.toLowerCase();
    return tenants
      .filter(
        (t) =>
          (t.organizationName && t.organizationName.toLowerCase().includes(query)) ||
          t.organizationId.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        const diff = a[sortBy] - b[sortBy];
        return sortAsc ? diff : -diff;
      });
  }, [tenants, search, sortBy, sortAsc]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden mt-6">
      {/* Header & Search */}
      <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h4 className="text-base font-bold text-slate-900">Tenant Usage Breakdown</h4>
          <p className="text-xs text-slate-500">Cross-organization traffic and reliability metrics</p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or ID..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
              <th className="py-3.5 px-5">Organization</th>
              <th onClick={() => handleSort('totalRequests')} className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none">
                <div className="flex items-center gap-1">Requests <ArrowUpDown size={13} /></div>
              </th>
              <th onClick={() => handleSort('successRate')} className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none">
                <div className="flex items-center gap-1">Success Rate <ArrowUpDown size={13} /></div>
              </th>
              <th onClick={() => handleSort('errorCount')} className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none">
                <div className="flex items-center gap-1">Errors <ArrowUpDown size={13} /></div>
              </th>
              <th onClick={() => handleSort('avgLatencyMs')} className="py-3.5 px-5 cursor-pointer hover:text-slate-800 select-none">
                <div className="flex items-center gap-1">Avg Latency <ArrowUpDown size={13} /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-slate-400">No matching tenant metrics found.</td>
              </tr>
            ) : (
              filteredAndSorted.map((tenant) => (
                <tr key={tenant.organizationId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-5 flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm">
                        {tenant.organizationName || 'Unnamed Tenant'}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono tracking-tight">
                        {tenant.organizationId}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-medium">{tenant.totalRequests.toLocaleString()}</td>
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${tenant.successRate >= 95 ? 'bg-emerald-500' : tenant.successRate >= 80 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(100, Math.max(0, tenant.successRate))}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{tenant.successRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${tenant.errorCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                      {tenant.errorCount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs text-slate-600">{tenant.avgLatencyMs.toFixed(1)} ms</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View (Visible only on mobile screens) */}
      <div className="md:hidden divide-y divide-slate-100">
        {filteredAndSorted.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">
            No matching tenant metrics found.
          </div>
        ) : (
          filteredAndSorted.map((tenant) => (
            <div key={tenant.organizationId} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-sm text-slate-900 block">
                      {tenant.organizationName || 'Unnamed Tenant'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">
                      {tenant.organizationId}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    tenant.successRate >= 95
                      ? 'bg-emerald-50 text-emerald-700'
                      : tenant.successRate >= 80
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  {tenant.successRate.toFixed(1)}% OK
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Requests</span>
                  <span className="font-semibold text-slate-800">
                    {tenant.totalRequests.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Errors</span>
                  <span className="font-semibold text-rose-600">
                    {tenant.errorCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Latency</span>
                  <span className="font-semibold text-slate-800">
                    {tenant.avgLatencyMs.toFixed(0)} ms
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

export default PlatformTenantTable;
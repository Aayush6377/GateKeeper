import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Search } from 'lucide-react';
import { auditService, type AuditRecordResponse } from '../../services/auditService';
import { Pagination } from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import { AuditTable } from '../../components/audit/AuditTable';
import { AuditDetailsModal } from '../../components/audit/AuditDetailsModal';

export default function AuditLogsPage() {
  const { role } = useAuth();
  const isAdminPlatform = role === 'PLATFORM_ADMIN';

  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedAudit, setSelectedAudit] = useState<AuditRecordResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['audits', page, limit, debouncedSearch],
    queryFn: () => auditService.findAll({
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      direction: 'DESC',
    }),
    placeholderData: (previousData) => previousData,
  });

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-2">
            <ShieldAlert className="w-3.5 h-3.5" /> Security Subsystem
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {isAdminPlatform ? 'System Audit Logs' : 'Tenant Audit Logs'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {isAdminPlatform 
              ? 'Comprehensive tracking of all actions across platform control plane and tenants.' 
              : 'Tracking security events and access logs for your organization.'}
          </p>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action or resource..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
          />
        </div>

        <div className="text-xs font-mono text-gray-400">
          Total Logs: <strong className="text-gray-700">{data?.totalElements || 0}</strong>
        </div>
      </div>

      <AuditTable 
        audits={data?.content || []}
        isInitialLoading={isLoading && !data}
        isAdminPlatform={isAdminPlatform}
        onViewDetails={(audit) => {
          setSelectedAudit(audit);
          setIsModalOpen(true);
        }}
      />

      {data && (
        <Pagination 
          page={data.page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          first={data.first}
          hasNext={data.hasNext}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}

      <AuditDetailsModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAudit(null);
        }}
        audit={selectedAudit}
      />

    </div>
  );
}
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { routeService } from '../../services/routeService';
import { RouteHeader } from '../../components/routes/RouteHeader';
import { RouteToolbar } from '../../components/routes/RouteToolbar';
import { RouteTable } from '../../components/routes/RouteTable';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Pagination } from '../../components/common/Pagination';
import { Archive, Network } from 'lucide-react';

export default function RoutesManagementPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText: string;
    type: 'danger' | 'warning';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: 'Confirm',
    type: 'danger',
    onConfirm: () => {},
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['routes', showDeleted ? 'deleted' : 'active', page, limit, debouncedSearch],
    queryFn: () => showDeleted
      ? routeService.findAllDeleted({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', direction: 'DESC' })
      : routeService.findAll({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', direction: 'DESC' }),
    placeholderData: (previousData) => previousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACTIVE' | 'INACTIVE' }) =>
      routeService.changeStatus(id, status),
    onSuccess: () => {
      toast.success('Route status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update route status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => routeService.delete(id),
    onSuccess: () => {
      toast.success('Route moved to archive successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to archive route');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => routeService.restoreRoute(id),
    onSuccess: () => {
      toast.success('Route restored successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore route');
    },
  });

  const handleDeletePrompt = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Archive Route',
      description: `Are you sure you want to archive "${name}"? Proxy requests to this route will be halted.`,
      confirmText: 'Archive Route',
      type: 'danger',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleRestorePrompt = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Restore Route',
      description: `Are you sure you want to restore "${name}" back to active proxy configuration?`,
      confirmText: 'Restore Route',
      type: 'warning',
      onConfirm: () => restoreMutation.mutate(id),
    });
  };

  const handleStatusChange = (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      
      <RouteHeader />

      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-2xs w-fit">
        <button
          type="button"
          onClick={() => { setShowDeleted(false); setPage(0); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            !showDeleted 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" /> Active Routes
        </button>
        <button
          type="button"
          onClick={() => { setShowDeleted(true); setPage(0); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            showDeleted 
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Archive className="w-3.5 h-3.5" /> Archived
        </button>
      </div>

      <RouteToolbar 
        search={search} 
        setSearch={setSearch} 
        totalElements={data?.totalElements || 0} 
      />

      <RouteTable 
        routes={data?.content || []}
        isInitialLoading={isLoading && !data}
        isDeletedView={showDeleted}
        onStatusChange={handleStatusChange}
        onDelete={(id, name) => handleDeletePrompt(id, name)}
        onRestore={(id, name) => handleRestorePrompt(id, name)}
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

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
        isLoading={deleteMutation.isPending || restoreMutation.isPending}
      />

    </div>
  );
};
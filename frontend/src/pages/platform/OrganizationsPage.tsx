import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { organizationService, type OrganizationResponse, type OrganizationStatus } from '../../services/organizationService';
import { OrganizationModal } from '../../components/platform/OrganizationModal';
import { OrganizationHeader } from '../../components/platform/OrganizationHeader';
import { OrganizationToolbar } from '../../components/platform/OrganizationToolbar';
import { OrganizationTable } from '../../components/platform/OrganizationTable';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Pagination } from '../../components/common/Pagination';
import { Archive, Building2 } from 'lucide-react';

export default function OrganizationsPage() {
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showDeleted, setShowDeleted] = useState(false); 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrgToEdit, setSelectedOrgToEdit] = useState<OrganizationResponse | null>(null);

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
    queryKey: ['organizations', showDeleted ? 'deleted' : 'active', page, limit, debouncedSearch],
    queryFn: () => showDeleted 
      ? organizationService.findAllDeleted({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', direction: 'DESC' })
      : organizationService.findAll({ page, limit, search: debouncedSearch || undefined, sortBy: 'createdAt', direction: 'DESC' }),
    placeholderData: (previousData) => previousData,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrganizationStatus }) => 
      organizationService.changeStatus(id, status),
    onSuccess: () => {
      toast.success('Organization status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => organizationService.delete(id),
    onSuccess: () => {
      toast.success('Organization moved to archive successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => organizationService.restore(id),
    onSuccess: () => {
      toast.success('Organization restored successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore organization');
    },
  });

  const handleDeletePrompt = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Archive Organization',
      description: `Are you sure you want to soft delete "${name}"? You can restore it later from the archive view.`,
      confirmText: 'Archive Organization',
      type: 'danger',
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

  const handleRestorePrompt = (id: string, name: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Restore Organization',
      description: `Are you sure you want to restore "${name}" back to active status?`,
      confirmText: 'Restore Organization',
      type: 'warning',
      onConfirm: () => restoreMutation.mutate(id),
    });
  };

  const handleStatusChange = (id: string, status: OrganizationStatus) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <div className="space-y-6">
      
      <OrganizationHeader 
        onOpenCreateModal={() => {
          setSelectedOrgToEdit(null);
          setIsModalOpen(true);
        }} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200 shadow-2xs w-fit">
          <button
            onClick={() => { setShowDeleted(false); setPage(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              !showDeleted 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Active Organizations
          </button>
          <button
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
      </div>

      <OrganizationToolbar 
        search={search} 
        setSearch={setSearch} 
        totalElements={data?.totalElements || 0} 
      />

      <OrganizationTable 
        organizations={data?.content || []}
        isInitialLoading={isLoading && !data}
        isDeletedView={showDeleted}
        onStatusChange={handleStatusChange}
        onEdit={(org: OrganizationResponse) => {
          setSelectedOrgToEdit(org);
          setIsModalOpen(true);
        }}
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

      <OrganizationModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrgToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['organizations'] });
        }}
        organizationToEdit={selectedOrgToEdit}
      />

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
}
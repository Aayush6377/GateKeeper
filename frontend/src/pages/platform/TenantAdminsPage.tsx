import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tenantAdminService, type TenantAdminListItem } from '../../services/tenantAdminService';
import { TenantAdminHeader } from '../../components/platform/TenantAdminHeader';
import { TenantAdminToolbar } from '../../components/platform/TenantAdminToolbar';
import { TenantAdminTable } from '../../components/platform/TenantAdminTable';
import { TenantAdminModal } from '../../components/platform/TenantAdminModal';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Pagination } from '../../components/common/Pagination';

export default function TenantAdminsPage() {
  const { organizationId } = useParams<{ organizationId: string }>();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<TenantAdminListItem | null>(null);

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
    queryKey: ['tenant-admins', organizationId, page, limit, debouncedSearch],
    queryFn: () => tenantAdminService.findAll(organizationId!, {
      page,
      limit,
      search: debouncedSearch || undefined,
      sortBy: 'createdAt',
      direction: 'DESC',
    }),
    enabled: !!organizationId,
    placeholderData: (previousData) => previousData,
  });

  const enableMutation = useMutation({
    mutationFn: ({ userId, enable }: { userId: string; enable: boolean }) => 
      tenantAdminService.changeEnableStatus(userId, enable),
    onSuccess: () => {
      toast.success('User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['tenant-admins', organizationId] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => tenantAdminService.delete(userId),
    onSuccess: () => {
      toast.success('Tenant user deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tenant-admins', organizationId] });
      setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleToggleEnablePrompt = (user: TenantAdminListItem) => {
    const nextState = !user.enabled;
    setConfirmConfig({
      isOpen: true,
      title: nextState ? 'Enable Tenant User' : 'Disable Tenant User',
      description: `Are you sure you want to ${nextState ? 'enable' : 'disable'} access for "${user.username}"? ${
        !nextState ? 'Disabling this user will immediately block gateway access.' : ''
      }`,
      confirmText: nextState ? 'Enable User' : 'Disable User',
      type: 'warning',
      onConfirm: () => enableMutation.mutate({ userId: user.id, enable: nextState }),
    });
  };

  const handleDeletePrompt = (userId: string, username: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Tenant User',
      description: `Are you sure you want to delete administrator "${username}"? This action is permanent.`,
      confirmText: 'Delete User',
      type: 'danger',
      onConfirm: () => deleteMutation.mutate(userId),
    });
  };

  const usersPage = data?.users;
  const orgResponse = data?.organization;

  return (
    <div className="space-y-6">
      
      <TenantAdminHeader 
        orgName={orgResponse?.name}
        onOpenCreateModal={() => {
          setSelectedUserToEdit(null);
          setIsModalOpen(true);
        }} 
      />

      <TenantAdminToolbar 
        search={search} 
        setSearch={setSearch} 
        totalElements={usersPage?.totalElements || 0} 
      />

      <TenantAdminTable 
        users={usersPage?.content || []}
        isInitialLoading={isLoading && !data}
        onToggleEnable={handleToggleEnablePrompt}
        onEdit={(user) => {
          setSelectedUserToEdit(user);
          setIsModalOpen(true);
        }}
        onDelete={handleDeletePrompt}
      />

      {usersPage && (
        <Pagination 
          page={usersPage.page}
          totalPages={usersPage.totalPages}
          totalElements={usersPage.totalElements}
          first={usersPage.first}
          hasNext={usersPage.hasNext}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}

      <TenantAdminModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUserToEdit(null);
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['tenant-admins', organizationId] });
        }}
        organizationId={organizationId!}
        userToEdit={selectedUserToEdit}
      />

      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
        isLoading={deleteMutation.isPending || enableMutation.isPending}
      />

    </div>
  );
}
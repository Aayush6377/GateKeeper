import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { routeService, type RouteVersionResponse } from '../../services/routeService';
import { RouteVersionsHeader } from '../../components/routes/RouteVersionsHeader';
import { RouteVersionTimelineItem } from '../../components/routes/RouteVersionTimelineItem';
import { RouteVersionSnapshotModal } from '../../components/routes/RouteVersionSnapshotModal';
import { Pagination } from '../../components/common/Pagination';

export default function RouteVersionsPage() {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [limit] = useState(10);
  const [selectedVersionForSnapshot, setSelectedVersionForSnapshot] = useState<RouteVersionResponse | null>(null);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['route-versions', routeId, page, limit],
    queryFn: () => routeService.getVersions(routeId!, { page, limit, sortBy: 'versionNumber', direction: 'DESC' }),
    enabled: Boolean(routeId),
    placeholderData: (previousData) => previousData,
  });

  const restoreVersionMutation = useMutation({
    mutationFn: (versionId: string) => routeService.restoreVersion(versionId),
    onSuccess: () => {
      toast.success('Route version restored successfully');
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      queryClient.invalidateQueries({ queryKey: ['route-versions', routeId] });
      setSelectedVersionForSnapshot(null);
      navigate('/tenant/routes');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore route version');
    },
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 px-4 sm:px-6">
      
      <RouteVersionsHeader routeId = {data?.routeId}/>

      {/* Timeline Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-500">
              Configuration Audit Timeline
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Track every mutation, status change, and snapshot restore for this route.</p>
          </div>
          <div className="text-xs font-mono text-gray-500">
            Total Versions: <span className="font-bold text-gray-900">{data?.versions.totalElements || 0}</span>
          </div>
        </div>

        {isLoading && !data ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">
            Loading audit version history...
          </div>
        ) : data?.versions.content.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-gray-400">
            No version history recorded yet.
          </div>
        ) : (
          <div className="relative pt-2">
            {data?.versions.content.map((version, index) => (
              <RouteVersionTimelineItem
                key={version.id}
                version={version}
                isLatest={index === 0 && page === 0}
                onViewSnapshot={(ver) => setSelectedVersionForSnapshot(ver)}
              />
            ))}
          </div>
        )}
      </div>

      {data && (
        <Pagination
          page={data.versions.page}
          totalPages={data.versions.totalPages}
          totalElements={data.versions.totalElements}
          first={data.versions.first}
          hasNext={data.versions.hasNext}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      )}

      <RouteVersionSnapshotModal
        isOpen={Boolean(selectedVersionForSnapshot)}
        onClose={() => setSelectedVersionForSnapshot(null)}
        version={selectedVersionForSnapshot}
        onRestore={(versionId) => restoreVersionMutation.mutate(versionId)}
        isRestoring={restoreVersionMutation.isPending}
      />

    </div>
  );
};
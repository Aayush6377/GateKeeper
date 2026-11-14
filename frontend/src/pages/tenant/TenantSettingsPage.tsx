import { useState, useEffect } from 'react';
import { tenantService } from '../../services/tenantService';
import { OrganizationProfileCard } from '../../components/settings/OrganizationProfileCard';
import { AdminCredentialsCard } from '../../components/settings/AdminCredentialsCard';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { GenericError } from '../../components/common/GenericError';
import type { OrganizationResponse } from '../../services/organizationService';
import { useAuth } from '../../context/AuthContext';

export default function TenantSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [org, setOrg] = useState<OrganizationResponse | null>(null);
  const { username } = useAuth();

  const fetchTenantData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tenantService.getOrganization();
      setOrg(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load organization settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <GatewayLoader text="Loading Settings..." subtext="Retrieving organization and admin profile" />
      </div>
    );
  }

  if (error || !org) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <GenericError
          statusCode="500"
          title="Failed to Load Settings"
          description={error || 'Could not retrieve tenant information.'}
          showRetryButton={true}
          onRetry={fetchTenantData}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tenant Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage your organization display name and administrative credentials.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <OrganizationProfileCard
          initialName={org.name}
          slug={org.slug}
          onUpdate={(newName) => setOrg((prev) => (prev ? { ...prev, name: newName } : null))}
        />

        <AdminCredentialsCard initialUsername={username || "tenant-admin"} />
      </div>
    </div>
  );
}
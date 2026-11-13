import React, { useEffect, useState, useCallback } from 'react';
import { analyticsService, type PlatformSummary, type TimeSeriesPoint, type TenantUsageMetric } from '../../services/analyticsService';
import { TenantCharts } from '../../components/analytics/TenantCharts';
import { PlatformTenantTable } from '../../components/analytics/PlatformTenantTable';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { GenericError } from '../../components/common/GenericError';
import { RefreshCw, Calendar, Users, Activity, CheckCircle2, Clock } from 'lucide-react';
import { organizationService } from '../../services/organizationService';

type TimeRange = '6h' | '24h' | '7d' | '30d';

const RANGE_HOURS: Record<TimeRange, number> = {
  '6h': 6,
  '24h': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

const PlatformOverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<PlatformSummary | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [tenants, setTenants] = useState<TenantUsageMetric[]>([]);

  const [range, setRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{
    statusCode: string;
    title: string;
    description: string;
    technicalDetails?: string;
  } | null>(null);

  const fetchPlatformAnalytics = useCallback(
    async (isBackgroundOrRangeRefresh = false) => {
      try {
        if (isBackgroundOrRangeRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const now = Date.now();
        const to = new Date(now).toISOString();
        const from = new Date(now - RANGE_HOURS[range] * 60 * 60 * 1000).toISOString();

        const [summaryData, timeSeriesData, tenantsData] = await Promise.all([
          analyticsService.getPlatformSummary(),
          analyticsService.getPlatformTimeSeries(from, to),
          analyticsService.getPlatformTenantBreakdown(),
        ]);

        setSummary(summaryData);
        setTimeSeries(timeSeriesData);

        const orgIds = Array.from(new Set(tenantsData.map((t) => t.organizationId)));
        const nameMap = await organizationService.getOrganizationNamesBatch(orgIds);

        const enrichedTenants = tenantsData.map((t) => ({
            ...t,
            organizationName: nameMap[t.organizationId] || 'Unknown Organization',
        }));

        setTenants(enrichedTenants);
      } catch (err: any) {
        const status = err?.response?.status ? String(err.response.status) : '503';
        setError({
          statusCode: status,
          title: status === '403' ? 'Access Denied to Platform Control Plane' : 'Analytics Control Plane Unreachable',
          description: 'We could not retrieve system-wide gateway metrics. Ensure you have PLATFORM_ADMIN privileges and the analytics service is online.',
          technicalDetails: err?.response?.data?.message || err?.message,
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    const isSubsequentFetch = summary !== null;
    fetchPlatformAnalytics(isSubsequentFetch);
  }, [range, fetchPlatformAnalytics]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <GatewayLoader
          text="Syncing Platform Telemetry..."
          subtext="Aggregating multi-tenant gateway streams and node health"
        />
      </div>
    );
  }

  if (error) {
    return (
      <GenericError
        statusCode={error.statusCode}
        title={error.title}
        description={error.description}
        icon="shield"
        showRetryButton={true}
        onRetry={() => fetchPlatformAnalytics(false)}
        technicalDetails={error.technicalDetails}
      />
    );
  }

  const successRate = summary?.successRate ?? 0;
  const isHealthy = successRate >= 95;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Platform Control Plane
            </h1>
            {refreshing && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full animate-pulse">
                Updating...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            System-wide multi-tenant throughput, error rates, and infrastructure telemetry.
          </p>
        </div>

        {/* Time Range Switcher + Refresh Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
            <Calendar size={14} className="text-slate-400 ml-2 mr-1.5 hidden xs:block" />
            {(['6h', '24h', '7d', '30d'] as TimeRange[]).map((item) => (
              <button
                key={item}
                onClick={() => setRange(item)}
                disabled={refreshing}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg uppercase transition-all ${
                  range === item
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchPlatformAnalytics(true)}
            disabled={refreshing}
            title="Refresh metrics"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* Platform Stats Grid (Includes Total Tenants) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 sm:gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Tenants</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {summary?.totalTenants ?? 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border bg-purple-50 text-purple-600 border-purple-100">
              <Users size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">Active organizations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Global Requests</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {(summary?.totalRequests ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border bg-blue-50 text-blue-600 border-blue-100">
              <Activity size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">All gateway traffic</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Success Rate</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {successRate.toFixed(1)}%
              </h3>
            </div>
            <div className={`p-2.5 rounded-xl border ${isHealthy ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
              <CheckCircle2 size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">System reliability</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Errors</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {(summary?.errorCount ?? 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border bg-rose-50 text-rose-600 border-rose-100">
              <Activity size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">4xx & 5xx responses</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between sm:col-span-2 xl:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Latency</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5 tracking-tight">
                {Math.round(summary?.avgLatencyMs ?? 0)} ms
              </h3>
            </div>
            <div className="p-2.5 rounded-xl border bg-indigo-50 text-indigo-600 border-indigo-100">
              <Clock size={20} strokeWidth={2.2} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">Proxy response time</p>
        </div>
      </div>

      <TenantCharts data={timeSeries} summary={summary} />

      <PlatformTenantTable tenants={tenants} />
    </div>
  );
};

export default PlatformOverviewPage;
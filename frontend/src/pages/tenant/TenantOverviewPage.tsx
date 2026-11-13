import React, { useEffect, useState, useCallback } from 'react';
import { analyticsService, type AnalyticsSummary, type TimeSeriesPoint, type RouteMetric } from '../../services/analyticsService';
import { TenantStatsGrid } from '../../components/analytics/TenantStatsGrid';
import { TenantCharts } from '../../components/analytics/TenantCharts';
import { RouteMetricsTable } from '../../components/analytics/RouteMetricsTable';
import { GatewayLoader } from '../../components/common/GatewayLoader';
import { GenericError } from '../../components/common/GenericError';
import { RefreshCw, Calendar } from 'lucide-react';

type TimeRange = '6h' | '24h' | '7d' | '30d';

const RANGE_HOURS: Record<TimeRange, number> = {
  '6h': 6,
  '24h': 24,
  '7d': 24 * 7,
  '30d': 24 * 30,
};

const TenantOverviewPage: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);
  const [routes, setRoutes] = useState<RouteMetric[]>([]);

  const [range, setRange] = useState<TimeRange>('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{
    statusCode: string;
    title: string;
    description: string;
    technicalDetails?: string;
  } | null>(null);

  const fetchAnalytics = useCallback(
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

        const [summaryData, timeSeriesData, routesData] = await Promise.all([
          analyticsService.getTenantSummary(),
          analyticsService.getTenantTimeSeries(from, to),
          analyticsService.getTenantRouteMetrics(),
        ]);

        setSummary(summaryData);
        setTimeSeries(timeSeriesData);
        setRoutes(routesData);
      } catch (err: any) {
        const status = err?.response?.status ? String(err.response.status) : '503';
        setError({
          statusCode: status,
          title:
            status === '403'
              ? 'Access Denied to Tenant Telemetry'
              : 'Analytics Control Plane Unreachable',
          description:
            'We could not retrieve your gateway metrics and traffic telemetry. Ensure the analytics node is online and your session is valid.',
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
    fetchAnalytics(isSubsequentFetch);
  }, [range, fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <GatewayLoader
          text="Aggregating Telemetry..."
          subtext="Querying Kafka access streams and route metrics"
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
        onRetry={() => fetchAnalytics(false)}
        technicalDetails={error.technicalDetails}
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Top Header & Controls */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Tenant Traffic Overview
            </h1>
            {refreshing && (
              <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full animate-pulse">
                Updating...
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time gateway throughput, error rates, and route latency analytics.
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
            onClick={() => fetchAnalytics(true)}
            disabled={refreshing}
            title="Refresh metrics"
            className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>
        </div>
      </div>

      {/* Dashboard Sections */}
      <TenantStatsGrid summary={summary} />
      <TenantCharts data={timeSeries} summary={summary} />
      <RouteMetricsTable routes={routes} />
    </div>
  );
};

export default TenantOverviewPage;
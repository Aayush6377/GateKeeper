import { analyticsApiClient } from './analyticsApiClient';

export interface AnalyticsSummary {
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface PlatformSummary extends AnalyticsSummary {
  totalTenants: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  avgLatencyMs: number;
}

export interface RouteMetric {
  routeId: string;
  routeName: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface TenantUsageMetric {
  organizationId: string;
  organizationName: string | null;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  avgLatencyMs: number;
}

export const analyticsService = {
  getTenantSummary: async (): Promise<AnalyticsSummary> => {
    const response = await analyticsApiClient.get<AnalyticsSummary>('/analytics/tenant/summary');
    return response.data;
  },

  getTenantTimeSeries: async (from: string, to: string): Promise<TimeSeriesPoint[]> => {
    const response = await analyticsApiClient.get<TimeSeriesPoint[]>('/analytics/tenant/timeseries', {
      params: { from, to },
    });
    return response.data;
  },

  getTenantRouteMetrics: async (): Promise<RouteMetric[]> => {
    const response = await analyticsApiClient.get<RouteMetric[]>('/analytics/tenant/routes');
    return response.data;
  },

  getPlatformSummary: async (): Promise<PlatformSummary> => {
    const response = await analyticsApiClient.get<PlatformSummary>('/analytics/platform/summary');
    return response.data;
  },

  getPlatformTimeSeries: async (from: string, to: string): Promise<TimeSeriesPoint[]> => {
    const response = await analyticsApiClient.get<TimeSeriesPoint[]>('/analytics/platform/timeseries', {
      params: { from, to },
    });
    return response.data;
  },

  getPlatformTenantBreakdown: async (): Promise<TenantUsageMetric[]> => {
    const response = await analyticsApiClient.get<TenantUsageMetric[]>('/analytics/platform/tenants');
    return response.data;
  },
  
};
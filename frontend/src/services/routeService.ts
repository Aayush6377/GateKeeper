import type { PageResponse, PaginationParams } from '../types/pageTypes';
import { apiClient } from './apiClient';

export type RouteStatus = 'INACTIVE' | 'ACTIVE' | 'DELETED';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'TRACE';

export type HeaderDirection = 'REQUEST' | 'RESPONSE';

export type HeaderAction = 'ADD' | 'SET' | 'REMOVE';

export type RouteChangeType = 'CREATED' | 'UPDATED' | 'ACTIVATED' | 'DEACTIVATED' | 'DELETED' | 'RESTORED';

export interface RouteHeaderRuleResponse {
  direction: HeaderDirection;
  action: HeaderAction;
  headerName: string;
  headerValue?: string | null | undefined;
}

export interface RouteResponse {
  id: string;
  organizationId: string;
  routeId: string;
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix?: string;
  requestsPerMinute?: number;
  responseTimeoutMs?: number;
  idempotencyEnabled: boolean;
  status: RouteStatus;
  configurationVersion: number;
  allowedMethods: HttpMethod[];
  headerRules: RouteHeaderRuleResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface HeaderRuleRequest {
  direction: HeaderDirection;
  action: HeaderAction;
  headerName: string;
  headerValue?: string | null;
}

export interface RouteRequest {
  routeId: string;
  name: string;
  pathPattern: string;
  targetBaseUrl: string;
  targetPathPrefix?: string;
  requestsPerMinute?: number;
  responseTimeoutMs?: number;
  idempotencyEnabled: boolean;
  allowedMethods: HttpMethod[];
  headerRules: HeaderRuleRequest[];
}

export interface RouteStatusRequest {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface RouteVersionResponse {
  id: string;
  versionNumber: number;
  changeType: RouteChangeType;
  configurationSnapshot: RouteResponse;
  createdAt: string;
}

export interface RouteListVersionResponse {
  routeId: string;
  versions: PageResponse<RouteVersionResponse>;
}

export const routeService = {
  findAll: async (params: PaginationParams) => {
    const response = await apiClient.get<PageResponse<RouteResponse>>('/tenant/routes', {
      params,
    });
    return response.data;
  },

  findAllDeleted: async (params: PaginationParams) => {
    const response = await apiClient.get<PageResponse<RouteResponse>>('/tenant/routes/deleted', {
      params,
    });
    return response.data;
  },

  findById: async (id: string) => {
    const response = await apiClient.get<RouteResponse>(`/tenant/routes/${id}`);
    return response.data;
  },

  create: async (data: RouteRequest) => {
    const response = await apiClient.post<RouteResponse>('/tenant/routes', data);
    return response.data;
  },

  update: async (id: string, data: RouteRequest) => {
    const response = await apiClient.put<RouteResponse>(`/tenant/routes/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/tenant/routes/${id}`);
  },

  changeStatus: async (id: string, status: 'ACTIVE' | 'INACTIVE') => {
    const response = await apiClient.patch<RouteResponse>(`/tenant/routes/${id}/status`, { status });
    return response.data;
  },

  restoreRoute: async (id: string) => {
    const response = await apiClient.post<RouteResponse>(`/tenant/routes/${id}/restore`);
    return response.data;
  },

  getVersions: async (routeId: string, params: PaginationParams) => {
    const response = await apiClient.get<RouteListVersionResponse>(`/tenant/routes/versions/${routeId}`, {
      params,
    });
    return response.data;
  },

  restoreVersion: async (versionId: string) => {
    const response = await apiClient.post<RouteResponse>(`/tenant/routes/versions/${versionId}/restore`);
    return response.data;
  },

};
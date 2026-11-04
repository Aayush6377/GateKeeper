import type { PageResponse, PaginationParams } from '../types/pageTypes';
import { apiClient } from './apiClient';
import type { OrganizationResponse } from './organizationService';

export interface TenantAdminResponse {
  id: string;
  username: string;
  organization: OrganizationResponse;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAdminListItem {
  id: string;
  username: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TenantAdminListResponse {
  organization: OrganizationResponse;
  users: PageResponse<TenantAdminListItem>;
}

export interface TenantAdminRequest {
  username: string;
  password?: string;
}

export interface TenantAdminEnableRequest {
  enable: boolean;
}

export const tenantAdminService = {
  findAll: async (organizationId: string, params: PaginationParams) => {
    const response = await apiClient.get<TenantAdminListResponse>(
      `/platform/organizations/${organizationId}/tenant-admin`,
      { params }
    );
    return response.data;
  },

  findById: async (userId: string) => {
    const response = await apiClient.get<TenantAdminResponse>(
      `/platform/organizations/tenant-admin/${userId}`
    );
    return response.data;
  },

  create: async (organizationId: string, data: TenantAdminRequest) => {
    const response = await apiClient.post<TenantAdminResponse>(
      `/platform/organizations/${organizationId}/tenant-admin`,
      data
    );
    return response.data;
  },

  update: async (userId: string, data: TenantAdminRequest) => {
    const response = await apiClient.put<TenantAdminResponse>(
      `/platform/organizations/tenant-admin/${userId}`,
      data
    );
    return response.data;
  },

  changeEnableStatus: async (userId: string, enable: boolean) => {
    const response = await apiClient.patch<TenantAdminResponse>(
      `/platform/organizations/tenant-admin/${userId}/enable`,
      { enable }
    );
    return response.data;
  },

  delete: async (userId: string) => {
    await apiClient.delete(`/platform/organizations/tenant-admin/${userId}`);
  },
};
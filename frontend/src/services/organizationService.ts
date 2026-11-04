import type { PageResponse, PaginationParams } from '../types/pageTypes';
import { apiClient } from './apiClient';

export type OrganizationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';

export interface OrganizationResponse {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationRequest {
  name: string;
  slug: string;
}

export interface OrganizationStatusRequest {
  status: OrganizationStatus;
}

export const organizationService = {
  findAll: async (params: PaginationParams) => {
    const response = await apiClient.get<PageResponse<OrganizationResponse>>('/platform/organizations', {
      params,
    });
    return response.data;
  },

  findById: async (id: string) => {
    const response = await apiClient.get<OrganizationResponse>(`/platform/organizations/${id}`);
    return response.data;
  },

  create: async (data: OrganizationRequest) => {
    const response = await apiClient.post<OrganizationResponse>('/platform/organizations', data);
    return response.data;
  },

  update: async (id: string, data: OrganizationRequest) => {
    const response = await apiClient.put<OrganizationResponse>(`/platform/organizations/${id}`, data);
    return response.data;
  },

  changeStatus: async (id: string, status: OrganizationStatus) => {
    const response = await apiClient.patch<OrganizationResponse>(`/platform/organizations/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string) => {
    await apiClient.delete(`/platform/organizations/${id}`);
  },

  findAllDeleted: async (params: PaginationParams) => {
    const response = await apiClient.get<PageResponse<OrganizationResponse>>('/platform/organizations/deleted', {
      params,
    });
    return response.data;
  },

  restore: async (id: string) => {
    const response = await apiClient.patch<OrganizationResponse>(`/platform/organizations/${id}/restore`);
    return response.data;
  },

  getOwnOrganization: async () => {
    const response = await apiClient.get<OrganizationResponse>('/tenant/organization');
    return response.data;
  },
  
};
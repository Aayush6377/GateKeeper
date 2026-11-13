import { apiClient } from './apiClient';
import type { OrganizationResponse } from './organizationService';

export interface TenantOrganizationRequest {
  name: string;
}

export interface TenantAdminUpdateRequest {
  username: string;
  password?: string;
}

export const tenantService = {
  getOrganization: async (): Promise<OrganizationResponse> => {
    const response = await apiClient.get<OrganizationResponse>('/tenant/organization');
    return response.data;
  },

  updateOrganization: async (data: TenantOrganizationRequest): Promise<OrganizationResponse> => {
    const response = await apiClient.put<OrganizationResponse>('/tenant/organization', data);
    return response.data;
  },

  updateProfile: async (data: TenantAdminUpdateRequest): Promise<string> => {
    const response = await apiClient.put<string>('/tenant/profile', data);
    return response.data;
  },
};
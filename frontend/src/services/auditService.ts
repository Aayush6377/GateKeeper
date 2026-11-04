import type { PageResponse, PaginationParams } from '../types/pageTypes';
import { apiClient } from './apiClient';

export type AuditResult = 'SUCCESS' | 'FAILURE' | 'WARNING';

export interface AuditOrganization {
  id: string;
  name: string;
}

export interface AuditRecordResponse {
  id: string;
  organization?: AuditOrganization | null;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  correlationId: string;
  durationMs: number;
  result: AuditResult;
  details: string;
  createdAt: string;
}

export const auditService = {
  findAll: async (params: PaginationParams) => {
    const response = await apiClient.get<PageResponse<AuditRecordResponse>>('/audit', {
      params,
    });
    return response.data;
  },

  findById: async (id: string) => {
    const response = await apiClient.get<AuditRecordResponse>(`/audit/${id}`);
    return response.data;
  },
};
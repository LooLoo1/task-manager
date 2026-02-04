import { apiClient } from '@/shared/api';
import type { WorkspaceDetails } from '../model/types';

export const workspaceApi = {
  getAll: () => apiClient.get<WorkspaceDetails[]>('/workspaces').then((res) => res.data),
  getById: (id: number) => apiClient.get<WorkspaceDetails>(`/workspaces/${id}`).then((res) => res.data),
  create: (data: { name: string; description?: string }) =>
    apiClient.post<WorkspaceDetails>('/workspaces', data).then((res) => res.data),
  update: (id: number, data: { name?: string; description?: string }) =>
    apiClient.put<WorkspaceDetails>(`/workspaces/${id}`, data).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/workspaces/${id}`),
  invite: (id: number, data: { email: string; role?: 'ADMIN' | 'MEMBER' }) =>
    apiClient.post(`/workspaces/${id}/invite`, data).then((res) => res.data),
};

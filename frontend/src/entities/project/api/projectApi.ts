import { apiClient } from '@/shared/api';
import type { Project, CreateProjectDto, UpdateProjectDto } from '../model/types';

export const projectApi = {
  getAll: () => apiClient.get<Project[]>('/projects').then((res) => res.data),
  getById: (id: number) => apiClient.get<Project>(`/projects/${id}`).then((res) => res.data),
  create: (data: CreateProjectDto) => apiClient.post<Project>('/projects', data).then((res) => res.data),
  update: (id: number, data: UpdateProjectDto) =>
    apiClient.put<Project>(`/projects/${id}`, data).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/projects/${id}`),
};

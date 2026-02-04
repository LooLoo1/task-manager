import { apiClient } from '@/shared/api';
import type { Task, CreateTaskDto, UpdateTaskDto } from '../model/types';

interface TaskFilters {
  projectId?: number;
  userId?: number;
  status?: string;
  categoryId?: number;
}

export const taskApi = {
  getAll: (filters?: TaskFilters) => apiClient.get<Task[]>('/tasks', { params: filters }).then((res) => res.data),
  getById: (id: number) => apiClient.get<Task>(`/tasks/${id}`).then((res) => res.data),
  create: (data: CreateTaskDto) => apiClient.post<Task>('/tasks', data).then((res) => res.data),
  update: (id: number, data: UpdateTaskDto) => apiClient.put<Task>(`/tasks/${id}`, data).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/tasks/${id}`),
};

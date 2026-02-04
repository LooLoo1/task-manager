import { apiClient } from '@/shared/api';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../model/types';

export const categoryApi = {
  getAll: () => apiClient.get<Category[]>('/categories').then((res) => res.data),
  getById: (id: number) => apiClient.get<Category>(`/categories/${id}`).then((res) => res.data),
  create: (data: CreateCategoryDto) => apiClient.post<Category>('/categories', data).then((res) => res.data),
  update: (id: number, data: UpdateCategoryDto) =>
    apiClient.put<Category>(`/categories/${id}`, data).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/categories/${id}`),
};

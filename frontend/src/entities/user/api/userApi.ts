import { apiClient } from '@/shared/api';
import type { User } from '../model/types';

export const userApi = {
  getAll: () => apiClient.get<User[]>('/users').then((res) => res.data),
  getById: (id: number) => apiClient.get<User>(`/users/${id}`).then((res) => res.data),
};

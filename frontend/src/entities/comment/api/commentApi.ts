import { apiClient } from '@/shared/api';
import type { Comment, CreateCommentDto, UpdateCommentDto } from '../model/types';

export const commentApi = {
  getAll: (taskId?: number) =>
    apiClient.get<Comment[]>('/comments', { params: taskId ? { taskId } : {} }).then((res) => res.data),
  getById: (id: number) => apiClient.get<Comment>(`/comments/${id}`).then((res) => res.data),
  create: (data: CreateCommentDto) => apiClient.post<Comment>('/comments', data).then((res) => res.data),
  update: (id: number, data: UpdateCommentDto) =>
    apiClient.put<Comment>(`/comments/${id}`, data).then((res) => res.data),
  delete: (id: number) => apiClient.delete(`/comments/${id}`),
};

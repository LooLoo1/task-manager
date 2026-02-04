import { apiClient } from '@/shared/api';
import type { LoginResponse, RegisterResponse, AuthUser, Workspace } from '../model/types';

export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    apiClient.post<RegisterResponse>('/auth/register', data).then((res) => res.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<LoginResponse>('/auth/login', data).then((res) => res.data),

  me: () => apiClient.get<{ user: AuthUser; workspaces: Workspace[] }>('/auth/me').then((res) => res.data),
};

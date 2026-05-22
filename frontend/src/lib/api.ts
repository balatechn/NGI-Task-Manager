import axios from 'axios';
import { Task, TaskComment, TaskAttachment, TaskStats } from '@/types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('tm_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('tm_token');
      localStorage.removeItem('tm_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ token: string; username: string }>('/auth/login', { username, password }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.post('/auth/change-password', { currentPassword, newPassword }),
};

export const tasksApi = {
  list: (params?: { status?: string; location?: string; priority?: string; search?: string }) =>
    api.get<Task[]>('/tasks', { params }),
  get: (id: number) =>
    api.get<Task>(`/tasks/${id}`),
  stats: () =>
    api.get<TaskStats>('/tasks/stats'),
  create: (data: Partial<Task> & { startDate: string; endDate: string; taskName: string }) =>
    api.post<Task>('/tasks', data),
  update: (id: number, data: Partial<Task> & Record<string, unknown>) =>
    api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: number) =>
    api.delete(`/tasks/${id}`),
  addComment: (taskId: number, data: { content: string; author?: string }) =>
    api.post<TaskComment>(`/tasks/${taskId}/comments`, data),
  addAttachment: (taskId: number, data: { filename: string; mimetype?: string; data: string }) =>
    api.post<TaskAttachment>(`/tasks/${taskId}/attachments`, data),
};

export default api;

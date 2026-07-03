import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { UserContext } from '@rms/types';

export const authApi = {
  login: async (payload: any): Promise<ApiResponse<{ accessToken: string; refreshToken: string; user: UserContext }>> => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<UserContext>> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  logout: async (): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authApi;

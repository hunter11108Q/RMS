import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { MenuCategory, MenuItem } from '@rms/types';

export const menuApi = {
  listCategories: async (): Promise<ApiResponse<MenuCategory[]>> => {
    const response = await apiClient.get('/menu/categories');
    return response.data;
  },

  listItems: async (branchId: string, search?: string): Promise<ApiResponse<MenuItem[]>> => {
    const response = await apiClient.get('/menu/items', {
      params: { branchId, search },
    });
    return response.data;
  },
};

export default menuApi;

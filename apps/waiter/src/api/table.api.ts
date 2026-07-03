import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { RestaurantTableInfo } from '@rms/types';

export const tableApi = {
  listTables: async (branchId: string, floorId?: string): Promise<ApiResponse<RestaurantTableInfo[]>> => {
    const response = await apiClient.get('/tables', {
      params: { branchId, floorId },
    });
    return response.data;
  },

  updateStatus: async (tableId: string, status: string): Promise<ApiResponse<RestaurantTableInfo>> => {
    const response = await apiClient.patch(`/tables/${tableId}/status`, { status });
    return response.data;
  },

  mergeTables: async (tableIds: string[], parentMergeId?: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post('/tables/merge', { tableIds, parentMergeId });
    return response.data;
  },

  splitTables: async (parentMergeId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.post('/tables/split', { parentMergeId });
    return response.data;
  },

  getBranchDetails: async (branchId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  },
};

export default tableApi;

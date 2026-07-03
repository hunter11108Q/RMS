import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { KotTicketInfo, RestaurantTableInfo } from '@rms/types';

export const kdsApi = {
  listKOTs: async (branchId: string): Promise<ApiResponse<KotTicketInfo[]>> => {
    const response = await apiClient.get('/orders/kots/list', {
      params: { branchId },
    });
    return response.data;
  },

  updateKOTStatus: async (kotId: string, status: string): Promise<ApiResponse<KotTicketInfo>> => {
    const response = await apiClient.patch(`/orders/kots/${kotId}/status`, { status });
    return response.data;
  },

  getBranchDetails: async (branchId: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get(`/branches/${branchId}`);
    return response.data;
  },

  listTables: async (branchId: string): Promise<ApiResponse<RestaurantTableInfo[]>> => {
    const response = await apiClient.get('/tables', {
      params: { branchId },
    });
    return response.data;
  },
};

export default kdsApi;

import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { OrderInfo, KotTicketInfo } from '@rms/types';

export const orderApi = {
  createOrder: async (payload: any): Promise<ApiResponse<OrderInfo>> => {
    const response = await apiClient.post('/orders', payload);
    return response.data;
  },

  getOrder: async (orderId: string): Promise<ApiResponse<OrderInfo & { items: any[]; kots: any[] }>> => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  listOrders: async (branchId: string, status?: string): Promise<ApiResponse<OrderInfo[]>> => {
    const response = await apiClient.get('/orders', {
      params: { branchId, status },
    });
    return response.data;
  },

  addOrderItem: async (orderId: string, payload: any): Promise<ApiResponse<any>> => {
    const response = await apiClient.post(`/orders/${orderId}/items`, payload);
    return response.data;
  },

  holdOrder: async (orderId: string): Promise<ApiResponse<OrderInfo>> => {
    const response = await apiClient.post(`/orders/${orderId}/hold`);
    return response.data;
  },

  generateKOT: async (orderId: string, branchId: string): Promise<ApiResponse<KotTicketInfo[]>> => {
    const response = await apiClient.post(`/orders/${orderId}/kots`, { branchId });
    return response.data;
  },

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
};

export default orderApi;

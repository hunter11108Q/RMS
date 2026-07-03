import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';

export const ownerApi = {
  getDashboardKpis: async (params?: { branchId?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/dashboard/kpis', { params });
    return response.data;
  },

  getSalesTrend: async (params: { startDate: string; endDate: string; branchId?: string; groupBy?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/sales/trend', { params });
    return response.data;
  },

  getInventorySummary: async (params?: { branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/inventory/summary', { params });
    return response.data;
  },

  getFoodCostAnalysis: async (params?: { branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/food-cost/analysis', { params });
    return response.data;
  },

  getCustomerAnalytics: async (params?: { branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/customers/analytics', { params });
    return response.data;
  },

  getKitchenAnalytics: async (params?: { branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/kitchen/analytics', { params });
    return response.data;
  },

  getBranchComparison: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/branches/comparison');
    return response.data;
  },

  getProfitLoss: async (params: { startDate: string; endDate: string; branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/finance/profit-loss', { params });
    return response.data;
  },

  getGstReport: async (params: { startDate: string; endDate: string; branchId?: string }): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/reports/tax/gst-summary', { params });
    return response.data;
  },

  listBranches: async (): Promise<ApiResponse<any[]>> => {
    const response = await apiClient.get('/branches');
    return response.data;
  },
};

export default ownerApi;

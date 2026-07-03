import apiClient from './client';
import { ApiResponse } from '@rms/api-contracts';
import { ReservationInfo } from '@rms/types';

export const reservationApi = {
  listReservations: async (branchId: string): Promise<ApiResponse<ReservationInfo[]>> => {
    const response = await apiClient.get('/tables/reservations', {
      params: { branchId },
    });
    return response.data;
  },

  createReservation: async (payload: any): Promise<ApiResponse<ReservationInfo>> => {
    const response = await apiClient.post('/tables/reservations', payload);
    return response.data;
  },
};

export default reservationApi;

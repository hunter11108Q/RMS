import { create } from 'zustand';
import { UserContext, BranchInfo } from '@rms/types';
import { secureSet, secureDelete, secureGet, STORAGE_KEYS, storageSetJSON, storageGetJSON, storageDelete } from '../utils/storage';
import authApi from '../api/auth.api';
import ownerApi from '../api/owner.api';
import { apiClient } from '../api/client';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: UserContext | null;
  branches: BranchInfo[];
  selectedBranch: BranchInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedBranch: (branch: BranchInfo | null) => Promise<void>;
  restoreSession: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  branches: [],
  selectedBranch: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(payload);
      if (res.success && res.data) {
        const { accessToken, refreshToken, user } = res.data;
        await secureSet(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        await secureSet(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        await storageSetJSON(STORAGE_KEYS.USER, user);

        // Fetch authorized branches list
        let branchesList: BranchInfo[] = [];
        try {
          const branchRes = await ownerApi.listBranches();
          if (branchRes.success && branchRes.data) {
            branchesList = branchRes.data;
          }
        } catch {
          // Fallback if branch list fails
          if (user.branchId) {
            branchesList = [{ id: user.branchId, tenantId: user.tenantId, name: 'Assigned Branch', status: 'ACTIVE', createdAt: new Date().toISOString() }];
          }
        }

        const selectedBranch = branchesList[0] || null;
        if (selectedBranch) {
          await storageSetJSON(STORAGE_KEYS.BRANCH, selectedBranch);
        }

        set({
          accessToken,
          refreshToken,
          user,
          branches: branchesList,
          selectedBranch,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ error: res.error?.message || 'Login failed', isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.error?.message || err.message || 'Network error', isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
    } catch (err) {
      // Ignore
    }
    await secureDelete(STORAGE_KEYS.ACCESS_TOKEN);
    await secureDelete(STORAGE_KEYS.REFRESH_TOKEN);
    await storageDelete(STORAGE_KEYS.USER);
    await storageDelete(STORAGE_KEYS.BRANCH);

    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      branches: [],
      selectedBranch: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setSelectedBranch: async (branch) => {
    if (branch) {
      await storageSetJSON(STORAGE_KEYS.BRANCH, branch);
    } else {
      await storageDelete(STORAGE_KEYS.BRANCH);
    }
    set({ selectedBranch: branch });
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const accessToken = await secureGet(STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = await secureGet(STORAGE_KEYS.REFRESH_TOKEN);
      const user = await storageGetJSON<UserContext>(STORAGE_KEYS.USER);
      const selectedBranch = await storageGetJSON<BranchInfo>(STORAGE_KEYS.BRANCH);

      if (accessToken && refreshToken && user) {
        let branchesList: BranchInfo[] = [];
        try {
          // Temporarily attach token to apiClient manually for restoration fetch
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          const branchRes = await ownerApi.listBranches();
          if (branchRes.success && branchRes.data) {
            branchesList = branchRes.data;
          }
        } catch {
          if (user.branchId) {
            branchesList = [{ id: user.branchId, tenantId: user.tenantId, name: 'Assigned Branch', status: 'ACTIVE', createdAt: new Date().toISOString() }];
          }
        }

        set({
          accessToken,
          refreshToken,
          user,
          branches: branchesList,
          selectedBranch: selectedBranch || branchesList[0] || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      }
    } catch (err) {
      // Ignore
    }
    set({ isLoading: false });
    return false;
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

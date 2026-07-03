import { create } from 'zustand';
import { UserContext, BranchInfo } from '@rms/types';
import { secureSet, secureDelete, secureGet, STORAGE_KEYS, storageSetJSON, storageGetJSON, storageDelete } from '../utils/storage';
import authApi from '../api/auth.api';

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
  setSelectedBranch: (branch: BranchInfo) => Promise<void>;
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

        // Fetch user branches (or default/assigned branch)
        // If user context contains branchId, or if it is populated.
        // For waiter app, let's assume default branch is user.branchId or we let them select from user profile
        let branchesList: BranchInfo[] = [];
        if (user.branchId) {
          branchesList = [{ id: user.branchId, tenantId: user.tenantId, name: 'Assigned Branch', status: 'ACTIVE', createdAt: new Date().toISOString() }];
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
      // Ignored - logout local state anyway
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
    await storageSetJSON(STORAGE_KEYS.BRANCH, branch);
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
        if (user.branchId) {
          branchesList = [{ id: user.branchId, tenantId: user.tenantId, name: 'Assigned Branch', status: 'ACTIVE', createdAt: new Date().toISOString() }];
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
      // Failed to restore session
    }
    set({ isLoading: false });
    return false;
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;

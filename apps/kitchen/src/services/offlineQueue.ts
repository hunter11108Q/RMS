import useOfflineStore from '../store/offline.store';
import apiClient from '../api/client';

export const offlineQueueProcessor = {
  sync: async (): Promise<void> => {
    const store = useOfflineStore.getState();
    if (store.isSyncing || store.queue.length === 0 || !store.isOnline) {
      return;
    }

    store.setSyncing(true);

    const mutations = [...store.queue];
    mutations.sort((a, b) => a.timestamp - b.timestamp);

    for (const mutation of mutations) {
      try {
        if (mutation.method === 'POST') {
          await apiClient.post(mutation.url, mutation.payload);
        } else if (mutation.method === 'PATCH') {
          await apiClient.patch(mutation.url, mutation.payload);
        } else if (mutation.method === 'PUT') {
          await apiClient.put(mutation.url, mutation.payload);
        }
        await store.removeMutation(mutation.id);
      } catch (err: any) {
        console.error(`KDS offline sync failure for mutation ${mutation.id}:`, err.message);
        if (err.response?.status === 400) {
          await store.removeMutation(mutation.id);
        } else {
          break;
        }
      }
    }

    store.setSyncing(false);
  },
};

export default offlineQueueProcessor;

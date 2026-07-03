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
    // Sort chronologically
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
        // Success: remove from local store queue
        await store.removeMutation(mutation.id);
      } catch (err: any) {
        console.error(`Offline sync failed for mutation ${mutation.id}:`, err.message);
        // If it's a validation error (400), remove it as it won't resolve.
        // Otherwise stop sync process to retry later
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

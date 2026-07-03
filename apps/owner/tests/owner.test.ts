import { useOwnerStore } from '../src/store/owner.store';

describe('Owner Dashboard Mobile Application Tests Suite', () => {
  beforeEach(() => {
    // Clear alerts list
    useOwnerStore.setState({ alerts: [], notifications: [] });
  });

  it('should verify alert addition and acknowledgment in store', () => {
    const store = useOwnerStore.getState();
    expect(store.alerts.length).toBe(0);

    store.addAlert({
      title: 'Delayed KOT Warning',
      description: 'KOT #42 has exceeded standard 15 minute limit.',
      severity: 'CRITICAL',
    });

    let updatedAlerts = useOwnerStore.getState().alerts;
    expect(updatedAlerts.length).toBe(1);
    expect(updatedAlerts[0].title).toBe('Delayed KOT Warning');
    expect(updatedAlerts[0].acknowledged).toBe(false);

    // Acknowledge the alert
    const alertId = updatedAlerts[0].id;
    useOwnerStore.getState().ackAlert(alertId);

    updatedAlerts = useOwnerStore.getState().alerts;
    expect(updatedAlerts[0].acknowledged).toBe(true);
  });

  it('should verify system notification logs addition', () => {
    const store = useOwnerStore.getState();
    expect(store.notifications.length).toBe(0);

    store.addNotification({
      title: 'Shift Opened Alert',
      body: 'Shift #19 opened by cashier Suman.',
    });

    const notifs = useOwnerStore.getState().notifications;
    expect(notifs.length).toBe(1);
    expect(notifs[0].title).toBe('Shift Opened Alert');
    expect(notifs[0].read).toBe(false);
  });
});

export type RmsEventType =
  | 'OrderCreated'
  | 'OrderUpdated'
  | 'KOTReady'
  | 'BillGenerated'
  | 'PaymentCompleted'
  | 'InventoryUpdated'
  | 'TableStatusChanged'
  | 'CustomerUpdated'
  | 'UserLoggedIn';

export interface RmsEvent<T = any> {
  id: string;
  type: RmsEventType;
  version: number;
  branchId: string;
  senderId: string;
  timestamp: string;
  payload: T;
}

export const EventCatalog = {
  createEvent: <T>(
    type: RmsEventType,
    branchId: string,
    senderId: string,
    payload: T,
    version = 1
  ): RmsEvent<T> => {
    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      version,
      branchId,
      senderId,
      timestamp: new Date().toISOString(),
      payload,
    };
  },

  validateEvent: (event: any): event is RmsEvent => {
    return (
      event &&
      typeof event.id === 'string' &&
      typeof event.type === 'string' &&
      typeof event.version === 'number' &&
      typeof event.branchId === 'string' &&
      typeof event.senderId === 'string' &&
      typeof event.timestamp === 'string' &&
      event.payload !== undefined
    );
  },
};

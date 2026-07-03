export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  PinLogin: undefined;
};

export type AppStackParamList = {
  HomeTabs: undefined;
  TableDetail: { tableId: string; tableName: string };
  OrderDetail: { orderId: string };
  NewOrder: { tableId?: string | null; tableName?: string | null; orderId?: string | null };
};

export type TabParamList = {
  Dashboard: undefined;
  Tables: undefined;
  Orders: undefined;
  Menu: undefined;
  Reservations: undefined;
};

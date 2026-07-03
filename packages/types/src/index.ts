import { UserRole, OrderStatus, TableStatus, KotStatus } from '@rms/constants';

export interface UserContext {
  id: string;
  tenantId: string;
  username: string;
  role: UserRole;
  permissions: string[];
  branchId?: string;
}

export interface AuthSessionDetails {
  id: string;
  userId: string;
  deviceName: string;
  osName: string;
  clientAppName: string;
  ipAddress: string;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
}

export interface AccessTokenPayload {
  userId: string;
  tenantId: string;
  username: string;
  role: UserRole;
  permissions: string[];
}

export interface RefreshTokenPayload {
  sessionId: string;
  userId: string;
}

export interface AuditLogEvent {
  userId: string;
  tenantId: string;
  branchId?: string;
  action: string;
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isAvailable: boolean;
  taxRate: number;
}

export interface OrderItem {
  id: string;
  menuItemId?: string;
  itemId: string;
  name: string;
  quantity: number;
  price?: number;
  unitPrice: number;
  notes?: string;
  modifiers?: { id: string; name: string; price: number }[];
}

export type OrderItemInfo = OrderItem;

export interface Order {
  id: string;
  branchId: string;
  tableId?: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}

export interface Table {
  id: string;
  branchId: string;
  name: string;
  status: TableStatus;
  currentOrderId?: string;
}

export interface Kot {
  id: string;
  orderId: string;
  status: KotStatus;
  items: OrderItem[];
  createdAt: string;
}

export interface BranchInfo {
  id: string;
  tenantId: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface UserShiftInfo {
  id: string;
  userId: string;
  branchId: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  actualCash?: number;
  cashDifference?: number;
  status: 'OPEN' | 'CLOSED';
  notes?: string;
}

export interface RestaurantInfo {
  id: string;
  tenantId: string;
  name: string;
  legalName: string;
  brandName: string;
  gstNumber: string;
  fssaiLicense: string;
  panNumber: string;
  email: string;
  phone: string;
  currency: string;
  timeZone: string;
  restaurantType: string;
}

export interface PrinterConfigInfo {
  id: string;
  branchId: string;
  name: string;
  type: 'KITCHEN' | 'BILLING' | 'BAR' | 'DESSERT';
  paperSize: '58mm' | '80mm';
  connectionType: 'USB' | 'LAN' | 'BLUETOOTH';
  ipAddress?: string;
  portNumber?: number;
  isActive: boolean;
}

export interface RestaurantTableInfo {
  id: string;
  floorId: string;
  branchId: string;
  number: string;
  name: string;
  capacity: number;
  type: 'ROUND' | 'SQUARE' | 'RECTANGLE' | 'BOOTH' | 'SOFA' | 'BAR' | 'OUTDOOR' | 'VIP';
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BILLING_REQUESTED' | 'CLEANING';
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotate: number;
  isActive: boolean;
}

export interface ReservationInfo {
  id: string;
  branchId: string;
  tableId?: string;
  customerName: string;
  customerPhone: string;
  reservationDate: string;
  startTime: string;
  guestsCount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'CANCELLED' | 'COMPLETED';
}

export interface OrderInfo {
  id: string;
  branchId: string;
  tableId?: string;
  customerName?: string;
  type: 'DINE_IN' | 'TAKEAWAY' | 'PARCEL' | 'DELIVERY';
  status: 'DRAFT' | 'CONFIRMED' | 'KITCHEN' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  priority: 'NORMAL' | 'HIGH' | 'VIP' | 'URGENT';
  totalAmount: number;
}

export interface KotTicketInfo {
  id: string;
  kotNumber: string;
  orderId: string;
  kitchenConfigId: string;
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'REJECTED';
  priority: string;
  notes?: string;
}

export interface BillInfo {
  id: string;
  orderId: string;
  branchId: string;
  billNumber: string;
  subTotal: number;
  discountAmount: number;
  taxAmount: number;
  serviceCharge: number;
  tipsAmount: number;
  grandTotal: number;
  status: 'UNPAID' | 'PAID' | 'CANCELLED' | 'REFUNDED' | 'VOID';
}

export interface PaymentInfo {
  id: string;
  billId: string;
  method: 'CASH' | 'UPI' | 'CARD' | 'MIXED';
  amount: number;
  referenceNumber?: string;
  transactionId?: string;
  status: 'SUCCESS' | 'FAILED';
}

export interface SupplierInfo {
  id: string;
  branchId: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  creditLimit: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface IngredientInfo {
  id: string;
  tenantId: string;
  name: string;
  sku: string;
  unit: string;
  barcode?: string;
  category: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  currentStock: number;
  averageCost: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ReportKpisInfo {
  todaySales: number;
  weeklySales: number;
  monthlySales: number;
  netRevenue: number;
  totalOrdersCount: number;
  lowStockAlertsCount: number;
}

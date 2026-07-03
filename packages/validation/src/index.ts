import { z } from 'zod';

export const loginSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  // Client can log in with username, email, phone, or PIN
  username: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().min(8, 'Phone number must be at least 8 digits').optional(),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d+$/, 'PIN must contain only digits').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters long').optional(),
}).refine((data) => {
  // Must provide either password (with username/email/phone) OR a PIN
  if (data.pin) return true;
  return !!(data.password && (data.username || data.email || data.phone));
}, {
  message: 'Must provide either PIN, or password with a username/email/phone identifier.',
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long')
    .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'New password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'New password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'New password must contain at least one special character'),
});

export const passwordResetRequestSchema = z.object({
  tenantId: z.string().min(1, 'Tenant ID is required'),
  email: z.string().email('Invalid email format'),
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
});

export const legacyCreateOrderSchema = z.object({
  branchId: z.string().uuid(),
  tableId: z.string().uuid().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string().uuid(),
      quantity: z.number().int().positive(),
      notes: z.string().optional(),
    })
  ).min(1, 'Order must contain at least one item'),
});

export const syncPayloadSchema = z.object({
  branchId: z.string().uuid(),
  lastSyncedTimestamp: z.number().int().nonnegative(),
  mutations: z.array(
    z.object({
      uuid: z.string().uuid(),
      table: z.string(),
      action: z.enum(['INSERT', 'UPDATE', 'DELETE']),
      payload: z.record(z.any()),
      timestamp: z.number().int().positive(),
    })
  ),
});

export const createUserSchema = z.object({
  tenantId: z.string().min(1),
  username: z.string().min(3),
  fullName: z.string().min(1),
  employeeId: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(8),
  password: z.string().min(6),
  pin: z.string().length(4).regex(/^\d+$/).optional(),
  roleId: z.string().uuid(),
  designation: z.string().optional(),
  department: z.string().optional(),
  branchIds: z.array(z.string().uuid()).min(1, 'Must assign at least one branch'),
});

export const updateUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6).optional(),
  pin: z.string().length(4).regex(/^\d+$/).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'LOCKED', 'ARCHIVED']).optional(),
  roleId: z.string().uuid().optional(),
  designation: z.string().optional(),
  department: z.string().optional(),
  branchIds: z.array(z.string().uuid()).optional(),
});

export const createRoleSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).min(1, 'Must select at least one permission'),
});

export const updateRoleSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export const openShiftSchema = z.object({
  branchId: z.string().uuid(),
  openingCash: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const closeShiftSchema = z.object({
  closingCash: z.number().nonnegative(),
  notes: z.string().optional(),
});

export const updateProfileSchema = z.object({
  fullName: z.string().optional(),
  languagePreference: z.string().optional(),
  themePreference: z.enum(['light', 'dark']).optional(),
  notificationPreference: z.enum(['all', 'important', 'none']).optional(),
});

export const createRestaurantSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  legalName: z.string().min(1),
  brandName: z.string().min(1),
  gstNumber: z.string().regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GST format'),
  fssaiLicense: z.string().length(14, 'FSSAI number must be exactly 14 digits').regex(/^\d+$/, 'FSSAI must contain only digits'),
  panNumber: z.string().regex(/^[A-Z]{5}\d{4}[A-Z]{1}$/, 'Invalid PAN format'),
  email: z.string().email(),
  phone: z.string().min(8),
  whatsapp: z.string().min(8),
  website: z.string().url().optional().or(z.literal('')),
  country: z.string().min(1),
  state: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  postalCode: z.string().min(5),
  address: z.string().min(5),
  restaurantType: z.string().min(1),
});

export const createBranchSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  address: z.string().min(5),
  workingHours: z.string().min(1),
});

export const createFloorSchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
});

export const createTaxSchema = z.object({
  name: z.string().min(1),
  rate: z.number().min(0),
  type: z.enum(['GST', 'CGST', 'SGST', 'IGST', 'SERVICE_CHARGE']),
  isCompound: z.boolean().optional(),
});

export const createPrinterSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['KITCHEN', 'BILLING', 'BAR', 'DESSERT']),
  paperSize: z.enum(['58mm', '80mm']).optional(),
  connectionType: z.enum(['USB', 'LAN', 'BLUETOOTH']),
  ipAddress: z.string().ip().optional().or(z.literal('')),
  portNumber: z.number().int().optional(),
  autoPrintRules: z.string().optional(),
});

export const createNumberSeriesSchema = z.object({
  entityType: z.enum(['BILL', 'ORDER', 'KOT', 'EXPENSE']),
  prefix: z.string().min(1),
  suffix: z.string().optional(),
  digits: z.number().int().min(2).max(10).optional(),
});

export const createCategorySchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  displayName: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  displayOrder: z.number().int().optional(),
  parentId: z.string().uuid().optional(),
  branchIds: z.string().optional(),
  kitchenIds: z.string().optional(),
});

export const createMenuItemSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(1),
  shortName: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  itemCode: z.string().min(1),
  description: z.string().optional(),
  taxInclusive: z.boolean().optional(),
  taxExclusive: z.boolean().optional(),
  taxConfigId: z.string().uuid().optional(),
  dineInPrice: z.number().nonnegative(),
  takeawayPrice: z.number().nonnegative(),
  deliveryPrice: z.number().nonnegative(),
  happyHourPrice: z.number().nonnegative().optional(),
  weekendPrice: z.number().nonnegative().optional(),
  branchId: z.string().uuid(),
});

export const createVariantSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  sku: z.string().min(1),
  barcode: z.string().optional(),
});

export const createModifierGroupSchema = z.object({
  name: z.string().min(1),
  minSelect: z.number().int().nonnegative().optional(),
  maxSelect: z.number().int().positive().optional(),
  options: z.array(
    z.object({
      name: z.string().min(1),
      price: z.number().nonnegative(),
      isFree: z.boolean().optional(),
      maxQuantity: z.number().int().positive().optional(),
      kitchenInstructions: z.string().optional(),
    })
  ).min(1, 'Modifier group must contain at least one option'),
});

export const createRecipeSchema = z.object({
  menuItemId: z.string().uuid().optional(),
  menuItemVariantId: z.string().uuid().optional(),
  instructions: z.string().optional(),
  ingredients: z.array(
    z.object({
      ingredientId: z.string().uuid(),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      wastePercentage: z.number().min(0).max(100).optional(),
    })
  ).min(1, 'Recipe must define at least one ingredient mapping'),
});

export const createTableSchema = z.object({
  floorId: z.string().uuid(),
  branchId: z.string().uuid(),
  number: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  minCapacity: z.number().int().positive().optional(),
  maxCapacity: z.number().int().positive(),
  type: z.enum(['ROUND', 'SQUARE', 'RECTANGLE', 'BOOTH', 'SOFA', 'BAR', 'OUTDOOR', 'VIP']),
  posX: z.number().int().optional(),
  posY: z.number().int().optional(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  rotate: z.number().int().optional(),
});

export const updateTablePositionSchema = z.object({
  posX: z.number().int(),
  posY: z.number().int(),
  width: z.number().int().optional(),
  height: z.number().int().optional(),
  rotate: z.number().int().optional(),
});

export const createReservationSchema = z.object({
  branchId: z.string().uuid(),
  tableId: z.string().uuid().optional(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(8),
  reservationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  guestsCount: z.number().int().positive(),
  specialRequests: z.string().optional(),
  depositAmount: z.number().nonnegative().optional(),
  source: z.string().optional(),
});

export const createWaitlistSchema = z.object({
  branchId: z.string().uuid(),
  customerName: z.string().min(1),
  customerPhone: z.string().min(8),
  guestsCount: z.number().int().positive(),
  estimatedWaitMinutes: z.number().int().nonnegative().optional(),
});

export const createOrderSchema = z.object({
  branchId: z.string().uuid(),
  floorId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  guestsCount: z.number().int().positive().optional(),
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'PARCEL', 'DELIVERY']),
  priority: z.enum(['NORMAL', 'HIGH', 'VIP', 'URGENT']).optional(),
  notes: z.string().optional(),
});

export const addOrderItemSchema = z.object({
  menuItemId: z.string().uuid(),
  menuItemVariantId: z.string().uuid().optional(),
  quantity: z.number().int().positive(),
  notes: z.string().optional(),
  modifiers: z.array(
    z.object({
      modifierOptionId: z.string().uuid(),
      name: z.string().min(1),
      price: z.number().nonnegative(),
      quantity: z.number().int().positive().optional(),
    })
  ).optional(),
});

export const updateKOTStatusSchema = z.object({
  status: z.enum(['NEW', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'REJECTED']),
});

export const createBillSchema = z.object({
  orderId: z.string().uuid(),
  branchId: z.string().uuid(),
  discountAmount: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  tipsAmount: z.number().nonnegative().optional(),
  type: z.enum(['DINE_IN', 'TAKEAWAY', 'PARCEL', 'DELIVERY', 'staff', 'complimentary']),
});

export const processPaymentSchema = z.object({
  method: z.enum(['CASH', 'UPI', 'CARD', 'MIXED']),
  amount: z.number().positive(),
  referenceNumber: z.string().optional(),
  transactionId: z.string().optional(),
});

export const processRefundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(4, 'Reason must be at least 4 characters long'),
});

export const cashDrawerEntrySchema = z.object({
  shiftId: z.string().uuid(),
  action: z.enum(['CASH_IN', 'CASH_OUT', 'ADJUSTMENT']),
  amount: z.number().positive(),
  notes: z.string().optional(),
});

export const createSupplierSchema = z.object({
  branchId: z.string().uuid(),
  name: z.string().min(1),
  code: z.string().min(2),
  phone: z.string().min(8),
  email: z.string().email(),
  gstNumber: z.string().optional(),
  address: z.string().optional(),
  creditLimit: z.number().nonnegative().optional(),
});

export const createPOSchema = z.object({
  supplierId: z.string().uuid(),
  branchId: z.string().uuid(),
  poNumber: z.string().min(3),
  items: z.array(
    z.object({
      ingredientId: z.string().uuid(),
      quantity: z.number().positive(),
      unitPrice: z.number().positive(),
    })
  ).min(1),
});

export const stockMovementSchema = z.object({
  ingredientId: z.string().uuid(),
  branchId: z.string().uuid(),
  type: z.enum(['PURCHASE', 'SALE', 'MANUAL', 'WASTAGE', 'TRANSFER']),
  quantity: z.number(),
  notes: z.string().optional(),
});

export const wastageEntrySchema = z.object({
  branchId: z.string().uuid(),
  ingredientId: z.string().uuid(),
  quantity: z.number().positive(),
  reason: z.string().min(4),
});

// ─── Reports & BI Validation Schemas ───────────────────────────────────────

export const reportFilterSchema = z.object({
  branchId: z.string().uuid().optional(),
  startDate: z.string().datetime({ message: 'startDate must be a valid ISO 8601 datetime' }),
  endDate: z.string().datetime({ message: 'endDate must be a valid ISO 8601 datetime' }),
  groupBy: z.enum(['day', 'week', 'month', 'year', 'hour']).optional().default('day'),
  paymentMethod: z.enum(['CASH', 'CARD', 'UPI', 'WALLET', 'CREDIT', 'SPLIT']).optional(),
  orderType: z.enum(['DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ONLINE']).optional(),
  employeeId: z.string().uuid().optional(),
  customerId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  menuItemId: z.string().uuid().optional(),
  supplierId: z.string().uuid().optional(),
  tableId: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(1000).optional().default(100),
  offset: z.number().int().min(0).optional().default(0),
}).refine(
  (d) => new Date(d.startDate) <= new Date(d.endDate),
  { message: 'startDate must be before or equal to endDate', path: ['startDate'] }
);

export const exportReportSchema = z.object({
  reportType: z.enum([
    'SALES', 'GST_TAX', 'INVENTORY', 'PROFIT_LOSS',
    'CUSTOMER', 'EMPLOYEE', 'KITCHEN', 'TABLE', 'BRANCH',
  ]),
  format: z.enum(['PDF', 'CSV', 'XLSX']),
  branchId: z.string().uuid().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const scheduledReportSchema = z.object({
  name: z.string().min(2),
  reportType: z.enum(['SALES', 'GST_TAX', 'INVENTORY', 'PROFIT_LOSS']),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  branchId: z.string().uuid().optional(),
  format: z.enum(['PDF', 'CSV', 'XLSX']),
  isActive: z.boolean().default(true),
});

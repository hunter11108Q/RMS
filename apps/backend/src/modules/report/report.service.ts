import prisma from '../../prisma/client';
import BaseService from '../../services/base';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function dateRange(startDate: string, endDate: string) {
  return { gte: new Date(startDate), lte: new Date(endDate) };
}

function groupLabel(date: Date, groupBy: string): string {
  const d = new Date(date);
  if (groupBy === 'hour')  return `${d.toISOString().slice(0, 10)} ${String(d.getHours()).padStart(2, '0')}:00`;
  if (groupBy === 'day')   return d.toISOString().slice(0, 10);
  if (groupBy === 'week')  return `${d.getFullYear()}-W${Math.ceil(d.getDate() / 7)}`;
  if (groupBy === 'month') return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  if (groupBy === 'year')  return String(d.getFullYear());
  return d.toISOString().slice(0, 10);
}

/* ─── NOTE on Bill schema ─────────────────────────────────────────────────────
   Bill has: id, orderId, branchId, billNumber, subTotal, discountAmount,
             taxAmount, serviceCharge, tipsAmount, grandTotal, type, status,
             createdBy, createdAt, taxDetails (BillTaxDetail[]), payments, refunds.
   No: netTotal, cashierId, customerId fields.

   BillTaxDetail has: id, billId, taxName, rate, amount, createdAt.
   Payment has: id, billId, method, amount, referenceNumber, transactionId, status, createdAt.

   Order has: id, branchId, floorId, tableId, customerName, customerPhone,
              waiterId, guestsCount, type, status, priority, notes, source,
              totalAmount, totalDiscount, totalTax, heldAt, createdAt.
   No closedAt, no waiter relation, no bill relation.

   RestaurantTable (not Table) has: number, name, capacity, status etc.
   MenuItem has: dineInPrice, takeawayPrice, deliveryPrice, isActive (not price/status).
   Recipe has: ingredients (RecipeIngredient[]) — note field is `ingredients` not nested.
   RecipeIngredient has: quantity, unit, ingredient (Ingredient).
   Ingredient has: averageCost, wastePercentage is on RecipeIngredient.
──────────────────────────────────────────────────────────────────────────── */

export class ReportService extends BaseService {

  // ─── Dashboard KPIs ─────────────────────────────────────────────────────────
  public async getDashboardKpis(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const { branchId, startDate, endDate } = params;
    const branchFilter = branchId ? { branchId } : {};

    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayEnd   = new Date(); todayEnd.setHours(23, 59, 59, 999);
    const weekStart  = new Date(); weekStart.setDate(weekStart.getDate() - 6); weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

    const [rangeBills, todayBills, weekBills, monthBills, activeTables, activeOrders, outOfStockItems] = await Promise.all([
      prisma.bill.findMany({
        where: { ...branchFilter, status: 'PAID', createdAt: dateRange(startDate, endDate) },
        select: { grandTotal: true, subTotal: true, discountAmount: true, taxAmount: true, payments: { select: { method: true, amount: true } } },
      }),
      prisma.bill.aggregate({
        where: { ...branchFilter, status: 'PAID', createdAt: { gte: todayStart, lte: todayEnd } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      prisma.bill.aggregate({
        where: { ...branchFilter, status: 'PAID', createdAt: { gte: weekStart, lte: todayEnd } },
        _sum: { grandTotal: true },
      }),
      prisma.bill.aggregate({
        where: { ...branchFilter, status: 'PAID', createdAt: { gte: monthStart, lte: todayEnd } },
        _sum: { grandTotal: true },
      }),
      prisma.restaurantTable.count({ where: { ...branchFilter, status: 'OCCUPIED' } }),
      prisma.order.count({ where: { ...branchFilter, status: { in: ['PENDING', 'IN_PROGRESS'] } } }),
      prisma.ingredient.count({ where: { currentStock: { lte: 0 } } }),
    ]);

    let grossRevenue = 0, totalDiscount = 0, totalTax = 0, cashTotal = 0;
    for (const b of rangeBills) {
      grossRevenue  += b.grandTotal;
      totalDiscount += b.discountAmount;
      totalTax      += b.taxAmount;
      for (const p of b.payments) { if (p.method === 'CASH') cashTotal += p.amount; }
    }
    const orderCount = rangeBills.length;

    return {
      todaySales:        todayBills._sum.grandTotal ?? 0,
      weeklySales:       weekBills._sum.grandTotal  ?? 0,
      monthlySales:      monthBills._sum.grandTotal ?? 0,
      grossRevenue:      parseFloat(grossRevenue.toFixed(2)),
      netRevenue:        parseFloat((grossRevenue - totalDiscount).toFixed(2)),
      totalOrders:       orderCount,
      todayOrders:       todayBills._count,
      avgOrderValue:     orderCount > 0 ? parseFloat((grossRevenue / orderCount).toFixed(2)) : 0,
      discountAmount:    parseFloat(totalDiscount.toFixed(2)),
      taxCollected:      parseFloat(totalTax.toFixed(2)),
      cashDrawerBalance: parseFloat(cashTotal.toFixed(2)),
      activeTables,
      activeOrders,
      outOfStockItems,
    };
  }

  // ─── Sales Trend ─────────────────────────────────────────────────────────────
  public async getSalesTrend(params: { branchId?: string; startDate: string; endDate: string; groupBy: string }): Promise<any> {
    const { branchId, startDate, endDate, groupBy } = params;
    const bills = await prisma.bill.findMany({
      where: { ...(branchId ? { branchId } : {}), status: 'PAID', createdAt: dateRange(startDate, endDate) },
      select: { grandTotal: true, subTotal: true, discountAmount: true, taxAmount: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const map: Record<string, { label: string; grossSales: number; netSales: number; discount: number; tax: number; count: number }> = {};
    for (const b of bills) {
      const key = groupLabel(b.createdAt, groupBy);
      if (!map[key]) map[key] = { label: key, grossSales: 0, netSales: 0, discount: 0, tax: 0, count: 0 };
      map[key].grossSales += b.grandTotal;
      map[key].netSales   += b.grandTotal - b.discountAmount;
      map[key].discount   += b.discountAmount;
      map[key].tax        += b.taxAmount;
      map[key].count      += 1;
    }

    return Object.values(map).map((s) => ({
      ...s,
      grossSales: parseFloat(s.grossSales.toFixed(2)),
      netSales:   parseFloat(s.netSales.toFixed(2)),
      discount:   parseFloat(s.discount.toFixed(2)),
      tax:        parseFloat(s.tax.toFixed(2)),
    }));
  }

  // ─── Hourly Sales ────────────────────────────────────────────────────────────
  public async getHourlySales(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const bills = await prisma.bill.findMany({
      where: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
      select: { grandTotal: true, createdAt: true },
    });
    const hourMap: Record<number, number> = {};
    for (let h = 0; h < 24; h++) hourMap[h] = 0;
    for (const b of bills) hourMap[b.createdAt.getHours()] += b.grandTotal;

    return Object.entries(hourMap).map(([hour, total]) => ({
      hour: parseInt(hour, 10),
      label: `${String(hour).padStart(2, '0')}:00`,
      total: parseFloat(total.toFixed(2)),
    }));
  }

  // ─── Payment Method Breakdown ────────────────────────────────────────────────
  public async getPaymentBreakdown(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const payments = await prisma.payment.findMany({
      where: {
        bill: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
      },
      select: { method: true, amount: true },
    });
    const map: Record<string, { method: string; amount: number; count: number }> = {};
    for (const p of payments) {
      if (!map[p.method]) map[p.method] = { method: p.method, amount: 0, count: 0 };
      map[p.method].amount += p.amount;
      map[p.method].count  += 1;
    }
    return Object.values(map).map((m) => ({ ...m, amount: parseFloat(m.amount.toFixed(2)) }));
  }

  // ─── Category-wise Sales ─────────────────────────────────────────────────────
  public async getCategoryWiseSales(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    // OrderItem has inline `name` field (no menuItem relation). Group by menuItemId.
    const items = await prisma.orderItem.findMany({
      where: {
        order: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'COMPLETED', createdAt: dateRange(params.startDate, params.endDate) },
      },
      select: { quantity: true, unitPrice: true, name: true, menuItemId: true },
    });
    // Category grouping is not directly available; group by menuItemId as proxy
    const map: Record<string, { category: string; totalSales: number; totalItems: number }> = {};
    for (const item of items) {
      const cat = 'General'; // No category relation on OrderItem; extend schema to join if needed
      if (!map[cat]) map[cat] = { category: cat, totalSales: 0, totalItems: 0 };
      map[cat].totalSales += item.unitPrice * item.quantity;
      map[cat].totalItems += item.quantity;
    }
    return Object.values(map)
      .map((c) => ({ ...c, totalSales: parseFloat(c.totalSales.toFixed(2)) }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }

  // ─── Item-wise Sales ─────────────────────────────────────────────────────────
  public async getItemWiseSales(params: { branchId?: string; startDate: string; endDate: string; limit?: number }): Promise<any> {
    // OrderItem has inline `name` field — use it directly, group by menuItemId
    const items = await prisma.orderItem.findMany({
      where: {
        order: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'COMPLETED', createdAt: dateRange(params.startDate, params.endDate) },
      },
      select: { quantity: true, unitPrice: true, name: true, menuItemId: true },
    });
    const map: Record<string, { menuItemId: string; name: string; totalSales: number; totalQty: number }> = {};
    for (const item of items) {
      const id   = item.menuItemId;
      const name = item.name;
      if (!map[id]) map[id] = { menuItemId: id, name, totalSales: 0, totalQty: 0 };
      map[id].totalSales += item.unitPrice * item.quantity;
      map[id].totalQty   += item.quantity;
    }
    return Object.values(map)
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, params.limit ?? 100)
      .map((i) => ({ ...i, totalSales: parseFloat(i.totalSales.toFixed(2)) }));
  }

  // ─── Waiter-wise Sales ───────────────────────────────────────────────────────
  public async getWaiterWiseSales(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const orders = await prisma.order.findMany({
      where: {
        ...(params.branchId ? { branchId: params.branchId } : {}),
        status: 'COMPLETED',
        createdAt: dateRange(params.startDate, params.endDate),
        waiterId: { not: null },
      },
      select: { waiterId: true, totalAmount: true },
    });
    const map: Record<string, { waiterId: string; totalSales: number; orderCount: number }> = {};
    for (const o of orders) {
      const wid = o.waiterId!;
      if (!map[wid]) map[wid] = { waiterId: wid, totalSales: 0, orderCount: 0 };
      map[wid].totalSales  += o.totalAmount;
      map[wid].orderCount  += 1;
    }
    return Object.values(map)
      .sort((a, b) => b.totalSales - a.totalSales)
      .map((w) => ({ ...w, totalSales: parseFloat(w.totalSales.toFixed(2)) }));
  }

  // ─── GST / Tax Summary ───────────────────────────────────────────────────────
  public async getGstReport(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    // BillTaxDetail: taxName, rate, amount
    const taxDetails = await prisma.billTaxDetail.findMany({
      where: {
        bill: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
      },
      select: { taxName: true, rate: true, amount: true },
    });
    const map: Record<string, { taxName: string; rate: number; taxableAmount: number; taxAmount: number; count: number }> = {};
    for (const t of taxDetails) {
      const key = `${t.taxName}_${t.rate}`;
      if (!map[key]) map[key] = { taxName: t.taxName, rate: t.rate, taxableAmount: 0, taxAmount: t.amount, count: 0 };
      map[key].taxAmount += t.amount;
      map[key].count     += 1;
    }
    const rows = Object.values(map).map((t) => ({
      ...t,
      taxAmount: parseFloat(t.taxAmount.toFixed(2)),
    }));
    const totalTax = rows.reduce((acc, r) => acc + r.taxAmount, 0);
    return {
      rows: rows.sort((a, b) => a.taxName.localeCompare(b.taxName)),
      totals: { taxAmount: parseFloat(totalTax.toFixed(2)) },
    };
  }

  // ─── Profit & Loss ───────────────────────────────────────────────────────────
  public async getProfitLoss(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const { branchId, startDate, endDate } = params;
    const branchFilter = branchId ? { branchId } : {};

    const [bills, refunds, wastage, purchases] = await Promise.all([
      prisma.bill.findMany({
        where: { ...branchFilter, status: 'PAID', createdAt: dateRange(startDate, endDate) },
        select: { grandTotal: true, subTotal: true, discountAmount: true, taxAmount: true },
      }),
      prisma.refund.findMany({
        where: { bill: { ...branchFilter, createdAt: dateRange(startDate, endDate) } },
        select: { amount: true },
      }),
      prisma.wastageEntry.findMany({
        where: { ...branchFilter, createdAt: dateRange(startDate, endDate) },
        select: { quantity: true, ingredient: { select: { averageCost: true } } },
      }),
      prisma.purchaseOrderItem.findMany({
        where: { po: { ...branchFilter, createdAt: dateRange(startDate, endDate) } },
        select: { quantity: true, unitPrice: true },
      }),
    ]);

    let grossSales = 0, totalDiscount = 0, totalTax = 0, totalRefund = 0;
    for (const b of bills) { grossSales += b.grandTotal; totalDiscount += b.discountAmount; totalTax += b.taxAmount; }
    for (const r of refunds) totalRefund += r.amount;
    let cogs = 0; for (const p of purchases) cogs += p.quantity * p.unitPrice;
    let wastageCost = 0; for (const w of wastage) wastageCost += w.quantity * (w.ingredient?.averageCost ?? 0);

    const netSales    = grossSales - totalDiscount - totalRefund;
    const grossProfit = netSales - cogs - wastageCost;

    return {
      grossSales:        parseFloat(grossSales.toFixed(2)),
      totalDiscount:     parseFloat(totalDiscount.toFixed(2)),
      totalRefund:       parseFloat(totalRefund.toFixed(2)),
      netSales:          parseFloat(netSales.toFixed(2)),
      cogs:              parseFloat(cogs.toFixed(2)),
      wastageCost:       parseFloat(wastageCost.toFixed(2)),
      taxCollected:      parseFloat(totalTax.toFixed(2)),
      grossProfit:       parseFloat(grossProfit.toFixed(2)),
      foodCostPercent:   netSales > 0 ? parseFloat(((cogs / netSales) * 100).toFixed(2)) : 0,
    };
  }

  // ─── Inventory Report ────────────────────────────────────────────────────────
  public async getInventoryReport(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    // Ingredient has no branchId — filter by tenantId only (global ingredient catalog)
    const [ingredients, wastage] = await Promise.all([
      prisma.ingredient.findMany({ orderBy: { name: 'asc' } }),
      prisma.wastageEntry.findMany({
        where: { ...(params.branchId ? { branchId: params.branchId } : {}), createdAt: dateRange(params.startDate, params.endDate) },
        select: { quantity: true, ingredient: { select: { averageCost: true } } },
      }),
    ]);

    const stockValuation = ingredients.reduce((sum, i) => sum + i.currentStock * i.averageCost, 0);
    const lowStock  = ingredients.filter((i) => i.currentStock <= i.reorderLevel && i.currentStock > 0);
    const outOfStock = ingredients.filter((i) => i.currentStock <= 0);
    const wastageValue = wastage.reduce((sum, w) => sum + w.quantity * (w.ingredient?.averageCost ?? 0), 0);

    return {
      totalIngredients: ingredients.length,
      stockValuation:   parseFloat(stockValuation.toFixed(2)),
      lowStockCount:    lowStock.length,
      outOfStockCount:  outOfStock.length,
      wastageValue:     parseFloat(wastageValue.toFixed(2)),
      lowStockItems:    lowStock.map((i) => ({ id: i.id, name: i.name, currentStock: i.currentStock, reorderLevel: i.reorderLevel, unit: i.unit })),
      outOfStockItems:  outOfStock.map((i) => ({ id: i.id, name: i.name, unit: i.unit })),
    };
  }

  // ─── Customer Analytics ──────────────────────────────────────────────────────
  public async getCustomerAnalytics(params: { branchId?: string; startDate: string; endDate: string; limit?: number }): Promise<any> {
    // Bill has customerName/customerPhone directly; no customerId relation
    const bills = await prisma.bill.findMany({
      where: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
      select: { grandTotal: true, createdBy: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by createdBy as a proxy for cashier/session (no customer relation on Bill)
    const map: Record<string, { key: string; totalSpent: number; visitCount: number }> = {};
    for (const b of bills) {
      const key = b.createdBy;
      if (!map[key]) map[key] = { key, totalSpent: 0, visitCount: 0 };
      map[key].totalSpent  += b.grandTotal;
      map[key].visitCount  += 1;
    }
    const sorted = Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalBillSessions: bills.length,
      topSessions: sorted.slice(0, params.limit ?? 20).map((c) => ({
        ...c,
        totalSpent: parseFloat(c.totalSpent.toFixed(2)),
        avgSpend:   parseFloat((c.totalSpent / c.visitCount).toFixed(2)),
      })),
    };
  }

  // ─── Kitchen Analytics ───────────────────────────────────────────────────────
  public async getKitchenAnalytics(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    // KOT has no completedAt field — derive completion time from KitchenTimerLog
    const kots = await prisma.kOT.findMany({
      where: {
        ...(params.branchId ? { branchId: params.branchId } : {}),
        createdAt: dateRange(params.startDate, params.endDate),
        status: { in: ['COMPLETED', 'CANCELLED'] },
      },
      select: {
        status: true,
        createdAt: true,
        timers: { select: { action: true, timestamp: true }, orderBy: { timestamp: 'asc' } },
      },
    });

    let totalPrepMs = 0, completed = 0, cancelled = 0, delayed = 0;
    for (const k of kots) {
      // Find the last COMPLETED action timestamp as proxy for end time
      const completedTimer = k.timers.filter((t) => t.action === 'COMPLETED').pop();
      if (k.status === 'COMPLETED') {
        const ms = completedTimer ? completedTimer.timestamp.getTime() - k.createdAt.getTime() : 0;
        if (ms > 0) { totalPrepMs += ms; if (ms > 20 * 60 * 1000) delayed += 1; }
        completed += 1;
      } else if (k.status === 'CANCELLED') {
        cancelled += 1;
      }
    }

    return {
      totalKots:      kots.length,
      completed,
      cancelled,
      delayed,
      avgPrepMinutes: completed > 0 ? parseFloat((totalPrepMs / completed / 60000).toFixed(1)) : 0,
      slaCompliance:  completed > 0  ? parseFloat((((completed - delayed) / completed) * 100).toFixed(1)) : 100,
    };
  }

  // ─── Table Analytics ─────────────────────────────────────────────────────────
  public async getTableAnalytics(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    const { branchId, startDate, endDate } = params;
    const branchFilter = branchId ? { branchId } : {};

    // RestaurantTable (not Table) — fields: id, number, name, capacity
    const [tables, orders] = await Promise.all([
      prisma.restaurantTable.findMany({ where: branchFilter, select: { id: true, number: true, name: true, capacity: true } }),
      prisma.order.findMany({
        where: { ...branchFilter, tableId: { not: null }, status: 'COMPLETED', createdAt: dateRange(startDate, endDate) },
        select: { tableId: true, totalAmount: true, createdAt: true, heldAt: true },
      }),
    ]);

    const tableMap: Record<string, { tableId: string; tableNumber: string; tableName: string; totalRevenue: number; visits: number; totalDurationMs: number }> = {};
    for (const t of tables) {
      tableMap[t.id] = { tableId: t.id, tableNumber: t.number, tableName: t.name, totalRevenue: 0, visits: 0, totalDurationMs: 0 };
    }

    for (const o of orders) {
      if (!o.tableId || !tableMap[o.tableId]) continue;
      tableMap[o.tableId].totalRevenue += o.totalAmount;
      tableMap[o.tableId].visits       += 1;
      // Approximate duration: createdAt → heldAt (closest proxy)
      if (o.heldAt) tableMap[o.tableId].totalDurationMs += o.heldAt.getTime() - o.createdAt.getTime();
    }

    return {
      totalTables: tables.length,
      tables: Object.values(tableMap).map((t) => ({
        tableId:      t.tableId,
        tableNumber:  t.tableNumber,
        tableName:    t.tableName,
        totalRevenue: parseFloat(t.totalRevenue.toFixed(2)),
        visits:       t.visits,
        avgDurationMin: t.visits > 0 ? parseFloat((t.totalDurationMs / t.visits / 60000).toFixed(1)) : 0,
      })).sort((a, b) => b.totalRevenue - a.totalRevenue),
    };
  }

  // ─── Branch Comparison ───────────────────────────────────────────────────────
  public async getBranchComparison(params: { startDate: string; endDate: string }): Promise<any> {
    const branches = await prisma.branch.findMany({ select: { id: true, name: true } });

    const comparison = await Promise.all(
      branches.map(async (branch) => {
        const [agg, orderCount] = await Promise.all([
          prisma.bill.aggregate({
            where: { branchId: branch.id, status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
            _sum: { grandTotal: true, discountAmount: true },
            _count: true,
          }),
          prisma.order.count({
            where: { branchId: branch.id, status: 'COMPLETED', createdAt: dateRange(params.startDate, params.endDate) },
          }),
        ]);
        const gross    = agg._sum.grandTotal    ?? 0;
        const discount = agg._sum.discountAmount ?? 0;
        return {
          branchId:    branch.id,
          branchName:  branch.name,
          grossSales:  parseFloat(gross.toFixed(2)),
          netSales:    parseFloat((gross - discount).toFixed(2)),
          discount:    parseFloat(discount.toFixed(2)),
          billCount:   agg._count,
          orderCount,
        };
      })
    );

    return comparison.sort((a, b) => b.grossSales - a.grossSales);
  }

  // ─── Food Cost Analysis ──────────────────────────────────────────────────────
  public async getFoodCostAnalysis(params: { limit?: number }): Promise<any> {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      select: {
        id: true, name: true, dineInPrice: true,
        recipes: {
          select: {
            ingredients: {
              select: {
                quantity: true,
                wastePercentage: true,
                ingredient: { select: { averageCost: true } },
              },
            },
          },
        },
      },
      take: params.limit ?? 100,
    });

    return menuItems.map((item) => {
      let recipeCost = 0;
      if (item.recipes.length > 0) {
        for (const line of item.recipes[0].ingredients) {
          const wasteMul = 1 + line.wastePercentage / 100;
          recipeCost += line.quantity * line.ingredient.averageCost * wasteMul;
        }
      }
      const sellingPrice  = item.dineInPrice;
      const margin        = sellingPrice - recipeCost;
      const foodCostPct   = sellingPrice > 0 ? parseFloat(((recipeCost / sellingPrice) * 100).toFixed(2)) : 0;
      return {
        menuItemId:      item.id,
        name:            item.name,
        sellingPrice,
        recipeCost:      parseFloat(recipeCost.toFixed(2)),
        grossMargin:     parseFloat(margin.toFixed(2)),
        foodCostPercent: foodCostPct,
        profitability:   foodCostPct < 30 ? 'HIGH' : foodCostPct < 50 ? 'MEDIUM' : 'LOW',
      };
    }).sort((a, b) => b.grossMargin - a.grossMargin);
  }

  // ─── Employee / Cashier Sales ────────────────────────────────────────────────
  public async getEmployeeSalesReport(params: { branchId?: string; startDate: string; endDate: string }): Promise<any> {
    // Bill has: createdBy (userId of cashier). No cashierId field.
    const bills = await prisma.bill.findMany({
      where: { ...(params.branchId ? { branchId: params.branchId } : {}), status: 'PAID', createdAt: dateRange(params.startDate, params.endDate) },
      select: { createdBy: true, grandTotal: true },
    });

    const map: Record<string, { userId: string; totalBilled: number; billCount: number }> = {};
    for (const b of bills) {
      const uid = b.createdBy;
      if (!map[uid]) map[uid] = { userId: uid, totalBilled: 0, billCount: 0 };
      map[uid].totalBilled += b.grandTotal;
      map[uid].billCount   += 1;
    }

    // Lookup user names in a single query
    const userIds = Object.keys(map);
    const users   = userIds.length > 0 ? await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, username: true } }) : [];
    const nameMap: Record<string, string> = {};
    for (const u of users) nameMap[u.id] = u.username;

    return Object.values(map)
      .sort((a, b) => b.totalBilled - a.totalBilled)
      .map((c) => ({ ...c, name: nameMap[c.userId] ?? 'Unknown', totalBilled: parseFloat(c.totalBilled.toFixed(2)) }));
  }

  // ─── Audit Logging ───────────────────────────────────────────────────────────
  public async logReportGeneration(tenantId: string, userId: string, reportType: string, params: any): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: { tenantId, userId, action: 'REPORT_GENERATED', tableName: 'reports', recordId: `${reportType}_${Date.now()}`, newValues: JSON.stringify({ reportType, params }) },
      });
    } catch (err: any) {
      this.logError('Report audit logging failed:', err);
    }
  }
}

export const reportService = new ReportService();
export default reportService;

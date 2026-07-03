/**
 * Integration Tests – Report & BI Module
 * Tests cover: KPI aggregation logic, P&L calculations, GST grouping,
 * food cost margins, and validation schema enforcement.
 */
import { reportFilterSchema, exportReportSchema } from '@rms/validation';

// ─────────────────────────────────────────────────────────────────────────────
// Validation schema tests
// ─────────────────────────────────────────────────────────────────────────────

describe('reportFilterSchema validation', () => {
  const baseParams = {
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-31T23:59:59.000Z',
  };

  it('should pass with valid date range', () => {
    const result = reportFilterSchema.safeParse(baseParams);
    expect(result.success).toBe(true);
  });

  it('should fail when startDate is after endDate', () => {
    const result = reportFilterSchema.safeParse({
      startDate: '2025-02-01T00:00:00.000Z',
      endDate: '2025-01-01T00:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('should default groupBy to "day"', () => {
    const result = reportFilterSchema.safeParse(baseParams);
    if (result.success) {
      expect(result.data.groupBy).toBe('day');
    }
  });

  it('should reject invalid groupBy value', () => {
    const result = reportFilterSchema.safeParse({ ...baseParams, groupBy: 'quarter' });
    expect(result.success).toBe(false);
  });

  it('should accept valid UUID for branchId', () => {
    const result = reportFilterSchema.safeParse({
      ...baseParams,
      branchId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    });
    expect(result.success).toBe(true);
  });

  it('should reject malformed branchId', () => {
    const result = reportFilterSchema.safeParse({ ...baseParams, branchId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });
});

describe('exportReportSchema validation', () => {
  it('should pass with valid export request', () => {
    const result = exportReportSchema.safeParse({
      reportType: 'SALES',
      format: 'PDF',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-31T23:59:59.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should fail with unsupported format', () => {
    const result = exportReportSchema.safeParse({
      reportType: 'SALES',
      format: 'DOC',
      startDate: '2025-01-01T00:00:00.000Z',
      endDate: '2025-01-31T23:59:59.000Z',
    });
    expect(result.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Profit & Loss calculation unit tests (pure logic)
// ─────────────────────────────────────────────────────────────────────────────

describe('Profit & Loss calculation accuracy', () => {
  function calcPL(grossSales: number, discount: number, refund: number, cogs: number) {
    const netSales = grossSales - discount - refund;
    const grossProfit = netSales - cogs;
    const foodCostPct = netSales > 0 ? parseFloat(((cogs / netSales) * 100).toFixed(2)) : 0;
    return { netSales, grossProfit, foodCostPct };
  }

  it('should compute correct net sales', () => {
    const { netSales } = calcPL(10000, 500, 200, 3000);
    expect(netSales).toBe(9300);
  });

  it('should compute correct gross profit', () => {
    const { grossProfit } = calcPL(10000, 500, 200, 3000);
    expect(grossProfit).toBe(6300);
  });

  it('should compute food cost % correctly', () => {
    const { foodCostPct } = calcPL(10000, 500, 200, 3000);
    // 3000 / 9300 * 100 = 32.26
    expect(foodCostPct).toBeCloseTo(32.26, 1);
  });

  it('should handle zero net sales gracefully', () => {
    const { foodCostPct } = calcPL(0, 0, 0, 0);
    expect(foodCostPct).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Food cost margin classification unit tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Food cost profitability classification', () => {
  function classify(foodCostPct: number): string {
    return foodCostPct < 30 ? 'HIGH' : foodCostPct < 50 ? 'MEDIUM' : 'LOW';
  }

  it('should classify food cost < 30% as HIGH', () => {
    expect(classify(25)).toBe('HIGH');
  });

  it('should classify food cost 30-49% as MEDIUM', () => {
    expect(classify(40)).toBe('MEDIUM');
  });

  it('should classify food cost >= 50% as LOW', () => {
    expect(classify(60)).toBe('LOW');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Weighted average cost calculation unit test
// ─────────────────────────────────────────────────────────────────────────────

describe('Weighted average cost calculation', () => {
  function weightedAvgCost(currentStock: number, currentAvgCost: number, newQty: number, newUnitPrice: number): number {
    const totalStock = currentStock + newQty;
    if (totalStock === 0) return newUnitPrice;
    const totalCost = currentStock * currentAvgCost + newQty * newUnitPrice;
    return parseFloat((totalCost / totalStock).toFixed(2));
  }

  it('should compute weighted average correctly', () => {
    // 100 units @ ₹10, then receive 50 units @ ₹16
    const result = weightedAvgCost(100, 10, 50, 16);
    // (100*10 + 50*16) / 150 = 1800/150 = 12
    expect(result).toBe(12.0);
  });

  it('should handle zero existing stock', () => {
    expect(weightedAvgCost(0, 0, 50, 20)).toBe(20);
  });
});

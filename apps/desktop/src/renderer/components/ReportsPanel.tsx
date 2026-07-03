import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  color?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
  size?: number;
}

// ─── Mock BI Data ─────────────────────────────────────────────────────────────
const mockKpis = {
  todaySales: 48250,
  weeklySales: 312800,
  monthlySales: 1245600,
  grossRevenue: 1245600,
  netRevenue: 1168400,
  totalOrders: 3842,
  avgOrderValue: 324.2,
  discountAmount: 42300,
  taxCollected: 89620,
  refundAmount: 34900,
  cashDrawerBalance: 18400,
  activeTables: 12,
  activeOrders: 18,
  outOfStockItems: 3,
  lowStockItems: 7,
  foodCostPercent: 31.4,
  grossProfit: 802450,
};

const mockSalesTrend = [
  { label: 'Mon', grossSales: 42000, netSales: 39000 },
  { label: 'Tue', grossSales: 38500, netSales: 35800 },
  { label: 'Wed', grossSales: 51200, netSales: 47600 },
  { label: 'Thu', grossSales: 44800, netSales: 41500 },
  { label: 'Fri', grossSales: 68400, netSales: 63200 },
  { label: 'Sat', grossSales: 89200, netSales: 82800 },
  { label: 'Sun', grossSales: 71600, netSales: 66400 },
];

const mockPaymentBreakdown = [
  { method: 'CASH', amount: 384600, color: '#10B981' },
  { method: 'UPI', amount: 521800, color: '#6366F1' },
  { method: 'CARD', amount: 198400, color: '#F59E0B' },
  { method: 'WALLET', amount: 88200, color: '#EC4899' },
  { method: 'CREDIT', amount: 52600, color: '#EF4444' },
];

const mockCategorySales = [
  { category: 'Main Course', totalSales: 428600, totalItems: 1824 },
  { category: 'Beverages', totalSales: 198200, totalItems: 2840 },
  { category: 'Starters', totalSales: 186400, totalItems: 1204 },
  { category: 'Desserts', totalSales: 94800, totalItems: 876 },
  { category: 'Breads', totalSales: 78400, totalItems: 1540 },
];

const mockTopItems = [
  { name: 'Paneer Butter Masala', totalQty: 428, totalSales: 119840 },
  { name: 'Chicken Tikka', totalQty: 384, totalSales: 115200 },
  { name: 'Butter Naan', totalQty: 918, totalSales: 45900 },
  { name: 'Dal Makhani', totalQty: 312, totalSales: 74880 },
  { name: 'Veg Biryani', totalQty: 267, totalSales: 93450 },
];

const mockGst = {
  rows: [
    { taxType: 'CGST', taxRate: 2.5, taxableAmount: 892400, taxAmount: 22310 },
    { taxType: 'SGST', taxRate: 2.5, taxableAmount: 892400, taxAmount: 22310 },
    { taxType: 'CGST', taxRate: 6, taxableAmount: 248600, taxAmount: 14916 },
    { taxType: 'SGST', taxRate: 6, taxableAmount: 248600, taxAmount: 14916 },
    { taxType: 'Cess', taxRate: 1, taxableAmount: 48200, taxAmount: 482 },
  ],
  totals: { taxableAmount: 1141000, taxAmount: 74934 },
};

const mockPL = {
  grossSales: 1245600,
  totalDiscount: 42300,
  totalRefund: 34900,
  netSales: 1168400,
  cogs: 366800,
  wastageCost: 28400,
  totalTaxCollected: 89620,
  grossProfit: 773200,
  foodCostPercent: 31.4,
};

const mockInventory = {
  totalIngredients: 84,
  stockValuation: 284600,
  lowStockCount: 7,
  outOfStockCount: 3,
  wastageValue: 28400,
  lowStockItems: [
    { name: 'Paneer', currentStock: 2.4, reorderLevel: 5, unit: 'kg' },
    { name: 'Tomatoes', currentStock: 1.8, reorderLevel: 4, unit: 'kg' },
    { name: 'Cream', currentStock: 0.6, reorderLevel: 2, unit: 'litre' },
  ],
};

const mockFoodCost = [
  { name: 'Paneer Butter Masala', sellingPrice: 280, recipeCost: 68, grossMargin: 212, foodCostPercent: 24.3, profitability: 'HIGH' },
  { name: 'Chicken Tikka', sellingPrice: 320, recipeCost: 118, grossMargin: 202, foodCostPercent: 36.9, profitability: 'MEDIUM' },
  { name: 'Butter Naan', sellingPrice: 50, recipeCost: 8, grossMargin: 42, foodCostPercent: 16.0, profitability: 'HIGH' },
  { name: 'Veg Biryani', sellingPrice: 350, recipeCost: 142, grossMargin: 208, foodCostPercent: 40.6, profitability: 'MEDIUM' },
  { name: 'Lassi', sellingPrice: 80, recipeCost: 44, grossMargin: 36, foodCostPercent: 55.0, profitability: 'LOW' },
];

const mockKitchen = {
  totalKots: 1248,
  completed: 1186,
  cancelled: 28,
  delayed: 34,
  avgPrepMinutes: 14.2,
  slaCompliance: 97.1,
};

// ─── Utility ──────────────────────────────────────────────────────────────────
const INR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ─── Mini Components ──────────────────────────────────────────────────────────

const KpiCard: React.FC<KpiCardProps> = ({ label, value, subLabel, color = '#6366F1', icon = '📊', trend }) => (
  <div style={{
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    border: `1px solid ${color}30`,
    borderRadius: '12px',
    padding: '20px',
    minWidth: '160px',
    flex: '1 1 160px',
    position: 'relative',
    overflow: 'hidden',
  }}>
    <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: `${color}15`, borderRadius: '0 12px 0 80px' }} />
    <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ fontSize: '22px', fontWeight: 700, color: color, fontFamily: 'Outfit, sans-serif' }}>{value}</div>
    {subLabel && <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>{subLabel}</div>}
    {trend && (
      <div style={{ position: 'absolute', top: '16px', right: '16px', fontSize: '18px' }}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
      </div>
    )}
  </div>
);

const BarChart: React.FC<BarChartProps> = ({ data, color = '#6366F1', height = 120 }) => {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: `${height}px`, padding: '0 4px' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            title={`${d.label}: ${d.value.toLocaleString()}`}
            style={{
              width: '100%',
              height: `${Math.max((d.value / max) * 100, 4)}%`,
              background: `linear-gradient(to top, ${color}, ${color}80)`,
              borderRadius: '4px 4px 0 0',
              transition: 'height 0.3s ease',
              cursor: 'default',
            }}
          />
          <span style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap' }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const PieChart: React.FC<PieChartProps> = ({ data, size = 120 }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;
  const r = size / 2;
  const segments = data.map((d) => {
    const startAngle = (cumulative / total) * 360;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 360;
    return { ...d, startAngle, endAngle };
  });

  const polarToCartesian = (cx: number, cy: number, radius: number, angleDeg: number) => {
    const angle = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((seg, i) => {
        const start = polarToCartesian(r, r, r - 8, seg.startAngle);
        const end = polarToCartesian(r, r, r - 8, seg.endAngle);
        const largeArc = seg.endAngle - seg.startAngle > 180 ? 1 : 0;
        const d = `M${r},${r} L${start.x},${start.y} A${r - 8},${r - 8} 0 ${largeArc},1 ${end.x},${end.y} Z`;
        return <path key={i} d={d} fill={seg.color} stroke="#0F172A" strokeWidth={2} />;
      })}
      <circle cx={r} cy={r} r={r * 0.38} fill="#0F172A" />
    </svg>
  );
};

// ─── Section Wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '12px', padding: '24px', marginBottom: '24px' }}>
    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '12px', fontFamily: 'Outfit, sans-serif' }}>
      {title}
    </h3>
    {children}
  </div>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const TabBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    id={`reports-tab-${label.replace(/\s+/g, '-').toLowerCase()}`}
    onClick={onClick}
    style={{
      padding: '8px 16px',
      borderRadius: '8px',
      border: 'none',
      background: active ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' : '#1E293B',
      color: active ? '#FFFFFF' : '#94A3B8',
      fontWeight: active ? 700 : 500,
      fontSize: '13px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
  </button>
);

// ─── Data Table ───────────────────────────────────────────────────────────────
const DataTable: React.FC<{ headers: string[]; rows: React.ReactNode[][] }> = ({ headers, rows }) => (
  <div style={{ overflowX: 'auto' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ textAlign: 'left', padding: '10px 12px', background: '#0F172A', color: '#94A3B8', fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #334155' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ borderBottom: '1px solid #1E293B' }}>
            {row.map((cell, ci) => (
              <td key={ci} style={{ padding: '10px 12px', color: '#CBD5E1', verticalAlign: 'middle' }}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ─── Export Button ────────────────────────────────────────────────────────────
const ExportButtons: React.FC = () => (
  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginBottom: '12px' }}>
    {['CSV', 'XLSX', 'PDF'].map((fmt) => (
      <button
        key={fmt}
        id={`export-btn-${fmt.toLowerCase()}`}
        onClick={() => alert(`Exporting as ${fmt}... (Integration with export service required)`)}
        style={{
          padding: '6px 14px',
          borderRadius: '6px',
          border: '1px solid #334155',
          background: '#0F172A',
          color: '#94A3B8',
          fontSize: '12px',
          cursor: 'pointer',
          fontWeight: 600,
        }}
      >
        ↓ {fmt}
      </button>
    ))}
  </div>
);

// ─── Main ReportsPanel Component ──────────────────────────────────────────────
type ReportTab = 'dashboard' | 'sales' | 'gst' | 'pnl' | 'inventory' | 'foodcost' | 'kitchen' | 'branches';

export const ReportsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ReportTab>('dashboard');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2025-06-01',
    end: '2025-06-29',
  });

  const containerStyle: React.CSSProperties = {
    background: '#0F172A',
    minHeight: '100vh',
    padding: '0',
    fontFamily: 'Inter, sans-serif',
    color: '#E2E8F0',
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
    borderBottom: '1px solid #334155',
    padding: '20px 28px',
  };

  return (
    <div style={containerStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Outfit, sans-serif', margin: 0 }}>
              📊 Business Intelligence & Reports
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0' }}>Enterprise analytics for data-driven decisions</p>
          </div>

          {/* Date Range Picker */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id="report-start-date"
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((p) => ({ ...p, start: e.target.value }))}
              style={{ padding: '8px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#E2E8F0', fontSize: '13px' }}
            />
            <span style={{ color: '#64748B', fontSize: '13px' }}>to</span>
            <input
              id="report-end-date"
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((p) => ({ ...p, end: e.target.value }))}
              style={{ padding: '8px 12px', background: '#1E293B', border: '1px solid #334155', borderRadius: '8px', color: '#E2E8F0', fontSize: '13px' }}
            />
            <button
              id="report-apply-filter"
              style={{ padding: '8px 16px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', border: 'none', borderRadius: '8px', color: '#FFFFFF', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Apply
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: '6px', marginTop: '16px', flexWrap: 'wrap' }}>
          {([
            ['dashboard', '🏠 Dashboard'],
            ['sales', '📈 Sales'],
            ['gst', '🧾 GST & Tax'],
            ['pnl', '💰 P&L'],
            ['inventory', '📦 Inventory'],
            ['foodcost', '🍽️ Food Cost'],
            ['kitchen', '🍳 Kitchen'],
            ['branches', '🏢 Branches'],
          ] as [ReportTab, string][]).map(([tab, label]) => (
            <TabBtn key={tab} active={activeTab === tab} onClick={() => setActiveTab(tab)} label={label} />
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '24px 28px' }}>

        {/* ────────── DASHBOARD ────────── */}
        {activeTab === 'dashboard' && (
          <>
            {/* KPI Grid */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '28px' }}>
              <KpiCard label="Today's Sales" value={INR(mockKpis.todaySales)} icon="🌟" color="#10B981" trend="up" subLabel="vs ₹41,200 yesterday" />
              <KpiCard label="Weekly Sales" value={INR(mockKpis.weeklySales)} icon="📅" color="#6366F1" trend="up" />
              <KpiCard label="Monthly Sales" value={INR(mockKpis.monthlySales)} icon="🗓️" color="#8B5CF6" trend="up" />
              <KpiCard label="Net Revenue" value={INR(mockKpis.netRevenue)} icon="💵" color="#3B82F6" trend="up" />
              <KpiCard label="Total Orders" value={mockKpis.totalOrders.toLocaleString()} icon="🛒" color="#F59E0B" />
              <KpiCard label="Avg Order Value" value={INR(mockKpis.avgOrderValue)} icon="🎯" color="#EC4899" />
              <KpiCard label="Gross Profit" value={INR(mockKpis.grossProfit)} icon="📊" color="#14B8A6" trend="up" />
              <KpiCard label="Food Cost %" value={`${mockKpis.foodCostPercent}%`} icon="🍽️" color="#F97316" subLabel="Target: < 35%" />
              <KpiCard label="Tax Collected" value={INR(mockKpis.taxCollected)} icon="🏛️" color="#A78BFA" />
              <KpiCard label="Discount Given" value={INR(mockKpis.discountAmount)} icon="🏷️" color="#F43F5E" />
              <KpiCard label="Refunds" value={INR(mockKpis.refundAmount)} icon="↩️" color="#EF4444" />
              <KpiCard label="Cash Balance" value={INR(mockKpis.cashDrawerBalance)} icon="💰" color="#10B981" />
              <KpiCard label="Active Tables" value={mockKpis.activeTables} icon="🪑" color="#0EA5E9" />
              <KpiCard label="Active Orders" value={mockKpis.activeOrders} icon="⏳" color="#F59E0B" />
              <KpiCard label="Low Stock" value={mockKpis.lowStockItems} icon="⚠️" color="#F97316" />
              <KpiCard label="Out of Stock" value={mockKpis.outOfStockItems} icon="🔴" color="#EF4444" />
            </div>

            {/* Weekly Sales Chart */}
            <Section title="📈 Weekly Revenue Trend">
              <ExportButtons />
              <BarChart data={mockSalesTrend.map((d) => ({ label: d.label, value: d.grossSales }))} color="#6366F1" height={160} />
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
                {mockSalesTrend.map((d, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#64748B', textAlign: 'center', flex: 1, minWidth: '60px' }}>
                    <div style={{ color: '#6366F1', fontWeight: 700 }}>{INR(d.grossSales)}</div>
                    <div>{d.label}</div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Payment & Category side by side */}
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 340px' }}>
                <Section title="💳 Payment Method Split">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <PieChart data={mockPaymentBreakdown.map((p) => ({ label: p.method, value: p.amount, color: p.color }))} size={140} />
                    <div style={{ flex: 1 }}>
                      {mockPaymentBreakdown.map((p, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1E293B' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: p.color }} />
                            <span style={{ fontSize: '13px', color: '#CBD5E1' }}>{p.method}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: p.color }}>{INR(p.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Section>
              </div>

              <div style={{ flex: '1 1 340px' }}>
                <Section title="🍴 Category Performance">
                  <BarChart data={mockCategorySales.map((c) => ({ label: c.category.split(' ')[0], value: c.totalSales }))} color="#10B981" height={120} />
                  <div style={{ marginTop: '12px' }}>
                    {mockCategorySales.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #1E293B', fontSize: '12px' }}>
                        <span style={{ color: '#CBD5E1' }}>{c.category}</span>
                        <span style={{ color: '#10B981', fontWeight: 600 }}>{INR(c.totalSales)}</span>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>
            </div>
          </>
        )}

        {/* ────────── SALES ────────── */}
        {activeTab === 'sales' && (
          <>
            <Section title="📈 Sales Trend (Last 7 Days)">
              <ExportButtons />
              <BarChart data={mockSalesTrend.map((d) => ({ label: d.label, value: d.grossSales }))} color="#6366F1" height={160} />
            </Section>

            <Section title="🏆 Top Selling Items">
              <ExportButtons />
              <DataTable
                headers={['Item Name', 'Qty Sold', 'Total Sales', 'Avg/Unit']}
                rows={mockTopItems.map((i) => [
                  i.name,
                  i.totalQty,
                  INR(i.totalSales),
                  INR(Math.round(i.totalSales / i.totalQty)),
                ])}
              />
            </Section>

            <Section title="🍴 Category-wise Revenue">
              <ExportButtons />
              <DataTable
                headers={['Category', 'Total Sales', 'Items Sold', '% of Total']}
                rows={mockCategorySales.map((c) => {
                  const totalRevenue = mockCategorySales.reduce((s, x) => s + x.totalSales, 0);
                  return [c.category, INR(c.totalSales), c.totalItems, `${((c.totalSales / totalRevenue) * 100).toFixed(1)}%`];
                })}
              />
            </Section>

            <Section title="💳 Payment Method Breakdown">
              <ExportButtons />
              <DataTable
                headers={['Payment Method', 'Total Amount', '% of Revenue']}
                rows={mockPaymentBreakdown.map((p) => {
                  const total = mockPaymentBreakdown.reduce((s, x) => s + x.amount, 0);
                  return [p.method, INR(p.amount), `${((p.amount / total) * 100).toFixed(1)}%`];
                })}
              />
            </Section>
          </>
        )}

        {/* ────────── GST & TAX ────────── */}
        {activeTab === 'gst' && (
          <Section title="🧾 GST & Tax Liability Summary">
            <ExportButtons />
            <DataTable
              headers={['Tax Type', 'Rate %', 'Taxable Amount', 'Tax Amount']}
              rows={mockGst.rows.map((r) => [r.taxType, `${r.taxRate}%`, INR(r.taxableAmount), INR(r.taxAmount)])}
            />
            <div style={{ marginTop: '16px', padding: '16px', background: '#0F172A', borderRadius: '8px', display: 'flex', gap: '32px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Total Taxable Amount</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#F59E0B' }}>{INR(mockGst.totals.taxableAmount)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase' }}>Total Tax Liability</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#EF4444' }}>{INR(mockGst.totals.taxAmount)}</div>
              </div>
            </div>
          </Section>
        )}

        {/* ────────── P&L ────────── */}
        {activeTab === 'pnl' && (
          <Section title="💰 Profit & Loss Statement">
            <ExportButtons />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Gross Sales', value: mockPL.grossSales, color: '#10B981' },
                { label: 'Total Discounts', value: -mockPL.totalDiscount, color: '#F59E0B' },
                { label: 'Total Refunds', value: -mockPL.totalRefund, color: '#EF4444' },
                { label: 'Net Sales', value: mockPL.netSales, color: '#3B82F6' },
                { label: 'COGS (Purchases)', value: -mockPL.cogs, color: '#F97316' },
                { label: 'Wastage Cost', value: -mockPL.wastageCost, color: '#EC4899' },
                { label: 'Gross Profit', value: mockPL.grossProfit, color: '#14B8A6' },
                { label: 'Tax Collected', value: mockPL.totalTaxCollected, color: '#A78BFA' },
              ].map((item, i) => (
                <div key={i} style={{ padding: '16px', background: '#0F172A', borderRadius: '10px', borderLeft: `3px solid ${item.color}` }}>
                  <div style={{ fontSize: '12px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>{item.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: item.color }}>{INR(Math.abs(item.value))}</div>
                  {item.value < 0 && <div style={{ fontSize: '11px', color: '#EF4444', marginTop: '2px' }}>▼ Expense</div>}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px', background: 'linear-gradient(135deg, #14B8A620, #0F172A)', borderRadius: '10px', border: '1px solid #14B8A640', display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#64748B' }}>Food Cost %</div>
                <div style={{ fontSize: '28px', fontWeight: 700, color: mockPL.foodCostPercent > 35 ? '#EF4444' : '#10B981' }}>{mockPL.foodCostPercent}%</div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>Target: &lt; 35%</div>
              </div>
              <div style={{ flex: 1, height: '4px', background: '#1E293B', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${Math.min(mockPL.foodCostPercent, 100)}%`, background: mockPL.foodCostPercent > 35 ? '#EF4444' : '#10B981', borderRadius: '2px' }} />
              </div>
            </div>
          </Section>
        )}

        {/* ────────── INVENTORY ────────── */}
        {activeTab === 'inventory' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <KpiCard label="Total Ingredients" value={mockInventory.totalIngredients} icon="🥘" color="#6366F1" />
              <KpiCard label="Stock Valuation" value={INR(mockInventory.stockValuation)} icon="📦" color="#10B981" />
              <KpiCard label="Low Stock Alerts" value={mockInventory.lowStockCount} icon="⚠️" color="#F97316" />
              <KpiCard label="Out of Stock" value={mockInventory.outOfStockCount} icon="🔴" color="#EF4444" />
              <KpiCard label="Wastage Value" value={INR(mockInventory.wastageValue)} icon="🗑️" color="#F43F5E" />
            </div>

            <Section title="⚠️ Low Stock Alert Items">
              <ExportButtons />
              <DataTable
                headers={['Ingredient', 'Current Stock', 'Reorder Level', 'Unit', 'Status']}
                rows={mockInventory.lowStockItems.map((i) => [
                  i.name,
                  i.currentStock.toFixed(2),
                  i.reorderLevel,
                  i.unit,
                  i.currentStock === 0 ? '🔴 OUT OF STOCK' : '🟡 LOW STOCK',
                ])}
              />
            </Section>
          </>
        )}

        {/* ────────── FOOD COST ────────── */}
        {activeTab === 'foodcost' && (
          <Section title="🍽️ Recipe Profitability & Food Cost Analysis">
            <ExportButtons />
            <DataTable
              headers={['Menu Item', 'Selling Price', 'Recipe Cost', 'Gross Margin', 'Food Cost %', 'Profitability']}
              rows={mockFoodCost.map((f) => [
                f.name,
                INR(f.sellingPrice),
                INR(f.recipeCost),
                INR(f.grossMargin),
                `${f.foodCostPercent}%`,
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: f.profitability === 'HIGH' ? '#10B98120' : f.profitability === 'MEDIUM' ? '#F59E0B20' : '#EF444420',
                  color: f.profitability === 'HIGH' ? '#10B981' : f.profitability === 'MEDIUM' ? '#F59E0B' : '#EF4444',
                }}>{f.profitability}</span>,
              ])}
            />
          </Section>
        )}

        {/* ────────── KITCHEN ────────── */}
        {activeTab === 'kitchen' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
              <KpiCard label="Total KOTs" value={mockKitchen.totalKots} icon="🎫" color="#6366F1" />
              <KpiCard label="Completed" value={mockKitchen.completed} icon="✅" color="#10B981" />
              <KpiCard label="Cancelled" value={mockKitchen.cancelled} icon="❌" color="#EF4444" />
              <KpiCard label="Delayed (>20min)" value={mockKitchen.delayed} icon="⏰" color="#F97316" />
              <KpiCard label="Avg Prep Time" value={`${mockKitchen.avgPrepMinutes} min`} icon="⏱️" color="#3B82F6" />
              <KpiCard label="SLA Compliance" value={`${mockKitchen.slaCompliance}%`} icon="🎯" color="#14B8A6" subLabel="Target: > 95%" />
            </div>
            <Section title="🍳 Kitchen SLA Performance">
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <PieChart
                  size={160}
                  data={[
                    { label: 'On Time', value: mockKitchen.completed - mockKitchen.delayed, color: '#10B981' },
                    { label: 'Delayed', value: mockKitchen.delayed, color: '#F97316' },
                    { label: 'Cancelled', value: mockKitchen.cancelled, color: '#EF4444' },
                  ]}
                />
                <div>
                  {[
                    { label: 'On Time', value: mockKitchen.completed - mockKitchen.delayed, color: '#10B981' },
                    { label: 'Delayed', value: mockKitchen.delayed, color: '#F97316' },
                    { label: 'Cancelled', value: mockKitchen.cancelled, color: '#EF4444' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                      <span style={{ fontSize: '14px', color: '#CBD5E1' }}>{item.label}</span>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: item.color, marginLeft: 'auto' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ────────── BRANCHES ────────── */}
        {activeTab === 'branches' && (
          <Section title="🏢 Branch Comparison">
            <ExportButtons />
            <DataTable
              headers={['Branch', 'Gross Sales', 'Net Sales', 'Orders', 'Avg Order']}
              rows={[
                ['Main Branch – MG Road', INR(624800), INR(586200), '1,924', INR(304)],
                ['Branch 2 – Koramangala', INR(418600), INR(392400), '1,284', INR(306)],
                ['Branch 3 – Indiranagar', INR(202200), INR(189800), '634', INR(299)],
              ]}
            />
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '8px' }}>Revenue by Branch</div>
              <BarChart
                data={[
                  { label: 'MG Road', value: 624800 },
                  { label: 'Koramangala', value: 418600 },
                  { label: 'Indiranagar', value: 202200 },
                ]}
                color="#8B5CF6"
                height={120}
              />
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

export default ReportsPanel;

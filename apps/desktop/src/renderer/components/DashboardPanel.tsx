import React from 'react';
import { KpiCard } from './ui/KpiCard';
import { Badge } from './ui/Badge';
import { useAppStore } from '../store';

// ─── Mock data (will be replaced by TanStack Query calls to /api/v1/reports) ─
const INR = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const mockKpis = [
  { label: "Today's Sales",    value: INR(48250),  icon: '💰', color: '#10B981', trendValue: '+12%',  trend: 'up'  as const, view: 'reports'  as const },
  { label: 'Active Orders',    value: 18,          icon: '📋', color: '#6366F1', trendValue: '',      trend: undefined,      view: 'orders'   as const },
  { label: 'Kitchen Queue',    value: 7,           icon: '🍳', color: '#F59E0B', trendValue: '',      trend: undefined,      view: 'orders'   as const },
  { label: 'Tables Occupied',  value: '12 / 24',   icon: '🪑', color: '#3B82F6', trendValue: '',      trend: undefined,      view: 'tables'   as const },
  { label: 'Low Stock Alerts', value: 7,           icon: '⚠️', color: '#EF4444', trendValue: '',      trend: 'down' as const, view: 'inventory' as const },
  { label: 'Weekly Sales',     value: INR(312800), icon: '📈', color: '#8B5CF6', trendValue: '+8%',   trend: 'up'  as const, view: 'reports'  as const },
  { label: 'Avg Order Value',  value: INR(324),    icon: '🎯', color: '#EC4899', trendValue: '',      trend: undefined,      view: 'reports'  as const },
  { label: 'Gross Profit',     value: INR(802450), icon: '📊', color: '#14B8A6', trendValue: '+5%',   trend: 'up'  as const, view: 'reports'  as const },
];

const mockRecentOrders = [
  { id: 'ORD-1842', table: 'T-04', items: 6, amount: INR(1240), status: 'IN_PROGRESS', waiter: 'Rahul' },
  { id: 'ORD-1841', table: 'T-07', items: 3, amount: INR(680),  status: 'COMPLETED',   waiter: 'Priya'  },
  { id: 'ORD-1840', table: 'T-12', items: 8, amount: INR(2180), status: 'IN_PROGRESS', waiter: 'Suresh' },
  { id: 'ORD-1839', table: 'T-02', items: 4, amount: INR(840),  status: 'COMPLETED',   waiter: 'Rahul'  },
  { id: 'ORD-1838', table: 'Delivery', items: 5, amount: INR(1450), status: 'IN_PROGRESS', waiter: '—' },
];

const mockLowStock = [
  { name: 'Paneer',   current: '2.4 kg',  reorder: '5 kg',    urgency: 'high'   as const },
  { name: 'Tomatoes', current: '1.8 kg',  reorder: '4 kg',    urgency: 'high'   as const },
  { name: 'Cream',    current: '0.6 L',   reorder: '2 L',     urgency: 'high'   as const },
  { name: 'Butter',   current: '0.9 kg',  reorder: '1.5 kg',  urgency: 'medium' as const },
  { name: 'Coriander',current: '0.2 kg',  reorder: '0.5 kg',  urgency: 'medium' as const },
];

const statusBadge = (status: string) => {
  if (status === 'COMPLETED')   return <Badge label="Done"        variant="success" />;
  if (status === 'IN_PROGRESS') return <Badge label="In Progress" variant="info" dot />;
  if (status === 'CANCELLED')   return <Badge label="Cancelled"   variant="danger" />;
  return <Badge label={status} variant="muted" />;
};

// ─── Quick action button ──────────────────────────────────────────────────────
const QuickAction: React.FC<{ icon: string; label: string; color: string; onClick: () => void; id: string }> =
  ({ icon, label, color, onClick, id }) => (
    <button
      id={id}
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
        background: `${color}12`, border: `1px solid ${color}30`,
        color: color, transition: 'all 0.15s ease', flex: '1 1 100px', minWidth: 100,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = `${color}22`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = `${color}12`; e.currentTarget.style.transform = 'none'; }}
    >
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{label}</span>
    </button>
  );

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <div style={{
    background: '#131C2E', border: '1px solid #1E2A3B', borderRadius: 12, overflow: 'hidden',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', borderBottom: '1px solid #1E2A3B',
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', margin: 0, fontFamily: 'Outfit, sans-serif' }}>{title}</h3>
      {action}
    </div>
    <div style={{ padding: '16px 18px' }}>{children}</div>
  </div>
);

// ─── Main DashboardPanel ──────────────────────────────────────────────────────
export const DashboardPanel: React.FC = () => {
  const { setView, activeUser, activeBranch } = useAppStore();

  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20, minHeight: '100%' }}>

      {/* Welcome header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {activeUser?.name?.split(' ')[0] ?? 'User'} 👋
          </h2>
          <p style={{ fontSize: 12, color: '#64748B', margin: '4px 0 0' }}>
            {activeBranch?.name} · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          id="dashboard-open-pos"
          onClick={() => setView('pos')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, cursor: 'pointer',
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            border: 'none', color: '#fff', fontWeight: 700, fontSize: 13,
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}
        >
          🧾 Open POS
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
        {mockKpis.map((kpi, i) => (
          <KpiCard
            key={i}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            onClick={() => setView(kpi.view)}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <Section title="⚡ Quick Actions">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <QuickAction id="qa-new-order"   icon="➕" label="New Order"      color="#6366F1" onClick={() => setView('pos')}       />
          <QuickAction id="qa-tables"      icon="🪑" label="View Tables"    color="#3B82F6" onClick={() => setView('tables')}     />
          <QuickAction id="qa-orders"      icon="📋" label="Active Orders"  color="#10B981" onClick={() => setView('orders')}     />
          <QuickAction id="qa-menu"        icon="📖" label="Menu Catalog"   color="#F59E0B" onClick={() => setView('catalog')}    />
          <QuickAction id="qa-inventory"   icon="📦" label="Inventory"      color="#EF4444" onClick={() => setView('inventory')} />
          <QuickAction id="qa-reports"     icon="📊" label="Reports"        color="#8B5CF6" onClick={() => setView('reports')}    />
        </div>
      </Section>

      {/* Recent Orders + Low Stock side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, alignItems: 'start' }}>

        {/* Recent Orders */}
        <Section
          title="📋 Recent Orders"
          action={
            <button
              onClick={() => setView('orders')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6366F1', fontSize: 12, fontWeight: 600 }}
            >View All →</button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '80px 60px 50px 90px 100px 80px', gap: 8, padding: '0 4px 8px', borderBottom: '1px solid #1E2A3B' }}>
              {['Order', 'Table', 'Items', 'Amount', 'Status', 'Waiter'].map((h) => (
                <div key={h} style={{ fontSize: 10, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</div>
              ))}
            </div>
            {mockRecentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  display: 'grid', gridTemplateColumns: '80px 60px 50px 90px 100px 80px',
                  gap: 8, padding: '8px 4px', borderRadius: 7, cursor: 'pointer',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ fontSize: 12, fontWeight: 600, color: '#818CF8' }}>{order.id}</div>
                <div style={{ fontSize: 12, color: '#CBD5E1' }}>{order.table}</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{order.items}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>{order.amount}</div>
                <div>{statusBadge(order.status)}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{order.waiter}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Low Stock Alerts */}
        <Section
          title="⚠️ Low Stock Alerts"
          action={
            <button
              onClick={() => setView('inventory')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 12, fontWeight: 600 }}
            >Manage →</button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mockLowStock.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
                <span style={{ fontSize: 14 }}>🥘</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: '#64748B' }}>{item.current} / {item.reorder}</div>
                </div>
                <Badge
                  label={item.urgency === 'high' ? 'Low' : 'Mid'}
                  variant={item.urgency === 'high' ? 'danger' : 'warning'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
};

export default DashboardPanel;

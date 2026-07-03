import React, { useState } from 'react';
import { TouchButton } from '@rms/ui';
import { formatCurrencyINR } from '@rms/utils';

export const OrderPanel: React.FC = () => {
  const [orderView, setOrderView] = useState<'active' | 'held' | 'kds'>('active');

  // React State for active orders
  const [activeOrders, setActiveOrders] = useState([
    { id: '101', table: 'T1', type: 'DINE_IN', waiter: 'Amit S', itemsCount: 3, total: 580, status: 'KITCHEN' },
    { id: '102', table: 'Takeaway-1', type: 'TAKEAWAY', waiter: 'Self', itemsCount: 1, total: 220, status: 'CONFIRMED' },
    { id: '103', table: 'Parcel-2', type: 'PARCEL', waiter: 'Self', itemsCount: 2, total: 320, status: 'SERVED' },
  ]);

  // React State for held orders (drafts)
  const [heldOrders, setHeldOrders] = useState([
    { id: '98', table: 'T3', type: 'DINE_IN', itemsCount: 4, total: 840, heldTime: '10 mins ago' },
    { id: '99', table: 'T2', type: 'DINE_IN', itemsCount: 2, total: 380, heldTime: '4 mins ago' },
  ]);

  // React State for Kitchen Display (KOTs)
  const [kots, setKots] = useState([
    { id: 'KOT-881', table: 'T1', items: ['Paneer Butter Masala x 1', 'Butter Naan x 3'], status: 'NEW', timeElapsed: '3m ago', priority: 'HIGH' },
    { id: 'KOT-882', table: 'T3', items: ['Dal Makhani x 1', 'Tandoori Roti x 2'], status: 'PREPARING', timeElapsed: '7m ago', priority: 'NORMAL' },
    { id: 'KOT-883', table: 'Parcel-2', items: ['Veg Biryani x 2'], status: 'READY', timeElapsed: '12m ago', priority: 'VIP' },
  ]);

  const handleKStatusChange = (kotId: string, nextStatus: string) => {
    setKots(
      kots.map((k) => {
        if (k.id === kotId) {
          return { ...k, status: nextStatus };
        }
        return k;
      })
    );
  };

  const handleResumeOrder = (orderId: string) => {
    const resumed = heldOrders.find((o) => o.id === orderId);
    if (!resumed) return;
    setActiveOrders([
      ...activeOrders,
      {
        id: resumed.id,
        table: resumed.table,
        type: resumed.type,
        waiter: 'Self',
        itemsCount: resumed.itemsCount,
        total: resumed.total,
        status: 'CONFIRMED',
      },
    ]);
    setHeldOrders(heldOrders.filter((o) => o.id !== orderId));
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold' }}>
          Orders Dashboard & Kitchen Queue
        </h1>

        {/* View selector tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setOrderView('active')}
            style={{
              padding: '8px 16px',
              backgroundColor: orderView === 'active' ? '#1E3A8A' : 'transparent',
              color: orderView === 'active' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Active Orders ({activeOrders.length})
          </button>
          <button
            onClick={() => setOrderView('held')}
            style={{
              padding: '8px 16px',
              backgroundColor: orderView === 'held' ? '#1E3A8A' : 'transparent',
              color: orderView === 'held' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Held Drafts ({heldOrders.length})
          </button>
          <button
            onClick={() => setOrderView('kds')}
            style={{
              padding: '8px 16px',
              backgroundColor: orderView === 'kds' ? '#1E3A8A' : 'transparent',
              color: orderView === 'kds' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Kitchen Display Queue
          </button>
        </div>
      </header>

      {/* Active Orders Grid */}
      {orderView === 'active' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {activeOrders.map((o) => (
            <div key={o.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1E3A8A' }}>#{o.id} - {o.table}</span>
                <span style={{ backgroundColor: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                  {o.type}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <span>Waiter: {o.waiter}</span>
                <span>Items: {o.itemsCount} products registered</span>
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#0F172A' }}>Total: {formatCurrencyINR(o.total)}</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: o.status === 'KITCHEN' ? '#EF4444' : '#22C55E' }}>
                  Workflow: {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Held draft orders queue */}
      {orderView === 'held' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {heldOrders.length === 0 ? (
            <p style={{ color: '#64748B' }}>No draft or held orders recorded.</p>
          ) : (
            heldOrders.map((o) => (
              <div key={o.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#475569' }}>Draft #{o.id} - {o.table}</span>
                  <span style={{ fontSize: '12px', color: '#64748B' }}>{o.heldTime}</span>
                </div>
                <div style={{ fontSize: '14px', color: '#64748B', marginBottom: '16px' }}>
                  <span>Items: {o.itemsCount} items</span>
                  <span style={{ display: 'block', fontWeight: 'bold', color: '#0F172A', marginTop: '6px' }}>
                    Est Total: {formatCurrencyINR(o.total)}
                  </span>
                </div>
                <TouchButton label="Resume Order" onPress={() => handleResumeOrder(o.id)} />
              </div>
            ))
          )}
        </div>
      )}

      {/* Kitchen Display Screen (KDS) */}
      {orderView === 'kds' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {kots.map((kot) => (
            <div
              key={kot.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: kot.priority === 'VIP' ? '2px solid #8B5CF6' : kot.priority === 'HIGH' ? '2px solid #EF4444' : '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                minWidth: '300px',
                maxWidth: '350px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A' }}>{kot.id} - {kot.table}</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{kot.timeElapsed}</span>
              </div>

              {/* Items listing */}
              <div style={{ marginBottom: '16px' }}>
                {kot.items.map((i, idx) => (
                  <div key={idx} style={{ fontSize: '15px', padding: '6px 0', color: '#334155', fontWeight: 'bold', borderBottom: '1px dashed #F1F5F9' }}>
                    {i}
                  </div>
                ))}
              </div>

              {/* KDS actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#475569' }}>
                  State: <span style={{ color: kot.status === 'READY' ? '#22C55E' : '#E2E8F0' }}>{kot.status}</span>
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {kot.status === 'NEW' && (
                    <button
                      onClick={() => handleKStatusChange(kot.id, 'PREPARING')}
                      style={{ padding: '6px 12px', backgroundColor: '#1E3A8A', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Accept
                    </button>
                  )}
                  {kot.status === 'PREPARING' && (
                    <button
                      onClick={() => handleKStatusChange(kot.id, 'READY')}
                      style={{ padding: '6px 12px', backgroundColor: '#22C55E', color: '#FFFFFF', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Ready
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderPanel;

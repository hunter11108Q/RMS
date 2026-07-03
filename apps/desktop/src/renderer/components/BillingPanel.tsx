import React, { useState } from 'react';
import { TouchButton } from '@rms/ui';
import { formatCurrencyINR } from '@rms/utils';

export const BillingPanel: React.FC = () => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('101');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [serviceChargeAmt] = useState<number>(30);
  const [tipsAmt, setTipsAmt] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('UPI');
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // Mock Active Unpaid Orders for checkout
  const mockOrders = [
    { id: '101', table: 'T1', items: [{ name: 'Paneer Butter Masala', qty: 1, price: 280 }, { name: 'Butter Naan', qty: 3, price: 40 }], subtotal: 400 },
    { id: '102', table: 'T3', items: [{ name: 'Dal Makhani', qty: 1, price: 220 }, { name: 'Tandoori Roti', qty: 2, price: 20 }], subtotal: 260 },
  ];

  const activeOrder = mockOrders.find((o) => o.id === selectedOrderId) || mockOrders[0];

  // GST calculations (5% total split into CGST 2.5% + SGST 2.5% for AC restaurant)
  const discountAmt = activeOrder.subtotal * (discountPercent / 100);
  const taxableAmt = activeOrder.subtotal - discountAmt;
  const cgst = taxableAmt * 0.025;
  const sgst = taxableAmt * 0.025;
  const grandTotal = taxableAmt + cgst + sgst + serviceChargeAmt + tipsAmt;

  const handlePay = () => {
    setIsPaid(true);
  };

  const handleReset = () => {
    setIsPaid(false);
    setDiscountPercent(0);
    setTipsAmt(0);
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold', marginBottom: '24px' }}>
        Counter Billing & Checkout Invoicing
      </h1>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Left Side: Invoice Editor parameters */}
        <div style={{ flex: 1, minWidth: '400px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <h2 style={{ fontSize: '20px', marginBottom: '16px', fontWeight: 'bold' }}>Active Checkout Session</h2>

          {/* Select Unpaid Order */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '6px' }}>Select Table Order</label>
            <select
              value={selectedOrderId}
              onChange={(e) => { setSelectedOrderId(e.target.value); setIsPaid(false); }}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
            >
              {mockOrders.map((o) => (
                <option key={o.id} value={o.id}>Order #{o.id} - Table {o.table} (₹{o.subtotal})</option>
              ))}
            </select>
          </div>

          {/* Pricing Adjustments */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Apply Discount (%)</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Cashier Tips (₹)</label>
              <input
                type="number"
                value={tipsAmt}
                onChange={(e) => setTipsAmt(Math.max(0, parseInt(e.target.value) || 0))}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              />
            </div>
          </div>

          {/* Select Payment Method */}
          <div style={{ marginBottom: '32px' }}>
            <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '8px' }}>Payment Mode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['UPI', 'CASH', 'CARD'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: paymentMethod === method ? '2px solid #1E3A8A' : '1px solid #CBD5E1',
                    backgroundColor: paymentMethod === method ? '#EFF6FF' : 'transparent',
                    color: paymentMethod === method ? '#1E3A8A' : '#475569',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    minHeight: '44px',
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <TouchButton label={isPaid ? "Paid successfully" : "Confirm Settlement"} variant={isPaid ? "secondary" : "primary"} onPress={handlePay} />
            {isPaid && <TouchButton label="Next Invoice" variant="accent" onPress={handleReset} />}
          </div>
        </div>

        {/* Right Side: Simulated 80mm Thermal Receipt format */}
        <div style={{ width: '320px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Courier, monospace', fontSize: '13px' }}>
          <div style={{ textAlign: 'center', marginBottom: '16px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '12px' }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold', display: 'block' }}>TASTE OF INDIA</span>
            <span style={{ fontSize: '11px', display: 'block', color: '#64748B' }}>123 VIP Road, Bangalore</span>
            <span style={{ fontSize: '11px', display: 'block', color: '#64748B' }}>GSTIN: 27AAAAA1111A1Z1</span>
            <span style={{ fontSize: '11px', display: 'block', color: '#64748B' }}>FSSAI No: 12345678901234</span>
          </div>

          <div style={{ marginBottom: '12px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px', fontSize: '12px' }}>
            <span>Invoice: INV-{Date.now().toString().slice(-6)}</span>
            <span style={{ display: 'block' }}>Date: {new Date().toLocaleDateString()} @ {new Date().toLocaleTimeString()}</span>
            <span style={{ display: 'block' }}>Table: {activeOrder.table} | Cashier: Ritesh K</span>
          </div>

          {/* Items listing */}
          <div style={{ marginBottom: '12px', borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px' }}>
            {activeOrder.items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span>{item.name} x{item.qty}</span>
                <span>{formatCurrencyINR(item.price * item.qty)}</span>
              </div>
            ))}
          </div>

          {/* GST breakdown & calculations */}
          <div style={{ borderBottom: '1px dashed #CBD5E1', paddingBottom: '8px', marginBottom: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>{formatCurrencyINR(activeOrder.subtotal)}</span>
            </div>
            {discountAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#B91C1C' }}>
                <span>Discount ({discountPercent}%):</span>
                <span>-{formatCurrencyINR(discountAmt)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CGST (2.5%):</span>
              <span>{formatCurrencyINR(cgst)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>SGST (2.5%):</span>
              <span>{formatCurrencyINR(sgst)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Service Charge:</span>
              <span>{formatCurrencyINR(serviceChargeAmt)}</span>
            </div>
            {tipsAmt > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cashier Tips:</span>
                <span>{formatCurrencyINR(tipsAmt)}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
            <span>GRAND TOTAL:</span>
            <span>{formatCurrencyINR(grandTotal)}</span>
          </div>

          <div style={{ textAlign: 'center', borderTop: '1px dashed #CBD5E1', paddingTop: '12px', fontSize: '11px', color: '#64748B' }}>
            <span style={{ display: 'block', fontWeight: 'bold' }}>Thank You for Dining with Us!</span>
            <span style={{ display: 'block' }}>Payment mode: {isPaid ? paymentMethod : 'PENDING'}</span>
            <span style={{ display: 'block', marginTop: '6px' }}>Verify QR code invoice in digital portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPanel;

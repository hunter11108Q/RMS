import React, { useState } from 'react';
import { formatCurrencyINR } from '@rms/utils';

export const InventoryPanel: React.FC = () => {
  const [view, setView] = useState<'stock' | 'suppliers' | 'costing'>('stock');

  // React State for raw ingredients
  const [ingredients] = useState([
    { id: '1', name: 'Basmati Rice', sku: 'ING-RIC-01', category: 'Raw Materials', stock: 15.5, unit: 'kg', reorder: 20, supplier: 'Anaj Distributors' },
    { id: '2', name: 'Sunflower Oil', sku: 'ING-OIL-02', category: 'Raw Materials', stock: 8.0, unit: 'L', reorder: 5, supplier: 'Fortune Sales' },
    { id: '3', name: 'Chicken Breast', sku: 'ING-CHK-03', category: 'Raw Materials', stock: 45.0, unit: 'kg', reorder: 10, supplier: 'Fresh Foods Ltd' },
    { id: '4', name: 'Butter', sku: 'ING-BUT-04', category: 'Raw Materials', stock: 2.5, unit: 'kg', reorder: 8, supplier: 'Amul Depot' },
  ]);

  // React State for suppliers
  const [suppliers] = useState([
    { id: '1', name: 'Fortune Sales', code: 'SUP-FORT', phone: '9876543210', email: 'sales@fortune.com', limit: 50000, balance: 12500 },
    { id: '2', name: 'Amul Depot', code: 'SUP-AMUL', phone: '9123456789', email: 'retail@amul.com', limit: 20000, balance: 4500 },
    { id: '3', name: 'Anaj Distributors', code: 'SUP-ANAJ', phone: '8877665544', email: 'wholesale@anaj.com', limit: 100000, balance: 0 },
  ]);

  // React State for Recipe costing margins
  const [costingItem, setCostingItem] = useState<string>('Paneer Butter Masala');
  const sellingPrice = 280;
  const recipeIngredients = [
    { name: 'Paneer (Cottage Cheese)', qty: 200, unit: 'g', ratePerUnit: 0.4, wastePercent: 5 }, // 200g * 0.4 * 1.05 = 84
    { name: 'Butter', qty: 50, unit: 'g', ratePerUnit: 0.5, wastePercent: 0 }, // 50g * 0.5 = 25
    { name: 'Cream & Masalas', qty: 1, unit: 'serv', ratePerUnit: 20.0, wastePercent: 0 }, // 20
  ];

  React.useEffect(() => {
    // Satisfy TS compiler read checks
    if (costingItem) {
      // noop
    }
  }, [costingItem]);

  const totalRawCost = recipeIngredients.reduce((sum, ing) => {
    const wasteMultiplier = 1 + ing.wastePercent / 100;
    return sum + ing.qty * ing.ratePerUnit * wasteMultiplier;
  }, 0);

  const foodCostPercent = (totalRawCost / sellingPrice) * 100;
  const profitMargin = sellingPrice - totalRawCost;

  return (
    <div style={{ padding: '24px', fontFamily: 'Inter, sans-serif', color: '#1E293B', backgroundColor: '#F8FAFC', minHeight: '80vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontFamily: 'Outfit, sans-serif', fontWeight: 'bold' }}>
          Inventory, Suppliers & Recipe Costing
        </h1>

        {/* View togglers */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setView('stock')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'stock' ? '#1E3A8A' : 'transparent',
              color: view === 'stock' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Raw Stocks levels
          </button>
          <button
            onClick={() => setView('suppliers')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'suppliers' ? '#1E3A8A' : 'transparent',
              color: view === 'suppliers' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Suppliers directory
          </button>
          <button
            onClick={() => setView('costing')}
            style={{
              padding: '8px 16px',
              backgroundColor: view === 'costing' ? '#1E3A8A' : 'transparent',
              color: view === 'costing' ? '#FFFFFF' : '#475569',
              border: '1px solid #1E3A8A',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              minHeight: '44px',
            }}
          >
            Recipe Costings
          </button>
        </div>
      </header>

      {/* Stock warning status */}
      {view === 'stock' && (
        <div>
          {/* Dashboard summaries */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#1E40AF', display: 'block' }}>Total Stock valuation</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A' }}>{formatCurrencyINR(45200)}</span>
            </div>
            <div style={{ flex: 1, backgroundColor: '#FEF2F2', border: '1px solid #FEE2E2', padding: '16px', borderRadius: '8px' }}>
              <span style={{ fontSize: '14px', color: '#991B1B', display: 'block' }}>Low Stock Items</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#991B1B' }}>
                {ingredients.filter((i) => i.stock < i.reorder).length} Alerts active
              </span>
            </div>
          </div>

          {/* Table list */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 16px' }}>Ingredient</th>
                  <th style={{ padding: '12px 16px' }}>SKU Code</th>
                  <th style={{ padding: '12px 16px' }}>Stock Level</th>
                  <th style={{ padding: '12px 16px' }}>Reorder Level</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((ing) => {
                  const isLow = ing.stock < ing.reorder;
                  return (
                    <tr key={ing.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>{ing.name}</td>
                      <td style={{ padding: '12px 16px', color: '#64748B' }}>{ing.sku}</td>
                      <td style={{ padding: '12px 16px' }}>{ing.stock} {ing.unit}</td>
                      <td style={{ padding: '12px 16px' }}>{ing.reorder} {ing.unit}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          backgroundColor: isLow ? '#FEE2E2' : '#D1FAE5',
                          color: isLow ? '#991B1B' : '#065F46',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}>
                          {isLow ? 'REORDER SUGGESTED' : 'ADEQUATE'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Suppliers directory */}
      {view === 'suppliers' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {suppliers.map((s) => (
            <div key={s.id} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A' }}>{s.name}</span>
                <span style={{ backgroundColor: '#F1F5F9', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', color: '#475569', fontWeight: 'bold' }}>
                  {s.code}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                <span>Phone: {s.phone}</span>
                <span>Email: {s.email}</span>
                <span>Credit Limit: {formatCurrencyINR(s.limit)}</span>
                <span style={{ fontWeight: 'bold', color: s.balance > 0 ? '#B91C1C' : '#0F172A' }}>
                  Outstanding Balance: {formatCurrencyINR(s.balance)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{ flex: 1, padding: '8px', border: '1px solid #1E3A8A', color: '#1E3A8A', borderRadius: '6px', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '12px', minHeight: '36px' }}>
                  Record Payment
                </button>
                <button style={{ flex: 1, padding: '8px', border: 'none', backgroundColor: '#1E3A8A', color: '#FFFFFF', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', minHeight: '36px' }}>
                  Raise PO
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Costing margins calculations */}
      {view === 'costing' && (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {/* Recipe detail sheet */}
          <div style={{ flex: 1, minWidth: '400px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>Recipe Costing Breakdown</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '14px', color: '#64748B', display: 'block', marginBottom: '4px' }}>Menu Item Recipe</label>
              <select
                value={costingItem}
                onChange={(e) => setCostingItem(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CBD5E1', minHeight: '44px' }}
              >
                <option value="Paneer Butter Masala">Paneer Butter Masala (Standard Recipe)</option>
              </select>
            </div>

            <div style={{ border: '1px solid #F1F5F9', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                    <th style={{ padding: '10px' }}>Ingredient</th>
                    <th style={{ padding: '10px' }}>Qty</th>
                    <th style={{ padding: '10px' }}>Rate (₹/g)</th>
                    <th style={{ padding: '10px' }}>Waste %</th>
                    <th style={{ padding: '10px' }}>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {recipeIngredients.map((r, idx) => {
                    const cost = r.qty * r.ratePerUnit * (1 + r.wastePercent / 100);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '10px', fontWeight: 'semibold' }}>{r.name}</td>
                        <td style={{ padding: '10px' }}>{r.qty} {r.unit}</td>
                        <td style={{ padding: '10px' }}>₹{r.ratePerUnit}</td>
                        <td style={{ padding: '10px' }}>{r.wastePercent}%</td>
                        <td style={{ padding: '10px' }}>{formatCurrencyINR(cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Margins summary card */}
          <div style={{ width: '320px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0F172A', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Margin Analysis
            </h3>
            <div>
              <span style={{ fontSize: '13px', color: '#64748B', display: 'block' }}>Total Ingredient Cost</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#B91C1C' }}>{formatCurrencyINR(totalRawCost)}</span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#64748B', display: 'block' }}>Selling Price</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1E3A8A' }}>{formatCurrencyINR(sellingPrice)}</span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#64748B', display: 'block' }}>Food Cost Percentage</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: foodCostPercent > 40 ? '#B91C1C' : '#047857' }}>
                {foodCostPercent.toFixed(1)}%
              </span>
            </div>
            <div>
              <span style={{ fontSize: '13px', color: '#64748B', display: 'block' }}>Profit Margin</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#047857' }}>
                {formatCurrencyINR(profitMargin)} ({((profitMargin / sellingPrice) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPanel;

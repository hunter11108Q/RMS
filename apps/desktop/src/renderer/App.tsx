import React from 'react';
import { AppShell } from './components/AppShell';
import { useAppStore } from './store';

// ─── Existing panels (DO NOT MODIFY) ─────────────────────────────────────────
import { DashboardPanel }  from './components/DashboardPanel';
import { BillingPanel }    from './components/BillingPanel';
import { CatalogPanel }    from './components/CatalogPanel';
import { SeatingPanel }    from './components/SeatingPanel';
import { OrderPanel }      from './components/OrderPanel';
import { InventoryPanel }  from './components/InventoryPanel';
import { ReportsPanel }    from './components/ReportsPanel';
import { ManagementPanel } from './components/ManagementPanel';

// ─── Workspace router ─────────────────────────────────────────────────────────
const Workspace: React.FC = () => {
  const { currentView } = useAppStore();

  switch (currentView) {
    case 'dashboard':  return <DashboardPanel />;
    case 'pos':        return <BillingPanel />;
    case 'catalog':    return <CatalogPanel />;
    case 'tables':     return <SeatingPanel />;
    case 'orders':     return <OrderPanel />;
    case 'inventory':  return <InventoryPanel />;
    case 'reports':    return <ReportsPanel />;
    case 'management': return <ManagementPanel />;
    default:           return <DashboardPanel />;
  }
};

// ─── Root App ─────────────────────────────────────────────────────────────────
export const App: React.FC = () => (
  <AppShell>
    <Workspace />
  </AppShell>
);

export default App;

// ─── Electron IPC typings (preserved from previous scaffold) ─────────────────
declare global {
  interface Window {
    api?: {
      printReceipt: (orderPayload: any) => Promise<{ success: boolean; error?: string }>;
      kickCashDrawer: () => Promise<{ success: boolean; error?: string }>;
      platform: string;
    };
  }
}

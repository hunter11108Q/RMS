import React, { useEffect, useCallback } from 'react';
import { useAppStore, AppView } from '../store';
import { Clock } from './ui/Clock';
import { Badge } from './ui/Badge';
import { ToastContainer } from './ui/Toast';

// ─── Nav item definition ──────────────────────────────────────────────────────
interface NavItem {
  view: AppView;
  label: string;
  icon: string;
  badge?: number;
  shortcut?: string;
}

const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard',   label: 'Dashboard',   icon: '⊞',  shortcut: 'F1' },
  { view: 'pos',         label: 'POS / Billing', icon: '🧾', shortcut: 'F2' },
  { view: 'orders',      label: 'Orders',       icon: '📋', shortcut: 'F3' },
  { view: 'tables',      label: 'Tables',       icon: '🪑', shortcut: 'F4' },
  { view: 'catalog',     label: 'Menu Catalog', icon: '📖', shortcut: 'F5' },
  { view: 'inventory',   label: 'Inventory',    icon: '📦', shortcut: 'F6' },
  { view: 'reports',     label: 'Reports & BI', icon: '📊', shortcut: 'F7' },
  { view: 'management',  label: 'Settings',     icon: '⚙️',  shortcut: 'F8' },
];

const FKEY_MAP: Record<string, AppView> = {
  F1: 'dashboard', F2: 'pos', F3: 'orders',
  F4: 'tables',    F5: 'catalog', F6: 'inventory',
  F7: 'reports',   F8: 'management',
};

// ─── Sidebar ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC = () => {
  const { currentView, sidebarCollapsed, setView, toggleSidebar } = useAppStore();

  return (
    <aside className={`shell-sidebar ${sidebarCollapsed ? 'collapsed' : 'expanded'}`}>
      {/* Logo / Toggle */}
      <div style={{
        height: 52, display: 'flex', alignItems: 'center',
        padding: sidebarCollapsed ? '0 18px' : '0 16px',
        borderBottom: '1px solid #1E2A3B',
        gap: 10, flexShrink: 0, cursor: 'pointer',
      }}
        onClick={toggleSidebar}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif',
        }}>R</div>
        {!sidebarCollapsed && (
          <div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 14, color: '#F1F5F9', lineHeight: 1 }}>RMS</div>
            <div style={{ fontSize: 9, color: '#475569', lineHeight: 1, marginTop: 2 }}>Restaurant Suite</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingTop: 8 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.view}
            className={`nav-item ${currentView === item.view ? 'active' : ''}`}
            onClick={() => setView(item.view)}
            title={sidebarCollapsed ? `${item.label} (${item.shortcut})` : undefined}
            id={`nav-${item.view}`}
            aria-label={item.label}
            aria-current={currentView === item.view ? 'page' : undefined}
          >
            <span className="nav-icon" style={{ fontSize: 16, lineHeight: 1 }}>{item.icon}</span>
            {!sidebarCollapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                {item.badge ? (
                  <span className="nav-badge">{item.badge}</span>
                ) : (
                  <span style={{ fontSize: 9, color: '#334155', marginLeft: 'auto' }}>{item.shortcut}</span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      {/* Shift indicator at bottom */}
      <div style={{
        padding: sidebarCollapsed ? '12px 0' : '12px 16px',
        borderTop: '1px solid #1E2A3B',
        display: 'flex', alignItems: 'center', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
        gap: 8, flexShrink: 0,
      }}>
        <div className="pulse-dot" style={{
          width: 8, height: 8, borderRadius: '50%',
          background: '#10B981', flexShrink: 0,
        }} />
        {!sidebarCollapsed && (
          <span style={{ fontSize: 11, color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Shift Open
          </span>
        )}
      </div>
    </aside>
  );
};

// ─── Top Bar ──────────────────────────────────────────────────────────────────
const TopBar: React.FC = () => {
  const { currentView, activeBranch, activeUser, shiftOpen, setView } = useAppStore();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const currentLabel = NAV_ITEMS.find((n) => n.view === currentView)?.label ?? 'Dashboard';

  return (
    <header className="shell-topbar">
      {/* Page title */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 15, color: '#F1F5F9' }}>
          {currentLabel}
        </span>
      </div>

      {/* Branch chip */}
      <button
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 8,
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          cursor: 'pointer', color: '#818CF8', fontSize: 12, fontWeight: 600,
        }}
        title="Switch branch"
        id="branch-selector"
      >
        🏢 {activeBranch?.name ?? 'All Branches'}
      </button>

      {/* Shift badge */}
      <Badge label={shiftOpen ? 'Shift Open' : 'Shift Closed'} variant={shiftOpen ? 'success' : 'danger'} dot={shiftOpen} />

      {/* Clock */}
      <Clock />

      {/* Notifications */}
      <button
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#64748B', padding: '0 4px' }}
        title="Notifications"
        id="topbar-notifications"
      >
        🔔
      </button>

      {/* User menu */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setUserMenuOpen((o) => !o)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)', border: '1px solid #1E2A3B',
            borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#F1F5F9',
          }}
          id="user-menu-trigger"
          aria-haspopup="true"
          aria-expanded={userMenuOpen}
        >
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366F1,#8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#fff',
          }}>
            {(activeUser?.name ?? 'U')[0]}
          </div>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{activeUser?.name ?? 'User'}</span>
          <span style={{ fontSize: 10, color: '#475569' }}>▾</span>
        </button>

        {userMenuOpen && (
          <div style={{
            position: 'absolute', top: '100%', right: 0, marginTop: 6,
            background: '#131C2E', border: '1px solid #1E2A3B', borderRadius: 10,
            padding: 6, minWidth: 180, zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}
            onBlur={() => setUserMenuOpen(false)}
          >
            {[
              { label: '👤 Profile', action: () => {} },
              { label: '⚙️ Settings', action: () => { setView('management'); setUserMenuOpen(false); } },
              { label: '🔐 Lock Screen', action: () => {} },
              { label: '🚪 Sign Out', action: () => {} },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.action}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: 7, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontSize: 13, color: '#CBD5E1',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99,102,241,0.12)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

// ─── Status Bar ───────────────────────────────────────────────────────────────
const StatusBar: React.FC = () => {
  const { activeCart } = useAppStore();
  return (
    <footer className="shell-statusbar">
      <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
      <span>API Connected</span>
      <span style={{ color: '#1E2A3B' }}>|</span>
      <span>Cart: {activeCart.length} item{activeCart.length !== 1 ? 's' : ''}</span>
      <span style={{ color: '#1E2A3B' }}>|</span>
      <span>RMS Desktop v1.0.0</span>
      <span style={{ marginLeft: 'auto' }}>Press F1–F8 to navigate screens</span>
    </footer>
  );
};

// ─── AppShell ─────────────────────────────────────────────────────────────────
interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { setView } = useAppStore();

  // Global keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // F1–F8 navigation
    if (e.key in FKEY_MAP && !e.ctrlKey && !e.altKey && !e.metaKey) {
      const target = document.activeElement?.tagName.toLowerCase();
      if (target === 'input' || target === 'textarea') return;
      e.preventDefault();
      setView(FKEY_MAP[e.key as keyof typeof FKEY_MAP]);
    }
  }, [setView]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="shell-root">
      <Sidebar />
      <div className="shell-main">
        <TopBar />
        <main className="shell-workspace">
          {children}
        </main>
        <StatusBar />
      </div>
      <ToastContainer />
    </div>
  );
};

export default AppShell;

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store';

const iconMap: Record<string, string> = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

const colorMap: Record<string, string> = {
  success: '#10B981',
  error:   '#EF4444',
  warning: '#F59E0B',
  info:    '#60A5FA',
};

export const ToastContainer: React.FC = () => {
  const { notifications, dismissNotification } = useAppStore();

  return (
    <div className="toast-container" aria-live="polite">
      {notifications.slice(0, 5).map((n) => (
        <ToastItem key={n.id} notification={n} onDismiss={() => dismissNotification(n.id)} />
      ))}
    </div>
  );
};

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

const ToastItem: React.FC<{ notification: Notification; onDismiss: () => void }> = ({ notification: n, onDismiss }) => {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timerRef.current);
  }, [onDismiss]);

  return (
    <div className="toast" role="alert" style={{ borderLeft: `3px solid ${colorMap[n.type]}` }}>
      <span style={{ fontSize: '18px', flexShrink: 0 }}>{iconMap[n.type]}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '13px', color: '#F1F5F9', marginBottom: n.message ? '3px' : 0 }}>
          {n.title}
        </div>
        {n.message && (
          <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4 }}>{n.message}</div>
        )}
      </div>
      <button
        onClick={onDismiss}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '16px', padding: '0 4px', flexShrink: 0 }}
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
};

export default ToastContainer;

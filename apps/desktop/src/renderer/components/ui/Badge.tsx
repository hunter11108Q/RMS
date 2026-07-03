import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'primary';

interface BadgeProps {
  label: string | number;
  variant?: BadgeVariant;
  dot?: boolean;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  success: { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
  warning: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  danger:  { background: 'rgba(239,68,68,0.15)',  color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
  info:    { background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.3)' },
  primary: { background: 'rgba(99,102,241,0.15)', color: '#818CF8', border: '1px solid rgba(99,102,241,0.3)' },
  muted:   { background: 'rgba(71,85,105,0.2)',   color: '#94A3B8', border: '1px solid rgba(71,85,105,0.3)' },
};

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'muted', dot = false, size = 'md' }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: size === 'sm' ? '1px 7px' : '2px 10px',
    borderRadius: '9999px',
    fontSize: size === 'sm' ? '10px' : '11px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    ...variantStyles[variant],
  }}>
    {dot && (
      <span style={{
        width: '6px', height: '6px',
        borderRadius: '50%',
        background: 'currentColor',
        flexShrink: 0,
      }} className="pulse-dot" />
    )}
    {label}
  </span>
);

export default Badge;

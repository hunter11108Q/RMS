import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: string;
  color?: string;
  subLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  onClick?: () => void;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  label, value, icon, color = '#6366F1',
  subLabel, trend, trendValue, onClick,
}) => {
  const trendColor = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#94A3B8';
  const trendIcon  = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className="kpi-card"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        '--kpi-color': color,
      } as React.CSSProperties}
    >
      {/* Color accent blob */}
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '56px', height: '56px',
        background: color,
        borderRadius: '0 12px 0 56px',
        opacity: 0.12,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        position: 'absolute', top: '14px', right: '14px',
        fontSize: '20px', lineHeight: 1, opacity: 0.7,
      }}>
        {icon}
      </div>

      {/* Label */}
      <div style={{
        fontSize: '11px', fontWeight: 600,
        color: '#64748B', textTransform: 'uppercase',
        letterSpacing: '0.06em', marginBottom: '10px',
      }}>
        {label}
      </div>

      {/* Value */}
      <div style={{
        fontSize: '24px', fontWeight: 700,
        fontFamily: "'Outfit', sans-serif",
        color: color, lineHeight: 1,
        marginBottom: '6px',
      }}>
        {value}
      </div>

      {/* Sub-label / trend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '16px' }}>
        {trendValue && (
          <span style={{ fontSize: '12px', fontWeight: 600, color: trendColor }}>
            {trendIcon} {trendValue}
          </span>
        )}
        {subLabel && (
          <span style={{ fontSize: '11px', color: '#475569' }}>{subLabel}</span>
        )}
      </div>
    </div>
  );
};

export default KpiCard;

import React, { useState, useEffect } from 'react';

interface ClockProps {
  showSeconds?: boolean;
  style?: React.CSSProperties;
}

export const Clock: React.FC<ClockProps> = ({ showSeconds = true, style }) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(showSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`);
      setDate(now.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [showSeconds]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ...style }}>
      <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '15px', fontWeight: 700, color: '#F1F5F9', letterSpacing: '0.05em', lineHeight: 1 }}>
        {time}
      </span>
      <span style={{ fontSize: '10px', color: '#64748B', lineHeight: 1, marginTop: '2px' }}>
        {date}
      </span>
    </div>
  );
};

export default Clock;

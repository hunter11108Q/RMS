import React from 'react';
import { Badge } from './ui/Badge';

interface KotStatusBadgeProps {
  status: 'NEW' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'REJECTED';
}

export const KotStatusBadge: React.FC<KotStatusBadgeProps> = ({ status }) => {
  const getBadgeVariant = () => {
    switch (status) {
      case 'NEW':
        return 'info' as const;
      case 'ACCEPTED':
        return 'info' as const;
      case 'PREPARING':
        return 'warning' as const;
      case 'READY':
        return 'success' as const;
      case 'SERVED':
        return 'default' as const;
      case 'REJECTED':
        return 'danger' as const;
      default:
        return 'default' as const;
    }
  };

  return <Badge label={status.replace('_', ' ')} variant={getBadgeVariant()} />;
};

export default KotStatusBadge;

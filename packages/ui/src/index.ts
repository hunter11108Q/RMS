export * from './ErrorBoundary';

import React from 'react';
import { colors, layout } from '@rms/theme';

interface TouchButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  disabled?: boolean;
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return '#E2E8F0';
    switch (variant) {
      case 'accent':
        return colors.accent;
      case 'secondary':
        return colors.muted;
      default:
        return colors.primary;
    }
  };

  return React.createElement(
    'button',
    {
      onClick: onPress,
      disabled,
      style: {
        minHeight: layout.touchTargets.mobileMinHeight,
        backgroundColor: getBackgroundColor(),
        color: '#FFFFFF',
        border: 'none',
        borderRadius: layout.radius.md,
        paddingLeft: layout.spacing.lg,
        paddingRight: layout.spacing.lg,
        fontWeight: 'bold',
        fontSize: '16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.2s',
      },
    },
    label
  );
};

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, layout } from '@rms/theme';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'default',
  style,
  textStyle,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(22,163,74,0.15)', text: colors.success };
      case 'danger':
        return { bg: 'rgba(220,38,38,0.15)', text: colors.error };
      case 'warning':
        return { bg: 'rgba(217,119,6,0.15)', text: colors.warning };
      case 'info':
        return { bg: 'rgba(2,132,199,0.15)', text: colors.primary };
      case 'default':
        return { bg: colors.border, text: colors.muted };
    }
  };

  const badgeColors = getBadgeColors();

  return (
    <View style={[styles.badge, { backgroundColor: badgeColors.bg }, style]}>
      <Text style={[styles.text, { color: badgeColors.text }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: layout.radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

export default Badge;

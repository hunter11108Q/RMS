import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, layout } from '@rms/theme';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📂',
  title,
  description,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: layout.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 48,
    marginBottom: layout.spacing.md,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: typography.fontFamilyDisplay,
  },
  description: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: layout.spacing.md,
  },
});

export default EmptyState;

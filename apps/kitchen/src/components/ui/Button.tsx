import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle, StyleProp, Platform } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import * as Haptics from 'expo-haptics';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const handlePress = () => {
    if (disabled || isLoading) return;
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          button: { backgroundColor: colors.primary },
          text: { color: colors.card },
        };
      case 'secondary':
        return {
          button: { backgroundColor: colors.accent },
          text: { color: colors.card },
        };
      case 'outline':
        return {
          button: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.border },
          text: { color: colors.foreground },
        };
      case 'danger':
        return {
          button: { backgroundColor: colors.error },
          text: { color: colors.card },
        };
    }
  };

  const vStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      style={[
        styles.baseButton,
        vStyles.button,
        disabled && styles.disabledButton,
        style as any,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.foreground : colors.card} />
      ) : (
        <Text style={[styles.baseText, vStyles.text, textStyle as any]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    minHeight: layout.touchTargets.mobileMinHeight,
    borderRadius: layout.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  disabledButton: {
    opacity: 0.5,
  },
  baseText: {
    fontSize: typography.sizes.base,
    fontWeight: '600',
  },
});

export default Button;

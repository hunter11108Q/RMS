import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, typography, layout } from '@rms/theme';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  label,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focusedWrapper,
        error ? styles.errorWrapper : null,
      ]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, inputStyle]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: layout.spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 6,
  },
  inputWrapper: {
    width: '100%',
    minHeight: layout.touchTargets.mobileMinHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: layout.radius.md,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  focusedWrapper: {
    borderColor: colors.primary,
  },
  errorWrapper: {
    borderColor: colors.error,
  },
  input: {
    fontSize: typography.sizes.base,
    color: colors.foreground,
    paddingVertical: 8,
  },
  errorText: {
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Input;

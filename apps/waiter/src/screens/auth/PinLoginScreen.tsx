import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import useAuthStore from '../../store/auth.store';
import * as Haptics from 'expo-haptics';

export const PinLoginScreen: React.FC = () => {
  const [pin, setPin] = useState('');
  const { login, isLoading, error, clearError, user } = useAuthStore();

  const handleKeyPress = (num: string) => {
    if (pin.length >= 4) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    const nextPin = pin + num;
    setPin(nextPin);
    if (nextPin.length === 4) {
      handlePinLogin(nextPin);
    }
  };

  const handleBackspace = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Ignored
    }
    setPin(pin.slice(0, -1));
    clearError();
  };

  const handlePinLogin = (completedPin: string) => {
    clearError();
    login({ 
      tenantId: user?.tenantId || 't1', 
      pin: completedPin 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your 4-digit PIN to check-in</Text>
        </View>

        {/* Pin Dots Indicator */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map((index) => (
            <View 
              key={index} 
              style={[
                styles.dot, 
                pin.length > index ? styles.filledDot : null,
                error ? styles.errorDot : null,
              ]} 
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* Numeric Keypad Grid */}
        <View style={styles.keypad}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map((row, rIndex) => (
            <View key={rIndex} style={styles.row}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  onPress={() => handleKeyPress(num)}
                  disabled={isLoading}
                  style={styles.keyButton}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <View style={styles.row}>
            <View style={styles.keyButtonPlaceholder} />
            <TouchableOpacity
              onPress={() => handleKeyPress('0')}
              disabled={isLoading}
              style={styles.keyButton}
            >
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleBackspace}
              disabled={isLoading}
              style={styles.keyButton}
            >
              <Text style={styles.keyText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: layout.spacing.xl,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.foreground,
    fontFamily: typography.fontFamilyDisplay,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 48,
    marginBottom: layout.spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  filledDot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  errorDot: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginBottom: layout.spacing.lg,
  },
  keypad: {
    width: '100%',
    maxHeight: 380,
    marginTop: layout.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    elevation: 1,
  },
  keyButtonPlaceholder: {
    width: 72,
    height: 72,
    marginHorizontal: 16,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.foreground,
  },
});

export default PinLoginScreen;

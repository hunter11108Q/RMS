import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors, typography, layout } from '@rms/theme';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import useAuthStore from '../../store/auth.store';

export const LoginScreen: React.FC = () => {
  const [tenantId, setTenantId] = useState('t1'); // default fallback organization
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = () => {
    if (!username || !password) return;
    clearError();
    login({ tenantId, username, password });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>R</Text>
            </View>
            <Text style={styles.title}>RMS Waiter</Text>
            <Text style={styles.subtitle}>Sign in to your branch terminal session</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Organization ID"
              value={tenantId}
              onChangeText={setTenantId}
              placeholder="e.g. t1"
            />
            <Input
              label="Username / Phone"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              secureTextEntry
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button
              label="Continue to Shift Check-in"
              onPress={handleLogin}
              isLoading={isLoading}
              style={styles.submitBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: layout.spacing.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: layout.spacing.xl,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    fontFamily: typography.fontFamilyDisplay,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: 16,
    fontFamily: typography.fontFamilyDisplay,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.muted,
    marginTop: 4,
  },
  form: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: layout.radius.lg,
    padding: layout.spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: layout.spacing.md,
  },
  submitBtn: {
    marginTop: 8,
  },
});

export default LoginScreen;

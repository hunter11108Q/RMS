export const colors = {
  background: '#F8FAFC',
  foreground: '#0F172A',
  card: '#FFFFFF',
  primary: '#0284C7',
  primaryHover: '#0369A1',
  accent: '#EA580C',
  success: '#16A34A',
  error: '#DC2626',
  warning: '#D97706',
  muted: '#64748B',
  border: '#E2E8F0',
};

export const typography = {
  fontFamilySans: 'Inter, system-ui, -apple-system, sans-serif',
  fontFamilyDisplay: 'Outfit, system-ui, sans-serif',
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    md: 18,
    lg: 20,
    xl: 24,
  },
};

export const layout = {
  touchTargets: {
    desktopMinHeight: 44,
    mobileMinHeight: 48,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};
export default { colors, typography, layout };

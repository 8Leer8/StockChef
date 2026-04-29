/**
 * StockChef Design System
 * Modern Bento aesthetic with Deep Forest Green accent.
 */

// ── Brand Colors ──────────────────────────────────────────────
const forest = '#2D5A3F';
const forestLight = '#4E8A6E';
const forestMuted = '#A4D0BA';

// ── Status Palette (tinted, not solid) ────────────────────────
export const StatusColors = {
  success: { bg: '#E8F5E9', text: '#1B5E20', accent: '#2E7D32' },
  warning: { bg: '#FFF3E0', text: '#E65100', accent: '#F57C00' },
  danger:  { bg: '#FFEBEE', text: '#B71C1C', accent: '#D32F2F' },
};

// ── Layout Tokens ─────────────────────────────────────────────
export const Layout = {
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    section: 32,
  },
};

// ── Shadow Presets ────────────────────────────────────────────
export const Shadows = {
  card: {
    shadowColor: '#1A2E23',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHover: {
    shadowColor: '#1A2E23',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  float: {
    shadowColor: '#1A2E23',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ── Color Themes ──────────────────────────────────────────────
export const Colors = {
  light: {
    primary: forest,
    primaryLight: forestLight,
    primaryMuted: forestMuted,
    text: '#1A1D1B',
    textSecondary: '#5F6B64',
    textTertiary: '#8E9A93',
    background: '#F6F7F5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E8ECE9',
    borderLight: '#F0F2F0',
    tint: forest,
    icon: '#5F6B64',
    tabIconDefault: '#9CA69F',
    tabIconSelected: forest,
  },
  dark: {
    primary: forestLight,
    primaryLight: forestMuted,
    primaryMuted: '#2D3D33',
    text: '#E8ECE9',
    textSecondary: '#A0AAA4',
    textTertiary: '#6E786F',
    background: '#0F1410',
    surface: '#1A201B',
    surfaceElevated: '#222A24',
    border: '#2A332C',
    borderLight: '#1F261F',
    tint: forestLight,
    icon: '#A0AAA4',
    tabIconDefault: '#6E786F',
    tabIconSelected: forestLight,
  },
};

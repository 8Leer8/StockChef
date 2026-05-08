import React from 'react';
import { View, StyleSheet, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { StatusColors, Layout } from '@/constants/theme';

export type StatusBadgeProps = {
  status: 'Good' | 'Warning' | 'Critical' | 'success' | 'warning' | 'danger';
  text: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

/**
 * Tinted status badge — uses soft background tints with high-contrast text
 * instead of solid filled badges. Feels more premium and modern.
 */
export function StatusBadge({ status, text, style, textStyle }: StatusBadgeProps) {
  let palette = StatusColors.success;

  if (status === 'Warning' || status === 'warning') {
    palette = StatusColors.warning;
  } else if (status === 'Critical' || status === 'danger') {
    palette = StatusColors.danger;
  }

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }, style]}>
      <View style={[styles.dot, { backgroundColor: palette.accent }]} />
      <Text style={[styles.text, { color: palette.text }, textStyle]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.radius.pill,
    gap: 5,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '600',
    fontSize: 12,
    letterSpacing: 0.2,
  },
});

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Layout, Shadows } from '@/constants/theme';

export type BentoCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'highlight' | 'outline';
};

export function BentoCard({
  children,
  onPress,
  style,
  variant = 'default',
}: BentoCardProps) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const primaryMuted = useThemeColor({}, 'primaryMuted');

  let cardBg = surface;
  let cardBorder = border;

  if (variant === 'highlight') {
    cardBg = primaryMuted;
    cardBorder = primary + '30';
  }

  const containerStyle: ViewStyle[] = [
    styles.card,
    {
      backgroundColor: cardBg,
      borderColor: cardBorder,
    },
    variant === 'outline' && { backgroundColor: 'transparent', borderWidth: 1.5 },
    Shadows.card as ViewStyle,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={containerStyle}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.radius.xl,
    padding: Layout.spacing.xl,
    borderWidth: 1,
  },
});

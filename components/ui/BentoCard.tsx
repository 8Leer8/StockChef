import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Layout, Shadows } from '@/constants/theme';

export type BentoCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
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

  const containerStyle: StyleProp<ViewStyle> = [
    styles.card,
    {
      backgroundColor: cardBg,
      borderColor: cardBorder,
    },
    variant === 'outline' ? { backgroundColor: 'transparent', borderWidth: 1.5 } : null,
    Shadows.card as ViewStyle,
    style,
  ];

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

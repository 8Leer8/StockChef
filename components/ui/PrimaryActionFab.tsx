import React from 'react';
import { StyleSheet, Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Layout, Shadows } from '@/constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type PrimaryActionFabProps = {
  onPress: () => void;
  icon?: string;
  label?: string;
};

export function PrimaryActionFab({ onPress, icon = 'add', label }: PrimaryActionFabProps) {
  const primary = useThemeColor({}, 'primary');
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.92, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[
        styles.fab,
        { backgroundColor: primary },
        Shadows.float,
        label ? styles.fabExtended : styles.fabCircular,
        animatedStyle,
      ]}
    >
      <MaterialIcons name={icon as any} size={24} color="#FFF" />
      {label && <Text style={styles.label}>{label}</Text>}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100, // Above the floating tab bar
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabCircular: {
    width: 56,
    height: 56,
    borderRadius: 16,
  },
  fabExtended: {
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 16,
    gap: 8,
  },
  label: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

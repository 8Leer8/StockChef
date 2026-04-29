import React from 'react';
import { View, StyleSheet, Pressable, Text, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Layout, Shadows } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Direct icon config — no broken SF Symbol mapping needed
const TAB_ICONS: Record<string, string> = {
  index: 'home',
  explore: 'inventory-2',
};

const TAB_LABELS: Record<string, string> = {
  index: 'Home',
  explore: 'Inventory',
};

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  return (
    <View style={[styles.outerContainer, Shadows.float]}>
      <BlurView
        intensity={isDark ? 50 : 90}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurWrap}
      >
        <View style={[
          styles.innerContainer,
          { backgroundColor: isDark ? 'rgba(26,32,27,0.85)' : 'rgba(255,255,255,0.82)' },
        ]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const iconName = TAB_ICONS[route.name] || 'circle';
            const label = TAB_LABELS[route.name] || route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabItem
                key={route.key}
                icon={iconName}
                label={label}
                isFocused={isFocused}
                activeColor={colors.primary}
                inactiveColor={colors.tabIconDefault}
                activeBg={colors.primary + '15'}
                onPress={onPress}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

// ── Individual Tab Item with micro-animation ──────────────────
type TabItemProps = {
  icon: string;
  label: string;
  isFocused: boolean;
  activeColor: string;
  inactiveColor: string;
  activeBg: string;
  onPress: () => void;
};

function TabItem({ icon, label, isFocused, activeColor, inactiveColor, activeBg, onPress }: TabItemProps) {
  const scale = useSharedValue(1);

  const containerAnim = useAnimatedStyle(() => ({
    backgroundColor: withTiming(isFocused ? activeBg : 'transparent', { duration: 200 }),
    paddingHorizontal: withTiming(isFocused ? 16 : 12, { duration: 200 }),
    transform: [{ scale: scale.value }],
  }));

  const labelAnim = useAnimatedStyle(() => ({
    width: withTiming(isFocused ? 'auto' as any : 0, { duration: 200 }),
    opacity: withTiming(isFocused ? 1 : 0, { duration: 150 }),
    marginLeft: withTiming(isFocused ? 6 : 0, { duration: 200 }),
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={styles.tabPressable}
    >
      <Animated.View style={[styles.tabItem, containerAnim]}>
        <MaterialIcons
          name={icon as any}
          size={22}
          color={isFocused ? activeColor : inactiveColor}
        />
        {isFocused && (
          <Animated.Text
            style={[styles.tabLabel, { color: activeColor }, labelAnim]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 40,
    right: 40,
    height: 60,
    borderRadius: Layout.radius.xl,
  },
  blurWrap: {
    flex: 1,
    borderRadius: Layout.radius.xl,
    overflow: 'hidden',
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Layout.spacing.lg,
    gap: 8,
    borderRadius: Layout.radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tabPressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Layout.radius.md,
  },
  tabLabel: {
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 0.3,
  },
});

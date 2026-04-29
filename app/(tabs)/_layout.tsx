import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Inventory' }} />
      </Tabs>
    </View>
  );
}

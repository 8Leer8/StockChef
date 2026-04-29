import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider as CustomThemeProvider, useTheme } from '@/hooks/use-theme';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutContent() {
  const { colorScheme } = useTheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-ingredient" options={{ presentation: 'modal', title: 'Add Ingredient', headerShown: false }} />
        <Stack.Screen name="log-waste" options={{ presentation: 'modal', title: 'Log Waste', headerShown: false }} />
        <Stack.Screen name="add-recipe" options={{ presentation: 'modal', title: 'Add Recipe', headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomThemeProvider>
        <RootLayoutContent />
      </CustomThemeProvider>
    </QueryClientProvider>
  );
}

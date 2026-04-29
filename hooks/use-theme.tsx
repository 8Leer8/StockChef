import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  colorScheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@stockchef_theme_mode';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        if (AsyncStorage) {
          const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
          if (savedMode) {
            setModeState(savedMode as ThemeMode);
          }
        }
      } catch (e) {
        console.warn('Failed to load theme from storage', e);
      }
    };
    loadTheme();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      if (AsyncStorage) {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
      }
    } catch (e) {
      console.warn('Failed to save theme to storage', e);
    }
  };

  const colorScheme = mode === 'system' 
    ? (deviceColorScheme ?? 'light') 
    : mode as 'light' | 'dark';

  return (
    <ThemeContext.Provider value={{ mode, setMode, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_STORAGE_KEY = 'app_theme_mode';

// Create theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === 'dark');
        } else {
          // If no saved preference, use device theme
          setIsDarkMode(deviceTheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, [deviceTheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    const newThemeValue = !isDarkMode;
    setIsDarkMode(newThemeValue);
    
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeValue ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Theme values
  const theme = {
    isDarkMode,
    toggleTheme,
    isLoading,
    colors: isDarkMode 
      ? {
          // Dark theme colors
          background: '#121212',
          backgroundGradient: ['#1F1F1F', '#121212'],
          card: 'rgba(255, 255, 255, 0.05)',
          cardBorder: 'rgba(255, 255, 255, 0.1)',
          primary: '#2196F3',
          secondary: '#1DE9B6',
          text: '#FFFFFF',
          textSecondary: '#AAAAAA',
          error: '#FF6B6B',
          success: '#4CAF50',
          divider: 'rgba(255, 255, 255, 0.1)',
          icon: '#FFFFFF',
        }
      : {
          // Light theme colors
          background: '#F9F9F9',
          backgroundGradient: ['#FFFFFF', '#F9F9F9'],
          card: '#FFFFFF',
          cardBorder: '#EEEEEE',
          primary: '#2196F3',
          secondary: '#00BFA5',
          text: '#212121',
          textSecondary: '#757575',
          error: '#F44336',
          success: '#4CAF50',
          divider: 'rgba(0, 0, 0, 0.1)',
          icon: '#212121',
        }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
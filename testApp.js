// TestApp.js
import React from 'react';
import { Text, View } from 'react-native';
import { ThemeProvider } from './context/themeContext';

export default function TestApp() {
  return (
    <ThemeProvider>
      <View><Text>Test</Text></View>
    </ThemeProvider>
  );
}
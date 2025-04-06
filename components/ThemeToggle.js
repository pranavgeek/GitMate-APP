import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext'; // Adjust the import path as necessary

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const translateX = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  const rotateAnim = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;
  
  useEffect(() => {
    // Animate circle and icon position when theme changes
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: isDarkMode ? 1 : 0,
        duration: 300,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: isDarkMode ? 1 : 0,
        duration: 500,
        easing: Easing.bezier(0.4, 0.0, 0.2, 1),
        useNativeDriver: true,
      })
    ]).start();
  }, [isDarkMode, translateX, rotateAnim]);

  const translateValue = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 22] // Distance to move
  });
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { 
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' 
        }
      ]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <Animated.View 
        style={[
          styles.toggleCircle,
          { 
            backgroundColor: isDarkMode ? '#5D6574' : '#FFC107',
            transform: [{ translateX: translateValue }] 
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <Ionicons 
            name={isDarkMode ? "moon" : "sunny"} 
            size={16} 
            color={isDarkMode ? "#FFFFFF" : "#212121"} 
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    borderWidth: 1,
    padding: 2,
  },
  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
    left: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThemeToggle;
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import { ThemeProvider, useTheme } from './context/themeContext';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import FollowersListScreen from './screens/FollowersListScreen';
import StatsScreen from './screens/StatsScreen';
import RepositoriesScreen from './screens/RepositoriesScreen';
import ReadmeScreen from './screens/ReadmeScreen';

const Stack = createStackNavigator();

// App navigator with theme consumer
const AppNavigator = () => {
  const { isDarkMode, colors } = useTheme();
  
  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="FollowersList" component={FollowersListScreen} />
          <Stack.Screen name="Stats" component={StatsScreen} />
          <Stack.Screen name="Repositories" component={RepositoriesScreen} />
          <Stack.Screen name="Readme" component={ReadmeScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

// Main app component with theme provider
export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
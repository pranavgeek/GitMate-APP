import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  Keyboard,
  Platform,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import GitHubService from '../services/GitHubService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/themeContext';
import { useFocusEffect } from '@react-navigation/native';


const HomeScreen = ({ navigation }) => {
  const { colors, isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchTimer, setSearchTimer] = useState(null);

  // Load recent searches from AsyncStorage when component mounts
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Clear search when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Clear search input when returning to this screen
      setUsername('');
      setSuggestions([]);
      return () => {};
    }, [])
  );

  const loadRecentSearches = async () => {
    try {
      const storedSearches = await AsyncStorage.getItem('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  const saveRecentSearches = async (searches) => {
    try {
      await AsyncStorage.setItem('recentSearches', JSON.stringify(searches));
    } catch (error) {
      console.error('Error saving recent searches:', error);
    }
  };

  const clearRecentSearches = () => {
    Alert.alert(
      "Clear Recent Searches",
      "Are you sure you want to clear all recent searches?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('recentSearches');
              setRecentSearches([]);
            } catch (error) {
              console.error('Error clearing recent searches:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const searchUser = async (searchUsername) => {
    const userToSearch = searchUsername || username;
    if (!userToSearch.trim()) return;
    
    setLoading(true);
    setError(null);
    Keyboard.dismiss();
    setSuggestions([]);

    try {
      const userData = await GitHubService.getUser(userToSearch);
      
      // Add to recent searches if not already there
      if (!recentSearches.some(search => search.login === userData.login)) {
        const updatedSearches = [{
          id: userData.id.toString(),
          login: userData.login,
          avatar_url: userData.avatar_url
        }, ...recentSearches].slice(0, 5);
        
        setRecentSearches(updatedSearches);
        saveRecentSearches(updatedSearches);
      }
      
      navigation.navigate('Profile', { userData });
    } catch (error) {
      setError(error.message);
      showErrorAnimation();
    } finally {
      setLoading(false);
    }
  };

  const showErrorAnimation = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  };

  const fetchUserSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const users = await GitHubService.searchUsers(query);
      setSuggestions(users.map(item => ({
        id: item.id.toString(),
        login: item.login,
        avatar_url: item.avatar_url
      })));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    }
  };

  const handleTextChange = (text) => {
    setUsername(text);
    
    // Clear any existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    
    // Set a new timer to fetch suggestions after a delay
    const newTimer = setTimeout(() => {
      fetchUserSuggestions(text);
    }, 500); // 500ms delay to avoid too many API calls
    
    setSearchTimer(newTimer);
  };

  const renderRecentSearchItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.recentSearchItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
      onPress={() => {
        setUsername(item.login);
        searchUser(item.login);
      }}
    >
      <Image 
        source={{ uri: item.avatar_url }} 
        style={styles.recentSearchAvatar} 
      />
      <Text style={[styles.recentSearchText, { color: colors.text }]}>{item.login}</Text>
    </TouchableOpacity>
  );

  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.suggestionItem, { borderBottomColor: colors.divider }]}
      onPress={() => {
        setUsername(item.login);
        setSuggestions([]);
        searchUser(item.login);
      }}
    >
      <Image 
        source={{ uri: item.avatar_url }} 
        style={styles.suggestionAvatar} 
      />
      <Text style={[styles.suggestionText, { color: colors.text }]}>{item.login}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>GitMate</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Search your mate</Text>
        </View>
        
        {/* Theme Toggle Button */}
        <ThemeToggle />
      </View>
      
      <BlurView intensity={Platform.OS === 'ios' ? 50 : 100} style={[
        styles.searchContainer, 
        { 
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'
        }
      ]}>
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter GitHub username"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={handleTextChange}
          onSubmitEditing={() => searchUser()}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: colors.primary }]}
          onPress={() => searchUser()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </BlurView>
      
      {suggestions.length > 0 && (
        <View style={[
          styles.suggestionsContainer, 
          { 
            backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: colors.cardBorder
          }
        ]}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestionItem}
            keyExtractor={item => item.id}
            style={styles.suggestionsList}
          />
        </View>
      )}
      
      <Animated.View style={[styles.errorContainer, { opacity: fadeAnim, backgroundColor: colors.error }]}>
        <Text style={styles.errorText}>{error}</Text>
      </Animated.View>
      
      {recentSearches.length > 0 && suggestions.length === 0 && (
        <View style={styles.recentSearchesContainer}>
          <View style={styles.recentSearchesHeader}>
            <Text style={[styles.recentSearchesTitle, { color: colors.text }]}>Recent Searches</Text>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearRecentSearches}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text style={[styles.clearButtonText, { color: colors.error }]}>Clear</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={recentSearches}
            renderItem={renderRecentSearchItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentSearchesList}
          />
        </View>
      )}
      
      {suggestions.length === 0 && recentSearches.length === 0 && (
        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Search for GitHub users to view their profile, followers, and more.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    marginTop: Platform.OS === 'ios' ? 80 : 60,
    marginBottom: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: 56,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 56,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorContainer: {
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  recentSearchesContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  recentSearchesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  recentSearchesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    marginLeft: 4,
  },
  recentSearchesList: {
    paddingVertical: 10,
  },
  recentSearchItem: {
    borderRadius: 12,
    padding: 10,
    marginRight: 15,
    alignItems: 'center',
    width: 80,
    borderWidth: 1,
  },
  recentSearchAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  recentSearchText: {
    fontSize: 12,
    textAlign: 'center',
  },
  suggestionsContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    maxHeight: 300,
    borderWidth: 1,
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  suggestionText: {
    fontSize: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  infoText: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
});

export default HomeScreen;
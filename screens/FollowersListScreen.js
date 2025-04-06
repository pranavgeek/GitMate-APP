import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GitHubService from '../services/GitHubService';
import { useTheme } from '../context/themeContext';

const FollowersListScreen = ({ route, navigation }) => {
  const { username, type, count } = route.params;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const { colors } = useTheme();

  const fetchUsers = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    }
    
    setError(null);

    try {
      let data;
      if (type === 'followers') {
        data = await GitHubService.getUserFollowers(username, pageNum);
      } else {
        data = await GitHubService.getUserFollowing(username, pageNum);
      }

      if (data.length === 0) {
        setHasMore(false);
      }

      if (refresh || pageNum === 1) {
        setUsers(data);
        setPage(1);
      } else {
        setUsers(prevUsers => [...prevUsers, ...data]);
      }
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      setError(`Unable to load ${type}. Please try again.`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Reset state when username or type changes
    setUsers([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
    setError(null);
    
    // Fetch users
    fetchUsers(1, false);
  }, [username, type]);

  const onRefresh = () => {
    setHasMore(true);
    setError(null);
    fetchUsers(1, true);
  };

  const loadMore = () => {
    if (!loading && !refreshing && hasMore && !error) {
      fetchUsers(page + 1);
      setPage(page + 1);
    }
  };

  const navigateToProfile = async (user) => {
    // Navigate using the service to ensure we have complete data
    try {
      setLoading(true);
      const userData = await GitHubService.getUser(user.login);
      navigation.push('Profile', { userData });
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to basic navigation with available data
      navigation.push('Profile', { userData: user });
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.userItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToProfile(item)}
    >
      <Image source={{ uri: item.avatar_url }} style={styles.avatar} />
      <View style={styles.userInfo}>
        <Text style={[styles.username, { color: colors.text }]}>{item.login}</Text>
        <TouchableOpacity 
          style={styles.profileLink}
          onPress={() => navigateToProfile(item)}
        >
          <Text style={[styles.profileLinkText, { color: colors.primary }]}>View Profile</Text>
        </TouchableOpacity>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]} 
            onPress={onRefresh}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name={type === 'followers' ? "people-outline" : "person-add-outline"} size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {type === 'followers' 
            ? 'This user doesn\'t have any followers yet'
            : 'This user isn\'t following anyone yet'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing || users.length === 0) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {Array(5).fill().map((_, index) => (
        <View key={index} style={[styles.skeletonItem, { backgroundColor: colors.card }]}>
          <View style={[styles.skeletonAvatar, { backgroundColor: colors.cardBorder }]} />
          <View style={styles.skeletonInfo}>
            <View style={[styles.skeletonText, { backgroundColor: colors.cardBorder }]} />
            <View style={[styles.skeletonText, { width: '40%', backgroundColor: colors.cardBorder }]} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.isDarkMode ? "light-content" : "dark-content"} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: colors.card }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.icon} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {type === 'followers' ? 'Followers' : 'Following'} ({count})
        </Text>
      </View>
      
      {loading && !refreshing && users.length === 0 ? (
        renderSkeletonLoader()
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={[
            styles.listContent,
            users.length === 0 && { flex: 1 }
          ]}
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginTop: Platform.OS === 'ios' ? 60 : 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 16,
  },
  username: {
    fontSize: 16,
    fontWeight: '500',
  },
  profileLink: {
    marginTop: 4,
  },
  profileLinkText: {
    fontSize: 14,
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    height: 74,
  },
  skeletonAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 16,
  },
  skeletonText: {
    height: 14,
    width: '70%',
    borderRadius: 4,
    marginVertical: 4,
  },
});

export default FollowersListScreen;
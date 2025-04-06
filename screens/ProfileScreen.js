import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Linking,
  Platform,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import GitHubService from '../services/GitHubService';
import { useTheme } from '../context/themeContext';

const ProfileScreen = ({ route, navigation }) => {
  const { userData } = route.params;
  const [loading, setLoading] = useState(false);
  const [detailedUserData, setDetailedUserData] = useState(null);
  const [error, setError] = useState(null);
  const { colors } = useTheme();

  useEffect(() => {
    const fetchDetailedUserData = async () => {
      setLoading(true);
      try {
        // If userData doesn't have all the info we need, fetch complete user data
        const completeUserData = await GitHubService.getUser(userData.login);
        setDetailedUserData(completeUserData);
      } catch (error) {
        console.error('Error fetching detailed user data:', error);
        setError('Error loading profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedUserData();
  }, [userData.login]);

  const navigateToFollowers = () => {
    // Use the actual data from the detailedUserData to ensure we have the most up-to-date counts
    const currentData = detailedUserData || userData;
    
    navigation.navigate('FollowersList', { 
      username: currentData.login, 
      type: 'followers',
      count: currentData.followers
    });
  };

  const navigateToFollowing = () => {
    // Use the actual data from the detailedUserData to ensure we have the most up-to-date counts
    const currentData = detailedUserData || userData;
    
    navigation.navigate('FollowersList', { 
      username: currentData.login, 
      type: 'following',
      count: currentData.following
    });
  };

  const navigateToStats = () => {
    navigation.navigate('Stats', { username: userData.login });
  };

  const navigateToRepositories = () => {
    navigation.navigate('Repositories', { username: userData.login });
  };

  const openGitHubProfile = () => {
    const profileUrl = (detailedUserData || userData).html_url;
    if (profileUrl) {
      Linking.openURL(profileUrl);
    }
  };

  // When still loading and we don't have detailed data yet
  if (loading && !detailedUserData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Use detailed data if available, otherwise use the basic userData passed in route params
  const displayData = detailedUserData || userData;

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.shareButton, { backgroundColor: colors.card }]} 
            onPress={openGitHubProfile}
          >
            <Ionicons name="open-outline" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: displayData.avatar_url }} 
            style={[styles.avatar, { borderColor: colors.cardBorder }]} 
          />
          <View style={styles.userInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{displayData.name || displayData.login}</Text>
            <Text style={[styles.username, { color: colors.textSecondary }]}>@{displayData.login}</Text>
          </View>
        </View>
        
        {displayData.bio && (
          <View style={styles.bioContainer}>
            <Text style={[styles.bio, { color: colors.text }]}>{displayData.bio}</Text>
          </View>
        )}
        
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={navigateToStats}
          >
            <Ionicons name="stats-chart" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Stats</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: colors.secondary }]}
            onPress={navigateToRepositories}
          >
            <Ionicons name="folder-open" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Repos</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowers}>
            <Text style={[styles.statCount, { color: colors.text }]}>{displayData.followers}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </TouchableOpacity>
          
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          
          <TouchableOpacity style={styles.statItem} onPress={navigateToFollowing}>
            <Text style={[styles.statCount, { color: colors.text }]}>{displayData.following}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Following</Text>
          </TouchableOpacity>
          
          <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
          
          <TouchableOpacity style={styles.statItem} onPress={navigateToRepositories}>
            <Text style={[styles.statCount, { color: colors.text }]}>{displayData.public_repos || 0}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Repositories</Text>
          </TouchableOpacity>
        </View>
        
        {detailedUserData && (
          <View style={[styles.detailsContainer, { backgroundColor: colors.card }]}>
            {detailedUserData.company && (
              <View style={styles.detailItem}>
                <Ionicons name="business-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>{detailedUserData.company}</Text>
              </View>
            )}
            
            {detailedUserData.location && (
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>{detailedUserData.location}</Text>
              </View>
            )}
            
            {detailedUserData.email && (
              <View style={styles.detailItem}>
                <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>{detailedUserData.email}</Text>
              </View>
            )}
            
            {detailedUserData.blog && (
              <View style={styles.detailItem}>
                <Ionicons name="link-outline" size={20} color={colors.textSecondary} />
                <Text 
                  style={[styles.detailText, styles.link, { color: colors.primary }]}
                  onPress={() => Linking.openURL(detailedUserData.blog)}
                >
                  {detailedUserData.blog}
                </Text>
              </View>
            )}
            
            {detailedUserData.created_at && (
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.text }]}>
                  Joined {new Date(detailedUserData.created_at).toLocaleDateString()}
                </Text>
              </View>
            )}
          </View>
        )}
        
        {error && (
          <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    marginTop: 4,
  },
  bioContainer: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  bio: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statCount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
  },
  detailsContainer: {
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 16,
  },
  link: {
    textDecorationLine: 'underline',
  },
  errorContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
});

export default ProfileScreen;
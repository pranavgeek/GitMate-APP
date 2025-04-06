import AsyncStorage from '@react-native-async-storage/async-storage';

// Keys
const CACHE_KEYS = {
  USER_PREFIX: 'user_',
  FOLLOWERS_PREFIX: 'followers_',
  FOLLOWING_PREFIX: 'following_',
  CACHE_EXPIRY_PREFIX: 'expiry_',
  RECENT_SEARCHES: 'recentSearches',
};

// Default cache expiry time (in milliseconds)
const DEFAULT_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

const CacheService = {
  // Store data in cache with expiry
  storeWithExpiry: async (key, data, expiryTime = DEFAULT_CACHE_EXPIRY) => {
    try {
      const now = new Date().getTime();
      const expiryTimestamp = now + expiryTime;
      
      await AsyncStorage.setItem(key, JSON.stringify(data));
      await AsyncStorage.setItem(CACHE_KEYS.CACHE_EXPIRY_PREFIX + key, expiryTimestamp.toString());
      
      return true;
    } catch (error) {
      console.error('Error storing data in cache:', error);
      return false;
    }
  },
  
  // Get data from cache and check if it's expired
  getWithExpiry: async (key) => {
    try {
      const expiryTimestamp = await AsyncStorage.getItem(CACHE_KEYS.CACHE_EXPIRY_PREFIX + key);
      
      if (!expiryTimestamp) {
        return null; // No expiry timestamp found
      }
      
      const now = new Date().getTime();
      
      // Check if the cache has expired
      if (now > parseInt(expiryTimestamp)) {
        // Cache expired, remove it
        await AsyncStorage.removeItem(key);
        await AsyncStorage.removeItem(CACHE_KEYS.CACHE_EXPIRY_PREFIX + key);
        return null;
      }
      
      // Cache still valid, return the data
      const dataStr = await AsyncStorage.getItem(key);
      if (!dataStr) return null;
      
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error getting data from cache:', error);
      return null;
    }
  },
  
  // Cache a user profile
  cacheUser: async (username, userData) => {
    return await CacheService.storeWithExpiry(
      CACHE_KEYS.USER_PREFIX + username.toLowerCase(),
      userData
    );
  },
  
  // Get a cached user profile
  getCachedUser: async (username) => {
    return await CacheService.getWithExpiry(
      CACHE_KEYS.USER_PREFIX + username.toLowerCase()
    );
  },
  
  // Cache followers list
  cacheFollowers: async (username, page, followersData) => {
    return await CacheService.storeWithExpiry(
      CACHE_KEYS.FOLLOWERS_PREFIX + username.toLowerCase() + '_' + page,
      followersData
    );
  },
  
  // Get cached followers list
  getCachedFollowers: async (username, page) => {
    return await CacheService.getWithExpiry(
      CACHE_KEYS.FOLLOWERS_PREFIX + username.toLowerCase() + '_' + page
    );
  },
  
  // Cache following list
  cacheFollowing: async (username, page, followingData) => {
    return await CacheService.storeWithExpiry(
      CACHE_KEYS.FOLLOWING_PREFIX + username.toLowerCase() + '_' + page,
      followingData
    );
  },
  
  // Get cached following list
  getCachedFollowing: async (username, page) => {
    return await CacheService.getWithExpiry(
      CACHE_KEYS.FOLLOWING_PREFIX + username.toLowerCase() + '_' + page
    );
  },
  
  // Store recent searches
  storeRecentSearches: async (searches) => {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.RECENT_SEARCHES, JSON.stringify(searches));
      return true;
    } catch (error) {
      console.error('Error storing recent searches:', error);
      return false;
    }
  },
  
  // Get recent searches
  getRecentSearches: async () => {
    try {
      const searchesStr = await AsyncStorage.getItem(CACHE_KEYS.RECENT_SEARCHES);
      if (!searchesStr) return [];
      return JSON.parse(searchesStr);
    } catch (error) {
      console.error('Error getting recent searches:', error);
      return [];
    }
  },
  
  // Clear all cache for a specific user
  clearUserCache: async (username) => {
    try {
      const lowercaseUsername = username.toLowerCase();
      const keys = [
        CACHE_KEYS.USER_PREFIX + lowercaseUsername,
        CACHE_KEYS.CACHE_EXPIRY_PREFIX + CACHE_KEYS.USER_PREFIX + lowercaseUsername
      ];
      
      // Get all keys from AsyncStorage
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Find follower and following keys for this user
      const followerKeys = allKeys.filter(key => 
        key.startsWith(CACHE_KEYS.FOLLOWERS_PREFIX + lowercaseUsername + '_') ||
        key.startsWith(CACHE_KEYS.CACHE_EXPIRY_PREFIX + CACHE_KEYS.FOLLOWERS_PREFIX + lowercaseUsername + '_')
      );
      
      const followingKeys = allKeys.filter(key => 
        key.startsWith(CACHE_KEYS.FOLLOWING_PREFIX + lowercaseUsername + '_') ||
        key.startsWith(CACHE_KEYS.CACHE_EXPIRY_PREFIX + CACHE_KEYS.FOLLOWING_PREFIX + lowercaseUsername + '_')
      );
      
      // Remove all relevant keys
      await AsyncStorage.multiRemove([...keys, ...followerKeys, ...followingKeys]);
      return true;
    } catch (error) {
      console.error('Error clearing user cache:', error);
      return false;
    }
  },
  
  // Clear all application cache
  clearAllCache: async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      // Filter out keys that are not related to our cache
      const cacheKeys = allKeys.filter(key => 
        key.startsWith(CACHE_KEYS.USER_PREFIX) ||
        key.startsWith(CACHE_KEYS.FOLLOWERS_PREFIX) ||
        key.startsWith(CACHE_KEYS.FOLLOWING_PREFIX) ||
        key.startsWith(CACHE_KEYS.CACHE_EXPIRY_PREFIX)
      );
      
      await AsyncStorage.multiRemove(cacheKeys);
      return true;
    } catch (error) {
      console.error('Error clearing all cache:', error);
      return false;
    }
  }
};

export default CacheService;
import { Alert } from 'react-native';
import CacheService from './CacheService';

// Base GitHub API URL
const API_BASE_URL = 'https://api.github.com';

// Add this to your GitHubService.js or create a new utility file

// Check for rate limits before making API calls
export const checkRateLimits = async () => {
  try {
    const response = await fetch('https://api.github.com/rate_limit');
    const data = await response.json();
    
    return {
      remaining: data.rate.remaining,
      limit: data.rate.limit,
      resetTime: new Date(data.rate.reset * 1000),
      isLimited: data.rate.remaining <= 5 // Consider limited when only 5 requests remain
    };
  } catch (error) {
    console.error('Error checking rate limits:', error);
    // Assume we might be rate limited if we can't check
    return {
      remaining: 0,
      limit: 60,
      resetTime: new Date(Date.now() + 3600000), // Assume reset in 1 hour
      isLimited: true
    };
  }
};

// Handle response with rate limit check
export const handleApiResponse = async (response) => {
  const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
  const rateLimitReset = response.headers.get('X-RateLimit-Reset');
  
  if (response.status === 403 && rateLimitRemaining === '0') {
    const resetDate = new Date(rateLimitReset * 1000);
    const resetTimeString = resetDate.toLocaleTimeString();
    
    const errorMessage = `GitHub API rate limit exceeded. Rate limits will reset at ${resetTimeString}`;
    
    // Show an alert to the user
    Alert.alert(
      "API Rate Limit Exceeded",
      `You've reached GitHub's API request limit. The limit will reset at ${resetTimeString}.\n\nConsider implementing authentication to get higher rate limits.`,
      [{ text: "OK" }]
    );
    
    throw new Error(errorMessage);
  }
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return await response.json();
};

// API methods
const GitHubService = {
  // Search for users
  searchUsers: async (query) => {
    try {
      if (!query || query.length < 2) return [];
      
      const response = await fetch(`${API_BASE_URL}/search/users?q=${query}&per_page=5`);
      const data = await handleApiResponse(response);
      
      return data.items || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },

  // Get user by username (with caching)
  getUser: async (username) => {
    try {
      // Try to get from cache first
      const cachedUser = await CacheService.getCachedUser(username);
      if (cachedUser) {
        console.log('Using cached user data for', username);
        return cachedUser;
      }
      
      // Fetch from API if not in cache
      const response = await fetch(`${API_BASE_URL}/users/${username}`);
      const userData = await handleApiResponse(response);
      
      // Cache the result
      await CacheService.cacheUser(username, userData);
      
      return userData;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get user followers (with caching)
  getUserFollowers: async (username, page = 1, perPage = 30) => {
    try {
      // Try to get from cache first
      const cachedFollowers = await CacheService.getCachedFollowers(username, page);
      if (cachedFollowers) {
        console.log('Using cached followers data for', username, 'page', page);
        return cachedFollowers;
      }
      
      // Fetch from API if not in cache
      const response = await fetch(
        `${API_BASE_URL}/users/${username}/followers?page=${page}&per_page=${perPage}`
      );
      const followersData = await handleApiResponse(response);
      
      // Cache the result
      await CacheService.cacheFollowers(username, page, followersData);
      
      return followersData;
    } catch (error) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  },

  // Get users that a user is following (with caching)
  getUserFollowing: async (username, page = 1, perPage = 30) => {
    try {
      // Try to get from cache first
      const cachedFollowing = await CacheService.getCachedFollowing(username, page);
      if (cachedFollowing) {
        console.log('Using cached following data for', username, 'page', page);
        return cachedFollowing;
      }
      
      // Fetch from API if not in cache
      const response = await fetch(
        `${API_BASE_URL}/users/${username}/following?page=${page}&per_page=${perPage}`
      );
      const followingData = await handleApiResponse(response);
      
      // Cache the result
      await CacheService.cacheFollowing(username, page, followingData);
      
      return followingData;
    } catch (error) {
      console.error('Error fetching following:', error);
      throw error;
    }
  },

  // Get user repositories
  getUserRepos: async (username, page = 1, perPage = 30) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`
      );
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      throw error;
    }
  },
  
  // Force refresh user data (clearing cache and fetching fresh data)
  forceRefreshUser: async (username) => {
    try {
      // Clear user cache
      await CacheService.clearUserCache(username);
      
      // Fetch fresh data
      const response = await fetch(`${API_BASE_URL}/users/${username}`);
      const userData = await handleApiResponse(response);
      
      // Cache the new result
      await CacheService.cacheUser(username, userData);
      
      return userData;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  }
};

export default GitHubService;
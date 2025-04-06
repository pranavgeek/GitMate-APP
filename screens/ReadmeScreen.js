import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/themeContext';
import ThemeToggle from '../components/ThemeToggle';
import MarkdownViewer from '../components/MarkdownViewer';
import base64 from 'base-64';

const ReadmeScreen = ({ route, navigation }) => {
  const { repositoryOwner, repositoryName } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readmeContent, setReadmeContent] = useState('');
  const [repoInfo, setRepoInfo] = useState({});

  useEffect(() => {
    fetchRepositoryReadme();
    fetchRepositoryInfo();
  }, [repositoryOwner, repositoryName]);

  const fetchRepositoryInfo = async () => {
    try {
      const response = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository information');
      }
      const data = await response.json();
      setRepoInfo(data);
    } catch (error) {
      console.error('Error fetching repository info:', error);
      // Don't set error state here, we just want the README content primarily
    }
  };

  const fetchRepositoryReadme = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try the default README.md
      const response = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/readme`);
      
      if (!response.ok) {
        // If the default README.md doesn't exist, try alternative filenames
        const alternatives = ['readme.md', 'Readme.md', 'README.markdown', 'readme.markdown', 'README.txt', 'readme.txt'];
        let content = null;
        
        for (const filename of alternatives) {
          try {
            const altResponse = await fetch(`https://api.github.com/repos/${repositoryOwner}/${repositoryName}/contents/${filename}`);
            if (altResponse.ok) {
              content = await altResponse.json();
              break;
            }
          } catch (e) {
            // Continue trying other alternatives
          }
        }
        
        if (!content) {
          throw new Error('README not found in this repository');
        }
        
        const decodedContent = base64.decode(content.content);
        setReadmeContent(decodedContent);
      } else {
        const data = await response.json();
        const decodedContent = base64.decode(data.content);
        setReadmeContent(decodedContent);
      }
    } catch (error) {
      console.error('Error fetching repository README:', error);
      setError(error.message || 'Failed to load README');
    } finally {
      setLoading(false);
    }
  };

  const openRepositoryInBrowser = () => {
    if (repoInfo.html_url) {
      Linking.openURL(repoInfo.html_url);
    } else {
      Linking.openURL(`https://github.com/${repositoryOwner}/${repositoryName}`);
    }
  };

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
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {repositoryName}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {repositoryOwner}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.openButton, { backgroundColor: colors.card }]} 
            onPress={openRepositoryInBrowser}
          >
            <Ionicons name="open-outline" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.repoInfoContainer}>
        {repoInfo.stargazers_count !== undefined && (
          <View style={[styles.repoInfoBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={[styles.repoInfoText, { color: colors.text }]}>
              {repoInfo.stargazers_count}
            </Text>
          </View>
        )}
        
        {repoInfo.forks_count !== undefined && (
          <View style={[styles.repoInfoBadge, { backgroundColor: colors.card }]}>
            <Ionicons name="git-branch-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.repoInfoText, { color: colors.text }]}>
              {repoInfo.forks_count}
            </Text>
          </View>
        )}
        
        {repoInfo.language && (
          <View style={[styles.repoInfoBadge, { backgroundColor: colors.card }]}>
            <View style={[styles.languageDot, { backgroundColor: getLanguageColor(repoInfo.language) }]} />
            <Text style={[styles.repoInfoText, { color: colors.text }]}>
              {repoInfo.language}
            </Text>
          </View>
        )}
      </View>
      
      <MarkdownViewer 
        content={readmeContent}
        loading={loading}
        error={error}
      />
    </View>
  );
};

// Helper function to get language color
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Java: '#b07219',
    Ruby: '#701516',
    PHP: '#4F5D95',
    C: '#555555',
    'C++': '#f34b7d',
    'C#': '#178600',
    Go: '#00ADD8',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Rust: '#dea584',
    Dart: '#00B4AB',
    Shell: '#89e051',
  };
  
  return colors[language] || '#8A2BE2'; // Default to purple if not found
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
    marginTop: Platform.OS === 'ios' ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  openButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  repoInfoContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 12,
    flexWrap: 'wrap',
  },
  repoInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    marginBottom: 8,
  },
  repoInfoText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  languageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default ReadmeScreen;
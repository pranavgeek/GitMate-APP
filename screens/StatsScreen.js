import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../context/themeContext';
import GitHubStatsService from '../services/GitHubStatsService';


const { width } = Dimensions.get('window');

const chartConfig = {
  backgroundGradientFrom: "#1E2923",
  backgroundGradientTo: "#08130D",
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false
};

const StatsScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [languageData, setLanguageData] = useState([]);
  const [contributionStats, setContributionStats] = useState(null);
  const [repoSizeData, setRepoSizeData] = useState([]);
  const [starredRepos, setStarredRepos] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all stats in parallel
        const [languages, stats, sizes, starred] = await Promise.all([
          GitHubStatsService.getLanguageDistribution(username),
          GitHubStatsService.getContributionStats(username),
          GitHubStatsService.getRepoSizeDistribution(username),
          GitHubStatsService.getMostStarredRepos(username)
        ]);
        
        setLanguageData(languages);
        setContributionStats(stats);
        setRepoSizeData(sizes);
        setStarredRepos(starred);
      } catch (error) {
        console.error('Error fetching GitHub stats:', error);
        setError('Failed to load GitHub statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [username]);

  const renderLanguagePieChart = () => {
    if (languageData.length === 0) {
      return (
        <View style={[styles.emptyChartContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
            No language data available
          </Text>
        </View>
      );
    }
    
    // Prepare data for pie chart
    const pieData = languageData.slice(0, 5).map(item => ({
      name: item.name,
      population: item.value,
      color: item.color,
      legendFontColor: colors.text,
      legendFontSize: 12
    }));
    
    return (
      <PieChart
        data={pieData}
        width={width - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />
    );
  };

  const renderRepoSizeBarChart = () => {
    if (repoSizeData.length === 0) {
      return (
        <View style={[styles.emptyChartContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
            No repository size data available
          </Text>
        </View>
      );
    }
    
    // Prepare data for bar chart
    const barData = {
      labels: repoSizeData.map(item => item.name.split(' ')[0]), // Just take first word to keep it short
      datasets: [
        {
          data: repoSizeData.map(item => item.value),
          color: (opacity = 1) => colors.primary,
          strokeWidth: 2
        }
      ]
    };
    
    return (
      <BarChart
        data={barData}
        width={width - 32}
        height={220}
        yAxisLabel=""
        chartConfig={{
          backgroundColor: colors.card,
          backgroundGradientFrom: colors.card,
          backgroundGradientTo: colors.card,
          decimalPlaces: 0,
          color: (opacity = 1) => colors.primary,
          labelColor: (opacity = 1) => colors.text,
          style: {
            borderRadius: 16
          },
          barPercentage: 0.5
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    );
  };

  const renderStatsCards = () => {
    if (!contributionStats) return null;
    
    return (
      <View style={styles.statsCardsContainer}>
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Ionicons name="code-slash-outline" size={28} color={colors.primary} />
          <Text style={[styles.statsValue, { color: colors.text }]}>{contributionStats.totalRepos}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Public Repos</Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Ionicons name="people-outline" size={28} color={colors.primary} />
          <Text style={[styles.statsValue, { color: colors.text }]}>{contributionStats.followers}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Followers</Text>
        </View>
        
        <View style={[styles.statsCard, { backgroundColor: colors.card }]}>
          <Ionicons name="time-outline" size={28} color={colors.primary} />
          <Text style={[styles.statsValue, { color: colors.text }]}>{contributionStats.githubAge.years}</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>Years on GitHub</Text>
        </View>
      </View>
    );
  };

  const renderStarredRepos = () => {
    if (starredRepos.length === 0) {
      return (
        <View style={[styles.emptyChartContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
            No starred repositories found
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.starredReposContainer}>
        {starredRepos.map((repo, index) => (
          <View key={index} style={[styles.starredRepoItem, { backgroundColor: colors.card }]}>
            <View style={styles.starredRepoHeader}>
              <Text style={[styles.starredRepoName, { color: colors.text }]}>{repo.name}</Text>
              <View style={styles.starsBadge}>
                <Ionicons name="star" size={16} color="#FFD700" />
                <Text style={styles.starsCount}>{repo.stars}</Text>
              </View>
            </View>
            
            {repo.description && (
              <Text 
                style={[styles.starredRepoDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {repo.description}
              </Text>
            )}
            
            <View style={styles.starredRepoFooter}>
              {repo.language && (
                <View style={styles.languageBadge}>
                  <View style={[styles.languageDot, { backgroundColor: getLanguageColor(repo.language) }]} />
                  <Text style={[styles.languageName, { color: colors.textSecondary }]}>{repo.language}</Text>
                </View>
              )}
              
              <View style={styles.forksBadge}>
                <Ionicons name="git-branch-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.forksCount, { color: colors.textSecondary }]}>{repo.forks}</Text>
              </View>
            </View>
          </View>
        ))}
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>GitHub Stats</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading statistics for {username}...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>GitHub Stats</Text>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>GitHub Stats</Text>
      </View>
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.username, { color: colors.text }]}>@{username}</Text>
        
        {/* Stats cards */}
        {renderStatsCards()}
        
        {/* Language distribution chart */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Language Distribution</Text>
          {renderLanguagePieChart()}
        </View>
        
        {/* Repository size chart */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Repository Sizes</Text>
          {renderRepoSizeBarChart()}
        </View>
        
        {/* Most starred repositories */}
        <View style={styles.chartSection}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Top Repositories</Text>
          {renderStarredRepos()}
        </View>
        
        {/* Account info */}
        {contributionStats && (
          <View style={[styles.accountInfo, { backgroundColor: colors.card }]}>
            <Text style={[styles.accountInfoTitle, { color: colors.text }]}>Account Information</Text>
            <View style={styles.accountInfoRow}>
              <Text style={[styles.accountInfoLabel, { color: colors.textSecondary }]}>GitHub member for:</Text>
              <Text style={[styles.accountInfoValue, { color: colors.text }]}>
                {contributionStats.githubAge.years} years, {contributionStats.githubAge.days} days
              </Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={[styles.accountInfoLabel, { color: colors.textSecondary }]}>Joined on:</Text>
              <Text style={[styles.accountInfoValue, { color: colors.text }]}>
                {contributionStats.accountCreated}
              </Text>
            </View>
            <View style={styles.accountInfoRow}>
              <Text style={[styles.accountInfoLabel, { color: colors.textSecondary }]}>Avg. repos per year:</Text>
              <Text style={[styles.accountInfoValue, { color: colors.text }]}>
                {contributionStats.averages.reposPerYear}
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
  },
  statsCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  statsCard: {
    width: '31%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  statsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statsLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  chartSection: {
    marginVertical: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyChartContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyChartText: {
    textAlign: 'center',
  },
  starredReposContainer: {
    marginTop: 8,
  },
  starredRepoItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  starredRepoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  starredRepoName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  starsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  starsCount: {
    marginLeft: 4,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  starredRepoDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  starredRepoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  languageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  languageName: {
    fontSize: 12,
  },
  forksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forksCount: {
    fontSize: 12,
    marginLeft: 4,
  },
  accountInfo: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  accountInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  accountInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  accountInfoLabel: {
    fontSize: 14,
  },
  accountInfoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default StatsScreen;
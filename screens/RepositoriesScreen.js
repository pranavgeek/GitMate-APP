import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/themeContext";
import ThemeToggle from "../components/ThemeToggle";
import RepositoryService from "../services/RepositoryService";

const RepositoriesScreen = ({ route, navigation }) => {
  const { username } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchRepositories();
  }, [username]);

  const fetchRepositories = async (pageNum = 1, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (pageNum === 1) {
      setLoading(true);
    }

    setError(null);

    try {
      const repos = await RepositoryService.getUserRepositoriesDetailed(
        username,
        pageNum
      );

      if (repos.length === 0) {
        setHasMore(false);
      }

      if (refresh || pageNum === 1) {
        setRepositories(repos);
        setPage(1);
      } else {
        setRepositories((prevRepos) => [...prevRepos, ...repos]);
      }
    } catch (error) {
      console.error("Error fetching repositories:", error);
      setError("Failed to load repositories. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setHasMore(true);
    fetchRepositories(1, true);
  };

  const loadMore = () => {
    if (!loading && !refreshing && hasMore && !error) {
      fetchRepositories(page + 1);
      setPage(page + 1);
    }
  };

  const navigateToReadme = (repository) => {
    navigation.navigate("Readme", {
      repositoryOwner: repository.owner.login,
      repositoryName: repository.name,
    });
  };

  const renderRepositoryItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.repoItem, { backgroundColor: colors.card }]}
      onPress={() => navigateToReadme(item)}
    >
      <View style={styles.repoHeader}>
        <Text style={[styles.repoName, { color: colors.text }]}>
          {item.name}
        </Text>

        <View style={styles.repoStats}>
          {item.stars > 0 && (
            <View style={styles.statBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={[styles.statText, { color: colors.text }]}>
                {item.stars}
              </Text>
            </View>
          )}

          {item.forks > 0 && (
            <View style={styles.statBadge}>
              <Ionicons
                name="git-branch-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text style={[styles.statText, { color: colors.text }]}>
                {item.forks}
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <Text
          style={[styles.repoDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      <View style={styles.repoFooter}>
        {item.language && (
          <View style={styles.languageBadge}>
            <View
              style={[
                styles.languageDot,
                { backgroundColor: getLanguageColor(item.language) },
              ]}
            />
            <Text
              style={[styles.languageText, { color: colors.textSecondary }]}
            >
              {item.language}
            </Text>
          </View>
        )}

        {item.topics && item.topics.length > 0 && (
          <View style={styles.topicsContainer}>
            {item.topics.slice(0, 2).map((topic, index) => (
              <View
                key={index}
                style={[
                  styles.topicBadge,
                  {
                    backgroundColor: colors.isDarkMode
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(0, 0, 0, 0.05)",
                  },
                ]}
              >
                <Text style={[styles.topicText, { color: colors.primary }]}>
                  {topic}
                </Text>
              </View>
            ))}
            {item.topics.length > 2 && (
              <Text
                style={[styles.moreTopics, { color: colors.textSecondary }]}
              >
                +{item.topics.length - 2}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.readmeButton}>
        <Ionicons
          name="document-text-outline"
          size={16}
          color={colors.primary}
        />
        <Text style={[styles.readmeButtonText, { color: colors.primary }]}>
          README
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyComponent = () => {
    if (loading) return null;

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={64}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
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
        <Ionicons
          name="folder-open-outline"
          size={64}
          color={colors.textSecondary}
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          No public repositories found
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading || refreshing || repositories.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.isDarkMode ? "light-content" : "dark-content"}
      />
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
          {username}'s Repositories
        </Text>
      </View>

      {loading && repositories.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading repositories...
          </Text>
        </View>
      ) : (
        <FlatList
          data={repositories}
          renderItem={renderRepositoryItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={[
            styles.listContent,
            repositories.length === 0 && { flex: 1 },
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

// Helper function to get language color
const getLanguageColor = (language) => {
  const colors = {
    JavaScript: "#f1e05a",
    TypeScript: "#2b7489",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Python: "#3572A5",
    Java: "#b07219",
    Ruby: "#701516",
    PHP: "#4F5D95",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    Go: "#00ADD8",
    Swift: "#ffac45",
    Kotlin: "#F18E33",
    Rust: "#dea584",
    Dart: "#00B4AB",
    Shell: "#89e051",
  };

  return colors[language] || "#8A2BE2"; // Default to purple if not found
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    marginTop: Platform.OS === "ios" ? 60 : 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContent: {
    padding: 16,
  },
  repoItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  repoHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  repoName: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  repoStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  statText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  repoDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  repoFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  languageBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 4,
  },
  languageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  languageText: {
    fontSize: 12,
  },
  topicsContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  topicBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  topicText: {
    fontSize: 12,
  },
  moreTopics: {
    fontSize: 12,
    marginBottom: 4,
  },
  readmeButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  readmeButtonText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  footerContainer: {
    padding: 20,
    alignItems: "center",
  },
});

export default RepositoriesScreen;

import GitHubService from './GitHubService';

const GitHubStatsService = {
  // Get language distribution from repositories
  getLanguageDistribution: async (username) => {
    try {
      // Fetch user's repositories
      const repos = await GitHubService.getUserRepos(username, 1, 100);
      
      // Count languages
      const languageCount = {};
      const languageColors = {
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
        // Add more languages and their colors as needed
      };
      
      // Get total repos with language information
      let totalReposWithLanguages = 0;
      
      repos.forEach(repo => {
        if (repo.language) {
          totalReposWithLanguages++;
          languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
        }
      });
      
      // Convert to percentage and format for chart
      const chartData = Object.keys(languageCount).map(language => {
        const percentage = (languageCount[language] / totalReposWithLanguages) * 100;
        return {
          name: language,
          value: languageCount[language],
          percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
          color: languageColors[language] || '#' + Math.floor(Math.random()*16777215).toString(16) // Random color if not predefined
        };
      });
      
      // Sort by frequency (descending)
      return chartData.sort((a, b) => b.value - a.value);
    } catch (error) {
      console.error('Error fetching language distribution:', error);
      return [];
    }
  },
  
  // Get contribution statistics
  getContributionStats: async (username) => {
    try {
      // Get user profile to extract creation date and current stats
      const userData = await GitHubService.getUser(username);
      
      // Calculate the user's GitHub age in days
      const creationDate = new Date(userData.created_at);
      const now = new Date();
      const githubAgeDays = Math.floor((now - creationDate) / (1000 * 60 * 60 * 24));
      
      // Calculate averages
      const averageReposPerYear = (userData.public_repos / (githubAgeDays / 365)).toFixed(1);
      
      return {
        totalRepos: userData.public_repos,
        totalGists: userData.public_gists || 0,
        followers: userData.followers,
        following: userData.following,
        githubAge: {
          years: Math.floor(githubAgeDays / 365),
          days: githubAgeDays % 365
        },
        averages: {
          reposPerYear: averageReposPerYear
        },
        accountCreated: creationDate.toLocaleDateString()
      };
    } catch (error) {
      console.error('Error fetching contribution stats:', error);
      return null;
    }
  },
  
  // Get repository size distribution
  getRepoSizeDistribution: async (username) => {
    try {
      const repos = await GitHubService.getUserRepos(username, 1, 100);
      
      // Define size categories
      const categories = {
        'Tiny (< 100 KB)': 0,
        'Small (100 KB - 1 MB)': 0,
        'Medium (1 MB - 10 MB)': 0,
        'Large (10 MB - 100 MB)': 0,
        'Huge (> 100 MB)': 0
      };
      
      // Count repositories in each size category
      repos.forEach(repo => {
        const sizeKB = repo.size;
        
        if (sizeKB < 100) {
          categories['Tiny (< 100 KB)']++;
        } else if (sizeKB < 1000) {
          categories['Small (100 KB - 1 MB)']++;
        } else if (sizeKB < 10000) {
          categories['Medium (1 MB - 10 MB)']++;
        } else if (sizeKB < 100000) {
          categories['Large (10 MB - 100 MB)']++;
        } else {
          categories['Huge (> 100 MB)']++;
        }
      });
      
      // Convert to chart data format
      const chartData = Object.keys(categories).map(category => ({
        name: category,
        value: categories[category]
      }));
      
      return chartData;
    } catch (error) {
      console.error('Error fetching repo size distribution:', error);
      return [];
    }
  },
  
  // Get most starred repositories
  getMostStarredRepos: async (username) => {
    try {
      const repos = await GitHubService.getUserRepos(username, 1, 100);
      
      // Sort by stars and take top 5
      return repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map(repo => ({
          name: repo.name,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          description: repo.description
        }));
    } catch (error) {
      console.error('Error fetching most starred repos:', error);
      return [];
    }
  }
};

export default GitHubStatsService;
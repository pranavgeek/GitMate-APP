import GitHubService from './GitHubService';

const RepositoryService = {
  // Get detailed repository information
  getRepositoryDetails: async (owner, repoName) => {
    try {
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch repository details');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching repository details:', error);
      throw error;
    }
  },
  
  // Get repository README content
  getRepositoryReadme: async (owner, repoName) => {
    try {
      // First try the default README.md
      const response = await fetch(`https://api.github.com/repos/${owner}/${repoName}/readme`);
      
      if (!response.ok) {
        // If the default README.md doesn't exist, try alternative filenames
        const alternatives = ['readme.md', 'Readme.md', 'README.markdown', 'readme.markdown', 'README.txt', 'readme.txt'];
        
        for (const filename of alternatives) {
          try {
            const altResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${filename}`);
            if (altResponse.ok) {
              return await altResponse.json();
            }
          } catch (e) {
            // Continue trying other alternatives
          }
        }
        
        throw new Error('README not found in this repository');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching repository README:', error);
      throw error;
    }
  },
  
  // Get repositories for a user with detailed information
  getUserRepositoriesDetailed: async (username, page = 1, perPage = 10) => {
    try {
      const repos = await GitHubService.getUserRepos(username, page, perPage);
      
      // Map to more usable format with additional information
      return repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchersCount: repo.watchers_count,
        defaultBranch: repo.default_branch,
        owner: {
          login: repo.owner.login,
          avatarUrl: repo.owner.avatar_url,
        },
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        hasIssues: repo.has_issues,
        hasWiki: repo.has_wiki,
        htmlUrl: repo.html_url,
        openIssuesCount: repo.open_issues_count,
        topics: repo.topics || [],
        license: repo.license ? repo.license.name : null,
      }));
    } catch (error) {
      console.error('Error fetching user repositories detailed:', error);
      throw error;
    }
  },
};

export default RepositoryService;
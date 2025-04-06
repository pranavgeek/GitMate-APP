# GitMate Dev Search App

This React Native application enables users to search for GitHub user profiles, explore detailed information, and utilize enhanced features for an optimal user experience. It demonstrates effective data fetching from the GitHub REST API, JSON parsing, and a robust interactive UI with seamless navigation.

## Key Features

- **User Search**: Search for GitHub profiles using usernames and view detailed information such as avatar, username, name, description, follower count, and following count.
- **Profile Navigation**: Explore followers and following lists with navigation to individual profiles.
- **Recent Searches**: Caches and highlights recent search queries for quick revisits.
- **High Profile Suggestions**: Quick access to high-profile GitHub user profiles, promoting user engagement.

## Extra Features

- **GitHub Stats Visualization**: Charts showing user contribution activities, language distribution in repos, and commit frequencies using Recharts.
- **Markdown Renderer**: Renders markdown README files from repositories to preview content in-app.
- **Profile Caching**: Caches recently searched profiles to reduce API calls and speeds up load times.
- **Animated Dark Mode**: Animated toggle between light and dark modes, enhancing visual appeal and user experience.

## Bonus Features

- **Skeleton Screens**: Implements skeleton screens to improve the perceived load time and enhance the user experience during data fetching.
- **Pull to Refresh**: Allows users to refresh data on demand with a simple gesture, ensuring they are viewing the most current information.
- **Cache Invalidation**: Smart caching system that knows when to invalidate and update cached data, reducing unnecessary API calls while ensuring data freshness.

## Video Demo

View the [video demo here](<https://drive.google.com/file/d/19Xkc7kB05zrBnH-XiJguymSamBLlnQaA/view?usp=sharing>) that showcases the app startup and basic UI flow, including all extra and bonus features. The video is concise, highlighting the functionality without voiceover.

## Installation

To set up the app locally, follow these steps:

1. Clone the GitHub repository:

git clone <your-repo-url>
cd your-project-name

3. Install dependencies:

         npm install

4. Run the application:

         npm start


## Technologies Used

- **React Native**: For building the mobile application.
- **Axios**: Used for API requests.
- **Recharts**: For data visualization components.
- **React Navigation**: For in-app navigation.

## Code Practices

The project strictly adheres to SOLID principles with a clean architectural pattern to ensure components are reusable and maintainable. Key practices include:

- **Modular Architecture**: Organized components and services.
- **State Management**: Efficient management of state and API responses.
- **Error Handling**: Comprehensive approach to handling potential errors, including API rate limits.

## Contact

For inquiries or to contribute to the project, please contact me at [pranavgotawala@gmail.com](mailto:pranavgotawala@gmail.com).



import React from 'react';
import { 
  View, 
  Text,
  Image,
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  useWindowDimensions
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/themeContext';

const MarkdownViewer = ({ content, loading, error }) => {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  // Create markdown styles based on the current theme
  const markdownStyles = {
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      color: colors.text,
      borderBottomWidth: 1,
      borderColor: colors.divider,
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
      paddingBottom: 4,
    },
    heading2: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading3: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 8,
    },
    heading4: {
      color: colors.text,
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 16,
      marginBottom: 4,
    },
    heading5: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 12,
      marginBottom: 4,
    },
    heading6: {
      color: colors.text,
      fontSize: 16,
      fontWeight: 'bold',
      fontStyle: 'italic',
      marginTop: 12,
      marginBottom: 4,
    },
    hr: {
      backgroundColor: colors.divider,
      height: 1,
      marginTop: 16,
      marginBottom: 16,
    },
    strong: {
      fontWeight: 'bold',
    },
    em: {
      fontStyle: 'italic',
    },
    s: {
      textDecorationLine: 'line-through',
    },
    blockquote: {
      backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      paddingHorizontal: 12,
      paddingVertical: 4,
      marginVertical: 8,
    },
    paragraph: {
      marginTop: 8,
      marginBottom: 8,
      flexWrap: 'wrap',
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    bullet_list: {
      marginBottom: 8,
    },
    ordered_list: {
      marginBottom: 8,
    },
    list_item: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    link: {
      color: colors.primary,
      textDecorationLine: 'underline',
    },
    code_inline: {
      backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderRadius: 4,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: colors.isDarkMode ? '#f8f8f2' : '#272822',
      paddingHorizontal: 4,
    },
    code_block: {
      backgroundColor: colors.isDarkMode ? '#2d2d2d' : '#f5f5f5',
      borderRadius: 8,
      padding: 12,
      marginVertical: 8,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      color: colors.isDarkMode ? '#f8f8f2' : '#272822',
    },
    table: {
      borderWidth: 1,
      borderColor: colors.divider,
      marginVertical: 8,
    },
    thead: {
      backgroundColor: colors.isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    tr: {
      borderBottomWidth: 1,
      borderColor: colors.divider,
    },
    th: {
      padding: 8,
      fontWeight: 'bold',
      color: colors.text,
    },
    td: {
      padding: 8,
      color: colors.text,
    },
    // Add a wrapper style for images
    image: {
      marginVertical: 8,
      alignItems: 'center',
    }
  };

  // Define custom renderers properly
  const renderers = {
    // This is the correct way to define custom renderers
    image: ({ src, alt }) => {
      return (
        <View style={markdownStyles.image}>
          <Image 
            source={{ uri: src }} 
            style={{ width: width - 64, height: 200 }}
            resizeMode="contain" 
          />
          {alt && <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>{alt}</Text>}
        </View>
      );
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.card }]}>
        <Markdown style={markdownStyles}>
          {`# Error Loading Markdown\n\n${error}`}
        </Markdown>
      </View>
    );
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.card }]}
      contentContainerStyle={styles.contentContainer}
    >
      <Markdown 
        style={markdownStyles}
        rules={{
          image: renderers.image
        }}
      >
        {content || '# No content available'}
      </Markdown>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
  },
});

export default MarkdownViewer;
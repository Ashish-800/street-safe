import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

function RootLayoutNav() {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={styles.webContainer}>
      <View style={[styles.appContainer, { backgroundColor: colors.background.base }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background.base } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="route/index" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  }
});

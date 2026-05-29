import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Platform, StyleSheet } from 'react-native';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';
import { AuthProvider } from '../src/context/AuthContext';
import { LocationProvider } from '../src/context/LocationContext';

function RootLayoutNav() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.webContainer, { backgroundColor: isDark ? '#0C0C0E' : '#F5EEE0' }]}>
      <View style={[styles.appContainer, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
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
      <AuthProvider>
        <LocationProvider>
          <RootLayoutNav />
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 430 : '100%',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? {
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: 'rgba(0,0,0,0.08)',
    } : {}),
  },
});

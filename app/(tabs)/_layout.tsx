import { Tabs } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Home, Map as MapIcon, ShieldAlert, Bell, User } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { borderRadius } from '../../src/theme/spacing';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.base,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: colors.background.paper,
          borderTopColor: colors.border.strong,
          borderTopWidth: 1,
          elevation: isDark ? 0 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: typography.weights.bold,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'Route',
          tabBarIcon: ({ color, focused }) => (
            <MapIcon color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'SOS',
          tabBarIcon: ({ color, focused }) => (
            <ShieldAlert color={color} size={28} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            <Bell color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <User color={color} size={24} strokeWidth={focused ? 2.5 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}

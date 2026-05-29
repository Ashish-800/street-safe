import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Home, Map as MapIcon, ShieldAlert, Bell, Wrench, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme/ThemeContext';

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.navBg,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          elevation: isDark ? 0 : 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <View style={[styles.activePill, { backgroundColor: colors.primaryBg }]}>
                <Home color={colors.primary} size={20} strokeWidth={2.5} />
              </View>
            ) : (
              <Home color={color} size={22} strokeWidth={2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <View style={[styles.activePill, { backgroundColor: colors.primaryBg }]}>
                <MapIcon color={colors.primary} size={20} strokeWidth={2.5} />
              </View>
            ) : (
              <MapIcon color={color} size={22} strokeWidth={2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'SOS',
          tabBarLabel: () => null,
          tabBarIcon: ({ focused }) => (
            <View style={styles.sosContainer}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.sosButton}
              >
                <ShieldAlert size={23} color="#FFF" strokeWidth={2} />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <View style={[styles.activePill, { backgroundColor: colors.primaryBg }]}>
                <Bell color={colors.primary} size={20} strokeWidth={2.5} />
              </View>
            ) : (
              <Bell color={color} size={22} strokeWidth={2} />
            )
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, focused }) => (
            focused ? (
              <View style={[styles.activePill, { backgroundColor: colors.primaryBg }]}>
                <User color={colors.primary} size={20} strokeWidth={2.5} />
              </View>
            ) : (
              <User color={color} size={22} strokeWidth={2} />
            )
          ),
        }}
      />
      {/* Hide route tab from bottom nav — accessed via navigation */}
      <Tabs.Screen name="route" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  activePill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  sosContainer: {
    marginTop: -22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(239,68,68,0.55)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
});

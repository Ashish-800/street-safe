import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { UserCircle2, Shield, Bell, Settings, LogOut, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      const user = data?.user;
      if (user) {
        setUserEmail(user.email ?? null);
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  const menuItems = [
    { id: '1', title: 'Personal Information', icon: <UserCircle2 size={24} color={colors.text.primary} /> },
    { id: '2', title: 'Emergency Contacts', icon: <Shield size={24} color={colors.text.primary} /> },
    { id: '3', title: 'Notification Preferences', icon: <Bell size={24} color={colors.text.primary} /> },
    { id: '4', title: 'Account Settings', icon: <Settings size={24} color={colors.text.primary} /> },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary.light, borderColor: colors.primary.base }]}>
              <Text style={[styles.avatarText, { color: colors.primary.base }]}>P</Text>
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text.primary }]}>Priya Das</Text>
            <Text style={[styles.profileDetail, { color: colors.text.secondary }]}>{userEmail || 'Not logged in'}</Text>
            <Text style={[styles.profileDetail, { color: colors.text.secondary }]}>+91 98765 43210</Text>
          </View>
          <Pressable style={[styles.editBtn, { backgroundColor: colors.background.base }]}>
            <Text style={[styles.editBtnText, { color: colors.text.primary }]}>Edit</Text>
          </Pressable>
        </View>

        {/* Theme Toggle */}
        <View style={[styles.themeCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <View style={styles.themeInfo}>
            {isDark ? <Moon size={24} color={colors.primary.base} /> : <Sun size={24} color={colors.primary.base} />}
            <Text style={[styles.themeTitle, { color: colors.text.primary }]}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border.strong, true: colors.primary.light }}
            thumbColor={isDark ? colors.primary.base : '#f4f3f4'}
          />
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <View 
              key={item.id} 
              style={[
                styles.menuItem,
                { backgroundColor: colors.background.paper, borderColor: colors.border.base },
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast
              ]}
            >
              <Pressable style={styles.menuPressable} onPress={() => Alert.alert('Navigating...', item.title)}>
                <View style={[styles.menuIconContainer, { backgroundColor: colors.background.base }]}>
                  {item.icon}
                </View>
                <Text style={[styles.menuItemTitle, { color: colors.text.primary }]}>{item.title}</Text>
              </Pressable>
            </View>
          ))}
        </View>

        <Pressable 
          style={[styles.logoutBtn, { backgroundColor: 'rgba(244, 63, 94, 0.1)', borderColor: 'rgba(244, 63, 94, 0.3)' }]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#F43F5E" style={{marginRight: 8}} />
          <Text style={[styles.logoutText, { color: '#F43F5E' }]}>Secure Logout</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 100, 
  },
  profileCard: {
    flexDirection: 'row',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
  },
  avatarContainer: {
    marginRight: spacing.lg,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: typography.sizes.sm,
    marginBottom: 2,
  },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  editBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.md,
  },
  menuContainer: {
    marginBottom: spacing['2xl'],
  },
  menuItem: {
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  menuItemFirst: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  menuItemLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  menuPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuItemTitle: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
});

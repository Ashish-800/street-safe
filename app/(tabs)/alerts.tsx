import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { AlertTriangle, MapPin, Clock, ShieldAlert, Navigation, Search } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function AlertsScreen() {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('ALL');

  const filters = ['ALL', 'NEARBY', 'SEVERE', 'VERIFIED'];

  const alerts = [
    {
      id: '1',
      type: 'SEVERE',
      title: 'Unlit Street Reported',
      location: 'Park Street Extension, 1km away',
      time: '10 mins ago',
      verified: true,
      description: 'Multiple users reported broken streetlights between the crossing and the metro station. Avoid walking alone.',
    },
    {
      id: '2',
      type: 'WARNING',
      title: 'Suspicious Activity',
      location: 'Gariahat Market Area, 3km away',
      time: '25 mins ago',
      verified: true,
      description: 'User reported a group following commuters near the south exit. Police patrol notified.',
    },
    {
      id: '3',
      type: 'INFO',
      title: 'Heavy Traffic & Crowd',
      location: 'Esplanade, 5km away',
      time: '1 hour ago',
      verified: false,
      description: 'Unexpectedly large crowd due to a local event. Commute might be delayed.',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Network Alerts</Text>
        <Text style={[styles.headerSubtitle, { color: colors.primary.base }]}>CROWD-SOURCED INTELLIGENCE</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { borderColor: colors.border.base, backgroundColor: colors.background.paper }]}>
          <Search size={20} color={colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text.primary }]}
            placeholder="Search location or incident..."
            placeholderTextColor={colors.text.tertiary}
          />
        </View>
      </View>

      <View style={styles.filterScroll}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent}>
          {filters.map((f) => (
            <Pressable 
              key={f}
              style={[
                styles.filterPill, 
                { borderColor: colors.border.base },
                filter === f && { backgroundColor: colors.primary.light, borderColor: colors.primary.base },
              ]}
              onPress={() => setFilter(f)}
            >
              <Text style={[
                styles.filterText, 
                { color: colors.text.secondary },
                filter === f && { color: colors.primary.base },
              ]}>{f}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {alerts.map((alert) => (
          <View 
            key={alert.id} 
            style={[
              styles.alertCard,
              { borderColor: colors.border.base, backgroundColor: colors.background.paper },
              alert.type === 'SEVERE' && { borderColor: 'rgba(244, 63, 94, 0.4)' },
              alert.type === 'WARNING' && { borderColor: 'rgba(251, 191, 36, 0.4)' },
            ]}
          >
            <View style={styles.alertHeader}>
              <View style={styles.alertHeaderLeft}>
                {alert.type === 'SEVERE' ? (
                  <ShieldAlert size={20} color={colors.secondary.base} />
                ) : (
                  <AlertTriangle size={20} color={alert.type === 'WARNING' ? '#FBBF24' : colors.primary.base} />
                )}
                <Text style={[
                  styles.alertType,
                  { color: colors.primary.base },
                  alert.type === 'SEVERE' && { color: colors.secondary.base },
                  alert.type === 'WARNING' && { color: '#FBBF24' },
                ]}>
                  {alert.type}
                </Text>
              </View>
              <View style={styles.timeWrapper}>
                <Clock size={12} color={colors.text.tertiary} style={{marginRight: 4}} />
                <Text style={[styles.alertTime, { color: colors.text.tertiary }]}>{alert.time}</Text>
              </View>
            </View>

            <Text style={[styles.alertTitle, { color: colors.text.primary }]}>{alert.title}</Text>
            
            <View style={styles.locationRow}>
              <MapPin size={14} color={colors.text.secondary} style={{marginRight: 4}} />
              <Text style={[styles.alertLocation, { color: colors.text.secondary }]}>{alert.location}</Text>
            </View>

            <Text style={[styles.alertDesc, { color: colors.text.secondary }]}>{alert.description}</Text>

            <View style={[styles.alertFooter, { borderTopColor: colors.border.base }]}>
              {alert.verified ? (
                <View style={styles.verifiedBadge}>
                  <Text style={[styles.verifiedText, { color: colors.safe.base }]}>✓ COMMUNITY VERIFIED</Text>
                </View>
              ) : (
                <View />
              )}
              <Pressable style={styles.mapBtn}>
                <Navigation size={14} color={colors.text.primary} style={{marginRight: 4}} />
                <Text style={[styles.mapBtnText, { color: colors.text.primary }]}>View</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Action Button for Reporting */}
      <Pressable style={[styles.fab, { backgroundColor: colors.primary.base }]}>
        <AlertTriangle size={24} color={colors.text.inverse} />
      </Pressable>

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
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: typography.weights.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: spacing.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
  },
  filterScroll: {
    marginBottom: spacing.md,
  },
  filterContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 140, 
  },
  alertCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertType: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
    letterSpacing: 1,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTime: {
    fontSize: typography.sizes.xs,
  },
  alertTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  alertLocation: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  alertDesc: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  alertFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  verifiedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  mapBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

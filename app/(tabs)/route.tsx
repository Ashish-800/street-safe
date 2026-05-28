import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import { Menu, Bell, MapPin, ArrowUpDown, Navigation, Car, Bus } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { KolkataMap } from '../../src/components/KolkataMap';

export default function RouteScreen() {
  const { colors } = useTheme();
  const [travelMode, setTravelMode] = useState('Walk');

  const modes = [
    { id: 'Walk', icon: <FootprintsIcon size={20} color={travelMode === 'Walk' ? colors.text.primary : colors.text.tertiary} /> },
    { id: 'Auto', icon: <Navigation size={20} color={travelMode === 'Auto' ? colors.text.primary : colors.text.tertiary} /> },
    { id: 'Cab', icon: <Car size={20} color={travelMode === 'Cab' ? colors.text.primary : colors.text.tertiary} /> },
    { id: 'Bus', icon: <Bus size={20} color={travelMode === 'Bus' ? colors.text.primary : colors.text.tertiary} /> },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Menu size={24} color={colors.text.primary} />
        <Text style={[styles.headerTitle, { color: colors.secondary.dark }]}>Surakshit Raasta</Text>
        <Bell size={24} color={colors.text.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.pageTitle, { color: colors.text.primary }]}>Plan Your Safe Route</Text>
        <Text style={[styles.pageSubtitle, { color: colors.text.secondary }]}>Get AI-suggested safest route to your destination</Text>

        {/* Input Card */}
        <View style={[styles.inputCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <View style={styles.inputRow}>
            <View style={styles.inputLabels}>
              <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>From</Text>
              <View style={styles.inputField}>
                <Navigation size={16} color={colors.text.primary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.textInput, { color: colors.text.primary }]} 
                  value="Current Location"
                  editable={false}
                />
              </View>
            </View>
            <View style={[styles.swapBtn, { borderColor: colors.border.strong }]}>
              <ArrowUpDown size={16} color={colors.text.primary} />
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border.base }]} />
          
          <View style={styles.inputRow}>
            <View style={styles.inputLabels}>
              <Text style={[styles.inputLabel, { color: colors.text.tertiary }]}>To</Text>
              <View style={styles.inputField}>
                <MapPin size={16} color={colors.text.primary} style={styles.inputIcon} />
                <TextInput 
                  style={[styles.textInput, { color: colors.text.primary }]} 
                  placeholder="Where to?"
                  placeholderTextColor={colors.text.tertiary}
                  value="Howrah Station"
                />
              </View>
            </View>
          </View>
        </View>

        {/* Travel Mode */}
        <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>Travel Mode</Text>
        <View style={styles.modeRow}>
          {modes.map((mode) => (
            <Pressable 
              key={mode.id}
              style={[
                styles.modeBtn, 
                { backgroundColor: colors.background.paper, borderColor: colors.border.base },
                travelMode === mode.id && { borderColor: colors.secondary.base, backgroundColor: colors.secondary.light }
              ]}
              onPress={() => setTravelMode(mode.id)}
            >
              {mode.icon}
              <Text style={[
                styles.modeText, 
                { color: travelMode === mode.id ? colors.text.primary : colors.text.secondary }
              ]}>{mode.id}</Text>
            </Pressable>
          ))}
        </View>

        {/* Action Button */}
        <Pressable style={[styles.findBtn, { backgroundColor: colors.secondary.base }]}>
          <Text style={[styles.findBtnText, { color: colors.text.inverse }]}>FIND SAFE ROUTE</Text>
        </Pressable>

        {/* Route Preview */}
        <View style={[styles.previewCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <Text style={[styles.previewTitle, { color: colors.text.primary }]}>Route Preview</Text>
          
          <View style={styles.mapContainer}>
             <KolkataMap showRoute={true} height={180} />
          </View>

          <View style={styles.metricsRow}>
            <View>
              <Text style={[styles.metricLabel, { color: colors.safe.dark }]}>Safest Route</Text>
              <View style={styles.metricValRow}>
                <Text style={[styles.metricVal, { color: colors.text.primary }]}>20 <Text style={styles.metricUnit}>min</Text></Text>
                <Text style={[styles.metricDesc, { color: colors.text.tertiary }]}>Duration</Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View>
              <View style={[styles.badge, { backgroundColor: colors.safe.light }]}>
                <Text style={[styles.badgeText, { color: colors.safe.dark }]}>Recommended</Text>
              </View>
              <View style={styles.metricValRow}>
                <Text style={[styles.metricVal, { color: colors.text.primary }]}>6.2 <Text style={styles.metricUnit}>km</Text></Text>
                <Text style={[styles.metricDesc, { color: colors.text.tertiary }]}>Distance</Text>
              </View>
            </View>

            <View style={styles.metricDivider} />

            <View>
              <Text style={[styles.metricVal, { color: colors.text.primary, marginTop: 22 }]}>Low</Text>
              <Text style={[styles.metricDesc, { color: colors.text.tertiary }]}>Risk Level</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// Simple fallback for Footprints if not imported
const FootprintsIcon = (props: any) => <Navigation {...props} />;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xl,
  },
  inputCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabels: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  swapBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
    marginLeft: 24, // Align with text
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginBottom: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  modeBtn: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  modeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    marginTop: 4,
  },
  findBtn: {
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  findBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  previewCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  previewTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    padding: spacing.md,
  },
  mapContainer: {
    backgroundColor: '#F3F4F6',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  metricLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  metricValRow: {
    flexDirection: 'column',
  },
  metricVal: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  metricUnit: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },
  metricDesc: {
    fontSize: 10,
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: spacing.sm,
  },
});

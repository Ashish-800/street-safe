import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { KolkataMap } from '../../src/components/KolkataMap';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function RouteScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [destination, setDestination] = useState('');
  const [selectedRouteId, setSelectedRouteId] = useState('1');
  const [travelMode, setTravelMode] = useState('Walk');

  const modes = ['Walk', 'Auto', 'Cab', 'Bus'];

  const routes = [
    { id: '1', name: 'Via Park Street', safety: 8.5, time: '12 min', distance: '1.2 km', tag: 'Safest' },
    { id: '2', name: 'Via AJC Bose Rd', safety: 7.1, time: '10 min', distance: '1.0 km', tag: 'Fastest' },
    { id: '3', name: 'Via Minto Park', safety: 6.2, time: '14 min', distance: '1.4 km', tag: '' },
  ];

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background.base }]} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { backgroundColor: colors.background.paper }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>AI Safe Route</Text>
          <View style={styles.backBtn} />
        </View>

        <View style={styles.searchContainer}>
          <View style={[styles.searchRow, { backgroundColor: colors.background.base, borderColor: colors.border.base }]}>
            <View style={styles.searchIconContainer}>
              <View style={[styles.dotStart, { backgroundColor: colors.primary.base }]} />
              <View style={[styles.dashedLine, { backgroundColor: colors.border.base }]} />
              <MapPin size={16} color={colors.secondary.base} />
            </View>
            <View style={styles.inputsContainer}>
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>From</Text>
                <TextInput 
                  style={[styles.input, { color: colors.primary.base }]} 
                  value="Current Location" 
                  editable={false} 
                />
              </View>
              <View style={[styles.inputDivider, { backgroundColor: colors.border.base }]} />
              <View style={styles.inputWrapper}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>To</Text>
                <TextInput 
                  style={[styles.inputActive, { color: colors.text.primary }]} 
                  placeholder="Where to?" 
                  placeholderTextColor={colors.text.tertiary}
                  value={destination}
                  onChangeText={setDestination}
                />
              </View>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modesContainer}>
          {modes.map(mode => (
            <Pressable 
              key={mode} 
              style={[
                styles.modeBtn, 
                { backgroundColor: colors.background.base, borderColor: colors.border.base },
                travelMode === mode && { backgroundColor: colors.primary.light, borderColor: colors.primary.base },
              ]}
              onPress={() => setTravelMode(mode)}
            >
              <Text style={[
                styles.modeText, 
                { color: colors.text.secondary },
                travelMode === mode && { color: colors.primary.dark, fontWeight: typography.weights.bold as any },
              ]}>{mode}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.mapWrapper, { borderBottomColor: colors.border.base }]}>
          <KolkataMap showRoute={true} />
        </View>

        <View style={styles.routesContainer}>
          <Text style={[styles.routesTitle, { color: colors.text.primary }]}>Suggested Routes</Text>
          
          {routes.map(route => (
            <Pressable 
              key={route.id}
              style={[
                styles.routeCard, 
                { backgroundColor: colors.background.paper, borderColor: colors.border.base },
                selectedRouteId === route.id && { borderColor: colors.primary.base },
              ]}
              onPress={() => setSelectedRouteId(route.id)}
            >
              <View style={styles.routeHeader}>
                <Text style={[styles.routeName, { color: colors.text.primary }]}>{route.name}</Text>
                {route.tag ? (
                  <View style={[styles.routeTag, { backgroundColor: colors.primary.light }]}>
                    <Text style={[styles.routeTagText, { color: colors.primary.base }]}>{route.tag}</Text>
                  </View>
                ) : null}
              </View>
              <View style={styles.routeDetails}>
                <Text style={[styles.routeDetail, { color: colors.text.secondary }]}>🛡 {route.safety}/10</Text>
                <Text style={[styles.routeDetail, { color: colors.text.secondary }]}>⏱ {route.time}</Text>
                <Text style={[styles.routeDetail, { color: colors.text.secondary }]}>📍 {route.distance}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background.paper, borderTopColor: colors.border.base }]}>
        <Pressable style={styles.startBtn} onPress={() => {}}>
          <LinearGradient
            colors={[colors.primary.base, colors.primary.dark]}
            style={styles.startBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Navigation size={20} color={colors.text.inverse} />
            <Text style={[styles.startBtnText, { color: colors.text.inverse }]}>Start Navigation</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    zIndex: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
  },
  searchIconContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  dotStart: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dashedLine: {
    width: 2,
    height: 24,
    marginVertical: 4,
  },
  inputsContainer: {
    flex: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  inputLabel: {
    width: 40,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  input: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  inputActive: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
  inputDivider: {
    height: 1,
  },
  modesContainer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
  },
  modeBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
  },
  modeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  content: {
    flex: 1,
  },
  mapWrapper: {
    borderBottomWidth: 1,
  },
  routesContainer: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  routesTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
  },
  routeCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  routeName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  routeTag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  routeTagText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  routeDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  routeDetail: {
    fontSize: typography.sizes.sm,
  },
  footer: {
    padding: spacing.xl,
    paddingBottom: 40,
    borderTopWidth: 1,
  },
  startBtn: {
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  startBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  startBtnText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginLeft: spacing.sm,
  },
});

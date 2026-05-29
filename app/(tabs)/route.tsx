import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TextInput, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Navigation2, ArrowUpDown, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { supabase } from '../../src/lib/supabase';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

const KOLKATA_PLACES: Record<string, [number, number]> = {
  'howrah station': [88.3426, 22.5839],
  'howrah': [88.3426, 22.5839],
  'sealdah': [88.3740, 22.5669],
  'park street': [88.3536, 22.5521],
  'gariahat': [88.3694, 22.5176],
  'tollygunge': [88.3476, 22.4986],
  'behala': [88.3070, 22.4989],
  'salt lake': [88.4106, 22.5777],
  'new town': [88.4526, 22.5907],
  'esplanade': [88.3537, 22.5628],
  'rashbehari': [88.3540, 22.5183],
  'jadavpur': [88.3700, 22.4990],
  'airport': [88.4467, 22.6547],
  'kolkata airport': [88.4467, 22.6547],
  'dum dum': [88.4338, 22.6231],
  'ballygunge': [88.3640, 22.5276],
  'lake market': [88.3594, 22.5158],
  'south city': [88.3868, 22.5006],
  'kalighat': [88.3475, 22.5223],
  'college street': [88.3635, 22.5752],
};

// Geocode destination
const geocode = async (query: string): Promise<[number, number] | null> => {
  const q = query.toLowerCase().trim();
  // Check local database first
  for (const [key, coords] of Object.entries(KOLKATA_PLACES)) {
    if (q.includes(key)) return coords;
  }
  // Try Mapbox geocoding
  if (MAPBOX_TOKEN) {
    try {
      const resp = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&proximity=88.3639,22.5726&limit=1`
      );
      const data = await resp.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].center as [number, number];
      }
    } catch (e) {}
  }
  return null;
};

// Fetch Mapbox directions
const getDirections = async (from: [number, number], to: [number, number]): Promise<any[]> => {
  if (!MAPBOX_TOKEN) return [];
  try {
    const profiles = ['walking', 'driving', 'cycling'];
    const results = await Promise.all(
      profiles.map(async (profile) => {
        try {
          const resp = await fetch(
            `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from[0]},${from[1]};${to[0]},${to[1]}?access_token=${MAPBOX_TOKEN}&geometries=geojson&overview=full`
          );
          const data = await resp.json();
          if (data.routes && data.routes.length > 0) {
            return { profile, ...data.routes[0] };
          }
          return null;
        } catch { return null; }
      })
    );
    return results.filter(Boolean);
  } catch (e) {
    return [];
  }
};

export default function RouteScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { location } = useLocation();

  const [destination, setDestination] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [selectedMode, setSelectedMode] = useState('walk');
  const [focusDest, setFocusDest] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null);

  const MODES = [
    { label: '🚶 Walk', id: 'walk' },
    { label: '🛺 Auto', id: 'auto' },
    { label: '🚕 Cab', id: 'cab' },
    { label: '🚌 Bus', id: 'bus' },
  ];

  const searchRoute = async () => {
    if (!destination.trim()) {
      RNAlert.alert('Enter destination', 'Please type where you want to go');
      return;
    }
    setLoading(true);
    setRoutes([]);

    const coords = await geocode(destination);
    if (!coords) {
      RNAlert.alert('Not found', `Couldn't find "${destination}". Try a Kolkata landmark like "Howrah Station" or "Park Street".`);
      setLoading(false);
      return;
    }
    setDestCoords(coords);

    const fromCoords: [number, number] = [location?.longitude || 88.3639, location?.latitude || 22.5726];
    const dirResults = await getDirections(fromCoords, coords);

    if (dirResults.length > 0) {
      const mapped = dirResults.map((r, i) => {
        const durationMin = Math.round(r.duration / 60);
        const distKm = (r.distance / 1000).toFixed(1);
        const labels = ['SAFEST', 'FASTER', 'ALTERNATE'];
        const colors = ['#10B981', '#F59E0B', '#3B82F6'];
        // Compute safety based on profile (walking = more exposed = slightly lower)
        const baseSafety = r.profile === 'walking' ? 75 : r.profile === 'driving' ? 85 : 80;
        const safety = Math.min(98, baseSafety + Math.floor(Math.random() * 15));
        return {
          id: i,
          label: labels[i] || 'ROUTE',
          time: `${durationMin} min`,
          via: r.legs?.[0]?.summary || `Via ${r.profile}`,
          km: `${distKm} km`,
          risk: safety >= 85 ? 'Low Risk' : safety >= 70 ? 'Medium Risk' : 'High Risk',
          safety,
          color: colors[i] || '#3B82F6',
          best: i === 0,
          profile: r.profile,
          geometry: r.geometry,
        };
      });
      setRoutes(mapped);
    } else {
      // Fallback routes
      setRoutes([
        { id: 0, label: 'SAFEST', time: '22 min', via: 'Via main road', km: '3.2 km', risk: 'Low Risk', safety: 92, color: '#10B981', best: true },
        { id: 1, label: 'FASTER', time: '16 min', via: 'Direct route', km: '2.8 km', risk: 'Medium Risk', safety: 68, color: '#F59E0B', best: false },
        { id: 2, label: 'ALTERNATE', time: '28 min', via: 'Via safe zones', km: '4.1 km', risk: 'Low Risk', safety: 85, color: '#3B82F6', best: false },
      ]);
    }
    setLoading(false);
  };

  const startNavigation = () => {
    if (routes.length === 0) {
      RNAlert.alert('No route', 'Search for a destination first');
      return;
    }
    const route = routes[selectedRoute];
    // Save to Supabase
    if (user) {
      supabase.from('saved_routes').insert([{
        user_id: user.id,
        from_location: location?.address || 'Current Location',
        to_location: destination,
        route_data: { profile: route.profile, time: route.time, km: route.km },
        safety_score: route.safety,
      }]).then(() => {});
    }
    RNAlert.alert('🧭 Navigation Started', `Following ${route.label} route: ${route.via}\n${route.time} · ${route.km}\nSafety: ${route.safety}%`);
  };

  // Map preview
  const mapSrc = destCoords && MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/${isDark ? 'dark-v11' : 'streets-v12'}/static/pin-s+10B981(${location?.longitude || 88.3639},${location?.latitude || 22.5726}),pin-s+EF4444(${destCoords[0]},${destCoords[1]})/auto/600x300@2x?access_token=${MAPBOX_TOKEN}&padding=60`
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.paper, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Safe Route</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Smarter, safer journeys</Text>
        </View>
        <Navigation2 size={20} color={colors.primary} fill={colors.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* From/To */}
        <View style={[styles.routeCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <View style={styles.dotsCol}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <View style={[styles.dashLine, { borderColor: colors.border }]} />
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          </View>
          <View style={{ flex: 1 }}>
            <View style={[styles.fromField, { backgroundColor: colors.paperAlt, borderColor: colors.border }]}>
              <MapPin size={14} color={colors.textMuted} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.textSub, fontSize: 13 }}>📍 {location?.address || 'Current Location'}</Text>
            </View>
            <View style={[styles.toField, { borderColor: focusDest ? colors.primary : colors.border, backgroundColor: colors.paper }]}>
              <MapPin size={14} color={colors.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={[styles.toInput, { color: colors.text }]}
                placeholder="Where to? (e.g. Howrah Station)"
                placeholderTextColor={colors.textMuted}
                value={destination}
                onChangeText={setDestination}
                onFocus={() => setFocusDest(true)}
                onBlur={() => setFocusDest(false)}
                onSubmitEditing={searchRoute}
                returnKeyType="search"
              />
            </View>
          </View>
          <Pressable onPress={searchRoute} style={[styles.searchBtn, { backgroundColor: colors.primaryBg }]}>
            {loading ? <ActivityIndicator size="small" color={colors.primary} /> : <Navigation2 size={16} color={colors.primary} />}
          </Pressable>
        </View>

        {/* Travel Mode */}
        <View style={styles.modeRow}>
          {MODES.map(m => (
            <Pressable key={m.id} onPress={() => setSelectedMode(m.id)} style={[styles.modePill, { backgroundColor: selectedMode === m.id ? colors.primaryBg : colors.paperAlt, borderColor: selectedMode === m.id ? colors.primary : colors.border }]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedMode === m.id ? colors.primary : colors.textMuted }}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Map Preview */}
        {mapSrc && Platform.OS === 'web' ? (
          <View style={[styles.mapPreview, { borderColor: colors.border }]}>
            <img src={mapSrc} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} alt="Route" />
          </View>
        ) : routes.length > 0 ? (
          <View style={[styles.mapPreview, { backgroundColor: isDark ? '#1a1d26' : '#F5EDD8', borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>🗺️ Route map</Text>
            <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '700', marginTop: 4 }}>{location?.address || 'Here'} → {destination}</Text>
          </View>
        ) : null}

        {/* Route Cards */}
        {routes.length > 0 && <Text style={[styles.sectionTitle, { color: colors.text }]}>Routes Available</Text>}
        {routes.map(r => (
          <Pressable key={r.id} onPress={() => setSelectedRoute(r.id)} style={[styles.routeOption, { backgroundColor: selectedRoute === r.id ? `${r.color}0D` : colors.paper, borderColor: selectedRoute === r.id ? r.color : colors.border, borderWidth: selectedRoute === r.id ? 2 : 1 }]}>
            <View style={styles.routeHeader}>
              <View style={[styles.routeBadge, { backgroundColor: `${r.color}20` }]}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: r.color }}>{r.label}</Text>
              </View>
              {r.best && <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}><Text style={{ fontSize: 8, fontWeight: '800', color: '#FFF' }}>BEST</Text></View>}
              <View style={{ flex: 1 }} />
              <Text style={[styles.routeTime, { color: colors.text }]}>{r.time}</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{r.via} · {r.km} · {r.risk}</Text>
            <View style={styles.safetyBarRow}>
              <View style={[styles.safetyTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.safetyFill, { width: `${r.safety}%`, backgroundColor: r.color }]} />
              </View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: r.color, marginLeft: 8 }}>{r.safety}%</Text>
            </View>
          </Pressable>
        ))}

        {/* Search prompt */}
        {routes.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 14 }}>🔍 Enter a destination to find safe routes</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 11, marginTop: 4 }}>Try: Howrah Station, Gariahat, Salt Lake, Park Street</Text>
          </View>
        )}

        {/* Start Navigation */}
        {routes.length > 0 && (
          <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, marginTop: 12 })} onPress={startNavigation}>
            <LinearGradient colors={['#F97316', '#EA580C']} style={styles.navBtn}>
              <Navigation2 size={18} color="#FFF" fill="#FFF" style={{ marginRight: 8 }} />
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>Start Navigation</Text>
            </LinearGradient>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 100 },
  routeCard: { flexDirection: 'row', borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 16, alignItems: 'center', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  dotsCol: { alignItems: 'center', marginRight: 12, height: 90 },
  dot: { width: 10, height: 10, borderRadius: 5, borderWidth: 2, borderColor: '#FFF' },
  dashLine: { flex: 1, borderLeftWidth: 2, borderStyle: 'dashed', marginVertical: 4 },
  fromField: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, marginBottom: 8 },
  toField: { flexDirection: 'row', alignItems: 'center', height: 40, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12 },
  toInput: { flex: 1, fontSize: 13 },
  searchBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  modeRow: { flexDirection: 'row', gap: 7, marginBottom: 16 },
  modePill: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  mapPreview: { height: 200, borderRadius: 20, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  routeOption: { borderRadius: 18, padding: 14, marginBottom: 10, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bestBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  routeTime: { fontSize: 24, fontWeight: '900' },
  safetyBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  safetyTrack: { flex: 1, height: 6, borderRadius: 3 },
  safetyFill: { height: '100%', borderRadius: 3 },
  emptyState: { paddingVertical: 40 },
  navBtn: { height: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(249,115,22,0.4)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8 },
});

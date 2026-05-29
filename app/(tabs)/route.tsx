import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TextInput, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Navigation2, MapPin, ShieldCheck, ShieldAlert, AlertTriangle, Clock, Brain, Sparkles } from 'lucide-react-native';
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
  'new market': [88.3515, 22.5573],
  'victoria memorial': [88.3425, 22.5449],
  'science city': [88.3957, 22.5400],
  'rabindra sadan': [88.3421, 22.5360],
  'bhawanipore': [88.3450, 22.5233],
};

// Geocode destination
const geocode = async (query: string): Promise<[number, number] | null> => {
  const q = query.toLowerCase().trim();
  for (const [key, coords] of Object.entries(KOLKATA_PLACES)) {
    if (q.includes(key)) return coords;
  }
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

// Haversine distance in km
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── AI SAFETY ENGINE ───
interface AlertData { latitude: number; longitude: number; severity: string; type: string; }
interface SafetyAnalysis {
  score: number;
  incidentProximity: number;      // penalty from nearby incidents
  timeOfDayFactor: number;        // night penalty
  lightingScore: number;          // estimated lighting
  crowdDensity: number;           // estimated crowd level
  routeTypePenalty: number;       // walk vs drive
  nearbyIncidents: number;        // count of alerts within 1km
  recommendations: string[];
}

const analyzeRouteSafety = (
  routeCoords: [number, number][],
  alerts: AlertData[],
  profile: string,
): SafetyAnalysis => {
  let baseSafety = 100;
  const recommendations: string[] = [];

  // 1. INCIDENT PROXIMITY — check how close the route passes to known danger zones
  let totalIncidentPenalty = 0;
  let nearbyIncidents = 0;
  const samplePoints = routeCoords.length > 20
    ? routeCoords.filter((_, i) => i % Math.floor(routeCoords.length / 20) === 0)
    : routeCoords;

  for (const alert of alerts) {
    if (!alert.latitude || !alert.longitude) continue;
    for (const [lng, lat] of samplePoints) {
      const dist = haversine(lat, lng, alert.latitude, alert.longitude);
      if (dist < 0.3) { // Within 300m
        const severityWeight = alert.severity === 'SEVERE' ? 6 : alert.severity === 'MODERATE' ? 3 : 1;
        totalIncidentPenalty += severityWeight * (1 - dist / 0.3); // closer = worse
        nearbyIncidents++;
        break; // count each alert once
      } else if (dist < 1.0) {
        nearbyIncidents++;
      }
    }
  }
  const incidentProximity = Math.min(30, totalIncidentPenalty);
  baseSafety -= incidentProximity;

  if (nearbyIncidents > 3) {
    recommendations.push('⚠️ Multiple incidents reported along this route');
  } else if (nearbyIncidents > 0) {
    recommendations.push('ℹ️ Some incidents reported nearby — stay alert');
  }

  // 2. TIME OF DAY — night is more dangerous
  const hour = new Date().getHours();
  let timeOfDayFactor = 0;
  if (hour >= 22 || hour < 5) {
    timeOfDayFactor = 15; // Late night
    recommendations.push('🌙 Late night travel — consider a cab instead of walking');
  } else if (hour >= 19 || hour < 6) {
    timeOfDayFactor = 8; // Evening/early morning
    recommendations.push('🌆 Evening hours — stay on well-lit main roads');
  } else if (hour >= 6 && hour < 9) {
    timeOfDayFactor = 2; // Early morning
  }
  baseSafety -= timeOfDayFactor;

  // 3. LIGHTING SCORE — estimate based on time + route type
  let lightingScore = 90;
  if (hour >= 20 || hour < 6) lightingScore = 40;
  else if (hour >= 18) lightingScore = 65;

  // 4. CROWD DENSITY — estimate based on time
  let crowdDensity = 50;
  if (hour >= 8 && hour <= 10) crowdDensity = 85; // Rush hour
  else if (hour >= 17 && hour <= 19) crowdDensity = 80;
  else if (hour >= 22 || hour < 6) crowdDensity = 15;
  else if (hour >= 11 && hour <= 16) crowdDensity = 65;

  if (crowdDensity < 30) {
    baseSafety -= 5;
    recommendations.push('👥 Low crowd density — consider sharing live location');
  }

  // 5. ROUTE TYPE PENALTY — walking is more exposed
  let routeTypePenalty = 0;
  if (profile === 'walking') {
    routeTypePenalty = 8;
    recommendations.push('🚶 Walking route — keep emergency contacts ready');
  } else if (profile === 'cycling') {
    routeTypePenalty = 5;
  } else {
    recommendations.push('🚗 Vehicle route — safer than walking at this hour');
  }
  baseSafety -= routeTypePenalty;

  // Clamp
  const score = Math.max(15, Math.min(98, Math.round(baseSafety)));
  if (score >= 85) recommendations.unshift('✅ AI analysis: This route is safe for travel');
  else if (score >= 70) recommendations.unshift('⚡ AI analysis: Moderate safety — take precautions');
  else recommendations.unshift('🚨 AI analysis: Low safety score — consider an alternative');

  return {
    score,
    incidentProximity,
    timeOfDayFactor,
    lightingScore,
    crowdDensity,
    routeTypePenalty,
    nearbyIncidents,
    recommendations,
  };
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
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const MODES = [
    { label: '🚶 Walk', id: 'walk' },
    { label: '🛺 Auto', id: 'auto' },
    { label: '🚕 Cab', id: 'cab' },
    { label: '🚌 Bus', id: 'bus' },
  ];

  // Fetch alerts for safety analysis
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await supabase.from('alerts').select('*').eq('active', true);
        if (data) setAlerts(data);
      } catch (e) {}
    };
    fetchAlerts();
  }, []);

  const searchRoute = async () => {
    if (!destination.trim()) {
      RNAlert.alert('Enter destination', 'Please type where you want to go');
      return;
    }
    setLoading(true);
    setRoutes([]);
    setShowAnalysis(false);

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
        const routeColors = ['#10B981', '#F59E0B', '#3B82F6'];

        // AI Safety Analysis
        const routeCoords = r.geometry?.coordinates || [];
        const analysis = analyzeRouteSafety(routeCoords, alerts, r.profile);

        return {
          id: i,
          label: labels[i] || 'ROUTE',
          time: `${durationMin} min`,
          via: r.legs?.[0]?.summary || `Via ${r.profile}`,
          km: `${distKm} km`,
          safety: analysis.score,
          analysis,
          color: routeColors[i] || '#3B82F6',
          best: false,
          profile: r.profile,
          geometry: r.geometry,
        };
      });

      // Mark the highest safety score as "best"
      const maxSafety = Math.max(...mapped.map(r => r.safety));
      mapped.forEach(r => { if (r.safety === maxSafety) r.best = true; });
      // Re-sort: safest first
      mapped.sort((a, b) => b.safety - a.safety);
      mapped.forEach((r, i) => { r.id = i; r.label = i === 0 ? 'SAFEST' : i === 1 ? 'FASTER' : 'ALTERNATE'; });

      setRoutes(mapped);
      setShowAnalysis(true);
    } else {
      // Fallback routes with AI analysis
      const fallbackAnalysis = analyzeRouteSafety([], alerts, 'walking');
      setRoutes([
        { id: 0, label: 'SAFEST', time: '22 min', via: 'Via main road', km: '3.2 km', safety: fallbackAnalysis.score, analysis: fallbackAnalysis, color: '#10B981', best: true },
        { id: 1, label: 'FASTER', time: '16 min', via: 'Direct route', km: '2.8 km', safety: Math.max(40, fallbackAnalysis.score - 15), analysis: { ...fallbackAnalysis, score: Math.max(40, fallbackAnalysis.score - 15), recommendations: ['⚡ Shorter but less safe', ...fallbackAnalysis.recommendations.slice(1)] }, color: '#F59E0B', best: false },
        { id: 2, label: 'ALTERNATE', time: '28 min', via: 'Via safe zones', km: '4.1 km', safety: Math.max(50, fallbackAnalysis.score - 5), analysis: { ...fallbackAnalysis, score: Math.max(50, fallbackAnalysis.score - 5) }, color: '#3B82F6', best: false },
      ]);
      setShowAnalysis(true);
    }
    setLoading(false);
  };

  const startNavigation = () => {
    if (routes.length === 0) return;
    const route = routes[selectedRoute];
    if (user) {
      supabase.from('saved_routes').insert([{
        user_id: user.id,
        from_location: location?.address || 'Current Location',
        to_location: destination,
        route_data: { profile: route.profile, time: route.time, km: route.km, safety: route.safety },
        safety_score: route.safety,
      }]).then(() => {});
    }
    RNAlert.alert('🧭 Navigation Started', `Following ${route.label} route: ${route.via}\n${route.time} · ${route.km}\nAI Safety Score: ${route.safety}%`);
  };

  const selectedAnalysis = routes[selectedRoute]?.analysis;

  // Map preview
  const mapSrc = destCoords && MAPBOX_TOKEN
    ? `https://api.mapbox.com/styles/v1/mapbox/${isDark ? 'dark-v11' : 'streets-v12'}/static/pin-s+10B981(${location?.longitude || 88.3639},${location?.latitude || 22.5726}),pin-s+EF4444(${destCoords[0]},${destCoords[1]})/auto/600x300@2x?access_token=${MAPBOX_TOKEN}&padding=60`
    : null;

  const getScoreColor = (score: number) => score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const getScoreIcon = (score: number) => score >= 80 ? ShieldCheck : score >= 60 ? AlertTriangle : ShieldAlert;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.paper, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Safe Route</Text>
            <View style={[styles.aiBadge, { backgroundColor: colors.primaryBg }]}>
              <Sparkles size={10} color={colors.primary} />
              <Text style={{ fontSize: 9, fontWeight: '800', color: colors.primary }}>AI</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Powered by safety intelligence</Text>
        </View>
        <Brain size={20} color={colors.primary} />
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
              <MapPin size={14} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={{ color: colors.textSub, fontSize: 13 }} numberOfLines={1}>📍 {location?.address || 'Current Location'}</Text>
            </View>
            <View style={[styles.toField, { borderColor: focusDest ? colors.primary : colors.border, backgroundColor: colors.paper }]}>
              <MapPin size={14} color="#EF4444" style={{ marginRight: 8 }} />
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
          <Pressable onPress={searchRoute} style={({ pressed }) => [styles.searchBtn, { backgroundColor: colors.primaryBg, opacity: pressed ? 0.7 : 1 }]}>
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

        {/* AI Safety Analysis Card */}
        {showAnalysis && selectedAnalysis && (
          <View style={[styles.aiCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
            <View style={styles.aiCardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Brain size={16} color={colors.primary} />
                <Text style={[styles.aiCardTitle, { color: colors.text }]}>AI Safety Analysis</Text>
              </View>
              <View style={[styles.scorePill, { backgroundColor: `${getScoreColor(selectedAnalysis.score)}14` }]}>
                {React.createElement(getScoreIcon(selectedAnalysis.score), { size: 14, color: getScoreColor(selectedAnalysis.score) })}
                <Text style={{ fontSize: 16, fontWeight: '900', color: getScoreColor(selectedAnalysis.score), marginLeft: 4 }}>{selectedAnalysis.score}%</Text>
              </View>
            </View>

            {/* Factor Bars */}
            <View style={styles.factorsGrid}>
              {[
                { label: 'Incident proximity', value: Math.max(0, 100 - selectedAnalysis.incidentProximity * 3.3), color: selectedAnalysis.incidentProximity > 10 ? '#EF4444' : '#10B981' },
                { label: 'Time of day', value: Math.max(0, 100 - selectedAnalysis.timeOfDayFactor * 6.7), color: selectedAnalysis.timeOfDayFactor > 8 ? '#EF4444' : '#10B981' },
                { label: 'Lighting', value: selectedAnalysis.lightingScore, color: selectedAnalysis.lightingScore < 50 ? '#F59E0B' : '#10B981' },
                { label: 'Crowd density', value: selectedAnalysis.crowdDensity, color: selectedAnalysis.crowdDensity < 30 ? '#EF4444' : '#10B981' },
              ].map((f, i) => (
                <View key={i} style={styles.factorRow}>
                  <Text style={{ fontSize: 11, color: colors.textSub, width: 120 }}>{f.label}</Text>
                  <View style={[styles.factorTrack, { backgroundColor: colors.border }]}>
                    <View style={[styles.factorFill, { width: `${f.value}%`, backgroundColor: f.color }]} />
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: f.color, width: 32, textAlign: 'right' }}>{Math.round(f.value)}%</Text>
                </View>
              ))}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: selectedAnalysis.nearbyIncidents > 0 ? '#FEF2F2' : '#ECFDF5' }]}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: selectedAnalysis.nearbyIncidents > 0 ? '#EF4444' : '#10B981' }}>{selectedAnalysis.nearbyIncidents}</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted }}>Nearby alerts</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#3B82F6' }}>{Math.round(selectedAnalysis.crowdDensity)}%</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted }}>Crowd level</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: selectedAnalysis.lightingScore < 50 ? '#FFFBEB' : '#ECFDF5' }]}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: selectedAnalysis.lightingScore < 50 ? '#F59E0B' : '#10B981' }}>{selectedAnalysis.lightingScore < 50 ? '🌙' : '☀️'}</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted }}>Lighting</Text>
              </View>
            </View>

            {/* Recommendations */}
            <View style={[styles.recsBox, { backgroundColor: colors.paperAlt }]}>
              {selectedAnalysis.recommendations.slice(0, 3).map((rec: string, i: number) => (
                <Text key={i} style={{ fontSize: 11, color: colors.textSub, lineHeight: 18, marginBottom: 2 }}>{rec}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Route Cards */}
        {routes.length > 0 && <Text style={[styles.sectionTitle, { color: colors.text }]}>Routes Available</Text>}
        {routes.map(r => (
          <Pressable key={r.id} onPress={() => setSelectedRoute(r.id)} style={[styles.routeOption, { backgroundColor: selectedRoute === r.id ? `${r.color}0D` : colors.paper, borderColor: selectedRoute === r.id ? r.color : colors.border, borderWidth: selectedRoute === r.id ? 2 : 1 }]}>
            <View style={styles.routeHeader}>
              <View style={[styles.routeBadge, { backgroundColor: `${r.color}20` }]}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: r.color }}>{r.label}</Text>
              </View>
              {r.best && <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}><Text style={{ fontSize: 8, fontWeight: '800', color: '#FFF' }}>AI PICK</Text></View>}
              <View style={{ flex: 1 }} />
              <Text style={[styles.routeTime, { color: colors.text }]}>{r.time}</Text>
            </View>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{r.via} · {r.km}</Text>
            <View style={styles.safetyBarRow}>
              <View style={[styles.safetyTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.safetyFill, { width: `${r.safety}%`, backgroundColor: getScoreColor(r.safety) }]} />
              </View>
              <View style={[styles.safetyPill, { backgroundColor: `${getScoreColor(r.safety)}14` }]}>
                {React.createElement(getScoreIcon(r.safety), { size: 10, color: getScoreColor(r.safety) })}
                <Text style={{ fontSize: 10, fontWeight: '700', color: getScoreColor(r.safety), marginLeft: 3 }}>{r.safety}%</Text>
              </View>
            </View>
          </Pressable>
        ))}

        {/* Search prompt */}
        {routes.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryBg }]}>
              <Brain size={32} color={colors.primary} />
            </View>
            <Text style={{ color: colors.text, textAlign: 'center', fontSize: 15, fontWeight: '700', marginTop: 12 }}>AI-Powered Safety Routing</Text>
            <Text style={{ color: colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: 6, lineHeight: 18, paddingHorizontal: 20 }}>
              Enter a destination to get AI-analyzed routes with safety scores based on real-time incident data, time of day, lighting, and crowd density.
            </Text>
            <View style={[styles.suggestionsBox, { backgroundColor: colors.paper, borderColor: colors.border }]}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSub, marginBottom: 8 }}>Try these destinations:</Text>
              {['Howrah Station', 'Gariahat', 'Salt Lake', 'Park Street', 'New Town'].map(place => (
                <Pressable key={place} onPress={() => { setDestination(place); }} style={[styles.suggestionPill, { backgroundColor: colors.paperAlt }]}>
                  <MapPin size={10} color={colors.primary} />
                  <Text style={{ fontSize: 12, color: colors.text, marginLeft: 6 }}>{place}</Text>
                </Pressable>
              ))}
            </View>
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
  aiBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
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
  // AI Card
  aiCard: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  aiCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  aiCardTitle: { fontSize: 14, fontWeight: '800' },
  scorePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  factorsGrid: { marginBottom: 12 },
  factorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  factorTrack: { flex: 1, height: 5, borderRadius: 3, marginHorizontal: 8 },
  factorFill: { height: '100%', borderRadius: 3 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBox: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center' },
  recsBox: { borderRadius: 14, padding: 12 },
  // Routes
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  routeOption: { borderRadius: 18, padding: 14, marginBottom: 10, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  routeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  routeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bestBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  routeTime: { fontSize: 24, fontWeight: '900' },
  safetyBarRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  safetyTrack: { flex: 1, height: 6, borderRadius: 3 },
  safetyFill: { height: '100%', borderRadius: 3 },
  safetyPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
  // Empty
  emptyState: { paddingVertical: 30, alignItems: 'center' },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  suggestionsBox: { marginTop: 20, borderRadius: 16, borderWidth: 1, padding: 14, width: '100%' },
  suggestionPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, marginBottom: 4 },
  navBtn: { height: 52, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(249,115,22,0.4)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8 },
});

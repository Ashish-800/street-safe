import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Switch, ActivityIndicator, Alert as RNAlert } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, LocateFixed, CheckCircle, Circle, UserCircle2, RefreshCw } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { supabase } from '../../src/lib/supabase';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;

// Map displays as a Mapbox static image (works on web + native without native modules)
const MapImage = ({ lat, lng, isDark }: { lat: number; lng: number; isDark: boolean }) => {
  const style = isDark ? 'dark-v11' : 'streets-v12';
  const marker = `pin-l+F97316(${lng},${lat})`;
  const src = `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${marker}/${lng},${lat},13,0/600x400@2x?access_token=${MAPBOX_TOKEN}`;

  return (
    <View style={styles.mapContainer}>
      {Platform.OS === 'web' ? (
        <img
          src={src}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }}
          alt="Map"
        />
      ) : (
        <View style={[styles.mapPlaceholder, { backgroundColor: isDark ? '#1a1d26' : '#F5EDD8' }]}>
          <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF', fontSize: 13, textAlign: 'center' }}>📍 {lat.toFixed(4)}°N, {lng.toFixed(4)}°E</Text>
          <Text style={{ color: isDark ? '#4B5563' : '#D1D5DB', fontSize: 10, marginTop: 4, textAlign: 'center' }}>Map view (install Mapbox SDK for interactive map)</Text>
        </View>
      )}
    </View>
  );
};

export default function MapScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { location, refreshLocation, loading: locLoading } = useLocation();

  const [sharing, setSharing] = useState(false);
  const [contacts, setContacts] = useState<any[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const shareInterval = useRef<any>(null);

  // Fetch safety contacts
  useEffect(() => {
    const fetchContacts = async () => {
      if (!user) { setLoadingContacts(false); return; }
      try {
        const { data, error } = await supabase.from('safety_contacts').select('*').eq('user_id', user.id);
        if (data && data.length > 0) {
          setContacts(data);
          setSelected(data.map((c: any) => c.id));
        } else {
          // Seed default contacts
          const defaults = [
            { user_id: user.id, name: 'Mom', phone: '+91 98765 43210', is_live: true },
            { user_id: user.id, name: 'Best Friend', phone: '+91 87654 32109', is_live: true },
            { user_id: user.id, name: 'Office Security', phone: '+91 76543 21098', is_live: false },
          ];
          const { data: inserted } = await supabase.from('safety_contacts').insert(defaults);
          if (inserted) {
            setContacts(inserted);
            setSelected(inserted.map((c: any) => c.id));
          } else {
            setContacts(defaults.map((c, i) => ({ ...c, id: `local-${i}` })));
          }
        }
      } catch (e) {
        setContacts([
          { id: '1', name: 'Mom', phone: '+91 98765 43210', is_live: true },
          { id: '2', name: 'Best Friend', phone: '+91 87654 32109', is_live: true },
          { id: '3', name: 'Office Security', phone: '+91 76543 21098', is_live: false },
        ]);
      }
      setLoadingContacts(false);
    };
    fetchContacts();
  }, [user]);

  // Location sharing
  useEffect(() => {
    if (sharing && user && location) {
      // Initial share
      updateLocationShare();
      // Update every 30s
      shareInterval.current = setInterval(updateLocationShare, 30000);
    } else {
      if (shareInterval.current) clearInterval(shareInterval.current);
    }
    return () => { if (shareInterval.current) clearInterval(shareInterval.current); };
  }, [sharing]);

  const updateLocationShare = async () => {
    if (!user || !location) return;
    try {
      // Upsert location
      const { data: existing } = await supabase.from('location_shares').select('id').eq('user_id', user.id).eq('is_active', true).limit(1);
      if (existing && existing.length > 0) {
        await supabase.from('location_shares').update({
          latitude: location.latitude,
          longitude: location.longitude,
          updated_at: new Date().toISOString(),
        }).eq('id', existing[0].id);
      } else {
        await supabase.from('location_shares').insert([{
          user_id: user.id,
          latitude: location.latitude,
          longitude: location.longitude,
          is_active: true,
        }]);
      }
    } catch (e) {}
  };

  const toggleSharing = async (val: boolean) => {
    setSharing(val);
    if (!val && user) {
      // Stop sharing
      try {
        await supabase.from('location_shares').update({ is_active: false }).eq('user_id', user.id);
      } catch (e) {}
    }
  };

  const toggleContact = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.paper, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Live Tracking</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: sharing ? '#ECFDF5' : colors.paperAlt, borderColor: sharing ? '#10B981' : colors.border }]}>
          <View style={[styles.statusDot, { backgroundColor: sharing ? '#10B981' : colors.textMuted }]} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: sharing ? '#10B981' : colors.textMuted }}>{sharing ? 'LIVE' : 'OFF'}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Mapbox Map */}
        {location && <MapImage lat={location.latitude} lng={location.longitude} isDark={isDark} />}

        {/* Location Card */}
        <View style={[styles.locCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <View style={[styles.locIconBox, { backgroundColor: colors.primaryBg }]}>
            <LocateFixed size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.locTitle, { color: colors.text }]}>{location?.address || 'Getting location...'}</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{location ? `${location.latitude.toFixed(4)}° N, ${location.longitude.toFixed(4)}° E` : 'Waiting for GPS...'}</Text>
          </View>
          <Pressable onPress={refreshLocation} style={[styles.refreshBtn, { backgroundColor: colors.primaryBg }]}>
            {locLoading ? <ActivityIndicator size="small" color={colors.primary} /> : <RefreshCw size={14} color={colors.primary} />}
          </Pressable>
        </View>

        {/* Toggle */}
        <View style={[styles.toggleCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Location Sharing</Text>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>Share live location with safety circle</Text>
          </View>
          <Switch value={sharing} onValueChange={toggleSharing} trackColor={{ false: colors.border, true: '#10B981' }} thumbColor="#FFF" style={{ transform: [{ scale: 0.9 }] }} />
        </View>

        {/* Contacts */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Share with{selected.length > 0 ? ` · ${selected.length} selected` : ''}</Text>
        {loadingContacts ? <ActivityIndicator color={colors.primary} /> : contacts.map(c => {
          const isSelected = selected.includes(c.id);
          return (
            <Pressable key={c.id} onPress={() => toggleContact(c.id)} style={[styles.contactCard, { backgroundColor: colors.paper, borderColor: isSelected ? colors.primary : colors.border, borderWidth: isSelected ? 2 : 1 }]}>
              <View style={[styles.contactAvatar, { backgroundColor: isSelected ? colors.primaryBg : colors.paperAlt }]}>
                <UserCircle2 size={28} color={isSelected ? colors.primary : colors.textMuted} strokeWidth={1} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.contactName, { color: colors.text }]}>{c.name}</Text>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>{c.phone}</Text>
              </View>
              <View style={[styles.liveBadge, { backgroundColor: c.is_live ? '#ECFDF5' : colors.paperAlt }]}>
                <View style={[styles.liveDot, { backgroundColor: c.is_live ? '#10B981' : colors.textMuted }]} />
                <Text style={{ fontSize: 9, fontWeight: '700', color: c.is_live ? '#10B981' : colors.textMuted }}>{c.is_live ? 'Live' : 'Offline'}</Text>
              </View>
              {isSelected ? <CheckCircle size={22} color={colors.primary} /> : <Circle size={22} color={colors.border} />}
            </Pressable>
          );
        })}

        {/* Start/Stop */}
        <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1, marginTop: 16 })} onPress={() => toggleSharing(!sharing)}>
          {sharing ? (
            <View style={[styles.stopBtn, { borderColor: colors.emergency }]}>
              <Text style={{ color: colors.emergency, fontSize: 15, fontWeight: '800' }}>Stop Sharing</Text>
            </View>
          ) : (
            <LinearGradient colors={['#F97316', '#EA580C']} style={styles.startBtn}>
              <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '800' }}>Start Sharing Location</Text>
            </LinearGradient>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1, gap: 4 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  scroll: { padding: 16, paddingBottom: 100 },
  mapContainer: { height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)' },
  mapPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  locCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 12, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  locIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  locTitle: { fontSize: 14, fontWeight: '700' },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  toggleCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 14, marginBottom: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  toggleLabel: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  contactCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 8, shadowColor: 'rgba(0,0,0,0.04)', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 1, shadowRadius: 8, elevation: 1 },
  contactAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  contactName: { fontSize: 14, fontWeight: '700' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4, marginRight: 8 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  startBtn: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: 'rgba(249,115,22,0.4)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8 },
  stopBtn: { height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5 },
});

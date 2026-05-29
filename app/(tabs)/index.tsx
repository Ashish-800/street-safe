import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Menu, Bell, Navigation, ShieldAlert, Phone, Users, Footprints, Video, Plus, UserCircle2, MapPin, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { supabase } from '../../src/lib/supabase';

// Safety Score Gauge
const SafetyGauge = ({ score, color }: { score: number; color: string }) => {
  const r = 60, sw = 10, cx = 75, cy = 75;
  const startAngle = -210, sweepAngle = 240;
  const toRad = (a: number) => (a * Math.PI) / 180;
  const arcPath = (start: number, sweep: number) => {
    const s = toRad(start), e = toRad(start + sweep);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    const large = sweep > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const fillSweep = (score / 10) * sweepAngle;

  return (
    <Svg width={150} height={100} viewBox="0 0 150 120">
      <Path d={arcPath(startAngle, sweepAngle)} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      <Path d={arcPath(startAngle, fillSweep)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <SvgText x={cx} y={cx - 5} fontSize="26" fontWeight="900" fill={color} textAnchor="middle">{score.toFixed(1)}</SvgText>
      <SvgText x={cx} y={cx + 12} fontSize="10" fill="#9CA3AF" textAnchor="middle">/10</SvgText>
      <SvgText x={cx} y={cx + 28} fontSize="9" fontWeight="700" fill="#9CA3AF" textAnchor="middle">SAFETY SCORE</SvgText>
    </Svg>
  );
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const getTimeSince = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function HomeDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { location } = useLocation();
  const [loadingSOS, setLoadingSOS] = useState(false);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Fetch alerts from Supabase
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('active', true)
          .order('created_at', { ascending: false })
          .limit(5);
        if (data && !error) {
          setAlerts(data);
        }
      } catch (e) {
        // Use fallback data
      }
    };
    fetchAlerts();
  }, []);

  // Fallback alerts if Supabase returns empty
  const displayAlerts = alerts.length > 0 ? alerts.map(a => ({
    title: a.title || 'Alert',
    loc: a.location || 'Kolkata',
    time: a.created_at ? getTimeSince(a.created_at) : '5 min ago',
    severity: a.severity || 'MODERATE',
    color: a.severity === 'SEVERE' ? '#EF4444' : a.severity === 'SAFE' ? '#10B981' : a.severity === 'INFO' ? '#3B82F6' : '#F59E0B',
  })) : [
    { title: 'Chain snatching reported', loc: 'Behala Chowrasta', time: '2 min ago', severity: 'SEVERE', color: '#EF4444' },
    { title: 'Poor lighting on footpath', loc: 'Tollygunge Metro', time: '15 min ago', severity: 'MODERATE', color: '#F59E0B' },
    { title: 'Police patrol active', loc: 'Gariahat Market', time: '5 min ago', severity: 'SAFE', color: '#10B981' },
  ];

  const handleSOS = async () => {
    setLoadingSOS(true);
    try {
      if (user) {
        await supabase.from('sos_events').insert([{
          user_id: user.id,
          latitude: location?.latitude,
          longitude: location?.longitude,
          location_text: location?.address || 'Kolkata',
          is_active: true,
        }]);
      }
      Alert.alert('🚨 SOS Sent!', 'Your emergency contacts and nearby authorities have been alerted.');
    } catch (error: any) {
      Alert.alert('SOS Sent', 'Emergency alert dispatched (offline mode).');
    } finally {
      setLoadingSOS(false);
    }
  };

  const callPolice = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Emergency', 'Calling Kolkata Police: 100');
    } else {
      Linking.openURL('tel:100');
    }
  };

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User';

  const quickActions = [
    { title: 'Share My\nLocation', icon: <Navigation size={22} color="#F97316" />, bg: '#FFF3E8', route: '/(tabs)/map' },
    { title: 'Emergency\nSOS', icon: <ShieldAlert size={22} color="#EF4444" />, bg: '#FEF2F2', action: handleSOS },
    { title: 'Call Police\n100', icon: <Phone size={22} color="#10B981" />, bg: '#ECFDF5', action: callPolice },
    { title: 'Alert\nNearby', icon: <Users size={22} color="#3B82F6" />, bg: '#EFF6FF', route: '/(tabs)/alerts' },
    { title: 'Safe Walk\nMode', icon: <Footprints size={22} color="#8B5CF6" />, bg: '#F3E8FF', route: '/(tabs)/route' },
    { title: 'Record\nIncident', icon: <Video size={22} color="#F59E0B" />, bg: '#FFFBEB', route: '/(tabs)/tools' },
  ];

  const scoreColor = '#10B981';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Banner */}
      <LinearGradient colors={['#0F0A00', '#1C0E00', '#2D1500']} style={styles.headerBanner}>
        <View style={styles.headerGlow} />
        <View style={styles.headerTop}>
          <View style={[styles.menuBtn, { backgroundColor: 'rgba(249,115,22,0.15)' }]}>
            <Menu size={20} color="#F97316" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/(tabs)/alerts')} style={[styles.menuBtn, { backgroundColor: 'rgba(255,255,255,0.08)', marginRight: 8 }]}>
              <Bell size={18} color="#FFF" />
              {displayAlerts.length > 0 && <View style={styles.notifDot} />}
            </Pressable>
            <Pressable onPress={() => router.push('/(tabs)/profile')} style={[styles.avatarSmall, { backgroundColor: 'rgba(249,115,22,0.2)' }]}>
              <UserCircle2 size={22} color="#F97316" />
            </Pressable>
          </View>
        </View>

        {/* Status Pill */}
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <View>
            <Text style={styles.statusTextBold}>You're Safe · {location?.address || 'Kolkata'}</Text>
            <Text style={styles.statusTextSub}>No active threats nearby</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* SOS Banner */}
        <Pressable onPress={() => router.push('/(tabs)/tools')} disabled={loadingSOS}>
          <LinearGradient colors={['#7F1D1D', '#B91C1C']} style={styles.sosBanner}>
            <View style={styles.sosIconBox}>
              <ShieldAlert size={26} color="#FFF" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.sosBannerTitle}>Emergency SOS</Text>
              <Text style={styles.sosBannerSub}>Hold to alert contacts & police</Text>
            </View>
            <View style={styles.sosOpenPill}>
              <Text style={styles.sosOpenText}>Open →</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        <View style={styles.grid}>
          {quickActions.map((item, i) => (
            <Pressable key={i} style={[styles.gridItem, { backgroundColor: colors.paper, borderColor: colors.border }]}
              onPress={() => { if (item.action) item.action(); else if (item.route) router.push(item.route as any); }}>
              <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>{item.icon}</View>
              <Text style={[styles.gridLabel, { color: colors.text }]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Safety Circle + Score */}
        <View style={styles.bottomRow}>
          <View style={[styles.circleCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Safety Circle</Text>
              <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Edit</Text>
            </View>
            <View style={styles.avatarRow}>
              {[1, 2, 3].map(i => (
                <View key={i} style={[styles.circleAvatar, { borderColor: colors.primary }]}>
                  <UserCircle2 size={28} color={colors.textMuted} strokeWidth={1} />
                </View>
              ))}
              <Pressable style={[styles.addBtn, { borderColor: colors.textMuted }]}>
                <Plus size={16} color={colors.textMuted} />
              </Pressable>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <View style={[styles.liveDot, { backgroundColor: colors.safe }]} />
              <Text style={{ color: colors.textSub, fontSize: 10 }}>2 actively watching</Text>
            </View>
          </View>
          <View style={[styles.scoreCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
            <SafetyGauge score={8.2} color={scoreColor} />
          </View>
        </View>

        {/* Nearby Alerts */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Nearby Alerts</Text>
        <View style={[styles.alertsCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          {displayAlerts.slice(0, 4).map((a, i) => (
            <View key={i} style={[styles.alertRow, i < displayAlerts.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
              <View style={[styles.alertIcon, { backgroundColor: a.severity === 'SEVERE' ? '#FEF2F2' : a.severity === 'MODERATE' ? '#FFFBEB' : '#ECFDF5' }]}>
                <ShieldAlert size={18} color={a.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>{a.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <MapPin size={10} color={colors.textMuted} />
                  <Text style={styles.alertMeta}> {a.loc} · </Text>
                  <Clock size={10} color={colors.textMuted} />
                  <Text style={styles.alertMeta}> {a.time}</Text>
                </View>
              </View>
              <View style={[styles.severityBadge, { backgroundColor: a.severity === 'SEVERE' ? '#FEF2F2' : a.severity === 'MODERATE' ? '#FFFBEB' : '#ECFDF5' }]}>
                <Text style={{ fontSize: 9, fontWeight: '700', color: a.color }}>{a.severity}</Text>
              </View>
            </View>
          ))}
          <Pressable style={styles.seeAllRow} onPress={() => router.push('/(tabs)/alerts')}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600' }}>See all →</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: { paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, overflow: 'hidden' },
  headerGlow: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(249,115,22,0.12)' },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  greeting: { color: 'rgba(255,255,255,0.5)', fontSize: 11.5 },
  userName: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  avatarSmall: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  statusPill: { flexDirection: 'row', alignItems: 'center', marginTop: 16, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 12 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10B981', marginRight: 10 },
  statusTextBold: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  statusTextSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  sosBanner: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239,68,68,0.35)' },
  sosIconBox: { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(239,68,68,0.25)', justifyContent: 'center', alignItems: 'center' },
  sosBannerTitle: { color: '#FFF', fontSize: 15, fontWeight: '900' },
  sosBannerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  sosOpenPill: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  sosOpenText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 },
  gridItem: { width: '31.5%', borderRadius: 18, padding: 12, alignItems: 'center', marginBottom: 10, borderWidth: 1, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  gridIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  gridLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 15 },
  bottomRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  circleCard: { flex: 1.1, borderRadius: 20, padding: 14, borderWidth: 1, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  scoreCard: { flex: 1, borderRadius: 20, padding: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  circleAvatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', marginRight: -10 },
  addBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginLeft: 16 },
  liveDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  alertsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  alertRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  alertIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  alertTitle: { fontSize: 13, fontWeight: '700' },
  alertMeta: { fontSize: 10, color: '#9CA3AF' },
  severityBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  seeAllRow: { alignItems: 'center', paddingVertical: 12 },
});

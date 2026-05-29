import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, User, Bell, Lock, Mic, Users, Camera, MapPin, Globe, LogOut, Sun, Moon, ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabase';

const MiniGauge = ({ score, color }: { score: number; color: string }) => {
  const r = 45, sw = 8, cx = 55, cy = 55;
  const startAngle = -210, sweepAngle = 240;
  const toRad = (a: number) => (a * Math.PI) / 180;
  const arcPath = (start: number, sweep: number) => {
    const s = toRad(start), e = toRad(start + sweep);
    const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
    const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
    return `M ${x1} ${y1} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };
  return (
    <Svg width={110} height={80} viewBox="0 0 110 90">
      <Path d={arcPath(startAngle, sweepAngle)} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      <Path d={arcPath(startAngle, (score / 10) * sweepAngle)} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
      <SvgText x={cx} y={cx - 5} fontSize="20" fontWeight="900" fill={color} textAnchor="middle">{score.toFixed(1)}</SvgText>
      <SvgText x={cx} y={cx + 10} fontSize="8" fill="#9CA3AF" textAnchor="middle">/10</SvgText>
    </Svg>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [sosCount, setSosCount] = useState(0);
  const [alertCount, setAlertCount] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const { data: sos } = await supabase.from('sos_events').select('id').eq('user_id', user.id);
        if (sos) setSosCount(sos.length);
        const { data: al } = await supabase.from('alerts').select('id').eq('user_id', user.id);
        if (al) setAlertCount(al.length);
      } catch (e) {}
    };
    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.replace('/auth/login');
  };

  const displayName = user?.full_name || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'user@streetsafe.app';

  const stats = [
    { label: 'Safe Trips', value: '24' },
    { label: 'Reports', value: String(alertCount) },
    { label: 'SOS Used', value: String(sosCount) },
    { label: 'Badges', value: '5' },
  ];

  const achievements = ['🛡️ Guardian', '📍 Reporter', '⚡ Responder', '🌟 Star'];

  const progressBars = [
    { label: 'Incident-free trips', pct: 92, color: '#10B981' },
    { label: 'Avg route safety', pct: 78, color: '#F59E0B' },
    { label: 'Reports verified', pct: 85, color: '#3B82F6' },
  ];

  const settings = [
    { title: 'Notifications', subtitle: 'Manage alerts', icon: Bell, color: '#F97316' },
    { title: 'Privacy Settings', subtitle: 'Data & permissions', icon: Lock, color: '#8B5CF6' },
    { title: 'Voice Activation', subtitle: '"সুরক্ষা" keyword', icon: Mic, color: '#EF4444' },
    { title: 'Safety Circle', subtitle: 'Manage contacts', icon: Users, color: '#10B981' },
    { title: 'Silent Alert Mode', subtitle: 'Covert notification', icon: Camera, color: '#F59E0B' },
    { title: 'Safe Zone History', subtitle: 'Past locations', icon: MapPin, color: '#3B82F6' },
    { title: 'Language', subtitle: 'English + বাংলা', icon: Globe, color: '#6B7280' },
    { title: 'Sign Out', subtitle: 'Log out of account', icon: LogOut, color: '#EF4444', action: handleSignOut },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient colors={['#0F0A00', '#1C0E00', '#2D1500']} style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <ArrowLeft size={20} color="#FFF" />
          </Pressable>
          <Pressable onPress={toggleTheme}>
            {isDark ? <Sun size={20} color="#F97316" /> : <Moon size={20} color="#F97316" />}
          </Pressable>
        </View>
        <View style={styles.profileCenter}>
          <LinearGradient colors={['#F97316', '#EA580C']} style={styles.avatar}>
            <User size={32} color="#FFF" />
          </LinearGradient>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{displayEmail} · Kolkata</Text>
          <View style={styles.badgeRow}>
            <View style={styles.glassBadge}><Text style={styles.badgeText}>🛡️ Guardian</Text></View>
            <View style={styles.glassBadge}><Text style={styles.badgeText}>⭐ 87 pts</Text></View>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: colors.primary }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Safety Score */}
        <View style={[styles.scoreRow, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          <MiniGauge score={8.2} color="#10B981" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            {progressBars.map((p, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 10, color: colors.textSub }}>{p.label}</Text>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: p.color }}>{p.pct}%</Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                  <View style={[styles.barFill, { width: `${p.pct}%`, backgroundColor: p.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Achievements</Text>
        <View style={styles.achieveGrid}>
          {achievements.map((a, i) => (
            <View key={i} style={[styles.achieveItem, { backgroundColor: colors.paperAlt }]}>
              <Text style={{ fontSize: 22 }}>{a.split(' ')[0]}</Text>
              <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '600', marginTop: 4 }}>{a.split(' ')[1]}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <View style={[styles.settingsCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>
          {settings.map((s, i) => {
            const Icon = s.icon;
            return (
              <Pressable key={i} style={[styles.settingRow, i < settings.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}
                onPress={s.action || (() => {})}>
                <View style={[styles.settingIcon, { backgroundColor: `${s.color}14` }]}>
                  <Icon size={16} color={s.color} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{s.title}</Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>{s.subtitle}</Text>
                </View>
                <ChevronRight size={16} color={colors.textMuted} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: Platform.OS === 'ios' ? 54 : 34, paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  profileCenter: { alignItems: 'center' },
  avatar: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)' },
  profileName: { color: '#FFF', fontSize: 21, fontWeight: '900', marginTop: 12 },
  profileEmail: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 },
  badgeRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  glassBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  scroll: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 12, borderWidth: 1, alignItems: 'center', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 9.5, marginTop: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, padding: 16, borderWidth: 1, marginBottom: 16, shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  barTrack: { height: 4, borderRadius: 2, marginTop: 4 },
  barFill: { height: '100%', borderRadius: 2 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  achieveItem: { width: '23%', borderRadius: 14, padding: 10, alignItems: 'center' },
  settingsCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  settingIcon: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingTitle: { fontSize: 13, fontWeight: '700' },
});

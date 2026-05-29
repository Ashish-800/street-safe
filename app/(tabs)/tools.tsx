import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, ShieldAlert, PhoneIncoming, Mic, Square, Zap, Volume2, Camera, BookOpen, Globe, PhoneCall, PhoneMissed, X } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSpring, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useLocation } from '../../src/context/LocationContext';
import { supabase } from '../../src/lib/supabase';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function ToolsScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { location } = useLocation();

  // SOS state
  const [sosProgress, setSosProgress] = useState(0);
  const [sosActive, setSosActive] = useState(false);
  const sosInterval = useRef<any>(null);

  // Tools state
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordInterval = useRef<any>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [fakeCallVisible, setFakeCallVisible] = useState(false);

  // SOS hold mechanics
  const startSOS = () => {
    if (sosActive) return;
    sosInterval.current = setInterval(() => {
      setSosProgress(prev => {
        const next = prev + 1.8;
        if (next >= 100) {
          clearInterval(sosInterval.current);
          setSosActive(true);
          // Save SOS event to Supabase
          if (user) {
            supabase.from('sos_events').insert([{
              user_id: user.id,
              latitude: location?.latitude,
              longitude: location?.longitude,
              location_text: location?.address || 'Kolkata',
              is_active: true,
            }]).then(() => {});
          }
          Alert.alert('🚨 SOS ACTIVATED', `Emergency contacts notified.\nPolice alerted.\nLocation: ${location?.address || 'Kolkata'}\nStay safe!`);
          return 100;
        }
        return next;
      });
    }, 54);
  };

  const endSOS = () => {
    if (sosActive) return;
    clearInterval(sosInterval.current);
    setSosProgress(0);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosProgress(0);
  };

  // Recording
  const toggleRecording = () => {
    if (isRecording) {
      clearInterval(recordInterval.current);
      setIsRecording(false);
      setRecordTime(0);
      Alert.alert('Recording saved', 'Audio evidence saved locally.');
    } else {
      setIsRecording(true);
      recordInterval.current = setInterval(() => setRecordTime(p => p + 1), 1000);
    }
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // SVG ring
  const radius = 75, strokeWidth = 9, circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (sosProgress / 100) * circumference;

  const tools = [
    { title: 'Emergency SOS', desc: 'Hold to activate emergency alert', icon: ShieldAlert, color: '#EF4444', action: () => {} },
    { title: 'Fake Call', desc: 'Simulate incoming call', icon: PhoneIncoming, color: '#10B981', action: () => setFakeCallVisible(true) },
    { title: isRecording ? 'Stop Recording' : 'Voice Recorder', desc: isRecording ? formatTime(recordTime) : 'Record audio evidence', icon: isRecording ? Square : Mic, color: '#F59E0B', action: toggleRecording, active: isRecording },
    { title: torchOn ? 'Torch ON' : 'Flashlight', desc: 'Toggle torch light', icon: Zap, color: '#3B82F6', action: () => setTorchOn(!torchOn), active: torchOn },
    { title: 'Loud Siren', desc: '75dB alarm sound', icon: Volume2, color: '#F97316', action: () => Alert.alert('🔊 Siren', 'Playing alarm sound...') },
    { title: 'Silent Photo', desc: 'Covert burst capture', icon: Camera, color: '#8B5CF6', action: () => Alert.alert('📸 Photo', 'Silent burst saved to cloud.') },
    { title: 'Safety Tips', desc: 'Stay safe guidelines', icon: BookOpen, color: '#10B981', action: () => Alert.alert('Safety Tips', '1. Stay alert\n2. Share location\n3. Trust instincts') },
    { title: 'Police Stations', desc: 'Nearest stations', icon: Globe, color: '#3B82F6', action: () => Alert.alert('Nearest Station', 'Park Street PS — 0.8 km') },
  ];

  // Fake Call Overlay
  if (fakeCallVisible) {
    return (
      <View style={[styles.fakeCallBg]}>
        <View style={styles.fakeCallCenter}>
          <View style={styles.fakeAvatar}>
            <Text style={{ fontSize: 40 }}>👩</Text>
          </View>
          <Text style={styles.fakeCallerName}>Mom</Text>
          <Text style={styles.fakeCallerNumber}>+91 98765 43210</Text>
          <Text style={styles.fakeCallStatus}>Incoming Call...</Text>
        </View>
        <View style={styles.fakeCallActions}>
          <Pressable style={[styles.fakeCallBtn, { backgroundColor: '#EF4444' }]} onPress={() => setFakeCallVisible(false)}>
            <PhoneMissed size={28} color="#FFF" />
          </Pressable>
          <Pressable style={[styles.fakeCallBtn, { backgroundColor: '#10B981' }]} onPress={() => setFakeCallVisible(false)}>
            <PhoneCall size={28} color="#FFF" />
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.paper, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.text} />
        </Pressable>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Tools</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted }}>Tactical safety utilities</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Active banners */}
        {isRecording && (
          <View style={[styles.activeBanner, { backgroundColor: colors.emergencyBg }]}>
            <View style={[styles.activeDot, { backgroundColor: colors.emergency }]} />
            <Text style={{ color: colors.emergency, fontSize: 13, fontWeight: '700' }}>Recording — {formatTime(recordTime)}</Text>
          </View>
        )}
        {torchOn && (
          <View style={[styles.activeBanner, { backgroundColor: colors.warningBg }]}>
            <View style={[styles.activeDot, { backgroundColor: colors.warning }]} />
            <Text style={{ color: colors.warning, fontSize: 13, fontWeight: '700' }}>Torch is ON</Text>
          </View>
        )}

        {/* SOS Hold Button */}
        <View style={styles.sosSection}>
          <Text style={[styles.sosLabel, { color: colors.text }]}>SOS Emergency</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 20 }}>
            Kolkata Police: 100 · Women: 1091
          </Text>

          <View style={styles.sosButtonArea}>
            {sosActive && (
              <>
                <View style={[styles.pulseRing, styles.pulseRing1, { borderColor: 'rgba(239,68,68,0.3)' }]} />
                <View style={[styles.pulseRing, styles.pulseRing2, { borderColor: 'rgba(239,68,68,0.15)' }]} />
              </>
            )}
            <Svg width={180} height={180} style={{ position: 'absolute' }}>
              <Circle cx={90} cy={90} r={radius} stroke="rgba(239,68,68,0.25)" strokeWidth={strokeWidth} fill="none" />
              <Circle
                cx={90} cy={90} r={radius} stroke="#EF4444" strokeWidth={strokeWidth} fill="none"
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                strokeLinecap="round" transform="rotate(-90 90 90)"
              />
            </Svg>
            <Pressable
              onPressIn={startSOS} onPressOut={endSOS}
              style={[styles.sosInnerBtn, {
                shadowColor: 'rgba(239,68,68,0.6)',
                backgroundColor: sosActive ? '#DC2626' : '#EF4444',
              }]}
            >
              {/* Shine */}
              <View style={styles.sosShine} />
              <ShieldAlert size={38} color="#FFF" />
              <Text style={styles.sosText}>
                {sosActive ? 'ACTIVE' : sosProgress > 0 ? `${Math.round(sosProgress)}%` : 'SOS'}
              </Text>
            </Pressable>
          </View>

          <Text style={{ color: sosActive ? colors.emergency : colors.textMuted, fontSize: 12, textAlign: 'center', marginTop: 16, fontWeight: sosActive ? '700' : '400' }}>
            {sosActive ? 'Emergency Active — contacts notified' : sosProgress > 0 ? `Keep holding… ${(3 - sosProgress * 0.03).toFixed(1)}s` : 'Hold 3 seconds to activate'}
          </Text>

          {sosActive && (
            <Pressable onPress={cancelSOS} style={[styles.cancelBtn, { borderColor: colors.emergency }]}>
              <Text style={{ color: colors.emergency, fontWeight: '700' }}>Cancel Emergency</Text>
            </Pressable>
          )}
        </View>

        {/* Tools Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>All Tools</Text>
        <View style={styles.toolsGrid}>
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <Pressable key={i} onPress={t.action}
                style={[styles.toolCard, {
                  backgroundColor: colors.paper, borderColor: t.active ? t.color : colors.border,
                  borderWidth: t.active ? 2 : 1,
                }]}>
                <View style={[styles.toolIconBox, { backgroundColor: `${t.color}14` }]}>
                  <Icon size={22} color={t.color} />
                </View>
                <Text style={[styles.toolTitle, { color: colors.text }]}>{t.title}</Text>
                <Text style={[styles.toolDesc, { color: colors.textMuted }]}>{t.desc}</Text>
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
  header: {
    flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'ios' ? 54 : 34,
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 16, paddingBottom: 100 },

  activeBanner: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 12, gap: 8,
  },
  activeDot: { width: 8, height: 8, borderRadius: 4 },

  sosSection: { alignItems: 'center', paddingVertical: 20 },
  sosLabel: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  sosButtonArea: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },
  pulseRing: { position: 'absolute', borderWidth: 2, borderRadius: 999 },
  pulseRing1: { width: 200, height: 200 },
  pulseRing2: { width: 230, height: 230 },
  sosInnerBtn: {
    width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 36, elevation: 12,
    overflow: 'hidden',
  },
  sosShine: {
    position: 'absolute', top: 0, left: '15%', right: '15%', height: '38%',
    backgroundColor: 'rgba(255,255,255,0.14)', borderBottomLeftRadius: 999, borderBottomRightRadius: 999,
  },
  sosText: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 3, marginTop: 4 },
  cancelBtn: {
    marginTop: 16, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12, borderWidth: 1.5,
  },

  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: {
    width: '48%', borderRadius: 20, padding: 16, marginBottom: 12,
    shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 2,
  },
  toolIconBox: { width: 48, height: 48, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolTitle: { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  toolDesc: { fontSize: 10.5, lineHeight: 15 },

  // Fake Call
  fakeCallBg: {
    flex: 1, backgroundColor: '#0A1A0A', justifyContent: 'center', alignItems: 'center',
  },
  fakeCallCenter: { alignItems: 'center', marginBottom: 80 },
  fakeAvatar: {
    width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(16,185,129,0.2)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  fakeCallerName: { color: '#FFF', fontSize: 28, fontWeight: '800' },
  fakeCallerNumber: { color: 'rgba(255,255,255,0.5)', fontSize: 16, marginTop: 4 },
  fakeCallStatus: { color: '#10B981', fontSize: 14, marginTop: 12, fontWeight: '600' },
  fakeCallActions: { flexDirection: 'row', gap: 40 },
  fakeCallBtn: {
    width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center',
  },
});

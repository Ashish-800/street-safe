import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Menu, Navigation, ShieldAlert, Phone, Users, Footprints, Video, Plus, UserCircle2 } from 'lucide-react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { supabase } from '../../src/lib/supabase';

// Helper for the SVG semi-circle gauge
const SemiCircleGauge = ({ score, color }: { score: number, color: string }) => {
  const radius = 60;
  const strokeWidth = 12;
  const center = radius + strokeWidth;
  // Calculate arc path
  const d = `M ${strokeWidth} ${center} A ${radius} ${radius} 0 0 1 ${center * 2 - strokeWidth} ${center}`;
  
  // Dash array for fill
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <View style={styles.gaugeContainer}>
      <Svg width={center * 2} height={center + 10}>
        <Path d={d} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} strokeLinecap="round" />
        <Path 
          d={d} 
          fill="none" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeLinecap="round" 
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
        <SvgText x={center} y={center - 15} fontSize="28" fontWeight="bold" fill={color} textAnchor="middle">
          {score.toFixed(1)}<SvgText fontSize="12" fill="#9CA3AF">/10</SvgText>
        </SvgText>
        <SvgText x={center} y={center + 5} fontSize="14" fontWeight="bold" fill="#1F2937" textAnchor="middle">
          Good
        </SvgText>
      </Svg>
    </View>
  );
};

export default function HomeDashboard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [loadingSOS, setLoadingSOS] = useState(false);

  const handleSOS = async () => {
    setLoadingSOS(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Not Authenticated', 'Please log in to send SOS.');
        router.push('/auth/login');
        return;
      }
      
      const { error } = await supabase.from('alerts').insert([
        { user_id: user.id, type: 'EMERGENCY_SOS', location: 'Lat: 22.57, Lng: 88.36', active: true }
      ]);
      
      if (error) throw error;
      Alert.alert('SOS Sent!', 'Your emergency contacts and nearby authorities have been alerted.');
    } catch (error: any) {
      Alert.alert('Error sending SOS', error.message);
    } finally {
      setLoadingSOS(false);
    }
  };

  const gridItems = [
    { title: 'Share My Location', icon: <Navigation size={28} color="#4F46E5" />, route: '/route' },
    { title: 'Emergency SOS', icon: <ShieldAlert size={28} color="#DC2626" />, action: handleSOS },
    { title: 'Call Police', icon: <Phone size={28} color="#059669" />, action: () => Alert.alert('Calling 100...') },
    { title: 'Alert Nearby People', icon: <Users size={28} color="#7C3AED" />, route: '/alerts' },
    { title: 'Safe Walk Mode', icon: <Footprints size={28} color="#0284C7" />, route: '/route' },
    { title: 'Record Incident', icon: <Video size={28} color="#D946EF" />, route: '/tools' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Menu size={24} color={colors.text.primary} />
        <View style={styles.headerTitleRow}>
          <ShieldAlert size={20} color={colors.primary.base} />
          <View style={{ marginLeft: 8 }}>
            <Text style={[styles.headerTitle, { color: colors.primary.base }]}>Surakshit</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Together We Protect</Text>
          </View>
        </View>
        <Bell size={24} color={colors.text.primary} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Quick SOS Banner */}
        <Pressable 
          style={[styles.sosBanner, { backgroundColor: colors.primary.base, shadowColor: colors.primary.base }]}
          onPress={handleSOS}
          disabled={loadingSOS}
        >
          <View style={styles.sosBannerLeft}>
            <Bell size={32} color={colors.text.inverse} style={{marginRight: 12}} />
            <View>
              <Text style={[styles.sosBannerTitle, { color: colors.text.inverse }]}>QUICK SOS</Text>
              <Text style={[styles.sosBannerSub, { color: 'rgba(255,255,255,0.8)' }]}>
                {loadingSOS ? 'Sending alert...' : 'Tap to alert your contacts & police'}
              </Text>
            </View>
          </View>
          <Text style={{color: colors.text.inverse, fontSize: 24}}>{'>'}</Text>
        </Pressable>

        {/* Action Grid */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>WHAT DO YOU WANT TO DO?</Text>
        <View style={styles.grid}>
          {gridItems.map((item, idx) => (
            <Pressable 
              key={idx} 
              style={[styles.gridItem, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}
              onPress={() => {
                if (item.action) item.action();
                else if (item.route) router.push(item.route as any);
              }}
            >
              <View style={styles.gridIconWrapper}>
                {item.icon}
              </View>
              <Text style={[styles.gridItemText, { color: colors.text.primary }]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>

        {/* Safety Circle */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>MY SAFETY CIRCLE</Text>
        <View style={[styles.circleCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <View style={styles.circleRow}>
            {[1, 2, 3, 4].map((i) => (
              <View key={i} style={[styles.avatarWrapper, { borderColor: colors.secondary.base }]}>
                <UserCircle2 size={40} color={colors.text.tertiary} strokeWidth={1} />
              </View>
            ))}
            <Pressable style={[styles.addAvatar, { borderColor: colors.text.tertiary }]}>
              <Plus size={24} color={colors.text.tertiary} />
            </Pressable>
          </View>
          <Text style={[styles.circleText, { color: colors.text.secondary }]}>4 contacts added</Text>
        </View>

        {/* Safety Score */}
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>SAFETY SCORE</Text>
        <View style={[styles.scoreCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <SemiCircleGauge score={8.2} color={colors.primary.base} />
          <Text style={[styles.scoreSub, { color: colors.text.secondary }]}>You're doing great!</Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 100,
  },
  sosBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    elevation: 8,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sosBannerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  sosBannerSub: {
    fontSize: typography.sizes.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.md,
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  gridItem: {
    width: '31%',
    aspectRatio: 0.9,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  gridIconWrapper: {
    marginBottom: spacing.sm,
  },
  gridItemText: {
    fontSize: 10,
    fontWeight: typography.weights.semibold,
    textAlign: 'center',
  },
  circleCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  circleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginRight: -10, // overlap effect
  },
  addAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.lg,
  },
  circleText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  scoreCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  gaugeContainer: {
    alignItems: 'center',
  },
  scoreSub: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../src/lib/supabase';

export default function SplashScreen() {
  const router = useRouter();

  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    barWidth.value = withTiming(70, { duration: 2400, easing: Easing.out(Easing.quad) });

    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 2800));
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      } catch (err) {
        router.replace('/auth/login');
      }
    };
    checkAuth();
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const barStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value}%`,
  }));

  return (
    <LinearGradient colors={['#0F0A00', '#1A0E00', '#2D1500']} style={styles.container}>
      {/* Center glow */}
      <View style={styles.glow} />

      <Animated.View style={[styles.content, logoStyle]}>
        {/* Pulsing outer rings */}
        <View style={[styles.ring, styles.ringOuter]} />
        <View style={[styles.ring, styles.ringMid]} />
        <View style={[styles.ring, styles.ringInner]} />

        {/* Logo icon */}
        <LinearGradient colors={['#F97316', '#EA580C']} style={styles.iconBox}>
          <ShieldCheck size={32} color="#FFFFFF" strokeWidth={2} />
        </LinearGradient>

        <Text style={styles.title}>StreetSafe</Text>
        <Text style={styles.subtitle}>WOMEN'S SAFETY · KOLKATA</Text>
        <Text style={styles.tagline}>Safer streets, smarter journeys</Text>
      </Animated.View>

      {/* Loading bar */}
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, barStyle]}>
          <LinearGradient
            colors={['#F97316', '#F59E0B']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    top: '20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249,115,22,0.10)',
  },
  content: {
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.12)',
  },
  ringOuter: { width: 120, height: 120, top: -30, left: -30 },
  ringMid:   { width: 96, height: 96, top: -18, left: -18 },
  ringInner: { width: 72, height: 72, top: -6, left: -6 },
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1.5,
    textShadowColor: 'rgba(249,115,22,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginTop: 8,
  },
  tagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    marginTop: 4,
  },
  barTrack: {
    position: 'absolute',
    bottom: 80,
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
});

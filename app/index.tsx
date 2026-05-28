import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../src/theme/ThemeContext';
import { typography } from '../src/theme/typography';
import { spacing } from '../src/theme/spacing';

export default function SplashScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const logoScale = useSharedValue(0.5);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.back(1.5)) });
    logoOpacity.value = withTiming(1, { duration: 800 });

    const timer = setTimeout(() => {
      router.replace('/auth/login');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <Animated.View style={[styles.content, logoStyle]}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.primary.light }]}>
          <ShieldCheck size={64} color={colors.primary.base} strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: colors.primary.base }]}>Surakshit</Text>
        <Text style={[styles.tagline, { color: colors.text.secondary }]}>Together We Protect</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    letterSpacing: 0.5,
  },
});

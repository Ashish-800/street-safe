import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  withRepeat,
} from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { shadows } from '../theme/spacing';

interface SOSButtonProps {
  onActivate: () => void;
  size?: number;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onActivate, size = 180 }) => {
  const [isActive, setIsActive] = useState(false);
  const { colors } = useTheme();
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const pulse = useSharedValue(1);

  const startAnimation = useCallback(() => {
    scale.value = withSpring(0.95);
    progress.value = withTiming(1, { duration: 3000, easing: Easing.linear }, (finished) => {
      if (finished) {
        runOnJS(setIsActive)(true);
        runOnJS(onActivate)();
        pulse.value = withRepeat(
          withTiming(1.2, { duration: 1000 }),
          -1,
          true
        );
      }
    });
  }, [progress, scale, pulse, onActivate]);

  const stopAnimation = useCallback(() => {
    if (!isActive) {
      scale.value = withSpring(1);
      progress.value = withTiming(0, { duration: 200 });
    }
  }, [isActive, progress, scale]);

  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      borderWidth: 10,
      borderColor: colors.emergency.base,
      borderRadius: size / 2,
      position: 'absolute',
      width: size,
      height: size,
      transform: [{ scale: progress.value }],
      opacity: progress.value,
    };
  });

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const animatedPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: isActive ? pulse.value : 1 }],
      opacity: isActive ? 1 - (pulse.value - 1) : 0,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Outer pulsing ring when active */}
      <Animated.View
        style={[
          styles.pulseRing,
          { width: size * 1.5, height: size * 1.5, borderRadius: size * 0.75, backgroundColor: colors.emergency.light },
          animatedPulseStyle,
        ]}
      />
      
      {/* Progress ring when holding */}
      <Animated.View style={animatedRingStyle} />
      
      {/* Main Button */}
      <Animated.View style={[styles.buttonContainer, { width: size * 0.8, height: size * 0.8 }, animatedButtonStyle]}>
        <Pressable
          onPressIn={startAnimation}
          onPressOut={stopAnimation}
          style={[styles.button, { borderRadius: size * 0.4, backgroundColor: colors.emergency.base }]}
        >
          <Text style={styles.text}>{isActive ? 'ACTIVE' : 'SOS'}</Text>
          {!isActive && <Text style={styles.subtext}>Hold 3s</Text>}
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    ...shadows.medium,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  pulseRing: {
    position: 'absolute',
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
  },
  subtext: {
    color: '#FFFFFF',
    fontSize: typography.sizes.sm,
    opacity: 0.8,
    marginTop: 4,
  },
});

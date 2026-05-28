import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { borderRadius, spacing } from '../theme/spacing';

interface SafetyBadgeProps {
  status: 'safe' | 'warning' | 'danger';
  text: string;
}

export const SafetyBadge: React.FC<SafetyBadgeProps> = ({ status, text }) => {
  const { colors } = useTheme();

  const getColors = () => {
    switch (status) {
      case 'safe':
        return { bg: colors.safe.light, text: colors.safe.dark };
      case 'warning':
        return { bg: colors.warning.light, text: colors.warning.dark };
      case 'danger':
        return { bg: colors.emergency.light, text: colors.emergency.dark };
      default:
        return { bg: colors.primary.light, text: colors.primary.dark };
    }
  };

  const { bg, text: textColor } = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
});

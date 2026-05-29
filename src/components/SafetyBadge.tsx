import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface SafetyBadgeProps {
  score: number;
}

export const SafetyBadge = ({ score }: SafetyBadgeProps) => {
  const { colors } = useTheme();
  const badgeColor = score >= 8 ? colors.safe : score >= 6 ? colors.warning : colors.emergency;
  const Icon = score >= 8 ? ShieldCheck : ShieldAlert;

  return (
    <View style={[styles.badge, { backgroundColor: `${badgeColor}14` }]}>
      <Icon size={14} color={badgeColor} />
      <Text style={[styles.text, { color: badgeColor }]}>{score.toFixed(1)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  text: { fontSize: 12, fontWeight: '800' },
});

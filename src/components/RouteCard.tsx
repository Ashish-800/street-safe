import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface RouteCardProps {
  label: string;
  time: string;
  via: string;
  km: string;
  safety: number;
  color: string;
  selected?: boolean;
  onPress?: () => void;
  best?: boolean;
}

export const RouteCard = ({ label, time, via, km, safety, color, selected, onPress, best }: RouteCardProps) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.card, {
      backgroundColor: selected ? `${color}0D` : colors.paper,
      borderColor: selected ? color : colors.border,
      borderWidth: selected ? 2 : 1,
    }]}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
          <Text style={{ fontSize: 10, fontWeight: '800', color }}>{label}</Text>
        </View>
        {best && (
          <View style={[styles.bestBadge, { backgroundColor: colors.primary }]}>
            <Text style={{ fontSize: 8, fontWeight: '800', color: '#FFF' }}>BEST</Text>
          </View>
        )}
        <View style={{ flex: 1 }} />
        <Text style={[styles.time, { color: colors.text }]}>{time}</Text>
      </View>
      <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Via {via} · {km}</Text>
      <View style={styles.barRow}>
        <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.barFill, { width: `${safety}%`, backgroundColor: color }]} />
        </View>
        <Text style={{ fontSize: 10, fontWeight: '700', color, marginLeft: 8 }}>{safety}%</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 14, marginBottom: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  bestBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  time: { fontSize: 24, fontWeight: '900' },
  barRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  barTrack: { flex: 1, height: 6, borderRadius: 3 },
  barFill: { height: '100%', borderRadius: 3 },
});

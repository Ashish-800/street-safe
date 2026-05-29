import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MapPin, Clock, CheckCircle, AlertOctagon, AlertTriangle, ShieldCheck, Info } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface AlertCardProps {
  title: string;
  location: string;
  time: string;
  severity: 'SEVERE' | 'MODERATE' | 'SAFE' | 'INFO';
  verified?: boolean;
}

export const AlertCard = ({ title, location, time, severity, verified }: AlertCardProps) => {
  const { colors } = useTheme();

  const meta = {
    SEVERE: { icon: AlertOctagon, color: '#EF4444', bg: colors.emergencyBg },
    MODERATE: { icon: AlertTriangle, color: '#F59E0B', bg: colors.warningBg },
    SAFE: { icon: ShieldCheck, color: '#10B981', bg: colors.safeBg },
    INFO: { icon: Info, color: '#3B82F6', bg: colors.infoBg },
  }[severity];

  const Icon = meta.icon;

  return (
    <View style={[styles.card, { backgroundColor: colors.paper, borderColor: colors.border, borderLeftColor: meta.color }]}>
      <View style={[styles.iconBox, { backgroundColor: meta.bg }]}>
        <Icon size={20} color={meta.color} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.metaRow}>
          <MapPin size={10} color={colors.textMuted} />
          <Text style={styles.meta}> {location} · </Text>
          <Clock size={10} color={colors.textMuted} />
          <Text style={styles.meta}> {time}</Text>
          {verified && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 6 }}>
              <CheckCircle size={10} color="#10B981" />
              <Text style={[styles.meta, { color: '#10B981' }]}> Verified</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 18, borderWidth: 1, borderLeftWidth: 4, padding: 14, marginBottom: 10 },
  iconBox: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 13, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  meta: { fontSize: 10, color: '#9CA3AF' },
});

import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { UserCircle2, CheckCircle, Circle } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

interface ContactCardProps {
  name: string;
  phone: string;
  live?: boolean;
  selected?: boolean;
  onToggle?: () => void;
}

export const ContactCard = ({ name, phone, live, selected, onToggle }: ContactCardProps) => {
  const { colors } = useTheme();

  return (
    <Pressable onPress={onToggle} style={[styles.card, {
      backgroundColor: colors.paper, borderColor: selected ? colors.primary : colors.border,
      borderWidth: selected ? 2 : 1,
    }]}>
      <View style={[styles.avatar, { backgroundColor: selected ? colors.primaryBg : colors.paperAlt }]}>
        <UserCircle2 size={28} color={selected ? colors.primary : colors.textMuted} strokeWidth={1} />
      </View>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={[styles.name, { color: colors.text }]}>{name}</Text>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>{phone}</Text>
      </View>
      <View style={[styles.liveBadge, { backgroundColor: live ? colors.safeBg : colors.paperAlt }]}>
        <View style={[styles.dot, { backgroundColor: live ? colors.safe : colors.textMuted }]} />
        <Text style={{ fontSize: 9, fontWeight: '700', color: live ? colors.safe : colors.textMuted }}>{live ? 'Live' : 'Offline'}</Text>
      </View>
      {selected ? <CheckCircle size={22} color={colors.primary} /> : <Circle size={22} color={colors.border} />}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 4, marginRight: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

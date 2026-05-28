import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Phone, MapPin } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { borderRadius, shadows, spacing } from '../theme/spacing';

interface ContactCardProps {
  contact: {
    name: string;
    phone: string;
    status: string;
    initials: string;
    color: string;
  };
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact }) => {
  const isOnline = contact.status === 'online';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: contact.color }]}>
          <Text style={styles.avatarText}>{contact.initials}</Text>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? colors.safe.base : colors.text.tertiary }]} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{contact.name}</Text>
          <Text style={styles.phone}>{contact.phone}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Pressable style={styles.actionButton}>
          <Phone size={18} color={colors.primary.base} />
          <Text style={styles.actionText}>Call</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <MapPin size={18} color={colors.primary.base} />
          <Text style={styles.actionText}>Share</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background.paper,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.text.inverse,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.background.paper,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  phone: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border.base,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.base,
    borderRadius: borderRadius.sm,
    marginHorizontal: spacing.xs,
  },
  actionText: {
    marginLeft: spacing.sm,
    color: colors.primary.base,
    fontWeight: typography.weights.medium,
  },
});

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, UserCircle2, CheckCircle2, Circle, Navigation } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { KolkataMap } from '../../src/components/KolkataMap';

export default function LiveLocationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [isSharing, setIsSharing] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>(['1', '2']);

  const contacts = [
    { id: '1', name: 'Mom', phone: '+91 98765 43210' },
    { id: '2', name: 'Best Friend', phone: '+91 91234 56789' },
    { id: '3', name: 'Rohit', phone: '+91 98887 66554' },
  ];

  const toggleContact = (id: string) => {
    if (selectedContacts.includes(id)) {
      setSelectedContacts(selectedContacts.filter(c => c !== id));
    } else {
      setSelectedContacts([...selectedContacts, id]);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={[styles.header, { backgroundColor: colors.background.base }]}>
        <View style={styles.iconButton} />
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Live Tracking</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Map Card */}
        <View style={[styles.mapCard, { backgroundColor: colors.background.glass, borderColor: colors.border.base }]}>
          <KolkataMap showRoute={isSharing} />
          <View style={styles.mapOverlay}>
            <View style={[styles.statusBadge, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
              <View style={[styles.statusDot, isSharing ? { backgroundColor: colors.safe.base } : { backgroundColor: colors.text.tertiary }]} />
              <Text style={[styles.statusText, { color: colors.text.primary }]}>{isSharing ? 'LIVE SHARING ON' : 'OFFLINE'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.toggleCard, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>
          <View style={styles.toggleInfo}>
            <Text style={[styles.toggleTitle, { color: colors.text.primary }]}>Share Live Location</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.text.secondary }]}>Broadcast position to trusted contacts</Text>
          </View>
          <Switch
            value={isSharing}
            onValueChange={setIsSharing}
            trackColor={{ false: colors.border.strong, true: colors.primary.light }}
            thumbColor={isSharing ? colors.primary.base : '#f4f3f4'}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.tertiary }]}>ACTIVE SHARING LIST</Text>
          <Text style={[styles.sectionAction, { color: colors.primary.base }]}>MANAGE</Text>
        </View>

        <View style={styles.contactsList}>
          {contacts.map((contact) => {
            const isSelected = selectedContacts.includes(contact.id);
            return (
              <Pressable 
                key={contact.id} 
                style={[
                  styles.contactCard, 
                  { borderColor: colors.border.base, backgroundColor: colors.background.paper },
                  isSelected && { borderColor: colors.primary.base, backgroundColor: colors.primary.light },
                ]}
                onPress={() => toggleContact(contact.id)}
              >
                <View style={styles.contactPressable}>
                  <View style={styles.avatar}>
                    <UserCircle2 size={44} color={isSelected ? colors.primary.base : colors.text.tertiary} strokeWidth={1.5} />
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={[styles.contactName, { color: colors.text.primary }]}>{contact.name}</Text>
                    <Text style={[styles.contactPhone, { color: colors.text.secondary }]}>{contact.phone}</Text>
                  </View>
                  <View style={styles.checkbox}>
                    {isSelected ? (
                      <CheckCircle2 size={24} color={colors.primary.base} />
                    ) : (
                      <Circle size={24} color={colors.border.strong} />
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>

      </ScrollView>

      {/* Floating Action Area */}
      <View style={styles.floatingBottom}>
        <Pressable 
          style={[styles.actionBtn, { backgroundColor: isSharing ? colors.secondary.base : colors.primary.base }]}
          onPress={() => setIsSharing(!isSharing)}
        >
          <Navigation size={20} color={colors.text.inverse} style={{marginRight: 8}} strokeWidth={3} />
          <Text style={[styles.actionBtnText, { color: colors.text.inverse }]}>
            {isSharing ? 'STOP SHARING' : 'START SHARING'}
          </Text>
        </Pressable>
      </View>
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
    paddingHorizontal: spacing.md,
    paddingTop: 60,
    paddingBottom: spacing.md,
    zIndex: 10,
  },
  iconButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 140, 
  },
  mapCard: {
    height: 250,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1.5,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing['2xl'],
    overflow: 'hidden',
    borderWidth: 1,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  toggleSubtitle: {
    fontSize: typography.sizes.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    letterSpacing: 2,
  },
  sectionAction: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  contactsList: {
    marginBottom: spacing.md,
  },
  contactCard: {
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  avatar: {
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: typography.sizes.sm,
  },
  checkbox: {
    marginLeft: spacing.md,
  },
  floatingBottom: {
    position: 'absolute',
    bottom: 96, 
    left: spacing.xl,
    right: spacing.xl,
  },
  actionBtn: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 2,
  },
});

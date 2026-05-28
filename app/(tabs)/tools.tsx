import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { ShieldAlert, PhoneCall, Mic, Lightbulb, Info } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';

export default function EmergencyToolsScreen() {
  const { colors } = useTheme();
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
    { 
      id: '1', 
      title: 'Emergency SOS', 
      subtitle: 'Instant alert to contacts & police', 
      icon: <ShieldAlert size={28} color={colors.secondary.base} />,
      borderColor: 'rgba(244, 63, 94, 0.3)',
      iconBg: colors.secondary.light,
    },
    { 
      id: '2', 
      title: 'Fake Call', 
      subtitle: 'Pretend you are on a call', 
      icon: <PhoneCall size={28} color={colors.primary.base} />,
      borderColor: colors.border.base,
      iconBg: colors.primary.light,
    },
    { 
      id: '3', 
      title: 'Voice Recorder', 
      subtitle: 'Record audio and save', 
      icon: <Mic size={28} color={colors.primary.base} />,
      borderColor: colors.border.base,
      iconBg: colors.primary.light,
    },
    { 
      id: '4', 
      title: 'Flash Light', 
      subtitle: 'Use phone flash as light', 
      icon: <Lightbulb size={28} color={colors.primary.base} />,
      borderColor: colors.border.base,
      iconBg: colors.primary.light,
    },
    { 
      id: '5', 
      title: 'Safety Tips', 
      subtitle: 'Tips to stay safe', 
      icon: <Info size={28} color={colors.primary.base} />,
      borderColor: colors.border.base,
      iconBg: colors.primary.light,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Safety Tools</Text>
        <Text style={[styles.headerSubtitle, { color: colors.primary.base }]}>TACTICAL & EMERGENCY ACTIONS</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {tools.map((tool) => (
          <Pressable key={tool.id} style={styles.toolWrapper} onPress={() => setActiveTool(tool.id)}>
            <View style={[styles.toolCard, { borderColor: tool.borderColor, backgroundColor: colors.background.paper }]}>
              <View style={styles.toolPressable}>
                <View style={[styles.iconContainer, { backgroundColor: tool.iconBg }]}>
                  {tool.icon}
                </View>
                <View style={styles.toolInfo}>
                  <Text style={[styles.toolTitle, { color: colors.text.primary }]}>{tool.title}</Text>
                  <Text style={[styles.toolSubtitle, { color: colors.text.secondary }]}>{tool.subtitle}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: typography.weights.bold,
  },
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: 140,
  },
  toolWrapper: {
    marginBottom: spacing.lg,
  },
  toolCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  toolPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  toolSubtitle: {
    fontSize: typography.sizes.sm,
  },
});

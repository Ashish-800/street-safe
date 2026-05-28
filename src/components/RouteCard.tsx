import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Navigation, Clock } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { borderRadius, shadows, spacing } from '../theme/spacing';
import { SafetyBadge } from './SafetyBadge';

interface RouteCardProps {
  route: {
    id: string;
    name: string;
    duration: string;
    score: number;
    color: string;
    via: string;
    tags: string[];
  };
  isSelected: boolean;
  onPress: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, isSelected, onPress }) => {
  const { colors } = useTheme();

  const getStatus = (score: number) => {
    if (score >= 90) return 'safe';
    if (score >= 75) return 'warning';
    return 'danger';
  };

  const getBorderColor = () => {
    if (!isSelected) return 'transparent';
    switch (route.color) {
      case 'safe': return colors.safe.base;
      case 'warning': return colors.warning.base;
      case 'danger': return colors.emergency.base;
      default: return colors.primary.base;
    }
  };

  return (
    <Pressable 
      style={[
        styles.card, 
        isSelected && styles.cardSelected,
        { borderColor: getBorderColor(), backgroundColor: colors.background.paper }
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.name, { color: colors.text.primary }]}>{route.name}</Text>
          <Text style={[styles.via, { color: colors.text.secondary }]}>via {route.via}</Text>
        </View>
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, { color: colors.text.primary }]}>{route.score}%</Text>
          <Text style={[styles.scoreLabel, { color: colors.text.tertiary }]}>Safety</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.timeContainer}>
          <Clock size={16} color={colors.text.secondary} />
          <Text style={[styles.duration, { color: colors.text.primary }]}>{route.duration}</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border.base }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { 
                width: `${route.score}%`,
                backgroundColor: route.color === 'safe' ? colors.safe.base : 
                                 route.color === 'warning' ? colors.warning.base : 
                                 colors.primary.base 
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.tagsContainer}>
        {route.tags.map((tag, index) => (
          <SafetyBadge key={index} status={getStatus(route.score)} text={tag} />
        ))}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    ...shadows.soft,
  },
  cardSelected: {
    ...shadows.medium,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  name: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  via: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
  },
  scoreLabel: {
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
  },
  duration: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    marginLeft: spacing.xs,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});

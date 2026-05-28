import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Clock, MapPin, AlertTriangle, Info, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';
import { typography } from '../theme/typography';
import { borderRadius, shadows, spacing } from '../theme/spacing';

interface AlertCardProps {
  alert: {
    title: string;
    location: string;
    severity: string;
    timestamp: string;
    type: string;
    description: string;
  };
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert }) => {
  const { colors } = useTheme();

  const getIcon = () => {
    switch (alert.type) {
      case 'danger': return <AlertTriangle size={24} color={colors.emergency.base} />;
      case 'warning': return <AlertTriangle size={24} color={colors.warning.base} />;
      case 'safe': return <ShieldCheck size={24} color={colors.safe.base} />;
      default: return <Info size={24} color={colors.primary.base} />;
    }
  };

  const getBorderColor = () => {
    switch (alert.type) {
      case 'danger': return colors.emergency.base;
      case 'warning': return colors.warning.base;
      case 'safe': return colors.safe.base;
      default: return colors.primary.base;
    }
  };

  return (
    <View style={[styles.card, { borderLeftColor: getBorderColor(), backgroundColor: colors.background.paper }]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text.primary }]}>{alert.title}</Text>
          <View style={styles.locationRow}>
            <MapPin size={14} color={colors.text.tertiary} />
            <Text style={[styles.location, { color: colors.text.secondary }]}>{alert.location}</Text>
          </View>
        </View>
        <View style={styles.timeContainer}>
          <Clock size={12} color={colors.text.tertiary} />
          <Text style={[styles.time, { color: colors.text.tertiary }]}>{alert.timestamp}</Text>
        </View>
      </View>
      <Text style={[styles.description, { color: colors.text.secondary }]}>{alert.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 4,
    ...shadows.soft,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.sm,
    paddingTop: 2,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: typography.sizes.sm,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: typography.sizes.xs,
    marginLeft: 4,
  },
  description: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});

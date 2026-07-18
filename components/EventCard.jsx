import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { getEventStatus } from '../utils/eventStatus';

export default function EventCard({ event }) {

  const status = getEventStatus(event);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {/* time */}
        <View style={styles.timeColumn}>
          <Text style={styles.time}>{event.start_time}</Text>
          <Text style={styles.time}>{event.end_time}</Text>
        </View>

        {/* Coluna de informações */}
        <View style={styles.infoColumn}>
          <Text style={styles.title}>{event.account_name}</Text>
        </View>

        {/* Badge de status */}
        <View style={[styles.badge, { backgroundColor: status.badgeBg }]}>
          <Text style={[styles.badgeText, { color: status.badgeText }]}>
            {status.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.xs,
    marginHorizontal: SPACING.sm,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeColumn: {
    width: 50,
    marginRight: SPACING.sm,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  infoColumn: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  badge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: SPACING.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
  },
});
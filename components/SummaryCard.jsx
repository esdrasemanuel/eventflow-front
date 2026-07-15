import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SummaryCard({ value, label, valueColor }) {
  return (
    <View style={styles.cardContainer}>
      <Text style={[styles.cardValue, { color: valueColor || '#382109' }]}>
        {value}
      </Text>
      <Text style={styles.cardLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    width: 86, 
    height: 96,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    // Smooth cross-platform shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: '400',
    marginBottom: 2,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3C4043',
    textAlign: 'center',
    lineHeight: 12,
  },
});
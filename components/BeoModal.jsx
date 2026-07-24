import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';

export default function BEOImportSuccessModal({ visible, data, onClose }) {
  if (!data) return null;

  const { result } = data;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.icon}>🎉</Text>
          <Text style={styles.title}>BEO Imported & Synced!</Text>
          <Text style={styles.subtitle}>{data.message}</Text>

          {/* import summary */}
          <View style={styles.summaryBox}>
            {result.updatedEvents > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Events Updated:</Text>
                <Text style={styles.statValue}>{result.updatedEvents}</Text>
              </View>
            )}

            {result.createdEvents > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>New Events Created:</Text>
                <Text style={styles.statValue}>{result.createdEvents}</Text>
              </View>
            )}

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Activities Updated:</Text>
              <Text style={styles.statValue}>{result.updatedActivities}</Text>
            </View>

            {result.createdActivities > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>New Activities:</Text>
                <Text style={styles.statValue}>{result.createdActivities}</Text>
              </View>
            )}

            {result.unchangedActivities > 0 && (
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Unchanged Activities:</Text>
                <Text style={styles.statValue}>{result.unchangedActivities}</Text>
              </View>
            )}
          </View>

          {/* to return to home page */}
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A0D3F',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#7E8B9B',
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#475569',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  button: {
    width: '100%',
    backgroundColor: '#1A0D3F',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
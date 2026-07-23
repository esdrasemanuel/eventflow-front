import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function NotesTab({ event }) {
  // get the notes
  const operationalNotes = typeof event?.operational_notes === 'string' ? event.operational_notes.trim() : '';
  const agreementNotes = typeof event?.agreement_notes === 'string' ? event.agreement_notes.trim() : '';
  const billingInstructions = typeof event?.billing_instructions === 'string' ? event.billing_instructions.trim() : '';

  // check if is at least one note
  const hasNotes = operationalNotes || agreementNotes || billingInstructions;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>Event Notes & Instructions</Text>

      {!hasNotes ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No notes or instructions registered for this event.</Text>
        </View>
      ) : (
        <>
          {/* Operational Notes Card */}
          {operationalNotes ? (
            <View style={[styles.card, styles.operationalBorder]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📋</Text>
                <Text style={styles.cardTitle}>Operational Notes</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.contentText}>{operationalNotes}</Text>
            </View>
          ) : null}

          {/* Agreement Notes Card */}
          {agreementNotes ? (
            <View style={[styles.card, styles.agreementBorder]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>🤝</Text>
                <Text style={styles.cardTitle}>Agreement Notes</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.contentText}>{agreementNotes}</Text>
            </View>
          ) : null}

          {/* billing Instructions Card */}
          {billingInstructions ? (
            <View style={[styles.card, styles.billingBorder]}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>💳</Text>
                <Text style={styles.cardTitle}>Billing Instructions</Text>
              </View>
              <View style={styles.divider} />
              <Text style={styles.contentText}>{billingInstructions}</Text>
            </View>
          ) : null}
        </>
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  operationalBorder: {
    borderLeftColor: '#2B6CB0', 
  },
  agreementBorder: {
    borderLeftColor: '#D69E2E', 
  },
  billingBorder: {
    borderLeftColor: '#38A169',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: 10,
  },
  contentText: {
    fontSize: 13,
    color: '#4A5568',
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#7E8B9B',
    fontSize: 14,
  },
});
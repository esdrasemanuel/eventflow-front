import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function DetailsTab({ event }) {
  const bookingName = event?.booking_name || 'N/A';
  const bookingType = event?.booking_type || 'N/A';
  const accountName = event?.account_name || 'N/A';
  const contactName = event?.contact_name || 'N/A';
  const cateringManager = event?.catering_manager || 'N/A';
  const email = event?.email || '';
  const contractNumber = event?.contract_number || 'N/A';

  const handleEmailPress = () => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeader}>General Event Details</Text>

      {/* Card 1: acount and contact */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>🏢</Text>
          <Text style={styles.cardHeaderTitle}>Account & Contact</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Account Name</Text>
          <Text style={styles.value}>{accountName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Contact Name</Text>
          <Text style={styles.value}>{contactName}</Text>
        </View>

        {email ? (
          <View style={styles.row}>
            <Text style={styles.label}>Email Address</Text>
            <TouchableOpacity onPress={handleEmailPress} activeOpacity={0.7}>
              <Text style={styles.emailValue}>✉️ {email}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>Email Address</Text>
            <Text style={styles.value}>N/A</Text>
          </View>
        )}
      </View>

      {/* Card 2: event management */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>👤</Text>
          <Text style={styles.cardHeaderTitle}>Event Management</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Catering Manager</Text>
          <Text style={styles.valueHighlight}>{cateringManager}</Text>
        </View>
      </View>

      {/* Card 3: contract and booking */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardHeaderIcon}>📄</Text>
          <Text style={styles.cardHeaderTitle}>Contract & Booking</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Booking Name</Text>
          <Text style={styles.value}>{bookingName}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Booking Type</Text>
          <View style={styles.badgeType}>
            <Text style={styles.badgeTypeText}>{bookingType}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Contract Number</Text>
          <View style={styles.badgeContract}>
            <Text style={styles.badgeContractText}>#{contractNumber}</Text>
          </View>
        </View>
      </View>

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardHeaderIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
  },
  divider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: '#718096',
    fontWeight: '500',
    flex: 1,
  },
  value: {
    fontSize: 13,
    color: '#2D3748',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  valueHighlight: {
    fontSize: 13,
    color: '#2B6CB0',
    fontWeight: '700',
    flex: 1,
    textAlign: 'right',
  },
  emailValue: {
    fontSize: 13,
    color: '#437B6D',
    fontWeight: '600',
    textAlign: 'right',
    textDecorationLine: 'underline',
  },
  badgeType: {
    backgroundColor: '#E8F2F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#437B6D',
  },
  badgeContract: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeContractText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4A5568',
  },
});
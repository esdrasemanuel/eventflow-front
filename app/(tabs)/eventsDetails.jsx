import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EventTabs from '../../components/EventTabs';
export default function DetailsEventsScreen() {
  const params = useLocalSearchParams();
  const { id, eventData } = params;
  const event = params.eventData ? JSON.parse(params.eventData) : null;
const [activeTab, setActiveTab] = useState('Timeline');
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Timeline':
        return <Text style={styles.contentText}>Timeline List Content</Text>;
      case 'Setup':
        return <Text style={styles.contentText}>Setup Specification Details</Text>;
      case 'F&B':
        return <Text style={styles.contentText}>Food & Beverage Requirements</Text>;
      case 'Notes':
        return <Text style={styles.contentText}>Operational Event Notes</Text>;
      case 'Details':
        return <Text style={styles.contentText}>General Metadata Details</Text>;
      default:
        return null;
    }
  };

  useEffect(() => {
  }, [id]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header with back button and screen title */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/home')} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
          <View style={styles.metaHeader}>
        <Text style={styles.titleText}>{event.account_name}</Text>
        
        <Text style={styles.subtitleText}>{event.event_date_formated}</Text>
      </View>
      <View style={{ width: 24 }} />
      </View>

    

      {/* Insert custom top tab bar controller element */}
      <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Dynamic subview wrapper displaying selection context */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: 30,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  backIcon: {
    fontSize: 38,
  },
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  metaHeader: { padding: 16, backgroundColor: '#FFFFFF' },
  titleText: { fontSize: 22, fontWeight: '700', color: '#1A0D3F' },
  subtitleText: { fontSize: 16, color: '#7E8B9B', marginTop: 4 },
  contentContainer: { flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' },
  contentText: { fontSize: 16, color: '#333333' }
});
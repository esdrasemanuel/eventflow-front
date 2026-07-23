import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EventTabs from '../../components/EventTabs';
import SetupTab from './setupTab'; 
import FoodAndBTab from './foodAndBTab'; 
import NotesTab from './notesTab'; 
import DetailsTab from './detailsTab';
import TimelineTab from './timelineTab'; 

// activities tabs where have all event informations  
export default function DetailsEventsScreen() {
  const params = useLocalSearchParams();
  const { id, eventData, backTo, userId } = params;
  const [activeTab, setActiveTab] = useState('Timeline');

  // event param with the data
  const event = eventData ? JSON.parse(params.eventData) : null;
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'Timeline':
        return <TimelineTab event={event} userId={userId} />;
      case 'Setup':
        return <SetupTab event={event} userId={userId} />;
      case 'F&B':
        return <FoodAndBTab event={event} />;
      case 'Notes':
        return <NotesTab event={event} />;
      case 'Details':
        return <DetailsTab event={event} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => backTo === 'allEvents' ? 
        router.replace({
          pathname: '/allEvents', 
          params: { userId: userId }}) : router.replace('/home')} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.metaHeader}>
          <Text style={styles.titleText}>{event?.account_name || 'Event Title'}</Text>
          <Text style={styles.subtitleText}>{event?.event_date_formated || 'Event Date'}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <EventTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <View style={[
        styles.contentContainer, 
        (activeTab !== 'Timeline' && activeTab !== 'Setup' && activeTab !== 'F&B' && activeTab !== 'Notes' && activeTab !== 'Details') && { justifyContent: 'center', alignItems: 'center' }
      ]}>
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
  metaHeader: { 
    flex: 1,
    paddingHorizontal: 16, 
    paddingVertical: 8,
    backgroundColor: '#FFFFFF' 
  },
  titleText: { fontSize: 22, fontWeight: '700', color: '#1A0D3F' },
  subtitleText: { fontSize: 16, color: '#7E8B9B', marginTop: 4 },
  contentContainer: { 
    flex: 1, 
    backgroundColor: '#FFFFFF'
  },
});
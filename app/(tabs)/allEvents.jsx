import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from 'react-native';
import EventCard from '../../components/EventCard';
import FilterModal from '../../components/FilterModal';
import { filterAndGroupEvents, formatDateTitle } from '../../utils/eventFilters';
import { getAllEvents } from '../../services/ServiceEvents';
import { router } from 'expo-router';

export default function AllEventsScreen() {
  // State to manage the list of events fetched from the API
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [groupedEvents, setGroupedEvents] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    setGroupedEvents(filterAndGroupEvents(events, searchQuery, selectedFilter, filterStatus));
  }, [events, searchQuery, selectedFilter, filterStatus]);

  async function loadEvents() {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  }

  // Builds the quick filter tabs dynamically from the unique dates present in events
  const getFilterOptions = () => {
    const uniqueDates = [...new Set(events.map((event) => event.event_date))].sort();
    return ['All', ...uniqueDates];
  };

  return (
    <SafeAreaView style={styles.safeContainer}>

      <FilterModal
        visible={showFilterModal}
        selectedFilter={filterStatus}
        onSelect={(value) => setFilterStatus(value)}
        onClose={() => setShowFilterModal(false)}
      />

      {/* Header with back button and screen title */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.replace('/home')} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Events</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Quick filter tabs (All and per-date shortcuts) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}  contentContainerStyle={styles.filterScroll} style={{ flexGrow: 0 }}>
        {getFilterOptions().map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
              {filter === 'All' ? filter : formatDateTitle(filter)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search events..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity onPress={() => setShowFilterModal(true)}>
          <Text>⚙ Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Event sections, grouped by date */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {groupedEvents.length === 0 ? (
          <View style={styles.placeholderListCard}>
            <Text>No events found</Text>
          </View>
        ) : (
          groupedEvents.map((section) => (
            <View key={section.date} style={styles.section}>
              <Text style={styles.sectionDateTitle}>{section.title}</Text>
              {section.data.map((event) => (
                <TouchableOpacity
                    key={event.id} 
                    onPress={() => router.push({
                    pathname: '/eventsDetails',
                    params: { 
                        id: event.id, 
                        eventData: JSON.stringify(event),
                        backTo: 'allEvents'
                        }
                    })}>
                <EventCard key={event.id} event={event} />
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

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
    paddingVertical: 12,
  },
  backIcon: {
    fontSize: 38,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#468275',
  },
  filterChipText: {
    color: '#8E8E93',
    fontSize: 13,
    paddingBottom: 5

  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 12,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
  },
  sectionDateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  placeholderListCard: {
    padding: 20,
    alignItems: 'center',
  },
});
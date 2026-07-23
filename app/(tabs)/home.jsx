import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import SidebarMenu from '../../components/SidebarMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SummaryCard from '../../components/SummaryCard';
import { getEvents } from '../../services/ServiceEvents';
import { getEventStatus } from '../../utils/eventStatus';
import FilterModal from '../../components/FilterModal';
import EventCard from '../../components/EventCard';
import { router, useFocusEffect } from 'expo-router'; // Importado useFocusEffect

export default function HomeScreen() {
  // State to manage the open and close visibility of the sidebar menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');
  const [userName, setUserName] = useState('User');
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');    
    
  const [events, setEvents] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [rawOverview, setRawOverview] = useState({
    eventsToday: 0,
    inProgress: 0,
    tasks: 0,
    drinkReception: 0
  });

  // update always when user back to the home
  useFocusEffect(
    useCallback(() => {
      generateCurrentDate();
      loadUserData();
      loadEvents();
    }, [])
  );

  const generateCurrentDate = () => {
      // Formats the live date dynamically 
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const today = new Date();
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(today);
      setCurrentDate(formattedDate);
    };

  const loadUserData = async () => {
    try {
      // Reading the raw string data from AsyncStorage
      const storedUser = await AsyncStorage.getItem('@EventFlow:user');
      
      if (storedUser) {
        // Parsing the string back into a JavaScript object
        const parsedUser = JSON.parse(storedUser);
        
        // Setting state values with the logged-in user details
        setUserName(parsedUser.firstName || 'User');
        setUserRole(parsedUser.role || '');
        setUserId(parsedUser.id);
      }
    } catch (error) {
      console.error('Failed to load user data from storage:', error);
    }
  };

  const loadEvents = async () =>  {
    try {
      const data = await getEvents();
      setEvents(data.events || []);
      setRawOverview(data.overview || { eventsToday: 0, inProgress: 0, tasks: 0, drinkReception: 0 });        
    } catch (error) {
      console.error('Failed to load events:', error);
    }
  };

  // filter
  const filteredEvents = useMemo(() => {
    if (filterStatus === 'all') return events;
    return events.filter((event) => getEventStatus(event).value === filterStatus);
  }, [events, filterStatus]);

  // overview dinamic 
  const overview = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // based on the time
    const currentInProgressCount = events.filter(event => {
      try {
        if (!event.start_time || !event.end_time) return false;
        
        const [startH, startM] = event.start_time.split(':').map(Number);
        const [endH, endM] = event.end_time.split(':').map(Number);
        
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
      } catch (e) {
        return false;
      }
    }).length;

    return {
      ...rawOverview,
      eventsToday: events.length, 
      inProgress: currentInProgressCount 
    };
  }, [events, rawOverview]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      
      {/* Sidebar overlay component loaded and controled via state */}
      <SidebarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      <FilterModal
        visible={showFilterModal}
        selectedFilter={filterStatus}
        onSelect={(value) => setFilterStatus(value)}
        onClose={() => setShowFilterModal(false)}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Pink Header Block */}
        <View style={styles.headerBackground}>
          <View style={styles.headerRow}>
            <View style={styles.menuAndGreeting}>
              
              {/* Menu icon button triggering sidebar modal view to open */}
              <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>≡</Text>
              </TouchableOpacity>

              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingText}>Hi, {userName} 👋</Text>
                <Text style={styles.dateText}>{currentDate}</Text>
              </View>
            </View>
          </View>

          {/* Section Today's Overview Layout Header */}
          <Text style={styles.sectionTitleHeader}>Today's overview</Text>
          
          {/* Summary horizontal area wrapper */}
          <View style={styles.cardsSummary}>
            <SummaryCard value={overview.eventsToday} label="Events Today" valueColor="#2979FF" />
            <SummaryCard value={overview.inProgress} label="In Progress" valueColor="#00E676" />
            <SummaryCard value={overview.tasks} label="Tasks" valueColor="#3C4043" />
            <SummaryCard value={overview.drinkReception} label="Drink Reception" valueColor="#FF1744" />
          </View>
        </View>

        {/* Section Today's Events will be placed here */}
        <View style={styles.listingSection}>
          <View style={styles.listingHeaderRow}>
            <Text style={styles.sectionTitleBody}>Today's events</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Text>⚙ Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Event items listing cards will be here */}
          {filteredEvents.length === 0 ? (
            <View style={styles.placeholderListCard}>
              <Text>No Events today</Text>
            </View>
          ) : (
            filteredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                onPress={() => router.push({
                  pathname: '/activitiesDetailsTabs',
                  params: { 
                    id: event.id, 
                    eventData: JSON.stringify(event),
                    userId: userId
                  }
                })}
              >
                <EventCard event={event} />
              </TouchableOpacity>
            ))
          )}

          {/* View all button */}
          <TouchableOpacity style={styles.textContainer}
                onPress={() => router.push({
                  pathname: '/allEvents',
                  params: { 
                    userId: userId
                  }
                })} 
          >
            <Text style={styles.linkText}>View all→</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollContainer: { flexGrow: 1 },
  headerBackground: {
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  menuAndGreeting: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 36, fontWeight: 'bold', color: '#382109', marginRight: 20, paddingVertical: 6, paddingHorizontal: 4, lineHeight: 36 },
  greetingTextContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 22, fontWeight: '800', color: '#382109' },
  dateText: { fontSize: 14, color: '#757575', fontWeight: '500', marginTop: 2 },
  sectionTitleHeader: { fontSize: 16, fontWeight: '700', color: '#382109', marginBottom: 16 },
  listingSection: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  listingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleBody: { fontSize: 18, fontWeight: '700', color: '#382109' },
  placeholderListCard: { height: 120, backgroundColor: '#FFFFFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed', borderWidth: 1, borderColor: '#BCC1C6' },
  cardsSummary: { flexDirection: 'row' },
  textContainer: { marginTop: 15, alignment: 'center' },
  linkText: { color: '#2979FF', fontWeight: '600' }
});
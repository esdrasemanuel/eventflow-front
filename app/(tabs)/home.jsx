import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import SidebarMenu from '../../components/SidebarMenu';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SummaryCard from '../../components/SummaryCard';
import { getEvents } from '../../services/ServiceEvents';
import { getEventStatus } from '../../utils/eventStatus';
import FilterModal from '../../components/FilterModal';
import EventCard from '../../components/EventCard';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';

export default function HomeScreen() {
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

  useFocusEffect(
    useCallback(() => {
      generateCurrentDate();
      loadUserData();
      loadEvents();
    }, [])
  );

  const generateCurrentDate = () => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const today = new Date();
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(today);
    setCurrentDate(formattedDate);
  };

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@EventFlow:user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
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

  const filteredEvents = useMemo(() => {
    if (filterStatus === 'all') return events;
    return events.filter((event) => getEventStatus(event).value === filterStatus);
  }, [events, filterStatus]);

  const overview = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

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

  const handleNavigateToAllEvents = () => {
    router.push({
      pathname: '/allEvents',
      params: { 
        userId: userId,
        userRole: userRole
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <SidebarMenu userRole={userRole} visible={menuVisible} onClose={() => setMenuVisible(false)} />
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
              <TouchableOpacity onPress={() => setMenuVisible(true)} activeOpacity={0.7}>
                <Text style={styles.menuIcon}>≡</Text>
              </TouchableOpacity>

              <View style={styles.greetingTextContainer}>
                <Text style={styles.greetingText}>Hi, {userName} 👋</Text>
                <Text style={styles.dateText}>{currentDate}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.sectionTitleHeader}>Today's overview</Text>
          
          <View style={styles.cardsSummary}>
            <SummaryCard value={overview.eventsToday} label="Events Today" valueColor="#2979FF" />
            <SummaryCard value={overview.inProgress} label="In Progress" valueColor="#00E676" />
            <SummaryCard value={overview.tasks} label="Tasks" valueColor="#3C4043" />
            <SummaryCard value={overview.drinkReception} label="Drink Reception" valueColor="#FF1744" />
          </View>
        </View>

        {/* Section Today's Events */}
        <View style={styles.listingSection}>
          <View style={styles.listingHeaderRow}>
            <Text style={styles.sectionTitleBody}>Today's events</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(true)}>
              <Text style={styles.filterText}>⚙ Filter</Text>
            </TouchableOpacity>
          </View>

          {/* if not events today */}
          {filteredEvents.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateIcon}>📅</Text>
              <Text style={styles.emptyStateTitle}>No Events Today</Text>
              <Text style={styles.emptyStateSubtext}>
                There are no events scheduled for today. Check your upcoming schedule.
              </Text>
              
              <TouchableOpacity 
                style={styles.emptyStateButton}
                activeOpacity={0.8}
                onPress={handleNavigateToAllEvents}
              >
                <Text style={styles.emptyStateButtonText}>View Next Events  ➔</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {filteredEvents.map((event) => (
                <TouchableOpacity
                  key={event.id}
                  onPress={() => router.push({
                    pathname: '/activitiesDetailsTabs',
                    params: { 
                      id: event.id, 
                      eventData: JSON.stringify(event),
                      userId: userId,
                      userRole: userRole
                    }
                  })}
                >
                  <EventCard event={event} />
                </TouchableOpacity>
              ))}

              {/* button see all */}
              <TouchableOpacity 
                style={styles.primaryActionButton}
                activeOpacity={0.8}
                onPress={handleNavigateToAllEvents}
              >
                <Text style={styles.primaryActionButtonText}>View All Upcoming Events  ➔</Text>
              </TouchableOpacity>
            </>
          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: COLORS.backgroundLight || '#F8F9FA' },
  scrollContainer: { flexGrow: 1, paddingBottom: 24 },
  headerBackground: {
    backgroundColor: COLORS.accentPeach || '#FFCDD2',
    paddingHorizontal: SPACING.lg || 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  menuAndGreeting: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 36, fontWeight: 'bold', color: COLORS.primary || '#382109', marginRight: 20, paddingVertical: 6, paddingHorizontal: 4, lineHeight: 36 },
  greetingTextContainer: { justifyContent: 'center' },
  greetingText: { fontSize: 22, fontWeight: '800', color: COLORS.primary || '#382109' },
  dateText: { fontSize: 14, color: COLORS.textMuted || '#757575', fontWeight: '500', marginTop: 2 },
  sectionTitleHeader: { fontSize: 16, fontWeight: '700', color: COLORS.primary || '#382109', marginBottom: 16 },
  listingSection: { flex: 1, paddingHorizontal: SPACING.lg || 24, paddingTop: 24 },
  listingHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitleBody: { fontSize: 18, fontWeight: '700', color: COLORS.primary || '#382109' },
  filterText: { color: COLORS.textMuted || '#6B7280', fontWeight: '600' },
  cardsSummary: { flexDirection: 'row' },

  // --- improviment) ---
  emptyStateCard: {
    backgroundColor: COLORS.white || '#FFFFFF',
    borderRadius: 16,
    padding: SPACING.lg || 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginVertical: SPACING.sm || 8,
  },
  emptyStateIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs || 8,
  },
  emptyStateTitle: {
    fontSize: FONT_SIZES.md || 18,
    fontWeight: '700',
    color: COLORS.primary || '#382109',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: FONT_SIZES.sm || 14,
    color: COLORS.textMuted || '#6B7280',
    textAlign: 'center',
    marginBottom: SPACING.md || 16,
    paddingHorizontal: SPACING.sm || 8,
  },
  emptyStateButton: {
    backgroundColor: COLORS.secondary || '#382109',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  emptyStateButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: FONT_SIZES.sm || 14,
    fontWeight: '700',
  },

  // --- improviment---
  primaryActionButton: {
    backgroundColor: COLORS.secondary || '#468275',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  primaryActionButtonText: {
    color: COLORS.white || '#FFFFFF',
    fontSize: FONT_SIZES.sm || 14,
    fontWeight: '700',
  },
});
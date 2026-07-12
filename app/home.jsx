import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import SidebarMenu from '../components/SidebarMenu';

export default function HomeScreen() {
  // State to manage the open and close visibility of the sidebar menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    generateCurrentDate();
  }, []);

  const generateCurrentDate = () => {
      // Formats the live date dynamically 
      const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
      const today = new Date();
      const formattedDate = new Intl.DateTimeFormat('en-US', options).format(today);
      setCurrentDate(formattedDate);
    };
  return (
    <SafeAreaView style={styles.safeContainer}>
      
      {/* Sidebar overlay component loaded and controled via state */}
      <SidebarMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

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
                <Text style={styles.greetingText}>Hi, David 👋</Text>
                <Text style={styles.dateText}>{currentDate}</Text>
              </View>
            </View>
          </View>

          {/* Section Today's Overview Layout Header */}
          <Text style={styles.sectionTitleHeader}>Today's overview</Text>
          
          {/* Summary horizontal area wrapper */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.summaryScroll}>
            {/* Summary cards will be placed here in the next step */}
            <View><Text>Cards HERE</Text></View>
          </ScrollView>
        </View>

        {/* Section Today's Events will be placed here */}
        <View style={styles.listingSection}>
          <View style={styles.listingHeaderRow}>
            <Text style={styles.sectionTitleBody}>Today's events</Text>
            <TouchableOpacity>
              <Text>⚙ Filter</Text>
            </TouchableOpacity>
          </View>

          {/* Event items listing cards will be here */}
          <View style={styles.placeholderListCard}>
            <Text>Events Listed HERE</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerBackground: {
    backgroundColor: '#FFCDD2',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuAndGreeting: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#382109',
    marginRight: 20,
    paddingVertical: 6,
    paddingHorizontal: 4,
    lineHeight: 36,
  },
  greetingTextContainer: {
    justifyContent: 'center',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#382109',
  },
  dateText: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitleHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#382109',
    marginBottom: 16,
  },
  summaryScroll: {
    paddingRight: 24,
  },
  listingSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  listingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleBody: {
    fontSize: 18,
    fontWeight: '700',
    color: '#382109',
  },
  placeholderListCard: {
    height: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#BCC1C6',
  },
});
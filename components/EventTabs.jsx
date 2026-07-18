import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function EventTabs({ activeTab, setActiveTab }) {
  const tabs = ['Timeline', 'Setup', 'F&B', 'Notes', 'Details'];

  return (
    <View style={styles.container}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.8}
              style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: '100%',
    paddingHorizontal: 16,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent', // Clear default line
  },
  activeTabButton: {
    borderBottomColor: COLORS.secondary, // Muted dark teal indicator from the design line
  },
  tabText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textMuted, 
  },
  activeTabText: {
    color: COLORS.secondary, // Active green text tone matching line indicator
    fontWeight: '700',
  },
});
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import EventTabs from '../../components/EventTabs';

export default function DetailsEventsScreen() {
  const params = useLocalSearchParams();
  const { id, eventData, backTo } = params;
  
  // event param with the data
  const event = params.eventData ? JSON.parse(params.eventData) : null;
  
  // take the activities
  const realActivities = event?.activities || [];

  // created a copy
  const activities = [...realActivities];

  // check last activite
  if (realActivities.length > 0) {
    let latestActivity = realActivities[0];
    let maxMinutes = 0;

    realActivities.forEach((activity) => {
      try {
        // take the last time
        const endTimeStr = activity.end_time || "00:00";
        const [hours, minutes] = endTimeStr.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes;

        // keep the last one
        if (totalMinutes > maxMinutes) {
          maxMinutes = totalMinutes;
          latestActivity = activity;
        }
      } catch (e) {
        // Fallback 
      }
    });
    
    // 4. add the END node
    activities.push({
      ...latestActivity,
      id: `end-${latestActivity.id}`,
      time_range: latestActivity.end_time, 
      function_name: 'Event Ends', 
      isEventEndNode: true,                         
      completed: latestActivity.completed              
    });
  }
  const [activeTab, setActiveTab] = useState('Timeline');

  // take the correct icon based on the activitie
  const getActivityIcon = (activity) => {
    if (activity.isEventEndNode) return '✓';

    const name = activity.function_name?.toLowerCase() || '';
    if (name.includes('coffee') || name.includes('tea') || name.includes('break')) return '☕';
    if (name.includes('meeting') || name.includes('reuni')) return '👥';
    if (name.includes('lunch') || name.includes('almoço')) return '🍽️';
    if (name.includes('dinner') || name.includes('jantar')) return '🍽️';
    if (name.includes('drink') || name.includes('reception') || name.includes('cocktail')) return '🥂';
    return '📋'; 
  };

// set the colors and status
const getActivityStatus = (activity) => {
    // if is completed already 
    if (activity.completed) {
      return {
        text: 'completed',
        circle: '#2ecc71',
        badgeBg: '#e8f8f0',
        badgeText: '#2ecc71'
      };
    }

    try {
      // to check dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); 

      // date is only on event 
      const eventDateStr = event?.event_date || event?.date; 
      
      if (eventDateStr) {
        const eventDate = new Date(eventDateStr);
        eventDate.setHours(0, 0, 0, 0); 

        // if in future is always upcomming 
        if (eventDate > today) {
          return {
            text: 'upcoming',
            circle: '#f39c12',
            badgeBg: '#fef5e7',
            badgeText: '#f39c12'
          };
        }

        // if pass is completed
        if (eventDate < today) {
          return {
            text: 'completed',
            circle: '#2ecc71',
            badgeBg: '#e8f8f0',
            badgeText: '#2ecc71'
          };
        }
      }

      // if is today event
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // last node
      if (activity.isEventEndNode) {
        const [endH, endM] = activity.time_range.split(':').map(Number);
        const endMinutes = endH * 60 + endM;

        if (currentMinutes >= endMinutes) {
          return {
            text: 'completed',
            circle: '#2ecc71',
            badgeBg: '#e8f8f0',
            badgeText: '#2ecc71'
          };
        }
        return {
          text: 'upcoming',
          circle: '#f39c12',
          badgeBg: '#fef5e7',
          badgeText: '#f39c12'
          };
      }

      const [startStr, endStr] = activity.time_range.split(' - ');
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);

      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      if (currentMinutes > endMinutes) {
        return {
          text: 'completed',
          circle: '#2ecc71',
          badgeBg: '#e8f8f0',
          badgeText: '#2ecc71'
        };
      }

      // if is happening now
      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return {
          text: 'in progress',
          circle: '#3498db',
          badgeBg: '#eaf2f8',
          badgeText: '#3498db'
        };
      }
    } catch (e) {
      // Fallback 
    }

    // default
    return {
      text: 'upcoming',
      circle: '#f39c12',
      badgeBg: '#fef5e7',
      badgeText: '#f39c12'
    };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Timeline':
        if (activities.length === 0) {
          return (
            <View style={styles.noActivitiesContainer}>
              <Text style={styles.contentText}>No activities found for this event.</Text>
            </View>
          );
        }

        return (
          <ScrollView contentContainerStyle={styles.timelineContainer} showsVerticalScrollIndicator={false}>
            {activities.map((activity, index) => {
              const statusInfo = getActivityStatus(activity);
              const isLast = index === activities.length - 1;

              const nextActivity = activities[index + 1];
              const nextStatus = nextActivity ? getActivityStatus(nextActivity) : null;
              
              // to set the line color
              const lineBgColor = (activity.completed || statusInfo.text === 'completed') && nextStatus && nextStatus.text !== 'upcoming'
                ? '#2ecc71' // Verde
                : '#bdc3c7'; // Cinza

              return (
                <View key={activity.id || index} style={styles.activityRow}>
                  
                  {/* Circle */}
                  <View style={styles.leftColumn}>
                    <View style={[styles.circle, { backgroundColor: statusInfo.circle }]}>
                      {(activity.completed || statusInfo.text === 'completed') && (
                        <Text style={styles.checkMark}>✓</Text>
                      )}
                    </View>
                    {!isLast && <View style={[styles.verticalLine, { backgroundColor: lineBgColor }]} />}
                  </View>

                  {/* activities data rendered */}
                  <View style={styles.rightColumn}>
                    <View style={styles.contentHeader}>
                      <Text style={styles.timeText}>{activity.time_range}</Text>
                      
                      <View style={[styles.badge, { backgroundColor: statusInfo.badgeBg }]}>
                        <Text style={[styles.badgeText, { color: statusInfo.badgeText }]}>
                          {statusInfo.text}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailBox}>
                      <Text style={styles.iconStyle}>{getActivityIcon(activity)}</Text>
                      <View style={styles.textDetails}>
                        <Text style={styles.activityTitle}>{activity.function_name}</Text>
                        <Text style={styles.locationText}>{activity.room}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.divider} />
                  </View>

                </View>
              );
            })}
          </ScrollView>
        );
      case 'Setup':
        return <Text style={styles.contentText}>Setup Details here</Text>;
      case 'F&B':
        return <Text style={styles.contentText}>Food & Beverage here </Text>;
      case 'Notes':
        return <Text style={styles.contentText}>Event Notes</Text>;
      case 'Details':
        return <Text style={styles.contentText}>General Details</Text>;
      default:
        return null;
    }
  };

  useEffect(() => {
  }, [id]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => backTo === 'allEvents' ? router.replace('/allEvents') : router.replace('/home')} activeOpacity={0.7}>
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
        (activeTab !== 'Timeline' || activities.length === 0) && { justifyContent: 'center', alignItems: 'center' }
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
  contentText: { fontSize: 16, color: '#333333' },
  noActivitiesContainer: {
    padding: 24,
    alignItems: 'center',
  },
  /*  Timeline */
  timelineContainer: {
    padding: 24,
  },
  activityRow: {
    flexDirection: 'row',
    minHeight: 90,
  },
  leftColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 20,
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  checkMark: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  verticalLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 16,
    bottom: 0,
  },
  rightColumn: {
    flex: 1,
    paddingBottom: 20,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  detailBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  iconStyle: {
    fontSize: 24,
    marginRight: 12,
  },
  textDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  locationText: {
    fontSize: 13,
    color: '#95a5a6',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f2f4f4',
    marginTop: 12,
  },
});
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function TimelineTab({ event }) {
  
    // set activities 
  const rawActivities = event?.activities || event?.activities_list || [];

  // check if there are activities if not show no found
  if (!Array.isArray(rawActivities) || rawActivities.length === 0) {
    return (
      <View style={styles.noActivitiesContainer}>
        <Text style={styles.contentText}>No activities found for this event.</Text>
      </View>
    );
  }

  // data normalazition 
  const realActivities = rawActivities.map((act, index) => {
    const timeRange =
      act.time_range ||
      (act.start_time && act.end_time ? `${act.start_time} - ${act.end_time}` : act.start_time || '00:00');

    return {
      ...act,
      id: act.id ?? `act-${index}`,
      function_name: act.function_name || act.name || 'Activity',
      room: act.room || act.location || 'N/A',
      time_range: timeRange,
      end_time: act.end_time || (timeRange.includes(' - ') ? timeRange.split(' - ')[1] : '00:00'),
    };
  });

  const activities = [...realActivities];

  // add final node in the end
  if (realActivities.length > 0) {
    let latestActivity = realActivities[0];
    let maxMinutes = -1;

    realActivities.forEach((activity) => {
      try {
        const endTimeStr = activity.end_time || '00:00';
        const [hours, minutes] = endTimeStr.split(':').map(Number);
        const totalMinutes = (hours || 0) * 60 + (minutes || 0);

        if (totalMinutes > maxMinutes) {
          maxMinutes = totalMinutes;
          latestActivity = activity;
        }
      } catch (e) {
        // Fallback 
      }
    });

    activities.push({
      ...latestActivity,
      id: `end-${latestActivity.id}`,
      time_range: latestActivity.end_time || '00:00',
      function_name: 'Event Ends',
      isEventEndNode: true,
      completed: latestActivity.completed,
    });
  }

  // 4. creating the icons for each activitie
  const getActivityIcon = (activity) => {
    if (activity.isEventEndNode) return '✓';

    const name = (activity.function_name || '').toLowerCase();
    if (name.includes('coffee') || name.includes('tea') || name.includes('break')) return '☕';
    if (name.includes('meeting') || name.includes('reuni')) return '👥';
    if (name.includes('lunch') || name.includes('almoço')) return '🍽️';
    if (name.includes('dinner') || name.includes('jantar')) return '🍽️';
    if (name.includes('drink') || name.includes('reception') || name.includes('cocktail')) return '🥂';
    return '📋';
  };

  // creating the status based on time 
  const getActivityStatus = (activity) => {
    if (activity.completed) {
      return { text: 'completed', circle: '#2ecc71', badgeBg: '#e8f8f0', badgeText: '#2ecc71' };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDateStr = event?.event_date || event?.date;

      if (eventDateStr) {
        const eventDate = new Date(eventDateStr);
        eventDate.setHours(0, 0, 0, 0);

        if (eventDate > today) {
          return { text: 'upcoming', circle: '#f39c12', badgeBg: '#fef5e7', badgeText: '#f39c12' };
        }

        if (eventDate < today) {
          return { text: 'completed', circle: '#2ecc71', badgeBg: '#e8f8f0', badgeText: '#2ecc71' };
        }
      }

      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      if (activity.time_range && activity.time_range.includes(' - ')) {
        const [startStr, endStr] = activity.time_range.split(' - ');
        const [startH, startM] = startStr.split(':').map(Number);
        const [endH, endM] = endStr.split(':').map(Number);

        const startMinutes = (startH || 0) * 60 + (startM || 0);
        const endMinutes = (endH || 0) * 60 + (endM || 0);

        if (currentMinutes > endMinutes) {
          return { text: 'completed', circle: '#2ecc71', badgeBg: '#e8f8f0', badgeText: '#2ecc71' };
        }

        if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
          return { text: 'in progress', circle: '#3498db', badgeBg: '#eaf2f8', badgeText: '#3498db' };
        }
      }
    } catch (e) {
      // Fallback 
    }

    return { text: 'upcoming', circle: '#f39c12', badgeBg: '#fef5e7', badgeText: '#f39c12' };
  };

  return (
    <ScrollView contentContainerStyle={styles.timelineContainer} showsVerticalScrollIndicator={false}>
      {activities.map((activity, index) => {
        const statusInfo = getActivityStatus(activity);
        const isLast = index === activities.length - 1;

        const nextActivity = activities[index + 1];
        const nextStatus = nextActivity ? getActivityStatus(nextActivity) : null;

        const lineBgColor =
          (activity.completed || statusInfo.text === 'completed') && nextStatus && nextStatus.text !== 'upcoming'
            ? '#2ecc71'
            : '#bdc3c7';

        return (
          <View key={activity.id || index} style={styles.activityRow}>
            {/* Colunm view Timeline */}
            <View style={styles.leftColumn}>
              <View style={[styles.circle, { backgroundColor: statusInfo.circle }]}>
                {(activity.completed || statusInfo.text === 'completed') && (
                  <Text style={styles.checkMark}>✓</Text>
                )}
              </View>
              {!isLast && <View style={[styles.verticalLine, { backgroundColor: lineBgColor }]} />}
            </View>

            {/* card activitie content */}
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
}

const styles = StyleSheet.create({
    contentText: { 
        fontSize: 16, 
        color: '#333333' 
    },
    noActivitiesContainer: { 
        padding: 24, 
        alignItems: 'center' 
    },
    timelineContainer: { 
        padding: 24 
    },
    activityRow: { 
        flexDirection: 'row', 
        minHeight: 90 
    },
    leftColumn: { 
        alignItems: 'center', 
        marginRight: 16, 
        width: 20 
    },
    circle: { 
        width: 16, 
        height: 16, 
        borderRadius: 8, 
        justifyContent: 'center', 
        alignItems: 'center', 
        zIndex: 1 },
    checkMark: { 
        color: '#fff', 
        fontSize: 10, 
        fontWeight: 'bold' 
    },
    verticalLine: { 
        width: 2, 
        flex: 1, 
        position: 'absolute', 
        top: 16, 
        bottom: 0 
    },
    rightColumn: { 
        flex: 1, 
        paddingBottom: 20 
    },
    contentHeader: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 4 
    },
    timeText: { 
        fontSize: 14, 
        color: '#7f8c8d', 
        fontWeight: '500' 
    },
    badge: { 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 4 
    },
    badgeText: { 
        fontSize: 11, 
        fontWeight: '600', 
        textTransform: 'capitalize' 
    },
    detailBox: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginTop: 4 
    },
    iconStyle: { 
        fontSize: 24, 
        marginRight: 12 
    },
    textDetails: { 
        flex: 1 
    },
    activityTitle: { 
        fontSize: 16, 
        fontWeight: '600', 
        color: '#2c3e50' 
    },
    locationText: { 
        fontSize: 13, 
        color: '#95a5a6', 
        marginTop: 2 
    },
    divider: { 
        height: 1, 
        backgroundColor: '#f2f4f4', 
        marginTop: 12 
    },
});
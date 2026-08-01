import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import { fetchKitchenSummary } from '../../services/dinnerService';

export default function KitchenScreen() {
  const { eventId } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kitchenData, setKitchenData] = useState(null);

  const loadData = async () => {
    try {
      if (eventId) {
        const res = await fetchKitchenSummary(eventId);
        if (res.success) {
          setKitchenData(res.data);
        }
      }
    } catch (error) {
      console.error('Error loading kitchen screen data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [eventId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </SafeAreaView>
    );
  }

  const { summary, byTable, lastUpdated } = kitchenData || {};

  // Summary Section Component (Chefs View)
  const renderSummarySection = (title, total, items) => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionTotal}>{total}</Text>
      </View>
      {items?.map((item) => (
        <View key={item.id} style={styles.summaryItemCard}>
          <View style={styles.summaryItemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemQuantity}>{item.quantity}</Text>
          </View>

          {/* Highlighted Notes for Chefs */}
          {item.notesSummary && item.notesSummary.length > 0 && (
            <View style={styles.notesBox}>
              {item.notesSummary.map((note, idx) => (
                <Text key={idx} style={styles.noteTag}>
                  ⚠️ {note}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}
    </View>
  );

  // By Table Course Component 
  const renderTableCourseBlock = (courseName, items) => {
    if (!items || items.length === 0) return null;

    return (
      <View style={styles.tableCourseGroup}>
        <Text style={styles.courseBadgeTitle}>{courseName}</Text>
        {items.map((item, idx) => (
          <View key={idx} style={styles.tableCourseItemRow}>
            <Text style={styles.tableCourseItemText}>
              <Text style={styles.boldQty}>{item.quantity}x </Text>
              {item.name}
            </Text>

            {item.notes && item.notes.length > 0 && (
              <Text style={styles.tableItemNoteText}>
                Note: {item.notes.join(', ')}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar with Back Button */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Header Info */}
      <View style={styles.header}>
        <Text style={styles.eventTitle}>{summary?.name || 'Gala Dinner'}</Text>
        <Text style={styles.eventSubTitle}>
          {summary?.date ? new Date(summary.date).toLocaleDateString() : ''} {summary?.startTime ? `– ${summary.startTime}` : ''}
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'summary' && styles.tabItemActive]}
          onPress={() => setActiveTab('summary')}
        >
          <Text style={[styles.tabText, activeTab === 'summary' && styles.tabTextActive]}>
            Summary (Chefs)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'byTable' && styles.tabItemActive]}
          onPress={() => setActiveTab('byTable')}
        >
          <Text style={[styles.tabText, activeTab === 'byTable' && styles.tabTextActive]}>
            By Table (Expo)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'summary' ? (
          /* summary */
          <View style={styles.summaryContainer}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderColLeft}>Item / Notes</Text>
              <Text style={styles.tableHeaderColRight}>Total Qty</Text>
            </View>

            {renderSummarySection('Starters', summary?.totalStarters, summary?.starters)}
            {renderSummarySection('Main Course', summary?.totalMains, summary?.mains)}
            {renderSummarySection('Desserts', summary?.totalDesserts, summary?.desserts)}
          </View>
        ) : (
          /* by table */
          <View style={styles.byTableContainer}>
            {byTable?.map((table) => (
              <View key={table.id} style={styles.tableCard}>
                <View style={styles.tableCardHeader}>
                  <Text style={styles.tableCardTitle}>Table {table.tableNumber}</Text>
                  {!table.hasOrders && <Text style={styles.noOrdersBadge}>No Orders</Text>}
                </View>

                {table.hasOrders ? (
                  <View style={styles.tableCoursesContainer}>
                    {renderTableCourseBlock('Starters', table.starters)}
                    {renderTableCourseBlock('Main Course', table.mains)}
                    {renderTableCourseBlock('Desserts', table.desserts)}
                  </View>
                ) : (
                  <Text style={styles.noOrdersText}>No items placed for this table yet.</Text>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer to refresh*/}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Last updated: {lastUpdated || '--:--'}</Text>
        <TouchableOpacity onPress={onRefresh}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  loadingContainer: {
    flex: 1,
    justify: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight
  },

  // Top Bar and Back Button
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backButton: {
    paddingVertical: SPACING.xs + 2,
    paddingHorizontal: SPACING.sm + 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 6,
  },
  backButtonText: {
    fontSize: FONT_SIZES.sm - 1,
    fontWeight: '600',
    color: COLORS.textDark,
  },


  // Header Info
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
  },
  eventTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textDark
  },
  eventSubTitle: {
    fontSize: FONT_SIZES.sm - 2,
    color: COLORS.textMuted,
    marginTop: 2
  },

  // Navigation Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: COLORS.white,
    marginTop: SPACING.xs,
  },
  tabItem: {
    flex: 1,
    paddingVertical: SPACING.sm + 4,
    alignItems: 'center'
  },
  tabItemActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary
  },
  tabText: {
    fontSize: FONT_SIZES.sm - 1,
    fontWeight: '600',
    color: COLORS.textMuted
  },
  tabTextActive: {
    color: COLORS.secondary,
    fontWeight: '700'
  },

  content: {
    flex: 1,
    paddingHorizontal: SPACING.md
  },

  // Summary Styles (Chefs View)
  summaryContainer: {
    paddingBottom: SPACING.lg
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm + 4,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  tableHeaderColLeft: {
    fontSize: FONT_SIZES.sm - 2,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  tableHeaderColRight: {
    fontSize: FONT_SIZES.sm - 2,
    fontWeight: '700',
    color: COLORS.textMuted
  },
  sectionBlock: {
    marginTop: SPACING.sm + 4
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm + 2,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textDark
  },
  sectionTotal: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.secondary
  },
  summaryItemCard: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textDark,
    fontWeight: '500'
  },
  itemQuantity: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textDark
  },
  notesBox: {
    marginTop: SPACING.xs + 2,
    backgroundColor: '#FEF3C7',
    padding: SPACING.xs + 2,
    borderRadius: 6,
    gap: 2,
  },
  noteTag: {
    fontSize: FONT_SIZES.sm - 2,
    color: '#92400E',
    fontWeight: '600'
  },

  // By Table Styles 
  byTableContainer: {
    paddingVertical: SPACING.sm + 4,
    gap: SPACING.sm + 4
  },
  tableCard: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 1,
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tableCardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textDark
  },
  noOrdersBadge: {
    fontSize: FONT_SIZES.sm - 3,
    color: COLORS.textMuted,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: SPACING.xs + 2,
    paddingVertical: 2,
    borderRadius: 4
  },
  noOrdersText: {
    fontSize: FONT_SIZES.sm - 2,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginVertical: SPACING.xs
  },
  tableCoursesContainer: {
    gap: SPACING.sm + 2
  },
  tableCourseGroup: {
    backgroundColor: COLORS.backgroundLight,
    padding: SPACING.sm,
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  courseBadgeTitle: {
    fontSize: FONT_SIZES.sm - 3,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  tableCourseItemRow: {
    marginVertical: 2
  },
  tableCourseItemText: {
    fontSize: FONT_SIZES.sm - 1,
    color: COLORS.textDark
  },
  boldQty: {
    fontWeight: '700',
    color: COLORS.primary
  },
  tableItemNoteText: {
    fontSize: FONT_SIZES.sm - 3,
    color: COLORS.statusUpcoming,
    marginLeft: SPACING.sm + 4,
    fontStyle: 'italic'
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted
  },
  refreshIcon: {
    fontSize: FONT_SIZES.sm
  },
  headerRow: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backIcon: {
    fontSize: 38,
    color: COLORS.textDark,
    fontWeight: '600',
  },
});
import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useGlobalSearchParams } from 'expo-router';
import { getTrackedItemsByEvent } from '../../services/drinkTrackingService';
import AddItemModal from '../../components/AddDrinkModal'; // Importe o Modal aqui
import { COLORS } from '../../constants/theme';

// edit and delete imposrts
import EditDeleteDrinkModal from '../../components/EditDeleteDrinkModal';
import { updateTrackedItem, deleteTrackedItem } from '../../services/drinkTrackingService';

export default function DrinkTrackingScreen() {
  const params = useGlobalSearchParams();
  const eventId = params.eventId;
  const userId = params.userId;

  // parser json
  const item = params.item ? (typeof params.item === 'string' ? JSON.parse(params.item) : params.item) : null;
  const event = params.event ? (typeof params.event === 'string' ? JSON.parse(params.event) : params.event) : null;

  const barLimit = item?.barTabLimit ? Number(item.barTabLimit) : 0;
  const [isModalVisible, setIsModalVisible] = useState(false);

  // states and UI
  const [trackedItems, setTrackedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // open modal edit/delete
  const handleItemPress = (item) => {
    setSelectedItem(item);
    setIsDetailModalVisible(true);
  };

  // update qty 
  const handleUpdateQuantity = async (eventId, item, userId, newQuantity) => {
    await updateTrackedItem(eventId, item.id, userId, newQuantity);
    loadTrackingData();
  };

  // delete item
  const handleDeleteItem = async (eventId, item) => {
    await deleteTrackedItem(eventId, item.id);
    loadTrackingData();
  };

  // to get the added items
  const loadTrackingData = useCallback(async () => {
    try {
      const data = await getTrackedItemsByEvent(eventId);
      const rawItems = data.items || data;

      // group by id item to show just once a item
      const groupedMap = rawItems.reduce((acc, item) => {
        const key = item.beverageId || item.beverage_id || item.name || item.beverage?.name;

        const currentQty = Number(item.qty || item.quantity || 0);
        const currentUnitPrice = Number(item.unitPrice || item.unit_price || 0);
        const itemName = item.name || item.beverage?.name || 'Item';
        const itemImage = item.image || item.beverage?.imageUrl || 'https://via.placeholder.com/40';

        if (acc[key]) {
          // if exist just incress the qty
          acc[key].qty += currentQty;
        } else {
          // if not create  it 
          acc[key] = {
            id: String(key),
            name: itemName,
            qty: currentQty,
            unitPrice: currentUnitPrice,
            image: itemImage,
          };
        }

        return acc;
      }, {});

      // get back the formatted data
      const formattedItems = Object.values(groupedMap);

      setTrackedItems(formattedItems);
    } catch (error) {
      console.error('Error tracking:', error);
      Alert.alert('Error', 'It was not possible to transport the drinks from the event.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadTrackingData();
  }, [loadTrackingData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTrackingData();
  };

  const handleGoBack = () => {
    router.push({
      pathname: '/activitiesDetailsTabs', // got back to event details tabs
      params: {
        eventData: JSON.stringify(event),
        tab: 'F&B', // send back to exactly same tab (food and beverage)
      },
    });
  };

  // dinamic calc 
  const totalItemsCount = trackedItems.reduce((acc, item) => acc + item.qty, 0);
  const totalEstimated = trackedItems.reduce((acc, item) => acc + item.qty * item.unitPrice, 0);
  const progressPercentage = Math.min((totalEstimated / barLimit) * 100, 100);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E6D67" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2E6D67']} />
        }
      >
        {/* header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => handleGoBack()}
            activeOpacity={0.7}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{event.account_name}</Text>
        </View>

        <Text style={styles.subtitle}>{item.expected} Pax</Text>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Drink Reception track</Text>
          <Text style={styles.dateText}>{event?.event_date_formated}</Text>
        </View>

        {/* Card do Bar Limit Tap */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardLabel}>Estimated value</Text>
              <Text style={styles.cardValue}>€ {totalEstimated.toFixed(2)}</Text>
            </View>
            <View style={[styles.cardColumn, styles.borderLeft]}>
              <Text style={styles.cardLabel}>Bar Limit Tap</Text>
              <Text style={styles.cardValue}>€ {barLimit.toFixed(2)}</Text>
            </View>
          </View>

          {/* progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardFooterText}>
              rewinding € {barLimit.toFixed(2) - totalEstimated.toFixed(2)}
            </Text>
            <Text style={styles.cardFooterText}>
              {progressPercentage.toFixed(0)}% used
            </Text>
          </View>
        </View>

        {/* items table */}
        <Text style={styles.itemsTitle}>Items added</Text>

        {/* header Grid */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 2 }]}>item</Text>
          <Text style={[styles.tableHeaderText, styles.textCenter, { flex: 1 }]}>qtd</Text>
          <Text style={[styles.tableHeaderText, styles.textCenter, { flex: 1 }]}>unit price</Text>
          <Text style={[styles.tableHeaderText, styles.textRight, { flex: 1 }]}>total</Text>
        </View>

        {/* added items condition */}
        {trackedItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items added yet.</Text>
          </View>
        ) : (
          trackedItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.7}
              onPress={() => handleItemPress(item)}
            >
              <View key={item.id} style={styles.tableRow}>
                <View style={[styles.itemDetail, { flex: 2 }]}>
                  <Image source={{ uri: item.image }} style={styles.itemImage} />
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
                <Text style={[styles.tableCell, styles.textCenter, { flex: 1 }]}>
                  {item.qty}
                </Text>
                <Text style={[styles.tableCell, styles.textCenter, { flex: 1 }]}>
                  € {item.unitPrice.toFixed(2)}
                </Text>
                <Text style={[styles.tableCellBold, styles.textRight, { flex: 1 }]}>
                  € {(item.qty * item.unitPrice).toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Total  */}
        <View style={styles.totalsContainer}>
          <View>
            <Text style={styles.totalLabel}>Total items</Text>
            <Text style={styles.totalValue}>{totalItemsCount}</Text>
          </View>
          <View style={styles.alignRight}>
            <Text style={styles.totalLabel}>Total Estimated</Text>
            <Text style={styles.totalValue}>€ {totalEstimated.toFixed(2)}</Text>
          </View>
        </View>

        {/* Botton open model */}
        <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Item +</Text>
        </TouchableOpacity>

        {/* Modal Edit and Delete */}
        <EditDeleteDrinkModal
          visible={isDetailModalVisible}
          item={selectedItem}
          eventId={eventId}
          userId={userId}
          onClose={() => setIsDetailModalVisible(false)}
          onUpdateQuantity={handleUpdateQuantity}
          onDeleteItem={handleDeleteItem}
        />

        <AddItemModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          eventId={eventId}
          userId={userId}
          onItemAdded={loadTrackingData} // when added and closes load items added
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  backIcon: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E1B4B',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 36,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  card: {
    backgroundColor: COLORS.accentPeach,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardColumn: {
    flex: 1,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.4)',
    paddingLeft: 16,
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 4,
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#16A34A',
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFooterText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  itemsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  tableHeaderText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemImage: {
    width: 28,
    height: 38,
    resizeMode: 'contain',
    marginRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
  },
  tableCell: {
    fontSize: 14,
    color: '#4B5563',
  },
  tableCellBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  totalsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#6B7280',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#2E6D67',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';

export default function FnBTab({ event }) {
  // set activities in arrays
  const activities = Array.isArray(event?.activities) ? event.activities : [];

  const fnbItems = useMemo(() => {
    const rawItems = [];

    if (Array.isArray(activities)) {
      activities.forEach((act) => {
        if (!act) return;

        const timeRange = act.time_range || act.time || '';

        // to get food service
        if (act.food_services) {
          const foodList = Array.isArray(act.food_services) 
            ? act.food_services 
            : [act.food_services];

          foodList.forEach((food) => {
            if (!food) return;

            const rawFoodItems = Array.isArray(food.food_items)
              ? food.food_items
              : food.food_items
              ? [food.food_items]
              : [];

            rawItems.push({
              type: 'food',
              id: `food-${food.id || Math.random()}`,
              title: food.service_name || act.function_name || 'Food Service',
              priceInfo: food.service_price || '',
              expected: food.expected,
              items: rawFoodItems,
              timeRange: timeRange,
            });
          });
        }

        // to get beverage services
        if (act.beverage_services) {
          const bevList = Array.isArray(act.beverage_services)
            ? act.beverage_services
            : [act.beverage_services];

          bevList.forEach((bev) => {
            if (!bev) return;

            rawItems.push({
              type: 'beverage',
              id: `bev-${bev.id || Math.random()}`,
              title: bev.service_name || 'Beverage Service',
              priceInfo: typeof bev.notes === 'string' ? bev.notes : '',
              expected: bev.expected,
              barTabLimit: bev.bar_tab_limit,
              items: [],
              timeRange: timeRange,
            });
          });
        }
      });
    }

    // unique duplication
    const uniqueItems = [];
    const seenKeys = new Set();

    if (Array.isArray(rawItems)) {
      rawItems.forEach((item) => {
        if (!item) return;

        const foodItemsList = Array.isArray(item.items) ? item.items : [];
        
        const itemsSignature = foodItemsList
          .map((i) => (i && typeof i === 'object' ? i.item_name || '' : String(i)))
          .filter(Boolean)
          .join('|');

        // unique key with time to make sure its diferents services
        const uniqueKey = `${item.type}-${item.title}-${item.timeRange}-${itemsSignature}`;

        if (!seenKeys.has(uniqueKey)) {
          seenKeys.add(uniqueKey);
          uniqueItems.push(item);
        }
      });
    }

    return uniqueItems;
  }, [activities]);

  const getFnbImage = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('tea') || t.includes('coffee') || t.includes('refreshment') || t.includes('break')) {
      return require('../../assets/images/teaandcoffee.webp');
    }
    if (t.includes('drink') || t.includes('soft') || t.includes('bar') || t.includes('beverage')) {
      return require('../../assets/images/drink.jpg');
    }
    return require('../../assets/images/lunch.jpeg');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner dietaries */}
      {event?.event_dietaries ? (
        <View style={styles.dietaryContainer}>
          <Text style={styles.dietaryTitle}>⚠️ Dietaries & Allergens</Text>
          <Text style={styles.dietaryText}>{String(event.event_dietaries)}</Text>
        </View>
      ) : null}

      <Text style={styles.sectionHeader}>Food & Beverage Services</Text>

      {fnbItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No F&B details registered for this event.</Text>
        </View>
      ) : (
        fnbItems.map((item, index) => {
          if (!item) return null;

          // Beverage cards
          if (item.type === 'beverage') {
            return (
              <View key={item.id || `bev-idx-${index}`} style={styles.card}>
                <Image source={getFnbImage(item.title)} style={styles.thumbnail} />
                <View style={styles.cardContent}>
                  <View style={styles.beverageRow}>
                    <View style={styles.beverageInfo}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      
                      {item.timeRange ? (
                        <Text style={styles.timeText}>🕒 {item.timeRange}</Text>
                      ) : null}

                      {item.priceInfo ? (
                        <Text style={styles.subtitleText}>{item.priceInfo.replace(/\n/g, ' - ')}</Text>
                      ) : null}

                      {item.expected ? (
                        <Text style={styles.metaText}>Expected: {item.expected} pax</Text>
                      ) : null}
                    </View>

                    <TouchableOpacity style={styles.trackButton} activeOpacity={0.8}>
                      <Text style={styles.trackButtonText}>Track Service +</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }

          // Food cards
          const validSubItems = Array.isArray(item.items) ? item.items : [];

          return (
            <View key={item.id || `food-idx-${index}`} style={styles.card}>
              <Image source={getFnbImage(item.title)} style={styles.thumbnail} />
              <View style={styles.cardContent}>
                <View style={styles.headerRow}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  {item.expected ? (
                    <Text style={styles.badgeExpected}>{item.expected} pax</Text>
                  ) : null}
                </View>

                {item.timeRange ? (
                  <Text style={styles.timeText}>🕒 {item.timeRange}</Text>
                ) : null}

                {item.priceInfo ? (
                  <Text style={styles.priceTag}>{item.priceInfo}</Text>
                ) : null}

                {/* Sub-items of services */}
                {validSubItems.length > 0 && (
                  <View style={styles.itemsList}>
                    {validSubItems.map((subItem, subIdx) => {
                      if (!subItem) return null;
                      const itemName = typeof subItem === 'object' ? subItem.item_name : subItem;
                      const itemPrice = typeof subItem === 'object' ? subItem.price : null;

                      return (
                        <View key={subItem.id || `sub-${subIdx}`} style={styles.subItemRow}>
                          <Text style={styles.bulletPoint}>•</Text>
                          <Text style={styles.subItemText}>
                            {itemName}
                            {itemPrice ? ` (${itemPrice})` : ''}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dietaryContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  dietaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#856404',
    marginBottom: 2,
  },
  dietaryText: {
    fontSize: 13,
    color: '#856404',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#E0E0E0',
  },
  cardContent: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '700',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#437B6D',
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 2,
  },
  badgeExpected: {
    fontSize: 11,
    fontWeight: '600',
    color: '#437B6D',
    backgroundColor: '#E8F2F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  priceTag: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  itemsList: {
    marginTop: 4,
  },
  subItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  bulletPoint: {
    fontSize: 12,
    color: '#437B6D',
    marginRight: 6,
    lineHeight: 16,
  },
  subItemText: {
    fontSize: 12,
    color: '#4A5568',
    flex: 1,
    lineHeight: 16,
  },
  beverageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  beverageInfo: {
    flex: 1,
    marginRight: 8,
  },
  subtitleText: {
    fontSize: 12,
    color: '#555555',
    marginTop: 2,
  },
  metaText: {
    fontSize: 11,
    color: '#888888',
    marginTop: 2,
  },
  trackButton: {
    backgroundColor: '#437B6D',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#7E8B9B',
    fontSize: 14,
  },
});
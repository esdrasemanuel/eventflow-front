import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS, SPACING } from '../../constants/theme';
import { syncOrderData as syncOrderService } from '../../services/dinnerService';

export default function MyTablesScreen() {
  const { eventId, userId, tables: tablesParam, userRole } = useLocalSearchParams();

  const [tables, setTables] = useState([]);
  const [eventMenu, setEventMenu] = useState({
    Starters: [],
    'Main Course': [],
    Desserts: [],
  });
  const [expandedTableId, setExpandedTableId] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [activeCourseTabs, setActiveCourseTabs] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // modal notes states
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [selectedNoteItem, setSelectedNoteItem] = useState(null);

  useEffect(() => {
    const loadTablesData = () => {
      try {
        setIsLoading(true);

        if (tablesParam) {
          const parsedTables = JSON.parse(tablesParam);

          if (Array.isArray(parsedTables) && parsedTables.length > 0) {
            const rawMenus = parsedTables[0]?.dinner?.menus || [];

            const starters = [
              // {
              //   id: 'no-starter',
              //   name: 'No starter',
              //   description: 'Guest opted for no starter course',
              // },
            ];
            const mains = [];
            const desserts = [];

            rawMenus.forEach((menu) => {
              const formattedItem = {
                id: menu.id,
                name: menu.itemName,
                description: menu.description,
              };

              switch (menu.courseType) {
                case 'STARTER':
                  starters.push(formattedItem);
                  break;
                case 'MAIN':
                  mains.push(formattedItem);
                  break;
                case 'DESSERT':
                  desserts.push(formattedItem);
                  break;
                default:
                  starters.push(formattedItem);
                  break;
              }
            });

            setEventMenu({
              Starters: starters,
              'Main Course': mains,
              Desserts: desserts,
            });

            const initialQuantities = {};
            const initialNotes = {};

            const formattedTables = parsedTables.map((item, index) => {
              const tableId = item.id || index + 1;

              initialQuantities[tableId] = {};
              initialNotes[tableId] = {};

              if (Array.isArray(item.orderItems)) {
                item.orderItems.forEach((orderItem) => {
                  const menuItemId = orderItem.menuItemId || orderItem.menuId || orderItem.id;

                  if (menuItemId) {
                    const currentQty = initialQuantities[tableId][menuItemId] || 0;
                    initialQuantities[tableId][menuItemId] = currentQty + 1;

                    if (orderItem.notes || orderItem.instruction) {
                      const noteText = orderItem.notes || orderItem.instruction;
                      if (!initialNotes[tableId][menuItemId]) {
                        initialNotes[tableId][menuItemId] = [];
                      }
                      initialNotes[tableId][menuItemId].push(noteText);
                    }
                  }
                });
              }

              return {
                id: tableId,
                tableNumber: item.tableNumber ?? item.table_number ?? (index + 1),
                seatsPerTable: item.dinner?.seatsPerTable ?? 12,
              };
            });

            setQuantities(initialQuantities);
            setItemNotes(initialNotes);
            setTables(formattedTables);

            if (formattedTables.length > 0) {
              setExpandedTableId(formattedTables[0].id);
            }
          } else {
            setTables([]);
            setEventMenu({ Starters: [], 'Main Course': [], Desserts: [] });
          }
        }
      } catch (error) {
        console.error('Failed to parse route tables data:', error);
        setTables([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTablesData();
  }, [tablesParam]);

  // to save notes 
  const syncItemNotes = async (tableId, itemId, notesArray) => {
    try {
      const combinedNotes = notesArray.join('; ');

      await syncOrderService(tableId, itemId, 'UPDATE_NOTES', {
        notes: combinedNotes,
      });
    } catch (error) {
      console.error('error:', error);
    }
  };

  const handleQuantityChange = async (tableId, itemId, delta, courseType) => {
    const currentTableOrder = quantities[tableId] || {};
    const currentQty = currentTableOrder[itemId] || 0;
    const updatedQty = Math.max(0, currentQty + delta);

    const courseTypeMap = {
      Starters: 'STARTER',
      'Main Course': 'MAIN',
      Desserts: 'DESSERT',
    };
    const formattedCourseType = courseTypeMap[courseType] || 'STARTER';

    setQuantities((prev) => ({
      ...prev,
      [tableId]: {
        ...prev[tableId],
        [itemId]: updatedQty,
      },
    }));

    if (updatedQty === 0 && itemNotes[tableId]?.[itemId]) {
      setItemNotes((prevNotes) => {
        const tableNotes = { ...prevNotes[tableId] };
        delete tableNotes[itemId];
        return { ...prevNotes, [tableId]: tableNotes };
      });
      await syncItemNotes(tableId, itemId, []);
    }

    try {
      if (delta > 0) {
        await syncOrderService(tableId, itemId, 'ADD_ITEM', {
          courseType: formattedCourseType,
          guestIndex: 1,
        });
      } else if (delta < 0 && currentQty > 0) {
        await syncOrderService(tableId, itemId, 'REMOVE_ITEM');
      }
    } catch (error) {
      console.error('eroor:', error);
    }
  };

  const handleAddNoteField = (tableId, itemId) => {
    setItemNotes((prev) => {
      const tableNotes = prev[tableId] || {};
      const currentNotes = tableNotes[itemId] || [];

      return {
        ...prev,
        [tableId]: {
          ...tableNotes,
          [itemId]: [...currentNotes, ''],
        },
      };
    });
  };

  const handleNoteChange = (tableId, itemId, index, text) => {
    setItemNotes((prev) => {
      const tableNotes = prev[tableId] || {};
      const currentNotes = [...(tableNotes[itemId] || [])];
      currentNotes[index] = text;

      return {
        ...prev,
        [tableId]: {
          ...tableNotes,
          [itemId]: currentNotes,
        },
      };
    });
  };

  const handleRemoveNote = (tableId, itemId, index) => {
    setItemNotes((prev) => {
      const tableNotes = prev[tableId] || {};
      const currentNotes = (tableNotes[itemId] || []).filter((_, i) => i !== index);

      syncItemNotes(tableId, itemId, currentNotes);

      return {
        ...prev,
        [tableId]: {
          ...tableNotes,
          [itemId]: currentNotes,
        },
      };
    });
  };

  const handleTabChange = (tableId, course) => {
    setActiveCourseTabs((prev) => ({
      ...prev,
      [tableId]: course,
    }));
  };

  const openNoteModal = (tableId, item) => {
    setSelectedNoteItem({ tableId, item });

    const existingNotes = itemNotes[tableId]?.[item.id] || [];
    if (existingNotes.length === 0) {
      handleAddNoteField(tableId, item.id);
    }

    setNoteModalVisible(true);
  };

  const closeNoteModal = async () => {
    if (selectedNoteItem) {
      const { tableId, item } = selectedNoteItem;

      const currentNotes = itemNotes[tableId]?.[item.id] || [];
      const cleanNotes = currentNotes.filter((n) => n && n.trim().length > 0);

      setItemNotes((prev) => ({
        ...prev,
        [tableId]: {
          ...(prev[tableId] || {}),
          [item.id]: cleanNotes,
        },
      }));

      await syncItemNotes(tableId, item.id, cleanNotes);
    }

    setNoteModalVisible(false);
    setSelectedNoteItem(null);
  };

  const calculateCourseProgress = (tableId, seatsPerTable, activeCourse) => {
    const tableQuantities = quantities[tableId] || {};
    const courseItems = eventMenu[activeCourse] || [];

    const totalCourseQty = courseItems.reduce(
      (sum, item) => sum + (tableQuantities[item.id] || 0),
      0
    );

    const progressRatio = seatsPerTable > 0 ? totalCourseQty / seatsPerTable : 0;
    const progressPercent = Math.min(progressRatio * 100, 100);

    return { totalCourseQty, progressPercent };
  };

  const TableCard = ({ table }) => {
    const isExpanded = expandedTableId === table.id;
    const activeCourseTab = activeCourseTabs[table.id] || 'Starters';

    const currentItems = eventMenu[activeCourseTab] || [];
    const tableQuantities = quantities[table.id] || {};
    const tableNotes = itemNotes[table.id] || {};

    const { totalCourseQty, progressPercent } = calculateCourseProgress(
      table.id,
      table.seatsPerTable,
      activeCourseTab
    );

    return (
      <View style={[styles.card, isExpanded && styles.cardExpanded]}>
        <TouchableOpacity
          onPress={() => setExpandedTableId(isExpanded ? null : table.id)}
          activeOpacity={0.9}
        >
          <View style={styles.cardRow}>
            <View>
              <Text style={styles.tableTitle}>Table {table.tableNumber}</Text>
              <Text style={styles.seatsText}>{table.seatsPerTable} Seats</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.inlineOrderContainer}>
            <View style={styles.divider} />

            {/* course tabs */}
            <View style={styles.courseTabBar}>
              {['Starters', 'Main Course', 'Desserts'].map((course) => {
                const isActive = activeCourseTab === course;
                return (
                  <TouchableOpacity
                    key={course}
                    style={[styles.courseTab, isActive && styles.courseTabActive]}
                    onPress={() => handleTabChange(table.id, course)}
                  >
                    <Text style={[styles.courseTabText, isActive && styles.courseTabTextActive]}>
                      {course}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* progress row */}
            <View style={styles.progressRow}>
              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFilled,
                    { width: `${progressPercent}%`, backgroundColor: COLORS.secondary },
                  ]}
                />
              </View>
              <Text style={styles.ratioText}>
                {totalCourseQty} / {table.seatsPerTable}
              </Text>
            </View>

            {currentItems.length === 0 ? (
              <Text style={styles.emptyMenuText}>No items available for {activeCourseTab}.</Text>
            ) : (
              currentItems.map((item) => {
                const qty = tableQuantities[item.id] || 0;
                const notesList = (tableNotes[item.id] || []).filter((n) => n && n.trim().length > 0);
                const hasNotes = notesList.length > 0;

                return (
                  <View key={item.id} style={styles.menuRow}>
                    <View style={styles.menuInfo}>
                      <Text style={styles.menuName}>{item.name}</Text>
                      {item.description ? (
                        <Text style={styles.menuDescription}>{item.description}</Text>
                      ) : null}
                    </View>

                    <View style={styles.actionGroup}>
                      {qty > 0 && (
                        <TouchableOpacity
                          style={[styles.noteBtn, hasNotes && styles.noteBtnActive]}
                          onPress={() => openNoteModal(table.id, item)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.noteBtnText, hasNotes && styles.noteBtnTextActive]}>
                            📝 {hasNotes ? `Notes (${notesList.length})` : 'Note'}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <View style={styles.counterGroup}>
                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => handleQuantityChange(table.id, item.id, -1, activeCourseTab)}
                        >
                          <Text style={styles.counterBtnText}>−</Text>
                        </TouchableOpacity>

                        <Text style={styles.counterQty}>{qty}</Text>

                        <TouchableOpacity
                          style={styles.counterBtn}
                          onPress={() => handleQuantityChange(table.id, item.id, 1, activeCourseTab)}
                        >
                          <Text style={styles.counterBtnText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            <View style={styles.orderFooter}>
              <Text style={styles.totalSelectedText}>
                Selected ({activeCourseTab}): <Text style={styles.totalHighlight}>{totalCourseQty}</Text>
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeAreaLoading}>
        <ActivityIndicator size="large" color={COLORS.secondary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        <Text style={styles.screenTitle}>My Tables</Text>
        <Text style={styles.screenSubTitle}>Take your orders from the tables below</Text>

        <FlatList
          data={tables}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <TableCard table={item} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No tables assigned.</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* notes modal */}
      <Modal
        visible={noteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeNoteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleGroup}>
                <Text style={styles.modalTitle}>Special Instructions</Text>
                <Text style={styles.modalSubtitle}>{selectedNoteItem?.item?.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeModalBtn}
                onPress={closeNoteModal}
                activeOpacity={0.7}
              >
                <Text style={styles.closeModalBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedNoteItem && (
              <ScrollView
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalBody}
                showsVerticalScrollIndicator={true}
              >
                {(itemNotes[selectedNoteItem.tableId]?.[selectedNoteItem.item.id] || []).map(
                  (noteText, index) => (
                    <View key={index} style={styles.modalInputWrapper}>
                      <View style={styles.inputHeaderRow}>
                        <Text style={styles.modalInputLabel}>Note #{index + 1}:</Text>
                        <TouchableOpacity
                          onPress={() =>
                            handleRemoveNote(
                              selectedNoteItem.tableId,
                              selectedNoteItem.item.id,
                              index
                            )
                          }
                        >
                          <Text style={styles.removeNoteText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                      <TextInput
                        style={styles.modalTextInput}
                        placeholder="e.g. No dressing, extra sauce..."
                        placeholderTextColor="#94A3B8"
                        value={noteText}
                        onChangeText={(text) =>
                          handleNoteChange(
                            selectedNoteItem.tableId,
                            selectedNoteItem.item.id,
                            index,
                            text
                          )
                        }
                      />
                    </View>
                  )
                )}

                <TouchableOpacity
                  style={styles.addNoteBtn}
                  onPress={() =>
                    handleAddNoteField(selectedNoteItem.tableId, selectedNoteItem.item.id)
                  }
                >
                  <Text style={styles.addNoteBtnText}>+ Add Another Note</Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            <TouchableOpacity
              style={styles.modalDoneBtn}
              onPress={closeNoteModal}
            >
              <Text style={styles.modalDoneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  safeAreaLoading: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
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
  container: {
    flex: 1,
    paddingHorizontal: SPACING.md,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: SPACING.lg,
    marginBottom: 4,
  },
  screenSubTitle: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardExpanded: {
    borderColor: COLORS.secondary,
    borderWidth: 1.5,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  seatsText: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: SPACING.md,
  },
  progressBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFilled: {
    height: '100%',
    borderRadius: 3,
  },
  ratioText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'right',
    minWidth: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginTop: SPACING.xl,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: SPACING.md,
  },
  inlineOrderContainer: {
    paddingTop: 4,
  },
  courseTabBar: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FD',
    borderRadius: 8,
    padding: 3,
    marginBottom: SPACING.sm,
  },
  courseTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  courseTabActive: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  courseTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  courseTabTextActive: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  emptyMenuText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 8,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FD',
  },
  menuInfo: {
    flex: 1,
    paddingRight: 8,
  },
  menuName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  menuDescription: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  noteBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  noteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  noteBtnTextActive: {
    color: '#B45309',
  },
  counterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  counterBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  counterQty: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    minWidth: 18,
    textAlign: 'center',
  },
  orderFooter: {
    marginTop: SPACING.md,
    alignItems: 'flex-end',
  },
  totalSelectedText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  totalHighlight: {
    color: COLORS.secondary,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    //justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 140,
    paddingHorizontal: SPACING.md,
  },
  modalContent: {
    width: '100%',
    maxHeight: '50%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalHeaderTitleGroup: {
    flex: 1,
    paddingRight: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textMuted,
    lineHeight: 16,
  },
  modalScrollView: {
    maxHeight: 280,
  },
  modalBody: {
    gap: 12,
    paddingBottom: SPACING.md,
  },
  modalInputWrapper: {
    gap: 4,
  },
  inputHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  removeNoteText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  modalTextInput: {
    height: 40,
    backgroundColor: '#F8F9FD',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textDark,
  },
  addNoteBtn: {
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 8,
    marginTop: 4,
  },
  addNoteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  modalDoneBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  modalDoneBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
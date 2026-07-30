import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { getAllEvents } from '../../services/ServiceEvents';
import { getUsersStaff } from '../../services/usersService';
import { saveDinnerService } from '../../services/dinnerService';
import { COLORS, SPACING, FONT_SIZES } from '../../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DinnerConfigurationScreen() {
  // events states
  const [eventsList, setEventsList] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);

  // staff states
  const [staffList, setStaffList] = useState([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);

  // loading form
  const [isSaving, setIsSaving] = useState(false);

  // form 
  const [dinnerName, setDinnerName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [startTime, setStartTime] = useState('18:30');
  const [expectedGuests, setExpectedGuests] = useState('0');

  // active tab
  const [activeTab, setActiveTab] = useState('tables'); // 'tables' | 'menu' | 'staff'

  // tables 
  const [tablesCount, setTablesCount] = useState(12);
  const [seatsPerTable, setSeatsPerTable] = useState(10);

  // menu states
  const [selectedCourse, setSelectedCourse] = useState('STARTER');
  const [menuItems, setMenuItems] = useState([]);
  const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');

  // staffs assignment
  const [selectedStaffMember, setSelectedStaffMember] = useState(null);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
  const [tempAssignedTables, setTempAssignedTables] = useState([]);

  // user login
  const [userId, setUserId] = useState(''); 
  
    const loadUserData = async () => {
      try {
        // Reading the raw string data from AsyncStorage
        const storedUser = await AsyncStorage.getItem('@EventFlow:user');
        
        if (storedUser) {
          // Parsing the string back into a JavaScript object
          const parsedUser = JSON.parse(storedUser);
          
          // Setting state values with the logged-in user details
          setUserId(parsedUser.id);
        }
      } catch (error) {
        console.error('Failed to load user data from storage:', error);
      }
    };
  
  // get events
  useEffect(() => {
    fetchUpcomingEvents();
    loadUserData();
  }, []);

  // get staffs
  useEffect(() => {
    if (activeTab === 'staff') {
      loadStaff();
    }
  }, [activeTab]);

  const loadStaff = async () => {
    try {
      setIsLoadingStaff(true);
      const data = await getUsersStaff();

      const formattedStaff = data.map((user) => ({
        id: String(user.id),
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Staff',
        role: user.role || 'Server',
        assignedTables: [],
      }));

      setStaffList(formattedStaff);
    } catch (error) {
      console.error('Error to get staff:', error);
      Alert.alert('Erro', 'Error to load staffs');
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const fetchUpcomingEvents = async () => {
    try {
      setIsLoadingEvents(true);

      const response = await getAllEvents();
      const data = response.data || response;

      setEventsList(data);

      if (data.length > 0) {
        handleSelectEvent(data[0]);
      }
    } catch (error) {
      Alert.alert('Erro', 'error to load events.');
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSelectEvent = (evt) => {
    setSelectedEvent(evt);
    setDinnerName(evt.account_name || 'Dinner Event');

    if (evt.event_date) {
      const parsedDate = new Date(evt.event_date);
      if (!isNaN(parsedDate.getTime())) {
        setSelectedDate(parsedDate);
      }
    }

    if (evt.start_time) {
      setStartTime(formatTimeInput(evt.start_time));
    }

    const guests = evt.activities?.[0]?.expected ?? 0;
    setExpectedGuests(String(guests));

    setIsEventModalVisible(false);
  };

  // Handler to change date
  const handleDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDateString = (dateObj) => {
    if (!dateObj || isNaN(dateObj.getTime())) return 'Select Date';
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // mask for time
  const formatTimeInput = (text) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      return cleaned;
    }
    return `${cleaned.slice(0, 2)}:${cleaned.slice(2, 4)}`;
  };

  const handleTimeChange = (text) => {
    setStartTime(formatTimeInput(text));
  };

  // recalc tables
  useEffect(() => {
    const guestsNum = parseInt(expectedGuests, 10) || 0;
    const seatsNum = seatsPerTable > 0 ? seatsPerTable : 1;
    if (guestsNum > 0) {
      setTablesCount(Math.ceil(guestsNum / seatsNum));
    }
  }, [expectedGuests, seatsPerTable]);

  const handleTablesChange = (val) => {
    const num = parseInt(val, 10);
    setTablesCount(isNaN(num) || num < 1 ? 1 : num);
  };

  const handleSeatsChange = (val) => {
    const num = parseInt(val, 10);
    setSeatsPerTable(isNaN(num) || num < 1 ? 1 : num);
  };

  const tablesList = Array.from({ length: tablesCount }, (_, i) => ({
    id: i + 1,
    number: i + 1,
  }));

  // menu functions
  const handleAddMenuItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('Attention', 'insert the item name');
      return;
    }

    const newItem = {
      id: String(Date.now()),
      course_type: selectedCourse,
      item_name: newItemName.trim(),
      description: newItemDescription.trim(),
    };

    setMenuItems((prev) => [...prev, newItem]);
    setNewItemName('');
    setNewItemDescription('');
    setIsAddItemModalVisible(false);
  };

  const handleDeleteMenuItem = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredMenuItems = menuItems.filter(
    (item) => item.course_type === selectedCourse
  );

  // open modal to assign
  const handleOpenAssignModal = (staffMember) => {
    setSelectedStaffMember(staffMember);
    setTempAssignedTables([...staffMember.assignedTables]);
    setIsAssignModalVisible(true);
  };

  const toggleTableAssignment = (tableNum) => {
    setTempAssignedTables((prev) =>
      prev.includes(tableNum)
        ? prev.filter((t) => t !== tableNum)
        : [...prev, tableNum].sort((a, b) => a - b)
    );
  };

  const handleSaveStaffTables = () => {
    if (!selectedStaffMember) return;

    setStaffList((prev) =>
      prev.map((s) =>
        s.id === selectedStaffMember.id
          ? { ...s, assignedTables: tempAssignedTables }
          : s
      )
    );

    setIsAssignModalVisible(false);
    setSelectedStaffMember(null);
  };

  const allAssignedTableNumbers = [
    ...new Set(staffList.flatMap((s) => s.assignedTables)),
  ];
  const assignedTablesCount = allAssignedTableNumbers.filter(
    (tblNum) => tblNum <= tablesCount
  ).length;

  // next button and save dinner
  const handleNext = async () => {
    if (!selectedEvent) {
      Alert.alert('Attention', 'Select an event');
      return;
    }

    if (activeTab === 'tables') {
      setActiveTab('menu');
    } else if (activeTab === 'menu') {
      setActiveTab('staff');
    } else {
      const payload = {
        eventId: Number(selectedEvent.id),
        name: dinnerName,
        date: formatDateString(selectedDate),
        startTime,
        expectedGuests: Number(expectedGuests),
        tablesCount,
        seatsPerTable,
        createdBy: Number(userId), 
        menuItems: menuItems.map((item) => ({
          course_type: item.course_type,
          item_name: item.item_name,
          description: item.description,
        })),
        staffAssignments: staffList.map((s) => ({
          staffId: Number(s.id),
          name: s.name,
          role: s.role,
          tables: s.assignedTables,
        })),
      };

      try {
        setIsSaving(true);
        // Save dinner
        const response = await saveDinnerService(payload);

        if (response.success || response.status === 201) {
          Alert.alert('Success', 'Dinner configuration saved successfully!', [
            { text: 'OK', onPress: () => router.replace('/home') },
          ]);
        } else {
          Alert.alert('Error', response.message || 'Could not save dinner configuration');
        }
      } catch (error) {
        console.error('Error saving dinner:', error);
        Alert.alert('Error', 'Unable to reach the server. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.replace('/home')} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.metaHeader}>
            <Text style={styles.titleText}>Dinner Configuration</Text>
            <Text style={styles.subtitleText}>Create and configure a dinner event</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* main Form Card */}
        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Select Event</Text>
            {isLoadingEvents ? (
              <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginVertical: 12 }} />
            ) : (
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setIsEventModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={selectedEvent ? styles.selectButtonText : styles.placeholderTextSelect}>
                  {selectedEvent ? selectedEvent.account_name : 'Select an event'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dinner Name</Text>
              <TextInput
                style={styles.input}
                value={dinnerName}
                onChangeText={setDinnerName}
                placeholder="Ex: Gala Dinner"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.datePickerText}>{formatDateString(selectedDate)}</Text>
                <Text style={styles.calendarIconText}>📅</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                value={startTime}
                onChangeText={handleTimeChange}
                placeholder="18:30"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="numeric"
                maxLength={5}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Expected Guests</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={expectedGuests}
                onChangeText={setExpectedGuests}
                placeholder="0"
                placeholderTextColor={COLORS.textMuted}
              />
            </View>
          </View>
        </View>

        {/* tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tables' && styles.activeTabButton]}
            onPress={() => setActiveTab('tables')}
          >
            <Text style={[styles.tabText, activeTab === 'tables' && styles.activeTabText]}>
              Tables Setup
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'menu' && styles.activeTabButton]}
            onPress={() => setActiveTab('menu')}
          >
            <Text style={[styles.tabText, activeTab === 'menu' && styles.activeTabText]}>
              Menu Selection
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'staff' && styles.activeTabButton]}
            onPress={() => setActiveTab('staff')}
          >
            <Text style={[styles.tabText, activeTab === 'staff' && styles.activeTabText]}>
              Staff Assignment
            </Text>
          </TouchableOpacity>
        </View>

        {/* tab tables setup */}
        {activeTab === 'tables' && (
          <View style={styles.tabContentCard}>
            <View style={styles.metricsRow}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Tables</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setTablesCount((prev) => Math.max(1, prev - 1))}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.metricInput}
                    keyboardType="numeric"
                    value={String(tablesCount)}
                    onChangeText={handleTablesChange}
                  />

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setTablesCount((prev) => prev + 1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Seats per Table</Text>
                <View style={styles.stepperContainer}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setSeatsPerTable((prev) => Math.max(1, prev - 1))}
                  >
                    <Text style={styles.stepperBtnText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={styles.metricInput}
                    keyboardType="numeric"
                    value={String(seatsPerTable)}
                    onChangeText={handleSeatsChange}
                  />

                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setSeatsPerTable((prev) => prev + 1)}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.metricCard, styles.readOnlyMetricCard]}>
                <Text style={styles.metricLabel}>Total Seats</Text>
                <Text style={styles.totalSeatsNumber}>
                  {expectedGuests !== '' ? expectedGuests : '0'}
                </Text>
              </View>
            </View>

            <View style={styles.tablesGrid}>
              {tablesList.map((table) => (
                <View key={table.id} style={styles.tableCircleWrapper}>
                  <View style={styles.outerSeatsRing} />
                  <View style={styles.tableCircle}>
                    <Text style={styles.tableNumberText}>{table.number}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* tab menu selection */}
        {activeTab === 'menu' && (
          <View style={styles.tabContentCard}>
            <View style={styles.coursePillsContainer}>
              {['STARTER', 'MAIN', 'DESSERT'].map((course) => (
                <TouchableOpacity
                  key={course}
                  style={[
                    styles.coursePill,
                    selectedCourse === course && styles.activeCoursePill,
                  ]}
                  onPress={() => setSelectedCourse(course)}
                >
                  <Text
                    style={[
                      styles.coursePillText,
                      selectedCourse === course && styles.activeCoursePillText,
                    ]}
                  >
                    {course === 'STARTER' ? 'Starter' : course === 'MAIN' ? 'Main Course' : 'Dessert'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.menuHeaderRow}>
              <Text style={styles.sectionTitleText}>
                {selectedCourse === 'STARTER' ? 'Starters' : selectedCourse === 'MAIN' ? 'Main Courses' : 'Desserts'}
              </Text>
              <TouchableOpacity
                style={styles.addMenuBtn}
                onPress={() => setIsAddItemModalVisible(true)}
              >
                <Text style={styles.addMenuBtnText}>+ Add Item</Text>
              </TouchableOpacity>
            </View>

            {filteredMenuItems.length === 0 ? (
              <View style={styles.emptyMenuContainer}>
                <Text style={styles.emptyMenuText}>No items added for this course yet.</Text>
              </View>
            ) : (
              filteredMenuItems.map((item) => (
                <View key={item.id} style={styles.menuCardItem}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuItemTitle}>{item.item_name}</Text>
                    {item.description ? (
                      <Text style={styles.menuItemDesc}>{item.description}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteMenuItem(item.id)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {/* tab staff assignment */}
        {activeTab === 'staff' && (
          <View style={styles.tabContentCard}>
            <View style={styles.staffSummaryCard}>
              <View>
                <Text style={styles.staffSummaryTitle}>Table Allocation Progress</Text>
                <Text style={styles.staffSummarySubtitle}>
                  {assignedTablesCount} of {tablesCount} tables assigned
                </Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {assignedTablesCount === tablesCount ? 'All Assigned' : 'Pending Tables'}
                </Text>
              </View>
            </View>

            <Text style={[styles.sectionTitleText, { marginBottom: SPACING.md }]}>Service Staff</Text>

            {isLoadingStaff ? (
              <ActivityIndicator size="small" color={COLORS.secondary} style={{ marginVertical: 20 }} />
            ) : (
              staffList.map((staff) => {
                const activeTablesForStaff = staff.assignedTables.filter(
                  (tbl) => tbl <= tablesCount
                );
                const totalGuestsCovered = activeTablesForStaff.length * seatsPerTable;

                return (
                  <View key={staff.id} style={styles.staffCard}>
                    <View style={styles.staffInfo}>
                      <View style={styles.staffAvatar}>
                        <Text style={styles.staffAvatarText}>
                          {staff.name.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.staffName}>{staff.name}</Text>
                        <Text style={styles.staffRole}>{staff.role}</Text>

                        <View style={styles.tablesBadgeRow}>
                          {activeTablesForStaff.length === 0 ? (
                            <Text style={styles.noTablesText}>No tables assigned</Text>
                          ) : (
                            activeTablesForStaff.map((tblNum) => (
                              <View key={tblNum} style={styles.tableChip}>
                                <Text style={styles.tableChipText}>T-{tblNum}</Text>
                              </View>
                            ))
                          )}
                        </View>
                      </View>
                    </View>

                    <View style={styles.staffCardRight}>
                      <Text style={styles.guestsCountText}>{totalGuestsCovered} guests</Text>
                      <TouchableOpacity
                        style={styles.assignBtn}
                        onPress={() => handleOpenAssignModal(staff)}
                      >
                        <Text style={styles.assignBtnText}>Assign</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* action Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.nextBtn} onPress={handleNext} disabled={isSaving}>
            {isSaving ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.nextBtnText}>
                {activeTab === 'tables'
                  ? 'Next: Menu Selection'
                  : activeTab === 'menu'
                    ? 'Next: Staff Assignment'
                    : 'Save Configuration'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* modal date (iOS / ANDROID) */}
      {showDatePicker && (
        Platform.OS === 'ios' ? (
          <Modal transparent={true} animationType="fade" visible={showDatePicker}>
            <View style={styles.iosDatePickerOverlay}>
              <View style={styles.iosDatePickerCard}>
                <View style={styles.iosDatePickerHeader}>
                  <Text style={styles.iosDatePickerTitle}>Select Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    style={styles.doneBtnModal}
                  >
                    <Text style={styles.doneBtnModalText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  textColor={COLORS.textDark}
                  style={{ height: 180 }}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )
      )}

      {/* modal to select event */}
      <Modal visible={isEventModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Event</Text>
              <TouchableOpacity onPress={() => setIsEventModalVisible(false)}>
                <Text style={styles.closeModalText}>✕</Text>
              </TouchableOpacity>
            </View>

            {eventsList.length === 0 ? (
              <Text style={styles.emptyText}>No upcoming events found.</Text>
            ) : (
              <FlatList
                data={eventsList}
                keyExtractor={(item) => String(item.id)}
                renderItem={({ item }) => {
                  const isSelected = selectedEvent?.id === item.id;
                  const itemDate = item.event_date ? item.event_date.split('T')[0] : '';

                  return (
                    <TouchableOpacity
                      style={[styles.eventItem, isSelected && styles.eventItemSelected]}
                      onPress={() => handleSelectEvent(item)}
                    >
                      <View>
                        <Text style={[styles.eventName, isSelected && styles.eventNameSelected]}>
                          {item.account_name}
                        </Text>
                        <Text style={styles.eventDateText}>📅 {itemDate}</Text>
                      </View>
                      {isSelected && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* modal to add menu item */}
      <Modal visible={isAddItemModalVisible} animationType="fade" transparent={true}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlayCenter}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ width: '100%', alignItems: 'center' }}
            >
              <View style={styles.modalCardCenter}>
                <Text style={styles.modalTitleCenter}>
                  Add {selectedCourse === 'STARTER' ? 'Starter' : selectedCourse === 'MAIN' ? 'Main Course' : 'Dessert'} Item
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.label}>Item Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Chicken Caesar Salad"
                    placeholderTextColor={COLORS.textMuted}
                    value={newItemName}
                    onChangeText={setNewItemName}
                  />
                </View>

                <View style={styles.modalInputGroup}>
                  <Text style={styles.label}>Description (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ex: Crisp romaine lettuce, parmesan, croutons"
                    placeholderTextColor={COLORS.textMuted}
                    multiline
                    numberOfLines={3}
                    value={newItemDescription}
                    onChangeText={setNewItemDescription}
                  />
                </View>

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={styles.cancelBtnModal}
                    onPress={() => setIsAddItemModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.saveBtnModal} onPress={handleAddMenuItem} activeOpacity={0.8}>
                    <Text style={styles.saveBtnText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Modal to assign table to staff */}
      <Modal visible={isAssignModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalCardCenter}>
            <Text style={styles.modalTitleCenter}>
              Assign Tables to {selectedStaffMember?.name}
            </Text>
            <Text style={styles.modalSubtitleCenter}>
              Select tables to assign to this server:
            </Text>

            <ScrollView style={{ maxHeight: 240 }} contentContainerStyle={styles.tablesChipGrid}>
              {tablesList.map((tbl) => {
                const isSelected = tempAssignedTables.includes(tbl.number);
                return (
                  <TouchableOpacity
                    key={tbl.id}
                    style={[
                      styles.tableSelectChip,
                      isSelected && styles.tableSelectChipActive,
                    ]}
                    onPress={() => toggleTableAssignment(tbl.number)}
                  >
                    <Text
                      style={[
                        styles.tableSelectChipText,
                        isSelected && styles.tableSelectChipTextActive,
                      ]}
                    >
                      Table {tbl.number}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={styles.cancelBtnModal}
                onPress={() => setIsAssignModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.saveBtnModal} onPress={handleSaveStaffTables}>
                <Text style={styles.saveBtnText}>Save Assignments</Text>
              </TouchableOpacity>
            </View>
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
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  backIcon: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    // color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  formCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: SPACING.lg,
  },
  selectButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderTextSelect: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#475569',
  },
  row: {
    flexDirection: 'row',
    gap: SPACING.sm + 4,
  },
  inputGroup: {
    marginBottom: SPACING.sm + 4,
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  /* date */
  datePickerButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 42,
  },
  datePickerText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  calendarIconText: {
    fontSize: FONT_SIZES.sm,
  },

  /* to Ios */
  iosDatePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  iosDatePickerCard: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: SPACING.md,
    paddingBottom: 30,
  },
  iosDatePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  iosDatePickerTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  doneBtnModal: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  doneBtnModalText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 13,
  },

  /* main tabs */
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: SPACING.md,
  },
  tabButton: {
    paddingVertical: 10,
    marginRight: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.secondary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeTabText: {
    color: COLORS.secondary,
  },

  /* Tab Content */
  tabContentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    minHeight: 280,
    marginBottom: SPACING.lg,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: SPACING.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readOnlyMetricCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: SPACING.xs,
  },
  stepperBtn: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  stepperBtnText: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  metricInput: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.textDark,
    textAlign: 'center',
    minWidth: 30,
    paddingVertical: 2,
  },
  totalSeatsNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.statusInProgress,
    marginVertical: SPACING.xs,
  },

  /* tables Grid */
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 20,
    paddingVertical: 10,
  },
  tableCircleWrapper: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerSeatsRing: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    borderStyle: 'dashed',
  },
  tableCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableNumberText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },

  /* tab menu selection */
  coursePillsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: SPACING.xs,
    marginBottom: SPACING.md,
  },
  coursePill: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeCoursePill: {
    backgroundColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  coursePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  activeCoursePillText: {
    color: COLORS.secondary,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  addMenuBtn: {
    backgroundColor: '#E8F2F0',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  addMenuBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  emptyMenuContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  emptyMenuText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  menuCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: SPACING.sm,
  },
  menuItemTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  menuItemDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: FONT_SIZES.sm,
  },

  /* tab staff */
  staffSummaryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F2F0',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    padding: 14,
    marginBottom: SPACING.lg,
  },
  staffSummaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  staffSummarySubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  badgeContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  staffInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  staffAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  staffAvatarText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  staffName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  staffRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  tablesBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  tableChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tableChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  noTablesText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontStyle: 'italic',
  },
  staffCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  guestsCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.statusInProgress,
    marginBottom: 6,
  },
  assignBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 5,
  },
  assignBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
  },

  /* Bottom Actions */
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  cancelBtnText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  nextBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  /* events modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.md,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  closeModalText: {
    fontSize: 18,
    color: COLORS.textMuted,
    padding: SPACING.xs,
  },
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    borderRadius: 8,
  },
  eventItemSelected: {
    backgroundColor: '#E8F2F0',
  },
  eventName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: '#1E293B',
  },
  eventNameSelected: {
    color: COLORS.secondary,
  },
  eventDateText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkmark: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textMuted,
    marginVertical: 20,
  },

  /* central modal  */
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  modalCardCenter: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitleCenter: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: SPACING.xs,
  },
  modalSubtitleCenter: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  modalInputGroup: {
    width: '100%',
    marginBottom: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  cancelBtnModal: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
  },
  saveBtnModal: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },

  /* Grid modal staffs */
  tablesChipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingVertical: 6,
  },
  tableSelectChip: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  tableSelectChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tableSelectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  tableSelectChipTextActive: {
    color: COLORS.white,
  },
  // header
  titleText: { fontSize: 22, fontWeight: '700', color: '#1A0D3F' },
  subtitleText: { fontSize: 16, color: '#7E8B9B', marginTop: 4 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
});
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

// get function from service
import {
  getChecksByEvent,
  setCheckItem,
  getCommentsByEvent,
  saveSetupComment,
} from '../../services/setupService';

export default function SetupTab({ event, userId }) {
  const activities = event?.activities || [];

  // grouping by room
  const roomsGrouped = useMemo(() => {
    const map = new Map();

    activities.forEach((act) => {
      const roomName = act.room || 'General Area';

      if (!map.has(roomName)) {
        map.set(roomName, {
          roomName: roomName,
          setup: act.setup || 'Standard Setup',
          maxPax: act.expected || 0,
          activities: [act],
          equipments: act.activity_equipment || []
        });
      } else {
        const existing = map.get(roomName);
        existing.activities.push(act);
        if ((act.expected || 0) > existing.maxPax) {
          existing.maxPax = act.expected;
        }
        if (act.activity_equipment) {
          existing.equipments = [...existing.equipments, ...act.activity_equipment];
        }
      }
    });

    return Array.from(map.values());
  }, [activities]);

  const [selectedRoomIndex, setSelectedRoomIndex] = useState(0);

  // modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsMap, setCommentsMap] = useState({});

  // checks State
  const [checkedState, setCheckedState] = useState({});

  // load api data when change events 
  useEffect(() => {
    if (!event?.id) return;

    async function loadSetupData() {
      try {
        const [checksData, commentsData] = await Promise.all([
          getChecksByEvent(event.id),
          getCommentsByEvent(event.id)
        ]);

        setCheckedState(checksData);
        setCommentsMap(commentsData);
      } catch (error) {
        console.error('Error loading setup data:', error);
      }
    }

    loadSetupData();
  }, [event?.id]);

  // Fallback if not exist room or activitie
  if (roomsGrouped.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No setup details available for this event.</Text>
      </View>
    );
  }

  const currentRoom = roomsGrouped[selectedRoomIndex] || roomsGrouped[0];
  const currentRoomKey = currentRoom.roomName;
  const currentComment = commentsMap[currentRoomKey];

  const handleOpenModal = () => {
    setCommentText(commentsMap[currentRoomKey] || '');
    setModalVisible(true);
  };

  const handleSaveComment = async () => {
    const trimmedComment = commentText.trim();

    // update local state to show the comment
    setCommentsMap((prev) => ({
      ...prev,
      [currentRoomKey]: trimmedComment
    }));
    setModalVisible(false);
    setCommentText('');

    // save comment 
    try {
      await saveSetupComment({
        eventId: event.id,
        roomName: currentRoomKey,
        comment: trimmedComment,
        userId: userId,
      });
    } catch (error) {
      console.error('Error saving comment:', error);
    }
  };

  // creating dinamic checklist
  const generatedChecklist = useMemo(() => {
    const items = [];
    const actNames = currentRoom.activities.map((a) => (a.function_name || '').toLowerCase());

    // first role: get from database (activitie_equipaments)

    const seenEquipmentIds = new Set();
    currentRoom.equipments.forEach((eq) => {
      if (!seenEquipmentIds.has(eq.id)) {
        items.push({
          id: `db-${eq.id}`,
          rawId: eq.id,
          text: eq.equipment_name,
          checked: eq.is_checked || false,
          isDbItem: true
        });
        seenEquipmentIds.add(eq.id);
      }
    });

    // Role 2: general setup based on the loyout and pax numbers
    if (currentRoom.setup) {
      items.push({
        id: 'auto-layout',
        text: `Set up ${currentRoom.maxPax} seats in ${currentRoom.setup} style`,
        checked: false,
        isDbItem: false
      });
    }

    // Role 3: see function is coffee break and create station setup 
    if (actNames.some((n) => n.includes('coffee') || n.includes('tea') || n.includes('break'))) {
      items.push({
        id: 'auto-coffee',
        text: 'Set up Coffee & Tea Station',
        checked: false,
        isDbItem: false
      });
    }

    // avoiding deplication
    const uniqueItems = [];
    const seenTexts = new Set();

    items.forEach((item) => {
      const lower = item.text.toLowerCase();
      if (!seenTexts.has(lower)) {
        seenTexts.add(lower);
        uniqueItems.push(item);
      }
    });

    return uniqueItems;
  }, [currentRoom]);

  const toggleCheck = async (itemId) => {
    const fullKey = `${currentRoomKey}_${itemId}`;
    const newCheckedStatus = !checkedState[fullKey];

    // update interface instant
    setCheckedState((prev) => ({
      ...prev,
      [fullKey]: newCheckedStatus
    }));

    // save all changes
    try {
      await setCheckItem({
        eventId: event.id,
        roomName: currentRoomKey,
        itemKey: itemId,
        isChecked: newCheckedStatus,
        userId: userId,
      });
    } catch (error) {
      console.error('Error toggling check item:', error);
    }
  };

  // Mapeamento direto: "sala_setup" -> imagem
const ROOM_SETUPS = {
  'odyssey_theatre': require('../../assets/images/setups/odyssey_theatre.jpeg'),
  'odyssey_cabaret': require('../../assets/images/setups/odyssey_theatre.jpeg'),
  'odyssey_boardroom': require('../../assets/images/setups/odyssey_theatre.jpeg'),
  'odyssey_classroom': require('../../assets/images/setups/odyssey_theatre.jpeg'),

  "rovo's_boardroom": require('../../assets/images/setups/rovos_boardroom.jpeg'),


  'secret garden_existing layout': require('../../assets/images/setups/secret_garden_default.jpeg'),
  // add more....
};

const getSetupImage = (room, setup) => {
  const key = `${room}_${setup}`.toLowerCase().trim();
  return ROOM_SETUPS[key];
};

  return (
    <View style={styles.flexWrapper}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* room selecting */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomSelector}>
          {roomsGrouped.map((room, idx) => (
            <TouchableOpacity
              key={room.roomName + idx}
              style={[
                styles.roomChip,
                selectedRoomIndex === idx && styles.activeRoomChip
              ]}
              onPress={() => setSelectedRoomIndex(idx)}
            >
              <Text
                style={[
                  styles.roomChipText,
                  selectedRoomIndex === idx && styles.activeRoomChipText
                ]}
              >
                {room.roomName} ({room.maxPax} Pax)
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* setup header */}
        <View style={styles.setupHeader}>
          <View>
            <Text style={styles.labelTitle}>Room Setup</Text>
            <Text style={styles.setupTypeName}>{currentRoom.setup}</Text>
          </View>
        </View>

        {/* image room  */}
        <View style={styles.imageWrapper}>
          <Image
          source={getSetupImage(currentRoom.roomName, currentRoom.setup)}
            // source={getSetupImage(currentRoom.setup)}
            style={styles.setupImage}
            resizeMode="cover"
          />
        </View>

        {/* checklist */}
        <View style={styles.checklistSection}>
          <Text style={styles.checklistTitle}>Setup Checklist:</Text>

          {generatedChecklist.map((item) => {
            const fullKey = `${currentRoomKey}_${item.id}`;
            const isChecked = checkedState[fullKey] !== undefined 
              ? checkedState[fullKey] 
              : item.checked;

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.checkItemRow}
                activeOpacity={0.7}
                onPress={() => toggleCheck(item.id)}
              >
                <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                  {isChecked && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <Text style={[styles.checkText, isChecked && styles.checkTextCompleted]}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* saved comment */}
          {currentComment ? (
            <View style={styles.commentCard}>
              <Text style={styles.commentCardTitle}>💬 Note:</Text>
              <Text style={styles.commentCardText}>{currentComment}</Text>
            </View>
          ) : null}

          {/* add and edit comment */}
          <TouchableOpacity style={styles.addCommentBtn} onPress={handleOpenModal}>
            <Text style={styles.addCommentText}>
              {currentComment ? 'Edit comment ✏️' : 'Add comment +'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* comment popup */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Comment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Room: <Text style={{ fontWeight: '700' }}>{currentRoomKey}</Text>
            </Text>

            <TextInput
              style={styles.textArea}
              placeholder="Enter special instructions or setup notes..."
              placeholderTextColor="#A0AEC0"
              multiline={true}
              numberOfLines={4}
              value={commentText}
              onChangeText={setCommentText}
              textAlignVertical="top"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.btn, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.btn, styles.btnSave]}
                onPress={handleSaveComment}
              >
                <Text style={styles.btnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  flexWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 20 
  },
  emptyContainer: { 
    padding: 20, 
    alignItems: 'center' 
  },
  emptyText: { 
    color: '#7E8B9B', 
    fontSize: 14 
  },
  roomSelector: { 
    marginVertical: 12, 
    flexDirection: 'row' 
  },
  roomChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    marginRight: 10,
  },
  activeRoomChip: { 
    backgroundColor: '#1A0D3F' 
  },
  roomChipText: { 
    color: '#555555', 
    fontSize: 13, 
    fontWeight: '600' 
  },
  activeRoomChipText: { 
    color: '#FFFFFF' 
  },
  /* header*/
  setupHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-end', 
    marginBottom: 12 
  },
  labelTitle: { 
    fontSize: 12, 
    color: '#7E8B9B', 
    textTransform: 'uppercase', 
    fontWeight: '600' 
  },
  setupTypeName: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#1A0D3F' 
  },
  seeImageLink: { 
    color: '#6C5CE7', 
    fontWeight: '600', 
    fontSize: 13 
  },
  /* imagem */
  imageWrapper: { 
    borderRadius: 12, 
    overflow: 'hidden', 
    height: 180, 
    marginBottom: 20 
  },
  setupImage: { 
    width: '100%', 
    height: '100%' 
  },
  /* Checklist */
  checklistSection: { 
    marginBottom: 30 
  },
  checklistTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: '#1A0D3F', 
    marginBottom: 12 
  },
  checkItemRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#BCC1C6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: { 
    backgroundColor: '#2ECC71', 
    borderColor: '#2ECC71' 
  },
  checkMark: { 
    color: '#FFFFFF', 
    fontSize: 12, 
    fontWeight: 'bold' 
  },
  checkText: { 
    fontSize: 14, 
    color: '#2C3E50', 
    flex: 1 
  },
  checkTextCompleted: { 
    color: '#95A5A6', 
    textDecorationLine: 'line-through' 
  },
  addCommentBtn: { 
    marginTop: 10 
  },
  addCommentText: { 
    color: '#1A0D3F', 
    fontWeight: '700', 
    fontSize: 14 
  },
  /* saved comment card  */
  commentCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    marginBottom: 8,
  },
  commentCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 2,
  },
  commentCardText: {
    fontSize: 13,
    color: '#92400E',
  },

  /* popup Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A0D3F',
  },
  closeButton: {
    fontSize: 18,
    fontWeight: '700',
    color: '#A0AEC0',
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    color: '#2D3748',
    minHeight: 90,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  btnCancel: {
    backgroundColor: '#EDF2F7',
  },
  btnCancelText: {
    color: '#4A5568',
    fontSize: 13,
    fontWeight: '600',
  },
  btnSave: {
    backgroundColor: '#1A0D3F',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});
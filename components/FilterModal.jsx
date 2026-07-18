import React from 'react';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';

const FILTER_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export default function FilterModal({ visible, selectedFilter, onSelect, onClose }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter events</Text>

          {FILTER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.modalOption}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text
                style={
                  selectedFilter === option.value
                    ? styles.modalOptionActive
                    : styles.modalOptionText
                }
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 260,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 10,
  },
  modalOptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
  },
  modalOptionActive: {
    fontSize: FONT_SIZES.md,
    color: COLORS.secondary,
    fontWeight: '700',
  },
});
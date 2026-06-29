import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/theme';

export default function Button({ title, onPress, variant = 'filled', color = 'primary' }) {
  const selectedColor = COLORS[color] || COLORS.primary;
  const isOutline = variant === 'outline';

  const buttonStyle = [
    styles.baseButton,
    isOutline ? styles.outlineButton : styles.filledButton,
    isOutline ? { borderColor: selectedColor } : { backgroundColor: selectedColor }
  ];

  const textStyle = [
    styles.baseText,
    { color: isOutline ? selectedColor : COLORS.white }
  ];

  return (
    <TouchableOpacity 
      style={buttonStyle} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    minWidth: 140,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filledButton: {
    borderWidth: 0,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
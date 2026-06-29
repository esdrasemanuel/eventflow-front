import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants/theme';

export default function InputField({ 
  label, 
  value, 
  onChangeText, 
  secureTextEntry, 
  rightActionText, 
  onRightActionPress,
  ...props 
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor={COLORS.textMuted}
          {...props}
        />
        
        {rightActionText && (
          <TouchableOpacity onPress={onRightActionPress} style={styles.rightAction}>
            <Text style={styles.rightActionText}>{rightActionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZES.sm - 2,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: SPACING.xs,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textDark,
    paddingVertical: SPACING.xs,
  },
  rightAction: {
    paddingLeft: SPACING.sm,
  },
  rightActionText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});

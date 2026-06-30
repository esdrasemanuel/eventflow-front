import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../constants/theme';
import Button from '../components/Button';
import { router } from 'expo-router';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, David! 👋</Text>
      <Text style={styles.subtitle}>This is your Event Flow dashboard.</Text>
      
      {/* just to teste router */}
      <Button 
        title="Log Out" 
        variant="outline" 
        color="primary" 
        onPress={() => router.replace('/')} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
});
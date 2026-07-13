import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Alert } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { router } from 'expo-router';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { loginService } from '../services/auth'; // Importing the API authentication service
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // UI state to manage loading feedback indicators
  const handleLogin = async () => {
    // Basic structural validation before executing network requests
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true); // Disable input elements and trigger loading state
    try {
      // Execute network transaction with backend database service
      const userData = await loginService(email, password);
      
      console.log('Login successful:', userData);

      // Save the entire user object (contains firstName, role, email, ....)
      await AsyncStorage.setItem('@EventFlow:user', JSON.stringify(userData.user));

      // Navigate to home
      router.replace('/home');
    } catch (error) {
      // Present rejection message returned by API to user
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false); // Restore UI components to interactive state
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitleMain}>Event</Text>
          <Text style={styles.headerTitleSub}>Flow</Text>
        </View>

        <View style={styles.formContainer}>
          
          <Text style={styles.screenLabel}>Login</Text>

          <InputField 
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address" 
          />

          <InputField 
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <View style={styles.buttonSpacing}>
            <Button 
              title={loading ? "Connecting..." : "Log In"} // Adaptive text feedback
              color="secondary"
              onPress={handleLogin}
              disabled={loading} // Prevents 
            />
          </View>
          
          {/* Footer  */}
          <View style={styles.footerBranding}>
            <Text style={styles.brandingText}>O'CALLAGHAN COLLECTION</Text>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerBlock: {
    height: '35%',
    backgroundColor: COLORS.accentPeach,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  headerTitleMain: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.lg,

  },
  headerTitleSub: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: -SPACING.lg,
    marginBottom: SPACING.xxl,
  },
  formContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  screenLabel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xl,
  },
  buttonSpacing: {
    width: '100%',
    marginTop: SPACING.md,
  },
  footerBranding: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  brandingText: {
    fontSize: FONT_SIZES.sm - 2,
    fontWeight: '600',
    color: COLORS.primary,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
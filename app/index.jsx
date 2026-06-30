import { useState } from 'react';

import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';
import { router } from 'expo-router';
import Button from '../components/Button';
import InputField from '../components/InputField';
export default function LoginScreen() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    router.replace('/home');
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
            label="User"
            value={username}
            onChangeText={setUsername}
          />

          <InputField 
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
          />

          <View style={styles.buttonSpacing}>
            <Button 
              title="Log In"
              color="secondary"
              onPress={handleLogin}
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
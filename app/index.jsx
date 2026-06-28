// app/index.jsx
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants/theme';

export default function LoginScreen() {

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} bounces={false}>
        
        {/* Top Half Banner Panel */}
        <View style={styles.headerBlock}>
          <Text style={styles.headerTitleMain}>Event</Text>
          <Text style={styles.headerTitleSub}>Flow</Text>

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
});
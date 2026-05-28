import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Phone, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const handleEmailAuth = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            setMessage({ text: 'Email not confirmed. Please check your inbox or disable Email Confirmations in Supabase.', type: 'error' });
          } else {
            throw error;
          }
          return;
        }
        router.replace('/(tabs)');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({ text: 'Account Created! Check your email for the confirmation link to log in.', type: 'success' });
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = (provider: string) => {
    Alert.alert('OAuth Config Required', `Configure ${provider} keys in your Supabase dashboard to enable this.`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background.base }]}>
      {/* Theme Toggle in Header */}
      <View style={styles.topHeader}>
        <Pressable onPress={toggleTheme} style={styles.themeToggleBtn}>
          {isDark ? <Moon size={20} color={colors.primary.base} /> : <Sun size={20} color={colors.primary.base} />}
        </Pressable>
      </View>

      <KeyboardAvoidingView style={styles.keyboardAvoid} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.headerContent}>
            <View style={[styles.shieldWrapper, { backgroundColor: colors.primary.light }]}>
              <ShieldCheck size={48} color={colors.primary.base} strokeWidth={2} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Surakshit</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>Together We Protect</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.border.base }]}>

            
            <View style={[styles.tabContainer, { backgroundColor: colors.background.base }]}>
              <Pressable 
                onPress={() => { setIsLogin(true); setMessage(null); }} 
                style={[styles.tabBtn, isLogin && styles.tabBtnActive, isLogin && { backgroundColor: colors.background.paper }]}
              >
                <Text style={[styles.tabText, { color: isLogin ? colors.primary.base : colors.text.tertiary }]}>Log In</Text>
              </Pressable>
              <Pressable 
                onPress={() => { setIsLogin(false); setMessage(null); }} 
                style={[styles.tabBtn, !isLogin && styles.tabBtnActive, !isLogin && { backgroundColor: colors.background.paper }]}
              >
                <Text style={[styles.tabText, { color: !isLogin ? colors.primary.base : colors.text.tertiary }]}>Sign Up</Text>
              </Pressable>
            </View>

            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, { backgroundColor: colors.background.base, borderColor: colors.border.strong }]}>
                <Mail size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Email Address"
                  placeholderTextColor={colors.text.tertiary}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={[styles.inputWrapper, { backgroundColor: colors.background.base, borderColor: colors.border.strong }]}>
                <Lock size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text.primary }]}
                  placeholder="Password"
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? (
                    <EyeOff size={20} color={colors.text.tertiary} />
                  ) : (
                    <Eye size={20} color={colors.text.tertiary} />
                  )}
                </Pressable>
              </View>
              
              {isLogin && (
                <Text style={[styles.forgotText, { color: colors.primary.base }]}>Forgot Password?</Text>
              )}
            </View>

            {message && (
              <View style={{ marginBottom: spacing.lg, padding: spacing.md, backgroundColor: message.type === 'error' ? '#FEE2E2' : '#D1FAE5', borderRadius: borderRadius.md }}>
                <Text style={{ color: message.type === 'error' ? '#DC2626' : '#059669', textAlign: 'center', fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
                  {message.text}
                </Text>
              </View>
            )}

            <Pressable 
              style={[styles.loginBtn, { backgroundColor: colors.primary.base }]} 
              onPress={handleEmailAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <Text style={[styles.loginBtnText, { color: colors.text.inverse }]}>
                  {isLogin ? 'LOG IN' : 'CREATE ACCOUNT'}
                </Text>
              )}
            </Pressable>

            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border.strong }]} />
              <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>OR CONTINUE WITH</Text>
              <View style={[styles.divider, { backgroundColor: colors.border.strong }]} />
            </View>

            <View style={styles.socialRow}>
              <Pressable style={[styles.socialBtn, { borderColor: colors.border.strong }]} onPress={() => handleOAuth('Google')}>
                <Text style={[styles.socialBtnText, { color: colors.text.primary }]}>G</Text>
              </Pressable>
              <Pressable style={[styles.socialBtn, { borderColor: colors.border.strong }]} onPress={() => handleOAuth('Apple')}>
                <Text style={[styles.socialBtnText, { color: colors.text.primary }]}>A</Text>
              </Pressable>
              <Pressable style={[styles.socialBtn, { borderColor: colors.border.strong }]} onPress={() => handleOAuth('Phone')}>
                <Phone size={20} color={colors.text.primary} />
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoid: { flex: 1 },
  topHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 10,
  },
  themeToggleBtn: {
    padding: 10,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
    paddingBottom: spacing['4xl'],
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  shieldWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xl,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
  inputContainer: {
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  inputIcon: {
    paddingLeft: spacing.lg,
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    fontSize: typography.sizes.md,
  },
  eyeIcon: {
    padding: spacing.md,
  },
  forgotText: {
    textAlign: 'right',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  loginBtn: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  loginBtnText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    fontSize: 10,
    fontWeight: typography.weights.bold,
    letterSpacing: 1,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  socialBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialBtnText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
});

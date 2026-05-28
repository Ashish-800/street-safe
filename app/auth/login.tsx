import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, Phone, Moon, Sun, User, ArrowRight } from 'lucide-react-native';
import { useTheme } from '../../src/theme/ThemeContext';
import { typography } from '../../src/theme/typography';
import { spacing, borderRadius } from '../../src/theme/spacing';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Controlled fields
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{text: string, type: 'error' | 'success'} | null>(null);

  const handleAuth = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }

    if (!isLogin && (!fullName || !phoneNumber)) {
      setMessage({ text: 'Please fill in your name and phone number to sign up.', type: 'error' });
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
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phoneNumber,
            }
          }
        });
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
            
            {/* Conditional Form Render */}
            {!isLogin && (
              <>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Full Name</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.background.base : '#F3F4F6', borderColor: colors.border.strong }]}>
                  <User size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="Priya Sharma"
                    placeholderTextColor={colors.text.tertiary}
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>

                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Phone Number</Text>
                <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.background.base : '#F3F4F6', borderColor: colors.border.strong }]}>
                  <Phone size={20} color={colors.text.tertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: colors.text.primary }]}
                    placeholder="+91 98765 43210"
                    placeholderTextColor={colors.text.tertiary}
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </>
            )}

            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Email Address</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.background.base : '#F3F4F6', borderColor: colors.border.strong }]}>
              <Mail size={20} color={colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.text.tertiary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>Password</Text>
            <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.background.base : '#F3F4F6', borderColor: colors.border.strong }]}>
              <Lock size={20} color={colors.text.tertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text.primary }]}
                placeholder="••••••••"
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

            {message && (
              <View style={[styles.messageBox, { backgroundColor: message.type === 'error' ? '#FEE2E2' : '#D1FAE5' }]}>
                <Text style={[styles.messageText, { color: message.type === 'error' ? '#DC2626' : '#059669' }]}>
                  {message.text}
                </Text>
              </View>
            )}

            {/* Action Submit Button */}
            <Pressable 
              style={[styles.submitBtn, { backgroundColor: colors.primary.base }]} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.text.inverse} />
              ) : (
                <>
                  <Text style={[styles.submitBtnText, { color: colors.text.inverse }]}>
                    {isLogin ? 'Log In' : 'Create Account'}
                  </Text>
                  <ArrowRight size={20} color={colors.text.inverse} />
                </>
              )}
            </Pressable>

            {/* Social Separator */}
            <View style={styles.dividerContainer}>
              <View style={[styles.divider, { backgroundColor: colors.border.strong }]} />
              <Text style={[styles.dividerText, { color: colors.text.tertiary }]}>OR CONTINUE WITH</Text>
              <View style={[styles.divider, { backgroundColor: colors.border.strong }]} />
            </View>

            {/* Wide Google Button */}
            <Pressable 
              style={[styles.googleBtn, { backgroundColor: colors.background.paper, borderColor: colors.border.strong }]} 
              onPress={() => handleOAuth('Google')}
            >
              <Text style={styles.googleIconText}>G</Text>
              <Text style={[styles.googleBtnText, { color: colors.text.primary }]}>Google</Text>
            </Pressable>

            {/* Bottom Toggle Link */}
            <View style={styles.toggleFooter}>
              <Text style={[styles.footerText, { color: colors.text.secondary }]}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <Pressable onPress={() => { setIsLogin(!isLogin); setMessage(null); }}>
                <Text style={[styles.footerLink, { color: colors.primary.base }]}>
                  {isLogin ? 'Sign up' : 'Log in'}
                </Text>
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
    paddingTop: 60,
    paddingBottom: spacing['4xl'],
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  shieldWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  inputLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 54,
    marginBottom: 10,
  },
  inputIcon: {
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingRight: spacing.lg,
    fontSize: typography.sizes.md,
  },
  eyeIcon: {
    padding: spacing.md,
  },
  forgotText: {
    textAlign: 'right',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    marginTop: 4,
    marginBottom: 10,
  },
  messageBox: {
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  messageText: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  submitBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  submitBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    marginRight: 8,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.md,
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
  googleBtn: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  googleIconText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EA4335', // Google Red
    marginRight: 8,
  },
  googleBtnText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
  },
  toggleFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  footerText: {
    fontSize: typography.sizes.sm,
  },
  footerLink: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },
});

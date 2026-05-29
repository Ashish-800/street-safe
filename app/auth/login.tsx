import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ShieldCheck, Mail, Lock, User, ChevronRight, Sun, Moon, Phone } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { signIn, signUp } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  const handleAuth = async () => {
    setMessage(null);
    if (!email || !password) {
      setMessage({ text: 'Please enter both email and password.', type: 'error' });
      return;
    }
    if (!isLogin && !fullName) {
      setMessage({ text: 'Please enter your full name to sign up.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message?.includes('Email not confirmed')) {
            setMessage({ text: 'Email not confirmed. Check your inbox.', type: 'error' });
          } else {
            setMessage({ text: error.message || 'Login failed', type: 'error' });
          }
          return;
        }
        router.replace('/(tabs)');
      } else {
        const { error } = await signUp(email, password, fullName, phoneNumber);
        if (error) {
          setMessage({ text: error.message || 'Sign up failed', type: 'error' });
          return;
        }
        setMessage({ text: 'Account created! You can now log in.', type: 'success' });
        // Auto-login after signup
        const loginResult = await signIn(email, password);
        if (!loginResult.error) {
          router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'Authentication failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputBorderColor = (field: string) =>
    focusedField === field ? colors.primary : colors.border;

  const inputBg = (field: string) =>
    focusedField === field ? (isDark ? colors.primaryBg : '#FFF8F0') : (isDark ? colors.paperAlt : colors.paper);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Theme toggle */}
      <Pressable onPress={toggleTheme} style={styles.themeToggle}>
        {isDark ? <Sun size={22} color={colors.primary} /> : <Moon size={22} color={colors.primary} />}
      </Pressable>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoArea}>
            <LinearGradient colors={['#F97316', '#EA580C']} style={styles.logoBox}>
              <ShieldCheck size={36} color="#FFF" strokeWidth={2} />
            </LinearGradient>
            <Text style={[styles.appName, { color: colors.text }]}>StreetSafe</Text>
            <Text style={[styles.appTagline, { color: colors.textMuted }]}>Women's Safety · Kolkata</Text>
          </View>

          {/* Tab Switcher */}
          <View style={[styles.tabContainer, { backgroundColor: colors.paperAlt }]}>
            <Pressable
              onPress={() => { setIsLogin(true); setMessage(null); }}
              style={styles.tabBtn}
            >
              {isLogin ? (
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.tabActive}>
                  <Text style={styles.tabActiveText}>Log In</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={[styles.tabInactiveText, { color: colors.textMuted }]}>Log In</Text>
                </View>
              )}
            </Pressable>
            <Pressable
              onPress={() => { setIsLogin(false); setMessage(null); }}
              style={styles.tabBtn}
            >
              {!isLogin ? (
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.tabActive}>
                  <Text style={styles.tabActiveText}>Sign Up</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Text style={[styles.tabInactiveText, { color: colors.textMuted }]}>Sign Up</Text>
                </View>
              )}
            </Pressable>
          </View>

          {/* Form */}
          <View style={[styles.formCard, { backgroundColor: colors.paper, borderColor: colors.border }]}>

            {!isLogin && (
              <View style={[styles.inputRow, { borderColor: inputBorderColor('name'), backgroundColor: inputBg('name') }]}>
                <User size={15} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Full Name"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            <View style={[styles.inputRow, { borderColor: inputBorderColor('email'), backgroundColor: inputBg('email') }]}>
              <Mail size={15} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[styles.inputRow, { borderColor: inputBorderColor('password'), backgroundColor: inputBg('password') }]}>
              <Lock size={15} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password (min 6 chars)"
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                {showPassword ? <EyeOff size={18} color={colors.textMuted} /> : <Eye size={18} color={colors.textMuted} />}
              </Pressable>
            </View>

            {!isLogin && (
              <View style={[styles.inputRow, { borderColor: inputBorderColor('phone'), backgroundColor: inputBg('phone') }]}>
                <Phone size={15} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Phone number (optional)"
                  placeholderTextColor={colors.textMuted}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            )}

            {message && (
              <View style={[styles.msgBox, { backgroundColor: message.type === 'error' ? colors.emergencyBg : colors.safeBg }]}>
                <Text style={{ color: message.type === 'error' ? colors.emergency : colors.safe, fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
                  {message.text}
                </Text>
              </View>
            )}

            {/* CTA */}
            <Pressable onPress={handleAuth} disabled={loading} style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] })}>
              <LinearGradient colors={['#F97316', '#EA580C']} style={styles.ctaBtn}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.ctaBtnText}>{isLogin ? 'Log In' : 'Create Account'}</Text>
                    <ChevronRight size={20} color="#FFF" />
                  </>
                )}
              </LinearGradient>
            </Pressable>

            {/* Footer link */}
            <View style={styles.footerRow}>
              <Text style={{ color: colors.textSub, fontSize: 14 }}>
                {isLogin ? "New here? " : "Already have an account? "}
              </Text>
              <Pressable onPress={() => { setIsLogin(!isLogin); setMessage(null); }}>
                <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '700' }}>
                  {isLogin ? 'Sign Up' : 'Log In'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Quick login hint */}
          <View style={[styles.hintCard, { backgroundColor: colors.infoBg, borderColor: colors.info + '30' }]}>
            <Text style={{ fontSize: 11, color: colors.info, textAlign: 'center' }}>
              💡 Offline mode: Any email/password works for demo. Sign up with your real details for full functionality.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  themeToggle: {
    position: 'absolute', top: Platform.OS === 'ios' ? 54 : 24, right: 20, zIndex: 10, padding: 8,
  },
  scrollContent: {
    flexGrow: 1, paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40, justifyContent: 'center',
  },
  logoArea: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    shadowColor: 'rgba(249,115,22,0.4)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 20, elevation: 8,
  },
  appName: { fontSize: 28, fontWeight: '900', marginTop: 12, letterSpacing: -1 },
  appTagline: { fontSize: 13, marginTop: 4 },
  tabContainer: {
    flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20,
  },
  tabBtn: { flex: 1 },
  tabActive: {
    paddingVertical: 12, borderRadius: 11, alignItems: 'center',
    shadowColor: 'rgba(249,115,22,0.38)', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 1, shadowRadius: 14, elevation: 6,
  },
  tabActiveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  tabInactive: { paddingVertical: 12, alignItems: 'center' },
  tabInactiveText: { fontSize: 15, fontWeight: '600' },
  formCard: {
    borderRadius: 20, padding: 20, borderWidth: 1,
    shadowColor: 'rgba(0,0,0,0.06)', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 12, elevation: 3,
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 13, borderWidth: 1.5, marginBottom: 12, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: '100%', fontSize: 14 },
  eyeBtn: { padding: 8 },
  msgBox: { padding: 12, borderRadius: 12, marginBottom: 12 },
  ctaBtn: {
    height: 52, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: 'rgba(249,115,22,0.45)', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 22, elevation: 8,
  },
  ctaBtnText: { color: '#FFF', fontSize: 15, fontWeight: '800', marginRight: 6 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  hintCard: {
    marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1,
  },
});

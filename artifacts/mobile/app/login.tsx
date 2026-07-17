import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/lib/auth';
import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (!password) { setError('Please enter your password.'); return; }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={styles.hero}>
          <View style={[styles.iconRing, { borderColor: colors.primary }]}>
            <Feather name="film" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.brand, { color: colors.foreground }]}>
            FURNACE SHOWS
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.primary }]} />
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={[styles.heading, { color: colors.foreground }]}>
            Sign in
          </Text>
          <Text style={[styles.sub, { color: colors.mutedForeground }]}>
            Welcome back — pick up where you left off
          </Text>

          {/* Email */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Email</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={16}
                  color={colors.mutedForeground}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: '#2A1A1A', borderColor: '#EF4444' }]}>
              <Feather name="alert-circle" size={14} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                Sign In
              </Text>
            </TouchableOpacity>
          )}

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Don't have an account?{' '}
            </Text>
            <Link href="/register" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>
                  Create one
                </Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, flexGrow: 1 },
  hero: { alignItems: 'center', gap: 12, marginBottom: 36 },
  iconRing: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  brand: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  divider: { width: 40, height: 3, borderRadius: 2 },

  form: { gap: 16 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 4 },

  field: { gap: 6 },
  label: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, height: 48, fontSize: 15, fontFamily: 'Inter_400Regular' },
  eyeBtn: { padding: 8 },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 10, padding: 12,
  },
  errorText: { color: '#EF4444', fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },

  loadingWrap: { height: 52, alignItems: 'center', justifyContent: 'center' },
  submitBtn: {
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-compute all themed styles as plain objects — no arrays in JSX.
  const themed = {
    screen: { flex: 1, backgroundColor: colors.background } as const,
    backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: colors.secondary, marginBottom: 24 },
    heading: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 6, color: colors.foreground },
    sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20, marginBottom: 20, color: colors.mutedForeground },
    label: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground },
    labelMt: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.mutedForeground, marginTop: 16 },
    inputWrap: { flexDirection: 'row' as const, alignItems: 'center' as const, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, backgroundColor: colors.card, borderColor: colors.border },
    inputWrapMt: { flexDirection: 'row' as const, alignItems: 'center' as const, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, backgroundColor: colors.card, borderColor: colors.border, marginTop: 6 },
    input: { flex: 1, height: 48, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.foreground },
    submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' as const, marginTop: 20, backgroundColor: colors.primary },
    submitBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.primaryForeground },
    footerText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
    footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.primary },
  };

  const handleRegister = async () => {
    setError('');
    if (!firstName.trim()) { setError('Please enter your first name.'); return; }
    if (!email.trim()) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    const result = await register(firstName.trim(), lastName.trim(), email.trim(), password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  return (
    <KeyboardAvoidingView
      style={themed.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <TouchableOpacity
          style={themed.backBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={20} color={colors.foreground} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={themed.heading}>Create account</Text>
        <Text style={themed.sub}>
          Join Furnace Shows and start booking live performances
        </Text>

        {/* Name row */}
        <View style={styles.row}>
          {/* First name */}
          <View style={styles.halfField}>
            <Text style={themed.label}>First name</Text>
            <View style={themed.inputWrap}>
              <Feather name="user" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={themed.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Ada"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Last name */}
          <View style={styles.halfField}>
            <Text style={themed.label}>Last name</Text>
            <View style={themed.inputWrap}>
              <Feather name="user" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={themed.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Lovelace"
                placeholderTextColor={colors.mutedForeground}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          </View>
        </View>

        {/* Email */}
        <Text style={themed.labelMt}>Email</Text>
        <View style={themed.inputWrapMt}>
          <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={themed.input}
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

        {/* Password */}
        <Text style={themed.labelMt}>Password</Text>
        <View style={themed.inputWrapMt}>
          <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={themed.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 6 characters"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPassword}
            returnKeyType="next"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
            <Feather
              name={showPassword ? 'eye-off' : 'eye'}
              size={16}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        {/* Confirm password */}
        <Text style={themed.labelMt}>Confirm password</Text>
        <View style={themed.inputWrapMt}>
          <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={themed.input}
            value={confirm}
            onChangeText={setConfirm}
            placeholder="••••••••"
            placeholderTextColor={colors.mutedForeground}
            secureTextEntry={!showPassword}
            returnKeyType="go"
            onSubmitEditing={handleRegister}
          />
        </View>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
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
            style={themed.submitBtn}
            onPress={handleRegister}
            activeOpacity={0.85}
          >
            <Text style={themed.submitBtnText}>Create Account</Text>
          </TouchableOpacity>
        )}

        {/* Login link */}
        <View style={styles.footer}>
          <Text style={themed.footerText}>Already have an account? </Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.replace('/login')}>
            <Text style={themed.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Only static (non-themed) styles go here.
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginTop: 0 },
  halfField: { flex: 1, gap: 6 },
  inputIcon: { marginRight: 8 },
  eyeBtn: { padding: 8 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    backgroundColor: '#2A1A1A',
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  loadingWrap: { height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
});

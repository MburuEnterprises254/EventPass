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

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts: {
      icon: keyof typeof Feather.glyphMap;
      placeholder: string;
      keyboardType?: 'email-address' | 'default';
      autoCapitalize?: 'none' | 'words';
      autoComplete?: 'email' | 'name' | 'password' | 'password-new' | 'off';
      secureTextEntry?: boolean;
      returnKeyType?: 'next' | 'go';
      onSubmitEditing?: () => void;
      rightElement?: React.ReactNode;
    },
  ) => (
    <View style={styles.field}>
      <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name={opts.icon} size={16} color={colors.mutedForeground} style={styles.inputIcon} />
        <TextInput
          style={[styles.input, { color: colors.foreground }]}
          value={value}
          onChangeText={onChange}
          placeholder={opts.placeholder}
          placeholderTextColor={colors.mutedForeground}
          keyboardType={opts.keyboardType ?? 'default'}
          autoCapitalize={opts.autoCapitalize ?? 'none'}
          autoComplete={opts.autoComplete}
          secureTextEntry={opts.secureTextEntry}
          returnKeyType={opts.returnKeyType ?? 'next'}
          onSubmitEditing={opts.onSubmitEditing}
        />
        {opts.rightElement}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Link href="/login" asChild>
            <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.secondary }]}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.titleBlock}>
            <Text style={[styles.heading, { color: colors.foreground }]}>Create account</Text>
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              Join Furnace Shows and start booking live performances
            </Text>
          </View>

          {/* Name row */}
          <View style={styles.row}>
            {field('First name', firstName, setFirstName, {
              icon: 'user',
              placeholder: 'Ada',
              autoCapitalize: 'words',
              autoComplete: 'name',
            })}
            {field('Last name', lastName, setLastName, {
              icon: 'user',
              placeholder: 'Lovelace',
              autoCapitalize: 'words',
              autoComplete: 'off',
            })}
          </View>

          {field('Email', email, setEmail, {
            icon: 'mail',
            placeholder: 'you@example.com',
            keyboardType: 'email-address',
            autoComplete: 'email',
          })}

          {field('Password', password, setPassword, {
            icon: 'lock',
            placeholder: '••••••••',
            autoComplete: 'password-new',
            secureTextEntry: !showPassword,
            rightElement: (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            ),
          })}

          {field('Confirm password', confirm, setConfirm, {
            icon: 'lock',
            placeholder: '••••••••',
            autoComplete: 'password-new',
            secureTextEntry: !showPassword,
            returnKeyType: 'go',
            onSubmitEditing: handleRegister,
          })}

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
              onPress={handleRegister}
              activeOpacity={0.85}
            >
              <Text style={[styles.submitBtnText, { color: colors.primaryForeground }]}>
                Create Account
              </Text>
            </TouchableOpacity>
          )}

          {/* Login link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
              Already have an account?{' '}
            </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
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
  header: { marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  form: { gap: 16 },
  titleBlock: { gap: 6, marginBottom: 4 },
  heading: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  sub: { fontSize: 14, fontFamily: 'Inter_400Regular', lineHeight: 20 },

  row: { flexDirection: 'row', gap: 12 },
  field: { gap: 6, flex: 1 },
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
  submitBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  submitBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },

  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  footerText: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footerLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});

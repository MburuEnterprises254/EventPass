import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/lib/auth';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuth();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 40,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      {/* Brand hero */}
      <View style={styles.hero}>
        <View style={[styles.iconRing, { borderColor: colors.primary }]}>
          <Feather name="film" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.foreground }]}>
          FURNACE{'\n'}SHOWS
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.primary }]} />
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Live performances that move,{'\n'}challenge, and inspire
        </Text>
      </View>

      {/* Sign-in section */}
      <View style={styles.bottom}>
        <Text style={[styles.prompt, { color: colors.mutedForeground }]}>
          Sign in to browse shows and manage your bookings
        </Text>

        {isLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
            onPress={login}
          >
            <Feather name="log-in" size={20} color={colors.primaryForeground} />
            <Text style={[styles.loginBtnText, { color: colors.primaryForeground }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  iconRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 44,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
    letterSpacing: -1,
    lineHeight: 48,
  },
  divider: {
    width: 48,
    height: 3,
    borderRadius: 2,
  },
  tagline: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 23,
  },
  bottom: {
    gap: 16,
  },
  prompt: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingWrap: {
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 16,
    paddingVertical: 18,
  },
  loginBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
});

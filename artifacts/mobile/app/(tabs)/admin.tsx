import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function PinLogin() {
  const colors = useColors();
  const { loginAdmin } = useApp();
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  function handleLogin() {
    if (loginAdmin(pin)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setError(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(true);
      setPin('');
    }
  }

  function handleKey(key: string) {
    if (key === 'del') {
      setPin((p) => p.slice(0, -1));
    } else if (pin.length < 4) {
      const next = pin + key;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => {
          if (loginAdmin(next)) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setError(false);
          } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setError(true);
            setPin('');
          }
        }, 100);
      }
    }
  }

  const KEYS = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']];

  return (
    <View style={[styles.loginContainer, { backgroundColor: colors.background, paddingTop: Platform.OS === 'web' ? 67 + 40 : insets.top + 40 }]}>
      <View style={[styles.lockIcon, { backgroundColor: colors.secondary }]}>
        <Feather name="shield" size={32} color={colors.primary} />
      </View>
      <Text style={[styles.loginTitle, { color: colors.foreground }]}>Admin Access</Text>
      <Text style={[styles.loginSub, { color: colors.mutedForeground }]}>Enter your 4-digit PIN</Text>

      {/* PIN Dots */}
      <View style={styles.pinDots}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i < pin.length ? colors.primary : colors.border,
                borderColor: error ? colors.destructive : i < pin.length ? colors.primary : colors.border,
              },
            ]}
          />
        ))}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.destructive }]}>Incorrect PIN</Text>}

      {/* Keypad */}
      <View style={styles.keypad}>
        {KEYS.map((row, ri) => (
          <View key={ri} style={styles.keyRow}>
            {row.map((key, ki) => (
              <TouchableOpacity
                key={ki}
                style={[
                  styles.key,
                  {
                    backgroundColor: key === '' ? 'transparent' : colors.secondary,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => key && handleKey(key)}
                activeOpacity={key ? 0.7 : 1}
                disabled={!key}
              >
                {key === 'del' ? (
                  <Feather name="delete" size={20} color={colors.foreground} />
                ) : (
                  <Text style={[styles.keyText, { color: colors.foreground }]}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

function AdminDashboard() {
  const colors = useColors();
  const { shows, bookings, payments, logoutAdmin } = useApp();
  const insets = useSafeAreaInsets();

  const totalRevenue = bookings.reduce((sum, b) => sum + b.amount, 0);
  const pendingPayments = payments.filter((p) => !p.verified).length;

  const actions = [
    { label: 'Manage Shows', icon: 'film', route: '/admin-panel/shows', count: shows.length },
    { label: 'Bookings', icon: 'bookmark', route: '/admin-panel/bookings', count: bookings.length },
    { label: 'Payments', icon: 'credit-card', route: '/admin-panel/payments', count: pendingPayments },
  ] as const;

  function confirmLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logoutAdmin },
    ]);
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.dashContainer,
        { paddingTop: Platform.OS === 'web' ? 67 + 20 : insets.top + 16, paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 100 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.dashHeader}>
        <View>
          <Text style={[styles.dashTitle, { color: colors.foreground }]}>Admin Panel</Text>
          <Text style={[styles.dashSub, { color: colors.mutedForeground }]}>FURNACE SHOWS</Text>
        </View>
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.secondary }]}
          onPress={confirmLogout}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color={colors.destructive} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { label: 'Total Shows', value: shows.length.toString(), icon: 'film', color: '#6D28D9' },
          { label: 'Bookings', value: bookings.length.toString(), icon: 'bookmark', color: '#059669' },
          { label: 'Revenue', value: `KES ${(totalRevenue / 1000).toFixed(0)}K`, icon: 'trending-up', color: '#E8B84B' },
          { label: 'Pending', value: pendingPayments.toString(), icon: 'clock', color: '#EF4444' },
        ].map((stat) => (
          <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: stat.color + '22' }]}>
              <Feather name={stat.icon as any} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.actions}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
            onPress={() => router.push(action.route as any)}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={action.icon as any} size={22} color={colors.primary} />
            </View>
            <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
            {action.count > 0 && (
              <View style={[styles.actionCount, { backgroundColor: colors.primary }]}>
                <Text style={[styles.actionCountText, { color: colors.primaryForeground }]}>{action.count}</Text>
              </View>
            )}
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Recent Bookings */}
      {bookings.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Bookings</Text>
          {bookings.slice(-3).reverse().map((b) => (
            <View key={b.id} style={[styles.recentItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.recentName, { color: colors.foreground }]}>{b.customerName}</Text>
                <Text style={[styles.recentCode, { color: colors.mutedForeground }]}>{b.bookingCode}</Text>
              </View>
              <Text style={[styles.recentAmount, { color: colors.primary }]}>KES {b.amount.toLocaleString()}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

export default function AdminScreen() {
  const { isAdmin } = useApp();
  return isAdmin ? <AdminDashboard /> : <PinLogin />;
}

const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  loginTitle: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
  },
  loginSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginBottom: 8,
  },
  pinDots: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  keypad: {
    gap: 12,
    marginTop: 16,
    width: '100%',
    maxWidth: 260,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  key: {
    width: 72,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyText: {
    fontSize: 24,
    fontFamily: 'Inter_400Regular',
  },
  dashContainer: {
    paddingHorizontal: 16,
    gap: 16,
  },
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  dashTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  dashSub: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    letterSpacing: 1,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginTop: 4,
  },
  actions: {
    gap: 10,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  actionCount: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  actionCountText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  recentName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  recentCode: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  recentAmount: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
});

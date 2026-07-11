import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/lib/auth';
import BookingCard from '@/components/BookingCard';
import { Booking } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  const colors = useColors();
  const { bookings, shows } = useApp();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime(),
  );

  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'User';
  const avatarLetter = (user?.firstName?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList<Booking>
        data={sortedBookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 100 },
        ]}
        ListHeaderComponent={
          <View style={{ paddingTop: Platform.OS === 'web' ? 67 + 20 : insets.top + 16 }}>
            {/* User profile row */}
            {user && (
              <View style={[styles.profileRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.avatarText, { color: colors.primary }]}>{avatarLetter}</Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: colors.foreground }]} numberOfLines={1}>
                    {displayName}
                  </Text>
                  {user.email ? (
                    <Text style={[styles.userEmail, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {user.email}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={[styles.logoutBtn, { backgroundColor: '#2A1A1A' }]}
                  onPress={logout}
                  activeOpacity={0.8}
                >
                  <Feather name="log-out" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            )}

            {/* Section heading */}
            <View style={styles.sectionHead}>
              <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Bookings</Text>
              <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}>
              <Feather name="bookmark" size={32} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No bookings yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Book a show to see your tickets here
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BookingCard
            booking={item}
            show={shows.find((s) => s.id === item.showId)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 0 },

  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  userEmail: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHead: { paddingBottom: 16, gap: 2 },
  headerTitle: { fontSize: 28, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },

  empty: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
});

import React from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import BookingCard from '@/components/BookingCard';
import { Booking } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingsScreen() {
  const colors = useColors();
  const { bookings, shows } = useApp();
  const insets = useSafeAreaInsets();

  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime(),
  );

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
          <View style={[styles.header, { paddingTop: Platform.OS === 'web' ? 67 + 20 : insets.top + 16 }]}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>My Bookings</Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </Text>
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
  container: {
    flex: 1,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  header: {
    paddingBottom: 20,
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});

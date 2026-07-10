import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Booking } from '@/types';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLORS = {
  pending: { bg: '#2A2010', text: '#F59E0B', label: 'Pending' },
  paid: { bg: '#0F2A1A', text: '#22C55E', label: 'Paid' },
  verified: { bg: '#0F1F2A', text: '#3B82F6', label: 'Verified' },
};

export default function AdminBookingsScreen() {
  const colors = useColors();
  const { bookings, shows } = useApp();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');

  const filtered = bookings.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.customerName.toLowerCase().includes(q) ||
      b.bookingCode.toLowerCase().includes(q) ||
      b.phone.includes(q)
    );
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.bookingTime).getTime() - new Date(a.bookingTime).getTime(),
  );

  function renderItem({ item }: { item: Booking }) {
    const show = shows.find((s) => s.id === item.showId);
    const status = STATUS_COLORS[item.paymentStatus];
    return (
      <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={[styles.name, { color: colors.foreground }]}>{item.customerName}</Text>
            <Text style={[styles.phone, { color: colors.mutedForeground }]}>{item.phone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Show</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]} numberOfLines={1}>
              {show?.title ?? '—'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Code</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>{item.bookingCode}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Seats</Text>
            <Text style={[styles.detailValue, { color: colors.foreground }]}>
              {item.seats.sort().join(', ')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: colors.primary }]}>
              KES {item.amount.toLocaleString()}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>Booked</Text>
            <Text style={[styles.detailValue, { color: colors.mutedForeground }]}>
              {formatTime(item.bookingTime)}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search */}
      <View style={[styles.searchContainer, { paddingTop: Platform.OS === 'web' ? 8 : 4 }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, code, or phone..."
            placeholderTextColor={colors.mutedForeground}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[styles.countText, { color: colors.mutedForeground }]}>
          {sorted.length} booking{sorted.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList<Booking>
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="bookmark" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              {search ? 'No matching bookings' : 'No bookings yet'}
            </Text>
          </View>
        }
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular' },
  countText: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  list: { padding: 16, paddingTop: 8, gap: 12 },
  item: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  phone: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  divider: { height: 1 },
  details: { gap: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 },
  detailLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', flex: 1 },
  detailValue: { fontSize: 13, fontFamily: 'Inter_500Medium', flex: 2, textAlign: 'right' },
  empty: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});

import React, { useState } from 'react';
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
import { Payment } from '@/types';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-KE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

type Filter = 'all' | 'pending' | 'verified';

export default function AdminPaymentsScreen() {
  const colors = useColors();
  const { payments, bookings, verifyPayment } = useApp();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = payments.filter((p) => {
    if (filter === 'pending') return !p.verified;
    if (filter === 'verified') return p.verified;
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.paymentTime).getTime() - new Date(a.paymentTime).getTime(),
  );

  function handleVerify(payment: Payment) {
    verifyPayment(payment.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function renderItem({ item }: { item: Payment }) {
    const booking = bookings.find((b) => b.id === item.bookingId);
    return (
      <View style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.itemHeader}>
          <View>
            <Text style={[styles.mpesaCode, { color: colors.primary }]}>{item.mpesaCode}</Text>
            <Text style={[styles.time, { color: colors.mutedForeground }]}>{formatTime(item.paymentTime)}</Text>
          </View>
          {item.verified ? (
            <View style={[styles.verifiedBadge, { backgroundColor: '#0F1F2A' }]}>
              <Feather name="check-circle" size={14} color="#3B82F6" />
              <Text style={[styles.verifiedText, { color: '#3B82F6' }]}>Verified</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.verifyBtn, { backgroundColor: '#E8B84B' }]}
              activeOpacity={0.85}
              onPress={() => handleVerify(item)}
            >
              <Feather name="check" size={14} color="#09090E" />
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {booking && (
          <View style={styles.details}>
            {[
              { label: 'Customer', value: booking.customerName },
              { label: 'Booking', value: booking.bookingCode },
              { label: 'Seats', value: booking.seats.sort().join(', ') },
              { label: 'Amount', value: `KES ${item.amount.toLocaleString()}` },
            ].map((row) => (
              <View key={row.label} style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{row.label}</Text>
                <Text style={[styles.detailValue, { color: colors.foreground }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }

  const pendingCount = payments.filter((p) => !p.verified).length;
  const verifiedCount = payments.filter((p) => p.verified).length;

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: payments.length },
    { key: 'pending', label: 'Pending', count: pendingCount },
    { key: 'verified', label: 'Verified', count: verifiedCount },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { borderBottomColor: colors.border }]}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterTab,
              {
                borderBottomColor: filter === f.key ? colors.primary : 'transparent',
                borderBottomWidth: 2,
              },
            ]}
            onPress={() => setFilter(f.key)}
            activeOpacity={0.8}
          >
            <Text style={[
              styles.filterLabel,
              { color: filter === f.key ? colors.primary : colors.mutedForeground },
            ]}>
              {f.label}
            </Text>
            {f.count > 0 && (
              <View style={[
                styles.filterCount,
                { backgroundColor: filter === f.key ? colors.primary : colors.secondary },
              ]}>
                <Text style={[
                  styles.filterCountText,
                  { color: filter === f.key ? colors.primaryForeground : colors.mutedForeground },
                ]}>
                  {f.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList<Payment>
        data={sorted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 20 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="credit-card" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No {filter === 'all' ? '' : filter} payments
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
  filterContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  filterTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12,
  },
  filterLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  filterCount: {
    minWidth: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
  },
  filterCountText: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  list: { padding: 16, gap: 12 },
  item: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mpesaCode: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  time: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 2 },
  verifiedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
  },
  verifiedText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  verifyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  verifyBtnText: { fontSize: 13, fontFamily: 'Inter_700Bold', color: '#09090E' },
  divider: { height: 1 },
  details: { gap: 6 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  detailValue: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  empty: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
});

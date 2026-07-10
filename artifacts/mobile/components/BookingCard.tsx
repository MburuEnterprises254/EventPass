import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Booking, Show } from '@/types';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

interface Props {
  booking: Booking;
  show: Show | undefined;
}

const STATUS_COLORS = {
  pending: { bg: '#2A2010', text: '#F59E0B', label: 'Pending' },
  paid: { bg: '#0F2A1A', text: '#22C55E', label: 'Paid' },
  verified: { bg: '#0F1F2A', text: '#3B82F6', label: 'Verified' },
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function BookingCard({ booking, show }: Props) {
  const colors = useColors();
  const status = STATUS_COLORS[booking.paymentStatus];

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
      onPress={() => router.push({ pathname: '/receipt/[id]', params: { id: booking.id } })}
    >
      <View style={styles.topRow}>
        <View style={styles.codeContainer}>
          <Text style={[styles.code, { color: colors.primary }]}>{booking.bookingCode}</Text>
          <Text style={[styles.receipt, { color: colors.mutedForeground }]}>{booking.receiptNo}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
      </View>

      <Text style={[styles.showTitle, { color: colors.foreground }]} numberOfLines={1}>
        {show?.title ?? 'Unknown Show'}
      </Text>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Feather name="map-pin" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]} numberOfLines={1}>
            {show?.venue ?? '—'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Feather name="calendar" size={12} color={colors.mutedForeground} />
          <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
            {show ? formatDate(show.date) : '—'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.seatsContainer}>
          <Feather name="grid" size={12} color={colors.mutedForeground} />
          <Text style={[styles.seats, { color: colors.mutedForeground }]}>
            {booking.seats.join(', ')}
          </Text>
        </View>
        <Text style={[styles.amount, { color: colors.primary }]}>
          KES {booking.amount.toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  codeContainer: {
    gap: 2,
  },
  code: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
  receipt: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  showTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  details: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#222230',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seats: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  amount: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
  },
});

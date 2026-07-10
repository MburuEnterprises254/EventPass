import React from 'react';
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(isoStr: string): string {
  const date = new Date(isoStr);
  return date.toLocaleString('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

const STATUS_COLORS = {
  pending: { bg: '#2A2010', text: '#F59E0B', label: 'PENDING VERIFICATION' },
  paid: { bg: '#0F2A1A', text: '#22C55E', label: 'PAID' },
  verified: { bg: '#0F1F2A', text: '#3B82F6', label: 'VERIFIED' },
};

export default function ReceiptScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, shows } = useApp();
  const insets = useSafeAreaInsets();

  const booking = bookings.find((b) => b.id === id);
  const show = shows.find((s) => s.id === booking?.showId);
  const status = booking ? STATUS_COLORS[booking.paymentStatus] : null;

  if (!booking || !show || !status) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Receipt not found</Text>
      </View>
    );
  }

  async function handleShare() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const text = `
━━━━━━━━━━━━━━━━━━━━━━━━
FURNACE SHOWS
BOOKING RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━
Receipt No:   ${booking.receiptNo}
Booking Code: ${booking.bookingCode}
━━━━━━━━━━━━━━━━━━━━━━━━
Customer: ${booking.customerName}
Phone:    ${booking.phone}
━━━━━━━━━━━━━━━━━━━━━━━━
Show:   ${show.title}
Venue:  ${show.venue}
Date:   ${formatDate(show.date)}
Time:   ${show.time}
Seats:  ${booking.seats.sort().join(', ')}
━━━━━━━━━━━━━━━━━━━━━━━━
Amount Paid:  KES ${booking.amount.toLocaleString()}
M-Pesa Code:  ${booking.mpesaCode}
Status:       ${status.label}
━━━━━━━━━━━━━━━━━━━━━━━━
Thank you for booking with Furnace Shows!
`.trim();
    await Share.share({ message: text, title: 'Furnace Shows — Booking Receipt' });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16, paddingBottom: 120 },
        ]}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.push('/')}
          >
            <Feather name="home" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Booking Receipt</Text>
        </View>

        {/* Success Banner */}
        <View style={[styles.successBanner, { backgroundColor: '#0F2A1A', borderColor: '#22C55E40' }]}>
          <View style={[styles.successIcon, { backgroundColor: '#22C55E22' }]}>
            <Feather name="check-circle" size={32} color="#22C55E" />
          </View>
          <Text style={[styles.successTitle, { color: '#F0EFE8' }]}>Booking Confirmed!</Text>
          <Text style={[styles.successSub, { color: 'rgba(240,239,232,0.6)' }]}>
            Your seats have been reserved. Enjoy the show!
          </Text>
        </View>

        {/* Receipt Card */}
        <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Theatre Header */}
          <View style={styles.receiptHeader}>
            <Text style={[styles.theatreName, { color: colors.primary }]}>FURNACE SHOWS</Text>
            <Text style={[styles.receiptTitle, { color: colors.mutedForeground }]}>BOOKING RECEIPT</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Receipt Details */}
          {[
            { label: 'Receipt No', value: booking.receiptNo, highlight: true },
            { label: 'Booking Code', value: booking.bookingCode, highlight: true },
          ].map((item) => (
            <View key={item.label} style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.receiptValue, { color: item.highlight ? colors.primary : colors.foreground }]}>
                {item.value}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Customer */}
          {[
            { label: 'Customer', value: booking.customerName },
            { label: 'Phone', value: booking.phone },
          ].map((item) => (
            <View key={item.label} style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.receiptValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Show Details */}
          {[
            { label: 'Show', value: show.title },
            { label: 'Venue', value: show.venue },
            { label: 'Date', value: formatDate(show.date) },
            { label: 'Time', value: show.time },
            { label: 'Seat(s)', value: booking.seats.sort().join(', ') },
          ].map((item) => (
            <View key={item.label} style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.receiptValue, { color: colors.foreground }]}>{item.value}</Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Payment */}
          {[
            { label: 'Amount Paid', value: `KES ${booking.amount.toLocaleString()}`, highlight: true },
            { label: 'M-Pesa Code', value: booking.mpesaCode },
            { label: 'Payment Method', value: 'M-Pesa Paybill' },
            { label: 'Booked On', value: formatDateTime(booking.bookingTime) },
          ].map((item) => (
            <View key={item.label} style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.receiptValue, { color: (item as any).highlight ? colors.primary : colors.foreground }]}>
                {item.value}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Status */}
          <View style={styles.statusRow}>
            <Text style={[styles.receiptLabel, { color: colors.mutedForeground }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <Text style={[styles.thankYou, { color: colors.mutedForeground }]}>
            Thank you for choosing Furnace Shows!
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12,
        },
      ]}>
        <TouchableOpacity
          style={[styles.shareBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
          activeOpacity={0.85}
          onPress={handleShare}
        >
          <Feather name="share-2" size={18} color={colors.foreground} />
          <Text style={[styles.shareBtnText, { color: colors.foreground }]}>Share Receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.homeBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={() => router.push('/')}
        >
          <Text style={[styles.homeBtnText, { color: colors.primaryForeground }]}>Back to Shows</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, gap: 16 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  successBanner: {
    borderRadius: 16, borderWidth: 1, padding: 20,
    alignItems: 'center', gap: 8,
  },
  successIcon: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  successTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  successSub: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  receiptCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  receiptHeader: { padding: 20, alignItems: 'center', gap: 4 },
  theatreName: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: 2 },
  receiptTitle: { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 1.5 },
  divider: { height: 1, marginHorizontal: 16 },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingHorizontal: 16, paddingVertical: 10, gap: 16,
  },
  receiptLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  receiptValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1.5, textAlign: 'right' },
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  statusBadge: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
  statusText: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  thankYou: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center', padding: 20 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
    flexDirection: 'row', gap: 10,
  },
  shareBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderRadius: 14, padding: 14, borderWidth: 1,
  },
  shareBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  homeBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 14, padding: 14 },
  homeBtnText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
});

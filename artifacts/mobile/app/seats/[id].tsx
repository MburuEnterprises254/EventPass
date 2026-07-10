import React, { useMemo, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import SeatGrid from '@/components/SeatGrid';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function generateBookingCode(): string {
  return 'BK' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

export default function SeatsScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shows, getBookedSeats } = useApp();
  const insets = useSafeAreaInsets();
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const show = shows.find((s) => s.id === id);
  const bookedSeats = useMemo(() => getBookedSeats(id ?? ''), [getBookedSeats, id]);

  if (!show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Show not found</Text>
      </View>
    );
  }

  function handleSeatPress(seatId: string) {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= 6) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return prev;
      }
      return [...prev, seatId];
    });
  }

  const totalAmount = selectedSeats.length * show.price;

  function handleContinue() {
    if (selectedSeats.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const bookingCode = generateBookingCode();
    router.push({
      pathname: '/payment/[id]',
      params: {
        id: show.id,
        seats: selectedSeats.join(','),
        bookingCode,
      },
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: Platform.OS === 'web' ? 67 + 16 : insets.top + 16,
            paddingBottom: 140,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.secondary }]}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
              {show.title}
            </Text>
            <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
              Select your seats
            </Text>
          </View>
        </View>

        {/* Show Info Strip */}
        <View style={[styles.infoStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.infoItem}>
            <Feather name="map-pin" size={12} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]} numberOfLines={1}>
              {show.venue}
            </Text>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoItem}>
            <Feather name="clock" size={12} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>{show.time}</Text>
          </View>
          <View style={styles.infoDivider} />
          <Text style={[styles.infoPrice, { color: colors.primary }]}>
            KES {show.price.toLocaleString()}/seat
          </Text>
        </View>

        {/* Max seats notice */}
        <Text style={[styles.notice, { color: colors.mutedForeground }]}>
          Select up to 6 seats per booking
        </Text>

        {/* Seat Grid */}
        <SeatGrid
          bookedSeats={bookedSeats}
          selectedSeats={selectedSeats}
          onSeatPress={handleSeatPress}
          totalSeats={show.totalSeats}
        />
      </ScrollView>

      {/* Footer */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12,
        },
      ]}>
        {selectedSeats.length > 0 && (
          <View style={styles.selectionSummary}>
            <Text style={[styles.selectionLabel, { color: colors.mutedForeground }]}>
              {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}: {selectedSeats.sort().join(', ')}
            </Text>
            <Text style={[styles.selectionTotal, { color: colors.foreground }]}>
              KES {totalAmount.toLocaleString()}
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: selectedSeats.length > 0 ? colors.primary : colors.secondary },
          ]}
          activeOpacity={0.85}
          disabled={selectedSeats.length === 0}
          onPress={handleContinue}
        >
          <Text style={[
            styles.continueBtnText,
            { color: selectedSeats.length > 0 ? colors.primaryForeground : colors.mutedForeground },
          ]}>
            {selectedSeats.length === 0
              ? 'Select seats to continue'
              : `Book ${selectedSeats.length} seat${selectedSeats.length !== 1 ? 's' : ''} — KES ${totalAmount.toLocaleString()}`}
          </Text>
          {selectedSeats.length > 0 && (
            <Feather name="arrow-right" size={18} color={colors.primaryForeground} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingHorizontal: 16,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  infoText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  infoDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#222230',
  },
  infoPrice: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  notice: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectionLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    marginRight: 8,
  },
  selectionTotal: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 16,
  },
  continueBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  },
});

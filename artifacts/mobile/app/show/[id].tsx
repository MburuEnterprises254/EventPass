import React from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const GRADIENTS: [string, string][] = [
  ['#4C1D95', '#7C3AED'],
  ['#064E3B', '#059669'],
  ['#7F1D1D', '#DC2626'],
  ['#1E3A5F', '#2563EB'],
  ['#78350F', '#D97706'],
  ['#1F2937', '#4B5563'],
];

const SCREEN_WIDTH = Dimensions.get('window').width;

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ShowDetailScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { shows, getAvailableSeats, getBookedSeats } = useApp();
  const insets = useSafeAreaInsets();

  const show = shows.find((s) => s.id === id);

  if (!show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Show not found</Text>
      </View>
    );
  }

  const gradient = GRADIENTS[show.colorIndex % GRADIENTS.length];
  const available = getAvailableSeats(show.id);
  const booked = getBookedSeats(show.id).length;
  const isSoldOut = available === 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Poster */}
        <LinearGradient
          colors={[gradient[0], gradient[1]]}
          style={[styles.poster, { paddingTop: Platform.OS === 'web' ? 67 : insets.top + 10 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.posterOverlay}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.4)' }]}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={20} color="#F0EFE8" />
            </TouchableOpacity>
            <View style={[styles.liveBadge, { backgroundColor: '#E8B84B' }]}>
              <Text style={styles.liveBadgeText}>LIVE THEATRE</Text>
            </View>
            <Text style={styles.posterTitle}>{show.title}</Text>
          </View>
        </LinearGradient>

        {/* Info Section */}
        <View style={[styles.infoSection, { backgroundColor: colors.background }]}>
          {/* Quick Stats */}
          <View style={styles.quickStats}>
            {[
              { icon: 'map-pin', label: show.venue },
              { icon: 'calendar', label: formatDate(show.date) },
              { icon: 'clock', label: show.time },
            ].map((item) => (
              <View key={item.icon} style={[styles.statItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Feather name={item.icon as any} size={14} color={colors.primary} />
                <Text style={[styles.statItemText, { color: colors.foreground }]} numberOfLines={2}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Price & Availability */}
          <View style={[styles.priceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View>
              <Text style={[styles.priceLabel, { color: colors.mutedForeground }]}>Ticket Price</Text>
              <Text style={[styles.price, { color: colors.primary }]}>
                KES {show.price.toLocaleString()}
              </Text>
            </View>
            <View style={styles.availability}>
              <View style={[
                styles.availBadge,
                { backgroundColor: isSoldOut ? '#2A1A1A' : '#0F2A1A' },
              ]}>
                <View style={[
                  styles.availDot,
                  { backgroundColor: isSoldOut ? '#EF4444' : '#22C55E' },
                ]} />
                <Text style={[
                  styles.availText,
                  { color: isSoldOut ? '#EF4444' : '#22C55E' },
                ]}>
                  {isSoldOut ? 'Sold Out' : `${available} seats left`}
                </Text>
              </View>
              <Text style={[styles.bookedText, { color: colors.mutedForeground }]}>
                {booked} booked
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descSection}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>About This Show</Text>
            <Text style={[styles.desc, { color: colors.mutedForeground }]}>{show.description}</Text>
          </View>

          {/* Venue Info */}
          <View style={[styles.venueCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.venueName, { color: colors.foreground }]}>{show.venue}</Text>
              <Text style={[styles.venueDate, { color: colors.mutedForeground }]}>
                {formatDate(show.date)} at {show.time}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Book Button */}
      <View style={[
        styles.footer,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 12,
        },
      ]}>
        <TouchableOpacity
          style={[
            styles.bookBtn,
            { backgroundColor: isSoldOut ? colors.secondary : colors.primary },
          ]}
          activeOpacity={isSoldOut ? 1 : 0.85}
          disabled={isSoldOut}
          onPress={() =>
            router.push({ pathname: '/seats/[id]', params: { id: show.id } })
          }
        >
          <Feather name={isSoldOut ? 'x-circle' : 'grid'} size={18} color={isSoldOut ? colors.mutedForeground : '#09090E'} />
          <Text style={[styles.bookBtnText, { color: isSoldOut ? colors.mutedForeground : '#09090E' }]}>
            {isSoldOut ? 'Sold Out' : 'Select Seats'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  poster: {
    width: SCREEN_WIDTH,
    height: 280,
  },
  posterOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  liveBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  liveBadgeText: {
    color: '#09090E',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
  },
  posterTitle: {
    color: '#F0EFE8',
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  infoSection: {
    padding: 16,
    gap: 16,
  },
  quickStats: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  statItemText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  priceCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  price: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
  },
  availability: {
    alignItems: 'flex-end',
    gap: 4,
  },
  availBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  bookedText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  descSection: {
    gap: 8,
  },
  descTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  desc: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  venueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  venueName: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  venueDate: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 16,
  },
  bookBtnText: {
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
  },
});

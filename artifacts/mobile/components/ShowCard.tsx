import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Show } from '@/types';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const GRADIENTS: [string, string][] = [
  ['#4C1D95', '#7C3AED'],
  ['#064E3B', '#059669'],
  ['#7F1D1D', '#DC2626'],
  ['#1E3A5F', '#2563EB'],
  ['#78350F', '#D97706'],
  ['#1F2937', '#4B5563'],
];

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface Props {
  show: Show;
  available: number;
}

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function ShowCard({ show, available }: Props) {
  const colors = useColors();
  const gradient = GRADIENTS[show.colorIndex % GRADIENTS.length];

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.9}
      onPress={() => router.push({ pathname: '/show/[id]', params: { id: show.id } })}
    >
      <LinearGradient colors={[gradient[0], gradient[1]]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.overlay}>
          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: 'rgba(232, 184, 75, 0.2)', borderColor: '#E8B84B' }]}>
              <Text style={styles.badgeText}>LIVE THEATRE</Text>
            </View>
            <View style={[styles.priceBadge, { backgroundColor: '#E8B84B' }]}>
              <Text style={styles.priceText}>KES {show.price.toLocaleString()}</Text>
            </View>
          </View>

          <View style={styles.body}>
            <Text style={styles.title} numberOfLines={1}>{show.title}</Text>
            <View style={styles.row}>
              <Feather name="map-pin" size={13} color="rgba(240,239,232,0.7)" />
              <Text style={styles.meta} numberOfLines={1}>{show.venue}</Text>
            </View>
            <View style={styles.row}>
              <Feather name="calendar" size={13} color="rgba(240,239,232,0.7)" />
              <Text style={styles.meta}>{formatDate(show.date)}</Text>
            </View>
            <View style={styles.row}>
              <Feather name="clock" size={13} color="rgba(240,239,232,0.7)" />
              <Text style={styles.meta}>{show.time}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.seatInfo}>
              <View style={[styles.dot, { backgroundColor: available > 5 ? '#22C55E' : available > 0 ? '#F59E0B' : '#EF4444' }]} />
              <Text style={styles.seatText}>
                {available > 0 ? `${available} seats left` : 'Sold out'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.bookBtn}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/show/[id]', params: { id: show.id } })}
            >
              <Text style={styles.bookBtnText}>Book Now</Text>
              <Feather name="arrow-right" size={14} color="#09090E" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  card: {
    borderRadius: 16,
  },
  overlay: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    color: '#E8B84B',
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
  },
  priceBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceText: {
    color: '#09090E',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  body: {
    gap: 6,
    marginBottom: 20,
  },
  title: {
    color: '#F0EFE8',
    fontSize: 24,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meta: {
    color: 'rgba(240,239,232,0.75)',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  seatText: {
    color: 'rgba(240,239,232,0.8)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  bookBtn: {
    backgroundColor: '#E8B84B',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bookBtnText: {
    color: '#09090E',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
});

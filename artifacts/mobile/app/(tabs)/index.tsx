import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import ShowCard from '@/components/ShowCard';
import { Show } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function HeroBanner() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#1A0A2E', '#09090E']}
      style={[styles.hero, { paddingTop: Platform.OS === 'web' ? 67 + 20 : insets.top + 20 }]}
    >
      <Text style={styles.heroTag}>✦ NAIROBI'S PREMIER THEATRE</Text>
      <Text style={styles.heroTitle}>FURNACE{'\n'}SHOWS</Text>
      <Text style={styles.heroSub}>
        Live performances that move, challenge, and inspire
      </Text>
      <View style={[styles.heroLine, { backgroundColor: colors.primary }]} />
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const { shows, getAvailableSeats, loading } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = React.useState(false);

  function onRefresh() {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }

  const sortedShows = [...shows].sort((a, b) => a.date.localeCompare(b.date));

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <FlatList<Show>
      data={sortedShows}
      keyExtractor={(item) => item.id}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.list,
        { paddingBottom: Platform.OS === 'web' ? 34 + 84 : insets.bottom + 100 },
      ]}
      ListHeaderComponent={
        <>
          <HeroBanner />
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Upcoming Shows
            </Text>
            <Text style={[styles.sectionCount, { color: colors.mutedForeground }]}>
              {sortedShows.length} shows
            </Text>
          </View>
        </>
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Feather name="film" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No shows available
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <ShowCard show={item} available={getAvailableSeats(item.id)} />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

// Need to import Feather for the empty state
import { Feather } from '@expo/vector-icons';

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: 0,
  },
  hero: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
    marginBottom: 8,
  },
  heroTag: {
    color: '#E8B84B',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  heroTitle: {
    color: '#F0EFE8',
    fontSize: 42,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  heroSub: {
    color: 'rgba(240,239,232,0.6)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 20,
    marginTop: 4,
  },
  heroLine: {
    height: 3,
    width: 48,
    borderRadius: 2,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  empty: {
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});

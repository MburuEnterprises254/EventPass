import React from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Show } from '@/types';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ShowItem({ show, onEdit, onDelete }: { show: Show; onEdit: () => void; onDelete: () => void }) {
  const colors = useColors();
  return (
    <View style={[styles.showItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.showTitle, { color: colors.foreground }]} numberOfLines={1}>{show.title}</Text>
        <Text style={[styles.showVenue, { color: colors.mutedForeground }]} numberOfLines={1}>{show.venue}</Text>
        <View style={styles.showMeta}>
          <Text style={[styles.showDate, { color: colors.mutedForeground }]}>{formatDate(show.date)} · {show.time}</Text>
          <Text style={[styles.showPrice, { color: colors.primary }]}>KES {show.price.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.showActions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#1A1A25' }]}
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={15} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#2A1A1A' }]}
          onPress={onDelete}
          activeOpacity={0.8}
        >
          <Feather name="trash-2" size={15} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function AdminShowsScreen() {
  const colors = useColors();
  const { shows, deleteShow } = useApp();
  const insets = useSafeAreaInsets();

  function handleDelete(show: Show) {
    Alert.alert(
      'Delete Show',
      `Are you sure you want to delete "${show.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteShow(show.id);
          },
        },
      ],
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList<Show>
        data={shows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 80 },
        ]}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="film" size={36} color={colors.mutedForeground} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No shows yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ShowItem
            show={item}
            onEdit={() => router.push({ pathname: '/admin-panel/show-form', params: { id: item.id } })}
            onDelete={() => handleDelete(item)}
          />
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => router.push('/admin-panel/show-form')}
      >
        <Feather name="plus" size={24} color={colors.primaryForeground} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16, gap: 10 },
  showItem: {
    borderRadius: 14, borderWidth: 1, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  showTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  showVenue: { fontSize: 12, fontFamily: 'Inter_400Regular', marginBottom: 4 },
  showMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  showDate: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  showPrice: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  showActions: { gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', gap: 12, paddingTop: 60 },
  emptyText: { fontSize: 16, fontFamily: 'Inter_400Regular' },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#E8B84B', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});

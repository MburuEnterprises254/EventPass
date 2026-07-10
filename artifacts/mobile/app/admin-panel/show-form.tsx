import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useApp } from '@/context/AppContext';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ShowFormScreen() {
  const colors = useColors();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { shows, addShow, updateShow } = useApp();
  const insets = useSafeAreaInsets();

  const existing = shows.find((s) => s.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [venue, setVenue] = useState(existing?.venue ?? '');
  const [date, setDate] = useState(existing?.date ?? '');
  const [time, setTime] = useState(existing?.time ?? '');
  const [price, setPrice] = useState(existing ? existing.price.toString() : '');
  const [totalSeats, setTotalSeats] = useState(existing ? existing.totalSeats.toString() : '50');

  const isEdit = !!existing;

  function handleSave() {
    if (!title.trim() || !venue.trim() || !date.trim() || !time.trim() || !price.trim()) {
      Alert.alert('Required Fields', 'Please fill in all fields');
      return;
    }
    const priceNum = parseInt(price.trim(), 10);
    if (isNaN(priceNum) || priceNum <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price');
      return;
    }
    const seatsNum = parseInt(totalSeats.trim(), 10);
    if (isNaN(seatsNum) || seatsNum < 1 || seatsNum > 260) {
      Alert.alert('Invalid Seats', 'Total seats must be between 1 and 260');
      return;
    }

    if (isEdit && existing) {
      updateShow({
        ...existing,
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        date: date.trim(),
        time: time.trim(),
        price: priceNum,
        totalSeats: seatsNum,
      });
    } else {
      addShow({
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        date: date.trim(),
        time: time.trim(),
        price: priceNum,
        totalSeats: seatsNum,
      });
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  }

  const fields = [
    { label: 'Show Title', value: title, setter: setTitle, placeholder: 'e.g. Romeo & Juliet', multiline: false },
    { label: 'Venue', value: venue, setter: setVenue, placeholder: 'e.g. Nairobi National Theatre', multiline: false },
    { label: 'Date (YYYY-MM-DD)', value: date, setter: setDate, placeholder: 'e.g. 2026-07-18', multiline: false },
    { label: 'Time', value: time, setter: setTime, placeholder: 'e.g. 7:00 PM', multiline: false },
    { label: 'Ticket Price (KES)', value: price, setter: setPrice, placeholder: 'e.g. 1000', multiline: false },
    { label: 'Total Seats in Theatre', value: totalSeats, setter: setTotalSeats, placeholder: 'e.g. 50', multiline: false },
    { label: 'Description', value: description, setter: setDescription, placeholder: 'Brief description of the show...', multiline: true },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 24 },
        ]}
      >
        <Text style={[styles.formTitle, { color: colors.foreground }]}>
          {isEdit ? 'Edit Show' : 'New Show'}
        </Text>
        <Text style={[styles.formSub, { color: colors.mutedForeground }]}>
          {isEdit ? 'Update the show details below' : 'Fill in the details for the new show'}
        </Text>

        {fields.map((field) => (
          <View key={field.label} style={styles.fieldGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>{field.label}</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.secondary,
                  color: colors.foreground,
                  borderColor: colors.border,
                  height: field.multiline ? 100 : undefined,
                  textAlignVertical: field.multiline ? 'top' : 'center',
                },
              ]}
              value={field.value}
              onChangeText={field.setter}
              placeholder={field.placeholder}
              placeholderTextColor={colors.mutedForeground}
              multiline={field.multiline}
              keyboardType={field.label.includes('Price') ? 'numeric' : 'default'}
              autoCapitalize={field.label.includes('Date') || field.label.includes('Time') ? 'none' : 'words'}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={handleSave}
        >
          <Feather name={isEdit ? 'save' : 'plus-circle'} size={18} color={colors.primaryForeground} />
          <Text style={[styles.saveBtnText, { color: colors.primaryForeground }]}>
            {isEdit ? 'Save Changes' : 'Create Show'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 16 },
  formTitle: { fontSize: 24, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  formSub: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  fieldGroup: { gap: 6 },
  label: { fontSize: 12, fontFamily: 'Inter_500Medium', letterSpacing: 0.3 },
  input: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, padding: 16, marginTop: 8,
  },
  saveBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});

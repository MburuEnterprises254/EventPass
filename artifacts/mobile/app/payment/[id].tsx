import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
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

function generateReceiptNo(): string {
  return `RCT-${new Date().getFullYear()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

const PAYBILL_NUMBER = '247247';

export default function PaymentScreen() {
  const colors = useColors();
  const { id, seats: seatsParam, bookingCode } = useLocalSearchParams<{
    id: string;
    seats: string;
    bookingCode: string;
  }>();
  const { shows, createBooking } = useApp();
  const insets = useSafeAreaInsets();

  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [mpesaCode, setMpesaCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const show = shows.find((s) => s.id === id);
  const seats = seatsParam ? seatsParam.split(',') : [];
  const amount = seats.length * (show?.price ?? 0);

  if (!show) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.foreground }}>Show not found</Text>
      </View>
    );
  }

  function handlePaid() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModalVisible(true);
  }

  function handleConfirm() {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your full name');
      return;
    }
    if (!phone.trim() || phone.trim().length < 9) {
      Alert.alert('Required', 'Please enter a valid phone number');
      return;
    }
    if (!mpesaCode.trim() || mpesaCode.trim().length < 8) {
      Alert.alert('Required', 'Please enter your M-Pesa transaction code');
      return;
    }

    setSubmitting(true);
    try {
      const booking = createBooking({
        bookingCode: bookingCode ?? 'BK00000',
        receiptNo: generateReceiptNo(),
        customerName: name.trim(),
        phone: phone.trim(),
        showId: show.id,
        seats,
        amount,
        mpesaCode: mpesaCode.trim().toUpperCase(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      router.replace({ pathname: '/receipt/[id]', params: { id: booking.id } });
    } catch (e) {
      setSubmitting(false);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
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
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={20} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Complete Booking</Text>
        </View>

        {/* Booking Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>BOOKING SUMMARY</Text>

          {[
            { label: 'Show', value: show.title },
            { label: 'Venue', value: show.venue },
            { label: 'Date', value: show.date },
            { label: 'Time', value: show.time },
            { label: 'Seats', value: seats.sort().join(', ') },
            { label: 'Booking Code', value: bookingCode ?? '—' },
          ].map((item) => (
            <View key={item.label} style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
              <Text style={[styles.summaryValue, { color: colors.foreground }]} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.foreground }]}>Total Amount</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              KES {amount.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* M-Pesa Instructions */}
        <View style={[styles.mpesaCard, { backgroundColor: '#0A1F0A', borderColor: '#22C55E40' }]}>
          <View style={styles.mpesaHeader}>
            <View style={[styles.mpesaIcon, { backgroundColor: '#22C55E22' }]}>
              <Feather name="smartphone" size={20} color="#22C55E" />
            </View>
            <View>
              <Text style={[styles.mpesaTitle, { color: '#F0EFE8' }]}>Pay via M-Pesa</Text>
              <Text style={[styles.mpesaSub, { color: '#22C55E' }]}>Paybill Payment</Text>
            </View>
          </View>

          <View style={styles.mpesaSteps}>
            {[
              'Go to M-Pesa on your phone',
              'Select Lipa na M-Pesa',
              'Select Pay Bill',
              'Enter the details below',
            ].map((step, i) => (
              <View key={i} style={styles.step}>
                <View style={[styles.stepNum, { backgroundColor: '#22C55E22' }]}>
                  <Text style={[styles.stepNumText, { color: '#22C55E' }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: 'rgba(240,239,232,0.75)' }]}>{step}</Text>
              </View>
            ))}
          </View>

          <View style={styles.mpesaDetails}>
            {[
              { label: 'Business Number', value: PAYBILL_NUMBER },
              { label: 'Account Number', value: bookingCode ?? '—' },
              { label: 'Amount', value: `KES ${amount.toLocaleString()}` },
            ].map((item) => (
              <View key={item.label} style={[styles.mpesaDetailRow, { borderColor: '#22C55E22' }]}>
                <Text style={[styles.mpesaDetailLabel, { color: 'rgba(240,239,232,0.6)' }]}>
                  {item.label}
                </Text>
                <Text style={[styles.mpesaDetailValue, { color: '#F0EFE8' }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={[styles.confirmNote, { color: colors.mutedForeground }]}>
          After completing payment, tap "I Have Paid" below to confirm your booking.
        </Text>
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
        <TouchableOpacity
          style={[styles.paidBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
          onPress={handlePaid}
        >
          <Feather name="check-circle" size={20} color={colors.primaryForeground} />
          <Text style={[styles.paidBtnText, { color: colors.primaryForeground }]}>I Have Paid</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => !submitting && setModalVisible(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Confirm Payment</Text>
            <Text style={[styles.modalSub, { color: colors.mutedForeground }]}>
              Enter your details and the M-Pesa code from your SMS
            </Text>

            {[
              { label: 'Full Name', value: name, setter: setName, placeholder: 'e.g. Martin Mburu', key: 'name' },
              { label: 'Phone Number', value: phone, setter: setPhone, placeholder: 'e.g. 0712345678', key: 'phone' },
              { label: 'M-Pesa Code', value: mpesaCode, setter: setMpesaCode, placeholder: 'e.g. ABC123XYZ', key: 'mpesa' },
            ].map((field) => (
              <View key={field.key} style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.mutedForeground }]}>{field.label}</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.secondary, color: colors.foreground, borderColor: colors.border }]}
                  value={field.value}
                  onChangeText={field.setter}
                  placeholder={field.placeholder}
                  placeholderTextColor={colors.mutedForeground}
                  autoCapitalize={field.key === 'mpesa' ? 'characters' : 'words'}
                  keyboardType={field.key === 'phone' ? 'phone-pad' : 'default'}
                  editable={!submitting}
                />
              </View>
            ))}

            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: submitting ? colors.secondary : colors.primary }]}
              activeOpacity={0.85}
              onPress={handleConfirm}
              disabled={submitting}
            >
              <Text style={[styles.confirmBtnText, { color: submitting ? colors.mutedForeground : colors.primaryForeground }]}>
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, gap: 16 },
  pageHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  summaryCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 0 },
  sectionLabel: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 1.5, marginBottom: 12 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 16,
  },
  summaryLabel: { fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 },
  summaryValue: { fontSize: 13, fontFamily: 'Inter_600SemiBold', flex: 1, textAlign: 'right' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 },
  totalLabel: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  totalValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  mpesaCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 16 },
  mpesaHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mpesaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mpesaTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  mpesaSub: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  mpesaSteps: { gap: 8 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  stepText: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  mpesaDetails: { gap: 0, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#22C55E22' },
  mpesaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  mpesaDetailLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  mpesaDetailValue: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  confirmNote: { fontSize: 12, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 18 },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1,
  },
  paidBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, borderRadius: 14, padding: 16,
  },
  paidBtnText: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  modalSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40, gap: 14,
  },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 4 },
  modalTitle: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  modalSub: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  input: {
    borderRadius: 10, borderWidth: 1, padding: 13,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  confirmBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 4 },
  confirmBtnText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
});

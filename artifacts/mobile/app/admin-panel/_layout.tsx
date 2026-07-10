import React from 'react';
import { Stack } from 'expo-router';

export default function AdminPanelLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#111118' },
        headerTintColor: '#E8B84B',
        headerTitleStyle: {
          color: '#F0EFE8',
          fontFamily: 'Inter_600SemiBold',
          fontSize: 17,
        },
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="shows" options={{ title: 'Manage Shows' }} />
      <Stack.Screen name="show-form" options={{ title: 'Show Details' }} />
      <Stack.Screen name="bookings" options={{ title: 'All Bookings' }} />
      <Stack.Screen name="payments" options={{ title: 'Payments' }} />
    </Stack>
  );
}

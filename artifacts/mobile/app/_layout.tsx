import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppProvider } from '@/context/AppContext';
import { AuthProvider, useAuth } from '@/lib/auth';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const onPublicScreen = segments[0] === 'login' || segments[0] === 'register';
    if (!isAuthenticated && !onPublicScreen) {
      router.replace('/login');
    } else if (isAuthenticated && onPublicScreen) {
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthRedirect />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#09090E' },
          headerTintColor: '#E8B84B',
          headerTitleStyle: {
            color: '#F0EFE8',
            fontFamily: 'Inter_600SemiBold',
            fontSize: 17,
          },
          headerBackTitle: 'Back',
          contentStyle: { backgroundColor: '#09090E' },
        }}
      >
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="show/[id]" options={{ title: '', headerTransparent: true }} />
        <Stack.Screen name="seats/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="payment/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="receipt/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="admin-panel" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppProvider>
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </AppProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, Payment, Show } from '@/types';

const SHOWS_KEY = 'facereels_shows';
const BOOKINGS_KEY = 'facereels_bookings';
const PAYMENTS_KEY = 'facereels_payments';
const SEEDED_KEY = 'facereels_seeded';
const ADMIN_KEY = 'facereels_admin';

const ADMIN_PIN = '1234';

const SEED_SHOWS: Show[] = [
  {
    id: '1',
    title: 'Romeo & Juliet',
    description:
      "Shakespeare's timeless tragedy follows two young lovers from rival families in fair Verona. A sweeping tale of passion, fate, and the price of feud. Directed by award-winning Nairobi director James Muthomi.",
    venue: 'Nairobi National Theatre',
    date: '2026-07-18',
    time: '7:00 PM',
    price: 1000,
    colorIndex: 0,
  },
  {
    id: '2',
    title: 'Silent Echo',
    description:
      'A gripping contemporary drama about a woman who loses her voice — literally and figuratively — after a political scandal. A powerful meditation on truth, silence, and survival in modern Kenya.',
    venue: 'Kenya National Theatre',
    date: '2026-07-19',
    time: '6:00 PM',
    price: 800,
    colorIndex: 1,
  },
  {
    id: '3',
    title: 'The Merchant of Venice',
    description:
      "Shylock demands his pound of flesh in this electrifying production set in contemporary Nairobi's financial district. A fresh take on justice, mercy, and what it means to belong.",
    venue: 'Alliance Française',
    date: '2026-07-20',
    time: '5:00 PM',
    price: 1200,
    colorIndex: 2,
  },
  {
    id: '4',
    title: 'Midnight Sonata',
    description:
      'A haunting musical drama following a prodigy pianist who returns to Kenya after 20 years abroad to confront the music — and the family — she left behind. Featuring a live orchestra.',
    venue: 'KICC Amphitheatre',
    date: '2026-07-21',
    time: '8:00 PM',
    price: 900,
    colorIndex: 3,
  },
  {
    id: '5',
    title: 'Broken Wings',
    description:
      "An emotional story of three siblings navigating grief, ambition, and forgiveness after their mother's passing. Raw, honest, and deeply moving. Winner of the 2025 Safaricom Drama Festival.",
    venue: 'Ufungamano House',
    date: '2026-07-25',
    time: '7:30 PM',
    price: 750,
    colorIndex: 4,
  },
];

interface CreateBookingParams {
  bookingCode: string;
  receiptNo: string;
  customerName: string;
  phone: string;
  showId: string;
  seats: string[];
  amount: number;
  mpesaCode: string;
}

interface AppContextType {
  shows: Show[];
  bookings: Booking[];
  payments: Payment[];
  loading: boolean;
  addShow: (show: Omit<Show, 'id' | 'colorIndex'>) => void;
  updateShow: (show: Show) => void;
  deleteShow: (id: string) => void;
  getBookedSeats: (showId: string) => string[];
  getAvailableSeats: (showId: string) => number;
  createBooking: (params: CreateBookingParams) => Booking;
  verifyPayment: (paymentId: string) => void;
  isAdmin: boolean;
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [shows, setShows] = useState<Show[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [seeded, storedShows, storedBookings, storedPayments, adminStr] = await Promise.all([
          AsyncStorage.getItem(SEEDED_KEY),
          AsyncStorage.getItem(SHOWS_KEY),
          AsyncStorage.getItem(BOOKINGS_KEY),
          AsyncStorage.getItem(PAYMENTS_KEY),
          AsyncStorage.getItem(ADMIN_KEY),
        ]);

        if (!seeded) {
          setShows(SEED_SHOWS);
          await AsyncStorage.setItem(SHOWS_KEY, JSON.stringify(SEED_SHOWS));
          await AsyncStorage.setItem(SEEDED_KEY, 'true');
        } else {
          setShows(storedShows ? JSON.parse(storedShows) : []);
        }
        setBookings(storedBookings ? JSON.parse(storedBookings) : []);
        setPayments(storedPayments ? JSON.parse(storedPayments) : []);
        setIsAdmin(adminStr === 'true');
      } catch (e) {
        setShows(SEED_SHOWS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const saveShows = useCallback(async (updated: Show[]) => {
    setShows(updated);
    await AsyncStorage.setItem(SHOWS_KEY, JSON.stringify(updated));
  }, []);

  const saveBookings = useCallback(async (updated: Booking[]) => {
    setBookings(updated);
    await AsyncStorage.setItem(BOOKINGS_KEY, JSON.stringify(updated));
  }, []);

  const savePayments = useCallback(async (updated: Payment[]) => {
    setPayments(updated);
    await AsyncStorage.setItem(PAYMENTS_KEY, JSON.stringify(updated));
  }, []);

  const addShow = useCallback(
    (data: Omit<Show, 'id' | 'colorIndex'>) => {
      const newShow: Show = {
        ...data,
        id: Date.now().toString(),
        colorIndex: shows.length % 6,
      };
      saveShows([...shows, newShow]);
    },
    [shows, saveShows],
  );

  const updateShow = useCallback(
    (show: Show) => {
      saveShows(shows.map((s) => (s.id === show.id ? show : s)));
    },
    [shows, saveShows],
  );

  const deleteShow = useCallback(
    (id: string) => {
      saveShows(shows.filter((s) => s.id !== id));
    },
    [shows, saveShows],
  );

  const getBookedSeats = useCallback(
    (showId: string): string[] => {
      return bookings
        .filter((b) => b.showId === showId)
        .flatMap((b) => b.seats);
    },
    [bookings],
  );

  const getAvailableSeats = useCallback(
    (showId: string): number => {
      const totalSeats = 32; // 4 rows × 8 seats
      return totalSeats - getBookedSeats(showId).length;
    },
    [getBookedSeats],
  );

  const createBooking = useCallback(
    (params: CreateBookingParams): Booking => {
      const booking: Booking = {
        id: Date.now().toString(),
        bookingCode: params.bookingCode,
        receiptNo: params.receiptNo,
        customerName: params.customerName,
        phone: params.phone,
        showId: params.showId,
        seats: params.seats,
        amount: params.amount,
        paymentStatus: 'paid',
        bookingTime: new Date().toISOString(),
        mpesaCode: params.mpesaCode,
      };
      const payment: Payment = {
        id: (Date.now() + 1).toString(),
        bookingId: booking.id,
        mpesaCode: params.mpesaCode,
        amount: params.amount,
        paymentTime: new Date().toISOString(),
        verified: false,
      };
      const updatedBookings = [...bookings, booking];
      const updatedPayments = [...payments, payment];
      saveBookings(updatedBookings);
      savePayments(updatedPayments);
      return booking;
    },
    [bookings, payments, saveBookings, savePayments],
  );

  const verifyPayment = useCallback(
    (paymentId: string) => {
      const updatedPayments = payments.map((p) =>
        p.id === paymentId ? { ...p, verified: true } : p,
      );
      savePayments(updatedPayments);
      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
        const updatedBookings = bookings.map((b) =>
          b.id === payment.bookingId ? { ...b, paymentStatus: 'verified' as const } : b,
        );
        saveBookings(updatedBookings);
      }
    },
    [payments, bookings, savePayments, saveBookings],
  );

  const loginAdmin = useCallback((pin: string): boolean => {
    if (pin === ADMIN_PIN) {
      setIsAdmin(true);
      AsyncStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  }, []);

  const logoutAdmin = useCallback(() => {
    setIsAdmin(false);
    AsyncStorage.setItem(ADMIN_KEY, 'false');
  }, []);

  return (
    <AppContext.Provider
      value={{
        shows,
        bookings,
        payments,
        loading,
        addShow,
        updateShow,
        deleteShow,
        getBookedSeats,
        getAvailableSeats,
        createBooking,
        verifyPayment,
        isAdmin,
        loginAdmin,
        logoutAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

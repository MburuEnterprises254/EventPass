export interface Show {
  id: string;
  title: string;
  description: string;
  venue: string;
  date: string; // "2026-07-18"
  time: string; // "7:00 PM"
  price: number;
  totalSeats: number;
  colorIndex: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  receiptNo: string;
  customerName: string;
  phone: string;
  showId: string;
  seats: string[];
  amount: number;
  paymentStatus: 'pending' | 'paid' | 'verified';
  bookingTime: string;
  mpesaCode: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  mpesaCode: string;
  amount: number;
  paymentTime: string;
  verified: boolean;
}

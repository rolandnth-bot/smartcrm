/**
 * 3 alapértelmezett teszt foglalás.
 * Ha nincs API és üres a lista, ezek betöltdnek és localStorage-ba mentdnek.
 */

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function seedDefaultBookings() {
  // Fix dátumok 2026. januárra - több tesztfoglalás különböző platformokkal
  return [
    {
      id: 'default-booking-1',
      dateFrom: '2026-01-05',
      dateTo: '2026-01-10',
      checkIn: '2026-01-05',
      checkOut: '2026-01-10',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      apartmentId: 'default-1',
      apartmentName: 'Akác 57',
      guestName: 'Rose Martinez',
      platform: 'airbnb',
      guestCount: 2,
      nights: 5,
      status: 'confirmed',
      payoutEur: 140,
      payoutFt: 56000,
      accommodationFt: 40000,
      cleaningFt: 10000,
      ifaFt: 4000,
      otherFt: 2000,
      notes: 'Airbnb foglalás - rózsaszín buborék',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-2',
      dateFrom: '2026-01-15',
      dateTo: '2026-01-20',
      checkIn: '2026-01-15',
      checkOut: '2026-01-20',
      checkInTime: '14:00',
      checkOutTime: '10:00',
      apartmentId: 'default-9',
      apartmentName: 'Gozsdu',
      guestName: 'John Smith',
      platform: 'booking',
      guestCount: 3,
      nights: 5,
      status: 'confirmed',
      payoutEur: 180,
      payoutFt: 72000,
      accommodationFt: 55000,
      cleaningFt: 12000,
      ifaFt: 3000,
      otherFt: 2000,
      notes: 'Booking.com foglalás - kék buborék',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-3',
      dateFrom: '2026-01-22',
      dateTo: '2026-01-28',
      checkIn: '2026-01-22',
      checkOut: '2026-01-28',
      checkInTime: '15:00',
      checkOutTime: '11:00',
      apartmentId: 'default-13',
      apartmentName: 'Király 87',
      guestName: 'Anna Kovács',
      platform: 'szallas',
      guestCount: 2,
      nights: 6,
      status: 'confirmed',
      payoutEur: 90,
      payoutFt: 36000,
      accommodationFt: 28000,
      cleaningFt: 6000,
      ifaFt: 1500,
      otherFt: 500,
      notes: 'Szallas.hu foglalás - piros buborék',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-4',
      dateFrom: '2026-01-08',
      dateTo: '2026-01-12',
      checkIn: '2026-01-08',
      checkOut: '2026-01-12',
      checkInTime: '16:00',
      checkOutTime: '10:00',
      apartmentId: 'default-5',
      apartmentName: 'Kazinczy 22',
      guestName: 'Michael Brown',
      platform: 'airbnb',
      guestCount: 4,
      nights: 4,
      status: 'confirmed',
      payoutEur: 120,
      payoutFt: 48000,
      accommodationFt: 36000,
      cleaningFt: 9000,
      ifaFt: 2000,
      otherFt: 1000,
      notes: 'Airbnb - rövid foglalás',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-5',
      dateFrom: '2026-01-12',
      dateTo: '2026-01-18',
      checkIn: '2026-01-12',
      checkOut: '2026-01-18',
      checkInTime: '14:00',
      checkOutTime: '11:00',
      apartmentId: 'default-1',
      apartmentName: 'Akác 57',
      guestName: 'Emma Davis',
      platform: 'booking',
      guestCount: 2,
      nights: 6,
      status: 'confirmed',
      payoutEur: 165,
      payoutFt: 66000,
      accommodationFt: 50000,
      cleaningFt: 12000,
      ifaFt: 3000,
      otherFt: 1000,
      notes: 'Booking.com - hosszabb foglalás',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-6',
      dateFrom: '2026-01-02',
      dateTo: '2026-01-06',
      checkIn: '2026-01-02',
      checkOut: '2026-01-06',
      checkInTime: '15:00',
      checkOutTime: '10:00',
      apartmentId: 'default-9',
      apartmentName: 'Gozsdu',
      guestName: 'Kovács Péter',
      platform: 'direct',
      guestCount: 3,
      nights: 4,
      status: 'confirmed',
      payoutEur: 100,
      payoutFt: 40000,
      accommodationFt: 32000,
      cleaningFt: 6000,
      ifaFt: 1500,
      otherFt: 500,
      notes: 'Direct booking - direct foglalás',
      createdAt: new Date().toISOString()
    }
  ];
}

const STORAGE_KEY = 'smartcrm_bookings';

export function loadBookingsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveBookingsToStorage(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {}
}

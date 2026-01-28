/**
 * 3 alapértelmezett teszt foglalás.
 * Ha nincs API és üres a lista, ezek betöltődnek és localStorage-ba mentődnek.
 */

function addDaysISO(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function seedDefaultBookings() {
  const start1 = addDaysISO(7);
  const end1 = addDaysISO(9);
  const start2 = addDaysISO(14);
  const end2 = addDaysISO(17);
  const start3 = addDaysISO(21);
  const end3 = addDaysISO(22);

  return [
    {
      id: 'default-booking-1',
      dateFrom: start1,
      dateTo: end1,
      checkIn: start1,
      checkOut: end1,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      apartmentId: 'default-1',
      apartmentName: 'Akác 57',
      guestName: 'Teszt Vendég 1',
      platform: 'airbnb',
      guestCount: 2,
      nights: 2,
      status: 'confirmed',
      payoutFt: 85000,
      accommodationFt: 55000,
      cleaningFt: 15000,
      ifaFt: 10000,
      otherFt: 5000,
      notes: 'Teszt foglalás – Airbnb',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-2',
      dateFrom: start2,
      dateTo: end2,
      checkIn: start2,
      checkOut: end2,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      apartmentId: 'default-9',
      apartmentName: 'Gozsdu',
      guestName: 'Teszt Vendég 2',
      platform: 'booking',
      guestCount: 4,
      nights: 3,
      status: 'confirmed',
      payoutFt: 120000,
      notes: 'Teszt foglalás – Booking.com',
      createdAt: new Date().toISOString()
    },
    {
      id: 'default-booking-3',
      dateFrom: start3,
      dateTo: end3,
      checkIn: start3,
      checkOut: end3,
      checkInTime: '15:00',
      checkOutTime: '11:00',
      apartmentId: 'default-13',
      apartmentName: 'Király 87',
      guestName: 'Teszt Vendég 3',
      platform: 'direct',
      guestCount: 1,
      nights: 1,
      status: 'confirmed',
      payoutFt: 45000,
      notes: 'Teszt foglalás – Direkt',
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

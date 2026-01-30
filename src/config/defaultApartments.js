/**
 * Alapértelmezett lakások (SabeeApp  Apartment House lista).
 * Ha nincs API / üres a lista, ezek mindig betöltdnek és localStorage-ba mentdnek.
 */
export const DEFAULT_APARTMENTS = [
  'Akác 57',
  'Angel 36',
  'Baross 20 (Keleti)',
  'Bogdáni',
  'D16 Deluxe',
  'D3',
  'D39',
  'Dunakeszi Meder',
  'Gozsdu',
  'Izabella 77',
  'Kádár 8',
  'Kazinczy 9',
  'Király 87',
  'Klauzal 16',
  'Knézits 15',
  'Kosztolányi 12',
  'Liget Apartment',
  'Németvölgyi',
  'Oktogon',
  'Pacsirta 9',
  'Ráday 5',
  'Ráday 27',
  'Rottenbiller Garden 1',
  'Rottenbiller Garden 2',
  'Rottenbiller Garden 5',
  'Római',
  'Rökk Szilárd 7/1',
  'Rökk Szilárd 7/2',
  'Széchenyi 12',
  'Tolnai 27',
  'Tóth Kálmán 33',
  'Wesselényi 25'
];

const STORAGE_KEY = 'smartcrm_apartments';

export function seedApartmentsFromDefaults() {
  const now = new Date().toISOString();
  return DEFAULT_APARTMENTS.map((name, i) => ({
    id: `default-${i + 1}`,
    name,
    address: name,
    city: '',
    zipCode: '',
    status: 'active',
    notes: '',
    amenities: [],
    inventory: [],
    icalAirbnb: '',
    icalBooking: '',
    icalSzallas: '',
    icalOwn: '',
    createdAt: now,
    updatedAt: now
  }));
}

export function loadApartmentsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

export function saveApartmentsToStorage(apartments) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apartments));
  } catch {}
}

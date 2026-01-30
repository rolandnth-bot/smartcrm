/**
 * iCal (RFC 5545) fájl generáló utility
 * Bookings-okat konvertál iCalendar formátumba
 */

/**
 * Dátum formázás iCal formátumra (YYYYMMDD)
 * @param {Date|string} date - Dátum
 * @returns {string} - YYYYMMDD formátumú string
 */
function formatIcalDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Timestamp generálás iCal formátumra (YYYYMMDDTHHMMSSZ)
 * @returns {string} - UTC timestamp
 */
function generateTimestamp() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hour = String(now.getUTCHours()).padStart(2, '0');
  const minute = String(now.getUTCMinutes()).padStart(2, '0');
  const second = String(now.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
}

/**
 * Szöveg escape-elése iCal formátumhoz
 * @param {string} text - Escape-elendő szöveg
 * @returns {string} - Escape-elt szöveg
 */
function escapeIcalText(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Platform labels
 */
const PLATFORM_LABELS = {
  airbnb: 'Airbnb',
  booking: 'Booking.com',
  szallas: 'Szallas.hu',
  direct: 'Direct',
  other: 'Other'
};

/**
 * Generál egy VEVENT blokkot egy bookinghoz
 * @param {Object} booking - Foglalás objektum
 * @returns {string} - VEVENT blokk
 */
function generateVEvent(booking) {
  const uid = `${booking.id}@smartcrm.hu`;
  const dtstart = formatIcalDate(booking.dateFrom || booking.checkIn);
  const dtend = formatIcalDate(booking.dateTo || booking.checkOut);
  const dtstamp = generateTimestamp();

  const guestName = escapeIcalText(booking.guestName || 'Vendég');
  const platform = PLATFORM_LABELS[booking.platform] || booking.platform || 'Unknown';
  const summary = `${guestName} - ${platform}`;

  // Description összeállítása
  const descriptionParts = [];
  if (booking.guestName) descriptionParts.push(`Vendég: ${escapeIcalText(booking.guestName)}`);
  if (booking.guestCount) descriptionParts.push(`Vendégek száma: ${booking.guestCount}`);
  if (booking.platform) descriptionParts.push(`Platform: ${PLATFORM_LABELS[booking.platform] || booking.platform}`);
  if (booking.nights) descriptionParts.push(`Éjszakák: ${booking.nights}`);
  if (booking.payoutEur) descriptionParts.push(`Összeg: €${booking.payoutEur}`);
  else if (booking.payoutFt) descriptionParts.push(`Összeg: ${booking.payoutFt} Ft`);
  if (booking.notes) descriptionParts.push(`Megjegyzés: ${escapeIcalText(booking.notes)}`);

  const description = escapeIcalText(descriptionParts.join('\\n'));

  return [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT'
  ].join('\r\n');
}

/**
 * Generál egy teljes iCal fájlt
 * @param {Array} bookings - Foglalások tömbje
 * @param {Object} apartment - Lakás objektum (opcionális)
 * @returns {string} - Teljes iCal fájl tartalom
 */
export function generateIcalFile(bookings, apartment = null) {
  const calName = apartment ? `SmartCRM - ${apartment.name}` : 'SmartCRM Bookings';
  const calDescription = apartment
    ? `Foglalások - ${apartment.name}`
    : 'SmartCRM Foglalások';

  const events = bookings.map(booking => generateVEvent(booking)).join('\r\n');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SmartCRM//Bookings//HU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeIcalText(calName)}`,
    `X-WR-CALDESC:${escapeIcalText(calDescription)}`,
    'X-WR-TIMEZONE:Europe/Budapest',
    events,
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Generál egy letölthető iCal fájl blob URL-t
 * @param {Array} bookings - Foglalások tömbje
 * @param {Object} apartment - Lakás objektum (opcionális)
 * @returns {string} - Blob URL
 */
export function generateIcalBlobUrl(bookings, apartment = null) {
  const icalContent = generateIcalFile(bookings, apartment);
  const blob = new Blob([icalContent], { type: 'text/calendar; charset=utf-8' });
  return URL.createObjectURL(blob);
}

/**
 * Letölti az iCal fájlt
 * @param {Array} bookings - Foglalások tömbje
 * @param {Object} apartment - Lakás objektum (opcionális)
 * @param {string} filename - Fájlnév (opcionális)
 */
export function downloadIcalFile(bookings, apartment = null, filename = null) {
  const defaultFilename = apartment
    ? `smartcrm-${apartment.id}.ics`
    : 'smartcrm-bookings.ics';

  const icalContent = generateIcalFile(bookings, apartment);
  const blob = new Blob([icalContent], { type: 'text/calendar; charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Generál egy megosztható iCal export URL-t
 * @param {string|number} apartmentId - Lakás ID
 * @returns {string} - Export URL
 */
export function generateIcalExportUrl(apartmentId) {
  const baseUrl = window.location.origin;
  return `${baseUrl}/ical/export/${apartmentId}.ics`;
}

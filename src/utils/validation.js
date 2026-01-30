/**
 * Központi validációs utility függvények
 */

/**
 * Email validáció
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Kötelez mez validáció
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Szám validáció (pozitív szám)
 */
export function validatePositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0;
}

/**
 * Szám validáció (egész szám)
 */
export function validateInteger(value) {
  const num = Number(value);
  return !isNaN(num) && Number.isInteger(num) && num >= 0;
}

/**
 * Dátum validáció (ISO formátum vagy YYYY-MM-DD)
 */
export function validateDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Dátum tartomány validáció (check-in < check-out)
 */
export function validateDateRange(dateFrom, dateTo) {
  if (!validateDate(dateFrom) || !validateDate(dateTo)) return false;
  const from = new Date(dateFrom);
  const to = new Date(dateTo);
  return from < to;
}

/**
 * Átfed foglalások ellenrzése
 * Ellenrzi, hogy az új foglalás dátumai átfednek-e más foglalásokkal ugyanazon a lakáson
 * @param {string} dateFrom - Érkezés dátuma (ISO string)
 * @param {string} dateTo - Távozás dátuma (ISO string)
 * @param {string} apartmentId - Lakás ID
 * @param {Array} existingBookings - Meglév foglalások tömbje
 * @param {string} excludeBookingId - Kizárni kívánt foglalás ID (szerkesztés esetén)
 * @returns {Object} { hasOverlap: boolean, overlappingBookings: Array }
 */
export function checkOverlappingBookings(dateFrom, dateTo, apartmentId, existingBookings = [], excludeBookingId = null) {
  if (!validateDate(dateFrom) || !validateDate(dateTo) || !validateDateRange(dateFrom, dateTo)) {
    return { hasOverlap: false, overlappingBookings: [] };
  }

  const newCheckIn = new Date(dateFrom);
  const newCheckOut = new Date(dateTo);

  const overlappingBookings = existingBookings.filter((booking) => {
    // Kizárjuk a jelenleg szerkesztett foglalást
    if (excludeBookingId && booking.id === excludeBookingId) {
      return false;
    }

    // Csak ugyanazon a lakáson ellenrizzük
    if (booking.apartmentId !== apartmentId) {
      return false;
    }

    const bookingCheckIn = new Date(booking.dateFrom || booking.checkIn);
    const bookingCheckOut = new Date(booking.dateTo || booking.checkOut);

    // Ellenrizzük, hogy a dátumok érvényesek-e
    if (isNaN(bookingCheckIn.getTime()) || isNaN(bookingCheckOut.getTime())) {
      return false;
    }

    // Átfedés ellenrzése: az új foglalás check-in-je a meglév check-out eltt van,
    // és az új foglalás check-out-ja a meglév check-in után van
    return !(newCheckOut <= bookingCheckIn || newCheckIn >= bookingCheckOut);
  });

  return {
    hasOverlap: overlappingBookings.length > 0,
    overlappingBookings
  };
}

/**
 * Szöveg hossz validáció
 */
export function validateLength(value, min = 0, max = Infinity) {
  if (typeof value !== 'string') return false;
  const length = value.trim().length;
  return length >= min && length <= max;
}

/**
 * URL validáció
 */
export function validateURL(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * iCal URL validáció (https kötelez, .ics fájl vagy ical URL pattern)
 */
export function validateIcalURL(url) {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    // HTTPS kötelez iCal URL-ekhez
    if (urlObj.protocol !== 'https:') {
      return false;
    }
    // Ellenrizzük, hogy .ics fájl vagy tartalmazza az 'ical' vagy 'calendar' szót
    const pathname = urlObj.pathname.toLowerCase();
    const hostname = urlObj.hostname.toLowerCase();
    return pathname.endsWith('.ics') || 
           pathname.includes('ical') || 
           pathname.includes('calendar') ||
           hostname.includes('ical') ||
           hostname.includes('calendar');
  } catch {
    return false;
  }
}

/**
 * Telefonszám validáció (egyszersített)
 */
export function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  // Eltávolítjuk a szóközöket, kötjeleket, zárójeleket
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Ellenrizzük, hogy csak számok és + jel van benne
  return /^\+?[0-9]{7,15}$/.test(cleaned);
}

/**
 * Százalék validáció (0-100)
 */
export function validatePercentage(value) {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
}

/**
 * Form validáció helper - több mez együttes validálása
 */
export function validateForm(fields, rules) {
  const errors = {};
  
  for (const [fieldName, fieldRules] of Object.entries(rules)) {
    const value = fields[fieldName];
    
    for (const rule of fieldRules) {
      if (rule === 'required' && !validateRequired(value)) {
        errors[fieldName] = 'Ez a mez kötelez';
        break;
      }
      
      if (rule === 'email' && value && !validateEmail(value)) {
        errors[fieldName] = 'Érvényes email cím szükséges';
        break;
      }
      
      if (rule === 'positiveNumber' && value && !validatePositiveNumber(value)) {
        errors[fieldName] = 'Pozitív szám szükséges';
        break;
      }
      
      if (rule === 'integer' && value && !validateInteger(value)) {
        errors[fieldName] = 'Egész szám szükséges';
        break;
      }
      
      if (rule === 'date' && value && !validateDate(value)) {
        errors[fieldName] = 'Érvényes dátum szükséges';
        break;
      }
      
      if (rule === 'url' && value && !validateURL(value)) {
        errors[fieldName] = 'Érvényes URL szükséges';
        break;
      }
      
      if (rule === 'phone' && value && !validatePhone(value)) {
        errors[fieldName] = 'Érvényes telefonszám szükséges';
        break;
      }
      
      if (rule === 'percentage' && value && !validatePercentage(value)) {
        errors[fieldName] = '0-100 közötti szám szükséges';
        break;
      }
      
      // Custom length rule: { type: 'length', min: 3, max: 50 }
      if (typeof rule === 'object' && rule.type === 'length') {
        // Ha min és max is 0, akkor skip (opcionális mez, nincs length validáció)
        if (rule.min === 0 && rule.max === 0) {
          // Skip this rule
        } else if (value && !validateLength(value, rule.min, rule.max)) {
          errors[fieldName] = `A mez hossza ${rule.min}-${rule.max} karakter között kell legyen`;
          break;
        }
      }
      
      // Custom min/max rule: { type: 'min', value: 1 } vagy { type: 'max', value: 100 }
      if (typeof rule === 'object' && rule.type === 'min') {
        const num = Number(value);
        if (value && (isNaN(num) || num < rule.value)) {
          errors[fieldName] = `A minimum érték ${rule.value}`;
          break;
        }
      }
      
      if (typeof rule === 'object' && rule.type === 'max') {
        const num = Number(value);
        if (value && (isNaN(num) || num > rule.value)) {
          errors[fieldName] = `A maximum érték ${rule.value}`;
          break;
        }
      }
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * XSS védelem - HTML karakterek eltávolítása
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}


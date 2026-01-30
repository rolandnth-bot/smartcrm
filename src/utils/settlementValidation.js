/**
 * Settlement validation and calculation utilities
 */

/**
 * Validate parsed settlement data
 * @param {Object} data - Parsed settlement data
 * @returns {{isValid: boolean, errors: string[], warnings: string[]}}
 */
export function validateSettlement(data) {
  const errors = [];
  const warnings = [];

  // Required fields validation
  if (!data.headerInfo?.period) {
    errors.push('Időszak (period) megadása kötelező');
  }

  if (!data.headerInfo?.issueDate) {
    errors.push('Kiállítás dátuma kötelező');
  }

  if (!data.summary?.totalPayout || data.summary.totalPayout <= 0) {
    errors.push('Összpayout nem lehet 0 vagy negatív');
  }

  if (!data.airbnbManagementCommission && data.airbnbManagementCommission !== 0) {
    errors.push('Airbnb management commission hiányzik');
  }

  if (!data.bookingManagementCommission && data.bookingManagementCommission !== 0) {
    errors.push('Booking management commission hiányzik');
  }

  // Calculation validation (tolerance: ±5 EUR)
  const tolerance = 5;

  // Validate Airbnb management commission
  if (data.airbnbTotals?.totalNetRentFee) {
    const calculatedAirbnbMgmt = data.airbnbTotals.totalNetRentFee * (data.headerInfo.ifaPercent / 100);
    const diff = Math.abs(calculatedAirbnbMgmt - data.airbnbManagementCommission);

    if (diff > tolerance) {
      warnings.push(
        `Airbnb Management Commission eltérés: ${diff.toFixed(2)} EUR (számított: ${calculatedAirbnbMgmt.toFixed(2)}, importált: ${data.airbnbManagementCommission.toFixed(2)})`
      );
    }
  }

  // Validate Booking management commission
  if (data.bookingTotals?.totalNetRentFee) {
    const calculatedBookingMgmt = data.bookingTotals.totalNetRentFee * (data.headerInfo.ifaPercent / 100);
    const diff = Math.abs(calculatedBookingMgmt - data.bookingManagementCommission);

    if (diff > tolerance) {
      warnings.push(
        `Booking Management Commission eltérés: ${diff.toFixed(2)} EUR (számított: ${calculatedBookingMgmt.toFixed(2)}, importált: ${data.bookingManagementCommission.toFixed(2)})`
      );
    }
  }

  // Negative value check
  if (data.summary?.coHostPayout && data.summary.coHostPayout < 0) {
    warnings.push('Co-host payout negatív érték! Ellenőrizd a költségeket.');
  }

  // Occupancy validation
  if (data.summary?.occupancyPercent && data.summary.occupancyPercent > 100) {
    errors.push('Foglaltsági arány nem lehet 100% felett');
  }

  if (data.summary?.occupancyPercent && data.summary.occupancyPercent < 0) {
    errors.push('Foglaltsági arány nem lehet negatív');
  }

  // Date validation
  if (data.headerInfo?.issueDate && !isValidDate(data.headerInfo.issueDate)) {
    errors.push('Érvénytelen kiállítási dátum formátum');
  }

  // Check for missing reservations
  if ((!data.airbnbReservations || data.airbnbReservations.length === 0) &&
      (!data.bookingReservations || data.bookingReservations.length === 0)) {
    warnings.push('Nincsenek foglalások importálva');
  }

  // Validate reservation data integrity
  if (data.airbnbReservations) {
    data.airbnbReservations.forEach((res, idx) => {
      if (!res.guestName) {
        warnings.push(`Airbnb foglalás #${idx + 1}: hiányzó vendég név`);
      }
      if (!res.nights || res.nights <= 0) {
        errors.push(`Airbnb foglalás #${idx + 1}: érvénytelen éjszakák száma`);
      }
      if (res.netRentFee < 0) {
        warnings.push(`Airbnb foglalás #${idx + 1}: negatív bérleti díj`);
      }
    });
  }

  if (data.bookingReservations) {
    data.bookingReservations.forEach((res, idx) => {
      if (!res.guestName) {
        warnings.push(`Booking foglalás #${idx + 1}: hiányzó vendég név`);
      }
      if (!res.nights || res.nights <= 0) {
        errors.push(`Booking foglalás #${idx + 1}: érvénytelen éjszakák száma`);
      }
      if (res.netRentFee < 0) {
        warnings.push(`Booking foglalás #${idx + 1}: negatív bérleti díj`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate derived fields from parsed data
 * @param {Object} data - Parsed settlement data
 * @returns {Object} Calculated fields
 */
export function calculateDerivedFields(data) {
  // Total nights
  const totalNights = (data.airbnbTotals?.totalNights || 0) + (data.bookingTotals?.totalNights || 0);

  // Total net rent fee
  const totalNetRentFee = (data.airbnbTotals?.totalNetRentFee || 0) + (data.bookingTotals?.totalNetRentFee || 0);

  // Total management commission
  const totalManagementCommission = (data.airbnbManagementCommission || 0) + (data.bookingManagementCommission || 0);

  // Days in month (extract from period or calculate)
  let daysInMonth = 30; // Default
  if (data.headerInfo?.period) {
    const [year, month] = data.headerInfo.period.split('-').map(Number);
    if (year && month) {
      daysInMonth = new Date(year, month, 0).getDate();
    }
  }

  // Occupancy percent
  const occupancyPercent = totalNights > 0 && daysInMonth > 0
    ? (totalNights / daysInMonth) * 100
    : 0;

  // Daily base price
  const dailyBasePrice = totalNights > 0
    ? totalNetRentFee / totalNights
    : 0;

  // Profit gross
  const profitGross = totalNetRentFee - totalManagementCommission;

  // Co-host payout
  const coHostPayout = (data.summary?.totalPayout || 0)
    - totalManagementCommission
    - (data.summary?.totalCleaning || 0)
    - (data.summary?.supplies || 0)
    - (data.summary?.otherExpenses || 0);

  return {
    totalNights,
    totalNetRentFee,
    totalManagementCommission,
    daysInMonth,
    occupancyPercent,
    dailyBasePrice,
    profitGross,
    coHostPayout
  };
}

/**
 * Validate date string
 * @private
 */
function isValidDate(dateString) {
  if (!dateString) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format period string to YYYY-MM
 * @param {string} period - Period string (various formats)
 * @returns {string} Normalized period (YYYY-MM)
 */
export function normalizePeriod(period) {
  if (!period) return '';

  // Already in YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(period)) {
    return period;
  }

  // Try parsing "2025 Április" format
  const monthNames = {
    'január': '01', 'január': '01',
    'február': '02',
    'március': '03',
    'április': '04',
    'máj': '05', 'május': '05',
    'június': '06',
    'július': '07',
    'augusztus': '08',
    'szeptember': '09',
    'október': '10',
    'november': '11',
    'december': '12'
  };

  const match = period.match(/(\d{4})\s+(\w+)/i);
  if (match) {
    const year = match[1];
    const monthName = match[2].toLowerCase();
    const month = monthNames[monthName];

    if (month) {
      return `${year}-${month}`;
    }
  }

  // Try parsing "Április 2025" format
  const match2 = period.match(/(\w+)\s+(\d{4})/i);
  if (match2) {
    const monthName = match2[1].toLowerCase();
    const year = match2[2];
    const month = monthNames[monthName];

    if (month) {
      return `${year}-${month}`;
    }
  }

  // Fallback: return as-is
  return period;
}

/**
 * Format currency value
 * @param {number} value - Currency value
 * @param {string} currency - Currency code (EUR/HUF)
 * @returns {string} Formatted currency string
 */
export function formatSettlementCurrency(value, currency = 'EUR') {
  if (typeof value !== 'number' || isNaN(value)) {
    return currency === 'EUR' ? '0.00 €' : '0 Ft';
  }

  if (currency === 'EUR') {
    return `${value.toFixed(2)} €`;
  } else if (currency === 'HUF') {
    return `${Math.round(value).toLocaleString('hu-HU')} Ft`;
  }

  return value.toString();
}

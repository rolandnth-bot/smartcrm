import { useState, useCallback, useMemo, memo } from 'react';
import useBookingsStore from '../../stores/bookingsStore';
import useApartmentsStore from '../../stores/apartmentsStore';
import useIcalSyncStore from '../../stores/icalSyncStore';
import Modal from './Modal';
import Button from './Button';
import { X, Sync } from './Icons';
import { formatCurrencyHUF } from '../../utils/numberUtils';

// Platform színek (komponensen kívül, hogy ne jöjjön létre minden render során)
const platformColors = {
  airbnb: 'bg-pink-500',
  booking: 'bg-blue-500',
  szallas: 'bg-red-500',
  direct: 'bg-green-500',
  other: 'bg-gray-500'
};

const Calendar = memo(({ onApartmentClick }) => {
  const { getFilteredBookings, setSelectedBooking, setShowEditBooking, fetchFromApi } = useBookingsStore();
  const { apartments } = useApartmentsStore();
  const bookings = getFilteredBookings();
  const { syncApartment, getSyncStatus } = useIcalSyncStore();

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());

  const monthNames = useMemo(() => [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ], []);

  const handlePreviousMonth = useCallback(() => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  }, [calendarMonth, calendarYear]);

  const handleNextMonth = useCallback(() => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  }, [calendarMonth, calendarYear]);

  const handleBookingClick = useCallback((booking) => {
    setSelectedBooking(booking);
    setShowEditBooking(true);
  }, [setSelectedBooking, setShowEditBooking]);

  const handleSyncClick = useCallback(
    async (apt) => {
      await syncApartment(apt.id);
      if (fetchFromApi) fetchFromApi();
    },
    [syncApartment, fetchFromApi]
  );

  const handleApartmentClick = useCallback(
    (apt) => {
      if (onApartmentClick) {
        onApartmentClick(apt);
      } else {
        handleSyncClick(apt);
      }
    },
    [onApartmentClick, handleSyncClick]
  );

  const daysInMonth = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0).getDate(), [calendarYear, calendarMonth]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const monthStart = useMemo(() => new Date(calendarYear, calendarMonth, 1), [calendarYear, calendarMonth]);
  const monthEnd = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0), [calendarYear, calendarMonth]);

  // Előre kiszámoljuk az összes lakáshoz tartozó foglalásokat
  const bookingsByApartment = useMemo(() => {
    return apartments.reduce((acc, apt) => {
      const aptId = String(apt.id);
      acc[apt.id] = bookings.filter((b) => {
        const start = new Date(b.dateFrom || b.checkIn);
        const end = new Date(b.dateTo || b.checkOut);
        return (
          String(b.apartmentId) === aptId &&
          end >= monthStart &&
          start <= monthEnd
        );
      });
      return acc;
    }, {});
  }, [apartments, bookings, monthStart, monthEnd]);

  // Naptár konténer minimális szélessége (memoizálva)
  const calendarMinWidth = useMemo(() => `${100 + daysInMonth * 28}px`, [daysInMonth]);

  // Konstans style objektum részek
  const bookingMinWidthStyle = useMemo(() => ({ minWidth: '24px' }), []);

  // Keyboard handler memoizálva
  const handleBookingKeyDown = useCallback((e, booking) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleBookingClick(booking);
    }
  }, [handleBookingClick]);

  return (
    <div className="space-y-4">
      {/* Hónap navigáció */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={handlePreviousMonth}
          variant="ghost"
          size="sm"
          aria-label="Előző hónap"
        >
          ←
        </Button>
        <h3 className="text-xl font-bold dark:text-gray-200">
          {monthNames[calendarMonth]} {calendarYear}
        </h3>
        <Button
          onClick={handleNextMonth}
          variant="ghost"
          size="sm"
          aria-label="Következő hónap"
        >
          →
        </Button>
      </div>

      {/* Naptár rács - Lakás soronként, hónap oszloponként */}
      <div className="border dark:border-gray-700 rounded-xl overflow-x-auto" role="region" aria-label={`Foglalások naptára: ${monthNames[calendarMonth]} ${calendarYear}`}>
        <div style={{ minWidth: calendarMinWidth }}>
          {/* Fejléc - napok */}
          <div className="flex bg-gray-100 dark:bg-gray-700 border-b dark:border-gray-600 sticky top-0 z-10" role="row">
            <div className="w-28 min-w-28 p-2 font-bold text-sm border-r dark:border-gray-600 bg-gray-200 dark:bg-gray-800 dark:text-gray-200 flex-shrink-0" role="columnheader" aria-label="Lakás">
              Lakás
            </div>
            {days.map((day) => {
              const date = new Date(calendarYear, calendarMonth, day);
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = date.toDateString() === new Date().toDateString();
              return (
                <div
                  key={day}
                  className={`w-7 min-w-7 p-1 text-center text-xs border-r dark:border-gray-600 flex-shrink-0 dark:text-gray-200 ${
                    isToday ? 'bg-blue-200 dark:bg-blue-900 font-bold' : isWeekend ? 'bg-gray-200 dark:bg-gray-800' : ''
                  }`}
                  role="columnheader"
                  aria-label={isToday ? `Ma, ${day}. nap` : `${day}. nap`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Lakás sorok */}
          {apartments.map((apt) => {
            const aptBookings = bookingsByApartment[apt.id] || [];
            const syncStatus = getSyncStatus(apt.id);
            const isSyncing = syncStatus?.status === 'syncing';

            return (
              <div key={apt.id} className="flex border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" role="row">
                <button
                  type="button"
                  onClick={() => handleApartmentClick(apt)}
                  className="w-28 min-w-28 p-1 text-xs font-medium border-r dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 truncate flex-shrink-0 text-left hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-r"
                  title={onApartmentClick ? `${apt.name} – iCal beállítások` : `${apt.name} – iCal szinkronizálás`}
                  aria-label={onApartmentClick ? `Lakás: ${apt.name}. Kattintás: iCal beállítások.` : `Lakás: ${apt.name}. Kattintás: iCal szinkronizálás.`}
                  disabled={!onApartmentClick && isSyncing}
                >
                  <span className="flex items-center gap-1">
                    {!onApartmentClick && isSyncing && <Sync className="animate-spin" />}
                    {apt.name}
                  </span>
                </button>
                <div className="flex-1 relative h-7 flex" role="gridcell" aria-label={`${apt.name} foglalásai`}>
                  {days.map((day) => {
                    const date = new Date(calendarYear, calendarMonth, day);
                    const dayOfWeek = date.getDay();
                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                    return (
                      <div
                        key={day}
                        className={`w-7 min-w-7 border-r dark:border-gray-700 flex-shrink-0 ${
                          isWeekend ? 'bg-gray-100 dark:bg-gray-800' : ''
                        }`}
                      />
                    );
                  })}

                  {/* Foglalás csíkok */}
                  {aptBookings.map((booking) => {
                    const bookingStart = new Date(booking.dateFrom || booking.checkIn);
                    const bookingEnd = new Date(booking.dateTo || booking.checkOut);

                    // Számoljuk ki a kezdő és záró napot
                    let startDay = bookingStart < monthStart ? 1 : bookingStart.getDate();
                    let endDay = bookingEnd > monthEnd ? daysInMonth : bookingEnd.getDate();

                    const leftPx = (startDay - 1) * 28;
                    const widthPx = (endDay - startDay + 1) * 28 - 2;

                    return (
                      <div
                        key={booking.id}
                        onClick={() => handleBookingClick(booking)}
                        className={`absolute top-1 h-5 ${
                          platformColors[booking.platform] || 'bg-gray-500'
                        } rounded text-white text-xs flex items-center px-1 overflow-hidden cursor-pointer hover:opacity-80 shadow`}
                        style={{
                          left: `${leftPx}px`,
                          width: `${widthPx}px`,
                          ...bookingMinWidthStyle
                        }}
                        title={`${booking.guestName || 'Vendég'} - ${booking.nights || 1} éj - ${booking.payoutEur || ''} EUR`}
                        aria-label={`Foglalás: ${booking.guestName || 'Vendég'}, ${booking.nights || 1} éjszaka, ${booking.payoutEur || ''} EUR, ${booking.platform || 'Egyéb'} platform`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => handleBookingKeyDown(e, booking)}
                      >
                        <span className="truncate text-xs">
                          {booking.guestName || booking.platform}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jelmagyarázat */}
      <div className="flex gap-4 mt-4 text-sm dark:text-gray-300" role="list" aria-label="Platform színjelmagyarázat">
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-4 h-4 bg-pink-500 rounded" aria-hidden="true"></div>
          <span>Airbnb</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-4 h-4 bg-blue-500 rounded" aria-hidden="true"></div>
          <span>Booking</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-4 h-4 bg-red-500 rounded" aria-hidden="true"></div>
          <span>Szallas.hu</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-4 h-4 bg-green-500 rounded" aria-hidden="true"></div>
          <span>Direkt</span>
        </div>
        <div className="flex items-center gap-1" role="listitem">
          <div className="w-4 h-4 bg-gray-500 rounded" aria-hidden="true"></div>
          <span>Egyéb</span>
        </div>
      </div>

      {/* Foglalás kattintáskor ugyanaz a szerkesztő modal nyílik (BookingsPage) */}
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;


import { useState, useCallback, useMemo, memo } from 'react';
import useBookingsStore from '../../stores/bookingsStore';
import useApartmentsStore from '../../stores/apartmentsStore';
import useIcalSyncStore from '../../stores/icalSyncStore';
import Button from './Button';
import { Sync } from './Icons';
import { formatCurrencyHUF } from '../../utils/numberUtils';

// Platform színek és ikonok
const platformStyles = {
  airbnb: {
    bg: 'bg-[#FF5A5F]',
    text: 'text-white',
    icon: '🏠',
    label: 'Airbnb'
  },
  booking: {
    bg: 'bg-[#003580]',
    text: 'text-white',
    icon: '🛏️',
    label: 'Booking.com'
  },
  szallas: {
    bg: 'bg-[#E31C5F]',
    text: 'text-white',
    icon: '🏨',
    label: 'Szallas.hu'
  },
  direct: {
    bg: 'bg-amber-500',
    text: 'text-white',
    icon: '📞',
    label: 'Direct'
  },
  other: {
    bg: 'bg-gray-500',
    text: 'text-white',
    icon: '📋',
    label: 'Other'
  }
};

const Calendar = memo(({ onApartmentClick, onBookingClick }) => {
  const { getFilteredBookings, setSelectedBooking, setShowEditBooking, fetchFromApi } = useBookingsStore();
  const { apartments } = useApartmentsStore();
  const bookings = getFilteredBookings();
  const { syncApartment, getSyncStatus } = useIcalSyncStore();

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const monthNames = useMemo(() => [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ], []);

  const dayNames = ['Vas', 'Hét', 'Kedd', 'Sze', 'Csüt', 'Pén', 'Szo'];

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
    if (onBookingClick) {
      onBookingClick(booking);
    } else {
      setSelectedBooking(booking);
      setShowEditBooking(true);
    }
  }, [onBookingClick, setSelectedBooking, setShowEditBooking]);

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

  const handleBookingMouseEnter = useCallback((booking, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({ x: rect.left, y: rect.bottom + 5 });
    setHoveredBooking(booking);
  }, []);

  const handleBookingMouseLeave = useCallback(() => {
    setHoveredBooking(null);
  }, []);

  const daysInMonth = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0).getDate(), [calendarYear, calendarMonth]);
  const days = useMemo(() => Array.from({ length: daysInMonth }, (_, i) => i + 1), [daysInMonth]);

  const monthStart = useMemo(() => new Date(calendarYear, calendarMonth, 1), [calendarYear, calendarMonth]);
  const monthEnd = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0), [calendarYear, calendarMonth]);

  // Foglalások lakásonként
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

  const cellWidth = 32; // px per day (csökkentett méret)

  return (
    <div className="space-y-4">
      {/* Fejléc - Hónap navigáció + Jelmagyarázat */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={handlePreviousMonth}
            variant="ghost"
            size="sm"
            aria-label="Előző hónap"
          >
            ‹
          </Button>
          <h3 className="text-lg font-bold dark:text-gray-200 min-w-[150px] text-center">
            {monthNames[calendarMonth]} {calendarYear}
          </h3>
          <Button
            onClick={handleNextMonth}
            variant="ghost"
            size="sm"
            aria-label="Következő hónap"
          >
            ›
          </Button>
        </div>

        {/* Jelmagyarázat */}
        <div className="flex items-center gap-3 text-xs dark:text-gray-300">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-[#FF5A5F] rounded-full"></div>
            <span>Airbnb</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-[#003580] rounded-full"></div>
            <span>Booking.com</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-[#E31C5F] rounded-full"></div>
            <span>Szallas.hu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
            <span>Direct/Other</span>
          </div>
        </div>
      </div>

      {/* Naptár - Smartpms stílus */}
      <div className="border dark:border-gray-700 rounded-xl overflow-hidden bg-white dark:bg-gray-800">
        {/* Fejléc - Dátumok */}
        <div className="flex border-b-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-900">
          {/* Fix bal oldali oszlop - Lakás */}
          <div className="w-32 min-w-32 p-2 font-bold text-xs border-r-2 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-200 sticky left-0 z-20">
            Lakás
          </div>

          {/* Scrollozható dátumok */}
          <div className="flex overflow-x-auto flex-1">
            {days.map((day) => {
              const date = new Date(calendarYear, calendarMonth, day);
              const dayOfWeek = date.getDay();
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <div
                  key={day}
                  className={`min-w-[${cellWidth}px] w-[${cellWidth}px] p-1 text-center border-r dark:border-gray-700 ${
                    isToday
                      ? 'bg-blue-100 dark:bg-blue-900/30 font-bold'
                      : isWeekend
                      ? 'bg-gray-100 dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-900'
                  }`}
                  style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px` }}
                >
                  <div className={`text-[10px] font-medium ${isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                    {dayNames[dayOfWeek]}
                  </div>
                  <div className={`text-xs font-semibold ${isToday ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                    {day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lakás sorok */}
        <div className="max-h-[600px] overflow-y-auto">
          {apartments.map((apt) => {
            const aptBookings = bookingsByApartment[apt.id] || [];
            const syncStatus = getSyncStatus(apt.id);
            const isSyncing = syncStatus?.status === 'syncing';

            return (
              <div key={apt.id} className="flex border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 min-h-[50px]">
                {/* Fix bal oldali oszlop - Lakás neve */}
                <button
                  type="button"
                  onClick={() => handleApartmentClick(apt)}
                  className="w-32 min-w-32 p-2 text-xs font-medium border-r-2 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-200 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500 sticky left-0 z-10 flex items-center gap-1.5"
                  title={onApartmentClick ? `${apt.name} – iCal beállítások` : `${apt.name} – iCal szinkronizálás`}
                >
                  {!onApartmentClick && isSyncing && <Sync className="animate-spin w-3 h-3" />}
                  <span className="truncate text-[11px]">{apt.name}</span>
                </button>

                {/* Scrollozható naptár cellák + foglalások */}
                <div className="flex-1 relative overflow-x-auto">
                  <div className="flex h-full relative" style={{ minWidth: `${cellWidth * daysInMonth}px` }}>
                    {/* Háttér cellák */}
                    {days.map((day) => {
                      const date = new Date(calendarYear, calendarMonth, day);
                      const dayOfWeek = date.getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                      return (
                        <div
                          key={day}
                          className={`border-r dark:border-gray-700 ${isWeekend ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                          style={{ minWidth: `${cellWidth}px`, width: `${cellWidth}px` }}
                        />
                      );
                    })}

                    {/* Foglalási buborékok - félnapos megjelenítés */}
                    {aptBookings.map((booking) => {
                      const bookingStart = new Date(booking.dateFrom || booking.checkIn);
                      const bookingEnd = new Date(booking.dateTo || booking.checkOut);

                      let startDay = bookingStart < monthStart ? 1 : bookingStart.getDate();
                      let endDay = bookingEnd > monthEnd ? daysInMonth : bookingEnd.getDate();

                      // Félnapos logika
                      const isCheckInDayInMonth = bookingStart >= monthStart;
                      const isCheckOutDayInMonth = bookingEnd <= monthEnd;
                      const isMultiDay = endDay > startDay;

                      // Check-in nap: csík a nap közepétől indul (jobb fél)
                      const startOffset = isCheckInDayInMonth ? cellWidth / 2 : 0;

                      // Check-out nap: csík a nap közepéig tart (bal fél)
                      const endOffset = isCheckOutDayInMonth ? cellWidth / 2 : 0;

                      const leftPx = (startDay - 1) * cellWidth + startOffset;
                      const totalWidth = (endDay - startDay + 1) * cellWidth;
                      const widthPx = totalWidth - startOffset - endOffset - 4;

                      // Border-radius dinamikus beállítása
                      let borderRadius = '8px';
                      if (isMultiDay) {
                        // Többnapos foglalás
                        const borderTopLeftRadius = isCheckInDayInMonth ? '8px' : '0';
                        const borderBottomLeftRadius = isCheckInDayInMonth ? '8px' : '0';
                        const borderTopRightRadius = isCheckOutDayInMonth ? '8px' : '0';
                        const borderBottomRightRadius = isCheckOutDayInMonth ? '8px' : '0';
                        borderRadius = `${borderTopLeftRadius} ${borderTopRightRadius} ${borderBottomRightRadius} ${borderBottomLeftRadius}`;
                      }

                      const platformStyle = platformStyles[booking.platform] || platformStyles.other;
                      const priceDisplay = booking.payoutEur ? `€${booking.payoutEur}` : booking.payoutFt ? `${Math.round(booking.payoutFt / 1000)}k Ft` : '';

                      return (
                        <div
                          key={booking.id}
                          onClick={() => handleBookingClick(booking)}
                          onMouseEnter={(e) => handleBookingMouseEnter(booking, e)}
                          onMouseLeave={handleBookingMouseLeave}
                          className={`absolute ${platformStyle.bg} ${platformStyle.text} px-2 py-1.5 cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200 z-10 flex items-center gap-1 text-[11px] font-medium`}
                          style={{
                            left: `${leftPx}px`,
                            width: `${widthPx}px`,
                            minWidth: '40px',
                            height: '40px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            borderRadius
                          }}
                          title={`${booking.guestName || 'Vendég'} - ${booking.nights || 1} éj`}
                        >
                          <span className="text-xs">{platformStyle.icon}</span>
                          <div className="flex-1 truncate flex items-center gap-0.5">
                            {priceDisplay && <span className="font-bold text-[10px]">{priceDisplay}</span>}
                            {booking.guestName && widthPx > 60 && <span className="truncate text-[10px]">{booking.guestName.split(' ')[0]}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredBooking && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-800 text-white p-4 rounded-lg shadow-2xl border border-gray-700 max-w-xs"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="space-y-2 text-sm">
            <div className="font-bold text-base border-b border-gray-700 pb-2">
              {hoveredBooking.guestName || 'Vendég'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-400">Platform:</div>
              <div className="font-medium">{platformStyles[hoveredBooking.platform]?.label || 'Other'}</div>

              <div className="text-gray-400">Éjszakák:</div>
              <div className="font-medium">{hoveredBooking.nights || 1} éj</div>

              {hoveredBooking.payoutEur && (
                <>
                  <div className="text-gray-400">Szobaár:</div>
                  <div className="font-medium">€{hoveredBooking.payoutEur}</div>
                </>
              )}

              {hoveredBooking.payoutFt && (
                <>
                  <div className="text-gray-400">Teljes ár:</div>
                  <div className="font-medium">{formatCurrencyHUF(hoveredBooking.payoutFt)}</div>
                </>
              )}

              <div className="text-gray-400">Check-in:</div>
              <div className="font-medium">
                {new Date(hoveredBooking.dateFrom || hoveredBooking.checkIn).toLocaleDateString('hu-HU')}
                {hoveredBooking.checkInTime && ` ${hoveredBooking.checkInTime}`}
              </div>

              <div className="text-gray-400">Check-out:</div>
              <div className="font-medium">
                {new Date(hoveredBooking.dateTo || hoveredBooking.checkOut).toLocaleDateString('hu-HU')}
                {hoveredBooking.checkOutTime && ` ${hoveredBooking.checkOutTime}`}
              </div>

              {hoveredBooking.guestCount && (
                <>
                  <div className="text-gray-400">Vendégek:</div>
                  <div className="font-medium">{hoveredBooking.guestCount} fő</div>
                </>
              )}
            </div>
            {hoveredBooking.notes && (
              <div className="pt-2 border-t border-gray-700 text-gray-300 text-xs">
                {hoveredBooking.notes}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Calendar.displayName = 'Calendar';

export default Calendar;

import { useState, useMemo, useCallback } from 'react';
import useMaintenanceStore, { MAINTENANCE_PRIORITIES } from '../../stores/maintenanceStore';
import { toISODateString, todayISO, getMonthName } from '../../utils/dateUtils';
import { formatCurrencyHUF } from '../../utils/numberUtils';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Trash2 } from '../common/Icons';

const WEEKDAYS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
const PRIO_MAP = Object.fromEntries(MAINTENANCE_PRIORITIES.map((p) => [p.key, p]));

const MaintenanceCalendar = ({ onAddForDate }) => {
  const { maintenanceExpenses, removeMaintenance } = useMaintenanceStore();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);

  const monthLabel = useMemo(() => `${getMonthName(month)} ${year}`, [month, year]);
  const today = useMemo(() => todayISO(), []);

  const prevMonth = useCallback(() => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const nextMonth = useCallback(() => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month]);

  const itemsByDate = useMemo(() => {
    const map = {};
    maintenanceExpenses.forEach((m) => {
      const iso = toISODateString(m.date);
      if (!iso) return;
      if (!map[iso]) map[iso] = [];
      map[iso].push(m);
    });
    return map;
  }, [maintenanceExpenses]);

  const calendarGrid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();
    const padStart = (startWeekday + 6) % 7;
    const cells = [];

    for (let i = 0; i < padStart; i++) {
      const d = prevLast - padStart + 1 + i;
      const date = new Date(year, month - 1, d);
      cells.push({ day: d, iso: toISODateString(date), currentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ day: d, iso: toISODateString(date), currentMonth: true });
    }
    const remaining = 42 - cells.length;
    for (let i = 0; i < remaining; i++) {
      const date = new Date(year, month + 1, i + 1);
      cells.push({ day: i + 1, iso: toISODateString(date), currentMonth: false });
    }
    return cells;
  }, [year, month]);

  const selectedItems = useMemo(() => {
    if (!selectedDate) return [];
    return itemsByDate[selectedDate] || [];
  }, [selectedDate, itemsByDate]);

  const handleDayClick = useCallback((iso) => {
    setSelectedDate(iso);
    setShowDayModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowDayModal(false);
    setSelectedDate(null);
  }, []);

  const formatDisplayDate = useCallback((iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}.`;
  }, []);

  const handleAddForDay = useCallback(() => {
    if (selectedDate && onAddForDate) {
      onAddForDate(selectedDate);
      handleCloseModal();
    }
  }, [selectedDate, onAddForDate, handleCloseModal]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Karbantartás naptár</h3>
      <div className="flex items-center justify-between mb-3">
        <Button onClick={prevMonth} variant="ghost" size="sm" aria-label="Előző hónap">
          ←
        </Button>
        <span className="text-lg font-semibold dark:text-gray-200">{monthLabel}</span>
        <Button onClick={nextMonth} variant="ghost" size="sm" aria-label="Következő hónap">
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center" role="grid" aria-label={`Karbantartás naptár: ${monthLabel}`}>
        {WEEKDAYS.map((wd) => (
          <div key={wd} className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1" role="columnheader">
            {wd}
          </div>
        ))}
        {calendarGrid.map((cell, idx) => {
          const items = itemsByDate[cell.iso] || [];
          const hasAny = items.length > 0;
          const isToday = cell.iso === today;
          const prios = [...new Set(items.map((i) => i.priority || 'normal'))];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(cell.iso)}
              className={`
                min-h-[64px] p-1 rounded-lg text-left flex flex-col items-center
                focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800
                ${!cell.currentMonth ? 'text-gray-300 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}
                ${isToday ? 'bg-amber-100 dark:bg-amber-900/40 ring-1 ring-amber-400 dark:ring-amber-600' : ''}
                ${hasAny ? 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
              aria-label={cell.currentMonth ? `${cell.day}. nap${hasAny ? `, ${items.length} bejelentés` : ''}` : ''}
            >
              <span className="text-sm font-medium">{cell.day}</span>
              {hasAny && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                  {prios.map((p) => (
                    <span
                      key={p}
                      className={`w-1.5 h-1.5 rounded-full ${PRIO_MAP[p]?.dot || 'bg-gray-500'}`}
                      title={PRIO_MAP[p]?.label}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
        {MAINTENANCE_PRIORITIES.map(({ key, label, dot }) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      <Modal
        isOpen={showDayModal}
        onClose={handleCloseModal}
        title={selectedDate ? `Karbantartás – ${formatDisplayDate(selectedDate)}` : 'Karbantartás'}
        size="md"
      >
        {selectedDate && (
          <div className="space-y-4">
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Ezen a napon nincs karbantartás bejelentés.</p>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((m) => {
                  const prio = PRIO_MAP[m.priority || 'normal'];
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${prio?.color || 'bg-gray-200'} bg-opacity-20 dark:bg-opacity-20`}
                    >
                      <div>
                        <div className="font-medium dark:text-gray-200">{m.description}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {m.apartmentName ? `📌 ${m.apartmentName}` : '—'} · {formatCurrencyHUF(m.amount)}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMaintenance(m.id)}
                        aria-label={`Törlés: ${m.description}`}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {onAddForDate && (
              <Button variant="primary" className="w-full" onClick={handleAddForDay}>
                Új bejelentés ehhez a naphoz
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenanceCalendar;

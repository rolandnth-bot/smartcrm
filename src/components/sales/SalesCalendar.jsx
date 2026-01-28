import { useState, useMemo, useCallback, useEffect } from 'react';
import useLeadsStore from '../../stores/leadsStore';
import useSalesCalendarStore from '../../stores/salesCalendarStore';
import { toISODateString, todayISO, getMonthName } from '../../utils/dateUtils';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { Trash2 } from '../common/Icons';

const WEEKDAYS = ['H', 'K', 'Sze', 'Cs', 'P', 'Szo', 'V'];
const EVENT_TYPES = {
  jelentkezes: { label: 'Jelentkezés', color: 'bg-blue-500', dot: 'bg-blue-500' },
  felmeres: { label: 'Felmérés', color: 'bg-green-500', dot: 'bg-green-500' },
  talalkozo: { label: 'Találkozó', color: 'bg-purple-500', dot: 'bg-purple-500' },
  followup: { label: 'Follow-up', color: 'bg-orange-500', dot: 'bg-orange-500' }
};
const DAY_ITEM_TYPES = {
  feladat: { label: 'Következő feladat', color: 'bg-slate-500', dot: 'bg-slate-500' },
  megjegyzes: { label: 'Megjegyzés', color: 'bg-amber-500', dot: 'bg-amber-500' }
};

const SalesCalendar = ({ onLeadClick, onAddLead }) => {
  const { leads } = useLeadsStore();
  const { dayItems, addDayItem, removeDayItem, getDayItems, loadFromStorage } = useSalesCalendarStore();
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [newFeladat, setNewFeladat] = useState('');
  const [newMegjegyzes, setNewMegjegyzes] = useState('');

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const monthLabel = useMemo(() => `${getMonthName(month)} ${year}`, [month, year]);

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

  const today = useMemo(() => todayISO(), []);

  const eventsByDate = useMemo(() => {
    const map = {};
    const add = (iso, type, lead) => {
      if (!iso) return;
      if (!map[iso]) map[iso] = [];
      map[iso].push({ type, lead });
    };

    leads.forEach((lead) => {
      const appDate = toISODateString(lead.applicationDate || lead.createdAt);
      if (appDate) add(appDate, 'jelentkezes', lead);

      const surveyDate = toISODateString(lead.surveyDate);
      if (surveyDate) add(surveyDate, 'felmeres', lead);

      const apptDate = toISODateString(lead.appointmentDate);
      if (apptDate) add(apptDate, 'talalkozo', lead);

      const followDate = toISODateString(lead.followupDate);
      if (followDate) add(followDate, 'followup', lead);
    });

    return map;
  }, [leads]);

  const calendarGrid = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startWeekday = first.getDay();
    const daysInMonth = last.getDate();
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

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return eventsByDate[selectedDate] || [];
  }, [selectedDate, eventsByDate]);

  const selectedDayItems = useMemo(() => {
    if (!selectedDate) return [];
    return getDayItems(selectedDate);
  }, [selectedDate, getDayItems, dayItems]);

  const handleDayClick = useCallback((iso) => {
    setSelectedDate(iso);
    setShowDayModal(true);
    setNewFeladat('');
    setNewMegjegyzes('');
  }, []);

  const handleCloseDayModal = useCallback(() => {
    setShowDayModal(false);
    setSelectedDate(null);
    setNewFeladat('');
    setNewMegjegyzes('');
  }, []);

  const handleAddFeladat = useCallback(() => {
    if (!selectedDate || !newFeladat.trim()) return;
    addDayItem(selectedDate, { type: 'feladat', title: newFeladat.trim() });
    setNewFeladat('');
  }, [selectedDate, newFeladat, addDayItem]);

  const handleAddMegjegyzes = useCallback(() => {
    if (!selectedDate || !newMegjegyzes.trim()) return;
    addDayItem(selectedDate, { type: 'megjegyzes', text: newMegjegyzes.trim() });
    setNewMegjegyzes('');
  }, [selectedDate, newMegjegyzes, addDayItem]);

  const handleAddLeadForDay = useCallback(() => {
    if (!selectedDate) return;
    onAddLead?.(selectedDate);
    handleCloseDayModal();
  }, [selectedDate, onAddLead, handleCloseDayModal]);

  const handleLeadSelect = useCallback(
    (lead) => {
      handleCloseDayModal();
      onLeadClick?.(lead);
    },
    [onLeadClick, handleCloseDayModal]
  );

  const formatDisplayDate = useCallback((iso) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${y}. ${parseInt(m, 10)}. ${parseInt(d, 10)}.`;
  }, []);

  const uniqueSelectedLeads = useMemo(() => {
    const seen = new Set();
    return selectedEvents.filter((ev) => {
      const key = `${ev.lead.id}-${ev.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [selectedEvents]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
      <h3 className="font-bold text-orange-800 dark:text-orange-300 mb-3">Munkanaptár</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Lead időpontokkal szinkronban (jelentkezés, felmérés, találkozó, follow-up)
      </p>

      <div className="flex items-center justify-between mb-3">
        <Button onClick={prevMonth} variant="ghost" size="sm" aria-label="Előző hónap">
          ←
        </Button>
        <span className="text-lg font-semibold dark:text-gray-200">{monthLabel}</span>
        <Button onClick={nextMonth} variant="ghost" size="sm" aria-label="Következő hónap">
          →
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center" role="grid" aria-label={`Munkanaptár: ${monthLabel}`}>
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 py-1"
            role="columnheader"
          >
            {wd}
          </div>
        ))}
        {calendarGrid.map((cell, idx) => {
          const events = eventsByDate[cell.iso] || [];
          const dayItemsForCell = getDayItems(cell.iso);
          const hasEvents = events.length > 0;
          const hasDayItems = dayItemsForCell.length > 0;
          const hasAny = hasEvents || hasDayItems;
          const isToday = cell.iso === today;
          const dayItemTypes = [...new Set(dayItemsForCell.map((i) => i.type))];

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(cell.iso)}
              className={`
                min-h-[64px] p-1 rounded-lg text-left flex flex-col items-center
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 dark:focus:ring-offset-gray-800
                ${!cell.currentMonth ? 'text-gray-300 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}
                ${isToday ? 'bg-orange-100 dark:bg-orange-900/40 ring-1 ring-orange-400 dark:ring-orange-600' : ''}
                ${hasAny ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
              `}
              aria-label={cell.currentMonth ? `${cell.day}. nap${hasAny ? `, ${events.length + dayItemsForCell.length} elem` : ''}` : ''}
            >
              <span className="text-sm font-medium">{cell.day}</span>
              {(hasEvents || hasDayItems) && (
                <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                  {[...new Set(events.map((e) => e.type))].map((type) => (
                    <span
                      key={`ev-${type}`}
                      className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPES[type]?.dot || 'bg-gray-500'}`}
                      title={EVENT_TYPES[type]?.label}
                    />
                  ))}
                  {dayItemTypes.map((type) => (
                    <span
                      key={`day-${type}`}
                      className={`w-1.5 h-1.5 rounded-full ${DAY_ITEM_TYPES[type]?.dot || 'bg-gray-500'}`}
                      title={DAY_ITEM_TYPES[type]?.label}
                    />
                  ))}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
        {Object.entries(EVENT_TYPES).map(([key, { label, dot }]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
        {Object.entries(DAY_ITEM_TYPES).map(([key, { label, dot }]) => (
          <span key={key} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {label}
          </span>
        ))}
      </div>

      <Modal
        isOpen={showDayModal}
        onClose={handleCloseDayModal}
        title={selectedDate ? `${formatDisplayDate(selectedDate)} – Feladatok, megjegyzések, leadek` : ''}
        size="lg"
      >
        {selectedDate && (
          <div className="space-y-4">
            {/* Lead időpontok */}
            <section>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lead időpontok</h4>
              {uniqueSelectedLeads.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Ezen a napon nincs lead időpont.</p>
              ) : (
                <div className="space-y-2">
                  {uniqueSelectedLeads.map((ev, i) => (
                    <div
                      key={`${ev.lead.id}-${ev.type}-${i}`}
                      className={`flex items-center justify-between p-2 rounded-lg ${EVENT_TYPES[ev.type]?.color || 'bg-gray-200'} bg-opacity-20 dark:bg-opacity-20`}
                    >
                      <div>
                        <div className="font-medium dark:text-gray-200">{ev.lead.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {EVENT_TYPES[ev.type]?.label}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLeadSelect(ev.lead)}
                        aria-label={`Lead megnyitása: ${ev.lead.name}`}
                      >
                        Megnyitás
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Feladatok, megjegyzések */}
            <section>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Feladatok, megjegyzések</h4>
              {selectedDayItems.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Nincs feladat vagy megjegyzés.</p>
              ) : (
                <div className="space-y-2">
                  {selectedDayItems.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-2 rounded-lg ${DAY_ITEM_TYPES[item.type]?.color || 'bg-gray-200'} bg-opacity-20 dark:bg-opacity-20`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                          {DAY_ITEM_TYPES[item.type]?.label}
                        </div>
                        <div className="font-medium dark:text-gray-200 text-sm">
                          {item.type === 'feladat' ? item.title : item.text}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDayItem(item.id)}
                        className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                        aria-label="Törlés"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Új hozzáadása */}
            <section className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Új hozzáadása</h4>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFeladat}
                    onChange={(e) => setNewFeladat(e.target.value)}
                    placeholder="Következő feladat…"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  <Button variant="primary" size="sm" onClick={handleAddFeladat} disabled={!newFeladat.trim()}>
                    Feladat
                  </Button>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newMegjegyzes}
                    onChange={(e) => setNewMegjegyzes(e.target.value)}
                    placeholder="Megjegyzés…"
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                  />
                  <Button variant="outline" size="sm" onClick={handleAddMegjegyzes} disabled={!newMegjegyzes.trim()}>
                    Megjegyzés
                  </Button>
                </div>
                {onAddLead && (
                  <Button variant="primary" className="w-full" onClick={handleAddLeadForDay}>
                    Új lead ehhez a naphoz
                  </Button>
                )}
              </div>
            </section>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SalesCalendar;

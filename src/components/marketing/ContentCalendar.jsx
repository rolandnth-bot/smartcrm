import { useState, useCallback, useMemo, memo } from 'react';
import useMarketingStore from '../../stores/marketingStore';
import { usePermissions } from '../../contexts/PermissionContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Plus, Edit2, Trash2, X } from '../common/Icons';
import { todayISO } from '../../utils/dateUtils';
import { useTheme } from '../../contexts/ThemeContext';

const ContentCalendar = memo(() => {
  const { contentItems, showContentModal, editingContent, setShowContentModal, setEditingContent, addContentItem, updateContentItem, deleteContentItem, getContentByDate } = useMarketingStore();
  const { canEdit: canEditMarketing } = usePermissions();
  const { theme } = useTheme();

  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    title: '',
    type: 'post',
    channel: 'instagram',
    scheduledDate: todayISO(),
    notes: ''
  });

  const monthNames = useMemo(() => [
    'Január', 'Február', 'Március', 'Április', 'Május', 'Június',
    'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'
  ], []);

  const contentTypes = useMemo(() => [
    { key: 'post', label: 'Poszt', icon: '📝' },
    { key: 'story', label: 'Story', icon: '📸' },
    { key: 'reel', label: 'Reel', icon: '🎬' },
    { key: 'video', label: 'Videó', icon: '🎥' },
    { key: 'email', label: 'Email', icon: '📧' },
    { key: 'other', label: 'Egyéb', icon: '📌' }
  ], []);

  const channels = useMemo(() => [
    { key: 'instagram', label: 'Instagram', color: 'bg-pink-500' },
    { key: 'facebook', label: 'Facebook', color: 'bg-blue-500' },
    { key: 'tiktok', label: 'TikTok', color: 'bg-black' },
    { key: 'email', label: 'Email', color: 'bg-gray-500' },
    { key: 'website', label: 'Weboldal', color: 'bg-green-500' },
    { key: 'other', label: 'Egyéb', color: 'bg-gray-400' }
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

  const daysInMonth = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0).getDate(), [calendarYear, calendarMonth]);
  const firstDayOfMonth = useMemo(() => new Date(calendarYear, calendarMonth, 1).getDay(), [calendarYear, calendarMonth]);

  const days = useMemo(() => {
    const daysArray = [];
    // Üres cellák az első nap előtt
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(null);
    }
    // A hónap napjai
    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push(i);
    }
    return daysArray;
  }, [daysInMonth, firstDayOfMonth]);

  const handleDateClick = useCallback((day) => {
    if (!day) return;
    const date = new Date(calendarYear, calendarMonth, day);
    setSelectedDate(date.toISOString().split('T')[0]);
    setForm({
      title: '',
      type: 'post',
      channel: 'instagram',
      scheduledDate: date.toISOString().split('T')[0],
      notes: ''
    });
    setEditingContent(null);
    setShowContentModal(true);
  }, [calendarYear, calendarMonth, setShowContentModal]);

  const handleContentClick = useCallback((content) => {
    setEditingContent(content);
    setForm({
      title: content.title || '',
      type: content.type || 'post',
      channel: content.channel || 'instagram',
      scheduledDate: content.scheduledDate || todayISO(),
      notes: content.notes || ''
    });
    setShowContentModal(true);
  }, [setEditingContent, setShowContentModal]);

  const handleSave = useCallback(async () => {
    if (!form.title.trim()) {
      return;
    }
    try {
      if (editingContent) {
        await updateContentItem(editingContent.id, form);
      } else {
        await addContentItem(form);
      }
      setShowContentModal(false);
      setEditingContent(null);
      setForm({
        title: '',
        type: 'post',
        channel: 'instagram',
        scheduledDate: todayISO(),
        notes: ''
      });
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a tartalom mentésekor:', e);
      }
    }
  }, [form, editingContent, addContentItem, updateContentItem, setShowContentModal, setEditingContent]);

  const handleDelete = useCallback((id) => {
    setDeleteConfirm(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteConfirm) return;
    try {
      await deleteContentItem(deleteConfirm);
      setDeleteConfirm(null);
      setShowContentModal(false);
      setEditingContent(null);
    } catch (e) {
      if (import.meta.env.DEV) {
        console.error('Hiba a tartalom törlésekor:', e);
      }
    }
  }, [deleteConfirm, deleteContentItem, setShowContentModal, setEditingContent]);

  const handleCloseModal = useCallback(() => {
    setShowContentModal(false);
    setEditingContent(null);
    setForm({
      title: '',
      type: 'post',
      channel: 'instagram',
      scheduledDate: todayISO(),
      notes: ''
    });
  }, [setShowContentModal, setEditingContent]);

  const getContentForDay = useCallback((day) => {
    if (!day) return [];
    const date = new Date(calendarYear, calendarMonth, day);
    const dateStr = date.toISOString().split('T')[0];
    return getContentByDate(dateStr);
  }, [calendarYear, calendarMonth, getContentByDate]);

  const bgClass = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const textClass = theme === 'dark' ? 'text-gray-200' : 'text-gray-800';
  const borderClass = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const headerBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';
  const todayBgClass = theme === 'dark' ? 'bg-blue-900' : 'bg-blue-200';
  const weekendBgClass = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100';

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
        <h3 className={`text-xl font-bold ${textClass}`}>
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

      {/* Naptár rács */}
      <div className={`border ${borderClass} rounded-xl overflow-hidden`} role="region" aria-label={`Tartalom naptára: ${monthNames[calendarMonth]} ${calendarYear}`}>
        {/* Hét napok fejléc */}
        <div className={`flex ${headerBgClass} border-b ${borderClass}`} role="row">
          {['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'].map((day, idx) => (
            <div
              key={idx}
              className={`flex-1 p-2 text-center text-xs font-bold ${textClass} border-r ${borderClass} last:border-r-0`}
              role="columnheader"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Naptár napok */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className="aspect-square border-r border-b border-gray-200 dark:border-gray-700" />;
            }

            const date = new Date(calendarYear, calendarMonth, day);
            const isToday = date.toDateString() === new Date().toDateString();
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const dayContent = getContentForDay(day);

            return (
              <div
                key={idx}
                className={`aspect-square border-r border-b ${borderClass} p-1 ${
                  isToday ? todayBgClass : isWeekend ? weekendBgClass : ''
                } hover:bg-opacity-80 cursor-pointer transition-colors`}
                onClick={() => handleDateClick(day)}
                role="gridcell"
                aria-label={`${day}. nap${isToday ? ' (ma)' : ''}`}
              >
                <div className={`text-xs font-medium mb-1 ${textClass}`}>{day}</div>
                <div className="space-y-0.5">
                  {dayContent.slice(0, 2).map((content) => {
                    const channel = channels.find((c) => c.key === content.channel);
                    const type = contentTypes.find((t) => t.key === content.type);
                    return (
                      <div
                        key={content.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleContentClick(content);
                        }}
                        className={`text-xs px-1 py-0.5 rounded truncate ${channel?.color || 'bg-gray-400'} text-white cursor-pointer hover:opacity-80`}
                        title={content.title}
                      >
                        {type?.icon || '📌'} {content.title}
                      </div>
                    );
                  })}
                  {dayContent.length > 2 && (
                    <div className={`text-xs px-1 py-0.5 rounded bg-gray-400 text-white`}>
                      +{dayContent.length - 2} több
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Jelmagyarázat */}
      <div className="flex flex-wrap gap-4 mt-4 text-sm" role="list" aria-label="Csatorna színjelmagyarázat">
        {channels.map((channel) => (
          <div key={channel.key} className="flex items-center gap-1" role="listitem">
            <div className={`w-4 h-4 ${channel.color} rounded`} aria-hidden="true"></div>
            <span className={textClass}>{channel.label}</span>
          </div>
        ))}
      </div>

      {/* Tartalom modal */}
      <Modal
        isOpen={showContentModal}
        onClose={handleCloseModal}
        title={editingContent ? 'Tartalom szerkesztése' : 'Új tartalom'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="content-title" className={`block text-sm font-medium ${textClass} mb-1`}>
              Cím *
            </label>
            <input
              id="content-title"
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2 border ${borderClass} dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Tartalom címe"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="content-type" className={`block text-sm font-medium ${textClass} mb-1`}>
                Típus
              </label>
              <select
                id="content-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className={`w-full px-3 py-2 border ${borderClass} dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {contentTypes.map((type) => (
                  <option key={type.key} value={type.key}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="content-channel" className={`block text-sm font-medium ${textClass} mb-1`}>
                Csatorna
              </label>
              <select
                id="content-channel"
                value={form.channel}
                onChange={(e) => setForm({ ...form, channel: e.target.value })}
                className={`w-full px-3 py-2 border ${borderClass} dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                {channels.map((channel) => (
                  <option key={channel.key} value={channel.key}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="content-date" className={`block text-sm font-medium ${textClass} mb-1`}>
              Ütemezett dátum
            </label>
            <input
              id="content-date"
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
              className={`w-full px-3 py-2 border ${borderClass} dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
          </div>

          <div>
            <label htmlFor="content-notes" className={`block text-sm font-medium ${textClass} mb-1`}>
              Megjegyzés
            </label>
            <textarea
              id="content-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className={`w-full px-3 py-2 border ${borderClass} dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              rows="3"
              placeholder="Opcionális megjegyzések..."
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              variant="primary"
              className="flex-1"
              disabled={!form.title.trim()}
            >
              Mentés
            </Button>
            {editingContent && canEditMarketing('marketing') && (
              <Button
                onClick={() => handleDelete(editingContent.id)}
                variant="danger"
              >
                <Trash2 />
              </Button>
            )}
            <Button
              onClick={handleCloseModal}
              variant="secondary"
            >
              Mégse
            </Button>
          </div>
        </div>
      </Modal>

      {/* Törlés megerősítés */}
      {deleteConfirm && (
        <Modal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          title="Tartalom törlése"
          size="sm"
        >
          <div className="space-y-4">
            <p className={textClass}>Biztosan törölni szeretnéd ezt a tartalmat?</p>
            <div className="flex gap-2">
              <Button
                onClick={confirmDelete}
                variant="danger"
                className="flex-1"
              >
                Igen, törlés
              </Button>
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="secondary"
                className="flex-1"
              >
                Mégse
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});

ContentCalendar.displayName = 'ContentCalendar';

export default ContentCalendar;


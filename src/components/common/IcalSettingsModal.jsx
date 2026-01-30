import { useState, useEffect, useCallback } from 'react';
import Modal from './Modal';
import Button from './Button';
import Card from './Card';
import { Calendar, Copy, Sync, Download } from './Icons';
import useApartmentsStore from '../../stores/apartmentsStore';
import useIcalSyncStore from '../../stores/icalSyncStore';
import useToastStore from '../../stores/toastStore';
import useBookingsStore from '../../stores/bookingsStore';
import { usePermissions } from '../../contexts/PermissionContext';
import { validateIcalURL } from '../../utils/validation';
import { formatTimeAgo } from '../../utils/dateUtils';
import { generateIcalExportUrl, downloadIcalFile } from '../../utils/icalGenerator';

const FEEDS = [
  { key: 'icalAirbnb', label: 'Airbnb' },
  { key: 'icalBooking', label: 'Booking.com' },
  { key: 'icalSzallas', label: 'Szallas.hu' },
  { key: 'icalOwn', label: 'Saját' }
];

export default function IcalSettingsModal({ apartment, isOpen, onClose }) {
  const { apartments, updateApartment } = useApartmentsStore();
  const { syncApartment, getSyncStatus } = useIcalSyncStore();
  const { bookings } = useBookingsStore();
  const { canEdit: canEditModule } = usePermissions();
  const canEditApartments = useCallback((m) => canEditModule(m), [canEditModule]);

  const [form, setForm] = useState({
    icalAirbnb: '',
    icalBooking: '',
    icalSzallas: '',
    icalOwn: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && apartment) {
      setForm({
        icalAirbnb: apartment.icalAirbnb || '',
        icalBooking: apartment.icalBooking || '',
        icalSzallas: apartment.icalSzallas || '',
        icalOwn: apartment.icalOwn || ''
      });
    }
  }, [isOpen, apartment]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCopyIcalUrl = useCallback(async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      useToastStore.getState().success('iCal URL másolva a vágólapra');
    } catch (e) {
      useToastStore.getState().error('Hiba a másolás során');
    }
  }, []);

  const handleDownloadIcal = useCallback(() => {
    if (!apartment) return;

    // Az adott lakáshoz tartozó foglalások szűrése
    const apartmentBookings = bookings.filter(
      (b) => String(b.apartmentId) === String(apartment.id)
    );

    if (apartmentBookings.length === 0) {
      useToastStore.getState().info('Nincs foglalás ehhez a lakáshoz.');
      return;
    }

    downloadIcalFile(apartmentBookings, apartment);
    useToastStore.getState().success('iCal fájl letöltve!');
  }, [apartment, bookings]);

  const handleIcalSync = useCallback(
    async (aptId, feedId) => {
      await syncApartment(aptId, feedId);
    },
    [syncApartment]
  );

  const handleSyncAllFeeds = useCallback(async () => {
    if (!canEditApartments('apartments')) {
      useToastStore.getState().error('Nincs jogosultsága iCal szinkronizálásra.');
      return;
    }
    const activeFeeds = [];
    apartments.forEach((apt) => {
      if (apt.icalAirbnb) activeFeeds.push({ apartmentId: apt.id, feedId: 'icalAirbnb' });
      if (apt.icalBooking) activeFeeds.push({ apartmentId: apt.id, feedId: 'icalBooking' });
      if (apt.icalSzallas) activeFeeds.push({ apartmentId: apt.id, feedId: 'icalSzallas' });
      if (apt.icalOwn) activeFeeds.push({ apartmentId: apt.id, feedId: 'icalOwn' });
    });
    if (activeFeeds.length === 0) {
      useToastStore.getState().info('Nincs aktív iCal feed a szinkronizáláshoz.');
      return;
    }
    for (const feed of activeFeeds) {
      await syncApartment(feed.apartmentId, feed.feedId);
    }
  }, [apartments, syncApartment, canEditApartments]);

  const handleSave = useCallback(async () => {
    if (!apartment) return;
    const icalUrls = FEEDS.map((f) => ({ key: f.key, url: form[f.key] }));
    const invalidUrls = icalUrls.filter((item) => item.url && !validateIcalURL(item.url));
    if (invalidUrls.length > 0) {
      useToastStore.getState().error(
        `Érvénytelen iCal URL-ek: ${invalidUrls.map((i) => i.key).join(', ')}. Használj HTTPS-t és .ics fájlt vagy ical/calendar URL-t.`
      );
      return;
    }
    setIsSubmitting(true);
    try {
      await updateApartment(apartment.id, {
        icalAirbnb: form.icalAirbnb || '',
        icalBooking: form.icalBooking || '',
        icalSzallas: form.icalSzallas || '',
        icalOwn: form.icalOwn || ''
      });
      onClose();
    } catch (e) {
      // store handles toast
    } finally {
      setIsSubmitting(false);
    }
  }, [apartment, form, updateApartment, onClose]);

  if (!apartment) return null;

  const feedsWithUrl = FEEDS.filter((f) => form[f.key]);
  const syncStatus = getSyncStatus(apartment.id);
  const isSyncing = syncStatus?.status === 'syncing';
  const ownIcalExportUrl = generateIcalExportUrl(apartment.id);
  const apartmentBookingsCount = bookings.filter(
    (b) => String(b.apartmentId) === String(apartment.id)
  ).length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`iCal beállítások - ${apartment.name}`} size="lg">
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add meg a platformok iCal URL-jeit. A foglalások automatikusan szinkronizálódnak.
        </p>

        {/* Saját iCal Export URL */}
        <Card className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Download size={18} className="text-green-600 dark:text-green-400" />
              <h4 className="text-sm font-bold text-green-800 dark:text-green-200">
                Saját iCal Export URL
              </h4>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Ezt az URL-t használd más platformokon (Airbnb, Booking, Google Calendar) a foglalások importálásához.
              {apartmentBookingsCount > 0 ? ` Jelenleg ${apartmentBookingsCount} foglalás elérhető.` : ' Még nincs foglalás.'}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={ownIcalExportUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-green-300 dark:border-green-600 rounded-lg text-sm font-mono text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-green-500"
                onClick={(e) => e.target.select()}
              />
              <Button
                variant="success"
                size="sm"
                onClick={() => handleCopyIcalUrl(ownIcalExportUrl)}
                aria-label="Saját iCal URL másolása"
                title="URL másolása"
              >
                <Copy size={16} />
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownloadIcal}
                disabled={apartmentBookingsCount === 0}
                aria-label="iCal fájl letöltése"
                title="Letöltés .ics fájlként"
              >
                <Download size={16} />
              </Button>
            </div>
            {apartmentBookingsCount === 0 && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Még nincs foglalás ehhez a lakáshoz. Az iCal fájl üres lesz.
              </p>
            )}
          </div>
        </Card>

        {feedsWithUrl.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Aktív feed-ek</h4>
            <div className="grid grid-cols-1 gap-2">
              {feedsWithUrl.map((feed) => {
                const url = form[feed.key];
                const feedSyncing = isSyncing && syncStatus?.feedId === feed.key;
                return (
                  <Card key={feed.key} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar size={16} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{feed.label}</span>
                          {feedSyncing && (
                            <Sync size={14} className="text-blue-500 dark:text-blue-400 animate-spin flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate" title={url}>
                          {url.length > 50 ? `${url.substring(0, 50)}...` : url}
                        </div>
                        {syncStatus?.lastSync && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Utolsó sync: {formatTimeAgo(syncStatus.lastSync)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyIcalUrl(url)}
                          aria-label={`${feed.label} iCal URL másolása`}
                          title="URL másolása"
                        >
                          <Copy size={14} />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleIcalSync(apartment.id, feed.key)}
                          loading={feedSyncing}
                          disabled={isSyncing}
                          aria-label={`${feed.label} iCal szinkronizálás`}
                          title="Szinkronizálás"
                        >
                          <Sync size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {FEEDS.map((feed) => (
            <div key={feed.key}>
              <label
                htmlFor={`ical-modal-${feed.key}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                {feed.label} iCal URL
              </label>
              <div className="flex gap-2">
                <input
                  id={`ical-modal-${feed.key}`}
                  type="url"
                  value={form[feed.key] || ''}
                  onChange={(e) => updateField(feed.key, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://..."
                  aria-label={`${feed.label} iCal URL`}
                />
                {form[feed.key] && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyIcalUrl(form[feed.key])}
                      aria-label={`${feed.label} iCal URL másolása`}
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleIcalSync(apartment.id, feed.key)}
                      loading={isSyncing && syncStatus?.feedId === feed.key}
                      disabled={isSyncing}
                      aria-label={`${feed.label} iCal szinkronizálás`}
                    >
                      <Sync /> Szinkronizálás
                    </Button>
                  </>
                )}
              </div>
              {form[feed.key] && (
                <div className="mt-1 space-y-1">
                  {!validateIcalURL(form[feed.key]) && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                       Érvénytelen iCal URL. Használj HTTPS-t és .ics fájlt vagy ical/calendar URL-t.
                    </p>
                  )}
                  {syncStatus?.lastSync && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Utolsó sync: {formatTimeAgo(syncStatus.lastSync)}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
          <Button
            onClick={handleSyncAllFeeds}
            variant="success"
            className="flex-1"
            aria-label="Összes aktív feed szinkronizálása"
          >
            <Sync /> Összes feed szinkronizálása
          </Button>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} variant="primary" className="flex-1" loading={isSubmitting} disabled={isSubmitting}>
            Mentés
          </Button>
          <Button onClick={onClose} variant="secondary">
            Mégse
          </Button>
        </div>
      </div>
    </Modal>
  );
}

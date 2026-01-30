/**
 * iCal Export Page
 * Automatikusan generálja és letölti az iCal fájlt a lakás foglalásaihoz
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useBookingsStore from '../stores/bookingsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Download, Calendar } from '../components/common/Icons';
import { generateIcalFile, downloadIcalFile } from '../utils/icalGenerator';

const IcalExportPage = () => {
  const { apartmentId } = useParams();
  const navigate = useNavigate();
  const { bookings, fetchFromApi: fetchBookings } = useBookingsStore();
  const { apartments, fetchFromApi: fetchApartments } = useApartmentsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [icalContent, setIcalContent] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchBookings(), fetchApartments()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchBookings, fetchApartments]);

  useEffect(() => {
    if (!isLoading && apartmentId) {
      const apartment = apartments.find((a) => String(a.id) === String(apartmentId));
      const apartmentBookings = bookings.filter(
        (b) => String(b.apartmentId) === String(apartmentId)
      );

      if (apartment && apartmentBookings.length > 0) {
        const content = generateIcalFile(apartmentBookings, apartment);
        setIcalContent(content);
      }
    }
  }, [isLoading, apartmentId, bookings, apartments]);

  const apartment = apartments.find((a) => String(a.id) === String(apartmentId));
  const apartmentBookings = bookings.filter(
    (b) => String(b.apartmentId) === String(apartmentId)
  );

  const handleDownload = () => {
    if (apartment && apartmentBookings.length > 0) {
      downloadIcalFile(apartmentBookings, apartment);
    }
  };

  const handleCopyToClipboard = async () => {
    if (icalContent) {
      try {
        await navigator.clipboard.writeText(icalContent);
        alert('iCal tartalom másolva a vágólapra!');
      } catch (e) {
        alert('Hiba a másolás során.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Betöltés...</p>
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Lakás nem található
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            A megadott lakás nem létezik vagy nem elérhető.
          </p>
          <Button onClick={() => navigate('/')} variant="primary">
            Vissza a kezdőlapra
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar size={32} className="text-blue-600 dark:text-blue-400" />
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              iCal Export
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {apartment.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {apartmentBookings.length > 0
              ? `${apartmentBookings.length} foglalás elérhető exportáláshoz`
              : 'Még nincs foglalás ehhez a lakáshoz'}
          </p>
        </div>

        {apartmentBookings.length > 0 ? (
          <>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Foglalások listája:
              </h3>
              <ul className="space-y-1">
                {apartmentBookings.slice(0, 5).map((booking) => (
                  <li
                    key={booking.id}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
                  >
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    {booking.guestName || 'Vendég'} -{' '}
                    {new Date(booking.dateFrom || booking.checkIn).toLocaleDateString('hu-HU')}
                  </li>
                ))}
                {apartmentBookings.length > 5 && (
                  <li className="text-sm text-gray-500 dark:text-gray-500 italic">
                    ... és még {apartmentBookings.length - 5} foglalás
                  </li>
                )}
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleDownload}
                variant="primary"
                className="w-full py-3"
              >
                <Download size={20} />
                Letöltés (.ics fájl)
              </Button>

              <Button
                onClick={handleCopyToClipboard}
                variant="outline"
                className="w-full py-3"
              >
                Tartalom másolása
              </Button>

              <Button
                onClick={() => navigate('/bookings')}
                variant="secondary"
                className="w-full py-3"
              >
                Foglalások megtekintése
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200 mb-2">
                💡 Hogyan használd?
              </h4>
              <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                <li>Kattints a "Letöltés" gombra az .ics fájl letöltéséhez</li>
                <li>Importáld a fájlt Google Calendar-ba, Airbnb-be vagy Booking.com-ba</li>
                <li>A foglalások automatikusan megjelennek a naptáradban</li>
              </ol>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Jelenleg nincs foglalás ehhez a lakáshoz.
            </p>
            <Button onClick={() => navigate('/bookings')} variant="primary">
              Foglalások hozzáadása
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default IcalExportPage;

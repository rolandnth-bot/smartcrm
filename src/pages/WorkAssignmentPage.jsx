import { useState, useEffect, useCallback, useMemo } from 'react';
import useCleaningsStore from '../stores/cleaningsStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useBookingsStore from '../stores/bookingsStore';
import { workersList, workerFromApi } from '../services/api';
import api from '../services/api';
import useToastStore from '../stores/toastStore';
import { Plus } from '../components/common/Icons';
import Button from '../components/common/Button';

const WorkAssignmentPage = () => {
  const [selectedCleaner, setSelectedCleaner] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [assignments, setAssignments] = useState({});
  const [workers, setWorkers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { apartments } = useApartmentsStore();
  const { bookings } = useBookingsStore();

  useEffect(() => {
    document.title = 'Munka kiosztás - SmartCRM';
    fetchWorkers();
  }, []);

  const fetchWorkers = useCallback(async () => {
    if (!api.isConfigured()) {
      // Mock data
      const mockWorkers = [
        { id: '1', name: 'Yvette' },
        { id: '2', name: 'Márta' },
        { id: '3', name: 'Eszter' },
        { id: '4', name: 'Katalin' }
      ];
      setWorkers(mockWorkers);
      if (mockWorkers.length > 0 && !selectedCleaner) {
        setSelectedCleaner(mockWorkers[0].id);
      }
      return;
    }

    setIsLoading(true);
    try {
      const response = await workersList();
      const workersList = Array.isArray(response) ? response : (response?.workers || []);
      const mapped = workersList.map(workerFromApi);
      setWorkers(mapped);
      if (mapped.length > 0 && !selectedCleaner) {
        setSelectedCleaner(mapped[0].id);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching workers:', error);
      }
      useToastStore.getState().error('Hiba a takarítók betöltésekor.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 7 napos naptár generálás (P, Szo, V, H, K, Sze, Cs sorrendben)
  const getWeekDays = useMemo(() => {
    const today = new Date(selectedYear, selectedMonth, selectedDay);
    const dayOfWeek = today.getDay();
    // Péntektől kezdődik (5 = péntek, 0 = vasárnap)
    // Ha péntek vagy később van, akkor az előző péntektől számolunk
    // Ha hétfő-csütörtök van, akkor az előző péntektől számolunk
    let startOffset = 0;
    if (dayOfWeek === 0) { // Vasárnap
      startOffset = -2; // 2 nappal korábban (péntek)
    } else if (dayOfWeek === 6) { // Szombat
      startOffset = -1; // 1 nappal korábban (péntek)
    } else if (dayOfWeek >= 1 && dayOfWeek <= 4) { // Hétfő-Csütörtök
      startOffset = dayOfWeek - 5; // Péntekig visszaszámolva
    } else { // Péntek (5)
      startOffset = 0;
    }
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + startOffset);

    const days = [];
    const dayNames = ['P', 'Szo', 'V', 'H', 'K', 'Sze', 'Cs'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push({
        name: dayNames[i],
        date: date.getDate(),
        fullDate: date
      });
    }
    
    return days;
  }, [selectedDay, selectedMonth, selectedYear]);

  // Ingatlanok az adott napra (szűrés bookings alapján)
  const propertiesForDay = useMemo(() => {
    const selectedDate = new Date(selectedYear, selectedMonth, selectedDay);
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Szűrjük a bookings-okat, amelyek tartalmazzák ezt a napot
    const relevantBookings = bookings.filter(booking => {
      if (!booking.dateFrom || !booking.dateTo) return false;
      const from = new Date(booking.dateFrom);
      const to = new Date(booking.dateTo);
      return selectedDate >= from && selectedDate <= to;
    });

    // Ingatlanok listája a releváns bookings alapján
    const propertyIds = [...new Set(relevantBookings.map(b => b.apartmentId))];
    return propertyIds.map(id => {
      const apt = apartments.find(a => a.id === id);
      return apt ? {
        id: apt.id,
        name: apt.name || apt.address || 'Névtelen ingatlan',
        date: selectedDay
      } : null;
    }).filter(Boolean);
  }, [selectedDay, selectedMonth, selectedYear, bookings, apartments]);

  // Távozási/érkezési idő opciók (óránként)
  const timeOptions = useMemo(() => {
    const times = [];
    for (let hour = 8; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return times;
  }, []);

  // Textil érkezési idő opciók (30 percenként, 1 órás intervallumok)
  const textileTimeOptions = useMemo(() => {
    const intervals = [];
    for (let hour = 8; hour < 18; hour++) {
      intervals.push(`${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`);
      intervals.push(`${hour.toString().padStart(2, '0')}:30-${(hour + 1).toString().padStart(2, '0')}:30`);
    }
    return intervals;
  }, []);

  // Textil darabszám opciók
  const textileCountOptions = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const toggleCleaning = (propertyId) => {
    setAssignments(prev => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        propertyId,
        cleanerId: selectedCleaner,
        cleaning: !prev[propertyId]?.cleaning,
        textile: prev[propertyId]?.textile || false,
        departureTime: prev[propertyId]?.departureTime || '10:00',
        arrivalTime: prev[propertyId]?.arrivalTime || '15:00',
        textileCount: prev[propertyId]?.textileCount || 0,
        textileArrivalTime: prev[propertyId]?.textileArrivalTime || '14:00-15:00',
        laundryDelivers: prev[propertyId]?.laundryDelivers || false
      }
    }));
  };

  const toggleTextile = (propertyId) => {
    setAssignments(prev => ({
      ...prev,
      [propertyId]: {
        ...prev[propertyId],
        propertyId,
        cleanerId: selectedCleaner,
        cleaning: prev[propertyId]?.cleaning || false,
        textile: !prev[propertyId]?.textile,
        departureTime: prev[propertyId]?.departureTime || '10:00',
        arrivalTime: prev[propertyId]?.arrivalTime || '15:00',
        textileCount: prev[propertyId]?.textileCount || 0,
        textileArrivalTime: prev[propertyId]?.textileArrivalTime || '14:00-15:00',
        laundryDelivers: prev[propertyId]?.laundryDelivers || false
      }
    }));
  };

  const handleSave = async () => {
    try {
      // TODO: API hívás a munkakiosztások mentéséhez
      // await saveWorkAssignments(assignments);
      
      useToastStore.getState().success('Munka kiosztások sikeresen mentve');
    } catch (error) {
      useToastStore.getState().error(error?.message || 'Hiba a mentés során.');
    }
  };

  const handleCancel = () => {
    setAssignments({});
    useToastStore.getState().info('Változtatások elvetve');
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">Munka kiosztás</h1>
        <button 
          className="w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-light transition-colors"
          onClick={() => {
            // TODO: Új munkakiosztás hozzáadása
            useToastStore.getState().info('Új munkakiosztás hozzáadása');
          }}
        >
          +
        </button>
      </div>

      {/* Takarító választó dropdown */}
      <div className="mb-6">
        <select
          value={selectedCleaner}
          onChange={(e) => setSelectedCleaner(e.target.value)}
          className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {workers.map(worker => (
            <option key={worker.id} value={worker.id}>{worker.name}</option>
          ))}
        </select>
      </div>

      {/* Nap választó - 7 napos nézet */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {getWeekDays.map(day => (
          <button
            key={`${day.fullDate.getTime()}`}
            onClick={() => {
              setSelectedDay(day.fullDate.getDate());
              setSelectedMonth(day.fullDate.getMonth());
              setSelectedYear(day.fullDate.getFullYear());
            }}
            className={`py-3 px-2 rounded-lg text-center transition-colors ${
              selectedDay === day.fullDate.getDate() && selectedMonth === day.fullDate.getMonth() && selectedYear === day.fullDate.getFullYear()
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="font-medium">{day.name}</div>
            <div className={selectedDay === day.fullDate.getDate() && selectedMonth === day.fullDate.getMonth() && selectedYear === day.fullDate.getFullYear() ? 'text-white' : 'text-gray-500'}>
              {day.date}
            </div>
          </button>
        ))}
      </div>

      {/* Ingatlan kártyák */}
      <div className="space-y-4 mb-6">
        {propertiesForDay.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nincsenek ingatlanok erre a napra.
          </div>
        ) : (
          propertiesForDay.map(property => {
            const assignment = assignments[property.id] || {};
            
            return (
              <div 
                key={property.id} 
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                {/* Ingatlan header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-900">{property.name}</h3>
                  <span className="text-gray-400 text-sm">{property.date}</span>
                </div>

                {/* Takarítás és Textil gombok */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => toggleCleaning(property.id)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      assignment.cleaning
                        ? 'bg-blue-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-red-500">* </span>Takarítás
                  </button>
                  <button
                    onClick={() => toggleTextile(property.id)}
                    className={`py-3 px-4 rounded-lg font-medium transition-colors ${
                      assignment.textile
                        ? 'bg-purple-500 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-red-500">* </span>Textil
                  </button>
                </div>

                {/* Vendég érkezés - távozás */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    <span className="text-red-500">* </span>
                    <span className="text-blue-600">Vendég érkezés - távozás</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        <span className="text-red-500">* </span>Távozás:
                      </label>
                      <select
                        value={assignment.departureTime || '10:00'}
                        onChange={(e) => setAssignments(prev => ({
                          ...prev,
                          [property.id]: { 
                            ...prev[property.id], 
                            propertyId: property.id,
                            cleanerId: selectedCleaner,
                            departureTime: e.target.value 
                          }
                        }))}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        <span className="text-red-500">* </span>Érkezés:
                      </label>
                      <select
                        value={assignment.arrivalTime || '15:00'}
                        onChange={(e) => setAssignments(prev => ({
                          ...prev,
                          [property.id]: { 
                            ...prev[property.id], 
                            propertyId: property.id,
                            cleanerId: selectedCleaner,
                            arrivalTime: e.target.value 
                          }
                        }))}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {timeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Textil érkezés */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    <span className="text-red-500">* </span>
                    <span className="text-red-500">Textil érkezés</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Darabszám:</label>
                      <select
                        value={assignment.textileCount || 0}
                        onChange={(e) => setAssignments(prev => ({
                          ...prev,
                          [property.id]: { 
                            ...prev[property.id], 
                            propertyId: property.id,
                            cleanerId: selectedCleaner,
                            textileCount: parseInt(e.target.value) 
                          }
                        }))}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {textileCountOptions.map(count => (
                          <option key={count} value={count}>{count} db</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Érkezési idő:</label>
                      <select
                        value={assignment.textileArrivalTime || '14:00-15:00'}
                        onChange={(e) => setAssignments(prev => ({
                          ...prev,
                          [property.id]: { 
                            ...prev[property.id], 
                            propertyId: property.id,
                            cleanerId: selectedCleaner,
                            textileArrivalTime: e.target.value 
                          }
                        }))}
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {textileTimeOptions.map(time => (
                          <option key={time} value={time}>{time}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Mosoda szállít toggle */}
                <button
                  onClick={() => setAssignments(prev => ({
                    ...prev,
                    [property.id]: { 
                      ...prev[property.id], 
                      propertyId: property.id,
                      cleanerId: selectedCleaner,
                      laundryDelivers: !prev[property.id]?.laundryDelivers 
                    }
                  }))}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    assignment.laundryDelivers
                      ? 'bg-gray-300 text-gray-700'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  <span className="text-red-500">* </span>Mosoda szállít
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Mentés / Mégse gombok */}
      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={handleSave}
          className="py-4 px-6 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Mentés
        </button>
        <button 
          onClick={handleCancel}
          className="py-4 px-6 bg-gray-400 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          Mégse
        </button>
      </div>
    </div>
  );
};

export default WorkAssignmentPage;

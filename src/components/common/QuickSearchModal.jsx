import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { memo } from 'react';
import Modal from './Modal';
import { Search } from './Icons';
import useLeadsStore from '../../stores/leadsStore';
import useBookingsStore from '../../stores/bookingsStore';
import useApartmentsStore from '../../stores/apartmentsStore';
import { contains } from '../../utils/stringUtils';

const QuickSearchModal = memo(({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceTimeoutRef = useRef(null);

  const { leads } = useLeadsStore();
  const { bookings } = useBookingsStore();
  const { apartments } = useApartmentsStore();

  // Debounce a keresési lekérdezéshez
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms késleltetés

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];

    const allResults = [];

    // Leadek keresése
    const filteredLeads = leads.filter((lead) =>
      contains(lead.name || '', debouncedQuery) ||
      contains(lead.email || '', debouncedQuery) ||
      contains(lead.phone?.toString() || '', debouncedQuery)
    );
    filteredLeads.forEach((lead) => {
      allResults.push({
        type: 'lead',
        id: lead.id,
        title: lead.name,
        subtitle: lead.email || lead.phone || '',
        route: '/leads',
        icon: '📊'
      });
    });

    // Foglalások keresése
    const filteredBookings = bookings.filter((booking) =>
      contains(booking.guestName || '', debouncedQuery) ||
      contains(booking.apartmentName || '', debouncedQuery)
    );
    filteredBookings.forEach((booking) => {
      allResults.push({
        type: 'booking',
        id: booking.id,
        title: booking.guestName || 'Vendég',
        subtitle: booking.apartmentName || '',
        route: '/bookings',
        icon: '📅'
      });
    });

    // Lakások keresése
    const filteredApartments = apartments.filter((apartment) =>
      contains(apartment.name || '', debouncedQuery) ||
      contains(apartment.address || '', debouncedQuery) ||
      contains(apartment.city || '', debouncedQuery)
    );
    filteredApartments.forEach((apartment) => {
      allResults.push({
        type: 'apartment',
        id: apartment.id,
        title: apartment.name,
        subtitle: apartment.address || apartment.city || '',
        route: '/apartments',
        icon: '🏠'
      });
    });

    return allResults.slice(0, 10); // Maximum 10 eredmény
  }, [debouncedQuery, leads, bookings, apartments]);

  const handleSelect = useCallback((result) => {
    navigate(result.route);
    onClose();
    setQuery('');
    setSelectedIndex(0);
  }, [navigate, onClose]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [results, selectedIndex, handleSelect, onClose]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, handleKeyDown]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gyors keresés"
      size="md"
      showCloseButton={true}
    >
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés leadek, foglalások, lakások között..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
            aria-label="Gyors keresés"
          />
        </div>

        {debouncedQuery.trim() && (
          <div className="max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              <div className="space-y-1" role="listbox" aria-label="Keresési eredmények">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleSelect(result)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900 border-2 border-blue-500 dark:border-blue-600'
                        : 'bg-gray-50 dark:bg-gray-800 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden="true">{result.icon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800 dark:text-gray-200">{result.title}</div>
                        {result.subtitle && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">{result.subtitle}</div>
                        )}
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {result.type === 'lead' && 'Lead'}
                          {result.type === 'booking' && 'Foglalás'}
                          {result.type === 'apartment' && 'Lakás'}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
                <p>Nincs találat a keresésre: "{debouncedQuery}"</p>
              </div>
            )}
          </div>
        )}

        {!debouncedQuery.trim() && query.trim() && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status" aria-live="polite">
            <p>Keresés...</p>
          </div>
        )}

        {!query.trim() && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400" role="status">
            <p className="mb-2">Kezdjen el gépelni a kereséshez...</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Leadek, foglalások és lakások között keres
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
});

QuickSearchModal.displayName = 'QuickSearchModal';

export default QuickSearchModal;


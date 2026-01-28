import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useLeadsStore, { leadStatuses } from '../stores/leadsStore';
import useSalesStore from '../stores/salesStore';
import useApartmentsStore from '../stores/apartmentsStore';
import useBookingsStore from '../stores/bookingsStore';
import { usePermissions } from '../contexts/PermissionContext';
import { statsOverview, cleaningsSummary } from '../services/api';
import api from '../services/api';
import Card from '../components/common/Card';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { SkeletonStatsCard } from '../components/common/Skeleton';
import Tooltip from '../components/common/Tooltip';
import { Plus } from '../components/common/Icons';
import { formatDate, formatTimeAgo, getFirstDayOfMonth, getLastDayOfMonth, addMonths } from '../utils/dateUtils';
import { formatCurrencyHUF, formatCurrencyEUR, formatPercent, formatNumber } from '../utils/numberUtils';
import { sortBy, filterBy } from '../utils/arrayUtils';

const DashboardPage = () => {
  const { leads, getLeadsByStatus } = useLeadsStore();
  const { getTotalStats } = useSalesStore();
  const { apartments, getStats: getApartmentsStats } = useApartmentsStore();
  const { bookings, getStats: getBookingsStats, getTodayBookings } = useBookingsStore();
  const { canView } = usePermissions();

  const [financialStats, setFinancialStats] = useState(null);
  const [isLoadingFinancial, setIsLoadingFinancial] = useState(false);
  const [cleaningSummary, setCleaningSummary] = useState(null);
  const [isLoadingCleaning, setIsLoadingCleaning] = useState(false);
  const [selectedDayBookings, setSelectedDayBookings] = useState(null);
  const [selectedDayDate, setSelectedDayDate] = useState(null);
  const [selectedApartmentId, setSelectedApartmentId] = useState('');
  const [revenuePlanPeriod, setRevenuePlanPeriod] = useState('year'); // 'year', 'month', 'week', 'day' - alapértelmezett: Éves
  const navigate = useNavigate();

  const leadStatusLabels = useMemo(() => 
    Object.fromEntries(leadStatuses.map((s) => [s.key, s.label])),
    []
  );

  const salesStats = useMemo(() => getTotalStats(), [getTotalStats]);
  const apartmentsStats = useMemo(() => getApartmentsStats(), [getApartmentsStats, apartments]);
  const bookingsStats = useMemo(() => getBookingsStats(), [getBookingsStats]);
  const todayBookings = useMemo(() => getTodayBookings(), [getTodayBookings]);
  const recentLeads = useMemo(() => 
    sortBy(leads, (lead) => lead.createdAt || '', 'desc').slice(0, 5),
    [leads]
  );
  const recentBookings = useMemo(() => 
    sortBy(bookings, (booking) => {
      const date = booking.dateFrom || booking.checkIn || booking.createdAt || '';
      return date ? new Date(date).getTime() : 0;
    }, 'desc').slice(0, 5),
    [bookings]
  );

  // Page title beállítása
  useEffect(() => {
    document.title = 'Dashboard - SmartCRM';
  }, []);

  // Backend API pénzügyi statisztikák betöltése
  useEffect(() => {
    if (api.isConfigured()) {
      setIsLoadingFinancial(true);
      statsOverview({ period: 'month' })
        .then((data) => {
          setFinancialStats(data);
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.error('Hiba a pénzügyi statisztikák betöltésekor:', error);
          }
        })
        .finally(() => {
          setIsLoadingFinancial(false);
        });
    }
  }, []);

  // Takarítási díjak összesítő betöltése
  useEffect(() => {
    if (api.isConfigured()) {
      setIsLoadingCleaning(true);
      const now = new Date();
      cleaningsSummary({
        year: now.getFullYear(),
        month: now.getMonth() + 1
      })
        .then((data) => {
          setCleaningSummary(data?.summary || data);
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.error('Hiba a takarítási díjak betöltésekor:', error);
          }
        })
        .finally(() => {
          setIsLoadingCleaning(false);
        });
    }
  }, []);

  const getApartmentName = useCallback((apartmentId) => {
    const apt = apartments.find((a) => a.id === apartmentId || a.id === parseInt(apartmentId));
    return apt?.name || `Lakás #${apartmentId}`;
  }, [apartments]);

  const handleDayClick = useCallback((day, dayBookings, currentYear, currentMonth) => {
    if (dayBookings && dayBookings.length > 0) {
      setSelectedDayBookings(dayBookings);
      const date = new Date(currentYear, currentMonth, day);
      setSelectedDayDate(date);
    }
  }, []);

  const handleCloseDayModal = useCallback(() => {
    setSelectedDayBookings(null);
    setSelectedDayDate(null);
  }, []);

  const platformColors = useMemo(() => ({
    airbnb: 'bg-pink-500',
    booking: 'bg-blue-500',
    szallas: 'bg-red-500',
    direct: 'bg-green-500',
    other: 'bg-gray-500'
  }), []);

  const platformLabels = useMemo(() => ({
    airbnb: 'Airbnb',
    booking: 'Booking.com',
    szallas: 'Szallas.hu',
    direct: 'Direkt',
    other: 'Egyéb'
  }), []);

  // Lead statisztikák
  const leadStats = useMemo(() => {
    const now = new Date();
    const thisMonth = getFirstDayOfMonth(now);
    const lastMonth = getFirstDayOfMonth(addMonths(now, -1));
    const thisMonthEnd = getLastDayOfMonth(now);
    const lastMonthEnd = getLastDayOfMonth(addMonths(now, -1));

                const thisMonthLeads = leads.filter((lead) => {
                  const createdAt = new Date(lead.createdAt || 0);
                  return createdAt >= thisMonth && createdAt <= thisMonthEnd;
                });

                const lastMonthLeads = leads.filter((lead) => {
                  const createdAt = new Date(lead.createdAt || 0);
                  return createdAt >= lastMonth && createdAt <= lastMonthEnd;
                });

                const thisMonthWon = filterBy(thisMonthLeads, { status: 'won' }).length;
                const lastMonthWon = filterBy(lastMonthLeads, { status: 'won' }).length;

    return {
      total: leads.length,
      new: getLeadsByStatus('new').length,
      won: getLeadsByStatus('won').length,
      conversionRate: leads.length > 0 ? parseFloat(((getLeadsByStatus('won').length / leads.length) * 100).toFixed(1)) : 0,
      thisMonth: thisMonthLeads.length,
      lastMonth: lastMonthLeads.length,
      thisMonthWon,
      lastMonthWon,
      monthGrowth: lastMonthLeads.length > 0 
        ? parseFloat((((thisMonthLeads.length - lastMonthLeads.length) / lastMonthLeads.length) * 100).toFixed(1))
        : thisMonthLeads.length > 0 ? 100.0 : 0.0,
      conversionGrowth: lastMonthWon > 0
        ? parseFloat((((thisMonthWon - lastMonthWon) / lastMonthWon) * 100).toFixed(1))
        : thisMonthWon > 0 ? 100.0 : 0.0
    };
  }, [leads, getLeadsByStatus]);

  // Pipeline statisztikák (memoizálva, hogy ne számoljuk újra minden render során)
  const pipelineStats = useMemo(() => ({
    new: getLeadsByStatus('new').length,
    contacted: getLeadsByStatus('contacted').length,
    offer: getLeadsByStatus('offer').length || getLeadsByStatus('proposal').length,
    negotiation: getLeadsByStatus('negotiation').length,
    won: getLeadsByStatus('won').length
  }), [leads, getLeadsByStatus]);

  // Bevételi terv/tény számítások (éves/havi/heti/napi)
  const revenuePlanFact = useMemo(() => {
    const now = new Date();
    let dateFrom, dateTo;
    
    switch (revenuePlanPeriod) {
      case 'year':
        dateFrom = new Date(now.getFullYear(), 0, 1);
        dateTo = new Date(now.getFullYear(), 11, 31);
        break;
      case 'month':
        dateFrom = getFirstDayOfMonth(now);
        dateTo = getLastDayOfMonth(now);
        break;
      case 'week':
        const monday = new Date(now);
        monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        monday.setHours(0, 0, 0, 0);
        dateFrom = monday;
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        dateTo = sunday;
        break;
      case 'day':
        dateFrom = new Date(now);
        dateFrom.setHours(0, 0, 0, 0);
        dateTo = new Date(now);
        dateTo.setHours(23, 59, 59, 999);
        break;
      default:
        dateFrom = getFirstDayOfMonth(now);
        dateTo = getLastDayOfMonth(now);
    }

    // Terv (sales targets alapján)
    const planRevenue = revenuePlanPeriod === 'year' 
      ? salesStats.totalPlanRevenue 
      : revenuePlanPeriod === 'month'
      ? salesStats.totalPlanRevenue / 12
      : revenuePlanPeriod === 'week'
      ? salesStats.totalPlanRevenue / 52
      : salesStats.totalPlanRevenue / 365;

    // Tény (bookings alapján)
    const factRevenue = bookings
      .filter(b => {
        const checkoutDate = b.dateTo || b.checkOut;
        if (!checkoutDate) return false;
        const d = new Date(checkoutDate);
        return d >= dateFrom && d <= dateTo && (b.status === 'confirmed' || b.status === 'checked_out');
      })
      .reduce((sum, b) => sum + (b.netRevenue || b.totalAmount || 0), 0);

    // Költség terv (becsült, bevétel %-a vagy fix összeg)
    const costPlan = planRevenue * 0.3; // 30% költség arány (módosítható)

    // Költség tény (financialStats alapján, ha elérhető)
    let costFact = 0;
    if (financialStats) {
      costFact = (financialStats.cleaning_costs || 0) +
                 (financialStats.textile_costs || 0) +
                 (financialStats.laundry_costs || 0) +
                 (financialStats.expenses || 0);
      
      // Időszak szerinti szűrés, ha szükséges
      // Jelenleg az összes költség, de később dátum alapú szűréssel bővíthető
    }

    const hasData = factRevenue > 0 || planRevenue > 0 || costFact > 0 || costPlan > 0;
    const completionRate = planRevenue > 0 ? (factRevenue / planRevenue) * 100 : 0;

    return {
      plan: planRevenue,
      fact: factRevenue,
      costPlan,
      costFact,
      hasData,
      completionRate,
      period: revenuePlanPeriod
    };
  }, [revenuePlanPeriod, salesStats, bookings, financialStats]);

  // Éves/Havi/Napi sikeres lead statisztikák
  const successfulLeadStats = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = getFirstDayOfMonth(now);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    // Won leadek
    const wonLeads = leads.filter(l => l.status === 'won' || l.status === 'alairva');
    
    // Éves
    const yearlyWon = wonLeads.filter(l => {
      const d = new Date(l.createdAt || l.updatedAt || 0);
      return d >= yearStart;
    });
    const yearlyRevenue = yearlyWon.reduce((sum, l) => sum + (l.estimatedValue || l.revenue || 0), 0);
    const yearlyNew = yearlyWon.filter(l => {
      const createdAt = new Date(l.createdAt || 0);
      return createdAt >= yearStart;
    }).length;
    const yearlyRecurring = yearlyWon.length - yearlyNew;

    // Havi
    const monthlyWon = wonLeads.filter(l => {
      const d = new Date(l.createdAt || l.updatedAt || 0);
      return d >= monthStart;
    });
    const monthlyRevenue = monthlyWon.reduce((sum, l) => sum + (l.estimatedValue || l.revenue || 0), 0);
    const monthlyNew = monthlyWon.filter(l => {
      const createdAt = new Date(l.createdAt || 0);
      return createdAt >= monthStart;
    }).length;
    const monthlyRecurring = monthlyWon.length - monthlyNew;

    // Napi
    const dailyWon = wonLeads.filter(l => {
      const d = new Date(l.createdAt || l.updatedAt || 0);
      return d >= todayStart && d <= todayEnd;
    });
    const dailyRevenue = dailyWon.reduce((sum, l) => sum + (l.estimatedValue || l.revenue || 0), 0);
    const dailyNew = dailyWon.filter(l => {
      const createdAt = new Date(l.createdAt || 0);
      return createdAt >= todayStart && createdAt <= todayEnd;
    }).length;
    const dailyRecurring = dailyWon.length - dailyNew;

    return {
      yearly: {
        totalRevenue: yearlyRevenue,
        recurringRevenue: yearlyRecurring * (yearlyRevenue / yearlyWon.length || 0),
        newRevenue: yearlyNew * (yearlyRevenue / yearlyWon.length || 0),
        newCount: yearlyNew,
        successfulCount: yearlyWon.length
      },
      monthly: {
        totalRevenue: monthlyRevenue,
        recurringRevenue: monthlyRecurring * (monthlyRevenue / monthlyWon.length || 0),
        newRevenue: monthlyNew * (monthlyRevenue / monthlyWon.length || 0),
        newCount: monthlyNew,
        successfulCount: monthlyWon.length
      },
      daily: {
        totalRevenue: dailyRevenue,
        recurringRevenue: dailyRecurring * (dailyRevenue / dailyWon.length || 0),
        newRevenue: dailyNew * (dailyRevenue / dailyWon.length || 0),
        newCount: dailyNew,
        successfulCount: dailyWon.length
      }
    };
  }, [leads]);

  // Lead éves áttekintő
  const leadYearlyOverview = useMemo(() => {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const yearLeads = leads.filter(l => {
      const d = new Date(l.createdAt || 0);
      return d >= yearStart;
    });
    return {
      total: yearLeads.length,
      successful: yearLeads.filter(l => l.status === 'won' || l.status === 'alairva').length,
      unsuccessful: yearLeads.filter(l => l.status === 'lost' || l.status === 'elutasitva').length,
      open: yearLeads.filter(l => l.status !== 'won' && l.status !== 'alairva' && l.status !== 'lost' && l.status !== 'elutasitva').length
    };
  }, [leads]);

  // Tényleges bevételek (éves/havi/napi)
  const actualRevenues = useMemo(() => {
    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = getFirstDayOfMonth(now);
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    const calculateRevenue = (dateFrom, dateTo) => {
      return bookings
        .filter(b => {
          const checkoutDate = b.dateTo || b.checkOut;
          if (!checkoutDate) return false;
          const d = new Date(checkoutDate);
          return d >= dateFrom && d <= dateTo && (b.status === 'confirmed' || b.status === 'checked_out');
        })
        .reduce((sum, b) => sum + (b.netRevenue || b.totalAmount || 0), 0);
    };

    return {
      yearly: calculateRevenue(yearStart, now),
      monthly: calculateRevenue(monthStart, now),
      daily: calculateRevenue(todayStart, todayEnd)
    };
  }, [bookings]);

  // Várható bevételek
  const expectedRevenues = useMemo(() => {
    const invoiced = bookings
      .filter(b => b.status === 'confirmed' || b.status === 'checked_in')
      .reduce((sum, b) => sum + (b.netRevenue || b.totalAmount || 0), 0);
    
    const expected = bookings
      .filter(b => b.status === 'pending' || b.status === 'new')
      .reduce((sum, b) => sum + (b.netRevenue || b.totalAmount || 0), 0);

    // Siker/nap számítás (átlagos napi bevétel)
    const now = new Date();
    const monthStart = getFirstDayOfMonth(now);
    const daysInMonth = Math.ceil((now - monthStart) / (1000 * 60 * 60 * 24)) || 1;
    const monthlyRevenue = actualRevenues.monthly;
    const successPerDay = daysInMonth > 0 ? monthlyRevenue / daysInMonth : 0;

    return {
      invoiced,
      expected,
      successPerDay
    };
  }, [bookings, actualRevenues]);

  // Mini naptár widget adatok
  const calendarWidgetData = useMemo(() => {
    if (!bookings || !Array.isArray(bookings)) {
      return null;
    }

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Hétfővel kezdődik

    // Foglalások a hónapban (lakás szűréssel)
    const monthBookings = bookings.filter((booking) => {
      if (!booking) return false;
      
      // Lakás szűrés
      if (selectedApartmentId && booking.apartmentId !== selectedApartmentId) {
        return false;
      }
      
      const checkInDate = booking.dateFrom || booking.checkIn;
      const checkOutDate = booking.dateTo || booking.checkOut;
      if (!checkInDate || !checkOutDate) return false;
      
      try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return false;
        
        return (
          (checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear) ||
          (checkOut.getMonth() === currentMonth && checkOut.getFullYear() === currentYear) ||
          (checkIn <= new Date(currentYear, currentMonth, 1) && checkOut >= new Date(currentYear, currentMonth + 1, 0))
        );
      } catch (e) {
        return false;
      }
    });

    // Napokhoz foglalások
    const bookingsByDay = {};
    monthBookings.forEach((booking) => {
      if (!booking) return;
      const checkInDate = booking.dateFrom || booking.checkIn;
      const checkOutDate = booking.dateTo || booking.checkOut;
      if (!checkInDate || !checkOutDate) return;
      
      try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return;
        
        const start = Math.max(1, checkIn.getDate());
        const end = Math.min(daysInMonth, checkOut.getDate());
        for (let day = start; day <= end; day++) {
          if (!bookingsByDay[day]) {
            bookingsByDay[day] = [];
          }
          bookingsByDay[day].push(booking);
        }
      } catch (e) {
        // Hibás dátum esetén kihagyjuk
      }
    });

    // Check-in/check-out napok azonosítása
    const checkInDays = new Set();
    const checkOutDays = new Set();
    
    monthBookings.forEach((booking) => {
      if (!booking) return;
      const checkInDate = booking.dateFrom || booking.checkIn;
      const checkOutDate = booking.dateTo || booking.checkOut;
      if (!checkInDate || !checkOutDate) return;
      
      try {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return;
        
        // Ha a check-in a hónapban van
        if (checkIn.getMonth() === currentMonth && checkIn.getFullYear() === currentYear) {
          checkInDays.add(checkIn.getDate());
        }
        
        // Ha a check-out a hónapban van
        if (checkOut.getMonth() === currentMonth && checkOut.getFullYear() === currentYear) {
          checkOutDays.add(checkOut.getDate());
        }
      } catch (e) {
        // Hibás dátum esetén kihagyjuk
      }
    });

    return {
      daysInMonth,
      startingDay,
      bookingsByDay,
      checkInDays,
      checkOutDays,
      currentMonth,
      currentYear
    };
  }, [bookings, selectedApartmentId]);

  return (
    <div className="space-y-4">
      {/* Gyors műveletek - legfelül, kártya nélkül */}
      {canView('leads') && (
        <section aria-label="Gyors műveletek" className="flex flex-wrap gap-3 pb-4 border-b dark:border-gray-700">
          <Button
            onClick={() => navigate('/leads')}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
            aria-label="Új lead hozzáadása"
          >
            <Plus /> Új lead
          </Button>
        </section>
      )}

      {/* Gyors navigáció */}
      <nav aria-label="Gyors navigáció" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {/* 1. Leadek */}
        {canView('leads') && (
          <Link
            to="/leads"
            className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white text-left hover:from-indigo-600 hover:to-purple-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Leadek kezelése oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📊</span>
              <div>
                <h3 className="font-bold">Leadek</h3>
                <p className="text-xs opacity-80">Lead kezelés, értékesítés</p>
              </div>
            </div>
          </Link>
        )}
        {/* 2. Marketing */}
        {canView('marketing') && (
          <Link
            to="/marketing"
            className="bg-gradient-to-r from-pink-500 to-rose-600 p-4 rounded-xl text-white text-left hover:from-pink-600 hover:to-rose-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Marketing oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📢</span>
              <div>
                <h3 className="font-bold">Marketing</h3>
                <p className="text-xs opacity-80">Kampányok, csatornák</p>
              </div>
            </div>
          </Link>
        )}
        {/* 3. Értékesítés */}
        {canView('sales') && (
          <Link
            to="/sales"
            className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white text-left hover:from-orange-600 hover:to-orange-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás az Értékesítés oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">💰</span>
              <div>
                <h3 className="font-bold">Értékesítés</h3>
                <p className="text-xs opacity-80">Sales pipeline, célok</p>
              </div>
            </div>
          </Link>
        )}
        {/* 4. Partnerek */}
        <Link
          to="/register"
          className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white text-left hover:from-blue-600 hover:to-blue-700 transition shadow-lg tile-click-animation"
          aria-label="Ugrás a Partnerek oldalra"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">🤝</span>
            <div>
              <h3 className="font-bold">Partnerek</h3>
              <p className="text-xs opacity-80">Partner regisztráció, kezelés</p>
            </div>
          </div>
        </Link>
        {/* 5. Lakások */}
        {canView('apartments') && (
          <Link
            to="/apartments"
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-4 rounded-xl text-white text-left hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Lakások kezelése oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🏠</span>
              <div>
                <h3 className="font-bold">Lakások</h3>
                <p className="text-xs opacity-80">Lakás kezelés, információk</p>
              </div>
            </div>
          </Link>
        )}
        {/* 6. Foglalások */}
        {canView('bookings') && (
          <Link
            to="/bookings"
            className="bg-gradient-to-r from-cyan-500 to-cyan-600 p-4 rounded-xl text-white text-left hover:from-cyan-600 hover:to-cyan-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Foglalások kezelése oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📅</span>
              <div>
                <h3 className="font-bold">Foglalások</h3>
                <p className="text-xs opacity-80">Foglalás kezelés, naptár</p>
              </div>
            </div>
          </Link>
        )}
        {/* 7. Takarítás */}
        {canView('cleaning') && (
          <Link
            to="/cleaning"
            className="bg-gradient-to-r from-teal-500 to-teal-600 p-4 rounded-xl text-white text-left hover:from-teal-600 hover:to-teal-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Takarítás kezelése oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🧹</span>
              <div>
                <h3 className="font-bold">Takarítás</h3>
                <p className="text-xs opacity-80">Takarítás kezelés, státuszok</p>
              </div>
            </div>
          </Link>
        )}
        {/* 8. Karbantartás */}
        {canView('maintenance') && (
          <Link
            to="/maintenance"
            className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 rounded-xl text-white text-left hover:from-amber-600 hover:to-amber-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Karbantartás oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">🔧</span>
              <div>
                <h3 className="font-bold">Karbantartás</h3>
                <p className="text-xs opacity-80">Karbantartás bejelentések</p>
              </div>
            </div>
          </Link>
        )}
        {/* 9. Pénzügy */}
        {canView('finance') && (
          <Link
            to="/finance"
            className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white text-left hover:from-purple-600 hover:to-purple-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Pénzügy oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">💵</span>
              <div>
                <h3 className="font-bold">Pénzügy</h3>
                <p className="text-xs opacity-80">Bevételek, elszámolások</p>
              </div>
            </div>
          </Link>
        )}
        {/* 10. Dokumentumok */}
        <Link
          to="/documents"
          className="bg-gradient-to-r from-slate-500 to-slate-600 p-4 rounded-xl text-white text-left hover:from-slate-600 hover:to-slate-700 transition shadow-lg tile-click-animation"
          aria-label="Ugrás a Dokumentumok oldalra"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📄</span>
            <div>
              <h3 className="font-bold">Dokumentumok</h3>
              <p className="text-xs opacity-80">Fájlok, szerződések, archívum</p>
            </div>
          </div>
        </Link>
        {/* 11. Email */}
        {canView('email') && (
          <Link
            to="/email"
            className="bg-gradient-to-r from-violet-500 to-violet-600 dark:from-violet-600 dark:to-violet-700 p-4 rounded-xl text-white text-left hover:from-violet-600 hover:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600 transition shadow-lg tile-click-animation"
            aria-label="Ugrás az Email / Levelező oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">📧</span>
              <div>
                <h3 className="font-bold">Email</h3>
                <p className="text-xs opacity-80">Levelezés, SMTP, sablonok</p>
              </div>
            </div>
          </Link>
        )}
        {/* 12. Apps */}
        <Link
          to="/apps"
          className="bg-gradient-to-r from-sky-500 to-sky-600 dark:from-sky-600 dark:to-sky-700 p-4 rounded-xl text-white text-left hover:from-sky-600 hover:to-sky-700 dark:hover:from-sky-500 dark:hover:to-sky-600 transition shadow-lg tile-click-animation"
          aria-label="Ugrás az Apps oldalra"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" aria-hidden="true">📱</span>
            <div>
              <h3 className="font-bold">Apps</h3>
              <p className="text-xs opacity-80">Alkalmazások, eszközök</p>
            </div>
          </div>
        </Link>
        {/* 13. AI */}
        <Link
          to="/ai-assistant"
          className="bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-300 dark:to-pink-400 p-4 rounded-xl text-gray-800 dark:text-gray-900 text-left hover:from-pink-300 hover:to-pink-400 dark:hover:from-pink-400 dark:hover:to-pink-500 transition shadow-lg tile-click-animation"
          aria-label="Ugrás az AI oldalra"
        >
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-bold">AI</h3>
              <p className="text-xs opacity-80">Agentek, Tudástár</p>
            </div>
          </div>
        </Link>
        {/* 14. Beállítások */}
        {canView('settings') && (
          <Link
            to="/settings"
            className="bg-gradient-to-r from-gray-500 to-gray-600 p-4 rounded-xl text-white text-left hover:from-gray-600 hover:to-gray-700 transition shadow-lg tile-click-animation"
            aria-label="Ugrás a Beállítások oldalra"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl" aria-hidden="true">⚙️</span>
              <div>
                <h3 className="font-bold">Beállítások</h3>
                <p className="text-xs opacity-80">Felhasználók, jogosultságok</p>
              </div>
            </div>
          </Link>
        )}
      </nav>


      {/* Pénzügyi terv */}
      <Card>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">Pénzügyi terv</h3>
            <div className="flex gap-2">
              <Button
                variant={revenuePlanPeriod === 'year' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRevenuePlanPeriod('year')}
              >
                Éves
              </Button>
              <Button
                variant={revenuePlanPeriod === 'month' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRevenuePlanPeriod('month')}
              >
                Havi
              </Button>
              <Button
                variant={revenuePlanPeriod === 'week' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRevenuePlanPeriod('week')}
              >
                Heti
              </Button>
              <Button
                variant={revenuePlanPeriod === 'day' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setRevenuePlanPeriod('day')}
              >
                Napi
              </Button>
            </div>
          </div>
          {/* 4 kis kártya: Bevétel Terv, Bevétel Tény, Költség Terv, Költség Tény */}
          <div className="grid grid-cols-2 gap-3">
            {/* Bevétel Terv */}
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-semibold">Bevétel Terv</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-500">
                {formatCurrencyHUF(revenuePlanFact.plan, false)}
              </div>
            </div>
            {/* Bevétel Tény */}
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-semibold">Bevétel Tény</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-500">
                {formatCurrencyHUF(revenuePlanFact.fact, false)}
              </div>
            </div>
            {/* Költség Terv */}
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-xs text-orange-700 dark:text-orange-400 mb-1 font-semibold">Költség Terv</div>
              <div className="text-xl font-bold text-orange-600 dark:text-orange-500">
                {formatCurrencyHUF(revenuePlanFact.costPlan || 0, false)}
              </div>
            </div>
            {/* Költség Tény */}
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-700 dark:text-green-400 mb-1 font-semibold">Költség Tény</div>
              <div className="text-xl font-bold text-green-600 dark:text-green-500">
                {formatCurrencyHUF(revenuePlanFact.costFact || 0, false)}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              revenuePlanFact.hasData ? 'bg-green-500' : 'bg-red-500'
            }`} aria-label={revenuePlanFact.hasData ? 'Adatok megvannak' : 'Nincs adat'} />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {revenuePlanFact.hasData 
                ? `Teljesítés: ${formatPercent(revenuePlanFact.completionRate, 1)}`
                : 'Nincs adat'
              }
            </span>
          </div>
        </div>
      </Card>

      {/* 6 új kártya - Screenshot alapján */}
      <section aria-label="Bevételi és lead statisztikák" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Éves sikeres lead */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Éves sikeres lead</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Összes bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.yearly.totalRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Megújuló bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.yearly.recurringRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.yearly.newRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új/sikeres (db):</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {successfulLeadStats.yearly.newCount}/{successfulLeadStats.yearly.successfulCount}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Havi sikeres lead */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Havi sikeres lead</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Összes bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.monthly.totalRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Megújuló bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.monthly.recurringRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.monthly.newRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új/sikeres (db):</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {successfulLeadStats.monthly.newCount}/{successfulLeadStats.monthly.successfulCount}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 3. Napi sikeres lead */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Napi sikeres lead</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Összes bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.daily.totalRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Megújuló bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.daily.recurringRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(successfulLeadStats.daily.newRevenue, false)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400">Új/sikeres (db):</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {successfulLeadStats.daily.newCount}/{successfulLeadStats.daily.successfulCount}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 4. Lead éves áttekintő */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Lead éves áttekintő</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Σ:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {leadYearlyOverview.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Sikeres:</span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-500">
                  {leadYearlyOverview.successful}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Sikertelen:</span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-500">
                  {leadYearlyOverview.unsuccessful}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Nyitott:</span>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-500">
                  {leadYearlyOverview.open}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 5. Tényleges bevételek */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Tényleges bevételek</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Éves bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(actualRevenues.yearly, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Havi bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(actualRevenues.monthly, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Napi bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(actualRevenues.daily, false)}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 6. Várható bevételek */}
        <Card>
          <div className="text-center">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Várható bevételek</h4>
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Díjbekérőzve:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(expectedRevenues.invoiced, false)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">Várható bevétel:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {formatCurrencyHUF(expectedRevenues.expected, false)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-600 dark:text-gray-400">Siker/nap:</span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {expectedRevenues.successPerDay > 0 
                    ? formatCurrencyHUF(expectedRevenues.successPerDay, false)
                    : 'Nincs adat nap'
                  }
                </span>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Pénzügyi statisztikák (Backend API-ból, ha elérhető) */}
      {api.isConfigured() && (
        <section aria-label="Pénzügyi statisztikák">
          {isLoadingFinancial ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4" aria-live="polite" aria-busy="true">
              <SkeletonStatsCard />
              <SkeletonStatsCard />
              <SkeletonStatsCard />
              <SkeletonStatsCard />
            </div>
          ) : financialStats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-500">
                    {formatCurrencyHUF(financialStats.revenues || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Bevételek</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    {financialStats.period === 'month' ? 'Ebben a hónapban' : financialStats.period}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-500">
                    {formatCurrencyHUF(
                      (financialStats.cleaning_costs || 0) +
                      (financialStats.textile_costs || 0) +
                      (financialStats.laundry_costs || 0) +
                      (financialStats.expenses || 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Költségek</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 space-y-0.5">
                    <div>Takarítás: {formatCurrencyHUF(financialStats.cleaning_costs || 0)}</div>
                    {(financialStats.textile_costs || 0) > 0 && (
                      <div>Textil: {formatCurrencyHUF(financialStats.textile_costs || 0)}</div>
                    )}
                    {(financialStats.laundry_costs || 0) > 0 && (
                      <div>Mosoda: {formatCurrencyHUF(financialStats.laundry_costs || 0)}</div>
                    )}
                    {(financialStats.expenses || 0) > 0 && (
                      <div>Egyéb: {formatCurrencyHUF(financialStats.expenses || 0)}</div>
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${
                    (financialStats.profit || 0) >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                  }`}>
                    {formatCurrencyHUF(financialStats.profit || 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nyereség</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Bevétel - Költségek
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-500">
                    {financialStats.revenues > 0
                      ? formatPercent(((financialStats.profit || 0) / financialStats.revenues) * 100, 1)
                      : 0}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nyereség %</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Profit margin
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </section>
      )}

      {/* További statisztikák */}
      <section aria-label="További statisztikák" className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-500">{bookingsStats.total}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Összes foglalás</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Ma érkező: {bookingsStats.today}
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-500">{bookingsStats.thisMonth}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ebben a hónapban</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Havi foglalások száma
            </div>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-500">
              {formatCurrencyHUF(bookingsStats.thisMonthRevenue)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Havi bevétel</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Összes: {formatCurrencyHUF(bookingsStats.totalRevenue)}
            </div>
            {parseFloat(bookingsStats.revenueGrowth) !== 0 && (
              <div className={`text-xs mt-1 font-medium ${
                parseFloat(bookingsStats.revenueGrowth) > 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
              }`}>
                {parseFloat(bookingsStats.revenueGrowth) > 0 ? '↑' : '↓'} {Math.abs(parseFloat(bookingsStats.revenueGrowth))}% 
                <span className="text-gray-500 dark:text-gray-500 ml-1">(előző hónaphoz képest)</span>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-500">
              {bookingsStats.total > 0 
                ? formatNumber(bookingsStats.thisMonthRevenue / bookingsStats.thisMonth || 0, 0) 
                : 0} Ft
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Átlagos foglalás</div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Ebben a hónapban
            </div>
          </div>
        </Card>
      </section>

      {/* Takarítási díjak (ha API elérhető) */}
      {api.isConfigured() && (
        <section aria-label="Takarítási díjak">
          {isLoadingCleaning ? (
            <Card>
              <SkeletonStatsCard />
            </Card>
          ) : cleaningSummary ? (
            <Card>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-gray-700 dark:text-gray-300">🧹 Takarítási díjak</h4>
                  <button
                    onClick={() => navigate('/cleaning')}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
                  >
                    Részletek megtekintése →
                  </button>
                </div>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrencyHUF(cleaningSummary.totalAmount || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {cleaningSummary.totalCleanings || 0} takarítás (
                  {cleaningSummary.byStatus?.paid?.count || 0} kifizetve)
                </p>
                <div className="mt-3 flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                  <span>
                    Tervezett: {cleaningSummary.byStatus?.planned?.count || 0} (
                    {formatCurrencyHUF(cleaningSummary.byStatus?.planned?.amount || 0)})
                  </span>
                  <span>
                    Elkészült: {cleaningSummary.byStatus?.done?.count || 0} (
                    {formatCurrencyHUF(cleaningSummary.byStatus?.done?.amount || 0)})
                  </span>
                  <span>
                    Kifizetve: {cleaningSummary.byStatus?.paid?.count || 0} (
                    {formatCurrencyHUF(cleaningSummary.byStatus?.paid?.amount || 0)})
                  </span>
                </div>
              </div>
            </Card>
          ) : null}
        </section>
      )}

      {/* Részletes statisztikák */}
      <section aria-label="Részletes statisztikák" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Sales Pipeline">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Új érdeklődők</span>
              <span className="font-bold text-orange-600 dark:text-orange-500">{getLeadsByStatus('new').length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Kapcsolatfelvétel</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-500">{pipelineStats.contacted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Ajánlat kiküldve</span>
              <span className="font-bold text-blue-600 dark:text-blue-500">{pipelineStats.offer}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tárgyalás</span>
              <span className="font-bold text-purple-600 dark:text-purple-500">{pipelineStats.negotiation}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Megnyert</span>
              <span className="font-bold text-green-600 dark:text-green-500">{pipelineStats.won}</span>
            </div>
          </div>
        </Card>

        <Card title="Értékesítési célok">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tervezett egységek</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{formatNumber(salesStats.totalPlanUnits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tényleges egységek</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{formatNumber(salesStats.totalActualUnits)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tervezett bevétel</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrencyHUF(salesStats.totalPlanRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tényleges bevétel</span>
              <span className="font-bold text-gray-800 dark:text-gray-200">{formatCurrencyHUF(salesStats.totalActualRevenue)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t dark:border-gray-700">
              <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Teljesítési arány</span>
              <span className={`font-bold ${salesStats.completionRate >= 100 ? 'text-green-600 dark:text-green-500' : 'text-orange-600 dark:text-orange-500'}`}>
                {formatPercent(salesStats.completionRate, 1)}
              </span>
            </div>
          </div>
        </Card>
      </section>

      {/* Naptár áttekintő widget */}
      {canView('bookings') && calendarWidgetData && (
        <section aria-label="Naptár áttekintő">
          <Card title="Naptár áttekintő" className="overflow-x-auto">
            <div className="min-w-[400px]">
              {/* Hónap fejléc és szűrők */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200">
                  {new Date(calendarWidgetData.currentYear, calendarWidgetData.currentMonth).toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2 items-center flex-wrap">
                  {/* Lakás szűrés */}
                  <label htmlFor="dashboard-apartment-filter" className="sr-only">
                    Lakás szűrése
                  </label>
                  <select
                    id="dashboard-apartment-filter"
                    value={selectedApartmentId}
                    onChange={(e) => setSelectedApartmentId(e.target.value)}
                    className="text-sm px-3 py-1.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    aria-label="Lakás szűrése"
                  >
                    <option value="">Összes lakás</option>
                    {apartments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {apt.name}
                      </option>
                    ))}
                  </select>
                  <Link
                    to="/bookings"
                    className="text-sm text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium"
                    aria-label="Ugrás a teljes naptár oldalra"
                  >
                    Teljes naptár →
                  </Link>
                </div>
              </div>

              {/* Naptár rács */}
              <div className="grid grid-cols-7 gap-1 text-xs">
                {/* Hét napjai */}
                {['H', 'K', 'Sz', 'Cs', 'P', 'Sz', 'V'].map((day, idx) => (
                  <div
                    key={`day-${idx}`}
                    className="p-1 text-center font-semibold text-gray-600 dark:text-gray-400"
                    role="columnheader"
                  >
                    {day}
                  </div>
                ))}

                {/* Üres napok a hónap elején */}
                {Array.from({ length: calendarWidgetData.startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-1" />
                ))}

                {/* Napok */}
                {Array.from({ length: calendarWidgetData.daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const isToday =
                    day === new Date().getDate() &&
                    calendarWidgetData.currentMonth === new Date().getMonth() &&
                    calendarWidgetData.currentYear === new Date().getFullYear();
                  const dayBookings = calendarWidgetData.bookingsByDay[day] || [];
                  const hasBookings = dayBookings.length > 0;
                  const isCheckIn = calendarWidgetData.checkInDays?.has(day);
                  const isCheckOut = calendarWidgetData.checkOutDays?.has(day);

                  return (
                    <div
                      key={day}
                      onClick={() => hasBookings && handleDayClick(day, dayBookings, calendarWidgetData.currentYear, calendarWidgetData.currentMonth)}
                      className={`p-1 min-h-[32px] border rounded ${
                        isToday
                          ? 'bg-blue-100 dark:bg-blue-900 border-blue-500 dark:border-blue-600'
                          : 'border-gray-200 dark:border-gray-700'
                      } ${hasBookings ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors' : ''}`}
                      role="gridcell"
                      aria-label={`${day}. nap${hasBookings ? `, ${dayBookings.length} foglalás` : ''}`}
                      tabIndex={hasBookings ? 0 : -1}
                      onKeyDown={(e) => {
                        if (hasBookings && (e.key === 'Enter' || e.key === ' ')) {
                          e.preventDefault();
                          handleDayClick(day, dayBookings, calendarWidgetData.currentYear, calendarWidgetData.currentMonth);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <div className={`text-xs font-medium ${
                          isToday
                            ? 'text-blue-700 dark:text-blue-300'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {day}
                        </div>
                        <div className="flex gap-0.5">
                          {isCheckIn && (
                            <span
                              className="text-[8px] px-1 py-0.5 bg-green-500 dark:bg-green-600 text-white rounded font-semibold"
                              title="Check-in nap"
                              aria-label="Check-in nap"
                            >
                              CI
                            </span>
                          )}
                          {isCheckOut && (
                            <span
                              className="text-[8px] px-1 py-0.5 bg-orange-500 dark:bg-orange-600 text-white rounded font-semibold"
                              title="Check-out nap"
                              aria-label="Check-out nap"
                            >
                              CO
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-0.5 flex-wrap">
                        {dayBookings.slice(0, 3).map((booking) => (
                          <div
                            key={booking.id}
                            className={`w-1.5 h-1.5 rounded-full ${
                              platformColors[booking.platform] || platformColors.other
                            }`}
                            title={`${booking.guestName || 'Vendég'} - ${platformLabels[booking.platform] || 'Egyéb'}`}
                            aria-label={`Foglalás: ${booking.guestName || 'Vendég'}`}
                          />
                        ))}
                        {dayBookings.length > 3 && (
                          <div
                            className="text-[8px] text-gray-500 dark:text-gray-400"
                            title={`+${dayBookings.length - 3} további foglalás`}
                            aria-label={`+${dayBookings.length - 3} további foglalás`}
                          >
                            +{dayBookings.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Jelmagyarázat */}
              <div className="flex flex-wrap gap-3 mt-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-pink-500 rounded-full" aria-hidden="true" />
                  <span>Airbnb</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" aria-hidden="true" />
                  <span>Booking</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full" aria-hidden="true" />
                  <span>Szallas.hu</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true" />
                  <span>Direkt</span>
                </div>
              </div>
            </div>
          </Card>
        </section>
      )}

      {/* Ma érkező foglalások */}
      <section aria-label="Ma érkező foglalások és legutóbbi leadek" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Ma érkező foglalások">
          {todayBookings.length > 0 ? (
            <div className="space-y-2">
              {todayBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{b.guestName || 'Vendég'}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">{getApartmentName(b.apartmentId)}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400">
                    {formatDate(b.dateFrom || b.checkIn)} – {formatDate(b.dateTo || b.checkOut)}
                  </span>
                </div>
              ))}
              <Link
                to="/bookings"
                className="block text-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium mt-2"
                aria-label="Ugrás az összes foglalás oldalra"
              >
                Összes foglalás →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm" role="status" aria-live="polite">
              Ma nincs érkező foglalás.
              <Link 
                to="/bookings" 
                className="block text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-2"
                aria-label="Ugrás a foglalások oldalra"
              >
                Foglalások →
              </Link>
            </div>
          )}
        </Card>

        <Card title="Legutóbbi leadek">
          {recentLeads.length > 0 ? (
            <div className="space-y-2">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{lead.name}</span>
                    {lead.email && (
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">{lead.email}</span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      lead.status === 'won'
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : lead.status === 'new'
                        ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {leadStatusLabels[lead.status] || lead.status}
                  </span>
                </div>
              ))}
              <Link
                to="/leads"
                className="block text-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium mt-2"
                aria-label="Ugrás az összes lead oldalra"
              >
                Összes lead →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm" role="status" aria-live="polite">
              Még nincsenek leadek.
              <Link 
                to="/leads" 
                className="block text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mt-2"
                aria-label="Ugrás a leadek oldalra"
              >
                Leadek →
              </Link>
            </div>
          )}
        </Card>

        <Card title="Legutóbbi foglalások">
          {recentBookings.length > 0 ? (
            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm"
                >
                  <div>
                    <span className="font-medium text-gray-800 dark:text-gray-200">{b.guestName || 'Vendég'}</span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">{getApartmentName(b.apartmentId)}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-400" title={formatDate(b.dateFrom || b.checkIn || b.createdAt)}>
                    {formatTimeAgo(b.dateFrom || b.checkIn || b.createdAt)}
                  </span>
                </div>
              ))}
              <Link
                to="/bookings"
                className="block text-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium mt-2"
                aria-label="Ugrás az összes foglalás oldalra"
              >
                Összes foglalás →
              </Link>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm" role="status" aria-live="polite">
              Még nincsenek foglalások.
              <Link 
                to="/bookings" 
                className="block text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 mt-2"
                aria-label="Ugrás a foglalások oldalra"
              >
                Foglalások →
              </Link>
            </div>
          )}
        </Card>
      </section>

      {/* Naptár nap foglalások modal */}
      {selectedDayBookings && selectedDayDate && (
        <Modal
          isOpen={!!selectedDayBookings}
          onClose={handleCloseDayModal}
          title={`Foglalások - ${formatDate(selectedDayDate)}`}
          size="md"
        >
          <div className="space-y-3">
            {selectedDayBookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-lg border ${
                  platformColors[booking.platform] || platformColors.other
                } text-white`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-lg">{booking.guestName || 'Vendég'}</h4>
                    <p className="text-sm opacity-90">{getApartmentName(booking.apartmentId)}</p>
                  </div>
                  <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                    {platformLabels[booking.platform] || 'Egyéb'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                  <div>
                    <span className="opacity-80">Érkezés:</span>
                    <div className="font-semibold">
                      {formatDate(booking.dateFrom || booking.checkIn)}
                    </div>
                  </div>
                  <div>
                    <span className="opacity-80">Távozás:</span>
                    <div className="font-semibold">
                      {formatDate(booking.dateTo || booking.checkOut)}
                    </div>
                  </div>
                  <div>
                    <span className="opacity-80">Éjszakák:</span>
                    <div className="font-semibold">{booking.nights || 1}</div>
                  </div>
                  <div>
                    <span className="opacity-80">Vendégek:</span>
                    <div className="font-semibold">{booking.guestCount || 1}</div>
                  </div>
                </div>
                {(booking.payoutEur || booking.payoutFt) && (
                  <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                    <span className="opacity-80 text-sm">Bevétel:</span>
                    <div className="font-bold text-lg">
                      {booking.payoutEur ? formatCurrencyEUR(booking.payoutEur) : ''}
                      {booking.payoutEur && booking.payoutFt ? ' / ' : ''}
                      {booking.payoutFt ? formatCurrencyHUF(booking.payoutFt) : ''}
                    </div>
                  </div>
                )}
                {booking.notes && (
                  <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                    <span className="opacity-80 text-sm">Megjegyzés:</span>
                    <div className="text-sm mt-1">{booking.notes}</div>
                  </div>
                )}
              </div>
            ))}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  handleCloseDayModal();
                  navigate('/bookings');
                }}
                variant="primary"
              >
                Összes foglalás megtekintése
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;


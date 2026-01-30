/**
 * Apps Page - Admin felületen belül
 * Integrált app funkciók: CleanApp, SmartPartner, Partner Registration
 */

import { useState, useEffect, lazy, Suspense, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';
import { ChevronLeft } from '../components/common/Icons';
import useApartmentsStore from '../stores/apartmentsStore';

const PartnerRegistrationPage = lazy(() => import('./PartnerRegistrationPage'));

const AppsPage = () => {
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    document.title = 'Apps - SmartCRM';
  }, []);

  const apps = [
    {
      id: 'cleanapp',
      name: 'CleanApp',
      description: 'Takarítók appja',
      icon: '',
      colorClass: 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700',
      hoverClass: 'hover:from-teal-600 hover:to-teal-700 dark:hover:from-teal-500 dark:hover:to-teal-600',
    },
    {
      id: 'partner',
      name: 'SmartPartner',
      description: 'Partner platform',
      icon: '',
      colorClass: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      hoverClass: 'hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600',
    },
    {
      id: 'registration',
      name: 'Partner Regisztráció',
      description: 'Regisztráció és szerzdés',
      icon: '',
      colorClass: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
      hoverClass: 'hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600',
    },
    {
      id: 'pricing',
      name: 'SmartPricing',
      description: 'Árazás és díjszabás',
      icon: '',
      colorClass: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700',
      hoverClass: 'hover:from-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600',
    },
    {
      id: 'sales',
      name: 'SmartSales',
      description: 'Értékesítés és értékesítés',
      icon: '',
      colorClass: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
      hoverClass: 'hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600',
    },
    {
      id: 'bookkeeper',
      name: 'SmartBookkeeper',
      description: 'Könyvelés és számlázás',
      icon: '',
      colorClass: 'from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700',
      hoverClass: 'hover:from-indigo-600 hover:to-indigo-700 dark:hover:from-indigo-500 dark:hover:to-indigo-600',
    },
  ];

  const handleSelectApp = (appId) => {
    setSelectedApp(appId);
  };

  const handleBack = () => {
    setSelectedApp(null);
  };

  // Ha van kiválasztott app  az app funkcióinak renderelése
  if (selectedApp === 'cleanapp') {
    return <CleanAppFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'partner') {
    return <SmartPartnerFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'registration') {
    return <PartnerRegFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'pricing') {
    return <SmartPricingFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'sales') {
    return <SmartSalesFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'bookkeeper') {
    return <SmartBookkeeperFeatures onBack={handleBack} />;
  }

  // App választó lista
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Apps</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Alkalmazások és eszközök</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {apps.map((app) => (
          <Card
            key={app.id}
            className={`bg-gradient-to-r ${app.colorClass} ${app.hoverClass} p-4 rounded-lg text-white text-center hover:shadow-lg transition shadow-md cursor-pointer`}
            onClick={() => handleSelectApp(app.id)}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl" aria-hidden="true">{app.icon}</span>
              <div>
                <h3 className="font-bold text-sm">{app.name}</h3>
                <p className="text-xs opacity-80 mt-0.5">{app.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// CleanApp funkciók - integrálva (CleaningPage funkciók)
const CleanAppFeatures = ({ onBack }) => {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 shadow-sm">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span>Vissza</span>
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-200">CleanApp</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Takarítók appja</p>
        </div>
      </div>

      <div className="flex-1">
        <iframe
          src="/cleanapp.html"
          className="w-full h-full border-0"
          title="CleanApp"
        />
      </div>
    </div>
  );
};

// SmartPartner funkciók - Partner kezelés és beállítások
const SmartPartnerFeatures = ({ onBack }) => {
  const navigate = useNavigate();
  const { apartments } = useApartmentsStore();
  
  // Partner lista összegyjtése a lakásokból
  const partners = useMemo(() => {
    const partnerMap = new Map();
    apartments.forEach(apt => {
      if (apt.partner && apt.partner.trim()) {
        if (!partnerMap.has(apt.partner)) {
          partnerMap.set(apt.partner, {
            name: apt.partner,
            apartmentIds: [],
            apartmentCount: 0
          });
        }
        const partner = partnerMap.get(apt.partner);
        partner.apartmentIds.push(apt.id);
        partner.apartmentCount++;
      }
    });
    return Array.from(partnerMap.values());
  }, [apartments]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span>Vissza</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">SmartPartner</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Partner kezelés és beállítások</p>
        </div>
      </div>

      {/* Partner lista */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Partnerek</h2>
            <Button onClick={() => navigate('/apartments')} variant="primary">
              Lakások kezelése 
            </Button>
          </div>
          
          {partners.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              Még nincsenek partnerek. A partnereket a <strong>Lakások</strong> oldalon lehet beállítani.
            </p>
          ) : (
            <div className="space-y-3">
              {partners.map((partner, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">{partner.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {partner.apartmentCount} lakás{partner.apartmentCount !== 1 ? '' : ''}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Lakás ID-k: {partner.apartmentIds.join(', ')}
                      </p>
                    </div>
                    <Button
                      onClick={() => navigate('/apartments')}
                      variant="ghost"
                      size="sm"
                    >
                      Megtekintés 
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Partner beállítások:</strong> A partnereket a <strong>Lakások</strong> oldalon lehet hozzárendelni és kezelni. 
              Minden lakáshoz hozzá lehet rendelni egy partnert, akinek a foglalásokból származó bevételeket kell elszámolni.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Partner Registration funkciók - integrálva
const PartnerRegFeatures = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span>Vissza</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Partner Regisztráció</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Partner regisztráció és szerzdés aláírás</p>
        </div>
      </div>

      <Suspense fallback={<SkeletonCard />}>
        <PartnerRegistrationPage />
      </Suspense>
    </div>
  );
};

// SmartPricing funkciók - Kalendárium nézet árazási ráccsal
const SmartPricingFeatures = ({ onBack }) => {
  const [viewMode, setViewMode] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(null);

  // Példa dátumok (jelenlegi hét + néhány nap)
  const dates = [
    { day: 'Wed', date: 28, highlighted: false },
    { day: 'Thu', date: 29, highlighted: false },
    { day: 'Fri', date: 30, highlighted: true },
    { day: 'Sat', date: 31, highlighted: true },
    { day: 'Sun', date: 1, highlighted: false },
    { day: 'Mon', date: 2, highlighted: false },
    { day: 'Tue', date: 3, highlighted: false },
    { day: 'Wed', date: 4, highlighted: false },
    { day: 'Thu', date: 5, highlighted: false },
    { day: 'Fri', date: 6, highlighted: true },
    { day: 'Sat', date: 7, highlighted: true },
  ];

  // Példa árazási adatok (százalékok és árak)
  const pricingData = dates.map(() => ({
    percentage: Math.floor(Math.random() * 30) + 30, // 30-60%
    occupancy: [
      { value: Math.random() * 40 + 20, color: 'bg-purple-400' },
      { value: Math.random() * 30 + 10, color: 'bg-purple-500' },
      { value: Math.random() * 20 + 5, color: 'bg-purple-600' },
    ],
  }));

  // Példa szobák/egységek
  const rooms = [
    { id: 1, name: 'Rottenbiller Gardens 2 - H22 - Smartchat', collapsible: true },
    { id: 2, name: 'Apartment A', collapsible: false },
    { id: 3, name: 'Apartment B', collapsible: false },
    { id: 4, name: 'Apartment C', collapsible: true },
  ];

  // Példa árak (véletlenszer)
  const getPrices = () => {
    const basePrice = Math.floor(Math.random() * 50) + 20;
    return {
      min: basePrice,
      max: basePrice + Math.floor(Math.random() * 50) + 20,
      hasSettings: Math.random() > 0.5,
    };
  };

  return (
    <div className="space-y-0 bg-white dark:bg-gray-900 min-h-screen">
      {/* Fejléc */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          {/* Bal oldali navigáció */}
          <div className="flex items-center gap-2">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft size={20} />
            </Button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'calendar' ? 'chart' : 'calendar')}
              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg ${viewMode === 'calendar' ? 'bg-purple-100 dark:bg-purple-900' : ''}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>
          </div>

          {/* Jobb oldali gombok */}
          <div className="flex items-center gap-2">
            <Button className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Price rules</span>
            </Button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dátumok fejléc */}
        <div className="flex gap-0 border-t border-gray-200 dark:border-gray-700">
          <div className="w-64 p-3 border-r border-gray-200 dark:border-gray-700 font-semibold text-sm text-gray-700 dark:text-gray-300">
            {/* Üres cella a bal oldali címhez */}
          </div>
          {dates.map((d, idx) => (
            <div
              key={idx}
              className={`flex-1 p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                d.highlighted ? 'bg-yellow-100 dark:bg-yellow-900/30' : ''
              }`}
            >
              <div className="text-xs text-gray-600 dark:text-gray-400">{d.day}</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{d.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Árazási rács */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Százalékok és occupancy bar */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <div className="w-64 p-3 border-r border-gray-200 dark:border-gray-700"></div>
            {pricingData.map((data, idx) => (
              <div
                key={idx}
                className="flex-1 p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
              >
                <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {data.percentage}%
                </div>
                <div className="flex gap-0.5 h-2 rounded overflow-hidden">
                  {data.occupancy.map((occ, i) => (
                    <div
                      key={i}
                      className={`${occ.color} flex-1`}
                      style={{ width: `${occ.value}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Szobák/egységek árazása */}
          {rooms.map((room) => (
            <div key={room.id} className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="w-64 p-3 border-r border-gray-200 dark:border-gray-700 flex items-center gap-2">
                {room.collapsible && (
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {room.name}
                </span>
              </div>
              {dates.map((_, dateIdx) => {
                const prices = getPrices();
                return (
                  <div
                    key={dateIdx}
                    className="flex-1 p-3 border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-600 dark:text-gray-400">{prices.min}</div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{prices.max}</div>
                    </div>
                    {prices.hasSettings && (
                      <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// SmartSales funkciók
const SmartSalesFeatures = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span>Vissza</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">SmartSales</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Értékesítés és értékesítés</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Értékesítési funkciók</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A SmartSales funkciói hamarosan elérhetek lesznek.
          </p>
        </div>
      </Card>
    </div>
  );
};

// SmartBookkeeper funkciók
const SmartBookkeeperFeatures = ({ onBack }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <ChevronLeft size={20} />
          <span>Vissza</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">SmartBookkeeper</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Könyvelés és számlázás</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Könyvelési funkciók</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A SmartBookkeeper funkciói hamarosan elérhetek lesznek.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AppsPage;

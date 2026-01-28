/**
 * Apps Page - Admin felületen belül
 * Integrált app funkciók: CleanApp, SmartPartner, Partner Registration
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { SkeletonCard } from '../components/common/Skeleton';
import { ChevronLeft } from '../components/common/Icons';

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
      icon: '🧹',
      colorClass: 'from-teal-500 to-teal-600 dark:from-teal-600 dark:to-teal-700',
      hoverClass: 'hover:from-teal-600 hover:to-teal-700 dark:hover:from-teal-500 dark:hover:to-teal-600',
    },
    {
      id: 'partner',
      name: 'SmartPartner',
      description: 'Partner platform',
      icon: '🏠',
      colorClass: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
      hoverClass: 'hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600',
    },
    {
      id: 'registration',
      name: 'Partner Regisztráció',
      description: 'Regisztráció és szerződés',
      icon: '📝',
      colorClass: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
      hoverClass: 'hover:from-green-600 hover:to-green-700 dark:hover:from-green-500 dark:hover:to-green-600',
    },
    {
      id: 'chat',
      name: 'SmartChat',
      description: 'Üzenetküldés és chat',
      icon: '💬',
      colorClass: 'from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700',
      hoverClass: 'hover:from-purple-600 hover:to-purple-700 dark:hover:from-purple-500 dark:hover:to-purple-600',
    },
    {
      id: 'pricing',
      name: 'SmartPricing',
      description: 'Árazás és díjszabás',
      icon: '💰',
      colorClass: 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700',
      hoverClass: 'hover:from-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-500 dark:hover:to-yellow-600',
    },
    {
      id: 'sales',
      name: 'SmartSales',
      description: 'Értékesítés és értékesítés',
      icon: '📊',
      colorClass: 'from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700',
      hoverClass: 'hover:from-orange-600 hover:to-orange-700 dark:hover:from-orange-500 dark:hover:to-orange-600',
    },
    {
      id: 'bookkeeper',
      name: 'SmartBookkeeper',
      description: 'Könyvelés és számlázás',
      icon: '📚',
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

  // Ha van kiválasztott app → az app funkcióinak renderelése
  if (selectedApp === 'cleanapp') {
    return <CleanAppFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'partner') {
    return <SmartPartnerFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'registration') {
    return <PartnerRegFeatures onBack={handleBack} />;
  }
  if (selectedApp === 'chat') {
    return <SmartChatFeatures onBack={handleBack} />;
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
  const navigate = useNavigate();
  
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">CleanApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Takarítók appja</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Munkák kezelése</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A CleanApp funkciói a <strong>Takarítás</strong> oldalon érhetők el.
          </p>
          <Button onClick={() => navigate('/cleaning')} className="mt-4">
            Ugrás a Takarítás oldalra →
          </Button>
        </div>
      </Card>
    </div>
  );
};

// SmartPartner funkciók - integrálva (ApartmentsPage partner funkciók)
const SmartPartnerFeatures = ({ onBack }) => {
  const navigate = useNavigate();
  
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
          <p className="text-gray-600 dark:text-gray-400 mt-1">Partner platform</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Partner funkciók</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A SmartPartner funkciói a <strong>Lakások</strong> oldalon érhetők el, ahol a partner adatok és lakások kezelhetők.
          </p>
          <Button onClick={() => navigate('/apartments')} className="mt-4">
            Ugrás a Lakások oldalra →
          </Button>
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
          <p className="text-gray-600 dark:text-gray-400 mt-1">Partner regisztráció és szerződés aláírás</p>
        </div>
      </div>

      <Suspense fallback={<SkeletonCard />}>
        <PartnerRegistrationPage />
      </Suspense>
    </div>
  );
};

// SmartChat funkciók
const SmartChatFeatures = ({ onBack }) => {
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">SmartChat</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Üzenetküldés és chat</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Chat funkciók</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A SmartChat funkciói hamarosan elérhetőek lesznek.
          </p>
        </div>
      </Card>
    </div>
  );
};

// SmartPricing funkciók
const SmartPricingFeatures = ({ onBack }) => {
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
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">SmartPricing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Árazás és díjszabás</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Árazási funkciók</h2>
          <p className="text-gray-600 dark:text-gray-400">
            A SmartPricing funkciói hamarosan elérhetőek lesznek.
          </p>
        </div>
      </Card>
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
            A SmartSales funkciói hamarosan elérhetőek lesznek.
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
            A SmartBookkeeper funkciói hamarosan elérhetőek lesznek.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default AppsPage;

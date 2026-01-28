import { useState } from 'react';
import { ChevronDown, ChevronUp } from '../common/Icons';

const SalesScriptPanel = () => {
  const [expandedSections, setExpandedSections] = useState({
    nyitas: true,
    fajdalompont: false,
    miniTechHook: false,
    kvalifikacio: false,
    cta: false
  });

  const [selectedTechHook, setSelectedTechHook] = useState('vendegkezeles');

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const techHooks = {
    vendegkezeles: {
      title: 'Ha vendégkezelés/check-in:',
      text: '"Nálunk nincs kulcsátadás, minden vendég feliratozott videós útmutatót kap a bejutásról, így nincs éjszakai telefon, nincs kulcspara."'
    },
    bevetel: {
      title: 'Ha bevétel:',
      text: '"Az árakat AI kezeli, eseményeknél automatikusan felmegy, nem marad pénz az asztalon."'
    },
    idohiany: {
      title: 'Ha időhiány/admin:',
      text: '"Minden online megy: vendégek, számlázás, NTAK, takarítás, neked nem kell napi szinten benne lenned."'
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">
        Telefonos Script
      </h3>

      {/* 1. Nyitás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('nyitas')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">1. Nyitás</span>
          {expandedSections.nyitas ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections.nyitas && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Szia, [Név] vagyok a Smartproperties Airbnbhosttól, te hagytál meg elérhetőséget lakásüzemeltetéssel kapcsolatban. Most jókor hívlak?"
            </p>
          </div>
        )}
      </div>

      {/* 2. Fájdalompont */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('fajdalompont')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">2. Fájdalompont</span>
          {expandedSections.fajdalompont ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections.fajdalompont && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Most ki kezeli a lakást?"
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mi benne most a legnagyobb macera?"
            </p>
          </div>
        )}
      </div>

      {/* 3. Mini tech hook */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('miniTechHook')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">3. Mini tech hook</span>
          {expandedSections.miniTechHook ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections.miniTechHook && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <div className="flex gap-2 mb-3">
              {Object.keys(techHooks).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedTechHook(key)}
                  className={`px-3 py-1 text-xs rounded transition ${
                    selectedTechHook === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {techHooks[key].title.replace('Ha ', '').replace(':', '')}
                </button>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {techHooks[selectedTechHook].title}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                {techHooks[selectedTechHook].text}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 4. Kvalifikáció */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('kvalifikacio')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">4. Kvalifikáció</span>
          {expandedSections.kvalifikacio ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections.kvalifikacio && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Hol van a lakás és mekkora?"
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Most hosszú vagy rövid távon megy?"
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mi lenne az a havi nettó, amire azt mondod: ezért már megéri váltani?"
            </p>
          </div>
        )}
      </div>

      {/* 5. CTA - időpontfoglalás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection('cta')}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">5. CTA – időpontfoglalás</span>
          {expandedSections.cta ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections.cta && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Pontos számokat csak a lakás alapján lehet mondani. Kimegyek, megnézem, és ott megmondom, mennyit lehet belőle kihozni éves szinten. Mikor jó, inkább hétköznap vagy hétvégén?"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesScriptPanel;

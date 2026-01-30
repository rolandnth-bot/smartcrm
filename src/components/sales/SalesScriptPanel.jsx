import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp } from '../common/Icons';
import useLeadsStore from '../../stores/leadsStore';
import SendContractEmailModal from './SendContractEmailModal';
import ScriptTimer from './ScriptTimer';
import CallStatisticsCard from './CallStatisticsCard';

const SalesScriptPanel = ({ selectedLead: externalSelectedLead = null }) => {
  const navigate = useNavigate();
  const { leads, updateLead } = useLeadsStore();
  const [selectedLead, setSelectedLead] = useState(null);
  const [showContractEmailModal, setShowContractEmailModal] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [expandedSections, setExpandedSections] = useState({
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false,
    11: false,
    12: false
  });

  // Időmérő state-ek
  const [scriptTimings, setScriptTimings] = useState({});
  const [activeTimerSection, setActiveTimerSection] = useState(null);
  const [timerStartTimes, setTimerStartTimes] = useState({});
  const [callStartTime, setCallStartTime] = useState(null);

  // Script 2 - Űrlap adatok
  const [formData, setFormData] = useState({
    district: '',
    address: '',
    size: '',
    beds: ''
  });

  // Script 3 - Kalkulátor mezők
  const [calculatorFields, setCalculatorFields] = useState({
    condition: '',
    terrace: '',
    bathrooms: '',
    wc: '',
    rooms: '',
    parking: ''
  });

  // Script 3 - Kalkulátor
  const [longTermRent, setLongTermRent] = useState('');
  const [calculatorResult, setCalculatorResult] = useState(null);

  // Script szakaszok nevei
  const scriptSections = {
    1: '1. Keretezés',
    2: '2. Feltérképezés',
    3: '3. Bevétel-költségterv',
    4: '4. Vendégkapcsolattartás',
    5: '5. Bulizás és károkozás',
    6: '6. SmartPricing',
    7: '7. Árstratégia',
    8: '8. Felújítás - home staging',
    9: '9. Csomagok részletezése',
    10: '10. Indulás menete',
    11: '11. Bizalomzárás',
    12: '12. Zárás'
  };

  // External lead betöltése (SalesPage-ről)
  useEffect(() => {
    if (externalSelectedLead) {
      setSelectedLead(externalSelectedLead);
    }
  }, [externalSelectedLead]);

  // Hívás indítása
  useEffect(() => {
    if (!callStartTime && selectedLead && isStarted) {
      setCallStartTime(Date.now());
    }
  }, [selectedLead, callStartTime, isStarted]);

  const toggleSection = (section) => {
    const wasExpanded = expandedSections[section];
    const willBeExpanded = !wasExpanded;

    // Állítsuk le az előző timer-t, ha van
    if (activeTimerSection !== null && activeTimerSection !== section) {
      setActiveTimerSection(null);
    }

    // Ha megnyitjuk, indítsuk el a timer-t
    if (willBeExpanded) {
      setActiveTimerSection(section);
      setTimerStartTimes(prev => ({
        ...prev,
        [section]: Date.now()
      }));
    } else {
      // Ha bezárjuk, állítsuk meg a timer-t
      if (activeTimerSection === section) {
        setActiveTimerSection(null);
      }
    }

    setExpandedSections(prev => ({
      ...prev,
      [section]: willBeExpanded
    }));
  };

  // Timer idő frissítése
  const handleTimeUpdate = useCallback((section, elapsedSeconds) => {
    setScriptTimings(prev => ({
      ...prev,
      [section]: elapsedSeconds
    }));
  }, []);

  // Hívás befejezése
  const handleFinishCall = useCallback(async () => {
    if (!selectedLead) {
      alert('Nincs kiválasztott lead!');
      return;
    }

    // Állítsuk meg az aktív timer-t
    if (activeTimerSection !== null) {
      setActiveTimerSection(null);
    }

    // Mentés a lead-hez
    const callData = {
      scriptTimings: { ...scriptTimings },
      callStartTime,
      callEndTime: Date.now(),
      totalDuration: Math.floor((Date.now() - callStartTime) / 1000),
      timestamp: new Date().toISOString()
    };

    // Frissítjük a lead-et
    await updateLead(selectedLead.id, {
      ...selectedLead,
      lastContactDate: new Date().toISOString().split('T')[0],
      notes: `${selectedLead.notes || ''}\n\n[${new Date().toLocaleDateString('hu-HU')} ${new Date().toLocaleTimeString('hu-HU')}] Hívás időtartama: ${Math.floor(callData.totalDuration / 60)} perc ${callData.totalDuration % 60} másodperc\nScript pontok: ${Object.keys(scriptTimings).length} db`
    });

    // Reset
    setScriptTimings({});
    setTimerStartTimes({});
    setCallStartTime(null);
    setActiveTimerSection(null);

    alert('Hívás sikeresen lezárva és mentve!');
  }, [selectedLead, activeTimerSection, scriptTimings, callStartTime, updateLead]);

  const handleLeadSelect = (lead) => {
    setSelectedLead(lead);
    setShowLeadSelect(false);
    // Betöltjük a lead adatait az űrlapba, ha vannak
    if (lead) {
      setFormData(prev => ({
        ...prev,
        // Ha a lead-nek van címe vagy más adata, itt töltjük be
      }));
    }
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCalculatorFieldChange = (field, value) => {
    setCalculatorFields(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateAirbnb = () => {
    const longTerm = parseFloat(longTermRent);
    if (isNaN(longTerm) || longTerm <= 0) {
      setCalculatorResult(null);
      return;
    }

    // Alap kalkuláció: hosszútávú + 80%
    const baseMonthlyRevenue = longTerm * 1.8; // 100% + 80% = 180%
    const baseYearlyRevenue = baseMonthlyRevenue * 12; // Alapértelmezett éves bevétel

    // Szorzóértékek számítása (additív bónuszok)
    let multiplier = 0;

    // Állapot
    if (calculatorFields.condition === 'renovated') {
      multiplier += 0.15; // Felújított +15%
    } else if (calculatorFields.condition === 'average') {
      multiplier += 0.05; // Közepes +5%
    }
    // Felújítatlan: 0% (nincs bónusz)

    // Terasz/Erkély: Van +10%
    if (calculatorFields.terrace === 'yes') {
      multiplier += 0.10;
    }

    // Szobák száma: 2. szobától +10%/szoba
    const rooms = parseInt(calculatorFields.rooms);
    if (!isNaN(rooms) && rooms >= 2) {
      multiplier += (rooms - 1) * 0.10;
    }

    // Parkolás
    if (calculatorFields.parking === 'paid') {
      multiplier += 0.10; // Fizetős +10%
    } else if (calculatorFields.parking === 'free') {
      multiplier += 0.20; // Ingyenes +20%
    }

    // Fürdő: 2. fürdőtől +5%/db
    const bathrooms = parseInt(calculatorFields.bathrooms);
    if (!isNaN(bathrooms) && bathrooms >= 2) {
      multiplier += (bathrooms - 1) * 0.05;
    }

    // WC: 2. WC-től +7.5%/db
    const wc = parseInt(calculatorFields.wc);
    if (!isNaN(wc) && wc >= 2) {
      multiplier += (wc - 1) * 0.075;
    }

    // Módosított éves bevétel a paraméterek alapján
    const expectedYearlyRevenue = baseYearlyRevenue * (1 + multiplier);
    const expectedRevenue = expectedYearlyRevenue / 12; // Átlag havi bevétel

    const yearlyCosts = expectedYearlyRevenue * 0.415; // Éves költség (41.5%)
    const minNightlyRate = expectedYearlyRevenue / 292; // Min éjszakai ár
    const startingNightlyRate = minNightlyRate * 1.5; // Induló éjszakai ár = min ár + 50%
    const netYearlyResult = expectedYearlyRevenue - yearlyCosts; // Nettó éves eredmény
    const yearlyDifference = netYearlyResult - (longTerm * 12); // Éves különbség

    setCalculatorResult({
      longTerm: longTerm,
      expectedRevenue: expectedRevenue,
      expectedYearlyRevenue: expectedYearlyRevenue,
      yearlyCosts: yearlyCosts,
      minNightlyRate: minNightlyRate,
      startingNightlyRate: startingNightlyRate,
      netYearlyResult: netYearlyResult,
      yearlyDifference: yearlyDifference
    });
  };

  // Helper a timer megjelenítéséhez
  const renderTimer = (sectionNumber) => {
    if (activeTimerSection === sectionNumber && timerStartTimes[sectionNumber]) {
      return (
        <ScriptTimer
          isActive={true}
          startTime={timerStartTimes[sectionNumber]}
          onTimeUpdate={(seconds) => handleTimeUpdate(sectionNumber, seconds)}
        />
      );
    }

    if (!activeTimerSection && scriptTimings[sectionNumber] > 0) {
      return (
        <span className="ml-2 text-xs font-mono text-gray-500 dark:text-gray-400">
          {Math.floor(scriptTimings[sectionNumber] / 60)}:{String(scriptTimings[sectionNumber] % 60).padStart(2, '0')}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">📞 Smartproperties Airbnbhost</h2>
        <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400">TELEFONOS SALES SCRIPT – RÖVIDTÁVÚ KIADÁS</h3>
      </div>

      {/* Indítás gomb */}
      <div className="mb-4">
        <button
          onClick={() => {
            if (!selectedLead) {
              alert('Kérjük, válasszon ki egy leadet a Sales Pipeline listából vagy a naptárból!');
              return;
            }

            console.log('🚀 Sales folyamat indítása lead:', selectedLead.name);
            setIsStarted(true);

            // Megnyitjuk az első szekciót
            setExpandedSections(prev => ({
              ...prev,
              1: true
            }));

            alert(`✅ Sales folyamat elindítva: ${selectedLead.name}`);
          }}
          className={`w-full p-3 bg-gradient-to-r ${
            selectedLead
              ? 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              : 'from-gray-400 to-gray-500 cursor-not-allowed'
          } text-white rounded-lg transition font-semibold shadow-lg`}
          disabled={!selectedLead}
        >
          {selectedLead ? `🚀 Indítás: ${selectedLead.name}` : '⚠️ Válassz leadet a listából vagy naptárból'}
        </button>
        {selectedLead && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedLead.name}</p>
            {selectedLead.email && <p className="text-xs text-gray-600 dark:text-gray-400">📧 {selectedLead.email}</p>}
            {selectedLead.phone && <p className="text-xs text-gray-600 dark:text-gray-400">📱 {selectedLead.phone}</p>}
            {selectedLead.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">💬 {selectedLead.notes}</p>}
          </div>
        )}
      </div>

      {/* 1. Keretezés */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(1)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">1. Keretezés – mi fog történni</span>
          <div className="flex items-center gap-2">
            {renderTimer(1)}
            {expandedSections[1] ? <ChevronUp /> : <ChevronDown />}
          </div>
        </button>
        {expandedSections[1] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Gyorsan felmérem a lakást pár kérdéssel, utána adok egy reális átlagbecslést hosszú- és rövidtávra, és megnézzük, van-e értelme továbblépni. Oké?"
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
              hangsúly: átlagbecslés, nem ígéret.
            </p>
          </div>
        )}
      </div>

      {/* 2. Feltérképezés - ŰRLAP */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(2)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">2. Feltérképezés - Űrlap</span>
          <div className="flex items-center gap-2">
            {renderTimer(2)}
            {expandedSections[2] ? <ChevronUp /> : <ChevronDown />}
          </div>
        </button>
        {expandedSections[2] && (
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold mb-3">
              "Mert minden lakás más, pár dolgot pontosítanék."
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Kerület</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => handleFormChange('district', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. V. ker."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Pontos cím</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleFormChange('address', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Utca, házszám"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Alapterület (m²)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => handleFormChange('size', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. 45"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Ágyak / Férőhely</label>
                <input
                  type="text"
                  value={formData.beds}
                  onChange={(e) => handleFormChange('beds', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="pl. 4 fő"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Bevétel-költségterv */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(3)}
          className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition border-2 border-green-500 dark:border-green-600"
        >
          <span className="font-semibold text-gray-800 dark:text-gray-200">3. 📊 Bevétel–költségterv</span>
          <div className="flex items-center gap-2">
            {renderTimer(3)}
            {expandedSections[3] ? <ChevronUp /> : <ChevronDown />}
          </div>
        </button>
        {expandedSections[3] && (
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mi ezt nem mellékesként kezeljük, hanem ugyanúgy bevétel–költség alapon tervezzük, mint a nagy cégek és szállodaláncok."
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Minden lakásnál van:"
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>bevételi terv</li>
              <li>fix és változó költségek</li>
              <li>nettó eredmény számolva</li>
              <li>és ez alapján döntünk fejlesztésről, promóról, árstratégiáról</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Ezért mondom, hogy mi nem érzésből döntünk, hanem számokból."
            </p>

            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold mt-4">
              "Mondok egy egyszerű példát, hogy lásd a különbséget."
            </p>

            {/* Eredeti példa - 300 ezres */}
            <div className="space-y-2">
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Hosszútáv:</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                  <li>300.000 Ft / hó</li>
                  <li>Évi: 3.600.000 Ft</li>
                  <li>–13,5% SZJA → kb. 3.114.000 Ft nettó</li>
                </ul>
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rövidtáv:</p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
                  <li>átlagosan kb. +40%</li>
                  <li>→ kb. 4.360.000 Ft adózott eredmény</li>
                </ul>
              </div>
            </div>

            {/* Első sor: Hosszútávú kiadás kártya (100% széles, horizontális layout) */}
            <div className="w-full">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-md flex flex-col lg:flex-row items-start gap-4">
                {/* BAL oldal: input + Rövidtáv kalkuláció */}
                <div className="flex-1 space-y-3 w-full">
                  <div>
                    <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 mb-2">
                      💰 Hosszútávú kiadás havi bevétele (Ft):
                    </label>
                    <input
                      type="number"
                      value={longTermRent}
                      onChange={(e) => {
                        setLongTermRent(e.target.value);
                        setCalculatorResult(null);
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          calculateAirbnb();
                        }
                      }}
                      className="w-full px-4 py-2 text-base font-semibold border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="pl. 300000"
                    />
                  </div>

                  {/* Rövidtáv – minimál átlagár info - csak ha van eredmény */}
                  {calculatorResult && (
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-purple-400 dark:border-purple-500 shadow-md space-y-3">
                      <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2 border-b border-purple-300 dark:border-purple-600 pb-2">
                        💰 Rövidtáv – minimál átlagár
                      </h4>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Átlagár / éjszaka:</span>
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            ~{Math.round(calculatorResult.minNightlyRate).toLocaleString()} Ft
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Induló ár:</span>
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            ~{Math.round(calculatorResult.startingNightlyRate).toLocaleString()} Ft
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Éves nettó:</span>
                          <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                            {Math.round(calculatorResult.netYearlyResult).toLocaleString()} Ft
                          </span>
                        </div>

                        <div className="flex items-center justify-between bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">Növekedés:</span>
                          <span className="text-sm font-bold text-green-600 dark:text-green-400">
                            +{Math.round((calculatorResult.yearlyDifference / (calculatorResult.longTerm * 12)) * 100)}%
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-100/50 dark:bg-purple-900/30 p-2 rounded">
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          💡 <span className="font-semibold">Stratégia:</span> Biztonságos alsó átlag + agresszív felárazás csúcsnapokon
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* JOBB oldal: Számolás gomb */}
                <div className="flex items-center justify-center w-full lg:w-auto lg:min-w-[180px] pt-2 lg:pt-0">
                  <button
                    onClick={calculateAirbnb}
                    className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition shadow-lg"
                  >
                    🧮 Számolás
                  </button>
                </div>
              </div>
            </div>

            {/* Második sor: Lakás paraméterei (bal) és Éves kalkuláció (jobb) egymás mellett */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Bal: Lakás paraméterei kártya */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-300 dark:border-blue-600 shadow-md">
                <h4 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-2">🏠 Lakás paraméterei</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 italic leading-relaxed">
                  Állítsd be a lakás jellemzőit a pontosabb bevételi kalkulációhoz! Minél több paramétert adsz meg, annál reálisabb becslést kapsz az éves bevételről.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Állapot</label>
                    <select
                      value={calculatorFields.condition}
                      onChange={(e) => handleCalculatorFieldChange('condition', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="renovated">Felújított +15%</option>
                      <option value="average">Közepes +5%</option>
                      <option value="unrenovated">Felújítatlan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Terasz / Erkély</label>
                    <select
                      value={calculatorFields.terrace}
                      onChange={(e) => handleCalculatorFieldChange('terrace', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="yes">Van</option>
                      <option value="no">Nincs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Szobák száma</label>
                    <select
                      value={calculatorFields.rooms}
                      onChange={(e) => handleCalculatorFieldChange('rooms', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} szoba</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Parkolás</label>
                    <select
                      value={calculatorFields.parking}
                      onChange={(e) => handleCalculatorFieldChange('parking', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="free">Ingyenes</option>
                      <option value="paid">Fizetős</option>
                      <option value="none">Nincs</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Fürdő</label>
                    <select
                      value={calculatorFields.bathrooms}
                      onChange={(e) => handleCalculatorFieldChange('bathrooms', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} db</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">WC</label>
                    <select
                      value={calculatorFields.wc}
                      onChange={(e) => handleCalculatorFieldChange('wc', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Válassz...</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} db</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Jobb: Éves kalkuláció kártya */}
              {calculatorResult ? (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 p-4 rounded-lg border-2 border-green-400 dark:border-green-600 shadow-xl space-y-2">
                  <h4 className="text-sm font-bold text-green-700 dark:text-green-300 text-center mb-2">📊 Éves kalkuláció</h4>

                  <div className="flex justify-between items-center p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg border border-purple-300 dark:border-purple-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Várható éves bevétel:</span>
                    <span className="text-sm font-bold text-purple-700 dark:text-purple-300">
                      {Math.round(calculatorResult.expectedYearlyRevenue).toLocaleString()} Ft
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/40 rounded-lg border border-red-300 dark:border-red-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Éves költség:</span>
                    <span className="text-sm font-bold text-red-700 dark:text-red-300">
                      -{Math.round(calculatorResult.yearlyCosts).toLocaleString()} Ft
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg border border-indigo-300 dark:border-indigo-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Min éjszakai ár:</span>
                    <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
                      {Math.round(calculatorResult.minNightlyRate).toLocaleString()} Ft / éj
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg border border-cyan-300 dark:border-cyan-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Induló éjszakai ár:</span>
                    <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
                      {Math.round(calculatorResult.startingNightlyRate).toLocaleString()} Ft / éj
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg border border-blue-300 dark:border-blue-600">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Átlag havi bevétel:</span>
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                      {Math.round(calculatorResult.expectedRevenue).toLocaleString()} Ft
                    </span>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-white">Nettó éves eredmény:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          {Math.round(calculatorResult.netYearlyResult).toLocaleString()} Ft
                        </div>
                        <div className="text-xs font-light text-white/90">
                          ~{Math.round(calculatorResult.netYearlyResult / 12).toLocaleString()} Ft/hó
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-900">Éves különbség:</span>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          +{Math.round(calculatorResult.yearlyDifference).toLocaleString()} Ft
                        </div>
                        <div className="text-xs font-light text-gray-900/80">
                          ~{Math.round(calculatorResult.yearlyDifference / 12).toLocaleString()} Ft/hó
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700/20 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Töltsd ki a paramétereket és számolj
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-300 dark:border-blue-700">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Gyors előnylista:</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside mt-2">
                <li>nincs állandó bérlő → kevesebb amortizáció</li>
                <li>üres napokon teljes kontroll, bármikor fel tudsz menni</li>
                <li>ha kell, bármikor visszatehető hosszútávra</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 4. Vendégkapcsolattartás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(4)}
          className="w-full flex items-center justify-between p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition border-2 border-cyan-400 dark:border-cyan-600"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">4. 💬 Vendégkapcsolattartás</span>
            {renderTimer(4)}
          </div>
          {expandedSections[4] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[4] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold">
              "A vendégkapcsolattartásunk a legjobb technológiát használja a leggyorsabb kiszolgálásért."
            </p>

            <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded border border-cyan-300 dark:border-cyan-700">
              <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-2">📱 0-24 órás WhatsApp üzenetküldés:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "A vendégek bármikor írhatnak, mindig elérhető vagyunk."
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-300 dark:border-blue-700">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">🤖 AI Chatbot - azonnali válaszok:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "Mesterséges intelligencia chatbot azonnal válaszol a vendégek kérdéseire – check-in infó, helyi ajánlók, házirend, bármi. Nem kell órákig várni."
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-300 dark:border-green-700">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">🎥 Videós bejutási útmutató:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "Levideózzuk a lakásba való bejutást, hogy a vendégek pontosan tudják, hol van a bejárat, kulcsdoboz, stb. Nincs tévedés, nincs hívogatás."
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-300 dark:border-purple-700">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">🆔 Online igazolvány szkennelés:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                "A vendégeknek online kell szkennelniük az igazolványaikat az NTAK regisztrációhoz. Biztonságos, gyors, nem kell személyesen találkozni."
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold">
              "Ez mind automatizált, profi, és a vendégek is imádják, mert gyors és egyszerű."
            </p>
          </div>
        )}
      </div>

      {/* 5. Bulizás és károkozás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(5)}
          className="w-full flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition border-2 border-orange-400 dark:border-orange-600"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">5. 🎉 Bulizás és károkozás – a valóság</span>
            {renderTimer(5)}
          </div>
          {expandedSections[5] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[5] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Nem mondom, hogy soha nem fordul elő károkozás, mert az nem lenne őszinte – de sokkal ritkább, mint gondolnád."
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-300 dark:border-blue-700">
              <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">A turisták viselkedése:</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Nem a lakásban buliznak, hanem kint – bárok, éttermek, programok</li>
                <li>Otthon tisztálkodnak és alsznak</li>
                <li>Az apartman pihenőhely, nem buli lokáció</li>
                <li>Továbbá van egy elég elrettentő házirendünk rendőrség és pénzbírság fenyegetéssel</li>
              </ul>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-300 dark:border-yellow-700">
              <p className="text-sm font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Valós tapasztalat:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Rendetlenség és mocsok? Igen, az van – előfordul, hogy a takarító elmond 3 Miatyánkot. De <strong>tényleges károkozás nagyon elenyésző</strong>."
              </p>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-300 dark:border-green-700">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300 mb-1">📊 Számok:</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                <li>Statisztikailag ~1% károkozás aránya</li>
                <li>Átlagos javítási költség: 20.000 Ft</li>
              </ul>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-300 dark:border-red-700 space-y-2">
              <p className="text-sm font-bold text-red-700 dark:text-red-300">⚠️ Károkozás & Biztonság</p>
              <div className="space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-red-700 dark:text-red-400">• Airbnb:</span> Rugalmasan fizeti a károkat (AirCover)
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold text-red-700 dark:text-red-400">• Booking:</span> Csak ha vendég elismeri – ezzel a tulajdonosnak számolnia kell. A Bookingot úgy hívjuk, hogy a "szükséges rossz", a rendszerük is nagyon komplikált, viszont 75%-ban a Booking viszi a foglalásokat és magasabb áron is jellemzően.
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold">
              "Szóval igen, kell rá számítani, de nem ez lesz a fő problémád – a bevétel sokkal gyorsabban nő, mint a javítási költségek."
            </p>
          </div>
        )}
      </div>

      {/* 6. SmartPricing */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(6)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">6. SmartPricing – itt jön a "miért több"</span>
            {renderTimer(6)}
          </div>
          {expandedSections[6] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[6] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mi nem kézzel árazunk. SmartPricinget használunk, ez a piac egyik legfejlettebb és legdrágább okosárazó rendszere, pont ezért működik."
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Folyamatosan figyeli:"
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>a környék kínálatát</li>
              <li>a keresletet</li>
              <li>eseményeket, koncerteket, sportot, konferenciákat</li>
            </ul>
            <div className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-300 dark:border-gray-600">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Konkrét példa:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Most május 29–30-ra focimeccs miatt 8–10× árak vannak, de volt már 12× is. Jelenleg az apartman árak 120.000-400.000 Ft/éj. Ezt ember nem követi le manuálisan, a rendszer viszont igen."
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-300 dark:border-green-700">
              <p className="text-sm font-semibold text-green-700 dark:text-green-300">extra megkülönböztetés:</p>
              <p className="text-sm text-green-700 dark:text-green-300 italic">
                "Ráadásul mi az elsők között kezdtük el használni, idén lesz 2 éve, hogy fut nálunk. Ez azt jelenti, hogy két évnyi tanulási adatbázisa van a mi lakásainkon, és ezt nem lehet megvenni egy sima előfizetéssel. Ettől vagyunk mások, mint a legtöbb management cég."
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Beállítás logika:</p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>van induló ár</li>
              <li>van minimum ár, ami alá soha nem megy</li>
              <li>felfelé viszont agresszíven emel</li>
            </ul>
          </div>
        )}
      </div>

      {/* 7. Árstratégia */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(7)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">7. Árstratégia – yield management</span>
            {renderTimer(7)}
          </div>
          {expandedSections[7] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[7] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Az árazást nálunk az értékesítési kolléga csinálja, Tiago Mata aki korábban Bookingnál és Marriott környezetben dolgozott, promóciókkal, árstratégiával, bevételoptimalizálással. Ez yield management, nem megérzés."
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Folyamatosan tesztelünk:"
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>promóciókat</li>
              <li>last minute árakat</li>
              <li>hosszabb tartózkodás kedvezményeket</li>
            </ul>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mindig a nettó bevétel maximalizálása a cél, nem csak a naptár feltöltése."
            </p>
          </div>
        )}
      </div>

      {/* 8. Felújítás - home staging */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(8)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">8. 🎨 Felújítás - home staging</span>
            {renderTimer(8)}
          </div>
          {expandedSections[8] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[8] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-3">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Mi nem azt mondjuk, hogy először költs el több milliót, és majd egyszer megtérül."
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "A stratégiánk:"
            </p>
            <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
              <li>először induljon el és termeljen</li>
              <li>a bevételből képzünk tartalékot</li>
              <li>és csak olyan fejlesztést csinálunk meg, ami kimutathatóan növeli a bevételt</li>
            </ul>

            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded border border-purple-300 dark:border-purple-700">
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2">Home staging - rövidtávú kiadásnál:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Mivel ez rövidtávú kiadás, sok esetben pár néhány ezer forintos dekoráció is teljesen elegendő lehet. Nem kell azonnal felújítani, a fotókon jól mutatni fog és a vendégeknek is megfelelő lesz."
              </p>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Ha van olyan dolog, ami elengedhetetlen az induláshoz, azt természetesen jelezzük, de alapvetően bevétel- és költségtervet csinálunk, táblázatban, számokkal, monitorozzuk, optimalizáljuk, nem érzésből döntünk."
            </p>
          </div>
        )}
      </div>

      {/* 9. Csomagok részletezése */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(9)}
          className="w-full flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition border-2 border-purple-400 dark:border-purple-600"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">9. 📦 Csomagok részletezése</span>
            {renderTimer(9)}
          </div>
          {expandedSections[9] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[9] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-4">
            {/* Havidíj információ */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border-2 border-yellow-400 dark:border-yellow-600 shadow-md">
              <h4 className="text-base font-bold text-orange-700 dark:text-orange-300 mb-3 flex items-center gap-2">
                💰 Havidíj - 12.000 Ft
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-semibold">
                Ez tartalmazza:
              </p>
              <div className="space-y-2">
                <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">🧻 Fogyóeszközök minden vendég után:</p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300 grid grid-cols-2 gap-1">
                    <li>• WC papír</li>
                    <li>• Felmosófejek</li>
                    <li>• Szappan, tusfürdő</li>
                    <li>• Sampon</li>
                    <li>• Mosogatószer</li>
                    <li>• Mosogatószivacs</li>
                    <li>• Szemeteszsák</li>
                    <li>• Mosószer</li>
                    <li>• Tisztítószerek</li>
                    <li>• Öblítő</li>
                  </ul>
                </div>
                <div className="bg-white/70 dark:bg-gray-800/70 p-3 rounded">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">🎁 Üdvözlő ajándék minden vendégnek:</p>
                  <ul className="text-xs text-gray-700 dark:text-gray-300">
                    <li>• Kávékapszulák (Nespresso kompatibilis)</li>
                    <li>• Csokigolyó</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Alap csomag */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-400 dark:border-blue-600">
              <h4 className="text-base font-bold text-blue-700 dark:text-blue-300 mb-3 flex items-center justify-between">
                <span>Alap csomag</span>
                <span className="text-2xl">20%</span>
              </h4>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Professzionális ingatlanfotós megszervezése</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Hirdetések elkészítése és kezelése 2 platformon (Airbnb, Booking.com) az árak folyamatos optimalizálásával</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Önálló bejutási rendszer kialakítása, vendégfogadás teljes lebonyolítása</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Házirend, élményprogram-, szolgáltatás- és étteremajánló prospektus összeállítása</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>0–24 órás vendégügyfélszolgálat</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>NTAK adminisztráció és idegenforgalmi adó vezetése</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Vendégek regisztrálása okmányolvasóval</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Számlázás kezelése</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Takarítás megszervezése, fogyóeszközök és tisztálkodószerek folyamatos pótlása</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Karbantartási feladatok elvégzése, szakirányú munkák gyors megszervezése</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Károkozás esetén kárfelmérés, költségtérítési igény benyújtása a szolgáltató platform felé</span>
                </li>
              </ul>
            </div>

            {/* Pro csomag */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-400 dark:border-green-600">
              <h4 className="text-base font-bold text-green-700 dark:text-green-300 mb-3 flex items-center justify-between">
                <span>Pro csomag</span>
                <span className="text-2xl">25%</span>
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3 font-semibold">
                Minden, ami az Alap csomagban, továbbá:
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Hirdetések kezelése több platformon (Szallas.hu, Google Hotels, webes direkt foglalások)</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>CRM rendszer használata a visszatérő vendégkör építésére</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Vendégadatbázis kezelése és szegmentálása</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Marketing promóciók és hírlevelek küldése visszatérő vendégek részére</span>
                </li>
              </ul>
            </div>

            {/* Max csomag */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg border-2 border-purple-500 dark:border-purple-600 shadow-lg">
              <h4 className="text-base font-bold text-purple-700 dark:text-purple-300 mb-3 flex items-center justify-between">
                <span>Max csomag ⭐</span>
                <span className="text-2xl">35%</span>
              </h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-3 font-semibold">
                Minden, ami a Pro csomagban, továbbá:
              </p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span className="font-semibold">Takarítás költsége benne van</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span className="font-semibold">Karbantartási munkák költsége benne van</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Éves klímatisztítás</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Szezononkénti nagytakarítás</span>
                </li>
              </ul>
              <div className="mt-3 bg-purple-100 dark:bg-purple-900/30 p-3 rounded">
                <p className="text-sm text-purple-800 dark:text-purple-200 italic">
                  💡 <strong>Extra:</strong> Idén márciusig szerződött ügyfeleknek mi adjuk a teljes textilezést: paplan, párna, ágynemű – IKEA standard, költséghatékony, bevált. Kb 120e Ft érték.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 10. Indulás menete */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(10)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">10. Indulás menete</span>
            {renderTimer(10)}
          </div>
          {expandedSections[10] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[10] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 space-y-2">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "A folyamat egyszerű:"
            </p>
            <ol className="text-sm text-gray-700 dark:text-gray-300 list-decimal list-inside space-y-1">
              <li>Regisztrációs űrlap + online szerződés</li>
              <li>Kulcsátadás időpontfoglalás (2 kulcs)</li>
              <li>Felmérés: takarítás, karbantartás – ha kell, megcsináljuk</li>
              <li>Fotózás, hirdetés, rendszerek összekötése</li>
            </ol>
            <p className="text-sm text-gray-700 dark:text-gray-300 italic">
              "Általában 3–5 napon belül él a hirdetés, és jöhetnek a vendégek."
            </p>
          </div>
        )}
      </div>

      {/* 11. Bizalomzárás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(11)}
          className="w-full flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">11. Bizalomzárás</span>
            {renderTimer(11)}
          </div>
          {expandedSections[11] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[11] && (
          <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold">
              "Minden hónap 10-éig küldjük az elszámolást, és utaljuk a nyereséget."
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Pont.
            </p>
          </div>
        )}
      </div>

      {/* 12. Zárás */}
      <div className="mb-3">
        <button
          onClick={() => toggleSection(12)}
          className="w-full flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition border-2 border-green-500 dark:border-green-600"
        >
          <div className="flex items-center">
            <span className="font-semibold text-gray-800 dark:text-gray-200">12. Zárás 🎯</span>
            {renderTimer(12)}
          </div>
          {expandedSections[12] ? <ChevronUp /> : <ChevronDown />}
        </button>
        {expandedSections[12] && (
          <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded border-2 border-green-500 dark:border-green-600 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-300 dark:border-green-600">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold mb-2">
                "Akkor foglaljunk időpontot a felmérésre és a kulcsátadásra?"
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                → Naptár ellenőrzése, konkrét dátum és időpont egyeztetése
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-300 dark:border-green-600 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic font-semibold">
                "Küldöm a regisztrációs lapot és a szerződést."
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                → Email cím megerősítése, dokumentumok küldése
              </p>
              <div className="mt-2 pt-2 border-t border-green-200 dark:border-green-700">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Az első havidíjról, ami 12.000 Ft, számlát küldünk. Amint megérkezik az utalás, már mehetünk is tovább az indulással."
                </p>
              </div>
            </div>

            {/* Indulhat a folyamat GOMB */}
            <button
              onClick={async () => {
                console.log('✅ Indulhat a folyamat! gomb kattintva');

                if (!selectedLead) {
                  alert('Kérjük, válasszon ki egy leadet a folyamat indításához!');
                  return;
                }

                try {
                  // Lead státusz frissítése "Folyamatban"-ra
                  await updateLead(selectedLead.id, {
                    ...selectedLead,
                    status: 'folyamatban',
                    lastContactDate: new Date().toISOString().split('T')[0],
                    notes: `${selectedLead.notes || ''}\n\n[${new Date().toLocaleDateString('hu-HU')} ${new Date().toLocaleTimeString('hu-HU')}] ✅ Folyamat indítva - Sales script lezárva`
                  });

                  console.log('✅ Lead státusz frissítve:', selectedLead.name);
                  alert('✅ Lead sikeresen mentve! Státusz: Folyamatban');
                } catch (error) {
                  console.error('❌ Hiba a lead mentésekor:', error);
                  alert('❌ Hiba történt a mentés során!');
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 p-4 rounded-lg text-center shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedLead}
            >
              <p className="text-base font-bold text-white">
                ✅ Indulhat a folyamat!
              </p>
            </button>

            {/* Akció gombok */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  console.log('📄 Szerződés küldése gomb kattintva');

                  if (!selectedLead) {
                    alert('Kérjük, válasszon ki egy leadet a szerződés küldéséhez!');
                    return;
                  }
                  if (!selectedLead.email) {
                    alert('A kiválasztott leadnek nincs email címe!');
                    return;
                  }

                  console.log('📧 Modal megnyitása lead:', selectedLead.name);
                  setShowContractEmailModal(true);
                }}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                disabled={!selectedLead}
              >
                📄 Szerződés küldése
              </button>
              <button
                onClick={() => {
                  console.log('📅 Időpont foglalása gomb kattintva');
                  console.log('🔄 Navigálás /projects oldalra');
                  navigate('/projects');
                }}
                className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition shadow-lg active:scale-95"
              >
                📅 Időpont foglalása
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hívás statisztika kártya */}
      {callStartTime && Object.keys(scriptTimings).length > 0 && (
        <div className="mt-6">
          <CallStatisticsCard
            scriptTimings={scriptTimings}
            scriptSections={scriptSections}
            onFinishCall={handleFinishCall}
          />
        </div>
      )}

      {/* Email modal a szerződés küldéséhez */}
      <SendContractEmailModal
        isOpen={showContractEmailModal}
        onClose={() => setShowContractEmailModal(false)}
        lead={selectedLead}
        onSuccess={async (emailData) => {
          // Lead státusz frissítése "Szerződés elküldve"-re
          if (selectedLead) {
            await updateLead(selectedLead.id, {
              ...selectedLead,
              status: 'szerzodes_kuldve',
              lastContactDate: new Date().toISOString().split('T')[0],
              notes: `${selectedLead.notes || ''}\n\n[${new Date().toLocaleDateString('hu-HU')}] Szerződés elküldve emailben: ${emailData.subject}`
            });
          }

          // TODO: Projekt létrehozása a Projektek modulban
          // Ez később implementálható, amikor a projektek store készen van
        }}
      />
    </div>
  );
};

export default SalesScriptPanel;

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from '../common/Icons';

const SalesWizardScriptPanel = ({ currentStep, isCollapsed, onToggleCollapse, hideHeader = false }) => {
  const [expandedSections, setExpandedSections] = useState(() => {
    // localStorage-ból betöltés
    const saved = localStorage.getItem('salesWizardScriptExpanded');
    return saved ? JSON.parse(saved) : {
      nyitas: true,
      fajdalompont: false,
      techHook: false,
      kvalifikacio: false,
      idopontfoglalas: false,
      beveteliKeretezes: false,
      atlagarMagyarazat: false,
      beveteliRealitas: false,
      szolgaltatasok: false,
      csomagAjanlas: false,
      transzparencia: false,
      softClose: false,
      hardClose: false
    };
  });

  const [selectedTechHook, setSelectedTechHook] = useState('vendeg');

  // localStorage mentés
  useEffect(() => {
    localStorage.setItem('salesWizardScriptExpanded', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Toast lehetne itt, de most csak console
      if (import.meta.env.DEV) {
        console.log('Szöveg másolva:', text);
      }
    });
  };

  const techHooks = {
    vendeg: {
      title: 'Vendég',
      text: '"Nálunk nincs kulcsátadás, minden vendég feliratozott videós útmutatót kap a bejutásról, így nincs éjszakai telefon, nincs kulcspara."'
    },
    bevetel: {
      title: 'Bevétel',
      text: '"Az árakat AI kezeli, eseményeknél automatikusan felmegy, nem marad pénz az asztalon."'
    },
    admin: {
      title: 'Admin',
      text: '"Minden online megy: vendégek, számlázás, NTAK, takarítás, neked nem kell napi szinten benne lenned."'
    }
  };

  // Lépés-specifikus highlight
  const isStepHighlighted = (step) => {
    return currentStep === step;
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="bg-blue-600 text-white p-2 rounded-r-lg shadow-lg hover:bg-blue-700 transition absolute left-0 top-1/2 -translate-y-1/2 z-40"
        aria-label="Script panel megnyitása"
      >
        <ChevronRight />
      </button>
    );
  }

  return (
    <div className={`${hideHeader ? 'w-full' : 'w-80'} bg-white dark:bg-gray-800 ${!hideHeader ? 'border-r border-gray-200 dark:border-gray-700' : ''} flex flex-col h-full overflow-y-auto`}>
      {/* Header */}
      {!hideHeader && (
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <span>📞</span> SCRIPT SEGÉD
            </h3>
            <button
              onClick={onToggleCollapse}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
              aria-label="Script panel összecsukása"
            >
              <ChevronLeft />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {/* Nyitás */}
        <div className={`border rounded-lg ${isStepHighlighted(1) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <button
            onClick={() => toggleSection('nyitas')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Nyitás</span>
            {expandedSections.nyitas ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.nyitas && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                "Szia, [Név] vagyok a Smartproperties Airbnbhosttól, te hagytál meg elérhetőséget lakásüzemeltetéssel kapcsolatban. Most jókor hívlak?"
              </p>
              <button
                onClick={() => copyToClipboard("Szia, [Név] vagyok a Smartproperties Airbnbhosttól, te hagytál meg elérhetőséget lakásüzemeltetéssel kapcsolatban. Most jókor hívlak?")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                📋 Másolás
              </button>
            </div>
          )}
        </div>

        {/* Fájdalompont */}
        <div className={`border rounded-lg ${isStepHighlighted(1) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <button
            onClick={() => toggleSection('fajdalompont')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Fájdalompont</span>
            {expandedSections.fajdalompont ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.fajdalompont && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Most ki kezeli a lakást?"
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Mi benne most a legnagyobb macera?"
              </p>
              <button
                onClick={() => copyToClipboard("Most ki kezeli a lakást?\n\nMi benne most a legnagyobb macera?")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                📋 Másolás
              </button>
            </div>
          )}
        </div>

        {/* Tech hook */}
        <div className={`border rounded-lg ${isStepHighlighted(1) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <button
            onClick={() => toggleSection('techHook')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Tech hook</span>
            {expandedSections.techHook ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.techHook && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2 mb-3">
                {Object.keys(techHooks).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTechHook(key)}
                    className={`px-2 py-1 text-xs rounded transition ${
                      selectedTechHook === key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {techHooks[key].title}
                  </button>
                ))}
              </div>
              <div className="transition-opacity duration-200">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                  {techHooks[selectedTechHook].text}
                </p>
                <button
                  onClick={() => copyToClipboard(techHooks[selectedTechHook].text)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📋 Másolás
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Kvalifikáció */}
        <div className={`border rounded-lg ${isStepHighlighted(1) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <button
            onClick={() => toggleSection('kvalifikacio')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Kvalifikáció</span>
            {expandedSections.kvalifikacio ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.kvalifikacio && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-2">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Hol van a lakás és mekkora?"
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Most hosszú vagy rövid távon megy?"
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                "Mi lenne az a havi nettó, amire azt mondod: ezért már megéri váltani?"
              </p>
              <button
                onClick={() => copyToClipboard("Hol van a lakás és mekkora?\n\nMost hosszú vagy rövid távon megy?\n\nMi lenne az a havi nettó, amire azt mondod: ezért már megéri váltani?")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                📋 Másolás
              </button>
            </div>
          )}
        </div>

        {/* Időpontfoglalás */}
        <div className={`border rounded-lg ${isStepHighlighted(1) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
          <button
            onClick={() => toggleSection('idopontfoglalas')}
            className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
          >
            <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Időpontfoglalás (CTA)</span>
            {expandedSections.idopontfoglalas ? <ChevronUp /> : <ChevronDown />}
          </button>
          {expandedSections.idopontfoglalas && (
            <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                "Pontos számokat csak a lakás alapján lehet mondani. Kimegyek, megnézem, és ott megmondom, mennyit lehet belőle kihozni éves szinten. Mikor jó, inkább hétköznap vagy hétvégén?"
              </p>
              <button
                onClick={() => copyToClipboard("Pontos számokat csak a lakás alapján lehet mondani. Kimegyek, megnézem, és ott megmondom, mennyit lehet belőle kihozni éves szinten. Mikor jó, inkább hétköznap vagy hétvégén?")}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                📋 Másolás
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Bevételi keretezés */}
        {currentStep >= 2 && (
          <div className={`border rounded-lg ${isStepHighlighted(2) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <button
              onClick={() => toggleSection('beveteliKeretezes')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Bevételi keretezés</span>
              {expandedSections.beveteliKeretezes ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.beveteliKeretezes && (
              <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Ez vállalkozásként működik, nem fix bérleti díj. Mindig éves bevételben és átlagárban gondolkodunk, nem egy-egy erős vagy gyenge hónap alapján."
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Az appban látni fogod a teljes bevétel-költség ténytáblát, ott lehet valódi eredményt vizsgálni."
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "A teljes költség jellemzően kb 45%, ami marad, az a tiéd."
                </p>
                <button
                  onClick={() => copyToClipboard("Ez vállalkozásként működik, nem fix bérleti díj. Mindig éves bevételben és átlagárban gondolkodunk, nem egy-egy erős vagy gyenge hónap alapján.\n\nAz appban látni fogod a teljes bevétel-költség ténytáblát, ott lehet valódi eredményt vizsgálni.\n\nA teljes költség jellemzően kb 45%, ami marad, az a tiéd.")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📋 Másolás
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Átlagár magyarázat */}
        {currentStep >= 2 && (
          <div className={`border rounded-lg ${isStepHighlighted(2) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <button
              onClick={() => toggleSection('atlagarMagyarazat')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Átlagár magyarázat</span>
              {expandedSections.atlagarMagyarazat ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.atlagarMagyarazat && (
              <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  "Ahhoz hogy ez a bevétel meglegyen, 75%-os foglaltságnál kb. [X] forint, azaz [Y] eurós átlagárat kell elérnünk éjszakánként. Ez egy átlag - nyáron és eseményeknél magasabb, januárban alacsonyabb. A dinamikus árazás ezt automatikusan kezeli. A takarítási díj ezen felül megy, azt külön fizeti a vendég minden foglalásnál."
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <strong>Megjegyzés:</strong> A [X] és [Y] értékeket a "Szükséges beállítások" szekcióból másold be.
                </p>
                <button
                  onClick={() => copyToClipboard("Ahhoz hogy ez a bevétel meglegyen, 75%-os foglaltságnál kb. [X] forint, azaz [Y] eurós átlagárat kell elérnünk éjszakánként. Ez egy átlag - nyáron és eseményeknél magasabb, januárban alacsonyabb. A dinamikus árazás ezt automatikusan kezeli. A takarítási díj ezen felül megy, azt külön fizeti a vendég minden foglalásnál.")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📋 Másolás
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Bevételi realitás visszajelzés */}
        {currentStep >= 2 && (
          <div className={`border rounded-lg ${isStepHighlighted(2) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <button
              onClick={() => toggleSection('beveteliRealitas')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Bevételi realitás visszajelzés</span>
              {expandedSections.beveteliRealitas ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.beveteliRealitas && (
              <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">✅ Elérhető cél esetén:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Nagyszerű hír! Az Ön által megadott [X] Ft-os havi cél reálisan elérhető ezzel az ingatlannal. A piaci adatok és a lokáció alapján a várható bevétel akár [Y] Ft is lehet havonta optimális működés mellett."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">⚠️ Kihívás esetén:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "A [X] Ft-os cél ambiciózus, de elérhető. Ehhez a prémium árkategóriát és magas foglaltságot kell megcéloznunk. Profi fotók, kiváló értékelések és dinamikus árazás segíthet."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">❌ Irreális cél esetén:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Őszintén meg kell mondanom, hogy a [X] Ft-os havi elvárás meghaladja az ingatlan piaci potenciálját. A reális tartomány [MIN] - [MAX] Ft között van. Két lehetőségünk van: (1) módosítjuk a célt, vagy (2) megnézzük, milyen fejlesztésekkel lehetne növelni az értéket."
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <strong>Megjegyzés:</strong> A [X], [Y], [MIN], [MAX] értékeket a "Bevételi realitás check" szekcióból másold be.
                </p>
                <button
                  onClick={() => copyToClipboard("Nagyszerű hír! Az Ön által megadott [X] Ft-os havi cél reálisan elérhető ezzel az ingatlannal. A piaci adatok és a lokáció alapján a várható bevétel akár [Y] Ft is lehet havonta optimális működés mellett.\n\n⚠️ Kihívás: A [X] Ft-os cél ambiciózus, de elérhető. Ehhez a prémium árkategóriát és magas foglaltságot kell megcéloznunk.\n\n❌ Irreális: A [X] Ft-os havi elvárás meghaladja az ingatlan piaci potenciálját. A reális tartomány [MIN] - [MAX] Ft között van.")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  📋 Másolás
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Szolgáltatások */}
        {currentStep >= 3 && (
          <div className={`border rounded-lg ${isStepHighlighted(3) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <button
              onClick={() => toggleSection('szolgaltatasok')}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
            >
              <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Szolgáltatások</span>
              {expandedSections.szolgaltatasok ? <ChevronUp /> : <ChevronDown />}
            </button>
            {expandedSections.szolgaltatasok && (
              <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Feliratozott videós bejutás:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "A feliratozott videós bejutás mindenképp benne van, ez alap. Így készülünk a vendégekre - nincs személyes kulcsátadás, nincs éjszakai hívás."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Egyszeri költségek:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Okoszár: 80-150 ezer forint, beszereléssel, garanciával."
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Fotózás: 35 ezer forint."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Textilek:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Az ágyneműk és textilek az induló emailben lesznek listázva, IKEA szettekkel dolgozunk."
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Karbantartás:</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Minden karbantartás előtt árajánlatot küldünk jóváhagyásra, csak utána csináljuk."
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Csomag ajánlás */}
        {currentStep >= 4 && (
          <>
            <div className={`border rounded-lg ${isStepHighlighted(4) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <button
                onClick={() => toggleSection('csomagAjanlas')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Csomag ajánlás</span>
                {expandedSections.csomagAjanlas ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.csomagAjanlas && (
                <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ha árérzékeny:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "A legtöbben az Alap 20%-kal indulnak, minden működik, te csak a bevételt látod."
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ha prémium gondolkodás:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "A Pro 25%-nál már visszatérő vendégek és direkt foglalás is épül."
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Ha teljesen passzív:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                      "A Max 35% gyakorlatilag full passzív, még a takarítás és karbantartás is menedzselt."
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Transzparencia */}
            <div className={`border rounded-lg ${isStepHighlighted(4) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <button
                onClick={() => toggleSection('transzparencia')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Transzparencia - bizalmi blokk</span>
                {expandedSections.transzparencia ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.transzparencia && (
                <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700 space-y-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Teljes naptárhozzáférést kapsz, bármikor látod mikor mi történik."
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Ha üres a lakás, bármikor bemehetsz."
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "Az összes adózást és jelentést mi intézzük."
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                    "A nyereséget minden hónap 10-éig utaljuk, bérleti díj jogcímen."
                  </p>
                </div>
              )}
            </div>

            {/* Soft close */}
            <div className={`border rounded-lg ${isStepHighlighted(4) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <button
                onClick={() => toggleSection('softClose')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Soft close</span>
                {expandedSections.softClose ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.softClose && (
                <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                    "Ez így mennyire fér bele abba, amit elképzeltél?"
                  </p>
                  <button
                    onClick={() => copyToClipboard("Ez így mennyire fér bele abba, amit elképzeltél?")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📋 Másolás
                  </button>
                </div>
              )}
            </div>

            {/* Hard close */}
            <div className={`border rounded-lg ${isStepHighlighted(4) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
              <button
                onClick={() => toggleSection('hardClose')}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition rounded-t-lg"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-200">▼ Hard close</span>
                {expandedSections.hardClose ? <ChevronUp /> : <ChevronDown />}
              </button>
              {expandedSections.hardClose && (
                <div className="p-3 pt-0 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic mb-2">
                    "Ha oké, akkor a következő lépés, hogy lefotózzuk, felrakjuk a hirdetéseket és elindítjuk. Szerződést most csináljuk meg, vagy küldjem át ma emailben?"
                  </p>
                  <button
                    onClick={() => copyToClipboard("Ha oké, akkor a következő lépés, hogy lefotózzuk, felrakjuk a hirdetéseket és elindítjuk. Szerződést most csináljuk meg, vagy küldjem át ma emailben?")}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    📋 Másolás
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesWizardScriptPanel;

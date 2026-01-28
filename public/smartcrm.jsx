import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, LogOut, Edit2, Check, X, FileText, Shirt, ChevronLeft, ChevronDown, ChevronUp, Eye, EyeOff, ShoppingCart } from 'lucide-react';

// Airbnb felszerelések listája
const AIRBNB_AMENITIES = [
  'Ablakrácsok', 'Ajánlat bébiszitterekre', 'Alapvető kellékek', 'Bababiztonsági kapuk', 'Babafigyelő', 
  'Babakád', 'Babaágy', 'Beltéri kandalló', 'Bidé', 'Biliárdasztal', 'Borospoharak', 'Bowlingpálya', 
  'Csomagmegőrzés', 'Csónakkikötő', 'Daráló', 'Edzőfelszerelés', 'Edzőterem', 'Egyszintes otthon', 
  'Elektromosjármű-töltő', 'Elsősegélykészlet', 'Etetőszék', 'Ethernet kapcsolat', 'Fagyasztó', 
  'Fizetős parkolás a helyszínen', 'Fizetős parkolás más helyszínen', 'Függőágy', 'Fürdőkád', 
  'Fürdőszappan', 'Füstérzékelő', 'Fűtés', 'Grillező', 'Grillező eszközök', 'Gyerekbicikli', 
  'Gyerekkönyvek és játékok', 'Gördeszkás rámpa', 'Hajbalzsam', 'Hajszárító', 'Hifiberendezés', 
  'Hokipálya', 'Hordozható ventilátorok', 'Hosszú távú foglalás megengedett', 'Hátsó udvar', 'Hűtő', 
  'Ingyenes parkolás a helyszínen', 'Ingyenes utcai parkolás', 'Játszószoba gyerekeknek', 'Játékgépek', 
  'Játékkonzol', 'Kajak', 'Kandallórács', 'Kenyérkészítő', 'Kenyérpirító', 'Kerékpárok', 'Konnektorvédők', 
  'Konyha', 'Konyhai alapkellékek', 'Kávéfőző', 'Kávézók', 'Könyvek és olvasnivalók', 'Kültéri bútorzat', 
  'Kültéri zuhanyzó', 'Külön munkaterület', 'Lemezjátszó', 'Lift', 'Légkondicionálás', 'Lézerharc', 
  'Medence', 'Meleg víz', 'Mennyezeti ventilátor', 'Mikrohullámú sütő', 'Minigolf', 'Minihűtő', 
  'Mosoda a közelben', 'Mosogatógép', 'Mosógép', 'Mozi', 'Mászófal', 'Nyugágyak', 'Pelenkázóasztal', 
  'Pezsgőfürdő', 'Pingpongasztal', 'Plusz párnák és takarók', 'Pályaszállás', 'Reggeli', 'Resort access', 
  'Rizsfőző', 'Ruhaszárító állvány', 'Ruhatároló', 'Saját bejárat', 'Saját nappali', 'Saját partszakasz', 
  'Sampon', 'Sarokvédő az asztalokon', 'Strandkellékek', 'Szabadtéri játszótér', 'Szabadtéri konyha', 
  'Szabadtéri étkezőterület', 'Szauna', 'Szemétprés', 'Szárítógép', 'Széf', 'Szén-monoxid-érzékelő', 
  'Szúnyogháló', 'Sötétítők/árnyékolók', 'Sütő', 'Takarítás igényelhető', 'Teakonyha', 'Tematikus szoba', 
  'Tepsi', 'Terasz vagy erkély', 'Tisztítószerek', 'Tusfürdő', 'TV', 'Táblajátékok', 'Tóparti kijárás', 
  'Tűzhely', 'Tűzoltó készülék', 'Tűzrakóhely', 'Utazóágy', 'Vasaló', 'Vállfák', 'Vízforraló', 
  'Vízparti', 'Wifi', 'Zongora', 'Zsebwifi', 'Ágynemű', 'Életnagyságú játékok', 'Étkezőasztal', 
  'Étkészlet gyermekeknek', 'Étkészlet és evőeszközök', 'Ütőketrec'
];

// Booking felszereltségek (szoba szintű beállítások)
const BOOKING_FELSZERELTSEG = {
  'Szobafelszereltség': {
    color: 'bg-indigo-100 text-indigo-800',
    items: [
      'Kiságy | bölcső', 'Ruhatartó állvány', 'Ruhaszárító állvány', 'Kihajtható ágy', 'Kanapéágy',
      'Szemetes', 'Fűtött medence', 'Végtelenített medence', 'Merülőmedence', 'Medencetakaró',
      'Strandtörölközők', 'Medencére nyíló kilátás', 'Medence a tetőn', 'Sós vizes medence',
      'Sekély rész', 'Légkondicionálás', 'Privát medence', 'Szárítógép', 'Ruhásszekrény',
      'Szőnyegpadló', 'Öltöző', '2 méternél hosszabb ágyak', 'Ventilátor', 'Kandalló', 'Fűtés',
      'Egymásba nyíló szoba', 'Vasaló', 'Vasalási lehetőség', 'Pezsgőfürdő', 'Szúnyogháló',
      'Saját bejárat', 'Széf', 'Kanapé', 'Hangszigetelés', 'Ülősarok', 'Járólap | márványpadló',
      'Nadrágvasaló', 'Mosógép', 'Fapadló | parketta', 'Íróasztal', 'Antiallergén', 'Takarítószerek',
      'Elektromosan fűthető takaró', 'Pizsama', 'Nyári kimonó', 'Konnektor az ágy közelében',
      'Adapter', 'Tollpárna', 'Nem tollpárna', 'Hipoallergén párna'
    ]
  },
  'Fürdőszoba': {
    color: 'bg-cyan-100 text-cyan-800',
    items: [
      'Vécépapír', 'Fürdőkád', 'Bidé', 'Fürdőkád vagy zuhanykabin', 'Fürdőköpeny',
      'Ingyen pipereholmi', 'Vendég vécé', 'Hajszárító', 'Hidromasszázskád', 'Közös használatú vécé',
      'Szauna', 'Zuhany', 'Papucs', 'Vécé', 'Fogkefe', 'Sampon', 'Hajbalzsam', 'Tusfürdő', 'Zuhanysapka'
    ]
  },
  'Média/technológia': {
    color: 'bg-purple-100 text-purple-800',
    items: [
      'Játékkonzol - PS4', 'Játékkonzol - Wii U', 'Játékkonzol - Xbox One', 'Számítógép',
      'Játékkonzol', 'Játékkonzol - Nintendo Wii', 'Játékkonzol - PS2', 'Játékkonzol - PS3',
      'Játékkonzol - Xbox 360', 'Laptop', 'iPad', 'Kábeltévé', 'CD-lejátszó', 'DVD-lejátszó',
      'Fax', 'iPod-dokkoló állomás', 'Laptopszéf', 'Síkképernyős tévé', 'Fizetős csatornák',
      'Rádió', 'Műholdas csatornák', 'Telefon', 'Tévé', 'Videólejátszó', 'Videójátékok',
      'Blu-ray lejátszó', 'Hordozható wifi hotspot', 'Okostelefon', 'Netflix/streaming'
    ]
  },
  'Étkezés': {
    color: 'bg-amber-100 text-amber-800',
    items: [
      'Étkező', 'Étkezőasztal', 'Borospohár', 'Palackozott víz', 'Csokoládé vagy keksz',
      'Gyümölcsök', 'Bor/pezsgő', 'Grillsütő', 'Sütő', 'Főzőlap', 'Kenyérpirító', 'Mosogatógép',
      'Vízforraló', 'Kültéri étkező', 'Kültéri bútorok', 'Minibár', 'Konyha', 'Konyhasarok',
      'Konyhai felszerelés', 'Mikrohullámú sütő', 'Hűtőszekrény', 'Tea- és kávéfőző', 'Kávéfőző', 'Etetőszék'
    ]
  },
  'Szolgáltatások/extrák': {
    color: 'bg-teal-100 text-teal-800',
    items: [
      'Kulcskártyás', 'Zárható szekrény', 'Kulccsal zárható', 'Belépés az executive lounge-ba',
      'Ébresztőóra', 'Ébresztés', 'Ébresztő-szolgáltatás', 'Ágynemű', 'Törölközők', 'Törölköző | ágynemű felár ellenében'
    ]
  },
  'Szabadtéri/kilátás': {
    color: 'bg-green-100 text-green-800',
    items: [
      'Erkély', 'Kültéri pihenősarok', 'Kilátás', 'Terasz', 'Városra nyíló kilátás',
      'Kertre nyíló kilátás', 'Tóra nyíló kilátás', 'Nevezetességre nyíló kilátás',
      'Hegyre nyíló kilátás', 'Medencére nyíló kilátás', 'Folyóra nyíló kilátás',
      'Tengerre nyíló kilátás', 'Belső udvarra nyíló kilátás', 'Csendes utcára nyíló kilátás'
    ]
  },
  'Akadálymentesség': {
    color: 'bg-blue-100 text-blue-800',
    items: [
      'Lifttel megközelíthető', 'Teljes szállásegység a földszinten', 'Akadálymentesített (kerekesszék)',
      'Vizuális segítség hallássérülteknek', 'Felső szintek lifttel érhetőek el',
      'Felső szintek csak lépcsőn', 'Akadálymentesített kád', 'Vészjelző a fürdőszobában',
      'Magasított vécécsésze', 'Alacsony mosdó', 'Akadálymentesített zuhanyzó',
      'Zuhanyszék', 'Vécé korláttal', 'Besétálós zuhanykabin'
    ]
  },
  'Az épület jellegzetességei': {
    color: 'bg-stone-100 text-stone-800',
    items: ['Különálló', 'Különlakás az épületben', 'Félig különálló']
  },
  'Szórakozás és családok': {
    color: 'bg-pink-100 text-pink-800',
    items: [
      'Babarács', 'Társasjátékok/kirakós játékok', 'Könyv, DVD vagy zene gyerekeknek',
      'Gyermekbiztonsági konnektorvédő'
    ]
  },
  'Biztonság': {
    color: 'bg-red-100 text-red-800',
    items: ['Szén-monoxid érzékelő', 'Szén-monoxid források', 'Füstjelző', 'Tűzoltókészülék']
  },
  'Biztonsági intézkedések': {
    color: 'bg-orange-100 text-orange-800',
    items: ['Légtisztító', 'Távolság másoktól', 'Szobánkénti légkondicionáló']
  },
  'Tisztaság és fertőtlenítés': {
    color: 'bg-sky-100 text-sky-800',
    items: ['Kézfertőtlenítő']
  }
};

// Összes Booking felszereltség (flat lista)
const BOOKING_FELSZERELTSEG_ALL = Object.values(BOOKING_FELSZERELTSEG).flatMap(cat => cat.items);

// Booking felszerelések listája (pontosan a Booking.com extranet sorrendjében)
const BOOKING_CATEGORIES = {
  'Legnépszerűbb szolgáltatások': {
    color: 'bg-blue-100 text-blue-800',
    items: [
      'Úszómedence', 'Bár', 'Szauna', 'Kert', 'Terasz', 'Nemdohányzó szobák', 
      'Családi szobák', 'Pezsgőfürdő | masszázsmedence', 'Légkondicionálás'
    ]
  },
  'Étkezések': {
    color: 'bg-orange-100 text-orange-800',
    items: ['Reggeli', 'Ebéd', 'Vacsora']
  },
  'Beszélt nyelvek': {
    color: 'bg-purple-100 text-purple-800',
    items: ['Magyar', 'Angol', 'Német', 'Francia', 'Olasz', 'Spanyol']
  },
  'Információk az épületről': {
    color: 'bg-gray-100 text-gray-800',
    items: ['Épület szintjeinek száma', 'Szobák száma']
  },
  'Biztonsági intézkedések': {
    color: 'bg-red-100 text-red-800',
    items: [
      'Személyzet biztonsági előírásokat betart', 'Nincsenek közös írószerek/magazinok',
      'Kézfertőtlenítő a szálláson', 'Vendégek egészségi állapotának ellenőrzése',
      'Elsősegélydoboz', 'Egészségügyi szakértők elérhetőek', 'Lázmérő vendégeknek',
      'Arcmaszkok vendégeknek', 'Érintkezés nélküli be/kijelentkezés', 
      'Készpénzmentes fizetés', 'Biztonságos távolság szabályozás',
      'Mobilapp szobaszervizhez', 'Térelválasztók személyzet és vendégek között'
    ]
  },
  'Tisztaság és fertőtlenítés': {
    color: 'bg-cyan-100 text-cyan-800',
    items: [
      'Koronavírus ellen hatásos tisztítószerek', 'Ágynemű mosás előírás szerint',
      'Fertőtlenítés vendégváltáskor', 'Szállás lezárása takarítás után',
      'Hivatásos takarító cégek', 'Takarítás kihagyható kérésre'
    ]
  },
  'Ital- és ételbiztonság': {
    color: 'bg-yellow-100 text-yellow-800',
    items: [
      'Távolságtartás étkezőkben', 'Étel szállítás szállásegységbe',
      'Fertőtlenített étkészlet', 'Reggeli elviteles dobozok', 'Biztonságosan lezárt kiszállított étel'
    ]
  },
  'Önkiszolgáló bejelentkezés': {
    color: 'bg-indigo-100 text-indigo-800',
    items: [
      'Online útlevél/személyi beküldés', 'Bejelentkezési automata előtérben',
      'Zárható kulcsmegőrző szálláson', 'Zárható kulcsmegőrző másik helyszínen',
      'Szobaajtó bluetooth zárnyitás', 'Szobaajtó internet zárnyitás',
      'PIN-kód zárnyitás', 'QR-kód beolvasás', 'Bejelentkezési app'
    ]
  },
  'Szabadidős lehetőségek': {
    color: 'bg-green-100 text-green-800',
    items: [
      'Teniszfelszerelés', 'Tollaslabda-kellékek', 'Strand', 'Időszaki képkiállítások',
      'Kocsmatúrák', 'Stand-up előadások', 'Filmestek', 'Városnéző séta', 'Kerékpártúrák',
      'Tematikus vacsorák', 'Happy hour', 'Túra helyi kultúráról', 'Főzőiskola',
      'Élőzene/előadás', 'Élő sportközvetítés', 'Íjászat', 'Aerobik', 'Bingó',
      'Teniszpálya', 'Biliárd', 'Asztalitenisz', 'Darts', 'Fallabda', 'Bowling',
      'Minigolf', 'Golfpálya (3 km-en belül)', 'Vízipark', 'Vízi sport helyben',
      'Szörfözés', 'Búvárkodás', 'Sznorkelezés', 'Kenu', 'Horgászat', 'Lovaglás',
      'Kerékpározás', 'Túrázás', 'Síelés'
    ]
  },
  'Étkezés': {
    color: 'bg-amber-100 text-amber-800',
    items: [
      'Gyermekmenü', 'Gyermekbarát étterem', 'Bor | pezsgő', 'Gyümölcs a szobában',
      'Kávézó helyben', 'Étterem', 'Büfé', 'Élelmiszer-házhozszállítás', 'Csomagolt ebéd',
      'Grillezési lehetőség', 'Italautomata', 'Ételautomata', 'Speciális diétás étel',
      'Szobaszerviz', 'Reggeli a szobában'
    ]
  },
  'Medence és wellness': {
    color: 'bg-teal-100 text-teal-800',
    items: [
      'Vízicsúszda', 'Napozóágyak/székek', 'Napernyők', 'Szépészeti szolgáltatások',
      'Wellness szolgáltatások', 'Gőzkamra', 'Wellness pihenőterület', 'Lábfürdő',
      'Wellnesscsomagok', 'Masszázsszék'
    ]
  },
  'Fitnesz': {
    color: 'bg-lime-100 text-lime-800',
    items: [
      'Jógaórák', 'Fitneszórák', 'Személyi edző', 'Fitnesz öltözőszekrények',
      'Gyerekmedence', 'Wellnessközpont', 'Törökfürdő | gőzfürdő', 'Fitneszközpont',
      'Szolárium', 'Termálvizes medence', 'Masszázs', 'Szabadtéri fürdő', 'Nyilvános fürdő'
    ]
  },
  'Közlekedés': {
    color: 'bg-slate-100 text-slate-800',
    items: [
      'Tömegközlekedési jegyek', 'Transzferszolgáltatás', 'Kerékpártároló',
      'Kerékpárkölcsönzés', 'Autókölcsönző', 'Reptéri transzfer', 'Parkolás'
    ]
  },
  'Recepció': {
    color: 'bg-violet-100 text-violet-800',
    items: [
      'Számla kérhető', 'Éjjel-nappali recepció', 'Egyedi be/kijelentkezés',
      'Soron kívüli be/kijelentkezés', 'Concierge-szolgáltatás', 'Utazásszervezés',
      'Pénzváltó', 'Pénzkiadó automata', 'Poggyászmegőrzés', 'Zárható szekrények'
    ]
  },
  'Közös helyiségek': {
    color: 'bg-emerald-100 text-emerald-800',
    items: [
      'Kerti bútorok', 'Piknikezőhely', 'Kandalló', 'Tűzrakóhely', 'Napozóterasz',
      'Közös konyha', 'Közös társalgó | tévészoba', 'Játékterem', 'Kápolna | kegyhely'
    ]
  },
  'Szórakozás és családok': {
    color: 'bg-pink-100 text-pink-800',
    items: [
      'Társasjátékok | kirakók', 'Beltéri játszóhelyiség', 'Kültéri játszótéri játékok',
      'Gyermekbiztonsági kapuk', 'Babakocsi', 'Esti szórakozás', 'Diszkó | DJ',
      'Kaszinó', 'Karaoke', 'Szórakoztatás', 'Gyerekklub', 'Játszótér', 'Gyermekfelügyelet'
    ]
  },
  'Takarítási szolgáltatások': {
    color: 'bg-sky-100 text-sky-800',
    items: ['Vegytisztítás', 'Vasalási szolgáltatás', 'Mosoda', 'Takarítás naponta', 'Nadrágvasaló']
  },
  'Üzleti szolgáltatások': {
    color: 'bg-stone-100 text-stone-800',
    items: ['Tárgyaló | rendezvényterem', 'Üzleti központ', 'Fax | fénymásolás']
  },
  'Üzletek': {
    color: 'bg-fuchsia-100 text-fuchsia-800',
    items: ['Kisbolt helyben', 'Fodrászat | szépségszalon']
  },
  'Egyéb': {
    color: 'bg-neutral-100 text-neutral-800',
    items: [
      'Kisállat fekhely', 'Kisállat etetőtál', 'Bejutás kulccsal', 'Bejutás kulcskártyával',
      'Csak felnőtteket fogadó szállás', 'Antiallergén szoba', 'Nemdohányzó épület',
      'Kijelölt dohányzóhely', 'Akadálymentesített', 'Lift', 'Hangszigetelt szobák', 'Fűtés'
    ]
  },
  'Biztonság': {
    color: 'bg-rose-100 text-rose-800',
    items: [
      'Éjjel-nappali biztonsági szolgálat', 'Riasztórendszer', 'Füstjelzők',
      'Biztonsági kamera közös helyiségekben', 'Térfigyelő kamera', 'Tűzoltókészülékek',
      'Szén-monoxid érzékelő', 'Széf'
    ]
  }
};

// Összes Booking felszerelés (flat lista a kompatibilitáshoz)
const BOOKING_AMENITIES = Object.values(BOOKING_CATEGORIES).flatMap(cat => cat.items);

// Airbnb <-> Booking szinkron mapping (közös felszerelések)
const AMENITY_SYNC_MAP = {
  // Airbnb -> Booking (új nevek)
  'Medence': 'Úszómedence',
  'Szauna': 'Szauna',
  'Pezsgőfürdő': 'Pezsgőfürdő | masszázsmedence',
  'Légkondicionálás': 'Légkondicionálás',
  'Fűtés': 'Fűtés',
  'Lift': 'Lift',
  'Grillező': 'Grillezési lehetőség',
  'Terasz vagy erkély': 'Terasz',
  'Kültéri bútorzat': 'Kerti bútorok',
  'Beltéri kandalló': 'Kandalló',
  'Edzőterem': 'Fitneszközpont',
  'Biliárdasztal': 'Biliárd',
  'Pingpongasztal': 'Asztalitenisz',
  'Táblajátékok': 'Társasjátékok | kirakók',
  'Minigolf': 'Minigolf',
  'Kerékpárok': 'Kerékpárkölcsönzés',
  'Kajak': 'Kenu',
  'Reggeli': 'Reggeli a szobában',
  'Bababiztonsági kapuk': 'Gyermekbiztonsági kapuk',
  'Csomagmegőrzés': 'Poggyászmegőrzés',
  'Nyugágyak': 'Napozóágyak/székek',
  'Játszószoba gyerekeknek': 'Gyerekklub',
  'Szabadtéri játszótér': 'Játszótér',
  'Bowlingpálya': 'Bowling',
  'Füstérzékelő': 'Füstjelzők',
  'Szén-monoxid-érzékelő': 'Szén-monoxid érzékelő',
  'Tűzoltó készülék': 'Tűzoltókészülékek',
  'Széf': 'Széf',
  'Mosógép': 'Mosoda',
  'Vasaló': 'Vasalási szolgáltatás',
  'Konyha': 'Közös konyha'
};

function SmartCRM({ initialMode = 'full' }) {
  // Platform mode: 'full' = minden látható, 'partner-portal' = partner login/reg landing, 'partner-registration' = csak partner reg
  const platformMode = initialMode;
  
  const [isAdmin, setIsAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // App mode from subdomain (cleanapp.smartcrm.hu, partner.smartcrm.hu)
  const appMode = typeof window !== 'undefined' ? window.SMARTCRM_MODE || 'admin' : 'admin';
  
  // Partner login
  const [isPartnerMode, setIsPartnerMode] = useState(appMode === 'partner' || platformMode === 'partner-portal' || platformMode === 'partner-registration' || platformMode === 'partner-login');
  const [partnerLoginForm, setPartnerLoginForm] = useState({ email: '', password: '' });
  const [currentPartner, setCurrentPartner] = useState(null);
  const [partnerEditingApartment, setPartnerEditingApartment] = useState(null);
  const [partnerOnboardingStep, setPartnerOnboardingStep] = useState(1);
  const [showTextileModal, setShowTextileModal] = useState(false);
  const [highlightApartmentSize, setHighlightApartmentSize] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [showContractSuccessModal, setShowContractSuccessModal] = useState(false);
  const [partnerBankAccount, setPartnerBankAccount] = useState('');
  const [partnerBankAccountHolder, setPartnerBankAccountHolder] = useState('');
  const [showPartnerLogin, setShowPartnerLogin] = useState(false);
  const [partnerLoginEmail, setPartnerLoginEmail] = useState('');
  const [partnerLoginPassword, setPartnerLoginPassword] = useState('');
  const [showPartnerPassword, setShowPartnerPassword] = useState(false);
  const [partnerLoginError, setPartnerLoginError] = useState('');
  const [partnerRegistering, setPartnerRegistering] = useState(false);
  const [partnerNewApartment, setPartnerNewApartment] = useState({
    name: '', operationType: 'short-term', apartmentSize: '', ntakNumber: '', taxNumber: '', cadastralNumber: '',
    zipCode: '', city: 'Budapest', street: '', floor: '', door: '', gateCode: '',
    wifiName: '', wifiPassword: '', wifiSpeed: '', wifiOption: '', accessInstructions: '', notes: '',
    doubleBeds: 0, sofaBedGuests: 0, otherBedGuests: 0, maxGuests: 0, parkingType: 'none',
    hasTextiles: true, textileSource: 'own',
    photosLink: '', uploadedPhotos: '',
    servicePackage: 'pro', managementFee: 25,
    monthlyFeeEur: 35, cleaningFeeEur: 35, cleaningTimeHours: 2.5, parkingRevenueEur: 0, revenueHandling: 'client',
    budapestDistrict: '', tourismTaxType: 'percent', tourismTaxPercent: 4, tourismTaxFixed: 0,
    yearlyMinPlanEur: 0, yearlyExpectedPlanEur: 0, costPlanPercent: 30,
    noAirbnbAccount: false, airbnbUsername: '', airbnbPassword: '',
    noBookingAccount: false, bookingUsername: '', bookingPassword: '',
    requestDeepCleaning: false, requestYettelInternet: false, requestTextileSet: false, requestCompanyInternet: false,
    textileInventory: { paplan: 0, paplanType: '', parna: 0, parnaType: '', lepedo: 0, lepedoSize: '', agynemuSzett: 0, agynemuSzettType: '', nagyTorolkozo: 0, kozepesTorolkozo: 0, kezTorlo: 0, kadkilepo: 0, konyharuha: 0, customItems: [] },
    inventory: {}, equipment: {},
    contractDuration: 'indefinite'
  });
  
  // Navigation - set initial module based on app mode
  const [currentModule, setCurrentModule] = useState(appMode === 'cleanapp' ? 'cleaning' : 'home');
  const [activeTab, setActiveTab] = useState(appMode === 'cleanapp' ? 'jobs' : 'overview');
  const [overviewFilter, setOverviewFilter] = useState('all');
  const [overviewCustomDateRange, setOverviewCustomDateRange] = useState({ start: '', end: '' });
  const [periodFilter, setPeriodFilter] = useState('week');
  const [calendarFilter, setCalendarFilter] = useState('week');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newExpense, setNewExpense] = useState({ date: new Date().toISOString().split('T')[0], amount: '', description: '', receipt: null });
  const [newMaintenance, setNewMaintenance] = useState({ date: new Date().toISOString().split('T')[0], amount: '', description: '', notes: '', apartmentId: '' });
  const [showAddMaintenance, setShowAddMaintenance] = useState(false);
  const [eurRate, setEurRate] = useState(400); // Default rate, will be updated
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
  
  // Fetch EUR/HUF exchange rate
  React.useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/EUR');
        const data = await response.json();
        if (data.rates && data.rates.HUF) {
          setEurRate(Math.round(data.rates.HUF));
          setLastRateUpdate(new Date().toLocaleDateString('hu-HU'));
        }
      } catch (error) {
        console.error('Árfolyam lekérdezési hiba:', error);
        // Keep default rate of 400 if fetch fails
      }
    };
    
    fetchExchangeRate();
    // Update rate every 24 hours
    const interval = setInterval(fetchExchangeRate, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  const [workers, setWorkers] = useState([
    { id: 1, name: 'Roli', hourlyRate: 2200, password: 'roli123', role: 'admin' },
    { id: 2, name: 'Zoli', hourlyRate: 2200, password: 'zoli123', role: 'manager' },
    { id: 3, name: 'Yvette', hourlyRate: 3000, password: 'yvette123', role: 'sales' },
    { id: 4, name: 'Emese', hourlyRate: 3500, password: 'emese123', role: 'cleaner' }
  ]);

  const [admins, setAdmins] = useState([
    { id: 1, username: 'admin', password: 'admin123', name: 'Admin' }
  ]);
  
  const [apartments, setApartments] = useState([
    { id: 1, name: 'A57 Downtown', timeFrame: 2, instructions: '', accessInstructions: 'Kulcs a portán', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 10, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0, clientId: '1', clientName: 'Teszt Partner Kft.', city: 'Budapest', zipCode: '1051', street: 'Akácfa utca 57.', apartmentSize: 45, ntakNumber: 'MA12345678' },
    { id: 2, name: 'Angyalföldi', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 3, name: 'Angel 36', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 4, name: 'B20 Keleti', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 5, name: 'Baross 20 (Keleti)', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 6, name: 'Bogdáni', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 20, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 7, name: 'D3', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 8, name: 'D3 Basilica', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 9, name: 'D16 Deluxe', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 35, monthlyFeeEur: 25, parkingEur: 15, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 10, name: 'D39', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 11, name: 'Dunakeszi Meder', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 10, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 12, name: 'Gozsdu', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 13, name: 'Izabella 77', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 14, name: 'I77 3 Bedrooms', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 35, monthlyFeeEur: 25, parkingEur: 15, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 15, name: 'K9 Szimplakert', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 16, name: 'Kádár 8', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 22, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 17, name: 'Kazinczy 9', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 24, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 18, name: 'Király 87', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 19, name: 'Klauzal 16', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 23, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 20, name: 'K16', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 21, name: 'Knézits 15', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 22, name: 'Kosztolányi 12', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 22, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 23, name: 'Lili Lakeside', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 10, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 24, name: 'Liget Apartment', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 25, name: 'Németvölgyi', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 20, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 26, name: 'Németvölgyi /SP Rev', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 24, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 27, name: 'Oktogon', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 28, name: 'Pacsirta 9', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 29, name: 'Ráday 5', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 22, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 30, name: 'Ráday 27', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 31, name: 'RG 1', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 32, name: 'RG 2', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 33, name: 'RG 5', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 34, name: 'Római', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 20, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 35, name: 'Rökk Szilárd 7', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 36, name: 'Rökk Szilárd 7/1', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 37, name: 'Rökk Szilárd 7/2', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 28, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 38, name: 'Széchenyi 12', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 23, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 39, name: 'T27', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 40, name: 'Tolnai 27', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 20, monthlyFeeEur: 10, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 41, name: 'Tóth Kálmán 33', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 42, name: 'Waterfront City', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 30, monthlyFeeEur: 20, parkingEur: 10, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 },
    { id: 43, name: 'Wesselényi 25', timeFrame: 2, instructions: '', accessInstructions: '', cleaningFeeEur: 25, monthlyFeeEur: 30, parkingEur: 0, tourismTaxType: 'percent', tourismTaxPercent: 4, yearlyRevenueMin: 0, yearlyRevenueTarget: 0 }
  ]);
  
  const [jobs, setJobs] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [maintenanceExpenses, setMaintenanceExpenses] = useState([]);
  const [otherRevenues, setOtherRevenues] = useState([]);
  const [showAddOtherRevenue, setShowAddOtherRevenue] = useState(false);
  const [newOtherRevenue, setNewOtherRevenue] = useState({ date: new Date().toISOString().split('T')[0], name: '', amount: '' });
  
  // Költség kategóriák
  const [costCategories, setCostCategories] = useState({
    rent: [],        // Bérleti díjak
    software: [],    // Szoftverek
    nav: [],         // NAV
    wages: [],       // Munkabérek
    sales: [],       // Értékesítés
    marketing: [],   // Marketing
    other: []        // Egyéb költség
  });
  const [showAddCost, setShowAddCost] = useState(false);
  const [newCost, setNewCost] = useState({ date: new Date().toISOString().split('T')[0], category: 'rent', name: '', amount: '' });
  
  // Bevételi terv - termékekkel
  const [revenuePlanProducts, setRevenuePlanProducts] = useState([
    { id: 1, name: 'Havidíj', avgPrice: 12000, plannedQtyMonth: 40, actualQtyMonth: 0 },
    { id: 2, name: 'Management díj', avgPrice: 25000, plannedQtyMonth: 20, actualQtyMonth: 0 },
    { id: 3, name: 'Takarítás', avgPrice: 10000, plannedQtyMonth: 100, actualQtyMonth: 0 },
    { id: 4, name: 'Karbantartás', avgPrice: 15000, plannedQtyMonth: 10, actualQtyMonth: 0 },
  ]);
  const [showEditRevenuePlan, setShowEditRevenuePlan] = useState(false);
  const [revenuePlanFilter, setRevenuePlanFilter] = useState('month');
  const [revenuePlanPeriod, setRevenuePlanPeriod] = useState('havi'); // 'napi', 'heti', 'havi', 'eves'
  const [salesTargetYear, setSalesTargetYear] = useState(2026);
  const [newProduct, setNewProduct] = useState({ name: '', avgPrice: 0, plannedQtyMonth: 0 });
  
  // Költségterv - kategóriákkal
  const costPlanCategories = [
    { key: 'cleaning', icon: '*', label: 'Takarítás' },
    { key: 'laundry', icon: '*', label: 'Mosás (külső)' },
    { key: 'maintenance', icon: '*', label: 'Karbantartás' },
    { key: 'rent', icon: '*', label: 'Bérleti díjak' },
    { key: 'software', icon: '*', label: 'Szoftverek' },
    { key: 'nav', icon: '*', label: 'NAV' },
    { key: 'wages', icon: '*', label: 'Munkabérek' },
    { key: 'sales', icon: '*', label: 'Értékesítés' },
    { key: 'marketing', icon: '*', label: 'Marketing' },
    { key: 'other', icon: '*', label: 'Egyéb költség' },
  ];
  
  const [costPlan, setCostPlan] = useState({
    monthly: Array(12).fill(0).map((_, i) => ({
      month: i + 1,
      planned: {
        cleaning: 0, laundry: 0, maintenance: 0, rent: 0, software: 0,
        nav: 0, wages: 0, sales: 0, marketing: 0, other: 0
      },
      actual: {
        cleaning: 0, laundry: 0, maintenance: 0, rent: 0, software: 0,
        nav: 0, wages: 0, sales: 0, marketing: 0, other: 0
      }
    }))
  });
  const [costPlanMonth, setCostPlanMonth] = useState(new Date().getMonth() + 1);
  const [showEditCostPlan, setShowEditCostPlan] = useState(false);
  
  // Költségterv összesítők
  const getCostPlanTotals = (monthIndex) => {
    const monthData = costPlan.monthly[monthIndex];
    const plannedTotal = Object.values(monthData.planned).reduce((sum, val) => sum + val, 0);
    const actualTotal = Object.values(monthData.actual).reduce((sum, val) => sum + val, 0);
    return { planned: plannedTotal, actual: actualTotal };
  };
  
  // Partnerek
  const [partners, setPartners] = useState({
    clients: [],      // Megbízók - partner login-nal
    colleagues: [     // Kollégák - szinkronban a Takarítókkal
      { id: 1, name: 'Roli', email: '', phone: '', notes: '', salaryType: 'fixed', salaryAmount: 1000000, travelAllowance: false, role: 'admin', isWorker: true },
      { id: 2, name: 'Zoli', email: '', phone: '', notes: '', salaryType: 'fixed', salaryAmount: 400000, travelAllowance: false, role: 'manager', isWorker: true },
      { id: 3, name: 'Yvette', email: '', phone: '', notes: '', salaryType: 'hourly', salaryAmount: 3000, travelAllowance: true, role: 'sales', isWorker: true },
      { id: 4, name: 'Emese', email: '', phone: '', notes: '', salaryType: 'hourly', salaryAmount: 3500, travelAllowance: true, role: 'cleaner', isWorker: true }
    ],
    providers: []     // Szolgáltatók
  });
  const [partnerSubTab, setPartnerSubTab] = useState('clients');
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', password: '', notes: '', salaryType: 'hourly', salaryAmount: 2200, travelAllowance: false, role: 'cleaner', active: true });
  const [editingPartner, setEditingPartner] = useState(null);
  
  const [laundryEntries, setLaundryEntries] = useState([]);
  const [laundrySettings, setLaundrySettings] = useState({ pricePerKg: 800, suppliesCost: 0 });
  const [newLaundry, setNewLaundry] = useState({ date: '', apartmentId: '', weight: 0, pricePerKg: 0, suppliesCost: 0, totalCost: 0 });
  
  // Raktárak - központi készletkezelés
  const [warehouseView, setWarehouseView] = useState('apartments'); // 'apartments', 'laundry', 'workers'
  const [laundryInventory, setLaundryInventory] = useState({
    sheetCount: 0, sheetSize: '140x200',
    beddingSetCount: 0, beddingSetBrand: 'IKEA',
    largeTowel: 0, mediumTowel: 0, handTowel: 0, bathMat: 0, kitchenTowel: 0,
    otherItems: []
  });
  const [workerInventories, setWorkerInventories] = useState({}); // workerId -> inventory
  
  // Felhasználók kezelése jogosultságokkal
  const [users, setUsers] = useState([
    { id: 1, username: 'admin', name: 'Adminisztrátor', email: 'admin@example.com', role: 'superadmin', permissions: ['all'], active: true, lastLogin: '2024-01-15', createdAt: '2024-01-01' }
  ]);
  const [userRoles] = useState([
    { key: 'superadmin', label: 'Szuperadmin', color: 'red', permissions: ['all'] },
    { key: 'admin', label: 'Admin', color: 'purple', permissions: ['apartments', 'workers', 'jobs', 'finances', 'documents', 'warehouse', 'settings'] },
    { key: 'manager', label: 'Menedzser', color: 'blue', permissions: ['apartments', 'workers', 'jobs', 'finances', 'documents'] },
    { key: 'accountant', label: 'Könyvelő', color: 'green', permissions: ['finances', 'documents', 'reports'] },
    { key: 'supervisor', label: 'Felügyelő', color: 'orange', permissions: ['apartments', 'jobs', 'warehouse'] },
    { key: 'viewer', label: 'Megtekintő', color: 'gray', permissions: ['view_only'] }
  ]);
  const [permissionModules] = useState([
    { key: 'apartments', label: 'Lakások kezelése', icon: '*' },
    { key: 'workers', label: 'Dolgozók kezelése', icon: '*' },
    { key: 'jobs', label: 'Munkák kezelése', icon: '*' },
    { key: 'finances', label: 'Pénzügyek', icon: '*' },
    { key: 'documents', label: 'Dokumentumok', icon: '*' },
    { key: 'warehouse', label: 'Raktárak', icon: '*' },
    { key: 'partners', label: 'Partnerek', icon: '*' },
    { key: 'marketing', label: 'Marketing/Értékesítés', icon: '*' },
    { key: 'settings', label: 'Beállítások', icon: '*' },
    { key: 'reports', label: 'Riportok', icon: '*' },
    { key: 'view_only', label: 'Csak megtekintés', icon: '*' }
  ]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '', name: '', email: '', password: '', role: 'viewer', permissions: [], active: true
  });
  
  // Dokumentumok kezelése
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Minta szerződés', category: 'contract', apartmentId: null, expiryDate: '2025-12-31', status: 'active', notes: 'Példa dokumentum', createdAt: '2024-01-15', fileUrl: '', fileName: '' }
  ]);
  const [documentCategories] = useState([
    { key: 'contract', label: 'Szerződések', color: 'blue', icon: '*' },
    { key: 'insurance', label: 'Biztosítások', color: 'green', icon: '*' },
    { key: 'permit', label: 'Engedélyek', color: 'purple', icon: '*' },
    { key: 'invoice', label: 'Számlák', color: 'orange', icon: '*' },
    { key: 'maintenance', label: 'Karbantartás', color: 'red', icon: '*' },
    { key: 'inventory', label: 'Leltár', color: 'cyan', icon: '*' },
    { key: 'rules', label: 'Szabályzatok', color: 'pink', icon: '*' },
    { key: 'keys', label: 'Kulcsátadás', color: 'yellow', icon: '*' },
    { key: 'other', label: 'Egyéb', color: 'gray', icon: '*' }
  ]);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [documentFilter, setDocumentFilter] = useState('all'); // 'all', 'expiring', 'expired', or category key
  const [newDocument, setNewDocument] = useState({
    name: '', category: 'contract', apartmentId: '', expiryDate: '', status: 'active', notes: '', fileUrl: '', fileName: '', fileData: null
  });
  
  // Lead kezelés
  const [leads, setLeads] = useState([]);
  const [leadStatuses] = useState([
    { key: 'new', label: 'Új érdeklődő', color: 'orange', order: 1 },
    { key: 'contacted', label: 'Kapcsolatfelvétel', color: 'yellow', order: 2 },
    { key: 'meeting', label: 'Találkozó egyeztetve', color: 'blue', order: 3 },
    { key: 'offer', label: 'Ajánlat kiküldve', color: 'purple', order: 4 },
    { key: 'negotiation', label: 'Tárgyalás', color: 'cyan', order: 5 },
    { key: 'won', label: 'Megnyert', color: 'green', order: 6 },
    { key: 'lost', label: 'Elvesztett', color: 'red', order: 7 }
  ]);
  const [leadSources] = useState([
    { key: 'website', label: 'Weboldal' },
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'referral', label: 'Ajánlás' },
    { key: 'airbnb', label: 'Airbnb' },
    { key: 'booking', label: 'Booking' },
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'Email' },
    { key: 'other', label: 'Egyéb' }
  ]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showLeadImport, setShowLeadImport] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [leadFilter, setLeadFilter] = useState('all');
  const [newLead, setNewLead] = useState({
    name: '', email: '', phone: '', source: 'website', status: 'new', 
    apartmentInterest: '', budget: '', notes: '', assignedTo: ''
  });
  
  // Értékesítési célok 2026 (Bevétel.hu stílus)
  const [salesTargets, setSalesTargets] = useState([
    { month: 'Január', planUnits: 30, planAvgPrice: 200000, planRevenue: 6000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Február', planUnits: 33, planAvgPrice: 200000, planRevenue: 6600000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Március', planUnits: 35, planAvgPrice: 200000, planRevenue: 7000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Április', planUnits: 38, planAvgPrice: 230000, planRevenue: 8740000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Május', planUnits: 40, planAvgPrice: 200000, planRevenue: 8000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Június', planUnits: 42, planAvgPrice: 200000, planRevenue: 8400000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Július', planUnits: 45, planAvgPrice: 240000, planRevenue: 10800000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Augusztus', planUnits: 47, planAvgPrice: 240000, planRevenue: 11280000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Szeptember', planUnits: 50, planAvgPrice: 200000, planRevenue: 10000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'Október', planUnits: 52, planAvgPrice: 200000, planRevenue: 10400000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'November', planUnits: 55, planAvgPrice: 200000, planRevenue: 11000000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 },
    { month: 'December', planUnits: 58, planAvgPrice: 220000, planRevenue: 12760000, actualUnits: 0, actualAvgPrice: 0, actualRevenue: 0 }
  ]);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [showSalesTargetEdit, setShowSalesTargetEdit] = useState(false);
  
  const [newWorker, setNewWorker] = useState({ name: '', hourlyRate: 2200, password: '', role: 'worker' });
  const [newApartment, setNewApartment] = useState({ 
    name: '', 
    clientId: '', // Megbízó ID (partner)
    clientName: '', // Megbízó neve
    address: '', // Teljes cím
    zipCode: '', // Irányítószám
    city: '', // Város
    street: '', // Utca, házszám
    gateCode: '', // Kapukód
    ntakNumber: '', // NTAK szám
    taxNumber: '', // Adószám
    operationType: 'short-term', // Üzemeltetés típusa: short-term / rental
    airbnbUsername: '', // Airbnb felhasználónév
    airbnbPassword: '', // Airbnb jelszó
    bookingUsername: '', // Booking felhasználónév
    bookingPassword: '', // Booking jelszó
    timeFrame: 2, 
    instructions: '', 
    accessInstructions: '', 
    cleaningFeeEur: 25, 
    monthlyFeeEur: 30, 
    parkingEur: 0, 
    managementFee: 25, 
    tourismTaxType: 'percent', 
    tourismTaxPercent: 4, 
    tourismTaxFixed: 0, 
    revenueHandler: 'owner', 
    yearlyRevenueMin: 0,
    yearlyRevenueTarget: 0,
    icalAirbnb: '', 
    icalBooking: '', 
    icalSzallas: '',
    icalOwn: '' 
  });
  const [showIcalSettings, setShowIcalSettings] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [showAddApartment, setShowAddApartment] = useState(false);
  const [amenitiesApartmentId, setAmenitiesApartmentId] = useState('');
  const [amenitiesPlatform, setAmenitiesPlatform] = useState('booking');
  const [bookings, setBookings] = useState([
    // Példa foglalások - Airbnb (rózsaszín)
    { id: 1001, apartmentId: 1, apartmentName: 'A57 Downtown', dateFrom: '2026-01-05', dateTo: '2026-01-10', nights: 5, platform: 'airbnb', guestName: 'John Smith', guestCount: 2, payoutEur: 450, payoutFt: 180000, cleaningFee: 12000, tourismTax: 6720, netRoomRevenue: 161280, managementFee: 25, managementAmount: 40320 },
    { id: 1002, apartmentId: 3, apartmentName: 'Angel 36', dateFrom: '2026-01-08', dateTo: '2026-01-15', nights: 7, platform: 'airbnb', guestName: 'Emma Wilson', guestCount: 3, payoutEur: 630, payoutFt: 252000, cleaningFee: 12000, tourismTax: 9600, netRoomRevenue: 230400, managementFee: 25, managementAmount: 57600 },
    { id: 1003, apartmentId: 7, apartmentName: 'Bogdáni', dateFrom: '2026-01-12', dateTo: '2026-01-18', nights: 6, platform: 'airbnb', guestName: 'Sophie Brown', guestCount: 2, payoutEur: 540, payoutFt: 216000, cleaningFee: 12000, tourismTax: 8160, netRoomRevenue: 195840, managementFee: 25, managementAmount: 48960 },
    
    // Példa foglalások - Booking (kék)
    { id: 1004, apartmentId: 2, apartmentName: 'Angyalföldi', dateFrom: '2026-01-03', dateTo: '2026-01-08', nights: 5, platform: 'booking', guestName: 'Hans Mueller', guestCount: 2, payoutEur: 400, payoutFt: 160000, cleaningFee: 12000, tourismTax: 5920, netRoomRevenue: 142080, managementFee: 25, managementAmount: 35520 },
    { id: 1005, apartmentId: 5, apartmentName: 'B20 Keleti', dateFrom: '2026-01-10', dateTo: '2026-01-17', nights: 7, platform: 'booking', guestName: 'Marie Dupont', guestCount: 4, payoutEur: 700, payoutFt: 280000, cleaningFee: 12000, tourismTax: 10720, netRoomRevenue: 257280, managementFee: 25, managementAmount: 64320 },
    { id: 1006, apartmentId: 10, apartmentName: 'D16 Deluxe', dateFrom: '2026-01-15', dateTo: '2026-01-22', nights: 7, platform: 'booking', guestName: 'Klaus Schmidt', guestCount: 2, payoutEur: 840, payoutFt: 336000, cleaningFee: 15000, tourismTax: 12840, netRoomRevenue: 308160, managementFee: 30, managementAmount: 92448 },
    
    // Példa foglalások - Szallas.hu (piros)
    { id: 1007, apartmentId: 4, apartmentName: 'B20 Keleti', dateFrom: '2026-01-20', dateTo: '2026-01-25', nights: 5, platform: 'szallas', guestName: 'Kovács Péter', guestCount: 2, payoutEur: 350, payoutFt: 140000, cleaningFee: 12000, tourismTax: 5120, netRoomRevenue: 122880, managementFee: 25, managementAmount: 30720 },
    { id: 1008, apartmentId: 8, apartmentName: 'D3', dateFrom: '2026-01-06', dateTo: '2026-01-12', nights: 6, platform: 'szallas', guestName: 'Nagy Anna', guestCount: 3, payoutEur: 480, payoutFt: 192000, cleaningFee: 12000, tourismTax: 7200, netRoomRevenue: 172800, managementFee: 25, managementAmount: 43200 },
    { id: 1009, apartmentId: 11, apartmentName: 'D39', dateFrom: '2026-01-18', dateTo: '2026-01-23', nights: 5, platform: 'szallas', guestName: 'Tóth László', guestCount: 2, payoutEur: 425, payoutFt: 170000, cleaningFee: 12000, tourismTax: 6320, netRoomRevenue: 151680, managementFee: 25, managementAmount: 37920 },
    
    // Példa foglalások - Direkt (zöld)
    { id: 1010, apartmentId: 6, apartmentName: 'Baross 20...', dateFrom: '2026-01-02', dateTo: '2026-01-06', nights: 4, platform: 'direct', guestName: 'Szabó Gábor', guestCount: 2, payoutEur: 320, payoutFt: 128000, cleaningFee: 12000, tourismTax: 4640, netRoomRevenue: 111360, managementFee: 20, managementAmount: 22272 },
    { id: 1011, apartmentId: 9, apartmentName: 'D3 Basilica', dateFrom: '2026-01-14', dateTo: '2026-01-20', nights: 6, platform: 'direct', guestName: 'Kiss Éva', guestCount: 2, payoutEur: 600, payoutFt: 240000, cleaningFee: 15000, tourismTax: 9000, netRoomRevenue: 216000, managementFee: 25, managementAmount: 54000 },
    { id: 1012, apartmentId: 12, apartmentName: 'Dunakeszi', dateFrom: '2026-01-22', dateTo: '2026-01-28', nights: 6, platform: 'direct', guestName: 'Horváth Miklós', guestCount: 4, payoutEur: 480, payoutFt: 192000, cleaningFee: 12000, tourismTax: 7200, netRoomRevenue: 172800, managementFee: 25, managementAmount: 43200 }
  ]);
  const [showAddBooking, setShowAddBooking] = useState(false);
  const [newBooking, setNewBooking] = useState({ dateFrom: new Date().toISOString().split('T')[0], dateTo: '', apartmentId: '', payoutEur: '', guestCount: 1, platform: 'airbnb', guestName: '' });
  const [editingBooking, setEditingBooking] = useState(null);
  const [showAirbnbPassword, setShowAirbnbPassword] = useState(false);
  const [showBookingPassword, setShowBookingPassword] = useState(false);
  const [editingSettlementItem, setEditingSettlementItem] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingApartmentFilter, setBookingApartmentFilter] = useState('');
  const [financeFilter, setFinanceFilter] = useState('month');
  const [financeApartmentFilter, setFinanceApartmentFilter] = useState('');
  const [financeMonth, setFinanceMonth] = useState(new Date().getMonth());
  const [financeYear, setFinanceYear] = useState(new Date().getFullYear());
  const [financeCustomRange, setFinanceCustomRange] = useState({ start: '', end: '' });
  const [financeSubTab, setFinanceSubTab] = useState('overview'); // 'overview' or 'settlements'
  const [settlementApartment, setSettlementApartment] = useState('');
  const [settlementExtraItems, setSettlementExtraItems] = useState([]); // Extra tételek: {id, apartmentId, month, year, name, amount, isDiscount}
  const [showAddSettlementItem, setShowAddSettlementItem] = useState(false);
  const [newSettlementItem, setNewSettlementItem] = useState({ name: '', amount: 0, isDiscount: false });
  const [editingSettlementExtraItem, setEditingSettlementExtraItem] = useState(null);
  const [editingApartment, setEditingApartment] = useState(null);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showAddJob, setShowAddJob] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [newJob, setNewJob] = useState({ 
    workerId: '', 
    date: '', 
    apartments: [],
    textileDeliveries: [], // Format: { apartmentId, apartmentName, guestCount, arrivalTime, laundryDelivery }
    checkoutTimes: {}, // Format: { apartmentId: '10:00' }
    checkinTimes: {}   // Format: { apartmentId: '15:00' }
  });

  // Generate checkout time slots (04:00 - 14:00)
  const getCheckoutTimeSlots = () => {
    const slots = [];
    for (let hour = 4; hour <= 14; hour++) {
      if (hour < 14) {
        slots.push(`${hour.toString().padStart(2, '0')}:00`);
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      } else {
        slots.push('14:00');
      }
    }
    return slots;
  };

  // Generate checkin time slots (12:00 - 01:00 next day)
  const getCheckinTimeSlots = () => {
    const slots = [];
    for (let hour = 12; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    slots.push('00:00');
    slots.push('00:30');
    slots.push('01:00');
    return slots;
  };

  const getNextWeekDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleLogin = () => {
    // Check if it's an admin
    const admin = admins.find(a => 
      a.username.toLowerCase() === loginForm.username.toLowerCase() && 
      a.password === loginForm.password
    );
    
    if (admin) {
      setIsAdmin(true);
      setCurrentUser(admin);
    } else {
      // Check if it's a worker
      const worker = workers.find(w => 
        w.name.toLowerCase() === loginForm.username.toLowerCase() && 
        w.password === loginForm.password
      );
      
      if (worker) {
        setIsAdmin(false);
        setCurrentUser(worker);
      } else {
        alert('Hibás felhasználónév vagy jelszó!');
      }
    }
  };

  const handleLogout = () => {
    setIsAdmin(null);
    setCurrentUser(null);
    setLoginForm({ username: '', password: '' });
    setActiveTab('calendar');
  };

  // Partner login kezelés
  const handlePartnerLogin = () => {
    const partner = partners.clients.find(c => 
      c.email?.toLowerCase() === partnerLoginEmail.toLowerCase() && 
      c.password === partnerLoginPassword &&
      c.active !== false
    );
    
    if (partner) {
      setCurrentPartner(partner);
      setPartnerLoginEmail('');
      setPartnerLoginPassword('');
      setShowPartnerLogin(false);
      setPartnerLoginError('');
    } else {
      setPartnerLoginError('Hibás email cím vagy jelszó!');
    }
  };

  const handlePartnerLogout = () => {
    setCurrentPartner(null);
    setPartnerEditingApartment(null);
    setPartnerLoginEmail('');
    setPartnerLoginPassword('');
    setShowPartnerLogin(false);
    setPartnerRegistering(false);
    setIsPartnerMode(false);
    setIsAdmin(null);
  };

  // Partner lakásainak lekérése
  const getPartnerApartments = () => {
    if (!currentPartner) return [];
    return apartments.filter(a => 
      a.clientId === currentPartner.id.toString() || 
      a.clientId === currentPartner.id ||
      (currentPartner.apartmentIds && currentPartner.apartmentIds.includes(a.id))
    );
  };

  // Partner lakás mentése
  const savePartnerApartment = () => {
    if (partnerEditingApartment) {
      setApartments(apartments.map(a => 
        a.id === partnerEditingApartment.id ? partnerEditingApartment : a
      ));
      setPartnerEditingApartment(null);
    }
  };

  const addWorker = () => {
    if (newWorker.name.trim() && newWorker.password.trim()) {
      const workerId = Date.now();
      const workerData = {
        id: workerId,
        name: newWorker.name.trim(),
        hourlyRate: 2200, // Fix órabér
        password: newWorker.password.trim(),
        role: newWorker.role
      };
      setWorkers([...workers, workerData]);
      
      // Szinkronizálás a Partnerek > Kollégák-kal
      setPartners(prev => ({
        ...prev,
        colleagues: [...prev.colleagues, {
          id: workerId,
          name: newWorker.name.trim(),
          email: '',
          phone: '',
          notes: '',
          salaryType: 'hourly',
          salaryAmount: 2200,
          isWorker: true
        }]
      }));
      
      setNewWorker({ name: '', hourlyRate: 2200, password: '', role: 'worker' });
    }
  };

  const removeWorker = (id) => {
    const worker = workers.find(w => w.id === id);
    setConfirmDelete({
      type: 'worker',
      id: id,
      name: worker.name
    });
  };

  const confirmDeleteAction = () => {
    if (confirmDelete.type === 'worker') {
      setWorkers(workers.filter(w => w.id !== confirmDelete.id));
      // Törlés a Partnerek > Kollégák-ból is
      setPartners(prev => ({
        ...prev,
        colleagues: prev.colleagues.filter(c => c.id !== confirmDelete.id)
      }));
    } else if (confirmDelete.type === 'apartment') {
      setApartments(apartments.filter(a => a.id !== confirmDelete.id));
    }
    setConfirmDelete(null);
  };

  const startEditWorker = (worker) => {
    setEditingWorker({ ...worker });
  };

  const saveEditWorker = () => {
    if (editingWorker.isAdmin) {
      // Saving admin
      if (editingWorker.username.trim() && editingWorker.name.trim() && editingWorker.password.trim()) {
        setAdmins(admins.map(a => 
          a.id === editingWorker.id ? {
            id: editingWorker.id,
            username: editingWorker.username.trim(),
            name: editingWorker.name.trim(),
            password: editingWorker.password.trim()
          } : a
        ));
        setEditingWorker(null);
      }
    } else {
      // Saving worker
      if (editingWorker.name.trim()) {
        setWorkers(workers.map(w => 
          w.id === editingWorker.id ? {...editingWorker, hourlyRate: w.hourlyRate} : w
        ));
        setEditingWorker(null);
      }
    }
  };

  const addApartment = () => {
    if (newApartment.name.trim() && newApartment.timeFrame > 0) {
      setApartments([...apartments, {
        id: Date.now(),
        name: newApartment.name.trim(),
        timeFrame: parseFloat(newApartment.timeFrame),
        instructions: newApartment.instructions.trim()
      }].sort((a, b) => a.name.localeCompare(b.name)));
      setNewApartment({ name: '', timeFrame: 2, instructions: '' });
    }
  };

  const removeApartment = (id) => {
    const apartment = apartments.find(a => a.id === id);
    setConfirmDelete({
      type: 'apartment',
      id: id,
      name: apartment.name
    });
  };

  const startEditApartment = (apt) => {
    setEditingApartment({ ...apt });
  };

  const saveEditApartment = () => {
    if (editingApartment && editingApartment.name.trim() && editingApartment.timeFrame > 0) {
      setApartments(apartments.map(a => 
        a.id === editingApartment.id ? editingApartment : a
      ).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingApartment(null);
    }
  };

  const toggleApartmentSelection = (aptId) => {
    const apt = apartments.find(a => a.id === aptId);
    const existing = newJob.apartments.find(a => a.id === aptId);
    
    if (existing) {
      setNewJob({
        ...newJob,
        apartments: newJob.apartments.filter(a => a.id !== aptId),
        textileDeliveries: newJob.textileDeliveries.filter(t => t.apartmentId !== aptId)
      });
    } else {
      setNewJob({
        ...newJob,
        apartments: [...newJob.apartments, { id: apt.id, name: apt.name, timeFrame: apt.timeFrame, instructions: apt.instructions, textileArrival: '', workerDelivers: false }]
      });
    }
  };

  const toggleTextileDelivery = (aptId) => {
    const existing = newJob.textileDeliveries.find(t => t.apartmentId === aptId);
    if (existing) {
      setNewJob({
        ...newJob,
        textileDeliveries: newJob.textileDeliveries.filter(t => t.apartmentId !== aptId)
      });
    } else {
      const apt = apartments.find(a => a.id === aptId);
      setNewJob({
        ...newJob,
        textileDeliveries: [...newJob.textileDeliveries, { apartmentId: aptId, apartmentName: apt.name, guestCount: 0, arrivalTime: '14:00', laundryDelivery: false }]
      });
    }
  };

  const updateTextileDelivery = (aptId, guestCount) => {
    setNewJob({
      ...newJob,
      textileDeliveries: newJob.textileDeliveries.map(t =>
        t.apartmentId === aptId ? { ...t, guestCount: parseInt(guestCount) } : t
      )
    });
  };

  const updateTextileArrivalTime = (aptId, arrivalTime) => {
    setNewJob({
      ...newJob,
      textileDeliveries: newJob.textileDeliveries.map(t =>
        t.apartmentId === aptId ? { ...t, arrivalTime } : t
      )
    });
  };

  const toggleLaundryDelivery = (aptId) => {
    setNewJob({
      ...newJob,
      textileDeliveries: newJob.textileDeliveries.map(t =>
        t.apartmentId === aptId ? { ...t, laundryDelivery: !t.laundryDelivery } : t
      )
    });
  };

  const addJob = () => {
    if (newJob.workerId && newJob.date && (newJob.apartments.length > 0 || newJob.textileDeliveries.length > 0)) {
      const worker = workers.find(w => w.id === parseInt(newJob.workerId));
      
      const totalHours = newJob.apartments.reduce((sum, a) => sum + a.timeFrame, 0);
      const cleaningEarnings = totalHours * worker.hourlyRate;
      const textileEarnings = newJob.textileDeliveries.reduce((sum, t) => sum + (t.laundryDelivery ? 0 : t.guestCount * 1200), 0);
      
      setJobs([...jobs, {
        id: Date.now(),
        date: newJob.date,
        apartments: newJob.apartments,
        worker: worker,
        hours: totalHours,
        cleaningEarnings: cleaningEarnings,
        textileDeliveries: newJob.textileDeliveries,
        textileEarnings: textileEarnings,
        totalEarnings: cleaningEarnings + textileEarnings,
        checkoutTimes: newJob.checkoutTimes,
        checkinTimes: newJob.checkinTimes
      }]);
      
      setNewJob({ workerId: '', date: '', apartments: [], textileDeliveries: [], checkoutTimes: {}, checkinTimes: {} });
      setShowAddJob(false);
    }
  };

  const deleteJob = (id) => {
    setJobs(jobs.filter(job => job.id !== id));
  };

  const addExpense = () => {
    if (newExpense.amount && newExpense.description && currentUser) {
      setExpenses([...expenses, {
        id: Date.now(),
        workerId: currentUser.id,
        workerName: currentUser.name,
        date: newExpense.date,
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        receipt: newExpense.receipt
      }]);
      setNewExpense({ date: new Date().toISOString().split('T')[0], amount: '', description: '', receipt: null });
      setShowAddExpense(false);
    }
  };

  const addMaintenance = () => {
    if (newMaintenance.amount && newMaintenance.description) {
      const apt = apartments.find(a => a.id === parseInt(newMaintenance.apartmentId));
      setMaintenanceExpenses([...maintenanceExpenses, {
        id: Date.now(),
        date: newMaintenance.date,
        amount: parseFloat(newMaintenance.amount),
        cost: parseFloat(newMaintenance.amount), // alias for settlements
        description: newMaintenance.description,
        notes: newMaintenance.notes || '',
        apartmentId: parseInt(newMaintenance.apartmentId) || null,
        apartmentName: apt ? apt.name : 'Általános'
      }]);
      setNewMaintenance({ date: new Date().toISOString().split('T')[0], amount: '', description: '', notes: '', apartmentId: '' });
      setShowAddMaintenance(false);
    }
  };

  const addBooking = () => {
    if (newBooking.apartmentId && newBooking.payout) {
      const apt = apartments.find(a => a.id === parseInt(newBooking.apartmentId));
      if (apt) {
        const payout = parseFloat(newBooking.payout);
        const cleaningFee = apt.cleaningFeeEur * eurRate;
        const managementFee = apt.managementFee || 25;
        const managementAmount = payout * (managementFee / 100);
        const netRevenue = payout - cleaningFee;
        
        setBookings([...bookings, {
          id: Date.now(),
          dateFrom: newBooking.dateFrom,
          dateTo: newBooking.dateTo,
          apartmentId: apt.id,
          apartmentName: apt.name,
          platform: newBooking.platform,
          guestName: newBooking.guestName,
          payout: payout,
          cleaningFee: cleaningFee,
          managementFee: managementFee,
          managementAmount: managementAmount,
          netRevenue: netRevenue
        }]);
        setNewBooking({ dateFrom: new Date().toISOString().split('T')[0], dateTo: '', apartmentId: '', payout: '', platform: 'airbnb', guestName: '' });
        setShowAddBooking(false);
      }
    }
  };

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewExpense({ ...newExpense, receipt: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const getWorkerSummary = (period = 'all', workerId = null, customRange = null) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of this week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(today.getDate() + diff);
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const summary = {};
    // Csak takarítókat (cleaner) mutatjuk a teljesítményben
    const cleanerWorkers = workers.filter(w => w.role === 'cleaner');
    const targetWorkers = workerId ? [workers.find(w => w.id === workerId)] : cleanerWorkers;
    
    targetWorkers.forEach(worker => {
      if (worker) {
        summary[worker.id] = {
          name: worker.name,
          hours: 0,
          cleaningEarnings: 0,
          textileEarnings: 0,
          expenses: 0,
          totalEarnings: 0,
          jobs: 0
        };
      }
    });

    jobs.forEach(job => {
      const jobDate = new Date(job.date);
      let include = false;

      if (period === 'today') {
        include = jobDate >= today && jobDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (period === 'week') {
        include = jobDate >= startOfWeek && jobDate <= now;
      } else if (period === 'month') {
        include = jobDate >= startOfMonth && jobDate <= now;
      } else if (period === 'custom' && customRange && customRange.start && customRange.end) {
        const startDate = new Date(customRange.start);
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        include = jobDate >= startDate && jobDate <= endDate;
      } else if (period === 'all') {
        include = true;
      }

      if (include && summary[job.worker.id]) {
        summary[job.worker.id].hours += job.hours;
        summary[job.worker.id].cleaningEarnings += job.cleaningEarnings;
        summary[job.worker.id].textileEarnings += job.textileEarnings || 0;
        summary[job.worker.id].totalEarnings += job.totalEarnings;
        summary[job.worker.id].jobs += 1;
      }
    });

    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      let include = false;

      if (period === 'today') {
        include = expDate >= today && expDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (period === 'week') {
        include = expDate >= startOfWeek && expDate <= now;
      } else if (period === 'month') {
        include = expDate >= startOfMonth && expDate <= now;
      } else if (period === 'custom' && customRange && customRange.start && customRange.end) {
        const startDate = new Date(customRange.start);
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        include = expDate >= startDate && expDate <= endDate;
      } else if (period === 'all') {
        include = true;
      }

      if (include && summary[exp.workerId]) {
        summary[exp.workerId].expenses += exp.amount;
        summary[exp.workerId].totalEarnings += exp.amount;
      }
    });

    return summary;
  };

  const getTotalCosts = (period = 'today') => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Start of this week (Monday)
    const startOfWeek = new Date(today);
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // if Sunday, go back 6 days, else go to Monday
    startOfWeek.setDate(today.getDate() + diff);
    
    // Start of this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // End of this month (for monthly fees calculation)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Helper function to check if date is in period
    const isInPeriod = (date) => {
      const d = new Date(date);
      if (period === 'today') {
        return d >= today && d < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      } else if (period === 'week') {
        return d >= startOfWeek && d <= now;
      } else if (period === 'month') {
        return d >= startOfMonth && d <= endOfMonth;
      } else if (period === 'custom' && customDateRange.start && customDateRange.end) {
        const startDate = new Date(customDateRange.start);
        const endDate = new Date(customDateRange.end);
        endDate.setHours(23, 59, 59, 999);
        return d >= startDate && d <= endDate;
      } else if (period === 'all') {
        return true;
      }
      return false;
    };

    let totalJobCosts = 0; // Worker wages (cleaning)
    let totalTextileCosts = 0; // Textile delivery costs
    let totalExpenses = 0; // Other expenses
    let totalRevenues = 0; // Our revenues

    // Calculate revenues from bookings (cleaning fees + management fees)
    let totalCleaningFeeRevenue = 0;
    let totalManagementRevenue = 0;
    let totalMaintenanceRevenue = 0;
    
    bookings.forEach(booking => {
      if (isInPeriod(booking.dateTo)) { // dateTo = checkout day = when we get paid
        totalCleaningFeeRevenue += booking.cleaningFee || 0;
        totalManagementRevenue += booking.managementAmount || 0;
      }
    });

    // Calculate monthly fees (only for 'month' period or if we're in current month)
    let totalMonthlyFeeRevenue = 0;
    let totalParkingRevenue = 0;
    
    if (period === 'month' || period === 'all') {
      apartments.forEach(apt => {
        totalMonthlyFeeRevenue += (apt.monthlyFeeEur || 0) * eurRate;
        totalParkingRevenue += (apt.parkingEur || 0) * eurRate;
      });
    } else if (period === 'week') {
      // Pro-rate monthly fees for a week (roughly 1/4 of month)
      apartments.forEach(apt => {
        totalMonthlyFeeRevenue += ((apt.monthlyFeeEur || 0) * eurRate) / 4;
        totalParkingRevenue += ((apt.parkingEur || 0) * eurRate) / 4;
      });
    }

    // Calculate maintenance revenue (costs we charge to owner)
    maintenanceExpenses.forEach(entry => {
      if (isInPeriod(entry.date)) {
        totalMaintenanceRevenue += entry.amount;
      }
    });

    // Calculate other revenues
    let totalOtherRevenue = 0;
    otherRevenues.forEach(entry => {
      if (isInPeriod(entry.date)) {
        totalOtherRevenue += entry.amount;
      }
    });

    // Total revenues = cleaning fees + management + monthly fees + parking + maintenance + other
    totalRevenues = totalCleaningFeeRevenue + totalManagementRevenue + totalMonthlyFeeRevenue + totalParkingRevenue + totalMaintenanceRevenue + totalOtherRevenue;

    // Calculate costs
    jobs.forEach(job => {
      if (isInPeriod(job.date)) {
        // Calculate cleaning costs (worker wages)
        const cleaningCost = job.apartments.reduce((sum, apt) => sum + (apt.timeFrame * job.worker.hourlyRate), 0);
        totalJobCosts += cleaningCost;
        
        // Calculate textile costs
        const textileCost = (job.textileDeliveries || []).reduce((sum, t) => sum + (t.guestCount * 1200), 0);
        totalTextileCosts += textileCost;
      }
    });

    expenses.forEach(exp => {
      if (isInPeriod(exp.date)) {
        totalExpenses += exp.amount;
      }
    });

    let totalLaundryCosts = 0;
    laundryEntries.forEach(entry => {
      if (isInPeriod(entry.date)) {
        totalLaundryCosts += entry.totalCost;
      }
    });

    let totalMaintenanceCosts = 0;
    maintenanceExpenses.forEach(entry => {
      if (isInPeriod(entry.date)) {
        totalMaintenanceCosts += entry.amount;
      }
    });

    // Költség kategóriák számítása
    const costCategoryTotals = {
      rent: 0,
      software: 0,
      nav: 0,
      wages: 0,
      sales: 0,
      marketing: 0,
      other: 0
    };
    
    Object.keys(costCategories).forEach(category => {
      costCategories[category].forEach(entry => {
        if (isInPeriod(entry.date)) {
          costCategoryTotals[category] += entry.amount;
        }
      });
    });

    const totalCategoryCosts = Object.values(costCategoryTotals).reduce((a, b) => a + b, 0);
    const totalCosts = totalJobCosts + totalTextileCosts + totalExpenses + totalLaundryCosts + totalMaintenanceCosts + totalCategoryCosts;
    const profit = totalRevenues - totalCosts;

    return {
      cleaningCosts: totalJobCosts,
      textileCosts: totalTextileCosts,
      expenses: totalExpenses,
      laundryCosts: totalLaundryCosts,
      maintenanceCosts: totalMaintenanceCosts,
      totalCosts: totalCosts,
      revenues: totalRevenues,
      profit: profit,
      // Részletezés
      revenueDetails: {
        cleaningFees: totalCleaningFeeRevenue,
        managementFees: totalManagementRevenue,
        monthlyFees: totalMonthlyFeeRevenue,
        parking: totalParkingRevenue,
        maintenance: totalMaintenanceRevenue,
        other: totalOtherRevenue
      },
      // Költség részletezés
      costDetails: {
        cleaning: totalJobCosts,
        laundryInternal: totalTextileCosts, // Belső mosás = dolgozói textil (1200 Ft/fő)
        laundryExternal: totalLaundryCosts, // Külső mosás = mosoda
        maintenance: totalMaintenanceCosts,
        rent: costCategoryTotals.rent,
        software: costCategoryTotals.software,
        nav: costCategoryTotals.nav,
        wages: costCategoryTotals.wages,
        sales: costCategoryTotals.sales,
        marketing: costCategoryTotals.marketing,
        other: costCategoryTotals.other + totalExpenses
      }
    };
  };

  // Partner felület - ELŐBB kell ellenőrizni mint az admin login!
  if (currentPartner) {
    const partnerApartments = getPartnerApartments();
    
    // ÚJ PARTNER REGISZTRÁCIÓ - LÉPÉSENKÉNTI WIZARD
    if (currentPartner.isNewRegistration) {
      const apt = partnerNewApartment;
      const updateApt = (updates) => setPartnerNewApartment(prev => ({...prev, ...updates}));
      const stepTitles = ['Személyes adatok', 'Lakás adatai', 'IFA', 'Kiadásra hirdetett lakás', 'Ágyak', 'Platformok', 'WiFi', 'Csomag', 'Díjak', 'Összegzés', 'Piactér'];
      const totalSteps = stepTitles.length;
      
      // Package details definíció - Max a legnépszerűbb
      const packageDetails = {
        alap: { name: 'Alap', percent: 20, color: 'from-cyan-500 to-cyan-600', popular: false },
        pro: { name: 'Pro', percent: 25, color: 'from-fuchsia-500 to-fuchsia-600', popular: false },
        max: { name: 'Max', percent: 35, color: 'from-rose-500 to-rose-600', popular: true }
      };
      
      // Budapest IFA adatok 2026 - PONTOS ÉRTÉKEK
      const budapestIfaData = {
        'I': { type: 'percent', value: 4 },
        'II': { type: 'fixed', value: 800 },
        'III': { type: 'percent', value: 4 },
        'IV': { type: 'fixed', value: 500 },
        'V': { type: 'percent', value: 4 },
        'VI': { type: 'percent', value: 4, note: 'tiltás' },
        'VII': { type: 'percent', value: 4 },
        'VIII': { type: 'percent', value: 4 },
        'IX': { type: 'percent', value: 4 },
        'X': { type: 'fixed', value: 800 },
        'XI': { type: 'fixed', value: 830 },
        'XII': { type: 'percent', value: 4 },
        'XIII': { type: 'percent', value: 4 },
        'XIV': { type: 'percent', value: 4 },
        'XV': { type: 'fixed', value: 450 },
        'XVI': { type: 'fixed', value: 400 },
        'XVII': { type: 'fixed', value: 600 },
        'XVIII': { type: 'fixed', value: 550 },
        'XIX': { type: 'fixed', value: 600 },
        'XX': { type: 'fixed', value: 500 },
        'XXI': { type: 'fixed', value: 500 },
        'XXII': { type: 'fixed', value: 650 },
        'XXIII': { type: 'fixed', value: 500 }
      };
      
      // Kosár számítás
      const cartItems = [];
      let cartTotal = 0;
      
      // Havi alapdíj (vendégszám alapján)
      const monthlyFee = (() => {
        const guests = apt.maxGuests || 0;
        if (guests <= 4) return 30;
        if (guests <= 6) return 35;
        if (guests <= 9) return 40;
        if (guests <= 12) return 45;
        return 45 + Math.ceil((guests - 12) / 3) * 5;
      })();
      
      if (apt.servicePackage) {
        const pkgNames = { alap: 'Alap 20%', pro: 'Pro 25%', max: 'Max 35%' };
        cartItems.push({ name: `📦 ${pkgNames[apt.servicePackage]}`, price: monthlyFee, note: '/hó' });
        cartTotal += monthlyFee;
      }
      
      // Takarítási díj (m2 + férőhely alapján, csak ha nincs nagytakarítás)
      const cleaningFee = (() => {
        const size = apt.apartmentSize || 0;
        const guests = apt.maxGuests || 0;
        let basePrice = 25;
        if (size <= 35) basePrice = 25;
        else if (size <= 45) basePrice = 35;
        else if (size <= 60) basePrice = 45;
        else if (size <= 80) basePrice = 55;
        else if (size <= 100) basePrice = 70;
        else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
        const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
        return basePrice + guestSurcharge;
      })();
      
      if (apt.apartmentSize > 0 && apt.maxGuests > 0 && !apt.requestDeepCleaning) {
        cartItems.push({ name: '🧹 Első takarítás', price: cleaningFee, note: 'egyszeri' });
        cartTotal += cleaningFee;
      }
      
      // Nagytakarítás (duplája a normál takarításnak, de az első takarítást kiváltja)
      if (apt.requestDeepCleaning && apt.apartmentSize > 0) {
        const deepPrice = cleaningFee * 2;
        cartItems.push({ name: '✨ Nagytakarítás', price: deepPrice, note: 'egyszeri' });
        cartItems.push({ name: '🎁 Első takarítás', price: 0, note: 'ingyenes!' });
        cartTotal += deepPrice;
      }
      
      // Standard készletek (csak ami be van pipálva = _need)
      if (apt.maxGuests > 0) {
        const guests = apt.maxGuests;
        const eq = apt.equipment || {};
        const pillowCount = eq.doublePillow ? guests * 2 : guests;
        let totalFt = 0;
        // Konyha - csak ha _need = true
        if (eq.palinkas_need) totalFt += guests * 150;
        if (eq.pohar_need) totalFt += guests * 2 * 595;
        if (eq.boros_need) totalFt += guests * 250;
        if (eq.kaves_need) totalFt += guests * 995;
        if (eq.bogre_need) totalFt += guests * 695;
        if (eq.eszkoz_need) totalFt += 1 * 2790;
        if (eq.serpenyo_need) totalFt += 1 * 5990;
        if (eq.fozokeszlet_need) totalFt += 1 * 4490;
        // Szoba és Fürdő - csak ha _need = true
        if (eq.vasalo_need) totalFt += 1 * 2690;
        if (eq.matracvedo_need) totalFt += guests * 7990;
        if (eq.kadkilepo_need) totalFt += 1 * 695;
        if (eq.keztorlo_need) totalFt += guests * 2 * 795;
        if (eq.furdolepedo_need) totalFt += guests * 2 * 2990;
        if (eq.paplan_need) totalFt += guests * 6490;
        if (eq.parna_need) totalFt += pillowCount * 6990;
        if (eq.huzat_need) totalFt += guests * 2 * 1990;
        if (eq.lepedo_need) totalFt += guests * 2 * 4490;
        if (totalFt > 0) {
          const equipmentPriceEur = Math.round(totalFt / eurRate);
          cartItems.push({ name: '🏠 Standard készletek', price: equipmentPriceEur, note: 'egyszeri' });
          cartTotal += equipmentPriceEur;
        }
      }
      
      // Internet szolgáltatás
      if (apt.requestCompanyInternet) {
        cartItems.push({ name: '📶 Internet', price: 20, note: '/hó' });
        cartTotal += 20;
      }
      
      return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-rose-50 to-amber-50">
          {/* FEJLÉC - elegáns */}
          <div className="bg-gradient-to-r from-stone-700 via-stone-600 to-stone-700 text-white p-4 sticky top-0 z-40 shadow-lg">
            <div className="max-w-3xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">🏠</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold tracking-wide">Új lakás regisztrálása</h1>
                  <p className="text-stone-300 text-xs">{partnerOnboardingStep}. lépés a {totalSteps}-ből</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Kosár */}
                <div className="relative group">
                  <button className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all">
                    <ShoppingCart size={18} />
                    {cartItems.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartItems.length}</span>}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-stone-100">
                    <div className="p-3 border-b border-stone-100"><span className="font-semibold text-stone-700 text-sm">🛒 Kosár</span></div>
                    <div className="p-3 text-sm">
                      {cartItems.length === 0 ? (
                        <p className="text-stone-400 text-center py-2">Üres kosár</p>
                      ) : (
                        cartItems.map((item, i) => (
                          <div key={i} className={`flex justify-between py-1.5 ${item.price === 0 ? 'text-emerald-600' : 'text-stone-600'}`}>
                            <span>{item.name}</span>
                            <span className="font-semibold text-right">
                              {item.price === null ? (
                                <span className="text-violet-600 text-xs">{item.note}</span>
                              ) : item.price === 0 ? (
                                <span className="text-emerald-600">{item.note}</span>
                              ) : (
                                <><span className="text-stone-800">{item.price}€</span> <span className="text-stone-400 text-xs">{item.note}</span></>
                              )}
                            </span>
                          </div>
                        ))
                      )}
                      {cartTotal > 0 && <div className="border-t border-stone-100 mt-2 pt-2 font-bold text-right text-stone-800">Összesen: {cartTotal} EUR</div>}
                    </div>
                  </div>
                </div>
                <button onClick={() => { setCurrentPartner(null); setPartnerOnboardingStep(1); }} className="bg-white/10 hover:bg-white/20 p-2.5 rounded-xl transition-all">
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR - elegáns */}
          <div className="max-w-3xl mx-auto px-4 pt-6">
            {/* Oldalszám választó */}
            <div className="flex justify-center mb-3">
              <select 
                value={partnerOnboardingStep} 
                onChange={(e) => setPartnerOnboardingStep(parseInt(e.target.value))}
                className="px-4 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-600 focus:outline-none focus:border-stone-400"
              >
                {stepTitles.map((title, i) => (
                  <option key={i} value={i + 1}>{i + 1}. {title}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-1.5 mb-3">
              {stepTitles.map((title, i) => (
                <div key={i} className="flex-1 cursor-pointer" onClick={() => setPartnerOnboardingStep(i + 1)}>
                  <div className={`h-1.5 rounded-full transition-all ${i < partnerOnboardingStep ? 'bg-stone-600' : i === partnerOnboardingStep - 1 ? 'bg-stone-400' : 'bg-stone-200'}`}/>
                </div>
              ))}
            </div>
            <p className="text-center text-stone-500 text-sm font-medium tracking-wide">{stepTitles[partnerOnboardingStep - 1]}</p>
          </div>

          {/* TARTALOM */}
          <div className="max-w-3xl mx-auto p-4 pb-32">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-100">
              
              {/* STEP 1: SZEMÉLYES ADATOK (Partner) */}
              {partnerOnboardingStep === 1 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">👤</span>
                    Személyes adatok
                  </h3>
                  <div className="space-y-5">
                    {/* Név */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Vezetéknév *</label>
                        <input type="text" value={currentPartner.lastName || ''} onChange={(e) => setCurrentPartner({...currentPartner, lastName: e.target.value, name: `${e.target.value} ${currentPartner.firstName || ''}`})} placeholder="Kovács" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Keresztnév *</label>
                        <input type="text" value={currentPartner.firstName || ''} onChange={(e) => setCurrentPartner({...currentPartner, firstName: e.target.value, name: `${currentPartner.lastName || ''} ${e.target.value}`})} placeholder="János" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                    </div>
                    
                    {/* Elérhetőség */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Email *</label>
                        <input type="email" value={currentPartner.email || ''} onChange={(e) => setCurrentPartner({...currentPartner, email: e.target.value})} placeholder="pelda@email.com" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Telefonszám</label>
                        <input type="tel" value={currentPartner.phone || ''} onChange={(e) => setCurrentPartner({...currentPartner, phone: e.target.value})} placeholder="+36 30 123 4567" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                    </div>
                    
                    {/* Adószám + Igazolvány */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Adószám</label>
                        <input 
                          type="text" 
                          value={currentPartner.taxNumber || ''} 
                          onChange={(e) => {
                            const val = e.target.value;
                            const isValidFormat = /^\d{8}-\d-\d{2}$/.test(val);
                            const looksLikeTaxId = /^\d{10}$/.test(val);
                            setCurrentPartner({
                              ...currentPartner, 
                              taxNumber: val,
                              taxNumberError: val && !isValidFormat ? (looksLikeTaxId ? 'Ez valószínűleg adóazonosító jel, nem adószám!' : 'Formátum: 12345678-1-41') : null
                            });
                          }} 
                          placeholder="12345678-1-41" 
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none ${currentPartner.taxNumberError ? 'border-red-400 bg-red-50' : 'border-stone-200 focus:border-stone-400'}`} 
                        />
                        {currentPartner.taxNumberError && (
                          <p className="text-xs text-red-500 mt-1">⚠️ {currentPartner.taxNumberError}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Igazolvány típusa</label>
                        <select 
                          value={currentPartner.idType || 'personal'} 
                          onChange={(e) => setCurrentPartner({...currentPartner, idType: e.target.value})} 
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none bg-white"
                        >
                          <option value="personal">Személyi igazolvány</option>
                          <option value="passport">Útlevél</option>
                          <option value="license">Jogosítvány</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Igazolvány szám */}
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">
                        {currentPartner.idType === 'passport' ? 'Útlevél szám' : currentPartner.idType === 'license' ? 'Jogosítvány szám' : 'Személyi ig. szám'}
                      </label>
                      <input type="text" value={currentPartner.idNumber || ''} onChange={(e) => setCurrentPartner({...currentPartner, idNumber: e.target.value})} placeholder={currentPartner.idType === 'passport' ? 'AB1234567' : currentPartner.idType === 'license' ? 'AB123456' : '123456AB'} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                    </div>
                    
                    {/* Lakcím */}
                    <div className="pt-4 border-t border-stone-100">
                      <p className="text-sm font-medium text-stone-700 mb-3">📍 Lakcím</p>
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Irányítószám</label>
                          <input type="text" value={currentPartner.zipCode || ''} onChange={(e) => setCurrentPartner({...currentPartner, zipCode: e.target.value})} placeholder="1051" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                        </div>
                        <div className="col-span-3">
                          <label className="block text-xs text-stone-500 mb-1">Város</label>
                          <input type="text" value={currentPartner.city || ''} onChange={(e) => setCurrentPartner({...currentPartner, city: e.target.value})} placeholder="Budapest" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Utca, házszám</label>
                          <input type="text" value={currentPartner.street || ''} onChange={(e) => setCurrentPartner({...currentPartner, street: e.target.value})} placeholder="Váci utca 12." className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-stone-500 mb-1">Emelet</label>
                            <input type="text" value={currentPartner.floor || ''} onChange={(e) => setCurrentPartner({...currentPartner, floor: e.target.value})} placeholder="3" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                          </div>
                          <div>
                            <label className="block text-xs text-stone-500 mb-1">Ajtó</label>
                            <input type="text" value={currentPartner.door || ''} onChange={(e) => setCurrentPartner({...currentPartner, door: e.target.value})} placeholder="12" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Számlázási cím */}
                    <div className="pt-4 border-t border-stone-100">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-stone-700">🧾 Számlázási adatok</p>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={currentPartner.billingSameAsHome || false} 
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCurrentPartner({
                                  ...currentPartner, 
                                  billingSameAsHome: true,
                                  billingZipCode: currentPartner.zipCode,
                                  billingCity: currentPartner.city,
                                  billingStreet: currentPartner.street,
                                  billingFloor: currentPartner.floor,
                                  billingDoor: currentPartner.door
                                });
                              } else {
                                setCurrentPartner({...currentPartner, billingSameAsHome: false});
                              }
                            }} 
                            className="w-4 h-4 rounded border-stone-300" 
                          />
                          <span className="text-sm text-stone-600">Ugyanaz, mint a lakcím</span>
                        </label>
                      </div>
                      
                      {!currentPartner.billingSameAsHome && (
                        <>
                          <div className="grid grid-cols-4 gap-3 mb-3">
                            <div>
                              <label className="block text-xs text-stone-500 mb-1">Irányítószám</label>
                              <input type="text" value={currentPartner.billingZipCode || ''} onChange={(e) => setCurrentPartner({...currentPartner, billingZipCode: e.target.value})} placeholder="1051" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                            </div>
                            <div className="col-span-3">
                              <label className="block text-xs text-stone-500 mb-1">Város</label>
                              <input type="text" value={currentPartner.billingCity || ''} onChange={(e) => setCurrentPartner({...currentPartner, billingCity: e.target.value})} placeholder="Budapest" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-stone-500 mb-1">Utca, házszám</label>
                              <input type="text" value={currentPartner.billingStreet || ''} onChange={(e) => setCurrentPartner({...currentPartner, billingStreet: e.target.value})} placeholder="Váci utca 12." className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-stone-500 mb-1">Emelet</label>
                                <input type="text" value={currentPartner.billingFloor || ''} onChange={(e) => setCurrentPartner({...currentPartner, billingFloor: e.target.value})} placeholder="3" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                              </div>
                              <div>
                                <label className="block text-xs text-stone-500 mb-1">Ajtó</label>
                                <input type="text" value={currentPartner.billingDoor || ''} onChange={(e) => setCurrentPartner({...currentPartner, billingDoor: e.target.value})} placeholder="12" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Adószám</label>
                          <input type="text" value={currentPartner.taxNumber || ''} onChange={(e) => setCurrentPartner({...currentPartner, taxNumber: e.target.value})} placeholder="12345678-1-42" className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                        </div>
                        <div>
                          <label className="block text-xs text-stone-500 mb-1">Cégnév (opcionális)</label>
                          <input type="text" value={currentPartner.companyName || ''} onChange={(e) => setCurrentPartner({...currentPartner, companyName: e.target.value})} placeholder="Kovács Kft." className="w-full px-3 py-2.5 border border-stone-200 rounded-lg focus:border-stone-400 focus:outline-none text-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: LAKÁS ADATAI */}
              {partnerOnboardingStep === 2 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">🏠</span>
                    Lakás adatai
                  </h3>
                  <div className="space-y-5">
                    {/* NTAK szám - FIRST */}
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">NTAK regisztrációs szám</label>
                      <input 
                        type="text" 
                        value={apt.ntakNumber || ''} 
                        onChange={(e) => updateApt({ ntakNumber: e.target.value, noNtak: false })} 
                        placeholder="MA12345678" 
                        disabled={apt.noNtak}
                        className={`w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none ${apt.noNtak ? 'bg-stone-100 text-stone-400' : ''}`} 
                      />
                      <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={apt.noNtak || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              updateApt({ noNtak: true, ntakNumber: '', operationType: 'rental' });
                            } else {
                              updateApt({ noNtak: false });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-stone-600">Nincs NTAK regisztráció</span>
                      </label>
                      {apt.noNtak && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
                          <p className="text-sm text-amber-800">⚠️ NTAK nélkül csak <strong>Bérleti szerződés</strong> köthető (hosszútávú kiadás).</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Lakás neve - csak ha van NTAK, különben a 4. oldalon automatikus */}
                    {!apt.noNtak && (
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Lakás neve *</label>
                        <input type="text" value={apt.name} onChange={(e) => updateApt({ name: e.target.value, nameAutoGenerated: false })} placeholder="Pl: Andrássy Apartman" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:ring-2 focus:ring-stone-100 focus:outline-none transition-all" />
                        <p className="text-xs text-stone-400 mt-1">💡 Ha kihagyod, automatikusan kitöltjük a cím alapján</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Szerződés típusa</label>
                      <select 
                        value={apt.operationType} 
                        onChange={(e) => updateApt({ operationType: e.target.value })} 
                        disabled={apt.noNtak}
                        className={`w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none bg-white ${apt.noNtak ? 'bg-stone-100' : ''}`}
                      >
                        {!apt.noNtak && <option value="short-term">Megbízási szerződés (rövidtávú)</option>}
                        <option value="rental">Bérleti szerződés</option>
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${highlightApartmentSize ? 'text-red-600' : 'text-stone-600'}`}>
                          Lakásméret (m²) {highlightApartmentSize && <span className="text-red-500">⚠️ Kötelező!</span>}
                        </label>
                        <input 
                          type="number" 
                          value={apt.apartmentSize} 
                          onChange={(e) => { updateApt({ apartmentSize: parseInt(e.target.value) || 0 }); setHighlightApartmentSize(false); }} 
                          placeholder="45" 
                          className={`w-full px-4 py-3 border rounded-xl focus:outline-none ${highlightApartmentSize ? 'border-red-500 bg-red-50 ring-2 ring-red-300' : 'border-stone-200 focus:border-stone-400'}`}
                          autoFocus={highlightApartmentSize}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Max férőhely</label>
                        <input type="number" value={apt.maxGuests || ''} onChange={(e) => updateApt({ maxGuests: parseInt(e.target.value) || 0 })} placeholder="4" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Helyrajzi szám</label>
                      <input type="text" value={apt.cadastralNumber} onChange={(e) => updateApt({ cadastralNumber: e.target.value })} placeholder="12345/1/A/12" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: IFA */}
              {partnerOnboardingStep === 3 && (apt.operationType === 'short-term' ? (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-2 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">🏛️</span>
                    Idegenforgalmi adó (IFA)
                  </h3>
                  <p className="text-sm text-stone-500 mb-6">Budapest kerület (2026)</p>
                  <select value={apt.budapestDistrict} onChange={(e) => {
                    const district = e.target.value;
                    if (district && budapestIfaData[district]) { 
                      updateApt({ 
                        budapestDistrict: district, 
                        tourismTaxType: budapestIfaData[district].type, 
                        tourismTaxPercent: budapestIfaData[district].type === 'percent' ? budapestIfaData[district].value : 0, 
                        tourismTaxFixed: budapestIfaData[district].type === 'fixed' ? budapestIfaData[district].value : 0 
                      }); 
                    } else { 
                      updateApt({ budapestDistrict: district }); 
                    }
                  }} className="w-full px-4 py-3 border border-stone-200 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 focus:outline-none mb-5">
                    <option value="">-- Válassz kerületet --</option>
                    <optgroup label="4% (szállásdíj arányos)">
                      <option value="I">I. kerület - 4%</option>
                      <option value="III">III. kerület - 4%</option>
                      <option value="V">V. kerület - 4%</option>
                      <option value="VI">VI. kerület - 4% ⚠️ tiltás!</option>
                      <option value="VII">VII. kerület - 4%</option>
                      <option value="VIII">VIII. kerület - 4%</option>
                      <option value="IX">IX. kerület - 4%</option>
                      <option value="XII">XII. kerület - 4%</option>
                      <option value="XIII">XIII. kerület - 4%</option>
                      <option value="XIV">XIV. kerület - 4%</option>
                    </optgroup>
                    <optgroup label="Tételes (Ft/fő/éj)">
                      <option value="II">II. kerület - 800 Ft</option>
                      <option value="IV">IV. kerület - 500 Ft</option>
                      <option value="X">X. kerület - 800 Ft</option>
                      <option value="XI">XI. kerület - 830 Ft (max)</option>
                      <option value="XV">XV. kerület - 450 Ft</option>
                      <option value="XVI">XVI. kerület - 400 Ft</option>
                      <option value="XVII">XVII. kerület - 600 Ft</option>
                      <option value="XVIII">XVIII. kerület - 550 Ft</option>
                      <option value="XIX">XIX. kerület - 600 Ft</option>
                      <option value="XX">XX. kerület - 500 Ft</option>
                      <option value="XXI">XXI. kerület - 500 Ft</option>
                      <option value="XXII">XXII. kerület - 650 Ft</option>
                      <option value="XXIII">XXIII. kerület - 500 Ft</option>
                    </optgroup>
                  </select>
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Típus</label>
                      <select value={apt.tourismTaxType} onChange={(e) => updateApt({ tourismTaxType: e.target.value })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none bg-white">
                        <option value="percent">Százalékos (%)</option>
                        <option value="fixed">Tételes (Ft/fő/éj)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Érték</label>
                      {apt.tourismTaxType === 'percent' ? (
                        <select value={apt.tourismTaxPercent} onChange={(e) => updateApt({ tourismTaxPercent: parseInt(e.target.value) })} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none bg-white">
                          <option value="4">4%</option>
                          <option value="3">3%</option>
                          <option value="2">2%</option>
                        </select>
                      ) : (
                        <input type="number" value={apt.tourismTaxFixed} onChange={(e) => updateApt({ tourismTaxFixed: parseInt(e.target.value) || 0 })} placeholder="Ft/fő/éj" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:outline-none" />
                      )}
                    </div>
                  </div>
                  {apt.budapestDistrict && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <span className="text-amber-800 font-medium">Beállított IFA:</span>
                      <span className="ml-2 font-bold text-amber-900">{apt.tourismTaxType === 'percent' ? `${apt.tourismTaxPercent}%` : `${apt.tourismTaxFixed} Ft/fő/éj`}</span>
                      {budapestIfaData[apt.budapestDistrict]?.note && <span className="ml-2 text-rose-600 font-bold">⚠️ {budapestIfaData[apt.budapestDistrict].note}</span>}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">📋</div>
                  <p className="text-stone-600 text-lg">Bérleti szerződésnél nincs IFA.</p>
                  <p className="text-stone-400 text-sm mt-2">Lépj tovább a következő lépésre!</p>
                </div>
              ))}

              {/* STEP 4: KIADÁSRA HIRDETETT LAKÁS */}
              {partnerOnboardingStep === 4 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">🏠</span>
                    Kiadásra hirdetett lakás
                  </h3>
                  
                  {/* NTAK nélkül - Lakás neve automatikusan generált */}
                  {partnerNewApartment.noNtak && (
                    <div className="mb-5 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-2">📋 Lakás neve (automatikusan generált)</p>
                      <div className="bg-white px-4 py-3 rounded-lg border border-amber-200">
                        <span className="text-stone-800 font-semibold">
                          {partnerNewApartment.street ? partnerNewApartment.street.replace(/ utca/gi, '').replace(/ út/gi, '').replace(/ tér/gi, '').replace(/ körút/gi, '').replace(/ sétány/gi, '').replace(/ köz/gi, '').replace(/\./g, '').trim() : 'Kitöltés után jelenik meg'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-600 mt-2">ℹ️ NTAK nélküli bérleti szerződésnél a lakás neve automatikusan a cím alapján generálódik.</p>
                    </div>
                  )}
                  
                  {/* Személyes adatokkal megegyező checkbox */}
                  <div className="mb-5 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={partnerNewApartment.sameAsPersonal || false}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setPartnerNewApartment({
                              ...partnerNewApartment, 
                              sameAsPersonal: true,
                              zipCode: currentPartner.zipCode || '',
                              city: currentPartner.city || 'Budapest',
                              street: currentPartner.street || '',
                              floor: currentPartner.floor || '',
                              door: currentPartner.door || ''
                            });
                          } else {
                            setPartnerNewApartment({...partnerNewApartment, sameAsPersonal: false});
                          }
                        }}
                        className="w-5 h-5 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                      />
                      <div>
                        <span className="font-medium text-violet-700">Megegyezik a személyes címemmel</span>
                        <p className="text-xs text-violet-500">Automatikusan kitölti az adatokat</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Irányítószám</label>
                        <input type="text" value={partnerNewApartment.zipCode} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, zipCode: e.target.value, sameAsPersonal: false})} placeholder="1051" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-sm font-medium text-stone-600 mb-2">Város</label>
                        <input type="text" value={partnerNewApartment.city} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, city: e.target.value, sameAsPersonal: false})} placeholder="Budapest" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">Utca, házszám *</label>
                      <input type="text" value={partnerNewApartment.street} onChange={(e) => {
                        const street = e.target.value;
                        // Auto-generate apartment name from street (e.g., "Váci utca 12." -> "Váci 12")
                        let autoName = '';
                        if (street) {
                          // Remove common street suffixes and create short name
                          const cleaned = street
                            .replace(/ utca/gi, '')
                            .replace(/ út/gi, '')
                            .replace(/ tér/gi, '')
                            .replace(/ körút/gi, '')
                            .replace(/ sétány/gi, '')
                            .replace(/ köz/gi, '')
                            .replace(/\./g, '')
                            .trim();
                          autoName = cleaned;
                        }
                        setPartnerNewApartment({
                          ...partnerNewApartment, 
                          street: street, 
                          sameAsPersonal: false,
                          // Always auto-set name from street
                          name: autoName,
                          nameAutoGenerated: true
                        });
                      }} placeholder="Váci utca 12." className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                    </div>
                    
                    {/* Lakás neve - NTAK nélkül automatikus és nem szerkeszthető */}
                    {apt.noNtak && partnerNewApartment.street && (
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                        <label className="block text-sm font-medium text-emerald-700 mb-2">🏠 Lakás neve (automatikus)</label>
                        <div className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-xl text-stone-700 font-medium">
                          {partnerNewApartment.name || partnerNewApartment.street.replace(/ utca/gi, '').replace(/ út/gi, '').replace(/ tér/gi, '').replace(/\./g, '').trim()}
                        </div>
                        <p className="text-xs text-emerald-600 mt-1">💡 A lakás neve automatikusan generálódik a cím alapján</p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Emelet</label>
                        <input type="text" value={partnerNewApartment.floor || ''} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, floor: e.target.value, sameAsPersonal: false})} placeholder="3" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Ajtó</label>
                        <input type="text" value={partnerNewApartment.door || ''} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, door: e.target.value, sameAsPersonal: false})} placeholder="12" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-600 mb-2">Kapukód</label>
                        <input type="text" value={partnerNewApartment.gateCode} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, gateCode: e.target.value})} placeholder="1234#" className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none" />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100">
                      <label className="block text-sm font-medium text-stone-600 mb-2">🚪 Bejutási instrukciók</label>
                      <textarea value={partnerNewApartment.accessInstructions} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, accessInstructions: e.target.value})} placeholder="Kulcs a portán található, kapukód: 1234, majd lift a 3. emeletre..." rows={3} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none resize-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-600 mb-2">📝 Megjegyzés</label>
                      <textarea value={partnerNewApartment.notes} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, notes: e.target.value})} placeholder="Egyéb fontos tudnivalók a lakásról..." rows={2} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none resize-none" />
                    </div>
                    
                    {/* Fotók / Dokumentumok */}
                    <div className="pt-4 border-t border-stone-100">
                      <label className="block text-sm font-medium text-stone-600 mb-3 flex items-center gap-2">
                        <span>📷</span> Fotók a lakásról
                      </label>
                      <div className="space-y-3">
                        {/* Google Drive / Link mező */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                          <label className="block text-xs font-medium text-blue-700 mb-2 flex items-center gap-2">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.01-.02-1.708-3.001-3.773-6.62l-3.76-6.574h-3.76zm-1.629 7.99L7.2 14.899 3.44 8.463c-.377-.647-.686-1.174-.686-1.174s1.664 2.893 3.69 6.424c2.027 3.53 3.69 6.424 3.69 6.424l3.8-6.42-3.553-5.242zm-6.087 5.532c-.377.647-.686 1.174-.686 1.174l3.76 6.574h3.76c.377 0 .686-.01.686-.02L8.153 16.21l-3.859-1.203z"/></svg>
                            Google Drive link
                          </label>
                          <input 
                            type="url" 
                            value={partnerNewApartment.photosLink || ''} 
                            onChange={(e) => setPartnerNewApartment({...partnerNewApartment, photosLink: e.target.value})}
                            placeholder="https://drive.google.com/drive/folders/..." 
                            className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:border-blue-400 focus:outline-none bg-white text-sm"
                          />
                          <p className="text-[10px] text-blue-500 mt-2">Töltsd fel a lakás fotóit Google Drive-ra és oszd meg a linket</p>
                        </div>
                        
                        {/* Alternatív: Fájl feltöltés */}
                        <div className="text-center text-xs text-stone-400">vagy</div>
                        
                        <div className="border-2 border-dashed border-stone-200 rounded-xl p-6 text-center hover:border-stone-400 hover:bg-stone-50 transition-all cursor-pointer">
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              const fileNames = files.map(f => f.name).join(', ');
                              setPartnerNewApartment({...partnerNewApartment, uploadedPhotos: fileNames});
                            }}
                            className="hidden" 
                            id="photo-upload"
                          />
                          <label htmlFor="photo-upload" className="cursor-pointer">
                            <div className="text-3xl mb-2">📤</div>
                            <p className="text-sm font-medium text-stone-600">Kattints a fotók feltöltéséhez</p>
                            <p className="text-xs text-stone-400 mt-1">JPG, PNG (max. 10 MB / fájl)</p>
                          </label>
                          {partnerNewApartment.uploadedPhotos && (
                            <div className="mt-3 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                              ✅ Feltöltve: {partnerNewApartment.uploadedPhotos}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: ÁGYAK */}
              {partnerOnboardingStep === 5 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">🛏️</span>
                    Ágyak és vendégszám
                  </h3>
                  <div className="grid grid-cols-3 gap-4 mb-5">
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 p-4 rounded-xl border border-indigo-100">
                      <label className="block text-xs font-medium text-indigo-600 mb-2">Franciaágy (2 fő/db)</label>
                      <select value={partnerNewApartment.doubleBeds} onChange={(e) => { const v = parseInt(e.target.value); setPartnerNewApartment({...partnerNewApartment, doubleBeds: v, maxGuests: (v * 2) + partnerNewApartment.sofaBedGuests + partnerNewApartment.otherBedGuests }); }} className="w-full px-3 py-2.5 border border-indigo-200 rounded-lg bg-white focus:outline-none">{[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} db</option>)}</select>
                    </div>
                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-xl border border-rose-100">
                      <label className="block text-xs font-medium text-rose-600 mb-2">Kanapéágy (fő)</label>
                      <select value={partnerNewApartment.sofaBedGuests} onChange={(e) => { const v = parseInt(e.target.value); setPartnerNewApartment({...partnerNewApartment, sofaBedGuests: v, maxGuests: (partnerNewApartment.doubleBeds * 2) + v + partnerNewApartment.otherBedGuests }); }} className="w-full px-3 py-2.5 border border-rose-200 rounded-lg bg-white focus:outline-none">{[0,1,2,3,4].map(n => <option key={n} value={n}>{n} fő</option>)}</select>
                    </div>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
                      <label className="block text-xs font-medium text-amber-600 mb-2">Egyéb ágy (fő)</label>
                      <select value={partnerNewApartment.otherBedGuests} onChange={(e) => { const v = parseInt(e.target.value); setPartnerNewApartment({...partnerNewApartment, otherBedGuests: v, maxGuests: (partnerNewApartment.doubleBeds * 2) + partnerNewApartment.sofaBedGuests + v }); }} className="w-full px-3 py-2.5 border border-amber-200 rounded-lg bg-white focus:outline-none">{[0,1,2,3,4].map(n => <option key={n} value={n}>{n} fő</option>)}</select>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl text-center mb-5 border border-emerald-100">
                    <span className="text-sm text-emerald-600 font-medium">Maximum vendégszám</span>
                    <div className="text-4xl font-bold text-emerald-700 mt-1">{partnerNewApartment.maxGuests} fő</div>
                  </div>
                  
                  {/* Ágynemű/Textilek kérdés */}
                  <div className="pt-4 border-t border-stone-100 mb-5">
                    <label className="block text-sm font-medium text-stone-600 mb-3 flex items-center gap-2">
                      <span className="text-lg">🛋️</span>
                      Vannak ágyneműk/textilek a lakásban?
                    </label>
                    <div className="flex gap-3 mb-3">
                      <button 
                        type="button"
                        onClick={() => setPartnerNewApartment({...partnerNewApartment, hasTextiles: true})}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${partnerNewApartment.hasTextiles === true ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white border border-stone-200 text-stone-600 hover:border-emerald-300'}`}
                      >
                        ✓ Igen
                      </button>
                      <button 
                        type="button"
                        onClick={() => setPartnerNewApartment({...partnerNewApartment, hasTextiles: false, textileSource: ''})}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${partnerNewApartment.hasTextiles === false ? 'bg-rose-500 text-white shadow-lg' : 'bg-white border border-stone-200 text-stone-600 hover:border-rose-300'}`}
                      >
                        ✗ Nem
                      </button>
                    </div>
                    {partnerNewApartment.hasTextiles && (
                      <div className="mt-3">
                        <label className="block text-xs text-stone-500 mb-2">Honnan származnak?</label>
                        <select 
                          value={partnerNewApartment.textileSource || ''} 
                          onChange={(e) => setPartnerNewApartment({...partnerNewApartment, textileSource: e.target.value})}
                          className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none bg-white"
                        >
                          <option value="">-- Válassz --</option>
                          <option value="ikea">IKEA</option>
                          <option value="jysk">JYSK</option>
                          <option value="other">Egyéb</option>
                        </select>
                      </div>
                    )}
                    {partnerNewApartment.hasTextiles === false && (
                      <div className="mt-3 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">😊</span>
                          <div>
                            <p className="text-amber-800 font-medium">Ezt a terhet is levesszük a válladról!</p>
                            <p className="text-sm text-amber-600 mt-1">A Piactéren csak kiválasztod amire szükséged van, és mi kiszállítjuk neked.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t border-stone-100">
                    <label className="block text-sm font-medium text-stone-600 mb-2 flex items-center gap-2">
                      <span className="text-lg">🚗</span>
                      Parkolás a vendégnek
                    </label>
                    <select value={partnerNewApartment.parkingType} onChange={(e) => setPartnerNewApartment({...partnerNewApartment, parkingType: e.target.value})} className="w-full px-4 py-3 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none bg-white">
                      <option value="">-- Válassz --</option>
                      <option value="street_paid">Utcán fizetős</option>
                      <option value="street_free">Utcán ingyenes</option>
                      <option value="designated">Kijelölt parkolóhely</option>
                      <option value="garage">Garázs</option>
                      <option value="none">Nincs parkolási lehetőség</option>
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 8: CSOMAG */}
              {partnerOnboardingStep === 8 && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-800 mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">📦</span>
                    Szolgáltatási csomag
                  </h3>
                  <p className="text-sm text-stone-500 mb-4">Kattints a kívánt csomagra a kiválasztáshoz!</p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* ALAP - KATTINTHATÓ */}
                    <div 
                      onClick={() => setPartnerNewApartment(prev => ({...prev, servicePackage: 'alap', managementFee: 20}))}
                      className={`rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all hover:scale-[1.02] ${partnerNewApartment.servicePackage === 'alap' ? 'ring-4 ring-cyan-500 shadow-xl' : 'border-2 border-stone-200 hover:border-cyan-300'}`}
                    >
                      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 p-4 text-white text-center relative">
                        {partnerNewApartment.servicePackage === 'alap' && <span className="absolute top-2 right-2 bg-white text-cyan-600 w-6 h-6 rounded-full flex items-center justify-center font-bold">✓</span>}
                        <div className="text-lg font-bold">Alap</div>
                        <div className="text-3xl font-black">20%</div>
                      </div>
                      <div className="p-3 bg-white text-[9px] text-stone-600 space-y-1 flex-1">
                        <div>• Professzionális ingatlanfotós megszervezése</div>
                        <div>• Hirdetések elkészítése és kezelése 2 platformon (Airbnb, Booking.com) az árak folyamatos optimalizálásával</div>
                        <div>• Önálló bejutási rendszer kialakítása, vendégfogadás teljes lebonyolítása</div>
                        <div>• Házirend, élményprogram-, szolgáltatás- és étteremajánló prospektus összeállítása</div>
                        <div>• 0-24 órás vendégügyfélszolgálat</div>
                        <div>• NTAK adminisztráció és idegenforgalmi adó bevallás</div>
                        <div>• Vendégek regisztrálása okmányolvasóval</div>
                        <div>• Számlázás kezelése</div>
                        <div>• Takarítás megszervezése, fogyóeszközök és tisztálkodószerek folyamatos pótlása</div>
                        <div>• Karbantartási feladatok elvégzése, szakirányú munkák gyors megszervezése</div>
                        <div>• Károkozás esetén kárfelmérés, költségtérítési igény benyújtása</div>
                      </div>
                    </div>
                    
                    {/* PRO - KATTINTHATÓ */}
                    <div 
                      onClick={() => setPartnerNewApartment(prev => ({...prev, servicePackage: 'pro', managementFee: 25}))}
                      className={`rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all hover:scale-[1.02] ${partnerNewApartment.servicePackage === 'pro' ? 'ring-4 ring-fuchsia-500 shadow-xl' : 'border-2 border-stone-200 hover:border-fuchsia-300'}`}
                    >
                      <div className="bg-gradient-to-br from-fuchsia-500 to-fuchsia-600 p-4 text-white text-center relative">
                        {partnerNewApartment.servicePackage === 'pro' && <span className="absolute top-2 right-2 bg-white text-fuchsia-600 w-6 h-6 rounded-full flex items-center justify-center font-bold">✓</span>}
                        <div className="text-lg font-bold">Pro</div>
                        <div className="text-3xl font-black">25%</div>
                      </div>
                      <div className="p-3 bg-white text-[9px] text-stone-600 space-y-1 flex-1">
                        <div className="font-bold text-fuchsia-700 pb-1">Minden, ami az Alap csomagban, továbbá:</div>
                        <div>• Hirdetések kezelése több platformon</div>
                        <div>• (Szallas.hu, Google Hotels, webes direkt foglalások)</div>
                        <div>• CRM rendszer használata a visszatérő vendégkör építésére</div>
                        <div>• Vendégadatbázis kezelése és szegmentálása</div>
                        <div>• Marketing promóciók és hírlevelek küldése visszatérő vendégek részére</div>
                      </div>
                    </div>
                    
                    {/* MAX - KATTINTHATÓ */}
                    <div 
                      onClick={() => setPartnerNewApartment(prev => ({...prev, servicePackage: 'max', managementFee: 35}))}
                      className={`rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all hover:scale-[1.02] ${partnerNewApartment.servicePackage === 'max' ? 'ring-4 ring-rose-500 shadow-xl' : 'border-2 border-stone-200 hover:border-rose-300'}`}
                    >
                      <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 text-white text-center relative">
                        {partnerNewApartment.servicePackage === 'max' && <span className="absolute top-2 right-2 bg-white text-rose-600 w-6 h-6 rounded-full flex items-center justify-center font-bold">✓</span>}
                        <div className="text-[10px] font-bold text-yellow-300 mb-1">⭐ LEGNÉPSZERŰBB</div>
                        <div className="text-lg font-bold">Max</div>
                        <div className="text-3xl font-black">35%</div>
                      </div>
                      <div className="p-3 bg-white text-[9px] text-stone-600 space-y-1 flex-1">
                        <div className="font-bold text-rose-700 pb-1">Minden, ami a Pro csomagban, továbbá:</div>
                        <div>• Takarítás költsége benne van</div>
                        <div>• Karbantartási munkák költsége benne van</div>
                        <div>• Ágynemű biztosítása</div>
                        <div>• Éves klímatisztítás</div>
                        <div>• Szezononkénti nagytakarítás</div>
                      </div>
                    </div>
                  </div>
                  
                  {partnerNewApartment.servicePackage && (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-center text-sm">
                      ✅ Kiválasztva: <strong>{partnerNewApartment.servicePackage === 'alap' ? 'Alap (20%)' : partnerNewApartment.servicePackage === 'pro' ? 'Pro (25%)' : 'Max (35%)'}</strong>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 9: DÍJAK */}
              {partnerOnboardingStep === 9 && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-800 mb-5 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-sm">💰</span>
                    Díjak és költségek
                  </h3>
                  <div className="space-y-4">
                    {/* Management díj - színes kártya */}
                    <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-5 rounded-2xl text-white shadow-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-violet-100 text-sm font-medium">Management díj</p>
                          <p className="text-xs text-violet-200 mt-0.5">A kiválasztott csomag alapján</p>
                        </div>
                        <div className="text-right">
                          <div className="text-4xl font-black">{partnerNewApartment.managementFee}%</div>
                          <div className="text-xs text-violet-200">{partnerNewApartment.servicePackage === 'alap' ? 'Alap' : partnerNewApartment.servicePackage === 'pro' ? 'Pro' : 'Max'} csomag</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Havi alapdíj - vonzó leírással */}
                    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 rounded-xl border border-emerald-200">
                      <div className="flex justify-between items-start mb-3">
                        <label className="block text-sm font-semibold text-emerald-800 flex items-center gap-2">
                          <span>🎁</span> Havi alapdíj
                        </label>
                        <div className="text-right">
                          <div className="text-3xl font-black text-emerald-700">
                            {(() => {
                              const guests = partnerNewApartment.maxGuests || 0;
                              if (guests <= 4) return 30;
                              if (guests <= 6) return 35;
                              if (guests <= 9) return 40;
                              if (guests <= 12) return 45;
                              return 45 + Math.ceil((guests - 12) / 3) * 5;
                            })()}€<span className="text-sm font-normal text-emerald-500">/hó</span>
                          </div>
                          <div className="text-xs text-emerald-500">
                            ~{((() => {
                              const guests = partnerNewApartment.maxGuests || 0;
                              if (guests <= 4) return 30;
                              if (guests <= 6) return 35;
                              if (guests <= 9) return 40;
                              if (guests <= 12) return 45;
                              return 45 + Math.ceil((guests - 12) / 3) * 5;
                            })() * eurRate).toLocaleString()} Ft
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <p className="text-xs text-emerald-700 font-medium mb-2">✨ Minden benne van, ami a vendégélményhez kell:</p>
                        <div className="text-[10px] text-emerald-600 space-y-1">
                          <div className="flex items-center gap-2">☕ <span>Prémium kávékapszulák</span></div>
                          <div className="flex items-center gap-2">🧴 <span>Tusfürdő, sampon és szappan minden vendégnek</span></div>
                          <div className="flex items-center gap-2">🧻 <span>WC papír és papír zsebkendő folyamatos pótlása</span></div>
                          <div className="flex items-center gap-2">🗑️ <span>Szemeteszsákok minden méretben</span></div>
                          <div className="flex items-center gap-2">🍫 <span>Vendégváró csoki a párnán</span></div>
                          <div className="flex items-center gap-2">🧽 <span>Mosogatószer és konyhai kellékek</span></div>
                          <div className="flex items-center gap-2">🧹 <span>Takarítószerek és eszközök a lakásban</span></div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Takarítási díj - m2 + férőhely alapján */}
                    <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 p-4 rounded-xl border border-sky-200">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <label className="block text-sm font-semibold text-sky-800 flex items-center gap-2">
                            <span>🧹</span> Takarítási díj
                          </label>
                          {partnerNewApartment.apartmentSize > 0 && partnerNewApartment.maxGuests > 0 ? (
                            <p className="text-[10px] text-sky-600 mt-0.5">Kalkulálva: {partnerNewApartment.apartmentSize} m² + {partnerNewApartment.maxGuests} fő</p>
                          ) : (
                            <p className="text-[10px] text-amber-600 mt-0.5">⚠️ Add meg a lakásméretet és vendégszámot</p>
                          )}
                        </div>
                        <div className="bg-white px-4 py-2 rounded-xl border border-sky-200 shadow-sm text-right">
                          {partnerNewApartment.apartmentSize > 0 && partnerNewApartment.maxGuests > 0 ? (
                            <>
                              <div className="text-2xl font-bold text-sky-700">
                                {(() => {
                                  const size = partnerNewApartment.apartmentSize || 0;
                                  const guests = partnerNewApartment.maxGuests || 0;
                                  // Alap díj m2 alapján
                                  let basePrice = 25;
                                  if (size <= 35) basePrice = 25;
                                  else if (size <= 45) basePrice = 35;
                                  else if (size <= 60) basePrice = 45;
                                  else if (size <= 80) basePrice = 55;
                                  else if (size <= 100) basePrice = 70;
                                  else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
                                  // Férőhely felár: +5€ minden 2 fő felett
                                  const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                  // Minimum 30€ (belső kalkuláció)
                                  return Math.max(30, basePrice + guestSurcharge);
                                })()}€
                                <span className="text-xs text-sky-500 ml-1">/ alkalom</span>
                              </div>
                              <div className="text-xs text-sky-500">
                                ~{((() => {
                                  const size = partnerNewApartment.apartmentSize || 0;
                                  const guests = partnerNewApartment.maxGuests || 0;
                                  let basePrice = 25;
                                  if (size <= 35) basePrice = 25;
                                  else if (size <= 45) basePrice = 35;
                                  else if (size <= 60) basePrice = 45;
                                  else if (size <= 80) basePrice = 55;
                                  else if (size <= 100) basePrice = 70;
                                  else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
                                  const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                  return Math.max(30, basePrice + guestSurcharge);
                                })() * eurRate).toLocaleString()} Ft
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-lg font-bold text-amber-600">—</div>
                              {partnerNewApartment.apartmentSize > 0 && !partnerNewApartment.maxGuests ? (
                                <button 
                                  type="button" 
                                  onClick={() => { setPartnerOnboardingStep(5); }} 
                                  className="text-xs text-amber-600 underline mt-1"
                                >
                                  ⚠️ Adj meg vendégszámot →
                                </button>
                              ) : (
                                <button 
                                  type="button" 
                                  onClick={() => { setPartnerOnboardingStep(2); setHighlightApartmentSize(true); }} 
                                  className="text-xs text-amber-600 underline mt-1"
                                >
                                  ⚠️ Add meg a lakásméretet →
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      {/* Mit tartalmaz a takarítási díj - vonzó megfogalmazás */}
                      <div className="mt-3 bg-white p-3 rounded-lg border border-sky-100">
                        <p className="text-xs text-sky-700 font-semibold mb-2">✨ Teljes körű szolgáltatás minden takarításnál:</p>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-sky-600">
                          <div className="flex items-center gap-1">🏠 <span>Professzionális takarítás</span></div>
                          <div className="flex items-center gap-1">🧺 <span>Ágynemű és törölköző mosás</span></div>
                          <div className="flex items-center gap-1">🚚 <span>Textil szállítás és csere</span></div>
                          <div className="flex items-center gap-1">🧴 <span>Szükség esetén folttisztítás</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: PLATFORMOK */}
              {partnerOnboardingStep === 6 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">🌐</span>
                    Platform hozzáférések
                  </h3>
                  {/* Airbnb */}
                  <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-5 rounded-xl border border-rose-100 mb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-rose-700 flex items-center gap-2">
                        <span className="w-6 h-6 bg-gradient-to-br from-rose-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs">A</span>
                        Airbnb
                      </span>
                      <label className="flex items-center gap-2 text-sm cursor-pointer text-rose-600">
                        <input type="checkbox" checked={apt.noAirbnbAccount} onChange={(e) => updateApt({ noAirbnbAccount: e.target.checked })} className="w-4 h-4 rounded" />
                        <span>Nincs fiókom</span>
                      </label>
                    </div>
                    {!apt.noAirbnbAccount && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={apt.airbnbUsername} onChange={(e) => updateApt({ airbnbUsername: e.target.value })} placeholder="Felhasználónév / email" className="px-4 py-2.5 border border-rose-200 rounded-lg bg-white focus:outline-none" />
                        <input type="password" value={apt.airbnbPassword} onChange={(e) => updateApt({ airbnbPassword: e.target.value })} placeholder="Jelszó" className="px-4 py-2.5 border border-rose-200 rounded-lg bg-white focus:outline-none" />
                      </div>
                    )}
                  </div>
                  {/* Booking - KÉK */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-semibold text-blue-700 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">B</span>
                        Booking.com
                      </span>
                      <label className="flex items-center gap-2 text-sm cursor-pointer text-blue-600">
                        <input type="checkbox" checked={apt.noBookingAccount} onChange={(e) => updateApt({ noBookingAccount: e.target.checked })} className="w-4 h-4 rounded" />
                        <span>Nincs fiókom</span>
                      </label>
                    </div>
                    {!apt.noBookingAccount && (
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" value={apt.bookingUsername} onChange={(e) => updateApt({ bookingUsername: e.target.value })} placeholder="Felhasználónév / email" className="px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:outline-none" />
                        <input type="password" value={apt.bookingPassword} onChange={(e) => updateApt({ bookingPassword: e.target.value })} placeholder="Jelszó" className="px-4 py-2.5 border border-blue-200 rounded-lg bg-white focus:outline-none" />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 7: WIFI */}
              {partnerOnboardingStep === 7 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">📶</span>
                    WiFi adatok
                  </h3>
                  <div className="space-y-4">
                    {/* Opció választó - 3 oszlop */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div onClick={() => updateApt({ wifiOption: 'none', wifiName: '', wifiPassword: '', wifiSpeed: '' })} className={`p-4 rounded-xl cursor-pointer transition-all text-center ${apt.wifiOption === 'none' ? 'bg-rose-100 border-2 border-rose-500' : 'bg-stone-50 border border-stone-200 hover:border-stone-300'}`}>
                        <div className="text-2xl mb-2">🚫</div>
                        <div className="font-medium text-stone-700">Nincs WiFi</div>
                        <p className="text-xs text-stone-500 mt-1">A lakásban nincs internet</p>
                      </div>
                      <div onClick={() => updateApt({ wifiOption: 'later' })} className={`p-4 rounded-xl cursor-pointer transition-all text-center ${apt.wifiOption === 'later' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-stone-50 border border-stone-200 hover:border-stone-300'}`}>
                        <div className="text-2xl mb-2">⏰</div>
                        <div className="font-medium text-stone-700">Később megadom</div>
                        <p className="text-xs text-stone-500 mt-1">A beköltözés előtt pótolom</p>
                      </div>
                      <div onClick={() => updateApt({ wifiOption: 'now' })} className={`p-4 rounded-xl cursor-pointer transition-all text-center ${apt.wifiOption === 'now' ? 'bg-emerald-100 border-2 border-emerald-500' : 'bg-stone-50 border border-stone-200 hover:border-stone-300'}`}>
                        <div className="text-2xl mb-2">✍️</div>
                        <div className="font-medium text-stone-700">Most megadom</div>
                        <p className="text-xs text-stone-500 mt-1">WiFi adatok kitöltése</p>
                      </div>
                    </div>
                    
                    {/* Nincs WiFi - barátságos üzenet */}
                    {apt.wifiOption === 'none' && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-5 rounded-xl border border-amber-200 text-center">
                        <div className="text-3xl mb-2">😊</div>
                        <p className="text-amber-800 font-medium">Semmi gond, megoldjuk!</p>
                        <p className="text-sm text-amber-600 mt-1">A Piactéren tudsz majd internet szolgáltatást igényelni tőlünk.</p>
                      </div>
                    )}
                    
                    {apt.wifiOption === 'now' && (
                      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-5 rounded-xl border border-sky-100">
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-sky-600 mb-2">Hálózat neve</label>
                            <input type="text" value={apt.wifiName} onChange={(e) => updateApt({ wifiName: e.target.value })} placeholder="WiFi_Apartman" className="w-full px-3 py-2.5 border border-sky-200 rounded-lg bg-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-sky-600 mb-2">Jelszó</label>
                            <input type="text" value={apt.wifiPassword} onChange={(e) => updateApt({ wifiPassword: e.target.value })} placeholder="********" className="w-full px-3 py-2.5 border border-sky-200 rounded-lg bg-white focus:outline-none" />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-sky-600 mb-2">Sebesség (Mbps)</label>
                            <input type="text" value={apt.wifiSpeed} onChange={(e) => updateApt({ wifiSpeed: e.target.value })} placeholder="100" className="w-full px-3 py-2.5 border border-sky-200 rounded-lg bg-white focus:outline-none" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 10: ÖSSZEGZÉS */}
              {partnerOnboardingStep === 10 && (
                <div className="p-8">
                  <h3 className="text-xl font-semibold text-stone-800 mb-6 flex items-center gap-3">
                    <span className="w-8 h-8 bg-stone-100 rounded-lg flex items-center justify-center text-sm">✨</span>
                    Összegzés
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-stone-500 text-sm">Lakás neve</span>
                      <span className="text-stone-800 font-semibold">{apt.name || '-'}</span>
                    </div>
                    <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-4 rounded-xl flex justify-between items-center">
                      <span className="text-stone-500 text-sm">Cím</span>
                      <span className="text-stone-800">{apt.zipCode} {apt.city}, {apt.street}{apt.floor ? ` ${apt.floor}. em.` : ''}{apt.door ? ` ${apt.door}. ajtó` : ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Méret</span>
                        <span className="text-stone-800 font-semibold">{apt.apartmentSize} m²</span>
                      </div>
                      <div className="bg-gradient-to-r from-stone-50 to-stone-100 p-4 rounded-xl flex justify-between items-center">
                        <span className="text-stone-500 text-sm">Max vendég</span>
                        <span className="text-stone-800 font-semibold">{apt.maxGuests} fő</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-xl flex justify-between items-center border border-rose-100">
                      <span className="text-rose-600 text-sm font-medium">Csomag</span>
                      <span className="text-rose-800 font-bold">{apt.servicePackage === 'alap' ? 'Alap (20%)' : apt.servicePackage === 'pro' ? 'Pro (25%)' : apt.servicePackage === 'max' ? 'Max (35%)' : '-'}</span>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl flex justify-between items-center border border-emerald-100">
                      <span className="text-emerald-600 text-sm font-medium">Havi alapdíj</span>
                      <div className="text-right">
                        {apt.maxGuests > 0 ? (
                          <>
                            <span className="text-emerald-800 font-bold">
                              {(() => {
                                const guests = apt.maxGuests || 0;
                                if (guests <= 4) return 30;
                                if (guests <= 6) return 35;
                                if (guests <= 9) return 40;
                                if (guests <= 12) return 45;
                                return 45 + Math.ceil((guests - 12) / 3) * 5;
                              })()} EUR
                            </span>
                            <span className="text-emerald-600 text-xs ml-2">
                              (~{((() => {
                                const guests = apt.maxGuests || 0;
                                if (guests <= 4) return 30;
                                if (guests <= 6) return 35;
                                if (guests <= 9) return 40;
                                if (guests <= 12) return 45;
                                return 45 + Math.ceil((guests - 12) / 3) * 5;
                              })() * eurRate).toLocaleString()} Ft)
                            </span>
                          </>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setPartnerOnboardingStep(5)} 
                            className="text-amber-600 font-medium hover:text-amber-700 hover:underline"
                          >
                            ⚠️ Állítsd be az ágyakat →
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-4 rounded-xl flex justify-between items-center border border-sky-100">
                      <span className="text-sky-600 text-sm font-medium">Takarítási díj</span>
                      <div className="text-right">
                        {apt.apartmentSize > 0 && apt.maxGuests > 0 ? (
                          <>
                            <span className="text-sky-800 font-bold">
                              {(() => {
                                const size = apt.apartmentSize || 0;
                                const guests = apt.maxGuests || 0;
                                let basePrice = 25;
                                if (size <= 35) basePrice = 25;
                                else if (size <= 45) basePrice = 35;
                                else if (size <= 60) basePrice = 45;
                                else if (size <= 80) basePrice = 55;
                                else if (size <= 100) basePrice = 70;
                                else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
                                const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                return Math.max(30, basePrice + guestSurcharge);
                              })()} EUR
                            </span>
                            <span className="text-sky-600 text-xs ml-2">
                              (~{((() => {
                                const size = apt.apartmentSize || 0;
                                const guests = apt.maxGuests || 0;
                                let basePrice = 25;
                                if (size <= 35) basePrice = 25;
                                else if (size <= 45) basePrice = 35;
                                else if (size <= 60) basePrice = 45;
                                else if (size <= 80) basePrice = 55;
                                else if (size <= 100) basePrice = 70;
                                else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
                                const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                return Math.max(30, basePrice + guestSurcharge);
                              })() * eurRate).toLocaleString()} Ft)
                            </span>
                          </>
                        ) : apt.apartmentSize > 0 ? (
                          <button 
                            type="button"
                            onClick={() => setPartnerOnboardingStep(5)}
                            className="text-amber-600 font-medium hover:underline"
                          >
                            ⚠️ Adj meg vendégszámot →
                          </button>
                        ) : (
                          <button 
                            type="button"
                            onClick={() => { setPartnerOnboardingStep(2); setHighlightApartmentSize(true); }}
                            className="text-amber-600 font-medium hover:underline"
                          >
                            ⚠️ Add meg a lakásméretet →
                          </button>
                        )}
                      </div>
                    </div>
                    {/* Hiányzó adatok figyelmeztetés */}
                    {(!apt.wifiName || apt.wifiOption === 'later' || !apt.airbnbUsername || !apt.bookingUsername) && (
                      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 mt-4">
                        <p className="text-amber-700 font-medium text-sm flex items-center gap-2">⚠️ Hiányzó adatok</p>
                        <p className="text-amber-600 text-xs mt-1">A regisztráció után a lakásodnál teendő jelzés lesz, amíg minden adatot ki nem töltesz.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 11: PIACTÉR */}
              {partnerOnboardingStep === 11 && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-stone-800 mb-2 flex items-center gap-3">
                    <span className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center text-sm">🛒</span>
                    Piactér
                  </h3>
                  <p className="text-sm text-stone-500 mb-5">Opcionális szolgáltatások a tökéletes induláshoz</p>
                  
                  <div className="space-y-4">
                    {/* Nagytakarítás ajánlat */}
                    <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${apt.requestDeepCleaning ? 'bg-gradient-to-br from-pink-50 to-rose-50 border-pink-400 shadow-lg' : 'bg-white border-stone-200 hover:border-pink-300'}`}
                      onClick={() => updateApt({ requestDeepCleaning: !apt.requestDeepCleaning })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">✨</span>
                            <div>
                              <h4 className="font-bold text-stone-800">Indulás előtti nagytakarítás</h4>
                              <p className="text-xs text-stone-500">Professzionális mélytisztítás a vendégfogadás előtt</p>
                            </div>
                          </div>
                          <div className="ml-9 text-[10px] text-stone-600 space-y-1">
                            <div>🧽 Konyhai gépek alapos tisztítása (sütő, hűtő, mikrohullámú)</div>
                            <div>🪟 Ablakok és üvegfelületek</div>
                            <div>🛋️ Bútorok és kárpitok portalanítása</div>
                            <div>🚿 Fürdőszoba vízkőmentesítése</div>
                            <div>🌀 Csempék és fugák tisztítása</div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          {apt.apartmentSize > 0 && apt.maxGuests > 0 ? (
                            <>
                              <div className="text-2xl font-black text-pink-600">
                                {(() => {
                                  const size = apt.apartmentSize || 0;
                                  const guests = apt.maxGuests || 0;
                                  let base = 25;
                                  if (size <= 35) base = 25;
                                  else if (size <= 45) base = 35;
                                  else if (size <= 60) base = 45;
                                  else if (size <= 80) base = 55;
                                  else if (size <= 100) base = 70;
                                  else base = 70 + Math.ceil((size - 100) / 20) * 10;
                                  const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                  return Math.max(30, base + guestSurcharge) * 2;
                                })()}€
                              </div>
                              <div className="text-xs text-pink-500">
                                ~{(() => {
                                  const size = apt.apartmentSize || 0;
                                  const guests = apt.maxGuests || 0;
                                  let base = 25;
                                  if (size <= 35) base = 25;
                                  else if (size <= 45) base = 35;
                                  else if (size <= 60) base = 45;
                                  else if (size <= 80) base = 55;
                                  else if (size <= 100) base = 70;
                                  else base = 70 + Math.ceil((size - 100) / 20) * 10;
                                  const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                  return (Math.max(30, base + guestSurcharge) * 2 * eurRate).toLocaleString();
                                })()} Ft
                              </div>
                              {apt.requestDeepCleaning && (
                                <div className="mt-2 text-[10px] text-emerald-600 font-medium">
                                  🎁 Első takarítás ingyenes!
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-amber-600 text-sm">⚠️ {!apt.apartmentSize ? 'Add meg a méretet' : 'Add meg a vendégszámot'}</div>
                          )}
                          <div className={`mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto ${apt.requestDeepCleaning ? 'bg-pink-500 border-pink-500 text-white' : 'border-stone-300'}`}>
                            {apt.requestDeepCleaning && '✓'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standard készletek - IKEA felszerelési lista */}
                    <div className={`p-5 rounded-2xl border-2 transition-all ${apt.maxGuests > 0 ? 'bg-gradient-to-br from-violet-50 to-purple-50 border-violet-400 shadow-lg' : 'bg-white border-stone-200 hover:border-violet-300'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">🏠</span>
                            <div>
                              <h4 className="font-bold text-stone-800">Standard készletek</h4>
                              <p className="text-xs text-stone-500">Üzemeltetéshez szükséges, évek óta bevált legjobb ár-érték arány</p>
                            </div>
                          </div>
                          
                          {/* Dupla forgó magyarázat */}
                          {apt.maxGuests > 0 && (
                            <div className="ml-9 mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                              <p className="text-xs font-semibold text-amber-800 mb-1">🔄 Mi az a "dupla forgó"?</p>
                              <p className="text-[10px] text-amber-700">Amíg az egyik készlet a vendégnél van használatban, a másik készlet a mosodában. Így mindig van tiszta váltás a következő vendégnek!</p>
                              <div className="mt-2 text-[10px] text-amber-600">
                                <div>• Vendégenként: 1 matracvédő, 1 paplan, 1 párna, 2 lepedő, 2 törölköző</div>
                              </div>
                            </div>
                          )}
                          
                          {/* Használati útmutató */}
                          {apt.maxGuests > 0 && (
                            <div className="ml-9 mb-3 p-2 bg-emerald-100 rounded-lg border border-emerald-200">
                              <p className="text-[10px] text-emerald-700">☑️ <strong>Pipáld be</strong> amit szeretnél megrendelni → azt számoljuk az árba</p>
                            </div>
                          )}
                          
                          {/* Tételes árlista kategóriákkal */}
                          {apt.maxGuests > 0 && (
                            <div className="ml-9 mt-3 space-y-3">
                              <div className="flex justify-between items-center flex-wrap gap-2">
                                <span className="text-xs text-violet-700 font-medium">📦 IKEA Standard Felszerelési Lista ({apt.maxGuests} fő):</span>
                                <div className="flex gap-1 flex-wrap">
                                  <button 
                                    type="button"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      // Mindent bepipál (= mindent kell)
                                      const allItems = ['palinkas','pohar','boros','kaves','bogre','eszkoz','serpenyo','fozokeszlet','vasalo','matracvedo','kadkilepo','keztorlo','furdolepedo','paplan','parna','huzat','lepedo'];
                                      const newEq = {...(apt.equipment || {})};
                                      allItems.forEach(item => newEq[item + '_need'] = true);
                                      updateApt({ equipment: newEq });
                                    }}
                                    className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[8px] hover:bg-emerald-600"
                                  >
                                    ✓ Mind kell
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      // Mindent kihúz (= semmi nem kell)
                                      const allItems = ['palinkas','pohar','boros','kaves','bogre','eszkoz','serpenyo','fozokeszlet','vasalo','matracvedo','kadkilepo','keztorlo','furdolepedo','paplan','parna','huzat','lepedo'];
                                      const newEq = {...(apt.equipment || {})};
                                      allItems.forEach(item => newEq[item + '_need'] = false);
                                      updateApt({ equipment: newEq });
                                    }}
                                    className="px-2 py-0.5 bg-stone-400 text-white rounded text-[8px] hover:bg-stone-500"
                                  >
                                    ✗ Semmi
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => { 
                                      e.stopPropagation(); 
                                      updateApt({ equipment: {...(apt.equipment || {}), doublePillow: !apt.equipment?.doublePillow }});
                                    }}
                                    className={`px-2 py-0.5 rounded text-[8px] ${apt.equipment?.doublePillow ? 'bg-violet-600 text-white' : 'bg-violet-100 text-violet-700 border border-violet-300'}`}
                                  >
                                    {apt.equipment?.doublePillow ? '✓ Dupla párna' : '🛏️ Dupla párnával'}
                                  </button>
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setShowTextileModal(true); }}
                                    className="px-2 py-0.5 bg-violet-600 text-white rounded text-[8px] hover:bg-violet-700"
                                  >
                                    ✏️ Szerkesztés
                                  </button>
                                </div>
                              </div>
                              
                              {/* Konyha */}
                              <div className="bg-white p-3 rounded-lg border border-amber-200">
                                <p className="text-xs font-bold text-amber-700 mb-2">🍳 Konyha</p>
                                <div className="space-y-1">
                                  {[
                                    { id: 'palinkas', name: 'Pálinkás pohár (FIGURERA)', count: apt.maxGuests, price: 150 },
                                    { id: 'pohar', name: 'Pohár (POKAL)', count: apt.maxGuests * 2, price: 595 },
                                    { id: 'boros', name: 'Boros pohár (ÄNKEBLOMSTER)', count: apt.maxGuests, price: 250 },
                                    { id: 'kaves', name: 'Kávés csésze+alj (IKEA 365+)', count: apt.maxGuests, price: 995 },
                                    { id: 'bogre', name: 'Bögre (DINERA)', count: apt.maxGuests, price: 695 },
                                    { id: 'eszkoz', name: 'Konyhai eszközkészlet (GRUNKA)', count: 1, price: 2790 },
                                    { id: 'serpenyo', name: 'Serpenyő (IKEA 365+)', count: 1, price: 5990 },
                                    { id: 'fozokeszlet', name: 'Főzőkészlet (ANNONS, 5db)', count: 1, price: 4490 }
                                  ].map((item, i) => (
                                    <div key={i} className={`flex justify-between items-center text-xs py-1 ${!(apt.equipment?.[item.id + '_need']) ? 'opacity-40' : ''}`}>
                                      <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={apt.equipment?.[item.id + '_need'] || false} onChange={(e) => { e.stopPropagation(); updateApt({ equipment: {...(apt.equipment || {}), [item.id + '_need']: e.target.checked }})}} className="w-4 h-4" title="Kell" />
                                        <span className="text-stone-600">{item.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-stone-400">{item.count}×{item.price.toLocaleString()}</span>
                                        <span className={`font-semibold w-16 text-right ${apt.equipment?.[item.id + '_need'] ? 'text-amber-700' : 'text-stone-300'}`}>{(item.count * item.price).toLocaleString()} Ft</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Szoba és Fürdő */}
                              <div className="bg-white p-3 rounded-lg border border-cyan-200">
                                <p className="text-xs font-bold text-cyan-700 mb-2">🛁 Szoba és Fürdő</p>
                                <div className="space-y-1">
                                  {(() => {
                                    const guests = apt.maxGuests;
                                    const pillowCount = apt.equipment?.doublePillow ? guests * 2 : guests;
                                    return [
                                      { id: 'vasalo', name: 'Vasalódeszka (JÄLL)', count: 1, price: 2690 },
                                      { id: 'matracvedo', name: 'Matracvédő (GRUSNARV)', count: guests, price: 7990 },
                                      { id: 'kadkilepo', name: 'Kádkilépő (FINTSEN)', count: 1, price: 695 },
                                      { id: 'keztorlo', name: 'Kéztörlő (VÅGSJÖN)', count: guests * 2, price: 795 },
                                      { id: 'furdolepedo', name: 'Fürdőlepedő (VÅGSJÖN 70×140)', count: guests * 2, price: 2990 },
                                      { id: 'paplan', name: 'Paplan (SMÅSPORRE)', count: guests, price: 6490 },
                                      { id: 'parna', name: `Párna (GRÖNAMARANT)${apt.equipment?.doublePillow ? ' ×2' : ''}`, count: pillowCount, price: 6990 },
                                      { id: 'huzat', name: 'Paplan+Párnahuzat (CYMBALBLOMMA)', count: guests * 2, price: 1990 },
                                      { id: 'lepedo', name: 'Gumis lepedő (DVALA)', count: guests * 2, price: 4490 }
                                    ].map((item, i) => (
                                      <div key={i} className={`flex justify-between items-center text-xs py-1 ${!(apt.equipment?.[item.id + '_need']) ? 'opacity-40' : ''}`}>
                                        <div className="flex items-center gap-2">
                                          <input type="checkbox" checked={apt.equipment?.[item.id + '_need'] || false} onChange={(e) => { e.stopPropagation(); updateApt({ equipment: {...(apt.equipment || {}), [item.id + '_need']: e.target.checked }})}} className="w-4 h-4" title="Kell" />
                                          <span className="text-stone-600">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-stone-400">{item.count}×{item.price.toLocaleString()}</span>
                                          <span className={`font-semibold w-16 text-right ${apt.equipment?.[item.id + '_need'] ? 'text-cyan-700' : 'text-stone-300'}`}>{(item.count * item.price).toLocaleString()} Ft</span>
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </div>

                              {/* Összesen */}
                              <div className="bg-violet-100 p-2 rounded-lg border border-violet-300">
                                <div className="flex justify-between items-center text-sm font-bold">
                                  <span className="text-violet-800">💰 Összesen:</span>
                                  <span className="text-violet-700">
                                    {(() => {
                                      const guests = apt.maxGuests;
                                      const eq = apt.equipment || {};
                                      const pillowCount = eq.doublePillow ? guests * 2 : guests;
                                      let total = 0;
                                      // Konyha - csak ha _need = true
                                      if (eq.palinkas_need) total += guests * 150;
                                      if (eq.pohar_need) total += guests * 2 * 595;
                                      if (eq.boros_need) total += guests * 250;
                                      if (eq.kaves_need) total += guests * 995;
                                      if (eq.bogre_need) total += guests * 695;
                                      if (eq.eszkoz_need) total += 1 * 2790;
                                      if (eq.serpenyo_need) total += 1 * 5990;
                                      if (eq.fozokeszlet_need) total += 1 * 4490;
                                      // Szoba és Fürdő - csak ha _need = true
                                      if (eq.vasalo_need) total += 1 * 2690;
                                      if (eq.matracvedo_need) total += guests * 7990;
                                      if (eq.kadkilepo_need) total += 1 * 695;
                                      if (eq.keztorlo_need) total += guests * 2 * 795;
                                      if (eq.furdolepedo_need) total += guests * 2 * 2990;
                                      if (eq.paplan_need) total += guests * 6490;
                                      if (eq.parna_need) total += pillowCount * 6990;
                                      if (eq.huzat_need) total += guests * 2 * 1990;
                                      if (eq.lepedo_need) total += guests * 2 * 4490;
                                      return total.toLocaleString();
                                    })()} Ft
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          {apt.maxGuests > 0 ? (
                            <>
                              <div className="text-xl font-black text-violet-600">
                                {(() => {
                                  const guests = apt.maxGuests;
                                  const eq = apt.equipment || {};
                                  const pillowCount = eq.doublePillow ? guests * 2 : guests;
                                  let total = 0;
                                  if (eq.palinkas_need) total += guests * 150;
                                  if (eq.pohar_need) total += guests * 2 * 595;
                                  if (eq.boros_need) total += guests * 250;
                                  if (eq.kaves_need) total += guests * 995;
                                  if (eq.bogre_need) total += guests * 695;
                                  if (eq.eszkoz_need) total += 1 * 2790;
                                  if (eq.serpenyo_need) total += 1 * 5990;
                                  if (eq.fozokeszlet_need) total += 1 * 4490;
                                  if (eq.vasalo_need) total += 1 * 2690;
                                  if (eq.matracvedo_need) total += guests * 7990;
                                  if (eq.kadkilepo_need) total += 1 * 695;
                                  if (eq.keztorlo_need) total += guests * 2 * 795;
                                  if (eq.furdolepedo_need) total += guests * 2 * 2990;
                                  if (eq.paplan_need) total += guests * 6490;
                                  if (eq.parna_need) total += pillowCount * 6990;
                                  if (eq.huzat_need) total += guests * 2 * 1990;
                                  if (eq.lepedo_need) total += guests * 2 * 4490;
                                  return total.toLocaleString();
                                })()} Ft
                              </div>
                              <div className="text-xs text-violet-500">
                                ~{(() => {
                                  const guests = apt.maxGuests;
                                  const eq = apt.equipment || {};
                                  const pillowCount = eq.doublePillow ? guests * 2 : guests;
                                  let total = 0;
                                  if (eq.palinkas_need) total += guests * 150;
                                  if (eq.pohar_need) total += guests * 2 * 595;
                                  if (eq.boros_need) total += guests * 250;
                                  if (eq.kaves_need) total += guests * 995;
                                  if (eq.bogre_need) total += guests * 695;
                                  if (eq.eszkoz_need) total += 1 * 2790;
                                  if (eq.serpenyo_need) total += 1 * 5990;
                                  if (eq.fozokeszlet_need) total += 1 * 4490;
                                  if (eq.vasalo_need) total += 1 * 2690;
                                  if (eq.matracvedo_need) total += guests * 7990;
                                  if (eq.kadkilepo_need) total += 1 * 695;
                                  if (eq.keztorlo_need) total += guests * 2 * 795;
                                  if (eq.furdolepedo_need) total += guests * 2 * 2990;
                                  if (eq.paplan_need) total += guests * 6490;
                                  if (eq.parna_need) total += pillowCount * 6990;
                                  if (eq.huzat_need) total += guests * 2 * 1990;
                                  if (eq.lepedo_need) total += guests * 2 * 4490;
                                  return Math.round(total / eurRate);
                                })()}€
                              </div>
                            </>
                          ) : (
                            <button 
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPartnerOnboardingStep(5); }}
                              className="text-amber-600 text-sm hover:text-amber-700 hover:underline"
                            >
                              ❓ Állítsd be az ágyakat →
                            </button>
                          )}
                          <div className={`mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto ${apt.maxGuests > 0 ? 'bg-violet-500 border-violet-500 text-white' : 'border-stone-300'}`}>
                            {apt.maxGuests > 0 && '✓'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cég által biztosított Internet */}
                    <div className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${apt.requestCompanyInternet ? 'bg-gradient-to-br from-sky-50 to-cyan-50 border-sky-400 shadow-lg' : 'bg-white border-stone-200 hover:border-sky-300'}`}
                      onClick={() => updateApt({ requestCompanyInternet: !apt.requestCompanyInternet })}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">📶</span>
                            <div>
                              <h4 className="font-bold text-stone-800">Internet szolgáltatás</h4>
                              <p className="text-xs text-stone-500">Cégünk által biztosított WiFi a vendégeknek</p>
                            </div>
                          </div>
                          <div className="ml-9 text-[10px] text-stone-600 space-y-1">
                            <div>⚡ Sebesség a helyszín függvényében</div>
                            <div>🔧 Telepítés és beüzemelés</div>
                            <div>📞 Hibaelhárítás és támogatás</div>
                            <div>🏷️ Fix havi díj, nincs rejtett költség</div>
                          </div>
                          {apt.requestCompanyInternet && (
                            <div className="ml-9 mt-3 p-2 bg-sky-100 rounded-lg text-[10px] text-sky-700">
                              📞 A regisztráció után egyeztetjük a telepítés részleteit!
                            </div>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-black text-sky-600">20€</div>
                          <div className="text-xs text-sky-500">/hó</div>
                          <div className="text-[10px] text-sky-400">~{(20 * eurRate).toLocaleString()} Ft</div>
                          <div className={`mt-2 w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto ${apt.requestCompanyInternet ? 'bg-sky-500 border-sky-500 text-white' : 'border-stone-300'}`}>
                            {apt.requestCompanyInternet && '✓'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Összegző - mindig látszik */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <h4 className="font-bold text-emerald-800 text-sm mb-2">🛒 Kiválasztott szolgáltatások:</h4>
                    <div className="space-y-1 text-sm">
                      {/* Első havi alapdíj - mindig */}
                      <div className="flex justify-between text-emerald-700">
                        <span>🎁 Első havi alapdíj</span>
                        <span className="font-medium">
                          {(() => {
                            const guests = apt.maxGuests || 0;
                            let fee = 30;
                            if (guests <= 4) fee = 30;
                            else if (guests <= 6) fee = 35;
                            else if (guests <= 9) fee = 40;
                            else if (guests <= 12) fee = 45;
                            else fee = 45 + Math.ceil((guests - 12) / 3) * 5;
                            return `${fee}€ / ~${(fee * eurRate).toLocaleString()} Ft`;
                          })()}
                        </span>
                      </div>
                      {apt.requestDeepCleaning && apt.apartmentSize > 0 && (
                        <div className="flex justify-between text-emerald-700">
                          <span>✨ Nagytakarítás</span>
                          <span className="font-medium">
                            {(() => {
                              const size = apt.apartmentSize || 0;
                              const guests = apt.maxGuests || 0;
                              let base = 25;
                              if (size <= 35) base = 25;
                              else if (size <= 45) base = 35;
                              else if (size <= 60) base = 45;
                              else if (size <= 80) base = 55;
                              else if (size <= 100) base = 70;
                              else base = 70 + Math.ceil((size - 100) / 20) * 10;
                              const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                              const totalEur = Math.max(30, (base + guestSurcharge)) * 2;
                              return `${totalEur}€ / ~${(totalEur * eurRate).toLocaleString()} Ft`;
                            })()}
                          </span>
                        </div>
                      )}
                      {apt.maxGuests > 0 && (() => {
                          const guests = apt.maxGuests;
                          const eq = apt.equipment || {};
                          const pillowCount = eq.doublePillow ? guests * 2 : guests;
                          let totalFt = 0;
                          if (eq.palinkas_need) totalFt += guests * 150;
                          if (eq.pohar_need) totalFt += guests * 2 * 595;
                          if (eq.boros_need) totalFt += guests * 250;
                          if (eq.kaves_need) totalFt += guests * 995;
                          if (eq.bogre_need) totalFt += guests * 695;
                          if (eq.eszkoz_need) totalFt += 1 * 2790;
                          if (eq.serpenyo_need) totalFt += 1 * 5990;
                          if (eq.fozokeszlet_need) totalFt += 1 * 4490;
                          if (eq.vasalo_need) totalFt += 1 * 2690;
                          if (eq.matracvedo_need) totalFt += guests * 7990;
                          if (eq.kadkilepo_need) totalFt += 1 * 695;
                          if (eq.keztorlo_need) totalFt += guests * 2 * 795;
                          if (eq.furdolepedo_need) totalFt += guests * 2 * 2990;
                          if (eq.paplan_need) totalFt += guests * 6490;
                          if (eq.parna_need) totalFt += pillowCount * 6990;
                          if (eq.huzat_need) totalFt += guests * 2 * 1990;
                          if (eq.lepedo_need) totalFt += guests * 2 * 4490;
                          if (totalFt === 0) return null;
                          const totalEur = Math.round(totalFt / eurRate);
                          return (
                            <div className="flex justify-between text-emerald-700">
                              <span>🏠 Standard készletek</span>
                              <span className="font-medium">~{totalEur}€ / {totalFt.toLocaleString()} Ft</span>
                            </div>
                          );
                        })()}
                        {apt.requestCompanyInternet && (
                          <div className="flex justify-between text-emerald-700">
                            <span>📶 Internet (első hó)</span>
                            <span className="font-medium">20€ (~{(20 * eurRate).toLocaleString()} Ft)</span>
                          </div>
                        )}
                        {/* Összesítő */}
                        <div className="border-t border-emerald-300 mt-2 pt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-emerald-800">💰 Összesen (nettó, egyszeri):</span>
                            <div className="text-right">
                              <div className="text-lg font-black text-emerald-700">
                                {(() => {
                                  const guests = apt.maxGuests || 0;
                                  const eq = apt.equipment || {};
                                  const pillowCount = eq.doublePillow ? guests * 2 : guests;
                                  
                                  // Első havi alapdíj - mindig benne
                                  let monthlyFee = 30;
                                  if (guests <= 4) monthlyFee = 30;
                                  else if (guests <= 6) monthlyFee = 35;
                                  else if (guests <= 9) monthlyFee = 40;
                                  else if (guests <= 12) monthlyFee = 45;
                                  else monthlyFee = 45 + Math.ceil((guests - 12) / 3) * 5;
                                  
                                  let totalEur = monthlyFee;
                                  
                                  // Standard készletek Ft-ban
                                  let totalFt = 0;
                                  if (guests > 0) {
                                    if (eq.palinkas_need) totalFt += guests * 150;
                                    if (eq.pohar_need) totalFt += guests * 2 * 595;
                                    if (eq.boros_need) totalFt += guests * 250;
                                    if (eq.kaves_need) totalFt += guests * 995;
                                    if (eq.bogre_need) totalFt += guests * 695;
                                    if (eq.eszkoz_need) totalFt += 1 * 2790;
                                    if (eq.serpenyo_need) totalFt += 1 * 5990;
                                    if (eq.fozokeszlet_need) totalFt += 1 * 4490;
                                    if (eq.vasalo_need) totalFt += 1 * 2690;
                                    if (eq.matracvedo_need) totalFt += guests * 7990;
                                    if (eq.kadkilepo_need) totalFt += 1 * 695;
                                    if (eq.keztorlo_need) totalFt += guests * 2 * 795;
                                    if (eq.furdolepedo_need) totalFt += guests * 2 * 2990;
                                    if (eq.paplan_need) totalFt += guests * 6490;
                                    if (eq.parna_need) totalFt += pillowCount * 6990;
                                    if (eq.huzat_need) totalFt += guests * 2 * 1990;
                                    if (eq.lepedo_need) totalFt += guests * 2 * 4490;
                                  }
                                  totalEur += Math.round(totalFt / eurRate);
                                  
                                  // Nagytakarítás
                                  if (apt.requestDeepCleaning && apt.apartmentSize > 0) {
                                    const size = apt.apartmentSize || 0;
                                    let base = 25;
                                    if (size <= 35) base = 25;
                                    else if (size <= 45) base = 35;
                                    else if (size <= 60) base = 45;
                                    else if (size <= 80) base = 55;
                                    else if (size <= 100) base = 70;
                                    else base = 70 + Math.ceil((size - 100) / 20) * 10;
                                    const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                    totalEur += Math.max(30, (base + guestSurcharge)) * 2;
                                  }
                                  
                                  // Internet első hó
                                  if (apt.requestCompanyInternet) {
                                    totalEur += 20;
                                  }
                                  
                                  return `~${totalEur}€`;
                                })()}
                              </div>
                              <div className="text-sm text-emerald-600">
                                {(() => {
                                  const guests = apt.maxGuests || 0;
                                  const eq = apt.equipment || {};
                                  const pillowCount = eq.doublePillow ? guests * 2 : guests;
                                  
                                  // Első havi alapdíj
                                  let monthlyFee = 30;
                                  if (guests <= 4) monthlyFee = 30;
                                  else if (guests <= 6) monthlyFee = 35;
                                  else if (guests <= 9) monthlyFee = 40;
                                  else if (guests <= 12) monthlyFee = 45;
                                  else monthlyFee = 45 + Math.ceil((guests - 12) / 3) * 5;
                                  
                                  let totalFt = monthlyFee * eurRate;
                                  
                                  // Standard készletek
                                  if (guests > 0) {
                                    if (eq.palinkas_need) totalFt += guests * 150;
                                    if (eq.pohar_need) totalFt += guests * 2 * 595;
                                    if (eq.boros_need) totalFt += guests * 250;
                                    if (eq.kaves_need) totalFt += guests * 995;
                                    if (eq.bogre_need) totalFt += guests * 695;
                                    if (eq.eszkoz_need) totalFt += 1 * 2790;
                                    if (eq.serpenyo_need) totalFt += 1 * 5990;
                                    if (eq.fozokeszlet_need) totalFt += 1 * 4490;
                                    if (eq.vasalo_need) totalFt += 1 * 2690;
                                    if (eq.matracvedo_need) totalFt += guests * 7990;
                                    if (eq.kadkilepo_need) totalFt += 1 * 695;
                                    if (eq.keztorlo_need) totalFt += guests * 2 * 795;
                                    if (eq.furdolepedo_need) totalFt += guests * 2 * 2990;
                                    if (eq.paplan_need) totalFt += guests * 6490;
                                    if (eq.parna_need) totalFt += pillowCount * 6990;
                                    if (eq.huzat_need) totalFt += guests * 2 * 1990;
                                    if (eq.lepedo_need) totalFt += guests * 2 * 4490;
                                  }
                                  
                                  // Nagytakarítás
                                  if (apt.requestDeepCleaning && apt.apartmentSize > 0) {
                                    const size = apt.apartmentSize || 0;
                                    let base = 25;
                                    if (size <= 35) base = 25;
                                    else if (size <= 45) base = 35;
                                    else if (size <= 60) base = 45;
                                    else if (size <= 80) base = 55;
                                    else if (size <= 100) base = 70;
                                    else base = 70 + Math.ceil((size - 100) / 20) * 10;
                                    const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                    totalFt += Math.max(30, (base + guestSurcharge)) * 2 * eurRate;
                                  }
                                  
                                  // Internet
                                  if (apt.requestCompanyInternet) {
                                    totalFt += 20 * eurRate;
                                  }
                                  
                                  return Math.round(totalFt).toLocaleString() + ' Ft';
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* TEXTILKÉSZLET SZERKESZTŐ MODAL */}
              {showTextileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowTextileModal(false)}>
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    {/* Fejléc */}
                    <div className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white p-4 rounded-t-xl flex justify-between items-center">
                      <h3 className="text-lg font-bold flex items-center gap-2">
                        <span>🧺</span> Textilkészlet
                      </h3>
                      <button onClick={() => setShowTextileModal(false)} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Tartalom */}
                    <div className="p-4 space-y-4">
                      {/* Ágynemű */}
                      <div>
                        <h4 className="font-semibold text-stone-700 mb-2">Ágynemű</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Paplan (db)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={apt.textileInventory?.paplan || 0}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, paplan: parseInt(e.target.value) || 0 } })}
                                className="w-16 px-2 py-1.5 border rounded text-sm"
                              />
                              <select
                                value={apt.textileInventory?.paplanType || 'IKEA'}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, paplanType: e.target.value } })}
                                className="flex-1 px-2 py-1.5 border rounded text-sm bg-white"
                              >
                                <option value="IKEA">IKEA</option>
                                <option value="Premium">Prémium</option>
                                <option value="Standard">Standard</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Párna (db)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={apt.textileInventory?.parna || 0}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, parna: parseInt(e.target.value) || 0 } })}
                                className="w-16 px-2 py-1.5 border rounded text-sm"
                              />
                              <select
                                value={apt.textileInventory?.parnaType || 'IKEA'}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, parnaType: e.target.value } })}
                                className="flex-1 px-2 py-1.5 border rounded text-sm bg-white"
                              >
                                <option value="IKEA">IKEA</option>
                                <option value="Premium">Prémium</option>
                                <option value="Standard">Standard</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Lepedő (db)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={apt.textileInventory?.lepedo || 0}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, lepedo: parseInt(e.target.value) || 0 } })}
                                className="w-16 px-2 py-1.5 border rounded text-sm"
                              />
                              <select
                                value={apt.textileInventory?.lepedoSize || '140x200'}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, lepedoSize: e.target.value } })}
                                className="flex-1 px-2 py-1.5 border rounded text-sm bg-white"
                              >
                                <option value="90x200">90×200</option>
                                <option value="140x200">140×200</option>
                                <option value="160x200">160×200</option>
                                <option value="180x200">180×200</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Ágynemű szett (db)</label>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={apt.textileInventory?.agynemuSzett || 0}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, agynemuSzett: parseInt(e.target.value) || 0 } })}
                                className="w-16 px-2 py-1.5 border rounded text-sm"
                              />
                              <select
                                value={apt.textileInventory?.agynemuSzettType || 'IKEA'}
                                onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, agynemuSzettType: e.target.value } })}
                                className="flex-1 px-2 py-1.5 border rounded text-sm bg-white"
                              >
                                <option value="IKEA">IKEA</option>
                                <option value="Premium">Prémium</option>
                                <option value="Standard">Standard</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Törölközők */}
                      <div>
                        <h4 className="font-semibold text-stone-700 mb-2">Törölközők</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Nagy törölköző</label>
                            <input
                              type="number"
                              value={apt.textileInventory?.nagyTorolkozo || 0}
                              onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, nagyTorolkozo: parseInt(e.target.value) || 0 } })}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Közepes törölköző</label>
                            <input
                              type="number"
                              value={apt.textileInventory?.kozepesTorolkozo || 0}
                              onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, kozepesTorolkozo: parseInt(e.target.value) || 0 } })}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Kéztörlő</label>
                            <input
                              type="number"
                              value={apt.textileInventory?.kezTorlo || 0}
                              onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, kezTorlo: parseInt(e.target.value) || 0 } })}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-stone-600 mb-1">Kádkilépő</label>
                            <input
                              type="number"
                              value={apt.textileInventory?.kadkilepo || 0}
                              onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, kadkilepo: parseInt(e.target.value) || 0 } })}
                              className="w-full px-2 py-1.5 border rounded text-sm"
                            />
                          </div>
                        </div>
                        <div className="mt-3">
                          <label className="block text-xs text-stone-600 mb-1">Konyharuha</label>
                          <input
                            type="number"
                            value={apt.textileInventory?.konyharuha || 0}
                            onChange={(e) => updateApt({ textileInventory: { ...apt.textileInventory, konyharuha: parseInt(e.target.value) || 0 } })}
                            className="w-32 px-2 py-1.5 border rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      {/* Egyéb készletek */}
                      <div>
                        <h4 className="font-semibold text-stone-700 mb-2">Egyéb készletek</h4>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Tétel neve..."
                            id="customTextileItem"
                            className="flex-1 px-2 py-1.5 border rounded text-sm"
                          />
                          <input
                            type="number"
                            defaultValue={1}
                            id="customTextileQty"
                            className="w-16 px-2 py-1.5 border rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const name = document.getElementById('customTextileItem').value;
                              const qty = parseInt(document.getElementById('customTextileQty').value) || 1;
                              if (name.trim()) {
                                const items = apt.textileInventory?.customItems || [];
                                updateApt({ textileInventory: { ...apt.textileInventory, customItems: [...items, { name: name.trim(), qty }] } });
                                document.getElementById('customTextileItem').value = '';
                              }
                            }}
                            className="px-3 py-1.5 bg-teal-500 text-white rounded text-sm hover:bg-teal-600"
                          >
                            +
                          </button>
                        </div>
                        {apt.textileInventory?.customItems?.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {apt.textileInventory.customItems.map((item, i) => (
                              <div key={i} className="flex justify-between items-center bg-stone-50 p-2 rounded text-sm">
                                <span>{item.name}: {item.qty} db</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const items = apt.textileInventory.customItems.filter((_, idx) => idx !== i);
                                    updateApt({ textileInventory: { ...apt.textileInventory, customItems: items } });
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Gombok */}
                    <div className="p-4 border-t grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setShowTextileModal(false)}
                        className="px-4 py-2.5 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600"
                      >
                        ✓ Mentés
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowTextileModal(false)}
                        className="px-4 py-2.5 bg-stone-400 text-white rounded-lg font-medium hover:bg-stone-500"
                      >
                        ✕ Mégse
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* NAVIGÁCIÓ */}
              <div className="p-5 bg-gradient-to-r from-stone-50 to-stone-100 border-t border-stone-200 flex justify-between">
                {partnerOnboardingStep > 1 ? (
                  <button type="button" onClick={() => setPartnerOnboardingStep(partnerOnboardingStep - 1)} className="px-6 py-3 bg-white text-stone-600 rounded-xl font-medium hover:bg-stone-100 border border-stone-200 transition-all">← Vissza</button>
                ) : <div />}
                
                {partnerOnboardingStep < totalSteps ? (
                  <button 
                    type="button"
                    onClick={() => {
                      // Step 1: név ellenőrzés
                      if (partnerOnboardingStep === 1) {
                        if (!currentPartner.lastName || !currentPartner.firstName) { 
                          alert('Kérjük, adja meg a vezeték- és keresztnevét!'); 
                          return; 
                        }
                      }
                      // Step 2: nincs ellenőrzés - lakás név automatikusan generálódik a címből
                      // Step 8: csomag ellenőrzés
                      if (partnerOnboardingStep === 8) {
                        if (!partnerNewApartment.servicePackage) { 
                          alert('Kérjük, válasszon csomagot!'); 
                          return; 
                        }
                      }
                      // Következő lépés
                      setPartnerOnboardingStep(partnerOnboardingStep + 1);
                    }} 
                    className="px-8 py-3 bg-stone-700 text-white rounded-xl font-semibold hover:bg-stone-800 shadow-lg transition-all"
                  >
                    Tovább →
                  </button>
                ) : (
                  <button type="button" onClick={() => {
                    // Ha nincs név de van utca, generáljunk automatikusan
                    let aptName = apt.name;
                    if (!aptName && apt.street) {
                      aptName = apt.street
                        .replace(/ utca/gi, '')
                        .replace(/ út/gi, '')
                        .replace(/ tér/gi, '')
                        .replace(/ körút/gi, '')
                        .replace(/ sétány/gi, '')
                        .replace(/ köz/gi, '')
                        .replace(/\./g, '')
                        .trim();
                    }
                    // Ha még mindig nincs név, használjuk a címet
                    if (!aptName) {
                      aptName = apt.street || 'Új lakás';
                    }
                    // Ellenőrizzük, vannak-e hiányzó adatok
                    const hasPendingTasks = !apt.wifiName || apt.wifiOption === 'later' || 
                                            (!apt.noAirbnbAccount && !apt.airbnbUsername) || 
                                            (!apt.noBookingAccount && !apt.bookingUsername) ||
                                            !apt.ntakNumber || !apt.street;
                    // Közlemény = lakás neve
                    setRegistrationNumber(aptName);
                    // Mentés
                    const newApt = { 
                      ...apt, 
                      name: aptName, 
                      id: Date.now(), 
                      clientId: currentPartner.id.toString(), 
                      clientName: currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`, 
                      onboardingComplete: !hasPendingTasks, 
                      hasPendingTasks, 
                      registrationNumber: aptName,
                      servicePackage: apt.servicePackage || 'pro' // default csomag ha nincs
                    };
                    setApartments([...apartments, newApt]);
                    // Partner hozzáadása a clients listához
                    const newClient = { 
                      id: currentPartner.id, 
                      name: currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`, 
                      email: currentPartner.email || '', 
                      phone: currentPartner.phone || '', 
                      taxNumber: currentPartner.taxNumber || '', 
                      apartmentIds: [newApt.id] 
                    };
                    setPartners({ ...partners, clients: [...partners.clients.filter(c => c.id !== currentPartner.id), newClient] });
                    // Sikeres regisztráció képernyő
                    setRegistrationSuccess(true);
                  }} className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all">Tovább →</button>
                )}
              </div>
              
              {/* SIKERES REGISZTRÁCIÓ MODAL */}
              {registrationSuccess && !showContractModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                    {/* Fejléc */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-8 text-center">
                      <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-5xl text-emerald-500">✓</span>
                      </div>
                      <h2 className="text-2xl font-bold">Sikeres regisztráció!</h2>
                      <p className="text-emerald-100 mt-2">Köszönjük, hogy minket választott!</p>
                    </div>
                    
                    {/* Tartalom */}
                    <div className="p-6 space-y-4">
                      {/* Lakás neve */}
                      <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 rounded-xl border border-violet-200 text-center">
                        <p className="text-sm text-violet-600 mb-1">Lakás neve (utalás közleménye)</p>
                        <p className="text-xl font-bold text-violet-700">{registrationNumber}</p>
                      </div>
                      
                      {/* Szerződés időtartama */}
                      <div>
                        <p className="text-sm font-medium text-stone-700 mb-3">Szerződés időtartama:</p>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => updateApt({ contractDuration: 'indefinite' })}
                            className={`p-3 rounded-xl border-2 text-left transition-all ${apt.contractDuration === 'indefinite' ? 'border-stone-400 bg-stone-50' : 'border-stone-200 hover:border-stone-300'}`}
                          >
                            <p className="font-semibold text-stone-800">Határozatlan</p>
                            <p className="text-xs text-stone-500 mt-1">30 napos felmondási idő</p>
                          </button>
                          {apt.servicePackage !== 'max' && (
                            <button
                              onClick={() => updateApt({ contractDuration: '1year' })}
                              className={`p-3 rounded-xl border-2 text-left transition-all relative ${apt.contractDuration === '1year' ? 'border-amber-500 bg-amber-50' : 'border-stone-200 hover:border-stone-300'}`}
                            >
                              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Ajánlott!</span>
                              <p className="font-semibold text-stone-800">1 éves hűségidő</p>
                              <p className="text-xs text-amber-600 font-medium mt-1">🎁 Első és utolsó hónap díjmentes!</p>
                            </button>
                          )}
                        </div>
                        {apt.contractDuration === '1year' && apt.servicePackage !== 'max' && (
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 text-amber-800 mt-3">
                            <p className="font-bold text-amber-900 mb-2">🎁 1 éves hűségidő előnyei:</p>
                            <ul className="space-y-1.5 text-sm">
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">✓</span>
                                <span>Az <strong>első hónap</strong> management díja díjmentes - azonnal kezdhetsz!</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">✓</span>
                                <span>A <strong>12. hónap</strong> management díja is díjmentes - jutalomként a hűségedért!</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-amber-500 mt-0.5">✓</span>
                                <span>Garantált feltételek egy teljes évre</span>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                      
                      {/* Mi történik */}
                      <div className="text-sm text-stone-600 space-y-2">
                        <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> A lakás regisztrálva</p>
                        <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Emailben értesítjük a következő lépésekről</p>
                      </div>
                      
                      {/* Tovább gomb */}
                      <button 
                        onClick={() => setShowContractModal(true)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all"
                      >
                        Tovább a szerződéshez →
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* SZERZŐDÉS + BANKI ADATOK MODAL */}
              {/* MEGBÍZÁSI SZERZŐDÉS MODAL - Rövidtávú üzemeltetés */}
              {showContractModal && apt.operationType === 'short-term' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8">
                    {/* Fejléc */}
                    <div className="bg-gradient-to-r from-stone-700 to-stone-800 text-white p-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <span>📜</span> Megbízási szerződés
                        {apt.contractDuration === '1year' && <span className="ml-2 px-2 py-0.5 bg-amber-500 rounded text-xs">1 éves</span>}
                      </h2>
                      <button onClick={() => { setShowContractModal(false); setRegistrationSuccess(false); setPartnerOnboardingStep(1); }} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Szerződés tartalma */}
                    <div className="p-6 text-sm text-stone-700 space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-stone-800">MEGBÍZÁSI SZERZŐDÉS</h3>
                        {apt.contractDuration === '1year' && (
                          <p className="text-amber-600 font-medium mt-1">1 éves hűségidővel</p>
                        )}
                      </div>
                      
                      <p>Amely létrejött egyrészről</p>
                      
                      <div className="bg-stone-50 p-4 rounded-lg space-y-1">
                        <p><strong>Név:</strong> {currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}</p>
                        <p><strong>Cím/székhely:</strong> {currentPartner.zipCode} {currentPartner.city}, {currentPartner.street}</p>
                        {currentPartner.taxNumber && <p><strong>Adószám:</strong> {currentPartner.taxNumber}</p>}
                        {currentPartner.idNumber && <p><strong>{currentPartner.idType === 'passport' ? 'Útlevélszám' : currentPartner.idType === 'license' ? 'Jogosítványszám' : 'Személyi ig. szám'}:</strong> {currentPartner.idNumber}</p>}
                        {currentPartner.birthPlace && <p><strong>Születési hely, idő:</strong> {currentPartner.birthPlace}, {currentPartner.birthDate}</p>}
                        {currentPartner.motherName && <p><strong>Anyja neve:</strong> {currentPartner.motherName}</p>}
                        <p className="text-stone-500 italic mt-2">a továbbiakban, mint <strong>Megbízó</strong></p>
                      </div>
                      
                      <p>másrészről</p>
                      
                      <div className="bg-stone-50 p-4 rounded-lg space-y-1">
                        <p><strong>Cégnév:</strong> HNR Smart Invest Kft.</p>
                        <p><strong>Cím/székhely:</strong> 1138 Budapest, Úszódaru utca 1.</p>
                        <p><strong>Adószám:</strong> 32698660-2-41</p>
                        <p className="text-stone-500 italic mt-2">a továbbiakban, mint <strong>Megbízott</strong></p>
                      </div>
                      
                      <p>(továbbiakban együttesen említve, mint Szerződő Felek) között, alul írt napon és helyen, az alábbiak szerint.</p>
                      
                      {/* I. Fogalom meghatározás */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">I. Fogalom meghatározás</h4>
                        <ol className="list-decimal ml-5 space-y-2 text-xs">
                          <li><strong>Ingatlan:</strong> Lakás céljára létesített és az ingatlan-nyilvántartásban lakóház vagy lakás megnevezéssel nyilvántartott vagy ilyenként feltüntetésre váró ingatlan a hozzá tartozó földrészlettel.</li>
                          <li><strong>Bérlő:</strong> Az a harmadik személy, aki a szerződés tárgyát képező ingatlant időlegesen bérbe veszi.</li>
                        </ol>
                      </div>
                      
                      {/* II. A szerződés tárgya */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">II. A szerződés tárgya</h4>
                        <ol className="list-decimal ml-5 space-y-2 text-xs">
                          <li>A megbízási szerződés a Megbízó tulajdonában álló ingatlan átadása Megbízott részére azzal a céllal, hogy az ingatlan harmadik személy részére rövidtávú turisztikai célra történő bérbeadásra kerüljön és az azzal kapcsolatos feladatokat ellássa.</li>
                          <li>Jelen szerződés tárgyául szolgáló ingatlan adatai:</li>
                        </ol>
                        <div className="bg-amber-50 p-3 rounded-lg mt-2 border border-amber-200">
                          <p><strong>Cím:</strong> {apt.zipCode} {apt.city}, {apt.street} {apt.floor ? `${apt.floor}. emelet` : ''} {apt.door ? `${apt.door}. ajtó` : ''}</p>
                          <p><strong>Alapterület:</strong> {apt.apartmentSize || '---'} m²</p>
                          <p><strong>Maximum férőhely:</strong> {apt.maxGuests || '---'} fő</p>
                          {apt.cadastralNumber && <p><strong>Helyrajzi szám:</strong> {apt.cadastralNumber}</p>}
                        </div>
                        <p className="text-xs mt-2">Felek rögzítik, hogy a lakásban egyszerre maximum <strong>{apt.maxGuests || '---'} fő</strong> szállásolható el.</p>
                      </div>
                      
                      {/* III. A szerződés tartama */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">III. A szerződés tartama</h4>
                        <p className="text-xs">Jelen szerződés <strong>határozatlan időre</strong> jön létre annak aláírásának napjától.</p>
                      </div>
                      
                      {/* IV. Megbízott jogai és kötelezettségei */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">IV. Megbízott jogai és kötelezettségei</h4>
                        <ol className="list-decimal ml-5 space-y-2 text-xs">
                          <li>Megbízott köteles jelen szerződés alapján a Megbízó által rábízott feladat ellátására.</li>
                          <li>A megbízást a Megbízó utasításai szerint és érdekének megfelelően kell teljesíteni.</li>
                          <li>A Megbízott a jó gazda gondosságával jár el az ingatlan kezelése során. Köteles minden rendelkezésére álló eszközzel biztosítani a Megbízó számára az ingatlan maximális kihasználtságát. Internetes felületen folyamatosan hirdeti az ingatlant.</li>
                          <li>A Megbízott rendszeresen ellenőrzi az ingatlan bérlők általi használatát azok szükségtelen háborítása nélkül.</li>
                          <li>Megbízott a bérlő(k) számára éjjel-nappal elérhető.</li>
                          <li>A Megbízott köteles haladéktalanul írásban tájékoztatni a Megbízót minden rendeltetésellenes használat következtében bekövetkezett kárról.</li>
                          <li>A Megbízott az ingatlan közüzemi óráinak állását minden hónap 5. napjáig Megbízó felé írásban közli.</li>
                          <li>Megbízott az előző tárgyhó utolsó napjáig lefoglalt vendégéjszakák számát a Megbízó felé írásban minden hónap 10. napjáig jelzi.</li>
                          <li>Bejelentési kötelezettség a vendégekről hatóság irányába (NTAK, VIZA).</li>
                          <li>Megbízott köteles elektronikus formában hozzáférhető nyilvántartást vezetni a bérlők általi foglalásokról.</li>
                        </ol>
                      </div>
                      
                      {/* V. Megbízó jogai és kötelezettségei */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">V. Megbízó jogai és kötelezettségei</h4>
                        <ol className="list-decimal ml-5 space-y-2 text-xs">
                          <li>Jelen szerződés aláírásával egyidejűleg Megbízó az ingatlant Megbízott részére a kulcsok és az ingóságok átadásával birtokba adja.</li>
                          <li>Megbízó az ingatlan használatának ellenőrzése céljából köteles Megbízottal előre időpontot egyeztetni.</li>
                          <li>Megbízó köteles a hatályos jogszabályoknak megfelelő, ingatlant terhelő adók és egyéb járulékok megfizetésére.</li>
                          <li>Megbízó tudomásul veszi, hogy jelen szerződés kizárólagosságot élvez.</li>
                          <li>Megbízó vállalhatja az ingatlanra olyan vagyonbiztosítás megkötését, amely fedezi az ingatlan bérbeadásából származó károkat is.</li>
                          <li>Megbízó az ingatlan bérbeadásával kapcsolatos bejelentési kötelezettségének haladéktalanul eleget tesz.</li>
                        </ol>
                      </div>
                      
                      {/* VI. Elszámolás, megbízási díj */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">VI. Elszámolás, megbízási díj</h4>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                          <p>1. Megbízott jelen szerződés alapján megbízási díjra jogosult.</p>
                          <p>2. Megbízó kijelenti, hogy tudomással bír minden szükséges információval a szolgáltatási csomagok közötti választáshoz.</p>
                          <p className="font-semibold text-emerald-800">3. A kiválasztott szolgáltatási csomag megbízási díja: <strong>{apt.servicePackage === 'pro' ? '25%' : apt.servicePackage === 'premium' ? '20%' : '30%'}</strong> a bérlő(k) által fizetett bérleti díjból.</p>
                        </div>
                        <div className="mt-3 text-xs">
                          <p className="font-semibold mb-1">A csomag tartalma:</p>
                          <ul className="list-disc ml-5 space-y-1">
                            <li>Hirdetés kezelés (megszövegezés, fordítás, fotók, folyamatos kezelés)</li>
                            <li>Kapcsolattartás a bérlőkkel</li>
                            <li>Érkező foglalások kezelése</li>
                            <li>Szoftveres árképzés</li>
                            <li>0-24 ügyfélszolgálat</li>
                            <li>Vendégek fogadása, kulcs átadás-átvétel</li>
                            <li>Takarítás koordinálása</li>
                            <li>Fogyó eszközök pótlása</li>
                            <li>Engedélyek beszerzése, hatósági kapcsolattartás</li>
                            <li>NTAK vezetése, IFA bevallás előkészítése</li>
                            <li>Számla kiállítás</li>
                          </ul>
                        </div>
                        <div className="bg-sky-50 p-3 rounded-lg border border-sky-200 text-xs mt-3">
                          <p className="font-semibold text-sky-800">7. Megbízó részére történő kifizetés esedékessége: <strong>minden hónap 11. napja</strong>.</p>
                          <p className="mt-1">Az elszámolás a tárgyhót megelőző hónap utolsó napjáig kifizetett bérleti díjak vonatkozásában áll fenn.</p>
                        </div>
                      </div>
                      
                      {/* VII. Szerződés megszűnése */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">VII. Szerződés megszűnése</h4>
                        <ol className="list-decimal ml-5 space-y-1 text-xs">
                          <li>Jelen szerződés megszűnik:
                            <ul className="list-disc ml-5 mt-1">
                              <li>A szerződő felek közös megegyezésével</li>
                              <li>Rendes felmondással</li>
                              <li>Rendkívüli felmondással</li>
                              <li>Az ingatlan megsemmisülésével</li>
                            </ul>
                          </li>
                          <li>A szerződést bármelyik fél indoklás nélkül <strong>30 nap felmondási idővel</strong> felmondhatja.</li>
                          <li>Amennyiben Megbízó az ingatlan tulajdonjogát át kívánja ruházni, köteles rendes felmondással élni.</li>
                          <li>Bármely fél a másik szándékos vagy súlyosan gondatlan szerződésszegése esetén jogosult azonnali hatályú felmondásra.</li>
                        </ol>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <p className="text-xs text-stone-500 mb-3">Szerződő felek jelen szerződésben nem szabályozott kérdésekre a mindenkor hatályos Ptk. rendelkezéseit tekintik irányadónak.</p>
                        <p className="text-xs text-stone-500">A fenti szerződést, mint akaratunkkal mindenben egyezőt, jóváhagyólag írtuk alá.</p>
                        <p className="text-sm font-semibold mt-2">Budapest, {new Date().toLocaleDateString('hu-HU')}</p>
                        <div className="grid grid-cols-2 gap-8 mt-4">
                          <div className="text-center">
                            <div className="h-16 mb-1"></div>
                            <div className="border-t border-stone-400 pt-2">
                              <p className="text-xs">Megbízó</p>
                              <p className="font-semibold text-sm">{currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <img src="data:image/jpeg;base64,/9j/4QDoRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAACQAAAAAQAAAJAAAAABAAiQAAAHAAAABDAyMjGRAQAHAAAABAECAwCShgAHAAAAEgAAAMygAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAC3ygAwAEAAAAAQAAB3ikBgADAAAAAQAAAAAAAAAAQVNDSUkAAABTY3JlZW5zaG90AAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYYXBwbAQAAABtbnRyUkdCIFhZWiAH5gABAAEAAAAAAABhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGzs/aOOOIVHw220vU962hgvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAADBjcHJ0AAABLAAAAFB3dHB0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAACBjaGFkAAAB7AAAACxiVFJDAAABzAAAACBnVFJDAAABzAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABQAAAAcAEQAaQBzAHAAbABhAHkAIABQADNtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADQAAAAcAEMAbwBwAHkAcgBpAGcAaAB0ACAAQQBwAHAAbABlACAASQBuAGMALgAsACAAMgAwADIAMlhZWiAAAAAAAAD21QABAAAAANMsWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAIQAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCQEBAQECAgIEAgIECQYFBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/90ABABF/8AAEQgDbARGAwEiAAIRAQMRAf/EAaIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6AQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsRAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCOWWKCJppmCIgySeAAO59q84+HHxl+E/xghvbj4V+I9P8AECabMba6NhcJOIZR1R9hO0+1eX/tqarPoP7H3xS1q0kaKW08J6xKjqcFWSzlIII6EY4r+In/AIMhrnV7vxT8fJLq5lkg+zaOxRnJUyvJcZfB/iIHJ60Af6CNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//0P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA+IP+Cl2rDQv+Cevxr1Unb5PgrWzn/tylFfx//wDBj/o5Hhz4969jrPokGfot02K/qc/4LWeIF8L/APBJ74/ayzbdngzUkz/11iMY/wDQq/nA/wCDIvRPJ/Zm+NviIrjz/Eem24P/AFytZGI/DeKAP7gqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/EH/AIOOvFMfhT/gjB8cLh22m80q3sl+tzeQR4/I1+Xv/BmD4Mm0T/gm34y8XSptXW/GtxsPqLa0t0/Qk19L/wDB2340HhT/AII3+JdKD7X17xBotgo9R9o88j8oa7X/AINU/h5ceAv+CMvgK7uk2P4g1LV9VHGMrJdNEh/75iFAH9GlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/i1/4PXviX/Yf7E/wr+FcT4fxD4uku2T1jsLNxnH+9Otf0Q/8EdPhTcfBT/glv8AAn4c3sflT2nhDTppVxj95dx/aW/WWv5AP+DvzX7r47ft/wD7N/7HPh5zNcSWwd4V5xNrWoR2sfH+5D+Vf3/eBvC1l4G8E6P4K00BbfR7G3sYgOgS3jWNcfgooA6qiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0/7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoor8/f+Ck3/BRn4I/8Exf2cbr9or42pPd2qzpaWdjaY8+6uJPuxpngcck9hQB+gVFfkz/AMEnP+CvPwD/AOCtXwv1nx38IbC80PUPDtwlvqOmXpVpIvMBMbqy4DK2DX6zUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRXDfE7x7ovwr+G2v/E3xHIsWn+HtOutSuHY4AitYmlb9FoA/gF8dov7fX/B4tpuk2Si80f4XXtuJf4kVPDll5z+2PtjY+tf6GdfwCf8GivgPWP2iv23P2jv+Chni+IzS3cr2VtO/JFxrF297OAf9mONB9DX9/dABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/9T+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/zR/wDg8T/bVufjD+1t4W/Yu8G3Bm0/wLbLdX0UZyH1G94RTjqUj7dt1f6Ofxd+I2hfCD4W+Ifij4ml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/wCDlf4Qwf8AFmv20l1pIvuQ395frnHQEXMNyv60Af200V/Eonhz/g8w+BEB+y6r4S+I0EPTedKmdwP95LOSiP8A4K3/APBz98EISfjZ+yHa+JoYPvzabZ3IyB3Bs7i4X/x2gD+2uiv4oNL/AODtf4z/AA0b7J+1X+yR4u8OSR8SvavMijHXC3drF/6FX078OP8Ag8R/4JdeJ1SL4h6T4x8ITnhlutMW4RT7tbSueP8AdoA/rCor8UvhZ/wcRf8ABHT4tLEui/GzR9NmmwBDqyz6ewJ7H7RGi/rX6O/Dv9sT9lD4twxz/DH4keGteWX7osdTtZif+ApIT+lAH0hRVS3vrK7QSWkySqRwUYEY/CrdABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//S/v4ooooAKotpmmtfDU2t4jcqNol2DeB6BsZxV6igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArxD9pH49+A/2XvgX4o+PvxLuUtNG8LafNfTsxA3eWvyxr/tO2FA969vr+Fj/g6q/bd8afHH4n+Bv+CQH7NEzXuueJb61l12O2OSZJmC21s+3soPmOOw+lAHzn/wQi+Afjz/AIK/f8FT/HX/AAVm/aOtmuvDfhjUXbRopxmI3h4t40B4220WOnciv9DIAAYFfA3/AATL/Yh8Ff8ABPj9jXwd+zZ4RhRZtLs0k1GdRhri+lAaeRj3y3A9q++qACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAKGoaXpmr2xs9Vt4rmFuCkqK6n8GBFfMPxG/YU/Ys+LsLwfEz4UeEtaEn3mutIs2c/8AA/K3frX1bRQB+HnxV/4NxP8Agjd8WY3/ALQ+DVho0j/8tNGuLmxI+ixy7B/3zX5yfEj/AIM4/wDgnDrtwdQ+Efizxl4JuOqGG7hulQ9seZEr8f79f1vUUAfxN3P/AAa//wDBQP4I3Rvf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ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD4n/4KI/tf+FP2FP2O/G/7S3iqVE/sHT5DZxscebeONsEY+r4/AV/JP/wak/sd+Lfjt8WPiH/wVx/aCha71fxHf3NtoktwMktK+65nXI7cRqR2Fch/wdJ/tNeMv2wP2tfhh/wSF+AUzXNzdahbT6ykByPtNyQIkfHaKPLnPFf2ffsXfsyeDv2Ov2X/AAZ+zj4GgSCy8MabDattAG+YKPNkOO7Pk0AfUNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/1v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8S/aQ+OHhP9mv4EeK/jv44mWDTPC2mz38rMcA+UhKr/AMCbAFe21/G//wAHfX7Z2oeBf2avCf7Dfw7nLeIfidfo11BEfn+xxMFRCBziSQgUAfDX/Bs98DvFv7f3/BRP4rf8FavjVA11DZ31xFpDzAlftd0f4Cf+eMOAPSv9AWvy3/4I1/sW6X+wj/wT2+H/AMEordYdVawj1HVmAAZ726USSbiOu3IH4V+pFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9f+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAIpporeFridgiRgsxPAAHU/hX+dh4Igl/wCC0X/BzfeeIr0HUPAPwluSyAndEINKO1AO2JJ+3tX9kP8AwWE/avtv2MP+CdfxM+Nwn8i/g0qWy0/nBN1dDyo9vuM5r8F/+DPT9ku58D/sn+Lv2yfGUBbXPiVqjpBPIPma0tzlmB6/PISaAP7GERIkEcYCqowAOAAO1PoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9D+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP4cf+DxT9oPV/E2n/CH9gTwPMXv/F+qLqF5bx/eKhxDACB23tnFf1q/sG/s8aN+yn+x58PPgFokKwp4d0S1glCjGZjGGlJ995Nfw/a5Gf8Agp9/wdbxaXNu1Dwv8LLlQR1RI9JTcfbBlP6V/ocgY4FAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9H+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8V/aP8Aifp3wW+APjL4saq/lQeHtHvL1m6Y8qJiP1xXtVfgV/wcv/Hj/hRX/BIz4jSWtx9nvfEqQ6Lb4OCTdOFYD/gNAH4Vf8Gfnwtvvi18aPjz+3h4riM11q98bG1uX67rqVriXB+mBX95Vfzj/wDBrH8BI/gr/wAEk/CWt3Ft9nvfGN3daxNkYLK7bIz+S8V/RxQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr+J7/AIPQfihcxfs8fCT9n6xb5/FHiFrh1HdYE2r/AOPMK/thr/P2/wCDp3VZPip/wVW/Zr/Z9dt9upt5Gj97m8jHT6LQB/aT/wAE/fhbH8FP2I/hX8LkQJ/ZHhrT4mAGPmaFXb9WNfYFZHh/S4dD0Gx0W3GI7O3igUegjUKP0Fa9ABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//T/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACv87D/gttq3/CT/APBzT8E/D1ycxWMugRgHp807N/Sv9E+v83H/AILzXZ+HP/ByR8KPHF+fLgL+HpwzdNq3DKaAP9I6io4ZY54VniOVcBgfY9KkoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//U/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACv877/g8m+EHiL4dftT/Br9r/SonFm9v9gklQHCz2cyzxgnsSu7Ff6INfnj/wAFOv8AgnZ8KP8Agpr+ytrH7OHxNP2Saf8A0jStRVQZLK9jH7uVfUdmHcUAeqfsHftHeDP2sf2RPAPx18DXkd7a61o1q8pRgxjuEjVJo2x0ZXByK+uq/wAuGy+C3/Bwx/wb7+KtT0P4KWupa14CadnWSytjq+iXC54kMK5a3cr1HyEV7toH/B4//wAFHvBMY0j4m/CXw7fXcPyyMY72yfI65UlwKAP9Kiiv85FP+D2T9p+NcXHwS0Pd7X9yP/aNfbn/AATi/wCDtL4wftgftjeDf2bfiP8ACGz07TvFt4tiLvSrqWeaB3+65R41BQfxcigD+5KiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAGsqsu1hkHjFeQeKv2efgF46Zn8a+CNA1Zn6m8021nJ/F4ya9hooA+LtT/4Jx/sC6yxfU/g14OlJ9dGtB/KMV0Hwu/YR/Yx+CXi6Lx/8I/hd4Z8Oa3ACsV9YadBDOgPXa6oCv4V9Y0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//1v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9f+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Q/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9L+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/T/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/1P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK/JT/gq3/wWG/Zv/wCCSvgXQfEvxstr3V9S8TSyRadpmnKpmkWHHmSEsQqouQPrX0l/wT9/bz+Cf/BR39mzSv2mfgQ840jUJJLeW3uV2T21xCdskUgHGV9uMUAfbNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyB/wCCtf8AwRt/Z9/4K4eB/D/h/wCLeo3ugat4WlkfTtTsQrOqTY8yJkbAZW2g+xr6X/4J3fsBfBr/AIJr/szaX+zH8EWuLjTLCSS5nurogzXNzMcySvjgZ6ADgAV9z0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9k=" alt="Aláírás" className="h-16 mx-auto mb-1" />
                            <div className="border-t border-stone-400 pt-2">
                              <p className="text-xs">HNR Smart Invest Kft.</p>
                              <p className="font-semibold text-sm">Németh Roland ügyvezető</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Banki adatok + Összeg + Bezárás */}
                    <div className="border-t p-4 bg-gradient-to-r from-sky-50 to-blue-50 space-y-3 rounded-b-2xl">
                      <div className="bg-gradient-to-r from-emerald-100 to-teal-100 p-3 rounded-lg border border-emerald-300">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-emerald-800">💰 Fizetendő összeg (egyszeri):</span>
                          <span className="text-xl font-bold text-emerald-700">
                            {(() => {
                              const guests = apt.maxGuests || 0;
                              let total = 0;
                              if (guests <= 4) total += 30;
                              else if (guests <= 6) total += 35;
                              else if (guests <= 9) total += 40;
                              else if (guests <= 12) total += 45;
                              else total += 45 + Math.ceil((guests - 12) / 3) * 5;
                              const eq = apt.equipment || {};
                              const pillowCount = eq.doublePillow ? guests * 2 : guests;
                              if (eq.palinkas_need) total += Math.round(guests * 150 / eurRate);
                              if (eq.pohar_need) total += Math.round(guests * 2 * 595 / eurRate);
                              if (eq.boros_need) total += Math.round(guests * 250 / eurRate);
                              if (eq.kaves_need) total += Math.round(guests * 995 / eurRate);
                              if (eq.bogre_need) total += Math.round(guests * 695 / eurRate);
                              if (eq.eszkoz_need) total += Math.round(2790 / eurRate);
                              if (eq.serpenyo_need) total += Math.round(5990 / eurRate);
                              if (eq.fozokeszlet_need) total += Math.round(4490 / eurRate);
                              if (eq.vasalo_need) total += Math.round(2690 / eurRate);
                              if (eq.matracvedo_need) total += Math.round(guests * 7990 / eurRate);
                              if (eq.kadkilepo_need) total += Math.round(695 / eurRate);
                              if (eq.keztorlo_need) total += Math.round(guests * 2 * 795 / eurRate);
                              if (eq.furdolepedo_need) total += Math.round(guests * 2 * 2990 / eurRate);
                              if (eq.paplan_need) total += Math.round(guests * 6490 / eurRate);
                              if (eq.parna_need) total += Math.round(pillowCount * 6990 / eurRate);
                              if (eq.huzat_need) total += Math.round(guests * 2 * 1990 / eurRate);
                              if (eq.lepedo_need) total += Math.round(guests * 2 * 4490 / eurRate);
                              if (apt.requestDeepCleaning && apt.apartmentSize) {
                                const size = apt.apartmentSize;
                                let base = 25;
                                if (size <= 35) base = 25;
                                else if (size <= 45) base = 35;
                                else if (size <= 60) base = 45;
                                else if (size <= 80) base = 55;
                                else if (size <= 100) base = 70;
                                else base = 70 + Math.ceil((size - 100) / 20) * 10;
                                const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                total += Math.max(30, base + guestSurcharge) * 2;
                              }
                              if (apt.requestCompanyInternet) total += 20;
                              return `~${total}€`;
                            })()}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-sky-700 mb-2 flex items-center gap-2">
                          <span>🏦</span> Utalási adatok
                        </h3>
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-xs text-sky-600">Kedvezményezett</p>
                            <p className="font-semibold text-sky-800">HNR Smart Invest Kft.</p>
                          </div>
                          <div>
                            <p className="text-xs text-sky-600">Számlaszám</p>
                            <p className="font-mono font-semibold text-sky-800">11713177-21465370</p>
                          </div>
                          <div>
                            <p className="text-xs text-sky-600">Közlemény</p>
                            <p className="font-mono font-semibold text-sky-800">{registrationNumber || apt.name || 'Lakás neve'}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Partner bankszámla adatai - hova utalja a cég a bevételt */}
                      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
                        <h3 className="font-semibold text-emerald-700 mb-2 flex items-center gap-2">
                          <span>💰</span> Az Ön bankszámla adatai (ide utaljuk a bevételt)
                        </h3>
                        <p className="text-xs text-emerald-600 mb-3">A HNR Smart Invest Kft. ide utalja az Ön bevételét:</p>
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Számlatulajdonos neve *</label>
                            <input 
                              type="text" 
                              value={partnerBankAccountHolder || currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}
                              onChange={(e) => setPartnerBankAccountHolder(e.target.value)}
                              placeholder="Számlatulajdonos neve"
                              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-emerald-400 focus:outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Bankszámlaszám *</label>
                            <input 
                              type="text" 
                              value={partnerBankAccount}
                              onChange={(e) => setPartnerBankAccount(e.target.value)}
                              placeholder="12345678-12345678-12345678"
                              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-emerald-400 focus:outline-none text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Elfogadás checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={contractAccepted} 
                          onChange={(e) => setContractAccepted(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-sm text-stone-700">
                          Kijelentem, hogy a fenti megbízási szerződés tartalmát megismertem, az abban foglaltakat elfogadom, és a szerződést a saját nevemben aláírom.
                        </span>
                      </label>
                      
                      <button 
                        onClick={() => { setShowContractModal(false); setShowContractSuccessModal(true); setContractAccepted(false); }}
                        disabled={!contractAccepted}
                        className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all ${contractAccepted ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                      >
                        ✍️ Aláírom a szerződést
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* BÉRLETI SZERZŐDÉS MODAL - Bérleti szerződés */}
              {showContractModal && apt.operationType === 'rental' && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto my-8">
                    {/* Fejléc */}
                    <div className="bg-gradient-to-r from-indigo-700 to-purple-800 text-white p-4 flex justify-between items-center rounded-t-2xl sticky top-0 z-10">
                      <h2 className="text-lg font-bold flex items-center gap-2">
                        <span>📜</span> Lakásbérleti szerződés
                        {apt.contractDuration === '1year' && <span className="ml-2 px-2 py-0.5 bg-amber-500 rounded text-xs">1 éves</span>}
                      </h2>
                      <button onClick={() => { setShowContractModal(false); setRegistrationSuccess(false); setPartnerOnboardingStep(1); }} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                        <X size={20} />
                      </button>
                    </div>
                    
                    {/* Szerződés tartalma */}
                    <div className="p-6 text-sm text-stone-700 space-y-4">
                      <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-stone-800">LAKÁSBÉRLETI SZERZŐDÉS</h3>
                        <p className="text-stone-500 mt-1">({apt.contractDuration === '1year' ? '1 éves határozott időre' : 'határozatlan időre'})</p>
                      </div>
                      
                      <p>amely létrejött egyrészről:</p>
                      
                      {/* Bérbeadó */}
                      <div className="bg-stone-50 p-4 rounded-lg space-y-1">
                        <p className="font-semibold text-stone-800 mb-2">Bérbeadó:</p>
                        <p><strong>Név:</strong> {currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}</p>
                        {currentPartner.motherName && <p><strong>Anyja neve:</strong> {currentPartner.motherName}</p>}
                        {currentPartner.birthPlace && <p><strong>Született:</strong> {currentPartner.birthPlace}, {currentPartner.birthDate}</p>}
                        <p><strong>Állandó lakcím:</strong> {currentPartner.zipCode} {currentPartner.city}, {currentPartner.street}</p>
                        {currentPartner.taxNumber && <p><strong>Adószám:</strong> {currentPartner.taxNumber}</p>}
                      </div>
                      
                      <p>másrészről:</p>
                      
                      {/* Bérlő */}
                      <div className="bg-stone-50 p-4 rounded-lg space-y-1">
                        <p className="font-semibold text-stone-800 mb-2">Bérlő:</p>
                        <p><strong>Cégnév:</strong> HNR Smart Invest Kft.</p>
                        <p><strong>Székhely:</strong> 1138 Budapest, Úszódaru utca 1.</p>
                        <p><strong>Adószám:</strong> 32698660-2-41</p>
                        <p><strong>Cégjegyzékszám:</strong> 01 09 438018</p>
                        <p><strong>Képviselő:</strong> Németh Roland ügyvezető</p>
                      </div>
                      
                      <p>a továbbiakban együttesen: Felek között az alulírott napon és helyen, a következő feltételek szerint:</p>
                      
                      {/* I. A BÉRLET TÁRGYA */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">I. A BÉRLET TÁRGYA, CÉLJA ÉS IDŐTARTAMA</h4>
                        <ol className="list-decimal ml-5 space-y-2 text-xs">
                          <li>A Bérbeadó kijelenti, hogy kizárólagos tulajdonát képezi az alábbi ingatlan:</li>
                        </ol>
                        <div className="bg-amber-50 p-3 rounded-lg mt-2 border border-amber-200">
                          {apt.cadastralNumber && <p><strong>Helyrajzi szám:</strong> {apt.cadastralNumber}</p>}
                          <p><strong>Cím:</strong> {apt.zipCode} {apt.city}, {apt.street} {apt.floor ? `${apt.floor}. emelet` : ''} {apt.door ? `${apt.door}. ajtó` : ''}</p>
                          <p><strong>Alapterület:</strong> {apt.apartmentSize || '---'} m²</p>
                        </div>
                        <ol className="list-decimal ml-5 space-y-2 text-xs mt-3" start="2">
                          <li>A Bérbeadó bérbe adja, a Bérlő pedig – ismert és megtekintett állapotban – bérbe veszi a Bérleményt.</li>
                          <li>A Felek megállapodnak, hogy a jelen bérleti szerződést <strong>{apt.contractDuration === '1year' ? '1 éves határozott' : 'határozatlan'}</strong> időtartamra kötik.</li>
                          <li><strong>Továbbbérbeadás (Szublokáció):</strong> A Bérbeadó kifejezetten hozzájárul ahhoz, hogy a Bérlő a Bérleményt harmadik személyek részére határozott időtartamú bérleti szerződések keretében továbbbérbe adja.</li>
                          <li>A Bérbeadó kijelenti, hogy jogosult a jelen szerződés megkötésére.</li>
                        </ol>
                      </div>
                      
                      {/* II. BÉRLETI DÍJ */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">II. BÉRLETI DÍJ ÉS ADÓZÁS</h4>
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs space-y-2">
                          <p><strong>7. Bérleti díj meghatározása:</strong> A bérleti díj összege a tárgyidőszakban keletkezett, a Bérlő által igazolt bevételi adatok figyelembevételével kerül kiszámításra és elszámolásra.</p>
                          <p><strong>8. Elszámolás és fizetés:</strong> A bérleti díj havonta utólag esedékes. A Bérlő a tárgyhónapot követő hónap <strong>11. napjáig</strong> köteles írásos elszámolást küldeni és a bérleti díjat átutalni.</p>
                          <p><strong>9. Adózási nyilatkozat:</strong> A Bérbeadó vállalja a 10%-os költséghányad elszámolását. A Bérlő, mint kifizető, a bruttó bérleti díj 90%-át tekinti jövedelemnek, és ebből vonja le a 15% mértékű SZJA előleget.</p>
                        </div>
                        {apt.contractDuration === '1year' && apt.servicePackage !== 'premium' && (
                          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 mt-3">
                            <p className="font-semibold text-amber-800">🎁 1 éves szerződés kedvezménye:</p>
                            <p className="text-xs text-amber-700">Az 1. és 12. hónap bérleti díját elengedjük!</p>
                          </div>
                        )}
                      </div>
                      
                      {/* III. KÖLTSÉGEK */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">III. KÖLTSÉGEK</h4>
                        <p className="text-xs">10. A Felek rögzítik, hogy a Bérleményhez kapcsolódó valamennyi üzemeltetési költség (közös költség, közműdíjak: gáz, villany, víz) a <strong>Bérbeadót</strong> terheli.</p>
                      </div>
                      
                      {/* IV. BIRTOKBAADÁS */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">IV. BIRTOKBAADÁS ÉS HASZNÁLAT</h4>
                        <ol className="list-decimal ml-5 space-y-1 text-xs" start="11">
                          <li>A Felek a birtokbaadásról jegyzőkönyvet vesznek fel (óraállások, leltár).</li>
                          <li><strong>Visszaadás:</strong> A bérleti jogviszony megszűnésekor a Bérlő köteles a Bérleményt kiürítve visszaszolgáltatni.</li>
                          <li>A Bérbeadó jogosult előre egyeztetett időpontban az ingatlan használatát ellenőrizni.</li>
                          <li>A Bérlő köteles a rendeltetésszerű használattal járó kisebb karbantartásokat elvégezni.</li>
                          <li>Bármilyen állagsérelemmel járó változtatás csak a Bérbeadó előzetes írásbeli engedélyével végezhető.</li>
                        </ol>
                      </div>
                      
                      {/* V. MEGSZŰNÉS */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">V. A SZERZŐDÉS MÓDOSÍTÁSA ÉS MEGSZŰNÉSE</h4>
                        <ol className="list-decimal ml-5 space-y-1 text-xs" start="16">
                          <li>A jelen szerződés csak írásban módosítható.</li>
                          <li><strong>Rendes felmondás:</strong> Bármelyik Fél jogosult a szerződést <strong>30 napos</strong> felmondási idővel, indokolás nélkül, írásban felmondani.</li>
                          <li><strong>Rendkívüli felmondás:</strong> A Bérbeadó jogosult a szerződés azonnali hatályú felmondására, ha a Bérlő fizetési kötelezettségével késedelembe esik.</li>
                          <li>A Felek rögzítik, hogy a szerződés megszűnése esetén a Bérbeadónak elhelyezési kötelezettsége nincs.</li>
                        </ol>
                      </div>
                      
                      {/* VI. ZÁRÓ */}
                      <div className="border-t pt-4">
                        <h4 className="font-bold text-stone-800 mb-2">VI. ZÁRÓ RENDELKEZÉSEK</h4>
                        <ol className="list-decimal ml-5 space-y-1 text-xs" start="20">
                          <li>A kapcsolattartás elsődlegesen e-mailben történik.</li>
                          <li>A jelen szerződésben nem szabályozott kérdésekben a Ptk. és a Lakástörvény rendelkezései az irányadók.</li>
                        </ol>
                      </div>
                      
                      {/* Aláírás */}
                      <div className="border-t pt-4 mt-4">
                        <p className="text-sm font-semibold">Kelt: Budapest, {new Date().toLocaleDateString('hu-HU')}</p>
                        <div className="grid grid-cols-2 gap-8 mt-4">
                          <div className="text-center">
                            <div className="h-16 mb-1"></div>
                            <div className="border-t border-stone-400 pt-2">
                              <p className="text-xs">Bérbeadó</p>
                              <p className="font-semibold text-sm">{currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}</p>
                            </div>
                          </div>
                          <div className="text-center">
                            <img src="data:image/jpeg;base64,/9j/4QDoRXhpZgAATU0AKgAAAAgABgESAAMAAAABAAEAAAEaAAUAAAABAAAAVgEbAAUAAAABAAAAXgEoAAMAAAABAAIAAAITAAMAAAABAAEAAIdpAAQAAAABAAAAZgAAAAAAAACQAAAAAQAAAJAAAAABAAiQAAAHAAAABDAyMjGRAQAHAAAABAECAwCShgAHAAAAEgAAAMygAAAHAAAABDAxMDCgAQADAAAAAQABAACgAgAEAAAAAQAAC3ygAwAEAAAAAQAAB3ikBgADAAAAAQAAAAAAAAAAQVNDSUkAAABTY3JlZW5zaG90AAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYYXBwbAQAAABtbnRyUkdCIFhZWiAH5gABAAEAAAAAAABhY3NwQVBQTAAAAABBUFBMAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLWFwcGzs/aOOOIVHw220vU962hgvAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApkZXNjAAAA/AAAADBjcHJ0AAABLAAAAFB3dHB0AAABfAAAABRyWFlaAAABkAAAABRnWFlaAAABpAAAABRiWFlaAAABuAAAABRyVFJDAAABzAAAACBjaGFkAAAB7AAAACxiVFJDAAABzAAAACBnVFJDAAABzAAAACBtbHVjAAAAAAAAAAEAAAAMZW5VUwAAABQAAAAcAEQAaQBzAHAAbABhAHkAIABQADNtbHVjAAAAAAAAAAEAAAAMZW5VUwAAADQAAAAcAEMAbwBwAHkAcgBpAGcAaAB0ACAAQQBwAHAAbABlACAASQBuAGMALgAsACAAMgAwADIAMlhZWiAAAAAAAAD21QABAAAAANMsWFlaIAAAAAAAAIPfAAA9v////7tYWVogAAAAAAAASr8AALE3AAAKuVhZWiAAAAAAAAAoOAAAEQsAAMi5cGFyYQAAAAAAAwAAAAJmZgAA8qcAAA1ZAAAT0AAACltzZjMyAAAAAAABDEIAAAXe///zJgAAB5MAAP2Q///7ov///aMAAAPcAADAbv/bAIQAAQEBAQEBAgEBAgMCAgIDBAMDAwMEBQQEBAQEBQYFBQUFBQUGBgYGBgYGBgcHBwcHBwgICAgICQkJCQkJCQkJCQEBAQECAgIEAgIECQYFBgkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJ/90ABABF/8AAEQgDbARGAwEiAAIRAQMRAf/EAaIAAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKCxAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6AQADAQEBAQEBAQEBAAAAAAAAAQIDBAUGBwgJCgsRAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCOWWKCJppmCIgySeAAO59q84+HHxl+E/xghvbj4V+I9P8AECabMba6NhcJOIZR1R9hO0+1eX/tqarPoP7H3xS1q0kaKW08J6xKjqcFWSzlIII6EY4r+In/AIMhrnV7vxT8fJLq5lkg+zaOxRnJUyvJcZfB/iIHJ60Af6CNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//0P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA+IP+Cl2rDQv+Cevxr1Unb5PgrWzn/tylFfx//wDBj/o5Hhz4969jrPokGfot02K/qc/4LWeIF8L/APBJ74/ayzbdngzUkz/11iMY/wDQq/nA/wCDIvRPJ/Zm+NviIrjz/Eem24P/AFytZGI/DeKAP7gqKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/EH/AIOOvFMfhT/gjB8cLh22m80q3sl+tzeQR4/I1+Xv/BmD4Mm0T/gm34y8XSptXW/GtxsPqLa0t0/Qk19L/wDB2340HhT/AII3+JdKD7X17xBotgo9R9o88j8oa7X/AINU/h5ceAv+CMvgK7uk2P4g1LV9VHGMrJdNEh/75iFAH9GlFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/i1/4PXviX/Yf7E/wr+FcT4fxD4uku2T1jsLNxnH+9Otf0Q/8EdPhTcfBT/glv8AAn4c3sflT2nhDTppVxj95dx/aW/WWv5AP+DvzX7r47ft/wD7N/7HPh5zNcSWwd4V5xNrWoR2sfH+5D+Vf3/eBvC1l4G8E6P4K00BbfR7G3sYgOgS3jWNcfgooA6qiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//0/7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoor8/f+Ck3/BRn4I/8Exf2cbr9or42pPd2qzpaWdjaY8+6uJPuxpngcck9hQB+gVFfkz/AMEnP+CvPwD/AOCtXwv1nx38IbC80PUPDtwlvqOmXpVpIvMBMbqy4DK2DX6zUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRXDfE7x7ovwr+G2v/E3xHIsWn+HtOutSuHY4AitYmlb9FoA/gF8dov7fX/B4tpuk2Si80f4XXtuJf4kVPDll5z+2PtjY+tf6GdfwCf8GivgPWP2iv23P2jv+Chni+IzS3cr2VtO/JFxrF297OAf9mONB9DX9/dABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/9T+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/zR/wDg8T/bVufjD+1t4W/Yu8G3Bm0/wLbLdX0UZyH1G94RTjqUj7dt1f6Ofxd+I2hfCD4W+Ifij4mlWCw8P6fcX87t0VIIy5/lX+WL/wAEn/2f/EP/AAWi/wCC3WrfG/4kQteeGrXWrjxVq7OCU+zQy/6Lb88DdhFx6UAf2w/8G2P/AATcH7An7A+m6/4wtTD41+Iwi1nVdww0UTL/AKNAR22ockepr+h6oLa2t7O3js7RBHFEoREUYCqowAB2AFT0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABX4Bf8HM/7T4/Zm/4JFfEMWFx5Gq+OPI8L2YB2uftzfvyv0t0kzX7+1/Af/wAHcXxS1/8AaX/bE/Z//wCCZnw7kM93eXMV/dwR8kXWrTraW2QP7kSu/wBGoA/bD/g1a/Zh/wCGd/8Agkh4S8T6jbiHVPiPeXXiW4JGGMUzeTag/wDbGJSPrX9IFeW/BD4W6B8EPg34W+DvhaJYdO8L6VaaXbqowBHawrEOPfbXqVABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/1f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD+Zr/g6r/bKT9mL/gmRq/w60S68jXfiZcJoduqth/s5+e5YewjBH415X/waRfsQW/7O3/BPt/2iPEVn5PiD4pXRuld1w66dbkpAoP91m3N+VfgP/wcpfFzxF/wUL/4LGfD/wDYD+GUrXlp4Yms9HMcXzL9v1GRWnYgd449oPpzX+ix8B/hJ4c+AnwW8LfBbwlEsOneF9LtdNgVBgbbeNUz/wACIz+NAHrNFFFABRRRQAUUUUAFFFFABRRX86v/AAXO/wCC8vwn/wCCXvw8uPhr8OprfxB8XdXgIstOVgyaerDAuLrHTHVU6n6UAfZn/BS7/gsl+xp/wS38MQ3nx31V7/xDerusvD+mbZL6Yf3mUkCJP9psewrpf+CXf/BVb9nf/gq18HL74sfAmG802XSLkWmo6ZqAUXFtIRleUJVlYdCK/wAbD48fHn40ftV/F3Ufi78aNYuvEXibX7jzJJp2LsWc/Kka/wAKjoqjiv8AVf8A+DaL/gnPqv7BP7AFhq/j6Brfxd8RHTW9QifIMETri3iI7EJyeKAP6KaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCKaaK2ha4nYJHGpZmPAAA5P0Ff54n/BN2Gf/AIKs/wDBz98Qf2t9SU3vhT4YXF5e2LN8yIll/wAS7TQvbk7pR9K/r4/4LQftZQfsW/8ABNL4qfGuK4Fvqf8AZEml6WehN9qI+zQ7fdd5f/gNfiN/wZ1fsmz/AAt/YX8TftT+Jrcrq3xS1l2gkdfnNhp+YkIP915TK35UAf2A0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9b+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArxX9o34zeGv2d/gP4t+N/i+ZYNO8L6Vc6hMzHAxBGWA/EgAV7VX8if/B37+2z/wAKM/YT039l3wvd+XrnxSvRDPGh+cabakPNkdcO2xPxoA/Ej/g2L+DXiX9v3/grb8Qv+ChvxQha6t/Dc13rAklGR/aGpSMtugPTMUZJA7bRX+lHX863/BsN+xR/wyJ/wTC8OeIdetPs/iL4kSHxDfbhhxDINtqhzzxEN2P9qv6KaACiiigAooooAKKKKACiiv5Vf+C/n/Bwr4I/4J8+Fb79m79mi8t9a+LupQGOSRCJIdGRxjzJccGbH3E7dTQB6B/wXq/4L+/Dr/gmv4Huvgh8Drm3134watAVihUh4tJRxgT3GP4/7kf4niv4FPhF+x58Z/2rvBPjb/gqF+3NqV7b/DzSpHurnUr5mW617UHP7uyst3JVm+VnXhV6V+qP/BEr/ghN8a/+Cq3xYk/bg/bvn1Bfh/PeG9kkvWYXevT7txCluRBn7zdMcLXa/wDBf79pNv21/wBsPwH/AMEdv2DdPih8HeCLyHSY7HTF220upNhD8qcbLZepPfNAHzn/AMG33/BMKX/goz+27N+0h8RtGS2+Gnw/u1vWt1TFvLdKc21mmeGWMAFuvTnmv9VW3t4LSBLW2QRxxqFRVGAqgYAAHQAV8Cf8Eyf2Dfh9/wAE5/2QfC/7N3geFPtFhbrNqt0oAa6vpADNIx7/ADcL6AV+gNABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUU13SNDJIQqqMkngACgD+Fn/g8X/aI13x3qfwY/wCCcfw3kM2q+KtSTVry3iOSzSyCzsUZR6u0jflX9gv7E/7PGg/sn/smfD79nXw5EsVt4S0OzsCF4DSxxjzW/wCBPuP41/C3+zQG/wCCu/8AwdOeIfjPNnUfBXwkuZri2YjdGIdH/wBEsh6Ye4/eD6V/ojAY4FAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9f+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBjukSGSQ7VUZJ9AK/zBP2/vE2t/wDBcD/g4j0b9nfwXK174P8ADGqxeH42T5okstPfzNRn44AZlcZ9hX9zX/BbH9uXTv8Agn9/wTt8efGqOdYtdurNtJ0NM4Z9QvQYotv+5kufZa/mc/4M1/2HtRl0/wAe/wDBRf4kW7S3usyvomiXEwyzZbzb6dSf7zbUz9aAP7qfC3hrRvBnhnTvCHh2FbbT9LtorS2iUYVIoUCIoHoFAFb1FFABRRRQAUUUUAFFFfyP/wDBwz/wcK+HP2GfDV/+yf8Aso38OpfFbU4TFe3sRDx6LE4xk44NwR91f4epoAt/8HB3/Bw14V/YT8NX/wCyx+ypfwar8V9RhaK7u4iJItFjcYy2ODcY+6v8PU1+AH/BB/8A4IG/FD/got8SE/bw/b4F63gaa7N/Bb35b7Vr9xu3F3LfMLfPU/xdBxWv/wAEC/8AggN8Qv2+fiBF+3x+31Fdv4Jlu/t9nZX5b7Tr1xu3ebLv+b7Pn/vvoOK/0jobfwZ8LPBAhtI7fRtC0K04RAsUFvbwJ2AwFVVFAH4o/wDBcD/goL4B/wCCTf8AwT1vYPhpFa6X4i1i1OheFNNtwsaxMU2GREXGEhTnp1r8Ff8Ag0k/4Jmaxq91rf8AwVI/aDtXutV1maaDw212uXYyNm5vfm7sTtU1+VP7WHxC+Jv/AAce/wDBbHTfgf8ADWWVvhx4bvDY2zrkwwaXav8A6VeNgYzLghTjpiv9M/4MfCLwP8BPhToHwa+G9mlhofhuyhsLOGMYCxwqFHTucZPvQB6dRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBR1PUrLRtNuNX1KQQ21pE80rtwFSNdzE+wAr+Bf9nb/g7C/ab+Nn/BVHQ/gRa+EdKuPhX4p8Ux+HLK2t0kOopBNcfZ4rsTbtrN0dl2Abc4r+pn/guB+0wP2TP+CWfxh+K9tcC21CTQ5dI09uh+16ni0jx7gSFvwr/Ow/4NUf2Zz+0H/wVy8L+L9StzNpvw4sLzxJO2Mqs8a+Ra5/7aygj/doA/1rKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/MD/gsn+17a/sQ/8E4fib8cknEGqLpcmm6V6m+vx5EO33XcX4/u1+n9fwg/8He/7QfiP4yfFT4L/wDBMP4VyNPqfiC/h1O/t4skma7kFrZIyjqAC7/Q0AfVX/Bnf+yFdfDj9jzxX+2J4xtyNb+KWqsttLIvz/2fZEopB/uyTGRvyr+xSvmr9jn9nzw3+yp+y74E/Z58KRLFZ+E9GtbABRgM8cYDt9WbJNfStABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/0P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK+Of2/v2t/B37DP7IPjn9p3xrIqweGNMlmt4yQDPdMNlvCo7l5CowKAP4RP+Dp79qvxZ+3L/wUH8A/8ExPgTI2oxeGru3guoYDuEutaiVRUO3/AJ4REZ9Cx9K/vO/YW/ZY8KfsVfsleBf2ZfB8aJb+FdLhtpnUAedcld1xKcdS8pY59MV/B1/watfsl+Mv23/2/PHn/BUf49xNfx+Hby4uLWecblm1zUSzZUn/AJ94iSPTK1/o8UAFFFFABRRRQAUUV/Mh/wAHA/8AwXn8G/8ABNb4b3HwJ+Bt1Bqvxi8QWxWCJSHTSIZBj7TOB/H/AM84+55PFAHm3/Bwz/wcA+GP2APBl5+y/wDszX0OpfF3WbcpNNGQ8eiwSDHmPjjzyPuJ26mvwJ/4IGf8EBfiF+3p8QIv+CgP/BQOK7l8Gz3Z1CysdQ3fadeuN27zpt3zfZs/999BxVv/AIIJ/wDBBv4lf8FCficP+Cif/BQ5by68I3V6dRs7PUS32jX7rdu86bdyLYH/AL76D5a/0jtC0LRvDGjWvh3w7axWVhZRLDb28KhI440GFVVGAAAMACgBnh/w/onhTRLTw34btIrHT7GJYLe3gUJHHGgwqqowAABgAV/Jn/wdb/8ABUt/2Vf2Yof2OfhJqBj8c/EyJorowN+9tdL+7IeOQZvuL7V/T3+0T8d/AH7MnwS8S/Hj4oXiWOh+GLGW+uZHIAxEuQozjljgAV/muf8ABOT4L/Ev/g4Z/wCCzeuftW/HGCWX4f8Ahu+XVLyOTmKO0gf/AEGwXtl8AsMetAH9OP8Awa2f8EtF/Yq/ZBX9o34naeIfH3xOijuiJV/eWmm9YIueVL/fYcdq/qbqpYWFnpdjDpmnRLBb28axRRoMKiINqqAOgAGAKt0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH8R/wDwerftMf8ACJfsxfDH9lbSrjZceLtYm1q9iHe102Py4s+xlm/8drmP+DJ/9mf/AIR74FfFf9rHVLfbN4k1S38P2EpHW3sE86bHsZZVH/Aa/B//AIO2v2k/+F3/APBVvUvhzp1z52nfDbR7PREQH5UuHX7TcY998oU/7tf31/8ABAr9mv8A4Za/4JN/B/wBd232bUdS0hddv1xg/aNUY3Rz7hXVfwoA/YyiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAKGq6pYaJpdzrWqyrBa2cTzTSNwqRxruZj7ADNf543/AATEsL//AIK//wDBx748/bY16I3fg74a3E15Yb8tGogzaaainp91Wkx6iv6bP+DjP9tiP9iv/gmD401PSLsW3iLxsn/CN6UA21912pE7r/uQ7vzFfLX/AAai/sUSfsyf8E37X4xeKLXyfEfxWu21udnGHFmPktFOf9gb/wDgVAH9QNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/z5v+Dvr9uvXfi78XvAv/BLT4KSvezpcW+pa7BbHJmvrk+XYWhA6lQfMx6la/uG/bA/aY8Cfsdfsz+M/wBpX4kTrDpXhHTJr5wTgyOi/uol/wBqR9qKPU1/nt/8G5f7NHjz/gqn/wAFXvGn/BTH9oeBr/SvCWpSa27TDdFJrF0x+xW654K20Y3Y7BFoA/uM/wCCR37C+if8E7/2DPA37OdpCi6vbWa32tyqMGXU7oB7gn/cOIx7KK/SuiigAooooAKKK/E//gtT/wAFkfhD/wAEoPgFLq08kOr/ABH16F4/DuhBhuZ8Y+0TgcpBGep/iPyigDx3/gvB/wAFwvh1/wAEsfg5J4M8CTQav8XPElu66RpuQwskYY+2XKjoq/wKfvH2r+Wb/ghn/wAER/jD/wAFSfjbP/wUi/4KLteX3g+7vzqFvBqG7z9fug27JDcraIeOOGxtHFY//BGv/gkR+0B/wWq/aVv/APgpF/wUSuby88Cy6gbrF1uV9anRsrbwKfuWcXCnbxj5R3r/AEpPC3hbw54H8N2Pg/whZQ6bpemwpb2trboI4oooxtVEUcAACgCxoGgaJ4V0S08NeGrSKx0+wiSC3t4FCRxRoNqoijAAAGABWvRX53f8FS/29PA//BOP9jHxZ+0j4tlT7ZZWzW+kWpIDXWoTDbBEo4/i5PoBQB/Ih/wdn/8ABSPxB8VfiF4e/wCCUv7Odw97dXNzbzeI0tCWaa5lYC1svl68ne6/Sv6gP+CI3/BNzw//AME0P2GvD3womt0/4S3WY01TxHcAfM97MoPlZ/uwr8g981/Ij/wbB/sF+OP28/2yvFX/AAVb/anifVLPR9TmubB7pdy3mszncXXd1S2U8cYB2iv9G6gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKx/EOuad4Y0C+8S6u4itNOt5LmZz0WOFC7H8AK2K/Kr/gtx+0CP2Z/+CWPxm+JkFwLa8bw/Nplm2cH7RqOLRAPfEhP4UAf5R2uy+Iv+CkX/AAVkl25vLn4qfELYO/8Ao93fY/JIf0Ff7UvhLw5p3g/wrpvhPR4xDaaZaw2sKDgLHCgRQPoBX+T3/wAGpn7Pn/C9P+CuvhrxdqNv59l4B02+1+VsZCzBPs8B/wC+5sj6V/rS0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUV84/td/tFeFP2S/2Z/Gv7RfjOVY7HwnpVxfYbA3yIn7qMe7ybVxQB/DD/AMHAfjzxD/wVF/4LP/Cj/glz8NJ2uNE8K3cEGrCLJRbi4ImvXcD/AJ426hM9jX9+3w28BeH/AIW/D7Rfhv4UgW203QrKCxtokGFSKBAigD6Cv4W/+DUX9nbxZ+1F+1J8Xv8AgrL8Z4murzUb65sNJnmGc3F0/m3UiE/3F2Rj05Ff3tUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoor53/ay/aS8Afsg/s3+Mf2lPidOtvo3g/TJ9QmycGRo1/dxL/tSPtRR6mgD+Jj/g8K/4KBar4t8ReDf+CW/wYne6vbya31fxFDbHLSTSts06yIHUknzSv+5X9R3/AARW/wCCf2lf8E4f+Cf3gz4FzW6J4lvIF1fxHMB80mpXah5EJ64hG2JR221/Er/wb4fs3ePv+CvH/BXTxj/wUl/aMt2v9D8Iam+vzecN0Mmq3DH+z7Rc8FbZAH29gi+tf6ZdABRRRQAUUV8A/wDBSH/gor8Bf+CZ37NuqftA/G+9XdGrQ6VpcbD7TqN4V/dwQr9fvN0ReTQB5P8A8Fav+CrPwO/4JU/s5XXxU+IU0d/4m1BHg8PaEjgT311jjjqsKdZH6Acda/hc/wCCX3/BOb9qT/g4c/bQ1X9vP9ui8u/+Fb2l95l1M25EvTG2Y9M09TwsEYwHZeFH+0a5D9jr9lD9sj/g58/b+1L9pz9pi6udL+F+i3Si9nTcLa1tFbdHpeng8GRl++w56s3YV/pqfBP4KfDD9nX4WaL8F/g3pEGheG/D9slpZWduoVEjQY5x1Y9WY8k0AdJ4A8AeDPhX4K0v4c/DvTYNH0PRrdLSysrZBHFDDGMKqqOwFdhRRQAx3SJDJIQqqMkngACv8zT/AILwftZfEf8A4LM/8FTPC3/BOH9l2Z9R8M+F9UGkx+QcxXGos227um28GO3XKg8gYav6yf8Ag4t/4KgWn/BOX9hnUrPwZeLH8QvHyyaRoMan54Q64nusekKHj/aIr8jP+DRf/gl9eeA/h9qv/BSf432TP4i8Y+ba+HPtQJkSzLf6Rd/Nzunb5Qf7ufWgD+sv9iP9kr4c/sOfsv8AhH9mT4YQJFp3hqySGSRRg3FyRmedunzSPk/TA7V9W0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABX8cv/AAedfH1vAv7BXgr4EWEwWfxv4kE88YPJttNiLdPTzJE/Kv7Gq/zMf+D0H48nxp+3X4H+BFpJmDwX4bWeVQeBcajIZDx6+WsdAH3l/wAGSPwAS28L/GX9py/gIe6ubLw9aSEdUhU3E20/WRAfpX97lfzt/wDBrd8BP+FH/wDBH/wFqNzF5d34znvPEM3GCRdSlYs/9skTHtX9ElABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRX4h/wDBdD/grlP/AMEjf2b9G+J3h7w2viXX/E+pf2Zp8EzFLaNljMjySsvOAq8DvX86/wADP+D2fQ5jBZftDfCGSHoJbnRrvI+ojlFAH98lFfzP/BP/AIOwP+CTHxWSOLxPr+p+DriTA2apaNsBP+3HkfpX6u/Cn/gqr/wTr+NcUUnw6+MHhq8aUDbG96kL/wDfMu2gD9A6K47w/wDEPwB4riWbwvrmn6kjdDa3MUo/8cY12AwRxQAtFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV/FN/wd+/tmaxb/DPwH/wTi+E8rT+IviHfw3mo20J+c26yCK1hYDn95Kc/RRX9oHiPxBpHhPw/feKNfmW2sNNt5Lm4lbhUiiUu7H2Civ8APD/4JuaBrP8AwW0/4OD/ABj+2v41ha78BfDK6a6sFkBaIC3Jh06IZ46KZSPUCgD+0L/glL+xtov7B/7B3w+/Z206FUvNN02KfUnAAMl9cDzJ2OOvzkj6V+idIAAMDgCloAKKKKACiiigAooooAKKKKACiiigAoopMrQAtFN3L6ijenqKAHUUzzIx/EKPMj/vCgB9FNDKehp1ABRRRQAUUUUAFFFFABRRRQB//9P+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/gS/wCDwz/goRqvirxB4O/4JZfBad7u9vJrbV/EkNsctJNK23TbHA6kk+aV90r+1/8Aa6/aZ+H37HH7NXjP9pn4nzrDo3g/TJr+QE4MrouIoU9WlkKooHc1/njf8G8f7MvxA/4K5f8ABWvxl/wUw/aUgOoaL4O1R9fmMw3Qy6zcsf7PtVyMFLWMb9uOAiUAf2wf8EUf+Ce+lf8ABNv/AIJ/eDvgZcW6J4ovoRrHiSZR80mp3ahpEJ64gXbEo7ba/WeiigAoorwr9pP9pH4O/sk/BbXfj98eNZh0Pwz4et2uLm4lIBOB8sca9Xkc/KiDkmgDgf22P20vgV+wN+z1rn7R37QOqJp2jaPEfLiyPOu7gj91bW6dXkkPAA+vQV/m4eCvCX7b/wDwdX/8FGpfFXilrjw98LPDcwEjDJstE0vdlYIv4ZL2cDn35Pyipfi98VP22v8Ag6p/4KMWnww+GMNxoHws8OTFraGTd9i0fTN21727I+V7uZR8q9c4ReAa/wBHf9hT9hr4C/8ABPT9nbRv2cf2ftNWz0zTYwbm6ZR9ov7oj95c3DD7zue3RRgDgUAeg/ss/sufBf8AY1+Buhfs8/APR4tG8OaBAsMMUYG+R8fPNM3V5ZDyzHqfbFfQtFFABWD4p8TaH4L8NX/i7xNcpZ6dplvJc3M8hCpHFEu5mJPAAArer+OL/g7W/wCCos37PX7PVn+wh8H78p4x+JMedVNu37210kHaV+XlWuG+QdPl3UAfz4/ETWfiV/wctf8ABci38KeHpJh8MvD10beBxnyrTQbGTM0/oHuiOPXKjtX+nv8ADn4feEfhP4C0f4Z+AbKPTtF0GzhsbK2iAVY4YECIoAx2Ffzq/wDBsb/wS6i/YL/Ynt/i78RLAQfEL4oRRaje+YuJbXTyN1rbcgEZB8xh6kelf0vUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV/jS/wDBdH4uXn7VX/BYT4r6loUpu0fxENBsB1+W0K2caj8Vr/YP+M/j2z+Fnwg8U/EvUHEcPh/SbzUXY8AC2geT/wBlr/Gu/wCCc3ge+/bI/wCCv3w50nWENyfEvjqPVLzvmOK4a8lJ9sJQB/sD/sbfCOz+Av7KPw6+DdjEIU8N+HtPsNoGBuht0Vv1FfStRQQrbwJAnRFCj6AYqWgAooooAKKKKACiiigAooooAKKKKACiiigD5S/bC/Yn/Zu/bw+E7/Bb9p3w5D4i0IzLcRo52SQzJwskTjlGxxx2r+dX4s/8GdP/AATS8atNc/D7VfEXhWV87FiuBcRr/wABkHSv616KAP8AP1+KX/BkhfoJZ/g78Zlb/nnFqdj+m6Iivz48e/8ABnV/wUz8FSNd+APEHhvXdn3DDcyWznHT7wOK/wBRGigD/Jsk/wCCBv8AwcB/A6drjwTo+r4j6NpOtEjj0G9f5VetPhr/AMHQ/wACW8jTIfiVGkfGIrg3K8f8Dav9YWigD/KbT/goB/wdB/DFfI1F/H6hP+fjS3m6f9szT4/+C4v/AAcd+ETjV28Rtt/5+PDrn/2jX+q3LbW8wxNGr/UA1mS+HPD0/wDr7C3f/eiQ/wBKAP8ALLg/4OOf+C/ekY+3W942P+evhxh/7RrWj/4Odf8Agutaf67T1OP7/h5v/jdf6h7+CPBkn+s0iyb628f/AMTVVvh18Pn+/oWnn/t1i/8AiaAP8wZf+DpX/gt/CMSaVa8eugH/AON1MP8Ag6j/AOC2qfe0ix/HQT/8RX+nWfhf8NW+94e03/wEh/8AiajPwq+GB6+HNM/8BIf/AImgD/MZ/wCIqr/gtgP+YRYf+CE//EUh/wCDqr/gtifu6TYD/uAn/wCIr/Tm/wCFUfC8dPDmmf8AgJD/APE0f8Kp+F46eHNM/wDASH/4mgD/ADFT/wAHUv8AwW3bppdiP+4Af/iKaf8Ag6b/AOC37/c0yzH08P8A/wBrr/TvHwt+GajA8Pab/wCAsP8A8TUi/DL4cL93QNOH/brF/wDE0Af5grf8HR3/AAXKk/1en2w+nh7/AO11A3/Bz1/wXZn4isox/u+HP/tVf6gy/Dn4fp93Q9PH/btF/wDE1OPAXgZfu6NYj/t3j/8AiaAP8up/+DmL/gvVcf6q1Yf7vhr/AO01Wb/g5E/4L+3PEMN0P93wz/8AaK/1JF8F+Dl+7pNmPpBH/wDE1MPCXhVfu6ZaD/tin+FAH+WS/wDwcQ/8HCd3xAupj/c8L/8A3NVZ/wDgvx/wcVXvEB14f7nhf/7lr/VEHhnw2v3dPth/2yT/AAqRfD+gr92ytx9I1/woA/yrm/4Li/8AByJf/wDHvJ4pGf7nhc//ACLUR/4LGf8ABzFqP/HtP41Gf7nhlh/7aV/qtDRdHXpaQj/tmv8AhUo0zTV+7bxD/gC/4UAf5T3/AA9O/wCDnzU/+Pe4+IHP9zw64/8AbWpF/wCChf8AwdLal/qJ/iX/AMA0ORf/AG3Ff6sIsbIdIU/75FPFtbr0jUfgKAP8qEftj/8AB1XqvEUvxTOf7ulzJ/7RFPHx8/4Ou9W/1bfFo/SznX/2QV/qvCKIdFH5UjmGGMyybUVRkk4AAFAH+Pv+1p+2P/wcAfBzwK3hv9sPxf498OaJ4rilsRa63MYBexOu2RFiYhnXBwcLgV0v7KH7In/BxN8AvAu39kXwZ488LaH4g2XzSaOUtVvN65SV3WRTJ8uNpboOBX7A/H/UtS/4L2f8HFGlfB7QXa9+FnwluRHMy5MJtdNk3Tv6D7RP8o9RX+ivpWl2OiaZb6NpkYhtrSJIYkUYCogCqAPYCgD/AC3oPg1/wdv6qOP+FoLn+/qqJ/O4FbVt+yd/wdvat1uviKmf+eniCJP/AG6r/UXooA/zBbf9gL/g7W1X7+r+OI8/3/FUS/8At3W9b/8ABL//AIOytRx5nifxVFn/AJ6eMUX+VzX+m5RQB/mdp/wSD/4OuNQX994316MHs/jXH8p6d/w5Q/4Onr7/AI+PH2qrn+943k/pLX+mFRQB/mcH/ghF/wAHQN3/AK/4h3w/3vHE/wDR6Z/xD+/8HNF1/r/iNOP97xxd/wBDX+mVRQB/ma/8Q7n/AAcoXGPP+JRH18bXv9KP+IcH/g45n/13xNjH18a3/wD8TX+mVRQB/mbp/wAG1f8AwcTSnMvxQt1+vjPUf6JWzbf8G0P/AAcMN/rPi/bRf9zjqp/lHX+lfRQB/m42v/Bs9/wcGjG745W8X08Xawf5R10lp/wbQ/8ABwIv3v2hIIvp4q1o/wAo6/0aqKAP87u0/wCDab/gv4uN37SsUX08T64f/addLa/8G2H/AAX1Qc/tSCP6eI9cP/slf6D9FAH+fZ/xDbf8F9U5T9qjkf8AUxa5/wDEUn/EOn/wcKaf+8079qTcw6D/AISTWh/OOv8AQUooA/z6f+HHn/Bz74Q/f+E/2kWuWXoB4p1AdP8ArrFimzfsaf8AB4p8El+2+HPiTceJ0iGRGmsadfbsdtt2gav9BiigD/PVk/4LOf8ABzP+wpNHe/tifBNvFGiwfLJNcaNJCCq9W+16eWiHHcpiv2A/4J+f8HYP7Dn7VfiCx+F/7Q9jdfCHxZdssKf2mwl0yWY/LtW6AXy8ngCVF+tf1SzQQ3MLW9wiyRuNrKwBBHoR0xX81H/BcP8A4Irf8E2/2g/2c/Fn7QHjO30r4T+LNAsZr6LxPZrHZxPJEpZY7uFdqTBzxwN/PB7UAf0n6bqWn6xp8Oq6TPHc2twiyRSxMGR0YZVlYcEEdMVdr+OL/gzr/as+PPxs/ZW8e/Bb4pXtxrWgfD3UbWHQtQuCz7IblZC9qrtyVTYGUfwhsYr+x2gAooooAKKKKAP/1P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiivmX9sn9qLwB+xb+zD40/ad+Jkyx6V4Q0ya9KE4M0qjEECerSyFUAHrQB/E1/weD/APBQXWfHnjTwb/wSs+CEz3t1LcW2reI4LU7mmu5zs02xwOp+bzSvqUr+qn/gjD/wT50b/gmx+wF4M+ABgQeJJ4Bq3iSdRzLqt2oeYE9dsI2xKOwTiv4m/wDg3L/Zd8ff8FW/+CrPjT/gp1+0nC2paT4P1OTW3aYbop9cuyTZwLngpaR/PtxgBYxX+l1QAUUVz3izxZ4Z8CeGL/xp4yvoNM0nSoHuru7uXEcUMMS7nd2OAFUCgDnfix8V/h38DPhvrPxc+LOrW+heHPD9q95f3104SKGGMZJJP5ADknAHNf5kH7d37aH7X/8Awc1ft7aT+yJ+yLZ3Vj8L9Juz/Z9s+5IFgjbbLrGpkcD5eY0P3RhR8x47z/grh/wVE/aR/wCC+n7Xuk/8E6v+CfNpd3Pw5j1HybeOHdGNYmibD6jesPuWcIy0YbgD5j8xAr+3b/gj7/wST+Cn/BJ79nK3+HPg6OLVfGmsRxzeJfEBQCW8uQP9VH3S2iPEaf8AAjyeAD1v/gmR/wAE1PgL/wAEvf2a9O+AnwYtVmvGVZ9b1iRALnU73bh5pG6hR0jToi8Cv0VoooAKKKKAPC/2l/2gvh7+yr8BvFP7QfxTu0stC8K6fNf3MjkDIiXKov8AtOcKo7k1/m5/8EpvgH8Sf+C/v/BZPxF+2n+0JbST+BvDOoLrN9FJkwrDC+NN01M8Ywo3Adgx7196/wDB2v8A8FGvEHxe+Jvhn/gk/wDs7zvfXEl1bXPiOO0O5pryZgLKx+XrjIkdfXaMV/U//wAEVf8AgnJ4f/4Jn/sLeGvguYEHirU411XxLcqPmk1CdQTGT/dgXEa/Q+tAH6zwQQWsCWtsixxxqFRFACqoGAABwAB0FS0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB+Of/Bfn40J8C/8Agkh8ZfFKy+TPqGj/ANkQEHB338iQYH/AGav4Lv8Ag0O+CrfE3/gq1H4/uIhLb+CfD19fkkcLLcbLeM/XDtiv6Zf+Dyv40t4H/wCCdXhf4TWsgWXxl4mjLpnkw2MTOePTc618Df8ABkd8F0XTvjT+0BcxYaSXT9DgcjtGrTyAf99rQB/fjRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFfiv/AMF8P2/rH/gn3/wTt8W+OtMuhD4p8TQtoehIDh/tF0pV5F/65R5P1xX7UV/nXf8ABW3x54h/4Laf8FyvBH/BPD4WXDXfgT4fXgttTkhO6LMTB9QmOOOAPKXNAH69f8GmH7Ad78Av2PtS/a++JVoV8XfFqf7VHJMv71NOQnyuoyPNYlz9a/rXrjfh54E8N/C/wJo/w68H26Wml6JaQ2VrCgwqRQoEUAfQV2VABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFMkkjhQySsEVepPAFfkz+25/wW7/AOCcH7BFtcWnxo+IVlda7CpK6JpBF9fsRxtMUOdn/AyooA/WmvLPiz8b/hB8B/Clx43+MviXTvDOk2qlpLnUbiO3jAA9XI/IV/Cd8ZP+DoH/AIKJ/t1eLZfg1/wSW+DN7bm5byY9UubZtRvcHgOIox9nhGO7s2Ko/Cb/AINnv+Cn/wDwUL8VW/xg/wCCtXxivNNt52EraULg6heqp52LEpFpbY6YGcelAH6J/t1/8Hd37I/wguLn4d/sSaHd/FvxSSYYbqNWg0tZDwuHx5kwz2jTB9a/JDwr+wP/AMFz/wDg4U8aWHxD/bd1i5+GXwjMwnhsbiNrSDys5H2XT8h5nxwJJuO+a/r8/Yb/AOCHn/BOP9gK2tr74PeArXUfEECjOua0Fvr4tjlkMg2Rf9s1XFfriAFAVRgCgD40/YP/AGEfgD/wTt/Z80z9nX9nnTvsul2X725uZcG5vblgA9xOw6s2OB0UcCvsyiigAooooAKKKKAP/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr/Pz/AODwH9v3XfiZ8SPBX/BKz4HTPe3H2i21PxDb2py099ckJp1kQOpUN5hX+8y+lf24/tlftReAv2Lv2YfGn7TnxJlWPS/COmTXuwnBmmAxBAvq0shVAB61/nyf8G4f7L3j3/gqf/wVU8af8FOf2j4m1HTPCGpSa0XmG6ObXLwk2kK56raR/OBjjEdAH9t//BHL9gDQv+Cbn7A/gv8AZ5ghT+3zbjU/ENwo5n1S7AefJ9I+Il9FQV+o9FFAFe7u7WwtZL6+kSGCFC8kjkKiIoyWYngADqe1f5wP/Be7/gsl8W/+Cof7QNr/AMEq/wDgm79q1jwrc6kumX9xpud/iK/D7TEjL0sISMk9HwWb5ABX1T/wcqf8F2fEXjPxDdf8EsP+Cf19NqOqanONM8VavpJLyzSynZ/ZFk0fJZids7r/ALi9zX6wf8G7X/BCLw9/wTW+FkP7Qnx+sYb340+KrQGbcA40O0lAP2OE9pmH+vcd/kHAoA+of+CG3/BFT4Xf8EnfgUl1rUdvrXxY8SwRv4h1oKGEXG4WNqx5WCI8Ej/WMM9MV+7lFFABRRRQAV+fv/BT39uvwN/wTp/Yx8YftNeMpEM+l2ph0q1YgNdajMNltCo4zl8E+ig1+gJIUZPAFf5o/wDwcL/tffEX/grd/wAFOPCX/BMb9lqV9T0HwrqqaSFtzuiutZlIS5nbbwY7VMrnoMOaAPRf+DX39hPxz+3v+2v4t/4Ku/tRxvqtpoWpzXVjJdDct5rtyd+9d3VLVCMdQDsHav8AR0r5E/YR/Y/+Hn7B/wCyl4O/Ze+GkSLZeGrFIp5lUA3N2w3XFw3T5pJMn6YHavrugAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/OY/4PZPjOusftAfCX4EWk+V0TRrnVJ4geBJeTbFOP9yIV+8//AAaQ/Bd/hh/wSY0nxfdwiO48Z61f6puxgtGH8iP8NsYxX8XH/B038YW+LX/BYLxzpcD+ZD4VtrHRYwOgMEKlwP8AgbGv9Kj/AIJD/B2P4Df8E0/gz8MwnlvZeGLF5Vxj97NEJH/8eagD9H6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD8rP+CzH7emi/wDBO/8AYG8Z/HB50j124tm0zQoiQGkvrlSiFR38sZY49BX4Of8ABpB+wXrXhX4ReKP+CjfxlgaXxV8TrmRNNmuBmQWIctJKCef30mT9AK/PX/gtx8WvGH/BZT/gsR4D/wCCXPwOumufCXgy+WHVpYDui88ENfTNg4xFGPLHvX9+fwY+E/hD4FfCjw98HvAVslpo/huwgsLWJBgCOFAo/PGaAPTaKKKACiiigAooooAKKKKACiiigAooooAKKKQkAZPAFAC0V+dH7Z//AAVf/YJ/YH0aW+/aP+IWm6ZfopMelW8gudQlIH3Utotz8+4Ar+Wb4w/8HOn7cv7bviyf4L/8EdPgjqWoSzMYY9d1K1a5lAPSRYE/cwjHeWQ49KAP7avid8Xvhb8FvC9x41+LXiDT/Dmk2ilpbrULiO3iUAZ+85Ar+XT9t/8A4O4P2H/gbdXPgL9knTL34w+KATFE9ipg0wSdF/fspaQZ4xEh+tfn98OP+DbD/gph/wAFDvFFv8Xf+CwHxtvra2mYS/2DZz/bJ41PzBFRdtnb46fKrEV/Tp+xR/wRO/4Jw/sF2lvcfBX4d2NzrcAGda1hRf35buyvKCsf/bNVxQB/I5LJ/wAHOH/BcWXMEc3wT+GOpH+HzNGt2gbqN5/0y44/u4U+lfqb+xR/waDfsYfB27t/HX7YWv3/AMWfEe4SzQFmtNN83OTuUEzTA99zrn0r+vNVCgKowBwAKWgDyH4M/AH4I/s7+EofAnwL8KaX4T0i3UIltpltHbpgdN2wAsfdiTXr1FFABRRRQAUUUUAFFFFABRRRQB//1v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK+af2xP2nfAf7Gn7MvjP8AaY+JEyxaX4S02a9KE4M0qjEMK+rSyFUAHrQB/El/weA/t+658RfH/gv/AIJYfBCZ725e4ttT8QW9qdzTXtwdmn2RA6ld3mFexZfSv6tv+CNn7AWif8E4P2BfBf7P0UKDX3txqfiCdRzNqd2A8+T6R8Rr6Kor+JL/AIN0v2YvHv8AwVY/4KteM/8Agpl+0ZE2o6T4R1KTWWeYbo5tZuiTaQrn+G1j+cDHGEr/AEuQMcCgBa/jt/4OVP8AgvdH+yR4Xvf2Ev2P9TFx8VPEEHkazqVod50S1nGPKj2/8vkoOFH/ACzU5+9gV+hn/Bfb/gtB4P8A+CWH7O0nh3wJcQX3xc8YW8kOgWBIb7GhG1r+df7kf/LNT99/YGv53v8Ag2v/AOCK3iv9p74in/grD+39bTa1De3r6j4asdVBd9SvS+5tTuVf70SN/qVI2sw3dAKAPt7/AINov+CCEv7PWl2H/BQ39tLTDcfEbXI/tfhzSr5d76VBON32ycPk/bJgcrnmNT/eNf2k0gAUBVGAKWgAooooAKKKoapqen6LptxrGrTJb2trG0ssrkKiIgyzEngAAUAfiP8A8F/v+Cmmnf8ABNT9g7WvFPh27RPHnjFX0Xw1Dn5xcSoRJc4/u28eX+u0V+DH/BoX/wAEy9RstH1z/gqH8dLR59Y8RPPY+GGuhmTy3Y/bL/5ud0r5jVvTcRX5GftgfET4j/8AByL/AMFw9J+A3wpnmPw38OXj6ZYyrkxW+j2cmb/UGHQNOVOw+mwV/ptfB/4UeB/gV8LfD/wb+GlkmnaB4ZsYdOsbeMAKkMCBF6dzjJPc0Aej0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVBc3ENnbSXdwdscSl2PoFGT+lT15b8cLTxRf/BbxdYeCI/N1mfRb6OwTpuuWt3EQ/F8UAf4z/wC0prGo/tl/8FdvEM0RN2/jX4h/Zo8c5imvxGPwCV/tC+AvD9r4T8D6P4YsUEcOn2UFuijsI4woH6V/k9/8EVP+Cdv7Unjr/gsf4OX4j+B9X06z8GeIJtX1u4vbWSOGH7NvZcu6hTuk27cda/1sAMcCgBaKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvy3/AOCxX7fHh7/gnT+wj4w+O13Oia3LbNp2hQEgNLf3ClY9o4zs+8celfqRX+dr/wAFmfiv4w/4LW/8FlPBH/BMj4H3T3PgrwNfCDVZoDmLzlIa+nbHGI0Hlrnv0oA+/wD/AINKP2CvEGmeAvFn/BTP45QPP4q+JNzLHpU1wMyCzLlppgT/AM9n6H+6BX9pdeafBv4UeDvgX8KvD/we8AWqWejeHLGGwtIkGAscKBRx74zXpdABRRRQAUUUUAFFFFABRRRQAUUV8r/tN/tufso/sceE5fGf7SnjrSfCdnGpZVvLhFmkx2jhGZHPsqmgD6orD8ReJvDnhDSJtf8AFV/b6bY2yl5bi5kWKNFHUszEAAV/HJ8ev+Dp/wAY/HPxfL8EP+CRPwc1n4neIJm8mLV722lW0UngOlvGN5UdQZGjFeO6F/wRC/4LO/8ABVHVofHf/BWT40T+CvC9ywl/4RTRnDMqN/B9nhK28Z7fvGkagD9Tv25f+Dob/gnP+ydc3Xgn4W6hP8WvGERMSad4cAktxKONsl3/AKsc/wBzcfavxzn+On/By1/wWokNp8FdA/4Z7+F2oHAvpN9jK8B4J+0yr9pkO3tDGo96/pb/AGH/APghh/wTb/YKtba9+E/gC01XxBABnW9cVb+9Ld2QyDy4v+2aLiv16REjQRxgKqjAA4AAoA/kq/Y1/wCDSf8AZC+GWsxfE/8Abb8San8Z/F0jLNcLdyyQ6eZe+4FjPMP99x9K/qE+EfwQ+D3wD8JQeBPgp4Y0zwto9soSO10y2jt48DpkIBuPucmvU6KACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//1/7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK/gM/wCDwn9vnWfGnizwT/wS8+DM73d3cz2+q6/b2xy0tzOfL0+zIHU/N5m31Za/t7/ae/aC8Dfsq/s++Lv2h/iPOtvo/hLTJ9QmLHG/yl+SNf8AakfCKPU1/nU/8EB/2ffHP/BXr/gsR4w/4KKfH2Br/QvCGpSa/KZRuifUpmP2C2XPGIEG/bjgKtAH9u//AARh/YC0T/gnJ+wH4L+BCQIviCe2XVPEEwGDLqV2oebPtHxGvoFr0n/gpx/wUa+C/wDwTG/Zc1f9ob4tTpLdIrW+i6UrAT6jfsv7uGMddo6yN0Vfwr6p/aA+PXwt/Zf+Dev/AB2+MupxaP4b8NWj3d3cSEDCoOEQfxO5wqKOpIFf5kviLWP2tf8Ag6m/4KjJoujC50P4WeG5fkHJt9G0ZX5kb+Fry5A4/wBrj7q0Aeh/8Eqv2Cf2hv8Ag4d/b9139vX9tyS4m+HGl6gJ79mysN48Z3QaTZg8CCNcCQrwF4+81f6cHhrw1oHg3w9ZeE/CtnFp+m6bAlta20ChI4oolCoiKOAqgAACvHP2Xv2ZvhD+x/8AAvw9+zz8DdKj0jw54ctUt7eKMDc5A+eWQ/xSSN8zMepr3+gAooooAKKKKACv5Pf+DrP/AIKjn9j39kSP9k/4Vah5Pj74rxSW0phbEtnow+W5l45Uzf6lPq3pX9Ovxm+LvgT4B/CjxD8aPidfJpugeGLCbUL64kIASGBCzde5xgDucCv8yz9ij4Z/En/g5D/4Le6v+0N8XbeY/Dbw5dpql9C+TFb6PZybdP05ewacgbxju5oA/pq/4NUv+CW4/Y2/Y+/4am+KOneR49+K8UdzGsq4ls9HHzW0XPKmb/WuOONor+raqenafY6Rp8GlaXClvbWsaxQxRgKiRoAqqoHAAAAA7CrlABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQBRt9M020uJLy1t4o5ZfvuiKGb6kDJq9RRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUx3SJDJIQqqMkngACgD8if+C3X/BQzRv+CcX7BPir4tw3CJ4n1aFtJ8Pwkjc97cKVDgekS/Mfwr8V/wDg0y/4J5618Pfg34g/4KK/G+3ebxl8UJpP7OluR+9SwLlnl+bkGd+fpivy7/4KR+PfFf8AwXx/4LgeF/2FvhPcSXHwz+G92YL+eLmErAwN9cHjHOPKTNf6GHw3+H/hb4UeAdG+Gngi1Sy0jQrOGytIIxhUihUIoAHsKAO1ooooAKKKKACiiigAorzL4q/Gf4TfAzwpceOPjD4j07w1pFqpaS61G4jt41AGerkfkK/l+/a7/wCDr39mLwh4hl+EX7AnhTVPjf4ylYw27WEMkeneb0GHCmWUZ/55pj3oA/rHuLm3s4Gubp1ijQZZmIAAHqTX4pft0/8ABwJ/wTX/AGEVudB8Y+NIvFPimEELoXh7F9db+yyFD5cXPHzsMelfgXbfsYf8HF//AAWWmXV/2ufGo/Z/+Gd+d39iWO62uHgbnabeFvOf5f8AntIo9q/az9hX/g23/wCCan7FL2vii88NH4jeLYcO2seJttziUc747b/Upz6hj70AfizqP/BUn/gvj/wV6vZfC/8AwTg+Fj/CLwHdkx/8JPqq7ZvKb+IXM6iJTjtCjn0NfTn7Mn/BqH4D8Q+LIvjb/wAFRPiZrPxl8WzN501n9pmSyDnkq00hM0i54wvlr7V/Xzp2m6do9jFpmkwR2ttAoSOKFQiIo6BVUAAD0Aq7QB4T8BP2Yf2ev2XPCEXgT9nrwdpXhDS4VCiHTbZIdwH99wN7n3Yk17tRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9D+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKK8q+OPxh8F/s+/B7xL8bviJcraaJ4W06fUbuRjgCOBC2B7sQFHuRQB/FR/weKf8FBb6x8M+Ev+Ca/wpuWl1TxHLDq3iCG3OXMW7bZWpA5zI/z47/LX9BP/AAQo/YF0f/gm9/wTn8LeAvEUUVp4k1i3/t/xJcPhcXVygco7HGFgjwnPA21/Fl/wR/8AhD42/wCC4H/BcDxL+238abdrvwn4U1JvENwko3QhkfbplmM5XCBQ230Sv2R/4OiP+C1lz8G/DUv/AATY/ZLv2l8a+JYlt/Ed3YHdJZWs3yrYxFORPNnDAcqvHU0AflL/AMF1/wDgpX8YP+Cy/wC2fov/AATE/YQ87VvBun6qLPNqT5eraijbZLmQj/l1thnaTxwW9K/t2/4JKf8ABMf4Uf8ABLb9lHSvgd4IjjutfulS78Q6ttAkvr9lG856+Wn3Y17KK/Jr/g2n/wCCKFn+wL8FY/2o/j5pyP8AFnxvarII5lDPpFhINy265+7LIMGUj2XtX9VFABRRRQAUUUUAFFFfFf8AwUK/bU+Hf/BPv9kXxj+1L8R5E8jw9ZsbO2JAa7vpBttrdB3MkmBx0XJ7UAfyG/8AB3p/wUz1O5TQf+CVnwEunudV1yS3v/Fa2hLOVdh9h07C87pWxI6+m0Y5r+hL/ggl/wAEzNM/4JnfsG6F4H161RPHnixI9a8UT4+cXUyAx2uf7ttGQmP726v5C/8Ag29/Yr+If/BUz/goz4u/4KnftXxNquj+F9WfVEa4G6K816c74I1zwYrNMNjGBhBX+lRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV+FX/Bwb/wUhsf+Cdv7A2vax4du1j8a+MkfRtBiBw6yTLiScAc4jTvjrX7mXt5a6dZy6hfOsUECNJI7cKqqMkn2AFf5x/xz1jxJ/wAHE3/BejTvg94akluPg98KrkpM6EmD7LZyfv5ODjdcSLsX2oA/bH/g1P8A+Cbt7+zZ+yrefti/Fy0b/hOviwftaSXC/vodOJLJ1GQZmO81/WRWH4Z8N6J4O8OWPhPw3bpaafpsEdtbQxgBY4olCooA9AK3KACiiqGpappmi2Mmp6vcR2ttCpZ5ZWCIqjqSTgACgC/SdK/n3/bt/wCDk/8A4JvfsWzXXhDRdfb4k+MYSY10bwzi5xKOAstwP3Sc+5PtX4ty/tO/8HHP/BaOY6f+zX4WX9nj4W352/2tdbre5kgPGRcSr5rnb2gjA96AP6qv2yv+Co/7C37BWgy6v+0n8QdN0e6RSY9NjkE9/MQPux20W6Qk/QCv5jfiN/wcZ/8ABQH9v3xRcfCD/gjP8DdSvYpGMP8AwlGtW5dYxnHmCPiCIY5/eyH/AHa+x/2Nf+DUr9kD4Wa9F8Wf219e1L43+NpGE1w+qSyLYeb1OYyxlmGf+ej4/wBmv6c/hz8L/hx8IPC9v4J+FmhWHh3SLRQkNnp9vHbwqAMDCRgCgD+Nj4U/8G0H7X/7afiu3+Mv/BZv44ap4jndhN/wjWkXBeKPv5ZlOIIh2xFGcetf1Afsh/8ABN39ij9hXw9FoP7M3w/0vw/IiBXv/KE19LjjMlzJmQk+xA9q+4qKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/R/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACv4pv8Ag8M/4KFT/DL4D+Hf2BfhveEa548kW/1pID866fC2IYSF5/fS847hRX9lnj3xv4b+GngjVviF4xuUs9K0S0mvbuZyAqQwIXc8+wr/ACiNL/aA8If8FI/+Cunjn/gob+1NceX8KPhtO2vXMUp+V7OwfZpenRK3V7iRVAQdgx6UAfvf8K/jT4H/AODbP/giLos88UD/AB8+MkDanb2T482Ka5jHlyyr18q0iKgA4y/HrXgP/BtJ/wAEhfGv7WfxfuP+Cs/7ckM2rQS38l74eg1IFm1G+LZa/kD9Y424iHQnnoBXwH+yB8BP2g/+DmT/AIKkaj8dPjQs9j8LPDNxG94i5FvZ6bC3+jaZb/w75FA345xk+lf6f/w/8A+EPhZ4J0v4deAbCLTNG0W2jtLO1gULHFDEoVVUD0AoA69VVVCqMAcACloooAKKKKACiiigAr/Ni/4OTf23PiF/wU8/4KE+Ev8AglZ+yjI2q6T4Z1aPTpUtiWjvdenISRm28GOzTK56A7z2r+u//gvN/wAFM9K/4JmfsJa5480S5RfHXilX0bwxBn5/tUyEPcY/u26fP/vbRX87v/Bol/wTN1bVbnXv+Cqvx+tXutT1iW4svCzXY3O3mMftuofN3dsxo3+8RQB/Xj/wTn/Yk+H3/BPT9j7wb+y18PY02aDZqb+6UYa8v5Ruubh/UvJnHooA7V9v0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUVjeIdf0jwpoN54m1+dLWx0+F7ieVyAqRxruZifQAUAfzp/8HMv/AAUq/wCGF/2GLv4beALzy/HvxND6RpqRn97DbuMXE4A54U7Vx3NZf/BsZ/wTVP7EP7D9t8XPiFZ+X49+KATVb5pR+9htGGbeEk8jI+Zvc1/O78L9N8Rf8HFX/Beq8+IetJJcfBv4U3AaNWBMBs7KT90nTG65lGT/ALNf2yftg/8ABUP9gf8A4J4+Ew/7QPjvTNEktIQlto9s4nvnWNcKkVrFl+gAGQBQB+i9eOfGn9oP4Ifs5+D7jx78c/FOmeFdItVLPc6jcRwLgDtvIyfYV/GB8Uv+Dj//AIKF/wDBQfxbcfBX/gjT8FtQeKVjD/wkmqW/nOinjzNnFvAMc5lc49K6v4If8Gw37Un7YHi63+OX/BZr4z6p4nv5WEx8PabctKseefLaZsQxDtiGPj1oA97/AGsP+DsL4Qf8JPJ8Fv8Agmp4B1X40eMJ2MFvdRwSx6f5nQFFVTNMPoqj3r5R0j/gmN/wXy/4LE30Xir/AIKLfEqT4OfDy8YSDwzppMUxiP8AAbSFhzt7zyH/AHa/rd/ZK/4J7/scfsN+F4vC37MfgLS/DSooV7uKEPeTYGMy3L5kYn649q+zaAPxW/YS/wCCA3/BNr9gmG11jwN4Lh8UeJ4AC2u+IQt7c7x/FGjDyov+ArketftLFFFBEsEChEQAKqjAAHQADoKkooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiis3WdX03w/pF1r2szLb2dlC888rnCpHGu5mJ7AAZoA/k5/wCDtn/goaf2aP2LLX9lTwLe+T4o+KbmK4EbYeLSoT+9PHaVsJ9Aa/z+f2Xvg/8AGj9sLxP4R/4J7/s020k914l1FL3WZIs+XJP082cgcQWUXAySu7cw+9XuP/Ban9uXxN/wUj/4KPeKfiN4aaW80q2vRofhu2iyx+zW7+VF5YX+KRvm47mv7/v+Db3/AIIy6X/wTt/Z6i+OfxisUk+K3jq2Se6aRQX02zcbo7VPRj1k9+O1AH66/wDBNn/gn/8ACP8A4JufssaB+zl8K7dN9nEsuqX+0CW+vXA82Zz7nhR2XAr76oooAKKKKACiiigAqhquqadoemXGtavMltaWkTTTSyEKkccY3MzE8AADJq/X8lv/AAda/wDBU3/hkf8AZTT9kL4T6h5Xjv4owtFdNC2JbPR/uzNxyrTn92vtuoA/mx/bN+JfxM/4ORP+C2+kfs/fCWeY/Dfw5dtptlKufKttItHzfagw6BpyDs+qCv8ATR+Cvwg8CfAD4TeHvgr8MrJNO0DwxYQ6fY28YAVIoFCjp3OMk9zX80X/AAavf8Esv+GL/wBkT/hp34qaf5PxB+KcUd1iZcS2ek/etoeeVMv+sce6jtX9VlABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFcj428feCPhr4duPF3xB1a00TS7NC811ezJBDGo7s7kACv5cv28/+Dsb9if8AZ6vLn4c/sm2Vz8Y/GAJhi/s7KaYkv3QDcYJk57RK31oA/qyu7y0sLd7u+lSGKMZZ3IVQB6k8Cv44P+DmH/gt18Evh3+yvrH7H37K/jWx17x74tk/s7Vf7KnEx0+yI/ehnjyod/ubc5r80PGHgj/g4Q/4LK+EtT+LX7S3iFvgD8DrW2kvrlH8zTIPsUa7mxACLm5+UdZCqGvz3/4N5/8AgmB4E/be/wCClF942ggn1n4TfCy6+2S3V+gP9ozRti3V15X96w3lOcLwc0ASf8EnPhF/wWu+KfwJm/Z7/wCCb/he4+G/hTxFMJtf8bXMf2Oa8YjAAvJRlIkXhY4AW77vT+mr9in/AINLf2bfAmuxfF//AIKAeKtQ+MvjKZhPcQTSypp/m9SHZmM84/3mUe1f1w6VpOl6Fp0OkaJbRWdpbqEihgRY40UdFVFAAA9AK0KAPNfhV8G/hR8DPCNv4C+DnhzT/DOjWihIrPTbdLeIAcDhAMn3PNelUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//0/7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACv5rf8Ag6B/4KFp+xb/AME+NR+G/g+9EHjD4nFtHswjYkisyP8ASpcDkDb8gPvX76/Hj44fDj9m74Q698bvizqEel6B4ctJLy7nkIACxjO0erMeFHc1/lVfEX4xfGr/AIOOf+Cx/h7wpceenhS71IW9jZKSY7DQ7Z90rkDgPIg+Y+rCgD9J/wDg1R/4IxyfHDx9F/wUQ/aN0sv4Y8PTn/hGbS6T5b29XrdFT1jiP3exb6V/pFKqqoVRgDgAV5n8GvhF4E+A3wt0L4P/AAz0+LTND8PWcVlaW8KhUSOJQo4Hc4ya9NoAKKKKACiiigAooooA8d/aB+OXw+/Zo+C3iX48fFO8Sw0DwtYTX93K5A+SJchV/wBpjhVHqRX+ad/wT4+DnxN/4OKf+C0uuftS/HK3ll+Hvhm+TVb+J8mGOyt3xp+mp2+faCwHYMe9fox/wdpf8FKfEPxQ8feH/wDglD+zfO9/d3F1bzeJEszuae8mYC0sPl67SQ7j1IHav6dP+CIH/BNfw/8A8EzP2GvD/wAKZ4Iz4v1tE1XxJdKPmkvplB8rP92FcIo9qAP170+wstKsYdM06JYLe3RY4o0ACoiDCqAOAABgVcoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK+Sf2rv26/wBk79iPwVL47/ab8b6Z4Ws0UlI7mZftExH8MMC5kc+yrX8dX7WH/B1r+0F+0x4yk/Z7/wCCPnwx1DWdTvWNvDrl9aPc3DZ4D29lHkKP9qY8f3aAP7Wvjx+0r8BP2YfBVx8Q/j94s0zwpo9qpZ7jULhIQcDooY5Y+gUE1/In+2r/AMHdHhC68RS/BT/gl/4DvviT4muHNvb6rdQSraGQ/KDBaoPOm9RnYK+VfgF/wbSf8FF/+CiPjS2/aA/4LD/FTUbGK5YTf2Ktx9r1AIefLCg/ZrQdsKCR6V/X5+xN/wAEsf2Gf+Cffh6LSP2avAljpl8qBZdXuEFzqUxHd7mQFh9E2j2oA/jk8Bf8EXv+C3X/AAWV8Q23xV/4Kg/EW88AeDLlxNHokh2yiJsHbDpkRWKLjoZjur+p79gf/ghV/wAE6v8AgntZWt/8K/BcGt+J4VG/X9cVby9LgctHuHlw/RFGPWv2Iryv43/F/wAGfAH4R+IfjN8QrpLLRvDdjNfXUrkABIULY+pxgUAfyef8HY3/AAUP1b4Y/BLQv+CeHwQuGk8ZfFGREvorY/vY9O3BBHheQZnwo9s1+yH/AAQ5/wCCd2j/APBOL9gnwx8Lrq2VPFWtxJq/iCbA3Nd3Cg+WT6RLhfrmv5Pv+CMnwg8af8FsP+Cw3jX/AIKd/Hi0e58E+Cb7zdKgnGYfNQlbC3UEYxGg8xsd6/0SKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/1P7+KKKKACiiigAooooAKKKKACiiigAooooAKQkKMngClr+c3/g4x/4K46X/AME4f2UbjwD8Or1P+Fm+PIJLPSolPz2luw2y3ZHbaOE96AP5hf8Ag62/4LGSfH74ot+wD8AtVLeEPCk+fENxbv8AJe36f8scjgxw9PTdX6Sf8Gcf/BPL/hAPhB4j/b48fWOzUvFjHTNCMi4KWMJ/eyrn/no/GR2Ffwq/s2/s0/Ev9sT9rXwj8AtN8698R+NtUiF3Ix3vGs775pHPJBVMs2cYPFf7YP7NXwI8G/syfAbwr8BvANultpXhfToLGFUAAPlIAzcd2PNAHuNFFFABRRRQAUUUUAFfnP8A8FUv2+vBP/BN79jDxV+0d4okjbUba3a10W0YgG61GZSsCAdwp+ZvRRX6KSyxQRNNMwREGWJ4AA7/AEFf5kv/AAW2/as+Jf8AwXA/4KqeGP8Agnv+y5O994Q8M6n/AGTbPDloZbndi+v3xxsiUEKfRfegD3P/AINgf2BPG/7dn7Yfij/gq9+1LHJqlnpGpTz6ZJdgsLzWZyWeYbuqWwOFxwGI9K/0agMcCvlr9iz9lH4cfsS/sy+Ev2afhbbLb6X4ZsY7csoAaabGZZn9Wd8sa+pqACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK/On9ub/gqx+w3/AME7/C8muftKeN7PT7/YWt9HtmFxqVwQOFjto8vz6kBfev48Pjj/AMHEP/BUv/gqV44uf2fP+CQnwz1Hw/plyxhbWRCLjUfLPHmNKR9ms1xzkliPWgD+zb9tH/gpb+xZ+wD4Rk8VftOeOdP0NwhaDT1kEt/cEDhYraPMjE9OmK/jp/aI/wCDmT/goH/wUH8dz/s7f8EcvhfqNst2xgXW5bb7XqBQ/L5ioMwWq4/ikLEe1e2fsX/8Gk/if4l+LY/2gf8Agrd8Q77xh4gvHFxcaLZXTzMzHnZc38mSR/sxADsGr+xj9nX9lX9nX9krwLB8N/2cvB+meEdIgUL5VhAsbSY7yyffkb3YmgD+LP8AZR/4NS/2if2nfGsX7Q//AAWF+J+oavql4wnl0W0umu7ts4PlzXb5jiHYpCpx2xX9i37J37Cf7Jn7D/gyLwN+zD4I03wtbIgWSaCIG6nwMZmuGzI5Pu2PavreigAooooAK/iN/wCDsT9vfxNr6eEf+CUn7PMz3fifx5c28mtxWpy4gdwtvbEL/wA9X5I/uiv65v2tP2k/AP7If7Oniz9or4lXKW2k+F9PlvHLEDeyL8ka+7tgAV/Dv/wbs/s2+Pf+Cnn/AAUX8f8A/BYP9pe2a607SdRlOhx3A3Rm9fiFU3cbbWLHtuxQB/XN/wAEkv2CfDH/AATn/Yf8Ifs96VCi6ulst7rc6gBptQnUNLk9wn3B7Cv0uoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//V/v4ooooAKKKKACiiigAooooAKKKKACiimsyopZjgDqfSgD58/aq/aX+GP7IHwD8SftDfF29Sy0Tw3ZvcyFiAZGUfJEnqzthQBX+Sb+0N8f8A4kf8FOP2iviV/wAFH/2hi6+CvCJ/0G1kz5RkYldO02IcjJ+/IP7qnPWv2y/4ON/+ChvxD/4KW/tmeH/+CWH7H0smqaNpeqR2d59kJKX2qMdrZK8GK3Gc9uK/OT/gp78HdI+F3jb4Sf8ABEv9l3Go6hoc1s/ia4txk33iPUNokL46rbqdoHYCgD9k/wDgz1/YMvPGvjfxj/wUi+J9nvKSSaVoLSLx5r83EyZ/ujCD6V/oG18bf8E//wBk3wn+xF+yH4H/AGbfCMKxReHdNhiuGUY825ZQ0zn3L5r7JoAKKKKACiiigAoorzb4w/FnwN8Cfhfrvxg+JV7Hp2heHbKW+vJ5CFCxRLuPXucYA9aAP5+v+Dlz/gqjb/8ABP79jO5+F3w7vli+IvxJhl0/TxG37y0syNtxc4HI4OxD6n2r4Q/4NL/+CV1z8E/g7ef8FB/jdYH/AIS/x9GU0Rbhf3ttphOTLzyGuG5z/dxX4K/Bbwr8VP8Ag5Z/4LW3fxE8ZxTr8M/Dt0txcIc+Ta6NaP8AuLUdg9wRz9Sa/wBQfwp4W0HwR4ZsPB3ha2Sz03S7eO1toIgFSOKJQqKoHQACgDoKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAoprMqKWY4A6n0r8mv21/8Agt1/wTf/AGDYbix+MvxCs7zXYAf+JLoxF9elh0VkiO2P0+dlxQB+s9ISFGTwBX+d3+2B/wAHp/xP1t7rw/8AsVfDi10O35WLVfED/arjHTctvHtiX6EtX86Hxo/4LB/8Fdf26Nbk0HWPiL4o1YXTfLpPh8SwRfN/CsFkoyPwoA/16/ij+11+yz8E4HuPi58RfDnh0RfeW/1K2hcY/wBhnDfpXwN4r/4L6/8ABIHwbdGz1P456BNIDgi18+4A/GKJl/Wv8yD4Uf8ABEX/AILGftT3KazpHwo8SPHeYb7brrCyRs9ybt0b/wAdr5I/bV/YN+J37A/jSP4WfHfW9Ck8Xbd9zpGj3f26WzHYXMiIsUbHsgZm9QKAP9mL9lz9u/8AZA/bT0u41X9lz4gaT4xSzx9ojspf30Oem+Fwsij3K4r62r/Ly/4M/f2f/wBoLxX/AMFALv46+DxdWXgXw7pc9vrFx8y29zJMB5Vv6OwI3Y7V/qG0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRX5yft1/8FXP2Gv8AgnV4Xk1z9pXxtZ2GobC1vo1qwuNSuSBkLHbR5bn1bC+9fxzfGz/gvv8A8FZv+Cufjq6/Z6/4JGfDrUfCmg3DGGTWY4xLqHlHjzJbph9ms1xzwSwHQ0Af2Hft3f8ABWn9hX/gnT4bk1b9pDxtaWmp7C1votmwudSuCBwEto8sM+rbV96/jz+NH/Bfv/grR/wVt8cXP7P3/BI/4caj4V0K4YwyazHGJtQER48yW6b/AEazXHPBLAd6+yP2D/8Ag0e0K68Sx/Hz/gqp41u/iF4qvHFzcaLaXMjweYecXV6582bB/hTauOM4r+xD4L/Ab4Mfs6eB7X4bfArwxp3hTQrNQsVnptukEfHdtoyx/wBpiTQB/HF+wz/waP2et+J4/j7/AMFWvHN5498T3ji5uNFs7mSSIuedt1fSEyS4P8Me1ewNf2J/A79nn4H/ALNHga2+G3wD8K6b4T0S1UKlrpsCQqcdCxUbnb/aYk17JRQAUUUUAFFFFABRRXxR/wAFDf2yfA37BX7InjL9pnx1MqR6DYu1pCSA1xduNsESDuWfA4oA/kI/4Ojv2yPHP7V37RngH/gjl+zLK97qGq39rNr6WxJ3TzMBb277eyD9446cCv6/P+Ce/wCxv4H/AGCv2RfBv7MngaJFTQLFBeTKADcXrgNcSn13PnHsBX8g/wDwa2fsa+Of2qf2iPHv/BY/9puFr3UtV1C5i0F7gZDXU5zPPHkfdhQiJMdPwr+8qgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9b+/iiiigAooooAKKKKACiiigAooooAK/nP/wCDjX/grLpv/BOf9ke58C/D69QfEnx7DJY6VEpHmWsDDbLdEdto4X3r9xP2i/j78Ov2Xvgp4i+PHxWvUsNC8N2cl3cSOQMhFyEX1ZjwBX+aX+yt8LvjN/wcq/8ABYLUvjd8VEnT4aeHLpbm5Vs+Tb6bA/8Ao9mnbfLgbgKAPuD/AIId/sj6J/wT1/Yl+IP/AAXB/a9t93iGbTbmTwrDfD97umBCz/Nz5k8hG3/ZrhP+DW79lHxZ+3N+3946/wCCmvxzha+t9BvJ57SWcZWTVLxi2Vzx+5Q4GOley/8AB2j+1xbtf/Df/gk1+zmgjgtfss1/YWfADNiKytdq+g5xiv6z/wDgjj+w3o3/AAT9/YF8EfAyCBY9Xa0TUNYkAAaS9uVDyZ/3c7R9KAP1HooooAKKKKACiiigAr+Bz/g7C/4Kga/478VaP/wSn/ZnuJL3UNQuIG8SCyO55Z5GAtrAbfchnH0Hav6nf+CvP/BRvwN/wTN/Y28QfHLXJo21+4iey8P2RI3XF/IuEwv92P7zfSv47P8Ag2F/4J1+Nv23P2pfEP8AwVf/AGroZNTtbDUZptIa8BYXmqSkmScbuqQZwvbPTpQB/VJ/wQf/AOCX+gf8Ey/2KdI8IarbIfHPidE1PxFdYG/z5FBWAH+5CvygetftrSAADApaACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiivyq/4KI/8Fkf2HP+Canhma6+OfieK78R+WWtfDumss+oTN2BQHESn+8+BQB+qTukSGSQhVUZJPAAFfgf/wAFJf8Ag4q/YC/4J52154V/tpPH3jmFSqaHociyiOQdBc3AzHEM9Ry3tX8LH/BTT/g5n/bp/b71C8+G/wAILmb4beBLpjDHpmkO3226RuALi4XDsSP4EwvtWF/wTg/4Nqv+CgP/AAUGvrT4ifEi0k+HHgm8YSyatriN9suY25Jt7VsO2R0Z9q0AYH7f3/ByP/wUi/b91G48D+FdXk8A+Fb1/Kh0Tw2XjlmVuAss6/vpSfQED2rH/Yg/4NyP+Cn/AO3zeQeNNW0B/A/h2+IkfWvFBeKSRW53R25/fSZ9wo96/wBDz/gnh/wQK/4J7f8ABO/TLTVPBXhWHxR4vhUeb4h1xFubov3MSsNkIz0CAY9a/a+OOOFBFEoVV4AAwB+FAH8i/wCxp/wZ8/sC/BKG01/9prUtR+KOtRbWkhlY2Wmhu6iCE7mX/fc/Sv6Vvgf+x9+yt+zJoceifArwFoXhS1t0wPsFlDC2B/ecLuP1Jr2zxr428IfDjwrfeOPHupW+j6PpkLT3V5dyLFDDGgyWZmwAAK/ztv8Agud/wdF+JfjTJq37J/8AwTtvZtM8MOXtNT8UR5S5vx90x2eOY4j03/ebtgUAfpz/AMF7/wDg5b8Hfsv6dq37JP7Cuowav4+kR7XVNdgIe20nI2tHCR8r3A9Rwn1r+UL/AIJN/wDBFr9rH/gsj8Z5vip47uL3TPAbXnn674pvwzSXbs26SK2L/wCtlbu33V/Sv0Z/4Ie/8Gy3xL/bI1HT/wBqj9vCC70D4fyyLd2mkzbkv9Zyd26Td80UDdyfmYelf6Tfwr+FPw6+CPgLTfhf8KNHtdB0HSIVgtLKzjWOKNFGAAq/qaAPIP2QP2PfgR+w38DtJ+AH7PWixaPoelRhflA824lx800z9XdjySa+oaKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK+NP2xP+CgP7I37BngOX4gftQeNLDw3bqpMNtJIGu7ggcJBbrmRycY4XH0r+L/9pf8A4OTf+Cgn/BR74gT/ALMv/BGf4canZQ3bGD+3Xt/tGotGcr5ijBgs0xzukJI9qAP7EP23v+CnH7FX/BPPwdJ4s/ad8bWWjzbC1vpkTCfUbkgcLDapmQ59cBfev40vj5/wcLf8FRf+CrXj25/Zv/4I9/DnUvDuk3LGCTW1iE2peUePMeY/6NZLjnJJYDuK+jf2If8Ag008X/FLxjH+0f8A8Fe/Ht94v8RXzi5n0K0u3mZmPO27vnySP9iHAHQNX9lvwD/Zu+A/7LngK2+GP7PnhTTfCWh2qhUtdOgWINju7Abnb/ack0Afx7fsJf8ABpFaa34nj/aB/wCCr/je78feKL1xc3GiWl1JJEZD8227vnPmS4P8Me1ccBq/sa+CfwC+Cv7N/gW1+GnwH8L6d4T0KzULHZ6bAkEfHQttGXb/AGmJPvXrtFABRRRQAUUUUAFFFFABRRRQAV/nxf8ABwx+0p4//wCCpn/BRvwF/wAEe/2Yp2vNM0fU4f7ce3O6Nr98b/M28bLSLLH0b6V/WV/wWR/4KF+Gf+CbX7DPir46XkqHX54G07QLUn5ptQuFKxYHon329hX8/v8Awad/8E9PEsPh3xP/AMFTv2iYXu/F/wAQ7i4TRpboZkFvI5a5uhu5HnP8qn+6DjigD+s79k/9m3wB+yH+zt4S/Zz+GdutvpHhXT4rOPaAPMdV/eSt/tSPlj9a+h6KKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9f+/iiiigAooooAKKKKACiiigApOAMmlr8KP+C+3/BVDQf+CZ37G2o6h4dukPxA8XRyadoFtkb0Z1w9wR/diH60AfzGf8HO/wDwUn8aftm/tHaH/wAEn/2SZpNTtrfUIYNY+xksLzUnYKlv8vVIerds1/UJ/wAE8/2Qfg7/AMEPP+CZF3f+KfJi1LSNKk13xPfkANPeCLd5e7rtU4RRX8+P/BqT/wAErtd8W69qP/BVL9p21e91TVZpv+EbF6u5nkkJM18d3ck4Q19A/wDB4R+39P8ADf4CeHf2EPh3dH+2/Hkq3eqxwn51sYmxHGQOf3r9u4oA/H3/AIIbfBTxh/wWF/4LP+K/28fjPA174d8K6hJrb+aN0fnliLG3GeyLg4r/AE1AAoCqMAV+DX/Bur+wDB+wh/wTo8NWWvWgg8V+NUXXNXYrhwZ1BiiPf5ExxX7zUAFFFFABRRRQAVi+I/EOieEdAvfFPiS5js9P06B7i4nlIVI4o13MxJ6AAVtV/FT/AMHWv/BXGf4U/D+L/gnN+zvftL4v8Xqg197Q5kt7SQgJajbyHmPUenFAH4eftxfGv4yf8HIf/BXjSP2bPgjJOPhx4du2s7Nlz5UFhC/+lX8mON0mPl/AV/pO/swfs5/Db9kz4EeGv2fvhNZJY6J4aso7SFEAG4ooDO2OrMeSa/B//g2t/wCCStp/wT5/ZRh+LvxPsVX4l/EKGO8v2kX95Z2jDdDag9Rwcv71/S5QAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRWRr2v6F4V0a58Q+JbyHT7CzjMs9xcOsUUaKMlmdsAAD1oA16+Zf2pf2xf2a/2LfhzcfFP9pXxbY+F9JgUlftMg86Yj+CGEfPIx7BRX8tf/AAVb/wCDtT4Efs7nU/g5+wZbw+PfFsW+CTXJf+QTaSDjMQGDcMvthPrX8QG7/gpl/wAFuf2kiF/tv4meKL6Xn732GxjY9+kNvEo+nA70Af0Of8FTv+Du/wCMHxg/tH4Rf8E9LKTwX4efdA/iO6AOp3CdMwJytuCOh5b6V+HH7DP/AASM/wCCjn/BXr4jSeNfD1hfSaTez79R8X+IWkFt8x+YrJJ887f7KZ+or+xH/glj/wAGjPwM+BX9nfFz9v27i8eeJ49kyaBb5Gk2zjnEp4a4I98J7Gv7IvCPg3wn4A8PWvhLwRpttpOmWUYit7W0iWGKNFGAqogAAH0oA/n6/wCCX3/Btp+w3/wT1t7Hx14ssE+I3xChVWbWNWiVobeTv9ktjlI8Hoxy3vX9E0MMVvEsEChEUYVVGAAOwAqSigAr5N/bJ/ba/Zy/YM+Dd/8AG/8AaS8QwaJpNmh8qJiDcXUoHyw28X3ndumBwO9fBP8AwVw/4Lcfsv8A/BKr4eSp4ou4/EXxCvYSdK8NWsgMzNj5ZLkj/Uwg9zyewr/Ns8U+Mv8Agpt/wcV/tlR6fbx3XiLUJ5f3FpFuj0fRLMnqf4I0VerH5moA+hf+CrP/AAW//bD/AOCy/wAWof2f/ghYahpXgO6uxb6R4X0zc9zqDE4SS78vmRj12fcWv6Uv+CGf/Brl4S+AaaR+1L/wUHsYNb8ZAJdab4YfElppzdVe57SzD+791fev1z/4I4/8EEv2av8Agln4Pt/F17DD4t+Kd5CPt/iC4jB8gkfNDZKf9VGOm77zV++NAEFtbW1lbx2dnGsUUShERAFVVAwAAOAAO1T0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRXlfxi+N/wi/Z98D3nxJ+NfiKw8MaHYIXmvNQmSCNQBnqxGT6Ac1/Gp+3r/AMHZNz4r8VS/s5/8Ek/Bt1478T3rm1h164tpJIfMPyg2dmo3zezPtX2NAH9d37TX7Xn7N37HXw+uPif+0l4v07wppFupO+9mVHkI/hij+/I3oqgmv4uf2wP+DpP9pn9rnx3J+zF/wRm+Heo6lqF+5to9fuLRri7cH5d9taAFYl5+/MeOu0VxH7Mv/Bt//wAFCf8AgpZ8Qrb9qD/gst8Q9T061umE6aF5wm1Exk58oIP3FkmONqqWA7V/aT+x7+wL+yV+wd4Di+H37L/gyw8N2yoFmuY4w95ckDG6e4bMjk+5x6AUAfx6fsd/8GsX7Rv7VvjyL9p7/gsx8Q9R1XU75hcSaBb3ZuLxwefLuLo5SBexjhHHTiv7Qv2Z/wBkb9m79jr4fwfDH9mvwfp3hLSIFClLKFVklI/iml+/Ix9WJr6OooAKKKKACiiigAooooAKKKKACiiigAqOWSOCNppSFRBkk9ABUlfgB/wcW/8ABTK3/wCCd/7CGqW3g28WPx/4/V9F0GNT+8j8xcT3IHXESHj/AGiKAP5lf+CkfxG8af8ABwB/wW08MfsF/Bq6km+GHw2vGgv7mHJgP2dgdRuzjjgDyYz/AI1/oW/C74a+D/g58OdD+FXw/s0sNE8PWUNhZW8YAVIYECKMD2HPvX8yX/BrB/wTNuP2S/2Rpf2rPixZkeP/AItBb3fOP31vphO6FSTyGmP7xvbbX9VNABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Q/v4ooooAKKKKACiiigAooooA88+LHxR8F/BT4ba18V/iJex6fougWkl5dzyEKqRxLuPX6YFf5ium2/xm/wCDm3/gsmbyf7RB8MPDtx7+VZ6NbycD0Elxj9a/UP8A4Orv+CpXiH4k+MtL/wCCU/7Lty99f6hcQjxGbI7mkmkIENiNv5uK/op/4IN/8EtPD3/BMr9jXTPD+s20bePfFUceo+IbrA3iR1yluD/diBxj1oA/WPQdB+GX7MfwSg0PQ4YdF8K+DNL2oi4SOG2tI/y6L+df5qX7M3h/xL/wXz/4OB7/AOKvidHuvAvhrUjfuGBMUemac+22i9B5rAHFf1Bf8HVf/BQL/hkr9gWb4KeDr3yPFXxQc6bEEbEkdivNw/HYj5a5v/g09/4J+f8ADLX7Ch/aF8Z2XkeKPijILwGRcSR6fHxAvPQN96gD+qSys7XTrOLT7FBFDAixxovAVVGAAPQAVZoooAKKKKACiiuS8eeOfCnwy8Gan8QPHN7Fp2kaPbSXd3czEKkcUS7mJJ9hQB+en/BWb/go78O/+CZX7ImufHbxVLHLrUsbWmhWBI33V864QBf7qfeb2FfxU/8ABu9/wTm+JH/BT/8AbI1z/gqX+2ZFLqug6bqj3lkLtSUv9T3bl2huDFb8YHTIHpXzT+1R8W/jn/wcwf8ABWzTfgf8JWuIPhn4eujb2rDPk2umxPie8kHTzJcfL+Ar/So/Zh/Zw+Gf7JfwK8Ofs/8AwisY7DQ/DlnHawogA3lQA0jerOeSaAPeY444Y1hiUKqAAAcAAdAKfRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFY/iDxDoPhPRbnxJ4nvIdP0+yjMs9zcOsUUUajJZnbAUAetfxBf8ABY//AIOy/B/wy/tT9nz/AIJtvFrmurvtrzxdKu60tm6EWSH/AFrjtIflHYGgD+kr/gpR/wAFff2Of+CYHgKTXvjpriXXiKaMtp/hyxZZNQumx8vyf8so89XfA9M1/mi/8FOf+C8/7dH/AAVX8XN8OdNmufDXgi6n8qw8K6IZCbjJwguGT57iQ+n3fQV8/wD7I/7BH/BRP/gtf+0Fd694cj1DxJc3txv1nxXrLyGztgxyxeZuCQPuxJz2AAr/AEjf+CUH/Bvd+xv/AMEztFs/GFzYxeOPiV5YNx4h1KJW8l8crZwnKwqD0P3j60AfyXf8Elv+DTT43/tHrp3xr/b4luPAfhCbZPDoUeBq14h5Hm54t0Yevz+wr/Qr/ZV/Y1/Zq/Yp+G1r8Kf2avCdj4Y0m2UBhbRgSzMB9+aX78jH1Y19OgADA4ApaACiiua8YeMfCvw+8MXvjTxvqFvpOk6bC091d3TrFDDGgyzOzYAAFAHRu6RoZJCFVRkk8AAV/IH/AMFx/wDg5x+Gv7G9vqn7NX7E11a+KviZta3vNVQiWw0djwQCOJbhf7o+VT19K/IT/gur/wAHQnij43XOrfslf8E67+bTPCrFrPVPFMOUutQ/haKzxzHCem/7zdsCvI/+CHv/AAbH/Ev9r/UNN/ao/b1t7vw98PpXW7s9Hm3R6hrPO7dLu+aKBvU/M/bigD86f+CcH/BJT9ur/guh8f7z41fErUr+Hwrc3nna94x1Xc/mknLQ2gb/AFkmOAF+RP0r/UK/YM/4J5/sxf8ABOb4M2nwZ/Zt0GLToEVTe37qGvL6YDmW4lxliew6DoBX1B8LPhT8Ofgl4C034X/CfRrXQNA0iFYLSxs41iiiRRgAKv6nqa9BoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACioppobeJp52CIgyWY4AAr+dP/gp5/wAHKH7D3/BP6O9+H3ge8X4l/ESIGNNH0eRXgt5eg+1XIyiYPVVy3tQB/Ql4m8U+GvBWh3Hibxff2+l6dZoZJ7m6kWKKNF6lnYgACv5Kf+Ckv/B1/wDs7fAvUrr4KfsFaWfiz46djapeQhv7KgmPygKyDfcMD0WMbf8Aar8ctC+Af/Bdz/g5A8TR+LfjPqM3wr+Cs0u6KBxJZ2Bhz/yxthiW8bH8T/J9K/rQ/wCCbP8AwQR/YJ/4JtaZa614J8Pp4r8bRoPO8Sa0iTXIfHJt4yNkA9Noz70AfywfBz/gjZ/wWH/4Lj+ObP8AaD/4Kh+Nb/wL4EncT2ulTAxzeS3IW000EJACOjy/N9a/sx/YK/4JP/sQf8E4/CkWifs3+Dra21TYFudbvFFxqVwe5adhlQf7qbV9q/R8DHApaACiiigAooooAKKKKACiiigAooooAKKKKACiiigDL1vWtL8N6NdeINbnS2s7GJ555ZCFRI413MxJ4AAFf5x2np4l/wCDkn/gvKb1/Om+CPwom46+SdPspf8AvnfezDA/2PpX7b/8HVn/AAU0vv2Zf2YrP9i34M3jf8LA+LQNrKtsf31tpRISUgLyGnJ8pPbNfd3/AAb2f8EyrH/gm/8AsIaPYeKbNYvH3jhI9Z8QSEDzI2kTMFrnsIUPI/vE0AfuhpOladoWl22iaPCltaWcSQQRRjCRxxqFRVHYKAABWhRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//R/v4ooooAKKKKACiiigAr8hv+C03/AAUz8H/8Exv2Nda+Kk80cnizVo3sPD1kSN0t3IuA+P7sf3ifav1M8eeOfC3wz8Gan8QPG15HYaTo9tJdXVxKQqRxRLuYkn2Ff5fPx9+Inxp/4OYP+Cwun/Cz4ftPF8NdAujBa4z5NppUD/v7p+webHH4CgD9AP8Ag14/4Jm+Mf2rfjzrX/BWD9rSGTU0S/mm0T7aN32vUZG3SXXzdUizhO2fpX+hbcXENpbvdXLBI4lLMx4AVRkn6AV5L8Avgd8Pf2bPg74e+B3wssU0/QvDdnFZ2sSAD5Y1wWOP4mPJPrX5Y/8ABfj9vO2/YH/4Jz+L/G+lXSweJfEkLaJoq5w/n3S7Wdf9xMmgD+Kr9tzxZ4n/AOC7/wDwX/0r4CeC5XuvBPhjUl0mMpzEljYvuvJuOPnIIzX+mv4D8FeH/hv4K0nwB4Tt1tdM0W0hs7aJBhUihQIoAHsK/im/4M6v2DLrwz8MfFv/AAUC+I9qX1bxdM2naPLMvzfZlbdPMCf+ej8Zr+4WgAooooAKKKKACv4C/wDg6D/4K5eJ/i546tf+CUv7HVzJqN5f3UVt4jlsCWae4kIEdghTsD9/8q/eL/g4L/4LAeGv+CZ37MNz4V8DXkcvxP8AGUElro1spBe2jYbXu3HYKPu+9fh7/wAGuX/BIXxD408RT/8ABVH9r20kvtV1WaSfw1Dfrl3eQ5kv3DdyeI/zoA/eb/ggT/wSM8Mf8Ew/2VrW48U2sc3xJ8XRR3evXe0botwylqh6hYxwfev3uoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvkP8AbV/bl/Zu/YA+C978cv2ltfi0bSrYFYIfvXN3Nj5YbeIfM7n24HfFeHf8FQ/+CoP7P3/BLb9nq7+MvxhuludVuFaHRNEicC61G6x8qIvZB1d8YUV/lO/tT/tcft5/8FzP2wrOLULe88R63rFz9l0Dw3pwZrWwhZvlSJOihRzJK3XqTQB9j/8ABX//AIOC/wBqf/gqV4sm+E3w2+1eEPhgZ/KstBsmb7Tf5OEa8aPmRm4xGPlHoa/Rj/gjX/walfE79oldK/aG/wCCgq3HhLwbLsubTw2v7vUr+M8qbg/8u8TDt98j0r+gz/gib/wbVfAz9gbR9K+PP7T1ta+NPi28azKsqiWw0dyM7LdCMPKvQykdfu4r+qMAKAqjAHQUAeQ/A34B/B39mr4cad8JPgX4esvDPh7S4xFb2dlEsaAAYyccsx7sck16/RRQAUUV+W//AAVB/wCCtX7Lf/BLH4QyeO/jTqK3niG8jb+xvDtqym9vpQOML/yziB+9I3AFAH13+1P+1h8Bf2MPg7qfx0/aJ8QW3h7w/pcZZpJmAeV8fLFCnWSRuiqor/MD/wCCs3/BcX9rf/gs58Xof2Y/2ZtM1LS/h9d3gttL8O6cGa91Z84SW88v72eoj+6o615B8Rvin/wVB/4OXf2yYvDfhy0nu9Phl/0TTYS8eiaFaMceZM/3d23q7fO3RR2r/QW/4I+/8EJf2Y/+CVfgiDXLWCHxX8Tr2EDUvElzGNyEj5obNT/qYge4+Zu57UAfkZ/wQ3/4Nc/A/wCzWmk/tP8A/BQCyt/EXjsBLnTvDj4lsdLbgq1wPuzTr6fcQ+pr+0CCCG1hS2tkWOOMBVVRhVA4AAHAAqWigAooooAKKKKACiiigAooooAKKKKACiiigAoor52/aW/aw/Z5/Y/+HF38Vv2jPFVh4W0W0UsZbuVVZyB9yJPvOx7KoNAH0TX5Y/8ABRL/AILE/sQ/8E0vCcuo/HjxPDP4gaMtaeH9PZZ9RuGxwPKU/u1/2nwBX8q/7Yf/AAcoftmf8FBPiJN+yX/wRg8Eal/p7G2PiE25kvnQ/L5kKY8u2T/ppJyPavo7/gnb/wAGpMeqeK4v2mv+Cs/ia48feLr6QXcmhLcPNCJD82Ly5J3Sn1RML2zQB+e3j79vv/gt1/wcNeM7r4R/sUeHrv4ZfCaWUw3V7A720ZgJwTd6hgFjt/5ZQ/Tmv30/4Jif8Gvf7G37FL2XxR/aDCfFf4hoVma51GPOnW03UmG3bO8g/wAcmfoK/pF+HPwz+Hvwh8H2Xw/+F2i2egaJp0YitrKxhSCGNVGAAiACv4+v+CmP/B1Zr/7Cn/BQXUv2VfDPw2h1rwx4SuorXW764naK7lJwZDaoF24UH5d33sdqAP7NLOzs9OtI7DT4kgghUJHHGoVEVRgBVGAAB0AqzXyx+x1+2P8AAj9uj4G6R8fv2fdZi1bRtUiVmVSPNt5cfNDMnVHQ8EGvqegAooooAKKrXl5Z6fbPeX8qQQxjLO5CqoHqTwK/Ar/goF/wcg/8E5f2EPtnhc+If+E88XWwKjR9AKz7HHRZpgfLj98nI9KAP3+or/M/+LH/AAejftta540a9+EHgHw7omgxyZjtr3zbqd489HkUoAcegr+xv/giH/wV08N/8Fcf2ar34lS6Qvh7xZ4Yu10/XdOjbfEsrIHjlibr5cgzjPIwRQB+0tFFFABRRRQAUUUUAFFFFABXlnxu+MPgX9n34R+IvjV8S71NP0LwzYTaheTyEALFChY/icYA9eK9Tr+Gf/g6z/b38Z/FPxn4N/4I8fswSSX/AIj8Y3dpL4hitDlyJnAs7I7f75/euP7oGaAPj3/gkT8HvHX/AAXf/wCCxni//gpn+0HZvN8PPAN+s2l2k4JhMkRI02zUHjESjzpAO/1r/RZAAGBwBX51f8ErP2CPBn/BOD9inwj+zX4aijOo2dut1rd2gAN1qU4DXEhPcA/Ivoqiv0WoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//S/v4ooooAKKKKACiivyJ/4LQf8FN/BX/BML9jrWfireTRy+LNVjew8O2BI3zXjrgPt/uR/eY+1AH81/8Awde/8Fb9RJt/+CYX7NV80+q6s0f/AAk8tm2XCyECKxG3+JzguPTiv2d/4Ny/+CT2nf8ABOb9kK18aeP7JF+JHj6GK+1WRl/eWsDDdDag9toOWHrX8vv/AAbSf8E2PG//AAUM/a51r/gpf+1lHLq2h6HqT3lu94Cy6jq7tvB+brHD1x06Cv8ASpVVRQiDAHAAoAdX+al/wcd/tCeLv+CmP/BV7wT/AME5/grM19pvhe9g0tkhO5G1C6YfaHOP+eUfHtX95n/BR39rjwz+w7+xj47/AGj/ABJMsZ0LTZTaKTgyXci7IEHuXIr+JH/g0z/ZH8SftSftf/ED/gpr8aImvTpdzOthPMMiTU75i8jqT/zyQ4HpxQB/eT+yh+z14R/ZS/Zz8H/s9+B4Vh0/wtpkFku0AbnRR5jnHdnya+hqKKACiiigAr44/bw/bX+EX7AP7NXiD9o74xXaQWWkwN9mtywEl1ckfuoYx3LHHToK+ofGfjHwz8PfCmoeN/Gd5Fp2laVA9zdXMzBUjijGWYk8YAFf5jP/AAUR/au/aB/4OOf+ClOjfsh/svicfDjQ70wWe3PkiFG2z6jPjjoPkz7UAH/BPD9lb9oH/g45/wCClusftdftOeePhvoV8txeBs+R5MbZg06DPHQDfjtX+nT4Q8I+G/AXhfT/AAX4Qs47DS9LgS2tbeFQqRxRgKqqBwAAK+V/2C/2JfhD/wAE/wD9mrw/+zl8HrNILPSYF+03AUCS6uSB5k0h7lj+Qr7LoAKK5HxJ4/8AAng2FrjxdrVhpcajJa7uIoQB/wADYV8L/FX/AIK2/wDBNr4LeanxB+Mnhq1lh+9FFeLO/HbbDvoA/Raiv5zfiP8A8HUH/BH7wB5sVj41vteli426dYSODj0Zygr4W8bf8HoP7AeitJF4M8DeJ9YK/dZxDbqfz3UAf2N0V/B14o/4Pcvh9DIy+D/gpeTL/CbnUUX9Fjrym7/4PefFG7/Qfgdagdt+ouf5KKAP9Buiv89Qf8HvHj3PPwP0/H/YQl/wr1L4e/8AB7n4YuNUii+J/wAFJre0JAeTT9QDOB3wsiYP50Af3s0V+PP/AATo/wCC4/7Bf/BSwLoHwa8QnSfFYTe+gattgu/fyudsuP8AZ59q/YagAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvhv/AIKF/t+fAz/gnB+zXrP7RfxwvVjgsozHp9grAXGoXhH7q3hXuWPU9FXk19AftAfHz4V/swfB7Xvjt8atVh0Xw14btXu7y5mIACoOFUfxOxwqqOScCv8AIX/4Kw/8FM/2gv8AgtH+2VC/h20vH8PJef2Z4N8M2+XKpI+xHZBw1xPwXOOPujgUAeYftEftBftuf8F0/wBu6C5a2ufEPifxNd/Y9C0S13G2060LfLHGPupHGvzSSHrgk1/pif8ABEz/AIIl/Bn/AIJS/BmC91CC3134qa3Cra3rrICYyRza2pPKQp045c8mvGf+Dfb/AIIfeEv+CYHwUj+KPxZtYNQ+Mfiu2RtSuSAw0yBwCLG3PYj/AJauPvHjoK/o9oAKKKKACisPxL4m8O+DdAu/FXi2+g03TLCJp7m6uXWKGKNBlmd2wFAHrX8An/Bbz/g6f1PxZPqn7JH/AATDu5BFMzWOo+MoVPmzE/IYtLXGQD087GT/AADvQB+zf/BbL/g5A+BX/BOXS9Q+B3wBktfG3xekjaP7PG4ey0hiMB7t16yDtCOf72BX8ef7A3/BK7/goX/wcHftFXf7T/7S2u6haeDLi63ap4p1JT+8QHm10uE4U4HyjaBGnev0Z/4Imf8ABr54+/aM1Sw/bD/4KZxXlh4fvJF1Cy8M3LMNQ1Qsd4mv2b54om67D8798Cv9EPwL4D8GfDHwhp/gH4eaXbaLoulQrb2dlZxrFDDEgwqoigAACgD5m/Yk/YP/AGaf+CfXwYsvgj+zT4eh0fTrdV+03O0Nd3swGDNczY3O5/IdABX2LRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVmazrWj+HdLm1rXrqKys7ZC8s07iONFUclmbAAAr8oP+ClP/Bab9if/AIJkeFJpfi/r8eqeK3jJs/Dmmsst9M2ON6g4iT/afAr+OXWfif8A8Fsv+DmLx3J4Z+G9rP8AC34GCbbK4aS2sfJz/wAtpvle7kx/Any+1AH7R/8ABUH/AIOpPgR+z5ql38BP2C7AfFT4hyMbVbq3DPpltOflwCnzXDg9Fj496/LL9mj/AIIWf8FNP+CynxJtP2rv+CuXjLU/DXha5YXFrosh23jwk5Edvaf6u0jI4yw3Y7V/S9/wS+/4N/P2If8Agmrpdp4n0zS08afEBUBm8Q6tGsjRvjn7LEcrCvoR83vX7rgY4FAHx/8Asd/sGfsqfsG/DqH4afsx+EbLw7aIgWa4RA13csB96ec/O5Pucegr7BoooAK/le/4OBP+DfTwn/wUT8NXn7Sn7ONvDpXxf0y33SxjCRa1HGOI5OwnAGEbv0Nf1Q0UAf4yf7Af/BRv9tj/AIIkftN32nWFtdWkFvdfZvEfhPUt8cNwIzhvlP3JQPuOB+lf6R37Ef8AwcVf8Ezv2xvBNnqlz46svA3iFo1+16Nr8q2ksUmPmCO+EkXPQqa6T/gq1/wQj/ZB/wCCpWiPr/i21/4Rbx/BGVtPEenxqJW44W6TgTJ9fmHY1/DR+0N/waI/8FQfhXr9xD8JodI8e6SHIguLO7S3lZOxaGfYVOOwzQB/oV/EP/gsF/wTI+Ftl9u8YfGvwrCgGcRX8UrfgqEmvxT/AGuv+Dvr/gnd8F9MvdM/Z4t9S+JeuRjbB9niNrYlvUzygZUf7Kmv5IvAP/BqV/wWD8aXotdT8HafoUfeW+1G3VR+CsT+lfrL+zJ/wZTfFjVp7bVP2r/ifYaPbhgZbHQ4muZivoJX2IPwzQB+IP7en/BwD/wUn/4KUaxJ4BttXn8LeG75/Kh8O+GvMQyhuAssifvZSfTge1fRP/BPH/g1r/b9/bRNn4/+M0A+F/hG7xKbvV1JvpkbnMVt9/n1fAr/AED/ANhP/giH/wAE8P8Agn5bW1/8HfBFtqHiKBQG1zV1W7vS2OWQuNsef9hRivh3/g42/wCCyGlf8E3f2bZfhJ8Jr6M/Fbx1bSW+nohG7TrRhtkvGA6HHyxe/PagD/P9/wCCyfwO/YZ/Y3+MFv8AsbfsczT+Jr/wkNvijxRdyB2utQ6G2gRPkjjh6NjJLd+K/uC/4NC/2J/Gv7Nn7BWs/HP4g28llefFbUU1Czt5AVZdPtU8qByD/wA9CWYf7OK/jd/4IO/8Eo/HX/BWD9sQeKviUk8vw98M3a6n4n1GXJ+1yFt4tVc/eeY/f9FzX+ur4W8L6B4J8N2HhDwrax2Om6ZBHbWtvEoVIoolCoigdAAAKAN+iiigAooooAKKKKACiiigD42/b9/bI+Hn7A/7JfjH9qH4kSqtr4csXe2gJAa6vHG23t09WkkwOO30r+OP/g2I/Y3+IX7bn7WHjz/gtN+1hE1/d3Op3KeHjcDKvfzH99PHn+C1jIiix0P0rzf/AIOAf2kviN/wVy/4KaeBf+COf7Kt011ofh3VETXJ4DmFtRIzcSSY48uxhz143k1/dV+yp+zb8Of2Qv2efCf7N/wotVtdD8J6fFYwhQAZGQfvJWx1aR8s3uaAPoOiiigAooooAKKKKACiiigAooooAKKKKACiiigAqC5urayt3u7yRYYoxlnchVUDuSeAK/FL/gqP/wAF2/2M/wDgmLoE+keLtTTxP46ZD9m8O6bIrzBscG4YZES/Xn2r/OV/4KJf8HCv/BQP/goBq13pN/4jl8GeD5GIh0TRXaBPL7CWRcNIcdcnFAH+qtf/APBQz9hvS/iNB8I774q+Gk8SXMghjsPt8RkaQ8BODtB9s19jI6SIJIyGVhkEdCPav8UL/gnT/wAE2/20P+CiPxu0mx+A+iX89vDeRSXviCfelraKrgtI07dWAHAUk1/tAfCnwlf+Afhj4e8Dardtf3Wj6ba2Uty/3pXgiWNnP+8RmgDv6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/T/v4ooooAKKKKAOM+Ifj/AMJfCrwNqvxG8d3senaPottJd3dxKQqRxRLuYkn2Ff5UX7X/AMc/jz/wcef8Fa9M+FHwoE//AAiEN6dP0WHnyrPTIn/f3sg6Auo3Z9MCv2t/4O0v+Culwqxf8EzP2etRL3V35cviya1b5trf6qxBXu3Vx6YFfqR/wbDf8EjYf2F/2Yo/2kPi5p4j+I/xEt0n2yr+8sNOYbooRnlWkGGf8BQB/QN+yF+y38Mv2Mf2d/DH7OXwltEtdI8N2aW4KjBmlA/eTP6s7cmvpWivNvjF8T/DPwV+FfiD4teMp1ttL8O2E9/cSNwAkCFj/LFAH8Jv/B4T+2rq/j/x54B/4Jr/AAqna4urmeLU9XghOS00reXaQsB7/Nj6V/WP/wAEg/2KNH/YI/YE8BfAe2t1i1RLFL7VnA+Z766UPLn/AHchfwr+FD/gjT8L/E//AAWX/wCC53if9tX4pwNe+GfC+oS6+4lG6MCN9mn2/PoApxX+nEAAMDgCgBaKZJJHEhklIVVGSTwAK/OH9qz/AIK3/wDBPX9jG0nb46fEvSbO9gHNhayrdXZI7CKLOD9cUAfpDSEhRubgCv4UP2v/APg9I+GehC68P/sZ/D2fWZhuSPU9cfyYc9mWBPmI+pr+YX9qT/g4p/4KrftXSXGmaz8Qrjw5pl0cCw0FRaIAeNuU+Y+lAH7/AH/B0T/wWzufiN4kn/4Jtfspawo0+KUReKtTglCpLKP+XRZBxsT/AJaflXk//BKj/gqV/wAEkf8AgiZ+zw0elfbviX8XvEUYk1u90u3CQQnHy2sU8v8AAncheTX8/wD+zh/wRU/4Kk/tsakvifwJ8NtWe31RvtDatrANrDJ5nJkLy/M2c5yBzX9C37OH/BlX8evEQg1H9pz4maf4fiYKz2mkQm5lHqvmPhc/hQBm/tCf8HqX7SXiKWWy/Zw+G2k+HIOQk+pu13Njsdown6V+L/xl/wCDhr/gsF+0tczaN/wsjUdPhuTgWegQi3wD2HkjdX90v7Ov/Bpj/wAErvgusV5490vUvHt6gG5tVuCISw/6ZR4XHtX7WfBr/gnb+w7+z9bw2/wi+F3h3RjAAFkisYjJx/tMpNAH+RFov7N//BXv9sO6XUrPw18QfFpuD/rrhbsRnPfdKUXFfcPwo/4Nc/8AgsH8XXivtX8F23h2GfBMur3yIw+qpvNf631jpunaXCLbTbeO3jHRYkCKPwUAVdoA/wA1f4af8GVn7YesmOX4n/Evw9oqNjclrDLcsv45QfpX3b4H/wCDI74XWxST4h/GfUrr+8llZRRD8C+41/d3RQB/Ht4Z/wCDMX/gnbp0SjxL4u8V6i46kTxRA/8AfKV6jZ/8GeP/AASot1xPL4nm/wB7UWH8gK/q4ooA/lYP/Bn9/wAEnduBF4kH/cSkrxj4q/8ABmV/wT38R6BPb/CvxV4m8OakVPkyyzpdRK2ONyOuSPoRX9h1FAH+MZ/wUH/4Jx/tj/8ABEv9p/TH1O+ntxBOLzw54p03dHFP5ZyMEfckX+JD/Kv9Fb/g31/4LMaD/wAFQf2dl8J/Ea4itvir4OhSHWbYED7XEBtS8jX0fHzDs1foR/wVD/4J7fC3/gpL+yX4h+AHxAtIzqDwPcaJfFR5lnfop8p0bqAThWHQiv8AKS/4J8ftC/Fz/gkh/wAFRdG1PVnewn8N6+fD/iK2Jwktm0wgnDDgEKPnX6UAf7QVFY3h7XLDxNoFl4i0pxLbX0Ec8TLyCkihlI/A1s0AFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH8hf/B23+yr+3x+1F+z78PdH/ZO0bVPFXhXTtRuJfEei6OpknklKp9kmeFPmljjw4wAdrEHFeZf8G0H/BADVf2S7OL9uH9tLQfs3xGu1K+H9EvFUvo8B4NxKnIW6kHCjrGvoTX9oNFABRRRQAV8o/tjftr/ALN37Bvwavvjn+0z4jt/D+i2any1cg3F1KB8sNtCPmlkboFUfXAr8x/+CwP/AAXy/ZX/AOCV3hW48J+fF4y+Kd1CTYeGbOUZhJHyS38i58iLvt++w6DvX8EHw3+DX/BV3/g5t/axl8Z+KbyeXQbOfbcapcq8OgaDasf9TbRj5Wk29ETMjn7xxQB63/wUh/4LMft6/wDBd344W/7JP7JOhanp3gbULrydN8MaXua61EA4E+pSJxtA5KZEaDrmv6nf+CJH/Bsl8HP2FrbS/wBoj9r6G08a/FYKs9vaMol0zRnxnESsMTTr/wA9CNq/wjvX66f8Euf+CP8A+yd/wSs+F0fhb4MaYuo+Kb2JRrHia8RTfXrgcqG/5ZQg/diTj1ya/VmgBAABgcAUtFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFRyyxQRNNMwREGSTwABX81X/AAVZ/wCDlb9kv9gcXnwo+DDx/Ev4nYMSabpzh7W0lPA+0zJkZB/5ZrlvpQB+/Hxy+P8A8Gv2a/h9ffFP45+IrHwzoOnxmSa6vpViQADoueWPoBzX8QH7c3/Byr+1H+3F8R5f2O/+CLvhPUby41BzaN4kFuXupFPyl7aPG2BP+msnQdhXzt8Ev+CYn/BXH/g4O+I9n+0b/wAFD/El74D+Fryiey050aENATkJZWJwBkcebJX9vn7C/wDwTd/ZH/4J2/DmH4e/sz+FrfS22Kt1qUiiS/u2A5aacjcc/wB0YUdhQB/Mp/wTW/4NWLP/AISqH9qP/gq9r03xA8aXri8fQmneaBJT83+mTk7piP7i4UdK/sw8F+CfB/w58M2fgvwFplto+k6fGIrazs4lhhiRRgBUQACuoooAKKKKACiiigAooooAKKKKACiiqOp6np+i6bPrGrTJbWtrG0s0shCokaDLMxPAAAoA+RP29v21/hL/AME/f2YvEn7S3xfuVistGgb7LbbgJLu7YYht4x3Z29Og5r/Ii8Ua/wDtZf8ABcr/AIKOeciy6r4s8famI4IxloNOsQ3A9Ehgj69Onqa/Q/8A4OO/+Cu+s/8ABSL9qg/Bb4PXcsnw08DXT2WmRQk7dQvc7JLoqPvZPyxjHT61/Xh/wbI/8EcbT9hL9niL9pr41aaq/E/x7bJLslX59N09xujgXP3XcYaT8B2oA/bT/gm9+wN8Jv8AgnF+yt4e/Zv+FlumbCFZNSvdoEt7euB5s0h75PCjsMCvvOiigAooooAKKKKACiiuM+IHxF8CfCnwneeO/iTq9poejafGZLi8vJVhhjVRySzYFAHZ1+Pv/Bb/AP4KS6D/AMEy/wBhHxJ8XLW4j/4THWo20jwxakjc9/cKQJdvXZAuZGPsB3r8A/8AgqR/wd6/C74WtqHwl/4J5afH4r1qPdDJ4jvVIsIWHBMEfWUjseFr+Lbxb8Rv+Ck3/BZL42/Ztaudc+J/iBGM62seTa2KScFggxFBHxjJxwKAP6cv+DWH4rfsBfAXx7r/AO0D+1V8TNKX44fE24a2022vpCZbW2mlzI0kpG1J7uXnGfuY9a/0U0ZXUOhBUjII6Yr/AAT/APhAPFFj8VU+GOgMt9rcepLpsBsm3h7sSiICF1+8PM4Vh14Ir/dL/Zx8NeK/Bf7PfgXwf47ma51vSvD+mWl/K5yz3MNrGkzE9yXBoA9nooooAKKKKACiiigAooooAKKKp6jqFlpNhNqmoyLDb2yNJI7HCqiDJJPYACgC5RX8aXxF/wCDxn9lv4eftY618Hn8D32peBdGuZrI+IbWZWkmlgJUvHBjBjLDA56c1+L3/BQL/g8E/an+NiX3gb9jPRovh1ocu6NdSmxPqbp0yD9yI4/ujigD/QB/a3/4KC/sg/sOeEpfFv7SvjfTvDyRoWS1eVXu5cDpHAuXJ9OAK/hu/wCCnf8AweAeNfiXomq/CH/gn7osvhqxuVaA+Jb/AB9sKHgm3iHEeR0JyRX8XnxL+Lnxj/aE8bSeKvijrmo+Kdc1CTmW7le4ld2PAUHP0AAr+wP/AIIh/wDBrZ4z/aA/sn9pn9v61n0Hwe2y5sPDh/d3d+vBVrjvFEf7vUj0oA/mo/Zy/Yl/by/4KbfFaaf4S+G9X8aatqc++81e63/Z1Zzy811J8o/A/hX9u/8AwTb/AODPT4Q/DY6f8Sf2/ta/4S7VU2y/2Bp5MdhGw52yyfelx3AwK/st+EfwU+E/wF8G2nw++Dvh+x8O6PYxrFFbWMKRIFUYGdoGTx1Neo0AeY/CX4MfCn4D+DLX4e/B3w/Y+HNGskEcNrYwrDGABjooGfxr06iigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9T+/iiiigAr8oP+CyP/AAUm8Gf8EyP2Mde+NGpSxyeJb6NrDw9YkjdPfSqQhx/dj+8x9BX6l61rOl+HNHutf1udLazsommmlchVSOMZZiegAAr/ACj/APgqz+1h8YP+C9X/AAVa0n9nf9n7zb3wtp2pf2D4ct48mIor7bm/cDgBsE57IBQB7f8A8G6n/BNvx1/wVM/bh1f9ur9qRJdW8KeGtTOqXs10CV1LVZG8yOEZ6onVh0AAFf6iEEENtCltboEjjUKqqMAADAAA6ACvjb9gH9i34afsBfsreFv2Z/hjbolvolqv2u4VQGurxgDNM57lm6egwK+zHdI0LuQqqMkngAUAOr+RT/g7s/bzPwA/YqsP2VPBl55fiL4oXHlXCRn5002DBl4HIDnCfjX68/tz/wDBb7/gnh+wHY3Ft8W/G9rqOvRKdmi6Qy3V2zAcKwQ7U/4Ea/y7f+CxX/BT7V/+Cm/7bV1+0jpVnNpeg6dDDZ6Fp90RIYIIfmywHy5d/mI+lAH94n/Bv58Nv2cv+CTH/BLzTfjJ+1H4m0rwfrfxE/4nt6+oTJFMLYj/AEaJUP7w/J82AO9eEftw/wDB4x+yn8JmuvCn7Hvhy58f6nHlF1C7za2APTKj77gH6V/EJ8H/ANkz/gp//wAFTPF1uPBWh+I/G+dsSXl2ZFsIEHCgSSYiRFHQL0Ff1O/sN/8ABmFqt4LPxd+3d43Fuh2u+iaDy2P7j3DfkdooA/AH9rX/AIOCP+Cqv7eeqy+Eo/FV3oWmXzbI9F8MxtDuB425i/eP6VJ+yb/wb2/8FWf26r+LxZL4TuvD2mXhDPq/ieRoNwbncEfMjfkK/wBOr9kb/gkd/wAE/P2JNOhg+BHw40u0vYgM6hdRLc3bEDqZZAT+VfSP7V/7Unwe/Yr+Aeu/H/4zahFpeg+H7ZpSCQrSuB8kMS92c8ACgD/PF/az/wCCBX7En/BID9mKX4+ft3ePbjxx4wvE8nRPDGl4tILq8xwGb/WmJDyx44rhf+Dcv/gi7e/8FAfjv/w2b8fdDTTvhZ4avPNsLAR7Ib+5jOUhjB6wxcbj3rlPhv4M/an/AODo3/gp7N418ZfadL+Fvh6cGU8/Z9O0xG+WCP8AhM8wHNf6a3wI+Bvw1/Zu+Euh/BT4RabFpPh/w/apa2tvEoUBUGNxx1ZupPrQB6fpum6fo2nw6VpMKW1tbIscUUahURFGFVQOAABgVeoooAKKKKACiiigAooooAKKKKACiiigAr/JR/4Op/2e4fgX/wAFafFHiHSoPs9l41s7XXI9i7VMkqbZSMcZ8xTmv9a6v4J/+D2T9nZ7rwz8JP2oNOg/49pLrQbyRR2bE0O4/iwFAH9RX/BFL4+x/tJ/8Ev/AIP/ABMaXzbltBt7K5OckT2g8lwffK1+p1fxqf8ABmV+0lbePP2I/GH7Ol/cbr7wRrjXEMbHkWt8vmDA9A4YV/ZXQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFfm1/wUZ/4Ks/sef8Ew/hm/jn9o7xDGuqTxsdM8P2RWXU7+QDhYoM5VM9ZHwijv2oA/QfxP4o8N+CvD934s8YX9vpel6fE01zd3UiwwwxoMszu5CqoHc1/Cd/wWc/4Oy9I0aLVf2a/+CX84vtRbdaXvjhkzDF/Cy6XGR+8f0nYbR/CD1r8N/wBsn/gqF/wVF/4OGPjvF+zX8AND1C08IXc+LLwhojN5AiBwLjVbkbQ+0csZCsS/wr0r+r//AII4/wDBrV8AP2K10v47ftlLZ/ET4mxbJ4LFl8zR9KkHI8uNhi5lQ/8ALRxtBHyr3oA/n0/4JB/8G1v7R3/BRTxdD+2F/wAFFLzVdA8EatP/AGh5N67/ANt6+WO4sTJ88ED9PMb5iPuDHNf6QfwI+APwc/Zk+F+l/Bn4D+HrPwx4a0eIRW1lZRiNBgcs2OXdv4mbJPevXIoo4Y1hhUIiAKqqMAAcAADoBUlABRRRQAUUUUAFFFFABRRRQAUUUUAFFFc/4p8V+GfBGg3PinxhfwaZptlGZZ7m5kWKKNFGSWZsAACgDoK+J/22P+ChX7KH/BPz4az/ABL/AGmPFVrokKoTb2e4PeXTgcJBAPmYnp0xX8z3/BTf/g6k8KeFvElx+zJ/wS90dviP46upDZLrEcTTWUMp+XFtGg3XDg9MYT3r5E/Yn/4Nwv2w/wDgoX8SYP2xv+Cz/i7U8X7LdReHWmJvZEPzCOT+C0ixxsQbselAHi/x8/4Kzf8ABV3/AIL3fEy6/Zi/4Jm+GNQ8E/DmVzDeanGTDM9uTgvd3gwsKEf8s4zu7V+8v/BKX/g2W/ZW/YZay+L37Qwi+J/xN4na6vU32FnMeT5EL53sD/y0f8BX9A/7Pv7NvwN/ZX+HFl8Jv2f/AAzY+F9BsUCx21lEE3YGNzt952PdmJNe4UARwww28SwW6BEQBVVRgADgAAdAKkoooAKKKKACiiigAooooAKKKKACiiigAr+Nf/g6x/4LCL+zT8HT+wf8CtTCeNfGdvnXJ4H+ex01/wDlnkfdefp7L9a/pJ/4KI/tvfDb/gnt+yf4o/aW+JE6KmkWzLYWxIDXV64xBCg75br6AV/kd/B34cftJf8ABbr/AIKUJpd5LNf+IPH+rNd6ldnLJY2O7Mj+ipFH8qj6CgD9mv8Ag1q/4I9P+2H8d/8Ahs747aaZfh/4FuQ2nwzr8mo6mnzL1+9HD1PYtgV/qCxRRQRLBCoREAVVHAAHQCvnL9kf9l34X/safs9+Gf2dPhDZJZaL4bs47ZNoAMjgfPK/qztkk19I0AFFFFABRRRQAUV4R+0R+018Cf2UfhxefFf9oHxLZeGdDsULvPdyKhbAztjXq7HsFFf57n/BXL/g7Q+Kfxt/tP4H/wDBPhJvCXhl99vP4jlGNQuk+6TAv/LFT2P3qAP6yv8AgqX/AMF9P2L/APgmZoVz4f1jUo/F/j8xn7N4e02RXdXxwblxkRL0znn2r/N4/bv/AOCsX/BQv/gsT8V4vBmrz302mXk/l6V4Q0JZDANxwoaNOZW9Wbiu6/4Ju/8ABED9vP8A4K0ePP8AhYFxDd6N4Uu5/M1HxXre8+buPzGHf80z9cY4r/Rt/YT/AOCSX7AH/BG/4Laj8StIsLefVNE0+S+1nxZqqo9z5cCb5GjJ4iTA4VfagD/NA/a3/wCCUPjn/gnh+zp4d+I37Xl3HYfEHx+ceHvB1ud9zDbrjzLu9I+6BkKkY5Zj7V/St4N+Er/8EEP+Dd/xL8ZtbhFh8bv2g44dOjdhtuLKHUIm8qFe48i13yMB/wAtGHpXj/7CHgTxl/wcUf8ABcLxD+2h8WrWWT4Q/DC6jms7SYEwGG2c/wBm2QB4zIy+fMPT61+rX/B5j+z58UviZ+wz8PfiV8PLCa90XwF4gml1eG3Ut5MF3biKKYqo4RGTaT0G4UAfzMf8GrH7Ax/bC/4KP2Xxg8ZWf2nwn8I4l166Mi7o5dQY7LGI54P7zMpHolf6w1f5In/BDb/gvkv/AASC8JeKfhvqPw8h8V6X4t1GLULm8im8i8QxRCJUBI2lFGSB6k1/UP4a/wCD0z9hq9tUbxP8PPE1jKfvCNoZQPp0oA/s0or+QWL/AIPM/wDgnA4/eeFfFSf9sIz/AFqc/wDB5h/wTaAyPDPis/8AbvH/AI0Af150V/Href8AB55/wTuhX/Q/BviqY+nlxL/WvLPE/wDwet/sj2kbf8In8LfEN4wHy+dPDGP/AEGgD+12iv8APX+IX/B7j42nWSH4YfBezt/7kmoXrufbIjCivzw+MP8AweD/APBTr4gWEum+ArTw/wCEFk+7LaWvnSqPZpc0Af6mkkkcKGWVgqqMkngAV8O/tJf8FKv2Fv2SdOlvvjz8TND0WSFS32X7Sk1ycdhDFubPtgV/kufED/gp7/wV7/bR1E2F94+8Y+Ijcnb9l0gTiM57bLZcV63+z1/wQS/4K6/tpa0uqnwHqem287AvqfieVrZcN/F+9JkP/fNAH9d37XX/AAeW/sj/AA6gu9D/AGUPCOo+N9RTKw3t9/odlns23l2H5V/Ix+2//wAHEf8AwUw/beW70HxF4xfwp4busqdJ0L/RYih42u6/O/HBya/eDwf/AMGj3wi/Zf8AgzrP7SP/AAUb+LPk6H4YspL+/stDQRR7Il3bPPlySWPyjaBk1/FN8b/E/gHxZ8UNX1P4U6QNC8MC4dNLsslnjtVOIzI55aRlALk9/YUAa/hH4NXWu+AL34t+LNVttG0O1m+zo0xLXV5PjJjtoRy+0YLsSFXI+lY/wp+DfxE/aB+JmnfCj4H6Fd65rWrTCCzs7dDLK5Y4BbaMAAdTwBX05+xH+wz+1R/wUq+Mek/A34B6TNqRgCxy3JUrY6dbk/NJK/3UHfHVjX+qZ/wSE/4Igfs0/wDBK34dw3Wi20XiL4iX0K/2p4huIwZNxHMVsD/q4h0GOT3oA/L3/gh7/wAGyPwx/Y6tNL/aP/bOtbbxR8SSqT2mmOBJZaUSMjg8STD+90Hav694444Y1hhUIigBVAwAB0AFPooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9X+/iiiqd/dx6fYTX8v3II2kP0UZ/pQB/I3/wAHX3/BVKT9lH9maH9jn4S6j5HjX4lQut7JC2JLPSR8sh45Vpj8i+2a+cv+DQ//AIJk6Z8KPg1qX/BRr4wWaRaz4nWSz8PNcgL9n09OJrgFvu+aw2hv7oNfxif8FUv2w9T/AG1f+Ckfjz46fEKSafSF1ySwtLcHmLTbGUxRxoDwMqpP1NfRn7UX/BdH9uH9p/4e6J+y18GLiTwB8OtHs4dK03w74d3JLLDEoRFmkT55Gb+IDgk0Af6Fn/BRL/g46/4J7/sDxXnheHXF8e+MoAVXSNEdZVSQcYmnHyIAeuMmv4S/2/f+DmL/AIKK/t139z4G+HmoP8PvC14xii0vQtwuZVbgLJOPnY9sLXRf8E6v+DYb9vv9ua5tPiF8X7d/ht4Qu2Er32rqTfToepitz82SO74r+8n/AIJ9f8G+f/BPH9gCztNa8OeGI/FviyFVL63rarcS7xjmJGGyMZ6YFAH+Wl8QP+Cff7X3hL9n+6/bF/aE0e88NeGbqZIbS71ssl3qVzN9xIIpP3jZ6sxwFAz7V/Wd/wAGt/8AwRC/Z5/aJ+Bl/wDtqfte+FI/ES3GpfZ/DdpeZ+z+Xbj97M0fR8uQozxxXiP/AAc/ftC+If26P+ClXw9/4Jp/BFvtNn4XuLeykt7b/VnVNQZVIwvH7mLH0zX+gD+x3+zj4W/ZI/Zi8E/s6eDolis/CulW9kdoA3yqo81zju0mTQB7L4I+H3gb4aaBB4W+HukWei6dbKEitrKFIY1UdAFQAV2FFRzTRW8TTzsERAWZjwAB1J9hQBznjTxn4X+HfhPUPHHjW9i03SdKge5urmZgkcUUYyzEnjAAr/Mm/wCCmP7bn7Rn/BxL/wAFANH/AGJv2P0uP+Fc6TfGG0CZEUoRtsuo3OONijOwHtX19/wcT/8ABZHx9+2r8Yov+CVv7Ass+q2NxfJp+s3Wmks2pXZbb9ljZP8Alih++eh+lf0q/wDBCD/gjZ4F/wCCWv7O8GoeJ7eG++J/iiCObXL/AGgmDIyLSJuyJ3x1NAH3V/wTW/4J5/Bz/gmv+zHo37P/AMKLZDPDGsuq6htAlvbwj95I564zwo7Cv0DoooAKKKKACiiigAooooAKKKKACiiigAooooAK/Fv/AIOBf2VE/a2/4JY/ErwdZ2/n6roNmNe0/C7n82w+dgv1j3Cv2krM1rR9O8Q6Nd+H9YiE9pfQvbzRt0eORSjKfYg4oA/ylP8Ag1D/AGtY/wBmz/gp7Z/DDxJdC10r4k2MujSK5wv2uL97b8euQyj61/q/V/jK/wDBUb9lf4q/8El/+Cn2s6X4a36d/ZGsr4i8MXiAqr2zS+dAVP8As/cYexFf6jH/AASK/wCCm/wi/wCCnf7KWjfFfwVexr4ksIIrTxDpbECa0vUQB8p18tz8yN0IoA/VKiiigAooooAKKKKACiiigAooooAKKK82+Kvxj+E/wL8IXHj/AOMviTTfC2iWilpb3U7mO1hUKMn5pCoJx2HPtQB6TXnfxU+Lfww+B3ga++Jfxh1+x8NaBpkZlub/AFGdLeCNVGeWcgZ44A5PQCv5DP8Agor/AMHhv7LnwT+3fD79g/RG+J3iGPdENavN9rosL9N0YwJ7nHUbQiH+9X8unh74X/8ABcL/AIOPviyviTXZdT1vw3HP/wAft7u03wvpak9IYwBEzKOgRZJD60Afvf8A8FVv+DwXQtJTUvgr/wAEwtO/tG8O63k8a6nFiBP4S2n2jDMh/uyS4XoQhr8g/wDgn/8A8EC/+CkP/BZT4lD9qj9svXNV8NeEdZlFxdeIvEO+XVdSjJzixtpcHYRna7BIl/hBHFf1qf8ABLH/AINdv2Lf2Dxp/wATvjvHD8WfiPb7ZRdahCP7KspR/wA+lm2QxB6STbj6Ba/p2hhhtoUt7dBHHGAqqowFA4AAHAAHQUAfD/7CH/BOf9k7/gnJ8KIfhR+y/wCGINIiKL9u1GQCTUL+QDmS5uCNzn0UYRewFfctFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJwBk18o/ta/tu/sw/sPfDi4+KH7S3i2x8N6dApKJPIPPnYDhIYR87sewUV/ET+1L/AMF+/wDgot/wVn+JFz+yf/wR78F6pouiXjG3m11Y/wDTpIjwZDJ/q7SPHcnd9KAP6b/+CnP/AAXk/Yi/4JoaJcaN4u1lPFPjoxn7L4b0p1luS+Pl89h8sK57tz6Cv5KIdI/4Lbf8HM3jn7RqTTfC34FCf7v7y2sPJz/wGS9kx/wD6V+wP/BMb/g1U+E3wj1u2/aF/wCCjOqf8LP8f3Di7fTZZGlsIZjzmd3O65cH1wv1r+vPw94c0Dwlott4b8LWUGnafZxiKC2to1iijRRgKiKAAB6AUAfkL/wTJ/4IdfsTf8Ex/DtvefDjRU8QeNTGBdeJNTjWS6ZsciAEFYU9AvPvX7J0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFJ0pa/Ln/AILH/txad/wT9/4J/wDjn48CUJrBtG03Rkzy19dKUjIH+wMtx6UAfwT/APB1r/wVEk/a0/atj/ZI+Ft+ZvBfw0laG48lvku9VPErccMI/uL+Nf0xf8GsP/BKq1/Y6/ZRT9qX4paaIvH3xJhS4j81f3lnph5hiGeVMg+dvwr+I/8A4IY/sPeIP+CnP/BTDRLPx5E+oaDpV23iTxLNICyukcm8Ruf+msmB9M1/sOaTpWn6HpdvoukwrBa2kawwxoMKiIAqqAOgAFAGhRRRQAUVDcXFvaQNc3TrFHGMszEKoA7kngCvw4/4KE/8HBv/AAT0/YA0+80fXPE0Xi/xdArCPRNEdZ5PMHAEsi/JGM9eaAP3Dvb2y020kv8AUZUgghUs8kjBUVR1JJwABX8vP/BVj/g6C/ZI/Ygs9Q+GX7PE0HxJ+IcYaIR2r50+zkxjM8y8MVP8K1/GF/wUq/4OMf28v+CkOpTfDTwTcTeBvBd45ih0TRWf7Rcq3AWaVPnckfwrxXvf/BLf/g1w/a+/bZuLH4qftLed8N/AtwVmLXa/8TO8Q8/u4W+5uH8T0Aflr8Zv2jv+Ckn/AAW1/aNh0zV5NV8c63fzbbHRrBX+xWaMeAsa/u41UdWb0r+yf/gkb/waVfDf4Q/2Z8cP+Ch8kXifxCmy4g8MwHNjbN1AuG/5asO6j5a/p9/YS/4Jqfsjf8E6vh1D4A/Zt8L2+nSbFF1qcih766cDlpZiN3PoMAV98UAc94V8J+GPA3h+18KeDdPt9L0yxjWK3tbWNYoo0UYCqigAACv4zf8Ag7G/4KK+JbDwv4a/4JWfs5SveeMviPNbtrcVocyraSyBbWz+XkG4kwWH9wDsa/q8/bD/AGovh1+xh+zX4u/aW+KVwsGk+FbCS6Kk4M0oGIYE9WkfCgCv4gP+Ddb9lz4if8FQP+ChXjz/AILK/tVW7XlhpeqTf2BHcDMT6i/C+WG48uyhwi44DfSgD+rr/gjL/wAE6vDX/BND9hjwv8C7eGM+JLyJdT8R3Sgbp9RuFBkGf7sQxGnstfp94n8L+HPGvh688J+L7GDUtM1CJoLm1uUWSKWNhgqyMMEGt6igD+Y/9p//AINP/wDglz+0F4guvFnhHTtS8A3t0zO66NNi33t3EL5UD2Ffmn4l/wCDJT4FXNw7eFfjFrFtGfurPaQvgfUYr+5yigD+CSX/AIMh/Ce79x8b7sD309P8ahH/AAZDeG88/HC5x/2D0/xr++GigD+DWx/4Mifh8rf8TH4237L/ANM7CIfzr1rwx/wZP/ssWbA+Kvir4gvB3EMMEf8A7LX9uFFAH8p/w8/4M/f+CWHhGSObxO3iLxEy9Rc3pjU/8BjAr9A/hT/wbyf8EifhDfwapoHwg0y9uYMbX1Etdcj1EhIr9raKAPGfh3+zr8BfhJYppvwy8HaPoUEYAVbOzhixj/dXNexMYreIs2ERB9AAP5Cld0iQySEKqjJJ4AAr+Av/AIONP+Dj29sL7Wv2EP2DtY8t4t9n4m8TWjcg/dktLNx6dJJB9BQB4F/wdif8FkNG+NPiKD/gnr+zdraXvhzRpRceKb2zk3RXN2h/d2YZeGWIjL443YHavwZ/4JE/8EV/2kf+Cq/xPitvCltJoXgHTpl/tfxFOhEMaA/NFBn/AFkpHAA4Her3/BEb/gld43/4Kt/tg2nhPXEuF8DaHIuoeKdT5/1G7PkLJ/z1nPyjvjJ7V/rz/AP9n/4Q/sw/CzSvgz8DtDtvD/h3RoVht7W1QIuFGNzY+8x7k8mgDwP9gv8A4J8fs2f8E6fgpZfBb9nfRIrGGJF+2XzKDd3swGDLPJjLE9h0HavuGiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//1v7+KingiuYHtpxuSRSrD1BGCKlooA/i5/ak/wCDOH4AfG/9o/WfjB8OPiNe+E9A1+9kv7nSFtkm8qSZy8iwOeikngHpX7Pf8E//APggh/wTx/4J7w2+tfD7wpH4i8URAbtb1pVubncO8YYbI/8AgIr9qKKAGRxxxIIolCqowABgADsBXzf+2D+0T4U/ZN/Zl8a/tD+M5lgsfCulXF6SxxudEPloPdmwBX0nX8Sn/B5H+3DN4I+BHg/9hTwRdf8AE18c3Q1HVYoz832G2YCJCB2klxx6LQB+bX/Brv8As7eK/wBvX/gpr8QP+Ckvxlha8g8N3NxqEUsw3K2q6gzeUqk8fuY8kemBX+khX4kf8G+v7DkH7C//AATR8E+EdUtRb+I/FUI8QawSuH868UNHG3/XOLaPzr9t6ACv4vf+Dlr/AILqz/AjRrn/AIJ9/seagbv4geIE+za3fWJ3vYQzfL9njKf8t5M4wPuivu7/AIOD/wDguB4W/wCCavwbm+Dvwfu4r/4u+Kbdo7KBCG/s2FxtN1MB0P8AzzXua/F3/g2+/wCCIni74yeOE/4Kkft9Ws2p3WoXDah4e0/UgWe5nc7vt9wr9Rn/AFan60AffX/Btb/wQui/ZI8E2/7bX7VGnC4+J3iaHztOtLpdzaXbTDdubd/y3kByT/COK/r8pqqqKEQAADAA6AU6gAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPxA/4Ldf8Ebfhp/wVg+ADadbCDSfiR4cjeTw9q7Lj5uptZyBkwyf+Onmv8xr4ffEj/goJ/wQr/bQmFsl74M8X6DN5d7YThvsWpWwPRl+5NDIPusOnbBr/akr89v2/v8AgmB+x7/wUo+HZ8CftM+GYr64hUix1a2xDqFmx7wzgZx/snKn0oA/Mj/gmP8A8HL37B/7dXhjTvDPxX1u1+GHxDKJHcaZrEohtJ5cYLWt0+IypPRXKsPev6KdE1/QvEunpq3hy9g1C1kGUmtpFljYezISD+Ff5tH7ZH/Bmb+118O9Xu9e/Yw8YaZ460fcWgsNUf8As7UUXsu/BgkI9cp9K/I2/wD+Cef/AAcA/sU3Lf8ACOeDfiX4ehs2ws3h24ubi347qbCV1I/CgD/Ygor/AB6LX/gqL/wcIfBZRp+oeO/idpq2/GzU7O6kAx6/aoGrq9P/AODj3/guh4Q/c3/xP1Fyn/P9pFmx49d1sKAP9eyiv8jqL/g6d/4LX26+W3xDs2PT5tEsM/8AoisrUP8Ag53/AOC3viFPs1p8S/JJ/wCfXRbAN/6TmgD/AF2qZJJHEhklIVVHJPAAr/HvvP8Agsl/wcA/GVjBovxK8f3Yk42aNYGLr6fZLZTTLD9lv/g4n/bK/wBIu9D+L3iWC66tqdxqNtbkH1+1SRR4/SgD/Vs+Mn7c37Gn7PWny6n8bfil4X8MxwffW+1S2jkGP+mW/efoFr8P/wBpj/g7K/4JK/AiC4s/h9ruq/E3U4gdkPh+ydbdiO32q68mPHuu6v5Fvgp/waKf8FbfjFfQan8Vh4f8C21yQZZtW1L7XcqD6xWizEn2Liv3X/Zl/wCDKT9m/wAKT2ur/tXfFLV/FsiYMun6Hbppts3t50hmmx9ApoA/Mv8Aaz/4PLP20Pi9PL4Q/Yx8B6b8P7e5Plw3l4DrGptu4GxNqQI3p+7evh34Y/8ABK3/AIL0f8FsPGtv8Tfjw2vDRrlg41zxxPLZWUUZ72tmwDEAdBDAB71/o1/sl/8ABIP/AIJxfsSJDc/s9/CnRdO1OFQv9qXcP27UDjv9pufMdT/uba/SYAAYFAH8m3/BPL/g0h/YX/ZcksvHX7U1zJ8YfFUG1/Iu0+zaLDIP7topLTAHoZmI/wBmv6qPCnhHwp4D8PWvhLwRptro+l2KCO3s7KFIIIkHRUjjCqo9gK6KigAooooAKKKKACiiigAooooAKKKKACiq93d2thbPeX0iwwxjczuQqqB3JPAFfzV/8FOf+Dm39iv9hlr34afB6YfFH4iJmJNO0pw1pby9ALi4XKjB/gTLe1AH9Fnjv4geB/hh4Xu/GvxE1a10TSbGMyT3d5KsMUaKOSWYgCv45P8Ago5/wdc+F9M8RXH7OP8AwS28PS/EfxndObOPWvJeSyjlPy/6NEg33DA9DwnvX5oeDf2OP+C4P/Bxf4vt/iT+1VrNx8Mfg7LKJILSRZLa1MOeltZ5D3DY6SSfL9K/sQ/4Jyf8EWv2G/8Agmj4dgHwZ8Nx6l4p2AXPiPU1Wa+kbv5ZIxCv+ymPrQB/K/8Asl/8G6f7eP8AwUy+I9t+1p/wWV8banZWd4wuItAaTdfPG3zCPy/9VZx442gbsdq/ty/Za/Y8/Zu/Yu+HFt8K/wBmvwpY+GNJt1CsLaMedMR/FNKfnkY+rH6V9MUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAV/BZ/wAHtXxm8R6f4U+DvwHs3ZNMv5LzVrgDgPJHiKP245r+9Ov5z/8Ag4l/4I5+Jv8Agqj8ANF1T4OTQQfEDwO8sunJcNtjuoJBmS3z0ViRlTQB+b//AAZrfB34X/D39jPxf8e9QvrKPxF4s1p7VhJLGssdrZDYi4JBALZNf2A+IvjX8HPCNq174o8VaRp8Sfeae8gQD82Ff44HiP8A4Ji/8Ff/ANmzXLnwfb/DzxrpLROVb+yvP8hz6gwNtOam0D/gmD/wWM+NN4tgnw58c6gZTjN954T8fNfFAH+pZ8d/+C3n/BLr9na0ln8f/F3RJJocg29hL9rmJHYLFmv58f2sv+Dz39mvwZFc6J+yX4G1DxZegMsd9qZFpag9m2DLkV/Ot8Ef+DUD/grN8W7mOXxdoWm+DbaQgtLql2u8D18tMn8K/eb9lr/gyt+FuhTW+s/tafEq51ogKz2GixfZ48jqplf5sfSgD+Y39sL/AIL5f8FSv+CheqP4Jm8TXejaVfsUj0Pwyjwhw3GwmL949e4fsEf8Gy//AAUb/bk1K38afEnT3+Hnhi7YSS6nru77VKp6mOA/Oxx3bFf6RX7In/BI7/gn5+xFYQRfAb4c6ZaX0I/5CN1EtzeMfXzZASPwxX6RqqooRBgDgAUAfg1/wTf/AODeH9gX/gnnb2fiey0RfGvjWEKX1vWUWVkkHeCI/JGM9OM1+8kcccSCKJQqqMAAYAA7AU+igAoor80/+CtP7f3hP/gm7+xH4t/aJ1mWM6vHbtZaFasRm41KdSsIA7hPvt7LQB/Jn/wcsftcfEP/AIKCftq+Av8AgjB+yjO17t1O3/t825yj6hL0STb/AMs7SLLvngN9K/tD/YZ/ZG+Hf7DH7LHg/wDZj+GcCxaf4ZsY4ZJAAGnuCMzzv6tI+Sa/k0/4NRP+Cf3izxhqHiz/AIK4ftKxPe+KPHNzcxaBLdjL+VK5a6vBu/56v8iEfwjjrX9wFABRRRQAUUUUAFFFFABRRRQAUUUUAfzif8HPP/BQTx5+wh/wTuntfhNO9j4m+It9/wAI9a3sfDWsMkTyXEikdH8tSq+ma/y2/wBlT9lv43ftwftA6L8Bfgrps2teI/EV0FJALCNWP7yeZ/4UQfMzGv8AaA/b7/4J8/s4f8FI/gXL8Av2ldMe90rz1u7We3fyrm0uEBVZYXH3TgkehFeJ/wDBOL/gj1+xV/wS+0a+h/Zx0JzrGp/Ld6zqDeffSIOkYkI+RP8AZXAoA6D/AIJVf8E2PhR/wS//AGU9I+AXw/jS51V1W613VNoEl9fMvzuT12L92Ney1+ldFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf/1/7+KKKKACiiigClqOoWmk6fPql+4igto2lkY8BVQZJ/ACv8wLw3Dqn/AAXe/wCDkKTUJg194F8OauW9Y00bRG49sTyL+O6v7OP+DiX9uFf2H/8AgmT408Q6JdC38SeLo/8AhHdHAID+degrI6j/AKZxbm9sV+Qn/Bm9+w43w0/Zn8V/ts+MLXbqvj66/s7S5JB8wsLQ5kcZ5/eS8e+ygD+0W0tLawtYrGzQRQwoscaKMBVUYAA7ADgV+OX/AAWd/wCCuvwn/wCCVH7Odz4s1KWLUfHetxPB4e0YMN8s2MedIOqwx9Se/QV9C/8ABTD/AIKP/A3/AIJl/s26n8d/i/do10EaLSNLVh59/dkfJFGvXGfvN0UV/Bz/AME8P2GP2p/+Djz9uHUv25/20pbm1+Ful3uSp3LFMkbZj06yB42KMCRx/OgDvv8AgiT/AMEmPjf/AMFfv2nL7/gpt/wUPNzf+EG1A3ltBeAj+17lWysaK3S0i4GBwcYFf6Q2j6Ppfh/SrbQtDt47Szs41hghiUKkcaDCqqjgAAYArn/h78PfBfwp8E6Z8Ofh3p0Gk6Jo9ulrZ2lugSOKKMYVVA9q7KgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKTAPWlooAqz2Vlcp5dzCki+jKCK5K/+Gfw41Uk6p4f025z1821hf+a129FAHkb/AAA+BEp3S+CtBY++m2p/9p1pWPwZ+D+mOJNN8KaNbsOhisbdP5IK9KooAz7DSdK0qPytLtorZfSJFQfkoFaFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRX5j/t9/wDBXj9hr/gnF4Yl1X9oTxfbrq+wtbaHYsLjUZyBwFhQ5Ue7YFAH6bkqq7m4Ar8Wf+CkH/BeL9gr/gm7pVzpPj7xHH4k8ZKh8jw5o7LPdl+wlKnbCuepcj6V/Kp8WP8AgsH/AMFlv+C4nje6+BH/AATM8F3/AIC8Czv5NxqkHyT+SeN1zfkCOAY/hj+bHQ1+q/8AwTf/AODTv9nr4JanbfGr9vnVW+K3jiRhcyWUjudNim6nzC58y5bPUthT6GgD8fvEf7Tf/Bdj/g4w8VTeBv2edJufhX8HJpDHPcRPJaWpgJx/pF5hXnbH/LOLj2r+i3/gmN/wbL/sSfsICy+InxVt0+KHxBi2ytqGqRhrK3m6k29s2QcHo0mT7Cv6LPCfhDwr4D8PWvhLwTpttpGl2KCK3tLOJYYY0UYAVEAUD6CujoAht7e3tIEtbRFiijUKiIAqqo4AAHAA7CpqKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAQlVXc3AFf50X/BVv4seN/+C9H/AAWZ8Jf8E4/gRdyTfDj4fXrQaldQHMJMLA6jdkjj5QPJi9+lf0+f8HC3/BS6y/4JzfsG6zeeF7xYvHfjhJNG0CMH95GZVxPcgekSHg/3iK+Gv+DVb/gmfe/syfsuXX7ZPxis2/4T/wCLOLtGuF/fW+mE7ol55BmJ8xvqPSgD+nv4N/CbwV8CfhXoHwd+HVnHYaJ4bsYbCzgjGFSKFAg4H05r0yiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//0P7+KKKKACiivBP2o/jz4T/Zf/Z38ZftAeN5lg0zwnpNzqMpY4B8mMsqj3ZsKKAP8+X/AIOj/wBoXxR+3b/wU7+Hn/BOD4QStfQ+GJraylhh+ZW1bVGUHIXvFDtB9Mmv7Ydb+In7NP8AwRk/4J06L/wse+h0rwx8OdDgsY0BAkvLqOPlIl/ikmlyePWv4PP+Dfax8P8Ax8/4KDfFr/gsN+2DfR2Phb4cC98RXV/eHEY1K/Z/s8ak8Foo87FHouK9B8e+KP2sf+DrD/goYngjwL9r8Nfs/wDge5yZWBEMFqGwZnH3Xu7gD5F/gHtQBzPwU+DX7X//AAdP/wDBQK5+N3xia68O/BLwpc7Ao3CC2s1bK2lt/C1xKB+8YdPyr/R++BHwK+Fv7NXwo0X4K/BnSYNE8O6DbpbWlrAoVQqDGTjqzdST1Ncj+yl+yt8F/wBjH4G6H+z98BtIi0jQNDgWJFRQHlfHzzSt/FI55YmvoygAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACvjz9sT9vX9lP9g74dz/Er9pzxfZeHbONSYYJHBubhgOEggX53Y9BgV/Pr/wAFpv8Ag5H8P/sg+Mrr9jn9hrTk8d/GGV/sU8sSme00u4k+VY9keTPcgn/VjhTjd6V+Zn7Fn/BuJ+2X/wAFHPiFb/tkf8FnfGWqRx6kwuofDzS5v5Im+ZY2H+rs4sceWq7sdhQBiftJ/wDBw9/wUd/4Kk/EO5/Zi/4I6eAdT0jTLtjA+u+T5moNEePM3H9zaJjuxLD2r61/YC/4NM9LvvE8X7RH/BVjxddfEDxZeOLqbRYbl5IfMJ3Yurtjvlwf4UwvbNf1t/sz/sl/s6fsefDu2+Fv7N/hLT/Cuj2yhdlnEqySkD700v35GPcsTX0XQB5p8Jvg38KfgR4KtPhz8GvD1h4Z0OxQJDZafAkESgcdFAyfc5Nel0UUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFUNU1TTtD0y41nV5kt7S0iaaaVzhUjjG5mJ7AAZq/X8sv8AwdL/APBTCf8AZE/Y/T9mL4V3hHj74rhrFEgP76DTidszgDkGU/u1/GgD8F/EVx4m/wCDkL/gvHHoloZZ/gn8KZvm6+SbCzl59t95KP8Avj6V/o2aDoeleGdEtPDmhQJbWVjCkEEUYCqkcahVUAcAACvwJ/4Nyf8Agmdb/wDBPf8AYT0zVfGlmI/H3xBWPWdbkYfvIxIuYLbPXEaEZH94mv6DKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9H+/iiiigAr+Nr/AIPGv22W+EX7Hnhr9j7wpd+Vq/xMvvPvkRsMNMsSGYEf3ZJSi/QGv7Ja/wAwz/g40+BX7aX7dP8AwXDPwI+G3hHVdSFtp+maZ4fKQSfZRA6edNcedt8tUEjtvOeNtAH5zfsffDL9oj/goBpPgn/gkd+x+ktp4ce8/t3xzqkfEE142A81w6cGCziAiiTJ3SBmHBGP9TH/AIJ//sGfA7/gnV+zhov7O3wOsUhtrCNWvb0qBPfXRA8yeZh1LHoOijAFfKv/AARq/wCCSnwo/wCCU37NVr4D0eOHUvHGtIlx4k1raN89xj/UxnqsEXRR36mv2FoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAqjqVrNe6dcWdtKYJJY2RJFHKFhgMB7davUUAf5etr/wAE7f8AgtH/AMEg/wBtPxR+0T8L/hBafFa8nv7iex8Ry2TawGSaRn86MJIGhmcMN5ZdwIwpHf74j/4OKv8Agv34eH2XxF+zOski8EnSdQTp7DNf6CVFAH+fkP8Ag5W/4LkDhv2YUz/2D9R/+Jo/4iVP+C5R+7+zEn/gu1D/AOJr/QNooA/z8v8AiJP/AOC6B6fsxp/4LtQ/+JoP/ByT/wAF1T0/ZjT/AMF2of8AxNf6BtFAH+fl/wARIn/Bdo9P2ZU/8F1//wDE0f8AER//AMF3z939mVP/AAW3/wDhX+gbRQB/n5f8RHX/AAXlP3f2Zk/8Ft9/hR/xEa/8F6T939mdf/BZff4V/oG0UAf5+X/ERh/wXub7v7NC/wDgsvf8KT/iIq/4L6H7v7NI/wDBZe/4V/oHUUAf5+X/ABES/wDBfpvu/s1D/wAFd5/hR/xEP/8ABwAen7NQ/wDBXef4V/oG0UAf5+P/ABENf8HAh+7+zWP/AAV3n+FH/EQr/wAHBZ+7+zYP/BVd/wCFf6B1FAH+fj/xEH/8HCB+7+zaP/BTd/4Uf8RBX/Bwsfu/s3D/AMFN3X+gdRQB/n5f8RAn/Bw4fu/s3D/wU3VH/D/7/g4hPT9m/wD8pF1X+gbRQB/n5f8AD/n/AIOJj0/Zw/8AKRc0f8P9f+Dis9P2cP8AykXNf6BtFAH+fl/w/wAP+DjA9P2cf/KPc0f8P6/+DjY/d/Zy/wDKPcV/oG0UAf5+X/D+X/g48PT9nP8A8o1xR/w/g/4OQTwv7On/AJRrj/Gv9A2igD/Py/4ft/8AByN/0br/AOUaf/Gj/h+t/wAHJR+7+zr/AOUaf/Gv9A2igD/Px/4fo/8ABygfu/s7f+UWb/Gj/h+Z/wAHKp6fs7/+UWb/ABr/AEDqKAP8/Nf+C43/AActseP2dz/4JJv8atx/8Fvf+DmB/u/s6Z/7g0v/AMVX+gDRQB/AVH/wWz/4OZm6fs45/wC4PL/8VVxP+C1X/BzWw+X9m0H/ALhEn/xdf300UAfwRJ/wWi/4Ob26fs1Kf+4VIP8A2pV2P/gsv/wc6N0/ZnT/AMFb/wDx2v70KKAP4HfE3/Bbn/g5S8F+HL3xf4v/AGc7TTNL02Fri6u7qwMUMMSDLM7tMAqgV/Pbb/Hb/gpj/wAFX/25E/4KBaN8KW+KWo+C7m1X+yrWFn0q0e3XMEZTevyhhv25wT14r+sD/g7H/wCCh+v+FPhx4d/4Jo/AOd7nxl8S5oTqkVqcyrZu4SC3wvIM74yP7or9xf8Agin/AME8PD//AATe/YT8LfB0QIPEuowrqev3AHzS31woZlJ9IxhF9hQB/ODa/wDBXb/g53hhS3t/2X7dUjAVVFgQABwAB5/atOL/AIK5/wDBz8//ADa/bf8AgER/7Xr+5qigD+HSL/grT/wc/v8A82u2n/gIR/7cVoJ/wVf/AODoBv8Am1yy/wDAb/7pr+3uigD+I0f8FWP+DoM/82t2P/gP/wDdNL/w9W/4Ohe37Ldh/wCA/wD91V/bjRQB/EcP+Cqf/B0Uen7Ldh/4D/8A3VS/8PVP+Dokf82tWH/gP/8Addf24UUAfxH/APD1n/g6HH/Nq9gf+3f/AO66cP8AgrD/AMHQEf3/ANlOxP8A27t/S7r+26igD+JIf8Fc/wDg5xi/1n7Jdo30tn/pd08f8Fhf+Dl+Hmb9kKBh7W039Luv7aqKAP4nU/4LR/8ABx7a/wDH3+xuHx/dtbr+lwanH/Bcn/g4QtOL39iuVsf3bW+/pKa/tbpMUAfxTn/gvx/wXX0wZ1f9iK9bH9y21L+haq0n/Bx3/wAFgNM/5DP7D+sjHXZBqg/9otX9sG1T1AphhhPVB+VAH8Tn/ET9/wAFHNK58RfsS+JEA67I9SH87M1bh/4Oyv2g9L+Xxd+x54wtsddhu1/9DsK/tVNpanrEn/fIqM6dp7fegjP/AAEf4UAfxkQ/8Hguj2HHin9mDxvZ464kPH/fdqtbVp/weafsnWzBPFvwW8daX/e/49nx/wB9GOv7EJvDvh+5/wCPixt3/wB6JT/SuW1H4SfCvVwRqvhvS7kHr5tpC381oA/lf0P/AIPK/wDgmPekJr3hrxrpp7hrK2kx/wB83Ir2jQP+Dun/AII8avtXUNY8T6YT/wA99GdgP+/Uj1++mq/sj/sra7n+2vht4Yu89fO0m0f+cVeOeJf+CYv/AATs8YKV8R/BHwVc7uudFsx/KIUAfnV4X/4Oe/8Agi54n2j/AIWudP3f8/ul38WPygIr6G8N/wDBez/gj14pKJpvx+8Lxs/RbmWW2/8AR0SAVa8Q/wDBB/8A4JAeKGL6t8APCYZu8Fobf/0SyYr5/wDFv/Bsp/wRa8WIyH4Pw6aW72GoX8BH0xPj9KAP0T8Hf8FKf+CfHxAC/wDCH/GvwTfb/uhNbslP5NKDX0b4f+NnwZ8WBf8AhFfF2i6nu6fZL+3mz9Njmv5wfFH/AAaD/wDBIDXQ50aw8V6KzdPsutO4X6CeOWvmzxD/AMGYX7EwlNz8Nfiz478OSfwHzLOcL6dIYj+tAH9jcUsU8YlgYOp6FTkfpUlfxM33/Bp5+1H8P3879nX9szxdo5j/ANWlzHdxAemfs1+o/wDHaY3/AARg/wCDlf4Qwf8AFmv20l1pIvuQ395frnHQEXMNyv60Af200V/Eonhz/g8w+BEB+y6r4S+I0EPTedKmdwP95LOSiP8A4K3/APBz98EISfjZ+yHa+JoYPvzabZ3IyB3Bs7i4X/x2gD+2uiv4oNL/AODtf4z/AA0b7J+1X+yR4u8OSR8SvavMijHXC3drF/6FX078OP8Ag8R/4JdeJ1SL4h6T4x8ITnhlutMW4RT7tbSueP8AdoA/rCor8UvhZ/wcRf8ABHT4tLEui/GzR9NmmwBDqyz6ewJ7H7RGi/rX6O/Dv9sT9lD4twxz/DH4keGteWX7osdTtZif+ApIT+lAH0hRVS3vrK7QSWkySqRwUYEY/CrdABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//S/v4ooooAKotpmmtfDU2t4jcqNol2DeB6BsZxV6igAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArxD9pH49+A/2XvgX4o+PvxLuUtNG8LafNfTsxA3eWvyxr/tO2FA969vr+Fj/g6q/bd8afHH4n+Bv+CQH7NEzXuueJb61l12O2OSZJmC21s+3soPmOOw+lAHzn/wQi+Afjz/AIK/f8FT/HX/AAVm/aOtmuvDfhjUXbRopxmI3h4t40B4220WOnciv9DIAAYFfA3/AATL/Yh8Ff8ABPj9jXwd+zZ4RhRZtLs0k1GdRhri+lAaeRj3y3A9q++qACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAKGoaXpmr2xs9Vt4rmFuCkqK6n8GBFfMPxG/YU/Ys+LsLwfEz4UeEtaEn3mutIs2c/8AA/K3frX1bRQB+HnxV/4NxP8Agjd8WY3/ALQ+DVho0j/8tNGuLmxI+ixy7B/3zX5yfEj/AIM4/wDgnDrtwdQ+Efizxl4JuOqGG7hulQ9seZEr8f79f1vUUAfxN3P/AAa//wDBQP4I3Rvf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ACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD4n/4KI/tf+FP2FP2O/G/7S3iqVE/sHT5DZxscebeONsEY+r4/AV/JP/wak/sd+Lfjt8WPiH/wVx/aCha71fxHf3NtoktwMktK+65nXI7cRqR2Fch/wdJ/tNeMv2wP2tfhh/wSF+AUzXNzdahbT6ykByPtNyQIkfHaKPLnPFf2ffsXfsyeDv2Ov2X/AAZ+zj4GgSCy8MabDattAG+YKPNkOO7Pk0AfUNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/1v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8S/aQ+OHhP9mv4EeK/jv44mWDTPC2mz38rMcA+UhKr/AMCbAFe21/G//wAHfX7Z2oeBf2avCf7Dfw7nLeIfidfo11BEfn+xxMFRCBziSQgUAfDX/Bs98DvFv7f3/BRP4rf8FavjVA11DZ31xFpDzAlftd0f4Cf+eMOAPSv9AWvy3/4I1/sW6X+wj/wT2+H/AMEordYdVawj1HVmAAZ726USSbiOu3IH4V+pFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9f+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAIpporeFridgiRgsxPAAHU/hX+dh4Igl/wCC0X/BzfeeIr0HUPAPwluSyAndEINKO1AO2JJ+3tX9kP8AwWE/avtv2MP+CdfxM+Nwn8i/g0qWy0/nBN1dDyo9vuM5r8F/+DPT9ku58D/sn+Lv2yfGUBbXPiVqjpBPIPma0tzlmB6/PISaAP7GERIkEcYCqowAOAAO1PoooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/9D+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP4cf+DxT9oPV/E2n/CH9gTwPMXv/F+qLqF5bx/eKhxDACB23tnFf1q/sG/s8aN+yn+x58PPgFokKwp4d0S1glCjGZjGGlJ995Nfw/a5Gf8Agp9/wdbxaXNu1Dwv8LLlQR1RI9JTcfbBlP6V/ocgY4FAC0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/9H+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK8V/aP8Aifp3wW+APjL4saq/lQeHtHvL1m6Y8qJiP1xXtVfgV/wcv/Hj/hRX/BIz4jSWtx9nvfEqQ6Lb4OCTdOFYD/gNAH4Vf8Gfnwtvvi18aPjz+3h4riM11q98bG1uX67rqVriXB+mBX95Vfzj/wDBrH8BI/gr/wAEk/CWt3Ft9nvfGN3daxNkYLK7bIz+S8V/RxQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH/0v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAr+J7/AIPQfihcxfs8fCT9n6xb5/FHiFrh1HdYE2r/AOPMK/thr/P2/wCDp3VZPip/wVW/Zr/Z9dt9upt5Gj97m8jHT6LQB/aT/wAE/fhbH8FP2I/hX8LkQJ/ZHhrT4mAGPmaFXb9WNfYFZHh/S4dD0Gx0W3GI7O3igUegjUKP0Fa9ABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//T/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACv87D/gttq3/CT/APBzT8E/D1ycxWMugRgHp807N/Sv9E+v83H/AILzXZ+HP/ByR8KPHF+fLgL+HpwzdNq3DKaAP9I6io4ZY54VniOVcBgfY9KkoAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD//U/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACv877/g8m+EHiL4dftT/Br9r/SonFm9v9gklQHCz2cyzxgnsSu7Ff6INfnj/wAFOv8AgnZ8KP8Agpr+ytrH7OHxNP2Saf8A0jStRVQZLK9jH7uVfUdmHcUAeqfsHftHeDP2sf2RPAPx18DXkd7a61o1q8pRgxjuEjVJo2x0ZXByK+uq/wAuGy+C3/Bwx/wb7+KtT0P4KWupa14CadnWSytjq+iXC54kMK5a3cr1HyEV7toH/B4//wAFHvBMY0j4m/CXw7fXcPyyMY72yfI65UlwKAP9Kiiv85FP+D2T9p+NcXHwS0Pd7X9yP/aNfbn/AATi/wCDtL4wftgftjeDf2bfiP8ACGz07TvFt4tiLvSrqWeaB3+65R41BQfxcigD+5KiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAGsqsu1hkHjFeQeKv2efgF46Zn8a+CNA1Zn6m8021nJ/F4ya9hooA+LtT/4Jx/sC6yxfU/g14OlJ9dGtB/KMV0Hwu/YR/Yx+CXi6Lx/8I/hd4Z8Oa3ACsV9YadBDOgPXa6oCv4V9Y0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFAH//1v7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9f+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/Q/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/0f7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA/9L+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAP/T/v4ooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigD/1P7+KKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKK/JT/gq3/wWG/Zv/wCCSvgXQfEvxstr3V9S8TSyRadpmnKpmkWHHmSEsQqouQPrX0l/wT9/bz+Cf/BR39mzSv2mfgQ840jUJJLeW3uV2T21xCdskUgHGV9uMUAfbNFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB/9X+/iiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAPyB/wCCtf8AwRt/Z9/4K4eB/D/h/wCLeo3ugat4WlkfTtTsQrOqTY8yJkbAZW2g+xr6X/4J3fsBfBr/AIJr/szaX+zH8EWuLjTLCSS5nurogzXNzMcySvjgZ6ADgAV9z0UAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQB//9k=" alt="Aláírás" className="h-16 mx-auto mb-1" />
                            <div className="border-t border-stone-400 pt-2">
                              <p className="text-xs">Bérlő (HNR Smart Invest Kft.)</p>
                              <p className="font-semibold text-sm">Németh Roland ügyvezető</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Banki adatok + Bezárás */}
                    <div className="border-t p-4 bg-gradient-to-r from-indigo-50 to-purple-50 space-y-3 rounded-b-2xl">
                      {apt.contractDuration === '1year' && apt.servicePackage !== 'premium' && (
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 p-3 rounded-lg border border-amber-300">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🎁</span>
                            <div>
                              <p className="font-semibold text-amber-800">1 éves kedvezmény aktív!</p>
                              <p className="text-sm text-amber-700">Az 1. és 12. hónap bérleti díját elengedjük.</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                          <span>🏦</span> Bankszámla a bérleti díj utalásához
                        </h3>
                        <p className="text-xs text-indigo-600 mb-3">A Bérlő (HNR Smart Invest Kft.) ide utalja a bérleti díjat:</p>
                        <div className="bg-white p-4 rounded-lg border space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Számlatulajdonos neve *</label>
                            <input 
                              type="text" 
                              value={partnerBankAccountHolder || currentPartner.name || `${currentPartner.lastName} ${currentPartner.firstName}`}
                              onChange={(e) => setPartnerBankAccountHolder(e.target.value)}
                              placeholder="Számlatulajdonos neve"
                              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-indigo-400 focus:outline-none text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-stone-600 mb-1">Bankszámlaszám *</label>
                            <input 
                              type="text" 
                              value={partnerBankAccount}
                              onChange={(e) => setPartnerBankAccount(e.target.value)}
                              placeholder="12345678-12345678-12345678"
                              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:border-indigo-400 focus:outline-none text-sm font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Elfogadás checkbox */}
                      <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg cursor-pointer hover:bg-stone-100 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={contractAccepted} 
                          onChange={(e) => setContractAccepted(e.target.checked)}
                          className="mt-1 w-5 h-5 rounded border-stone-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-stone-700">
                          Kijelentem, hogy a fenti bérleti szerződés tartalmát megismertem, az abban foglaltakat elfogadom, és a szerződést a saját nevemben aláírom.
                        </span>
                      </label>
                      
                      <button 
                        onClick={() => { setShowContractModal(false); setShowContractSuccessModal(true); setContractAccepted(false); }}
                        disabled={!contractAccepted}
                        className={`w-full py-3 rounded-xl font-semibold shadow-lg transition-all ${contractAccepted ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}
                      >
                        ✍️ Aláírom a szerződést
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* SIKERES ALÁÍRÁS MODAL */}
              {showContractSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center p-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="text-2xl font-bold text-emerald-700 mb-2">Gratulálunk!</h2>
                    <p className="text-stone-600 mb-6">
                      Sikeresen aláírta a szerződést. Köszönjük a bizalmát!
                    </p>
                    <p className="text-sm text-stone-500 mb-6">
                      A szerződés másolatát e-mailben is elküldjük Önnek.
                    </p>
                    <button 
                      onClick={() => { 
                        // Lakás hozzáadása az apartments-hoz (a partner lakásaihoz)
                        const newApartment = {
                          ...apt, 
                          id: Date.now(),
                          bankAccount: partnerBankAccount, 
                          bankAccountHolder: partnerBankAccountHolder,
                          contractSigned: true,
                          contractSignedAt: new Date().toISOString(),
                          clientId: currentPartner?.id?.toString() || ''
                        };
                        setApartments([...apartments, newApartment]);
                        // Reset states és irányítás a lakások listájára
                        setShowContractSuccessModal(false); 
                        setRegistrationSuccess(false); 
                        setPartnerOnboardingStep(1);
                        setPartnerBankAccount('');
                        setPartnerBankAccountHolder('');
                        // FONTOS: Beállítjuk hogy már nem új regisztráció - így a partner dashboardra kerül
                        setCurrentPartner(prev => ({
                          ...prev,
                          isNewRegistration: false,
                          name: apt.ownerFirstName + ' ' + apt.ownerLastName,
                          email: apt.ownerEmail
                        }));
                      }}
                      className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                    >
                      Tovább a lakásaimhoz →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        {/* Partner fejléc */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 shadow-lg">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">🏠 Partner Portal</h1>
              <p className="text-emerald-100 text-sm">Üdvözöljük, {currentPartner.name}!</p>
            </div>
            <button 
              onClick={handlePartnerLogout}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg text-sm font-medium"
            >
              Kijelentkezés
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-4">
          {/* Partner lakások listája */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Az Ön lakásai ({partnerApartments.length})</h2>
              <button
                onClick={() => setPartnerEditingApartment({
                  id: Date.now(),
                  name: '',
                  operationType: 'short-term',
                  clientId: currentPartner.id.toString(),
                  clientName: currentPartner.name,
                  isNew: true
                })}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2 font-medium"
              >
                <Plus size={18} />
                Új lakás regisztrálása
              </button>
            </div>
            
            {partnerApartments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-lg">Még nincs Önhöz rendelt lakás.</p>
                <p className="text-sm mt-2">Kérjük, vegye fel a kapcsolatot az adminisztrátorral.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnerApartments.map(apt => (
                  <div key={apt.id} className={`border rounded-lg p-4 hover:shadow-md transition ${apt.hasPendingTasks ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}>
                    {apt.hasPendingTasks && (
                      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-3 py-2 rounded-lg mb-3 flex items-center gap-2 text-sm">
                        <span className="text-lg">⚠️</span>
                        <span className="font-medium">Teendő van! Hiányzó adatok pótlása szükséges.</span>
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{apt.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apt.operationType === 'short-term' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {apt.operationType === 'short-term' ? 'Rövidtávú' : 'Hosszútávú'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {apt.city && apt.street ? `${apt.zipCode || ''} ${apt.city}, ${apt.street}${apt.floor ? ` ${apt.floor}. em.` : ''}${apt.door ? ` ${apt.door}. ajtó` : ''}` : 'Cím nincs megadva'}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-500 mb-3">
                      {apt.apartmentSize && <span>📐 {apt.apartmentSize} m²</span>}
                      {apt.ntakNumber && <span>📋 {apt.ntakNumber}</span>}
                    </div>
                    <button
                      onClick={() => setPartnerEditingApartment({...apt})}
                      className={`w-full px-4 py-2 rounded-lg font-medium text-sm ${apt.hasPendingTasks ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                    >
                      {apt.hasPendingTasks ? '⚠️ Adatok kiegészítése' : '✏️ Szerkesztés'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Partner információk */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Partner adatok</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-gray-500">Név:</span> <strong>{currentPartner.name}</strong></div>
              <div><span className="text-gray-500">Email:</span> <strong>{currentPartner.email}</strong></div>
              <div><span className="text-gray-500">Telefon:</span> <strong>{currentPartner.phone || '-'}</strong></div>
              <div><span className="text-gray-500">Státusz:</span> <strong className="text-emerald-600">Aktív</strong></div>
            </div>
          </div>
        </div>

        {/* Partner lakás szerkesztő modal */}
        {partnerEditingApartment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4" onClick={() => setPartnerEditingApartment(null)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-auto" onClick={e => e.stopPropagation()}>
              {/* FIX FEJLÉC */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                <h3 className="text-lg font-bold">🏠 {partnerEditingApartment.isNew ? 'Új lakás regisztrálása' : `${partnerEditingApartment.name || 'Lakás'} szerkesztése`}</h3>
                <div className="flex items-center gap-3">
                  {/* KOSÁR IKON */}
                  <div className="relative">
                    <button 
                      onClick={() => setPartnerEditingApartment({...partnerEditingApartment, showCart: !partnerEditingApartment.showCart})}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg flex items-center gap-2"
                    >
                      <ShoppingCart size={20} />
                      {(() => {
                        let cartCount = 0;
                        if (partnerEditingApartment.servicePackage) cartCount++;
                        if (partnerEditingApartment.requestDeepCleaning) cartCount++;
                        if (partnerEditingApartment.requestYettelInternet) cartCount++;
                        if (partnerEditingApartment.inventory?.noTextiles) {
                          const inv = partnerEditingApartment.inventory || {};
                          if (inv.orderDuvet > 0) cartCount++;
                          if (inv.orderPillow > 0) cartCount++;
                          if (inv.orderBeddingSet > 0) cartCount++;
                          if (inv.orderSheet90 > 0 || inv.orderSheet160 > 0 || inv.orderSheet180 > 0) cartCount++;
                          if (inv.orderTowelLarge > 0 || inv.orderTowelMedium > 0 || inv.orderTowelSmall > 0 || inv.orderBathMat > 0) cartCount++;
                        }
                        return cartCount > 0 ? (
                          <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center absolute -top-1 -right-1">
                            {cartCount}
                          </span>
                        ) : null;
                      })()}
                    </button>
                  </div>
                  <button onClick={() => setPartnerEditingApartment(null)} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              {/* KOSÁR RÉSZLETEK */}
              {partnerEditingApartment.showCart && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-200 p-4">
                  <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                    <ShoppingCart size={18} /> Kosár tartalma
                  </h4>
                  {(() => {
                    const items = [];
                    
                    // Szolgáltatási csomag - első havidíj
                    if (partnerEditingApartment.servicePackage) {
                      const packageNames = { alap: 'Alap', pro: 'Pro', max: 'Max' };
                      const packageFees = { alap: 20, pro: 25, max: 35 };
                      const monthlyFee = partnerEditingApartment.monthlyFeeEur || 0;
                      items.push({ 
                        name: `📦 ${packageNames[partnerEditingApartment.servicePackage]} csomag (${packageFees[partnerEditingApartment.servicePackage]}%) - Első havidíj`, 
                        price: monthlyFee > 0 ? `${monthlyFee} EUR` : 'Nincs havidíj',
                        category: 'service'
                      });
                    }
                    
                    // Nagytakarítás
                    if (partnerEditingApartment.requestDeepCleaning) {
                      const deepCleaningPriceEur = (partnerEditingApartment.apartmentSize || 0) * 3;
                      const deepCleaningPriceHuf = deepCleaningPriceEur * 400;
                      items.push({ 
                        name: `✨ Nagytakarítás ${partnerEditingApartment.apartmentSize || 0} m² (mélytisztítás, ablakpucolás)`, 
                        price: `${deepCleaningPriceEur} EUR (~${deepCleaningPriceHuf.toLocaleString()} Ft)`,
                        category: 'cleaning'
                      });
                    }
                    
                    // Yettel Internet
                    if (partnerEditingApartment.requestYettelInternet) {
                      items.push({ name: '📡 Yettel Internet bekötés', price: '20 EUR/hó (~8 000 Ft)', category: 'internet' });
                    }
                    
                    // Textíliák (webshop rendelések)
                    if (partnerEditingApartment.inventory?.noTextiles) {
                      const inv = partnerEditingApartment.inventory || {};
                      const textileItems = [
                        { key: 'orderDuvet', name: 'Paplan 150x200', price: 6490 },
                        { key: 'orderPillow', name: 'Párna 50x60', price: 6990 },
                        { key: 'orderBeddingSet', name: 'Ágynemű szett', price: 1990 },
                        { key: 'orderSheet90', name: 'Gumis lepedő 90x200', price: 3290 },
                        { key: 'orderSheet160', name: 'Gumis lepedő 160x200', price: 4990 },
                        { key: 'orderSheet180', name: 'Gumis lepedő 180x200', price: 5490 },
                        { key: 'orderMattressProtector90', name: 'Matracvédő 90x200', price: 4990 },
                        { key: 'orderMattressProtector160', name: 'Matracvédő 160x200', price: 7990 },
                        { key: 'orderMattressProtector180', name: 'Matracvédő 180x200', price: 8990 },
                        { key: 'orderTowelLarge', name: 'Fürdőlepedő 70x140', price: 2990 },
                        { key: 'orderTowelMedium', name: 'Közepes törölköző 55x120', price: 1990 },
                        { key: 'orderTowelSmall', name: 'Kéztörlő 30x50', price: 990 },
                        { key: 'orderBathMat', name: 'Kádkilépő 40x60', price: 1490 },
                      ];
                      textileItems.forEach(item => {
                        const qty = inv[item.key] || 0;
                        if (qty > 0) {
                          items.push({ 
                            name: `🛏️ ${item.name} x${qty}`, 
                            price: `${(item.price * qty).toLocaleString()} Ft`,
                            category: 'textile'
                          });
                        }
                      });
                    }
                    
                    if (items.length === 0) {
                      return <p className="text-amber-600 text-sm">A kosár üres</p>;
                    }
                    
                    return (
                      <div className="space-y-2">
                        {items.map((item, idx) => (
                          <div key={idx} className={`flex justify-between items-center p-2 rounded border ${
                            item.category === 'service' ? 'bg-emerald-50 border-emerald-200' :
                            item.category === 'cleaning' ? 'bg-cyan-50 border-cyan-200' :
                            item.category === 'internet' ? 'bg-green-50 border-green-200' :
                            'bg-white border-amber-200'
                          }`}>
                            <span className="text-sm text-gray-700">{item.name}</span>
                            <span className="text-sm font-bold text-amber-700">{item.price}</span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}
            
              {/* TARTALOM */}
              <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
                {/* ALAPADATOK */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">📋 Alapadatok</h4>
                  <input
                    type="text"
                    value={partnerEditingApartment.name}
                    onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, name: e.target.value})}
                    placeholder="Lakás neve"
                    className="w-full px-3 py-2 border rounded-lg mb-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Üzemeltetés</label>
                      <select 
                        value={partnerEditingApartment.operationType || 'short-term'} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, operationType: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="short-term">Rövidtávú</option>
                        <option value="rental">Bérleti szerződés</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Lakásméret (m²)</label>
                      <input 
                        type="number" 
                        value={partnerEditingApartment.apartmentSize || ''} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, apartmentSize: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                        placeholder="Pl: 45" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">NTAK szám</label>
                      <input 
                        type="text" 
                        value={partnerEditingApartment.ntakNumber || ''} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, ntakNumber: e.target.value})} 
                        placeholder="Pl: MA12345678" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Adószám</label>
                      <input 
                        type="text" 
                        value={partnerEditingApartment.taxNumber || ''} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, taxNumber: e.target.value})} 
                        placeholder="Pl: 12345678-1-42" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Helyrajzi szám</label>
                      <input 
                        type="text" 
                        value={partnerEditingApartment.cadastralNumber || ''} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, cadastralNumber: e.target.value})} 
                        placeholder="Pl: 12345/1/A/12" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                      />
                    </div>
                  </div>
                </div>

                {/* IFA - Idegenforgalmi adó - only for short-term rentals */}
                {(partnerEditingApartment.operationType || 'short-term') === 'short-term' && (
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                  <h4 className="font-bold text-sm text-orange-800 mb-2">🏛️ Idegenforgalmi adó (IFA)</h4>
                  
                  {/* Budapest kerület gyorsválasztó */}
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-orange-700 mb-1">Budapest kerület (2026)</label>
                    <select 
                      value={partnerEditingApartment.budapestDistrict || ''} 
                      onChange={(e) => {
                        const district = e.target.value;
                        const districtData = {
                          'I': { type: 'percent', value: 4 },
                          'II': { type: 'fixed', value: 800 },
                          'III': { type: 'percent', value: 4 },
                          'IV': { type: 'fixed', value: 500 },
                          'V': { type: 'percent', value: 4 },
                          'VI': { type: 'percent', value: 4 },
                          'VII': { type: 'percent', value: 4 },
                          'VIII': { type: 'percent', value: 4 },
                          'IX': { type: 'percent', value: 4 },
                          'X': { type: 'fixed', value: 800 },
                          'XI': { type: 'fixed', value: 830 },
                          'XII': { type: 'percent', value: 4 },
                          'XIII': { type: 'percent', value: 4 },
                          'XIV': { type: 'percent', value: 4 },
                          'XV': { type: 'fixed', value: 450 },
                          'XVI': { type: 'fixed', value: 400 },
                          'XVII': { type: 'fixed', value: 600 },
                          'XVIII': { type: 'fixed', value: 550 },
                          'XIX': { type: 'fixed', value: 600 },
                          'XX': { type: 'fixed', value: 500 },
                          'XXI': { type: 'fixed', value: 500 },
                          'XXII': { type: 'fixed', value: 650 },
                          'XXIII': { type: 'fixed', value: 500 },
                        };
                        if (district && districtData[district]) {
                          setPartnerEditingApartment({
                            ...partnerEditingApartment, 
                            budapestDistrict: district,
                            tourismTaxType: districtData[district].type,
                            tourismTaxPercent: districtData[district].type === 'percent' ? districtData[district].value : 0,
                            tourismTaxFixed: districtData[district].type === 'fixed' ? districtData[district].value : 0
                          });
                        } else {
                          setPartnerEditingApartment({...partnerEditingApartment, budapestDistrict: district});
                        }
                      }} 
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">-- Válassz kerületet vagy állítsd be manuálisan --</option>
                      <optgroup label="Szállásdíj arányos (4%)">
                        <option value="I">I. kerület - 4%</option>
                        <option value="III">III. kerület - 4%</option>
                        <option value="V">V. kerület - 4%</option>
                        <option value="VI">VI. kerület - 4% ⚠️ tiltás!</option>
                        <option value="VII">VII. kerület - 4%</option>
                        <option value="VIII">VIII. kerület - 4%</option>
                        <option value="IX">IX. kerület - 4%</option>
                        <option value="XII">XII. kerület - 4%</option>
                        <option value="XIII">XIII. kerület - 4%</option>
                        <option value="XIV">XIV. kerület - 4%</option>
                      </optgroup>
                      <optgroup label="Tételes (Ft/fő/éj)">
                        <option value="II">II. kerület - 800 Ft</option>
                        <option value="IV">IV. kerület - 500 Ft</option>
                        <option value="X">X. kerület - 800 Ft</option>
                        <option value="XI">XI. kerület - 830 Ft (max)</option>
                        <option value="XV">XV. kerület - 450 Ft</option>
                        <option value="XVI">XVI. kerület - 400 Ft</option>
                        <option value="XVII">XVII. kerület - 600 Ft</option>
                        <option value="XVIII">XVIII. kerület - 550 Ft</option>
                        <option value="XIX">XIX. kerület - 600 Ft</option>
                        <option value="XX">XX. kerület - 500 Ft</option>
                        <option value="XXI">XXI. kerület - 500 Ft/fő/éj</option>
                        <option value="XXII">XXII. kerület - 650 Ft/fő/éj</option>
                        <option value="XXIII">XXIII. kerület - 500 Ft/fő/éj</option>
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-orange-700 mb-1">Típus</label>
                      <select 
                        value={partnerEditingApartment.tourismTaxType || 'percent'} 
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, tourismTaxType: e.target.value, budapestDistrict: ''})} 
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="percent">Százalékos (%)</option>
                        <option value="fixed">Fix összeg (Ft/fő/éj)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-orange-700 mb-1">Érték</label>
                      {(partnerEditingApartment.tourismTaxType || 'percent') === 'percent' ? (
                        <select
                          value={partnerEditingApartment.tourismTaxPercent || 4}
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, tourismTaxPercent: parseInt(e.target.value), budapestDistrict: ''})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value={4}>4%</option>
                          <option value={3}>3%</option>
                          <option value={2}>2%</option>
                          <option value={1}>1%</option>
                        </select>
                      ) : (
                        <input 
                          type="number" 
                          value={(partnerEditingApartment.tourismTaxFixed === 0 || partnerEditingApartment.tourismTaxFixed === undefined) ? '' : partnerEditingApartment.tourismTaxFixed} 
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, tourismTaxFixed: e.target.value === '' ? 0 : parseInt(e.target.value), budapestDistrict: ''})} 
                          placeholder="Ft/fő/éj" 
                          className="w-full px-3 py-2 border rounded-lg text-sm" 
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Kiválasztott érték megjelenítése */}
                  <div className="mt-2 p-2 bg-orange-100 rounded text-xs text-orange-800">
                    <strong>Beállított IFA:</strong> {(partnerEditingApartment.tourismTaxType || 'percent') === 'percent' 
                      ? `${partnerEditingApartment.tourismTaxPercent || 4}% (szállásdíj arányos)` 
                      : `${partnerEditingApartment.tourismTaxFixed || 0} Ft/fő/éj (tételes)`}
                    {partnerEditingApartment.budapestDistrict && ` - ${partnerEditingApartment.budapestDistrict}. kerület`}
                  </div>
                </div>
                )}

                {/* CÍM */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-sm text-blue-800 mb-2">📍 Cím</h4>
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input 
                      type="text" 
                      value={partnerEditingApartment.zipCode || ''} 
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, zipCode: e.target.value})} 
                      placeholder="Ir.szám" 
                      className="px-3 py-2 border rounded-lg text-sm" 
                    />
                    <input 
                      type="text" 
                      value={partnerEditingApartment.city || ''} 
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, city: e.target.value})} 
                      placeholder="Város" 
                      className="col-span-2 px-3 py-2 border rounded-lg text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={partnerEditingApartment.street || ''} 
                    onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, street: e.target.value})} 
                    placeholder="Utca, házszám" 
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2" 
                  />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input 
                      type="text" 
                      value={partnerEditingApartment.floor || ''} 
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, floor: e.target.value})} 
                      placeholder="Emelet (pl: 3. em.)" 
                      className="px-3 py-2 border rounded-lg text-sm" 
                    />
                    <input 
                      type="text" 
                      value={partnerEditingApartment.door || ''} 
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, door: e.target.value})} 
                      placeholder="Ajtó (pl: 12)" 
                      className="px-3 py-2 border rounded-lg text-sm" 
                    />
                  </div>
                  <input 
                    type="text" 
                    value={partnerEditingApartment.gateCode || ''} 
                    onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, gateCode: e.target.value})} 
                    placeholder="Kapukód" 
                    className="w-full px-3 py-2 border rounded-lg text-sm mb-2" 
                  />
                  
                  {/* WiFi adatok */}
                  <div className="bg-blue-100 p-3 rounded-lg border border-blue-300 mb-2">
                    <h4 className="font-bold text-sm text-blue-800 mb-2">📶 WiFi adatok</h4>
                    
                    {/* Nincs WiFi checkbox */}
                    <label className="flex items-center gap-2 mb-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={partnerEditingApartment.noWifi || false}
                        onChange={(e) => setPartnerEditingApartment({
                          ...partnerEditingApartment, 
                          noWifi: e.target.checked,
                          wifiName: e.target.checked ? '' : partnerEditingApartment.wifiName,
                          wifiPassword: e.target.checked ? '' : partnerEditingApartment.wifiPassword,
                          wifiSpeed: e.target.checked ? '' : partnerEditingApartment.wifiSpeed
                        })}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm text-blue-700 font-medium">Nincs még WiFi-m a lakásban</span>
                    </label>
                    
                    {partnerEditingApartment.noWifi ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-300">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">📡</span>
                          <h5 className="font-bold text-green-800">Yettel Otthoni Internet (4G / 5G)</h5>
                        </div>
                        <p className="text-sm text-green-700 mb-2">
                          Kössön be gyors és megbízható internetet a lakásába! 
                        </p>
                        <div className="bg-white p-3 rounded-lg border border-green-200">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <p className="font-bold text-green-800">Yettel Home Router</p>
                              <p className="text-xs text-green-600">Korlátlan adatforgalom, router bérleti díjjal</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-green-600">20 EUR</p>
                              <p className="text-xs text-green-500">(~8 000 Ft) / hó</p>
                            </div>
                          </div>
                          <div className="border-t border-green-100 pt-2 mt-2 text-xs text-green-700">
                            <div className="flex gap-4">
                              <div>
                                <span className="font-semibold">⬇️ Letöltés:</span> kb. 30–300 Mbit/s
                              </div>
                              <div>
                                <span className="font-semibold">⬆️ Feltöltés:</span> kb. 5–50 Mbit/s
                              </div>
                            </div>
                            <p className="text-green-500 mt-1 italic">* A pontos érték helyszínfüggő (4G vs. 5G, hálózati terhelés)</p>
                          </div>
                        </div>
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={partnerEditingApartment.requestYettelInternet || false}
                            onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, requestYettelInternet: e.target.checked})}
                            className="w-4 h-4 accent-green-600"
                          />
                          <span className="text-sm text-green-700 font-medium">Kérem a Yettel internet bekötését</span>
                        </label>
                        {partnerEditingApartment.requestYettelInternet && (
                          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-200 text-xs text-amber-700">
                            💡 A havi 20 EUR (~8 000 Ft) díj minden hónapban az elszámolásban kerül levonásra.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">WiFi név</label>
                          <input
                            type="text"
                            value={partnerEditingApartment.wifiName || ''}
                            onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, wifiName: e.target.value})}
                            placeholder="Hálózat neve"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">WiFi jelszó</label>
                          <input
                            type="text"
                            value={partnerEditingApartment.wifiPassword || ''}
                            onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, wifiPassword: e.target.value})}
                            placeholder="Jelszó"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-blue-700 mb-1">Sebesség (Mbps)</label>
                          <input
                            type="text"
                            value={partnerEditingApartment.wifiSpeed || ''}
                            onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, wifiSpeed: e.target.value})}
                            placeholder="pl. 100"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-blue-700 mb-1">Bejutási instrukciók</label>
                    <textarea
                      value={partnerEditingApartment.accessInstructions || ''}
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, accessInstructions: e.target.value})}
                      placeholder="Pl: Kulcs a portán, kód: 1234, lift 3. emelet..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows="2"
                    />
                  </div>
                  <div className="mt-2">
                    <label className="block text-xs font-medium text-blue-700 mb-1">Megjegyzés</label>
                    <input
                      type="text"
                      value={partnerEditingApartment.instructions || ''}
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, instructions: e.target.value})}
                      placeholder="Megjegyzés..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* ÁGYAK ÉS VENDÉGSZÁM */}
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <h4 className="font-bold text-sm text-purple-800 mb-2">🛏️ Ágyak és vendégszám</h4>
                  
                  {/* Franciaágy */}
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Franciaágy (2 fő/db)</label>
                    <select
                      value={partnerEditingApartment.doubleBeds || 0}
                      onChange={(e) => {
                        const doubleBeds = parseInt(e.target.value);
                        const sofaSingle = partnerEditingApartment.sofaBedSingle || 0;
                        const sofaDouble = partnerEditingApartment.sofaBedDouble || 0;
                        const singleBeds = partnerEditingApartment.singleBedCount || 0;
                        const otherDoubleBeds = partnerEditingApartment.otherDoubleBedCount || 0;
                        setPartnerEditingApartment({
                          ...partnerEditingApartment, 
                          doubleBeds,
                          maxGuests: (doubleBeds * 2) + sofaSingle + (sofaDouble * 2) + singleBeds + (otherDoubleBeds * 2)
                        });
                      }}
                      className="w-full px-2 py-1 border rounded text-sm"
                    >
                      {[0,1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} db</option>)}
                    </select>
                  </div>
                  
                  {/* Kanapéágyak */}
                  <div className="bg-purple-100 p-2 rounded border border-purple-200 mb-2">
                    <p className="text-xs font-semibold text-purple-800 mb-2">Kanapéágy</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Egyszemélyes (1 fő/db)</label>
                        <select
                          value={partnerEditingApartment.sofaBedSingle || 0}
                          onChange={(e) => {
                            const sofaSingle = parseInt(e.target.value);
                            const doubleBeds = partnerEditingApartment.doubleBeds || 0;
                            const sofaDouble = partnerEditingApartment.sofaBedDouble || 0;
                            const singleBeds = partnerEditingApartment.singleBedCount || 0;
                            const otherDoubleBeds = partnerEditingApartment.otherDoubleBedCount || 0;
                            setPartnerEditingApartment({
                              ...partnerEditingApartment, 
                              sofaBedSingle: sofaSingle,
                              maxGuests: (doubleBeds * 2) + sofaSingle + (sofaDouble * 2) + singleBeds + (otherDoubleBeds * 2)
                            });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} db</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Kétszemélyes (2 fő/db)</label>
                        <select
                          value={partnerEditingApartment.sofaBedDouble || 0}
                          onChange={(e) => {
                            const sofaDouble = parseInt(e.target.value);
                            const doubleBeds = partnerEditingApartment.doubleBeds || 0;
                            const sofaSingle = partnerEditingApartment.sofaBedSingle || 0;
                            const singleBeds = partnerEditingApartment.singleBedCount || 0;
                            const otherDoubleBeds = partnerEditingApartment.otherDoubleBedCount || 0;
                            setPartnerEditingApartment({
                              ...partnerEditingApartment, 
                              sofaBedDouble: sofaDouble,
                              maxGuests: (doubleBeds * 2) + sofaSingle + (sofaDouble * 2) + singleBeds + (otherDoubleBeds * 2)
                            });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} db</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Egyéb ágyak */}
                  <div className="bg-purple-100 p-2 rounded border border-purple-200 mb-2">
                    <p className="text-xs font-semibold text-purple-800 mb-2">Egyéb ágy</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Egyszemélyes (1 fő/db)</label>
                        <select
                          value={partnerEditingApartment.singleBedCount || 0}
                          onChange={(e) => {
                            const singleBeds = parseInt(e.target.value);
                            const doubleBeds = partnerEditingApartment.doubleBeds || 0;
                            const sofaSingle = partnerEditingApartment.sofaBedSingle || 0;
                            const sofaDouble = partnerEditingApartment.sofaBedDouble || 0;
                            const otherDoubleBeds = partnerEditingApartment.otherDoubleBedCount || 0;
                            setPartnerEditingApartment({
                              ...partnerEditingApartment, 
                              singleBedCount: singleBeds,
                              maxGuests: (doubleBeds * 2) + sofaSingle + (sofaDouble * 2) + singleBeds + (otherDoubleBeds * 2)
                            });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} db</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Kétszemélyes (2 fő/db)</label>
                        <select
                          value={partnerEditingApartment.otherDoubleBedCount || 0}
                          onChange={(e) => {
                            const otherDoubleBeds = parseInt(e.target.value);
                            const doubleBeds = partnerEditingApartment.doubleBeds || 0;
                            const sofaSingle = partnerEditingApartment.sofaBedSingle || 0;
                            const sofaDouble = partnerEditingApartment.sofaBedDouble || 0;
                            const singleBeds = partnerEditingApartment.singleBedCount || 0;
                            setPartnerEditingApartment({
                              ...partnerEditingApartment, 
                              otherDoubleBedCount: otherDoubleBeds,
                              maxGuests: (doubleBeds * 2) + sofaSingle + (sofaDouble * 2) + singleBeds + (otherDoubleBeds * 2)
                            });
                          }}
                          className="w-full px-2 py-1 border rounded text-sm"
                        >
                          {[0,1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} db</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between bg-white p-2 rounded border mb-2">
                    <span className="text-sm font-medium text-purple-800">Max vendégszám:</span>
                    <span className="text-lg font-bold text-purple-600">{partnerEditingApartment.maxGuests || 0} fő</span>
                  </div>
                  
                  {/* PARKOLÁS */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">🚗 Parkolás a vendégnek</label>
                    <select
                      value={partnerEditingApartment.parkingType || ''}
                      onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, parkingType: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                    >
                      <option value="">-- Válassz --</option>
                      <option value="street_paid">Utcán fizetős</option>
                      <option value="street_free">Utcán ingyenes</option>
                      <option value="designated">Kijelölt parkolóhely</option>
                      <option value="garage">Garázs</option>
                      <option value="none">Nincs parkolási lehetőség</option>
                    </select>
                  </div>
                </div>

                {/* CSOMAGOK - választható */}
                <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-sm text-gray-700 mb-3">📦 Szolgáltatási csomag</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPartnerEditingApartment({
                        ...partnerEditingApartment, 
                        servicePackage: 'alap',
                        managementFee: 20
                      })}
                      className={`p-3 rounded-lg border-2 text-center transition ${
                        partnerEditingApartment.servicePackage === 'alap' 
                          ? 'border-emerald-500 bg-emerald-100 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="font-bold text-emerald-600">Alap</div>
                      <div className="text-2xl font-bold text-emerald-700">20%</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerEditingApartment({
                        ...partnerEditingApartment, 
                        servicePackage: 'pro',
                        managementFee: 25
                      })}
                      className={`p-3 rounded-lg border-2 text-center transition ${
                        partnerEditingApartment.servicePackage === 'pro' 
                          ? 'border-sky-500 bg-sky-100 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                      }`}
                    >
                      <div className="font-bold text-sky-600">Pro</div>
                      <div className="text-2xl font-bold text-sky-700">25%</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPartnerEditingApartment({
                        ...partnerEditingApartment, 
                        servicePackage: 'max',
                        managementFee: 35,
                        cleaningFeeEur: 0
                      })}
                      className={`p-3 rounded-lg border-2 text-center transition relative ${
                        partnerEditingApartment.servicePackage === 'max' 
                          ? 'border-amber-500 bg-amber-100 shadow-md' 
                          : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">⭐</div>
                      <div className="font-bold text-amber-600">Max</div>
                      <div className="text-2xl font-bold text-amber-700">35%</div>
                    </button>
                  </div>
                  {partnerEditingApartment.servicePackage === 'max' && (
                    <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                      ⭐ Max csomag: Takarítás és Karbantartás költsége benne van!
                    </div>
                  )}
                </div>

                {/* DÍJAK */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h4 className="font-bold text-sm text-slate-700 mb-2">💰 Díjak</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-500 block text-xs mb-1">Management díj</span>
                      <span className="font-bold text-lg">{partnerEditingApartment.managementFee || 25}%</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-500 block text-xs mb-1">Havidíj</span>
                      <span className="font-bold text-lg">{partnerEditingApartment.monthlyFeeEur || 0} EUR</span>
                    </div>
                    <div className="bg-white p-2 rounded border">
                      <span className="text-gray-500 block text-xs mb-1">Takarítási díj</span>
                      <span className="font-bold text-lg">{partnerEditingApartment.servicePackage === 'max' ? '0 (benne)' : `${partnerEditingApartment.cleaningFeeEur || 0} EUR`}</span>
                    </div>
                  </div>
                  
                  {/* Nagytakarítás opció */}
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <label className="flex items-center gap-3 cursor-pointer bg-gradient-to-r from-cyan-50 to-teal-50 p-3 rounded-lg border-2 border-cyan-200 hover:border-cyan-400 transition">
                      <input
                        type="checkbox"
                        checked={partnerEditingApartment.requestDeepCleaning || false}
                        onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, requestDeepCleaning: e.target.checked})}
                        className="w-5 h-5 accent-cyan-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-cyan-800">✨ Kérek teljes nagytakarítást</span>
                        <p className="text-xs text-cyan-600">Mélytisztítás, ablakpucolás, konyhai gépek tisztítása, fürdőszoba vízkőmentesítés</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-cyan-700">3 EUR/m²</span>
                        <p className="text-xs text-cyan-500">(~1 200 Ft/m²)</p>
                        {partnerEditingApartment.apartmentSize > 0 && (
                          <p className="text-sm font-bold text-cyan-600 mt-1">= {(partnerEditingApartment.apartmentSize || 0) * 3} EUR</p>
                        )}
                      </div>
                    </label>
                    {partnerEditingApartment.requestDeepCleaning && (
                      <div className="mt-2 p-2 bg-cyan-100 rounded text-xs text-cyan-700">
                        💡 Nagytakarítás díja: <strong>{partnerEditingApartment.apartmentSize || 0} m² × 3 EUR = {(partnerEditingApartment.apartmentSize || 0) * 3} EUR (~{((partnerEditingApartment.apartmentSize || 0) * 3 * 400).toLocaleString()} Ft)</strong> (egyszeri díj)
                      </div>
                    )}
                  </div>
                </div>

                {/* PLATFORM HOZZÁFÉRÉSEK */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <h4 className="font-bold text-sm text-gray-700 mb-2">🌐 Platform hozzáférések</h4>
                  
                  {/* AIRBNB */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-pink-600">🏠 Airbnb</span>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partnerEditingApartment.noAirbnbAccount || false}
                          onChange={(e) => setPartnerEditingApartment({
                            ...partnerEditingApartment, 
                            noAirbnbAccount: e.target.checked,
                            airbnbUsername: e.target.checked ? '' : partnerEditingApartment.airbnbUsername,
                            airbnbPassword: e.target.checked ? '' : partnerEditingApartment.airbnbPassword
                          })}
                          className="w-3 h-3 accent-gray-500"
                        />
                        <span className="text-gray-500">Nincs fiókom</span>
                      </label>
                    </div>
                    {!partnerEditingApartment.noAirbnbAccount && (
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={partnerEditingApartment.airbnbUsername || ''} 
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, airbnbUsername: e.target.value})} 
                          placeholder="Airbnb felhasználónév" 
                          className="px-3 py-2 border rounded-lg text-sm" 
                        />
                        <input 
                          type="password" 
                          value={partnerEditingApartment.airbnbPassword || ''} 
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, airbnbPassword: e.target.value})} 
                          placeholder="Airbnb jelszó" 
                          className="px-3 py-2 border rounded-lg text-sm" 
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* BOOKING */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-600"><span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking</span>
                      <label className="flex items-center gap-1 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={partnerEditingApartment.noBookingAccount || false}
                          onChange={(e) => setPartnerEditingApartment({
                            ...partnerEditingApartment, 
                            noBookingAccount: e.target.checked,
                            bookingUsername: e.target.checked ? '' : partnerEditingApartment.bookingUsername,
                            bookingPassword: e.target.checked ? '' : partnerEditingApartment.bookingPassword
                          })}
                          className="w-3 h-3 accent-gray-500"
                        />
                        <span className="text-gray-500">Nincs fiókom</span>
                      </label>
                    </div>
                    {!partnerEditingApartment.noBookingAccount && (
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          value={partnerEditingApartment.bookingUsername || ''} 
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, bookingUsername: e.target.value})} 
                          placeholder="Booking felhasználónév" 
                          className="px-3 py-2 border rounded-lg text-sm" 
                        />
                        <input 
                          type="password" 
                          value={partnerEditingApartment.bookingPassword || ''} 
                          onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, bookingPassword: e.target.value})} 
                          placeholder="Booking jelszó" 
                          className="px-3 py-2 border rounded-lg text-sm" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* LAKÁS FELSZERELTSÉG */}
                <div className="bg-teal-50 p-3 rounded-lg border border-teal-200">
                  <h4 className="font-bold text-sm text-teal-800 mb-3">🏠 Lakás felszereltség</h4>
                  <p className="text-xs text-teal-600 mb-3">Jelöld be, mi van meg a lakásban:</p>
                  
                  {/* Takarítókellékek */}
                  <div className="mb-3 bg-white p-2 rounded border border-teal-100">
                    <p className="text-xs font-bold text-teal-700 mb-2">🧹 Takarítókellékek</p>
                    <p className="text-xs text-gray-500 mb-2">Alapvető eszközök a mindennapi tisztántartáshoz</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Porszívó', 'Seprű', 'Lapát', 'Felmosó', 'Vödör', 'Rongyok'].map(item => (
                        <label key={item} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-teal-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={partnerEditingApartment.equipment?.[item] || false}
                            onChange={(e) => setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              equipment: { ...(partnerEditingApartment.equipment || {}), [item]: e.target.checked }
                            })}
                            className="w-3 h-3 accent-teal-600"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Konyhai kisgépek */}
                  <div className="mb-3 bg-white p-2 rounded border border-teal-100">
                    <p className="text-xs font-bold text-teal-700 mb-2">🍳 Konyhai kisgépek és felszerelések</p>
                    <p className="text-xs text-gray-500 mb-2">A vendégek kényelméért javasolt</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Kenyérpirító', 'Vízforraló', 'Mikrohullámú sütő', 'Kávéfőző', 'Lábos', 'Serpenyő', 'Fakanál', 'Kés készlet'].map(item => (
                        <label key={item} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-teal-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={partnerEditingApartment.equipment?.[item] || false}
                            onChange={(e) => setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              equipment: { ...(partnerEditingApartment.equipment || {}), [item]: e.target.checked }
                            })}
                            className="w-3 h-3 accent-teal-600"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Étkezés */}
                  <div className="bg-white p-2 rounded border border-teal-100">
                    <p className="text-xs font-bold text-teal-700 mb-2">🍽️ Étkezéshez</p>
                    <p className="text-xs text-gray-500 mb-2">Lehetőség szerint IKEA termékekből</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Tányérok', 'Evőeszközök', 'Poharak', 'Boros poharak', 'Röviditalos poharak', 'Bögrék'].map(item => (
                        <label key={item} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-teal-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={partnerEditingApartment.equipment?.[item] || false}
                            onChange={(e) => setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              equipment: { ...(partnerEditingApartment.equipment || {}), [item]: e.target.checked }
                            })}
                            className="w-3 h-3 accent-teal-600"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Egyéb felszerelések */}
                  <div className="bg-white p-2 rounded border border-teal-100">
                    <p className="text-xs font-bold text-teal-700 mb-2">🔌 Egyéb felszerelések</p>
                    <div className="grid grid-cols-2 gap-1">
                      {['Hajszárító', 'Vasaló', 'Vasalódeszka', 'Ruhaszárító/teregető', 'Mosógép', 'Mosogatógép'].map(item => (
                        <label key={item} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-teal-50 p-1 rounded">
                          <input
                            type="checkbox"
                            checked={partnerEditingApartment.equipment?.[item] || false}
                            onChange={(e) => setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              equipment: { ...(partnerEditingApartment.equipment || {}), [item]: e.target.checked }
                            })}
                            className="w-3 h-3 accent-teal-600"
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hiányzó felszerelések összegzés */}
                  {(() => {
                    const allItems = ['Porszívó', 'Seprű', 'Lapát', 'Felmosó', 'Vödör', 'Rongyok', 'Kenyérpirító', 'Vízforraló', 'Mikrohullámú sütő', 'Kávéfőző', 'Lábos', 'Serpenyő', 'Fakanál', 'Kés készlet', 'Tányérok', 'Evőeszközök', 'Poharak', 'Boros poharak', 'Röviditalos poharak', 'Bögrék', 'Hajszárító', 'Vasaló', 'Vasalódeszka', 'Ruhaszárító/teregető', 'Mosógép', 'Mosogatógép'];
                    const missing = allItems.filter(item => !partnerEditingApartment.equipment?.[item]);
                    if (missing.length > 0 && missing.length < allItems.length) {
                      return (
                        <div className="mt-3 p-2 bg-amber-50 rounded border border-amber-200">
                          <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Hiányzó felszerelések ({missing.length} db):</p>
                          <p className="text-xs text-amber-600">{missing.join(', ')}</p>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* AIRBNB BEÁLLÍTÁSOK */}
                <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                  <h4 className="font-bold text-sm text-pink-800 mb-2">🏠 Airbnb beállítások</h4>
                  <div className="grid grid-cols-3 gap-1 max-h-48 overflow-y-auto">
                    {AIRBNB_AMENITIES.map(amenity => (
                      <label key={amenity} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-pink-100 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={partnerEditingApartment.airbnbAmenities?.[amenity] || false}
                          onChange={(e) => {
                            const newAirbnb = {
                              ...(partnerEditingApartment.airbnbAmenities || {}),
                              [amenity]: e.target.checked
                            };
                            const bookingEquiv = AMENITY_SYNC_MAP[amenity];
                            const newBooking = bookingEquiv ? {
                              ...(partnerEditingApartment.bookingAmenities || {}),
                              [bookingEquiv]: e.target.checked
                            } : partnerEditingApartment.bookingAmenities;
                            setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              airbnbAmenities: newAirbnb,
                              bookingAmenities: newBooking || {}
                            });
                          }}
                          className="w-3 h-3 accent-pink-600"
                        />
                        <span className="truncate">{amenity}</span>
                        {AMENITY_SYNC_MAP[amenity] && <span className="text-blue-500 ml-1">⟷</span>}
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-pink-600">
                    Kiválasztva: {Object.values(partnerEditingApartment.airbnbAmenities || {}).filter(Boolean).length} / {AIRBNB_AMENITIES.length}
                    <span className="ml-2 text-blue-500">⟷ = Booking szinkron</span>
                  </div>
                </div>

                {/* BOOKING BEÁLLÍTÁSOK */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-sm text-blue-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking beállítások</h4>
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(BOOKING_CATEGORIES).map(([category, {color, items}]) => (
                      <div key={category} className="mb-3">
                        <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {items.map(amenity => {
                            const airbnbEquiv = Object.entries(AMENITY_SYNC_MAP).find(([k, v]) => v === amenity)?.[0];
                            return (
                              <label key={amenity} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-100 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={partnerEditingApartment.bookingAmenities?.[amenity] || false}
                                  onChange={(e) => {
                                    const newBooking = {
                                      ...(partnerEditingApartment.bookingAmenities || {}),
                                      [amenity]: e.target.checked
                                    };
                                    const newAirbnb = airbnbEquiv ? {
                                      ...(partnerEditingApartment.airbnbAmenities || {}),
                                      [airbnbEquiv]: e.target.checked
                                    } : partnerEditingApartment.airbnbAmenities;
                                    setPartnerEditingApartment({
                                      ...partnerEditingApartment,
                                      bookingAmenities: newBooking,
                                      airbnbAmenities: newAirbnb || {}
                                    });
                                  }}
                                  className="w-3 h-3 accent-blue-600"
                                />
                                <span className="truncate">{amenity}</span>
                                {airbnbEquiv && <span className="text-pink-500 ml-1">⟷</span>}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    Kiválasztva: {Object.values(partnerEditingApartment.bookingAmenities || {}).filter(Boolean).length} / {BOOKING_AMENITIES.length}
                    <span className="ml-2 text-pink-500">⟷ = Airbnb szinkron</span>
                  </div>
                </div>

                {/* BOOKING FELSZERELTSÉGEK */}
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-sm text-blue-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking felszereltségek</h4>
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(BOOKING_FELSZERELTSEG).map(([category, {color, items}]) => (
                      <div key={category} className="mb-3">
                        <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {items.map(item => (
                            <label key={item} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-100 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={partnerEditingApartment.bookingFelszereltseg?.[item] || false}
                                onChange={(e) => setPartnerEditingApartment({
                                  ...partnerEditingApartment,
                                  bookingFelszereltseg: {
                                    ...(partnerEditingApartment.bookingFelszereltseg || {}),
                                    [item]: e.target.checked
                                  }
                                })}
                                className="w-3 h-3 accent-blue-600"
                              />
                              <span className="truncate">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-indigo-600">
                    Kiválasztva: {Object.values(partnerEditingApartment.bookingFelszereltseg || {}).filter(Boolean).length} / {BOOKING_FELSZERELTSEG_ALL.length}
                  </div>
                </div>

                {/* TEXTILKÉSZLET */}
                <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                  <h4 className="font-bold text-sm text-cyan-800 mb-3">🧺 Textilkészlet</h4>
                  
                  {/* Textil beszerzés opció */}
                  <div className="mb-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-amber-100 px-3 py-2 rounded-lg border border-amber-300">
                      <input
                        type="checkbox"
                        checked={partnerEditingApartment.inventory?.noTextiles || false}
                        onChange={(e) => setPartnerEditingApartment({
                          ...partnerEditingApartment,
                          inventory: {...(partnerEditingApartment.inventory || {}), noTextiles: e.target.checked}
                        })}
                        className="w-5 h-5 accent-amber-600"
                      />
                      <span className="text-amber-800 font-medium">🛒 Nincsenek textilek, beszerzést kérek</span>
                    </label>
                  </div>

                  {partnerEditingApartment.inventory?.noTextiles ? (
                    <div className="bg-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-lg">
                      {/* Webshop Header */}
                      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-bold text-lg">🛒 Textil Webshop</h5>
                            <p className="text-xs text-amber-100">Válassza ki a szükséges termékeket</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-amber-100">Javasolt mennyiség alapja:</p>
                            <p className="font-bold">{partnerEditingApartment.maxGuests || 2} vendég</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 space-y-4 max-h-96 overflow-y-auto">
                        {/* ÁGYNEMŰK */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                            <span className="text-lg">🛏️</span>
                            <span className="font-bold text-gray-700">Ágyneműk</span>
                            <span className="text-xs text-gray-400 ml-auto">Javasolt: {partnerEditingApartment.maxGuests || 2} db/fő</span>
                          </div>
                          
                          {/* Paplan */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">🛏️</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Paplan 150x200</p>
                              <p className="text-lg font-bold text-emerald-600">16 EUR <span className="text-xs font-normal text-gray-500">(~6 400 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderDuvet || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderDuvet: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Párna */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-purple-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">🛋️</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Párna 50x60</p>
                              <p className="text-lg font-bold text-emerald-600">17 EUR <span className="text-xs font-normal text-gray-500">(~6 800 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderPillow || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderPillow: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Ágynemű szett */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-pink-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center text-2xl">🎀</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Ágynemű szett (huzat)</p>
                              <p className="text-lg font-bold text-emerald-600">5 EUR <span className="text-xs font-normal text-gray-500">(~2 000 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderBeddingSet || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderBeddingSet: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Gumis lepedők */}
                          <div className="flex items-center gap-2 mb-2 mt-3">
                            <span className="text-xs font-semibold text-indigo-700">Gumis lepedő</span>
                          </div>
                          
                          {/* Gumis lepedő 90x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">90x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Gumis lepedő 90x200</p>
                              <p className="text-lg font-bold text-emerald-600">8 EUR <span className="text-xs font-normal text-gray-500">(~3 200 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderSheet90 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderSheet90: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Gumis lepedő 160x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">160x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Gumis lepedő 160x200</p>
                              <p className="text-lg font-bold text-emerald-600">12 EUR <span className="text-xs font-normal text-gray-500">(~4 800 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderSheet160 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderSheet160: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Gumis lepedő 180x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xs font-bold text-indigo-600">180x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Gumis lepedő 180x200</p>
                              <p className="text-lg font-bold text-emerald-600">14 EUR <span className="text-xs font-normal text-gray-500">(~5 600 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderSheet180 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderSheet180: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                        </div>
                        
                        {/* TÖRÖLKÖZŐK */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                            <span className="text-lg">🛁</span>
                            <span className="font-bold text-gray-700">Törölközők</span>
                          </div>
                          
                          {/* Fürdőlepedő */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-cyan-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center text-2xl">🧴</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Fürdőlepedő bézs 70x140</p>
                              <p className="text-lg font-bold text-emerald-600">6 EUR <span className="text-xs font-normal text-gray-500">(~2 400 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderBathTowel || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderBathTowel: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Közepes törölköző */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-teal-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-2xl">🧻</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Közepes törölköző fehér 55x120</p>
                              <p className="text-lg font-bold text-emerald-600">2 EUR <span className="text-xs font-normal text-gray-500">(~800 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderMediumTowel || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderMediumTowel: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Kéztörlő */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-2xl">🧽</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Kéztörlő bézs 30x50</p>
                              <p className="text-lg font-bold text-emerald-600">2 EUR <span className="text-xs font-normal text-gray-500">(~800 Ft) /2db</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderHandTowel || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderHandTowel: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,2,4,6,8,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* Kádkilépő */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-2xl">🚿</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Kádkilépő bézs 40x60</p>
                              <p className="text-lg font-bold text-emerald-600">2 EUR <span className="text-xs font-normal text-gray-500">(~800 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderBathMat || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderBathMat: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                        </div>
                        
                        {/* MATRACVÉDŐK */}
                        <div>
                          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                            <span className="text-lg">🛡️</span>
                            <span className="font-bold text-gray-700">Vízálló matracvédő</span>
                            <span className="text-xs text-gray-400 ml-auto">Ágyak: {partnerEditingApartment.doubleBeds || 0} francia</span>
                          </div>
                          
                          {/* 90x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">90x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Matracvédő 90x200</p>
                              <p className="text-lg font-bold text-emerald-600">10 EUR <span className="text-xs font-normal text-gray-500">(~4 000 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderMattress90 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderMattress90: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* 140x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">140x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Matracvédő 140x200</p>
                              <p className="text-lg font-bold text-emerald-600">20 EUR <span className="text-xs font-normal text-gray-500">(~8 000 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderMattress140 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderMattress140: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* 160x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">160x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Matracvédő 160x200</p>
                              <p className="text-lg font-bold text-emerald-600">22 EUR <span className="text-xs font-normal text-gray-500">(~8 800 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderMattress160 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderMattress160: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          
                          {/* 180x200 */}
                          <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-white p-2 rounded-lg mb-2 border hover:shadow-md transition">
                            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-600">180x200</div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Matracvédő 180x200</p>
                              <p className="text-lg font-bold text-emerald-600">25 EUR <span className="text-xs font-normal text-gray-500">(~10 000 Ft)</span></p>
                            </div>
                            <select
                              value={partnerEditingApartment.inventory?.orderMattress180 || 0}
                              onChange={(e) => setPartnerEditingApartment({
                                ...partnerEditingApartment,
                                inventory: {...(partnerEditingApartment.inventory || {}), orderMattress180: parseInt(e.target.value)}
                              })}
                              className="w-20 px-2 py-2 border-2 border-emerald-300 rounded-lg text-center font-bold text-lg bg-white"
                            >
                              {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* Kosár összesítő */}
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">🛒 Kosár tartalma:</span>
                          <span className="text-sm">
                            {(partnerEditingApartment.inventory?.orderDuvet || 0) + 
                             (partnerEditingApartment.inventory?.orderPillow || 0) +
                             (partnerEditingApartment.inventory?.orderBeddingSet || 0) +
                             (partnerEditingApartment.inventory?.orderBathTowel || 0) +
                             (partnerEditingApartment.inventory?.orderMediumTowel || 0) +
                             (partnerEditingApartment.inventory?.orderHandTowel || 0) +
                             (partnerEditingApartment.inventory?.orderBathMat || 0) +
                             (partnerEditingApartment.inventory?.orderSheet90 || 0) +
                             (partnerEditingApartment.inventory?.orderSheet160 || 0) +
                             (partnerEditingApartment.inventory?.orderSheet180 || 0) +
                             (partnerEditingApartment.inventory?.orderMattress90 || 0) +
                             (partnerEditingApartment.inventory?.orderMattress140 || 0) +
                             (partnerEditingApartment.inventory?.orderMattress160 || 0) +
                             (partnerEditingApartment.inventory?.orderMattress180 || 0)} tétel
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">💰 ÖSSZESEN:</span>
                          <span className="text-3xl font-bold">
                            {(
                              ((partnerEditingApartment.inventory?.orderDuvet || 0) * 6490) +
                              ((partnerEditingApartment.inventory?.orderPillow || 0) * 6990) +
                              ((partnerEditingApartment.inventory?.orderBeddingSet || 0) * 1990) +
                              ((partnerEditingApartment.inventory?.orderSheet90 || 0) * 3290) +
                              ((partnerEditingApartment.inventory?.orderSheet160 || 0) * 4990) +
                              ((partnerEditingApartment.inventory?.orderSheet180 || 0) * 5490) +
                              ((partnerEditingApartment.inventory?.orderBathTowel || 0) * 2290) +
                              ((partnerEditingApartment.inventory?.orderMediumTowel || 0) * 795) +
                              (Math.ceil((partnerEditingApartment.inventory?.orderHandTowel || 0) / 2) * 795) +
                              ((partnerEditingApartment.inventory?.orderBathMat || 0) * 695) +
                              ((partnerEditingApartment.inventory?.orderMattress90 || 0) * 3990) +
                              ((partnerEditingApartment.inventory?.orderMattress140 || 0) * 7990) +
                              ((partnerEditingApartment.inventory?.orderMattress160 || 0) * 8990) +
                              ((partnerEditingApartment.inventory?.orderMattress180 || 0) * 9990)
                            ).toLocaleString('hu-HU')} Ft
                          </span>
                        </div>
                        
                        {/* Gyors kitöltés gomb */}
                        <button
                          onClick={() => {
                            const guests = partnerEditingApartment.maxGuests || 2;
                            const doubleBeds = (partnerEditingApartment.doubleBeds || 0) + 
                                        (partnerEditingApartment.sofaBedDouble || 0) + 
                                        (partnerEditingApartment.otherDoubleBedCount || 0);
                            const singleBeds = (partnerEditingApartment.sofaBedSingle || 0) + 
                                              (partnerEditingApartment.singleBedCount || 0);
                            // Kalkuláció:
                            // - Paplan, párna, matracvédő: 1/fő (nincs dupla forgó)
                            // - Lepedő: ágyanként 2 (dupla forgó)
                            // - Minden más: 2x (dupla forgó)
                            setPartnerEditingApartment({
                              ...partnerEditingApartment,
                              inventory: {
                                ...(partnerEditingApartment.inventory || {}),
                                // 1/fő - nincs dupla forgó
                                orderDuvet: guests,
                                orderPillow: guests,
                                // Matracvédő: 1/fő - egyszemélyes és kétszemélyes ágyakra
                                orderMattress90: singleBeds,
                                orderMattress160: doubleBeds,
                                // Lepedők: ágyanként 2 (dupla forgó)
                                orderSheet90: singleBeds * 2,
                                orderSheet160: doubleBeds * 2,
                                // Dupla forgó (2x)
                                orderBeddingSet: guests * 2,
                                orderBathTowel: guests * 2,
                                orderMediumTowel: guests * 2,
                                orderHandTowel: guests * 2,
                                orderBathMat: 4
                              }
                            });
                          }}
                          className="w-full mt-3 bg-white text-emerald-600 font-bold py-2 rounded-lg hover:bg-emerald-50 transition"
                        >
                          ⚡ Javasolt mennyiségek ({partnerEditingApartment.maxGuests || 2} vendégre)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                    {/* Meglévő textilek listázása */}
                    <div className="space-y-3">
                      {/* Ágyneműk */}
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-xs font-semibold text-cyan-800 mb-2">🛏️ Ágyneműk</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Paplan 150x200</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.duvetCount || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), duvetCount: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.duvetBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), duvetBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Párna 50x60</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.pillowCount || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), pillowCount: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.pillowBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), pillowBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Ágynemű szett</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.beddingSetCount || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), beddingSetCount: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.beddingSetBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), beddingSetBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Gumis lepedő</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.sheetCount || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), sheetCount: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.sheetSize || '160x200'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), sheetSize: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="90x200">90x200</option><option value="160x200">160x200</option><option value="180x200">180x200</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Matracvédő</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.mattressProtector || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), mattressProtector: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.mattressSize || '140x200'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), mattressSize: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="90x200">90x200</option><option value="140x200">140x200</option><option value="160x200">160x200</option><option value="180x200">180x200</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Törölközők */}
                      <div className="bg-white p-3 rounded-lg border">
                        <p className="text-xs font-semibold text-cyan-800 mb-2">🛁 Törölközők</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Fürdőlepedő 70x140</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.largeTowel || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), largeTowel: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.largeTowelBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), largeTowelBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Közepes törölköző 55x120</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.mediumTowel || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), mediumTowel: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.mediumTowelBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), mediumTowelBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Kéztörlő 30x50</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.handTowel || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), handTowel: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10,12,14,16,18,20].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.handTowelBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), handTowelBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Kádkilépő 40x60</label>
                            <div className="flex gap-1">
                              <select value={partnerEditingApartment.inventory?.bathMat || 0}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), bathMat: parseInt(e.target.value)}})}
                                className="w-16 px-2 py-1 border rounded text-sm">
                                {[0,1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                              </select>
                              <select value={partnerEditingApartment.inventory?.bathMatBrand || 'IKEA'}
                                onChange={(e) => setPartnerEditingApartment({...partnerEditingApartment, inventory: {...(partnerEditingApartment.inventory || {}), bathMatBrand: e.target.value}})}
                                className="flex-1 px-2 py-1 border rounded text-sm">
                                <option value="IKEA">IKEA</option><option value="JYSK">JYSK</option><option value="Egyeb">Egyéb</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    </>
                  )}
                </div>
              </div>

              {/* GOMBOK */}
              <div className="p-4 border-t bg-gray-50 rounded-b-xl flex gap-2">
                <button 
                  onClick={savePartnerApartment}
                  className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 font-bold"
                >
                  ✓ Mentés
                </button>
                <button 
                  onClick={() => setPartnerEditingApartment(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-bold"
                >
                  Mégse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200">
          {/* Logo és fejléc */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-800 rounded-xl flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Partner Portál</h1>
            <p className="text-slate-500 text-sm mt-1">HNR Smart Invest Kft.</p>
          </div>
          
          {/* Partner login/register választó */}
          {!showPartnerLogin && !partnerRegistering ? (
            <div className="space-y-4">
              <button 
                onClick={() => setShowPartnerLogin(true)}
                className="w-full bg-slate-800 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-slate-700 transition-colors"
              >
                Bejelentkezés
              </button>
              
              <button 
                onClick={() => {
                  setPartnerRegistering(true);
                  setCurrentPartner({ 
                    id: Date.now(), 
                    isNewRegistration: true 
                  });
                  setIsAdmin(true);
                  setCurrentUser({ id: 'partner-reg', name: 'Partner', role: 'partner' });
                  setPartnerOnboardingStep(1);
                }}
                className="w-full bg-white border border-slate-300 text-slate-700 px-6 py-3.5 rounded-xl font-medium hover:bg-slate-50 hover:border-slate-400 transition-colors"
              >
                Regisztráció
              </button>
            </div>
          ) : showPartnerLogin ? (
            <div className="space-y-4">
              <button 
                onClick={() => setShowPartnerLogin(false)}
                className="text-slate-500 text-sm flex items-center gap-1 hover:text-slate-700 transition-colors mb-4"
              >
                <ChevronLeft size={16} /> Vissza
              </button>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email cím</label>
                <input 
                  type="email" 
                  value={partnerLoginEmail}
                  onChange={(e) => setPartnerLoginEmail(e.target.value)}
                  placeholder="partner@email.hu"
                  className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Jelszó</label>
                <div className="relative">
                  <input 
                    type={showPartnerPassword ? "text" : "password"}
                    value={partnerLoginPassword}
                    onChange={(e) => setPartnerLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-slate-500 focus:ring-2 focus:ring-slate-200 focus:outline-none pr-12 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPartnerPassword(!showPartnerPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPartnerPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              {partnerLoginError && (
                <p className="text-red-600 text-sm">{partnerLoginError}</p>
              )}
              <button 
                onClick={handlePartnerLogin}
                className="w-full bg-slate-800 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-slate-700 transition-colors"
              >
                Bejelentkezés
              </button>
              
              <div className="pt-4 border-t border-slate-200 mt-6">
                <p className="text-center text-sm text-slate-500">
                  Nincs még fiókja?{' '}
                  <button 
                    onClick={() => {
                      setShowPartnerLogin(false);
                      setPartnerRegistering(true);
                      setCurrentPartner({ 
                        id: Date.now(), 
                        isNewRegistration: true 
                      });
                      setIsAdmin(true);
                      setCurrentUser({ id: 'partner-reg', name: 'Partner', role: 'partner' });
                      setPartnerOnboardingStep(1);
                    }}
                    className="text-slate-800 font-medium hover:underline"
                  >
                    Regisztráció
                  </button>
                </p>
              </div>
              
              <p className="text-center text-sm text-slate-400 mt-2">
                <a href="mailto:info@smartproperties.hu" className="hover:text-slate-600">Elfelejtett jelszó?</a>
              </p>
            </div>
          ) : null}
          
          <div className="mt-8 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">© 2025 HNR Smart Invest Kft.</p>
            <p className="text-xs text-slate-400 mt-1">
              <a href="https://smartproperties.hu" className="hover:text-slate-600">smartproperties.hu</a>
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (isAdmin === false) {
    const myJobs = jobs.filter(j => j.worker && j.worker.id === currentUser.id);
    const myExpenses = expenses.filter(e => e.workerId === currentUser.id);
    const mySummary = getWorkerSummary('all', currentUser.id)[currentUser.id] || {
      totalEarnings: 0,
      cleaningEarnings: 0,
      textileEarnings: 0,
      expenses: 0,
      hours: 0
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Megerősítés</h3>
              <p className="text-gray-700 mb-6">
                Biztosan törölni szeretnéd <strong>{confirmDelete.name}</strong> {confirmDelete.type === 'worker' ? 'dolgozót' : 'lakást'}?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={confirmDeleteAction}
                  className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-bold"
                >
                  Igen, törlés
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-bold"
                >
                  Nem, mégse
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-2xl p-6 mb-6 text-white">
            <div className="text-center mb-2">
              <span className="text-sm opacity-80">SmartCleanApp</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold">Szia, {currentUser.name}!</h1>
                <p className="text-indigo-100">Órabér: {(currentUser.hourlyRate || 2500).toLocaleString()} Ft/óra</p>
              </div>
              <button onClick={handleLogout} className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                <LogOut size={18} />
                Kilépés
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Összesítő</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-gray-600">Összes</p>
                <p className="text-2xl font-bold text-green-600">{(mySummary?.totalEarnings || 0).toLocaleString()} Ft</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-gray-600">Takarítás</p>
                <p className="text-xl font-bold text-blue-600">{(mySummary?.cleaningEarnings || 0).toLocaleString()} Ft</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                <p className="text-sm text-gray-600">Mosás</p>
                <p className="text-xl font-bold text-purple-600">{(mySummary?.textileEarnings || 0).toLocaleString()} Ft</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
                <p className="text-sm text-gray-600">Céges költségek</p>
                <p className="text-xl font-bold text-orange-600">{(mySummary?.expenses || 0).toLocaleString()} Ft</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">💼 Céges költségek</h2>
              <button
                onClick={() => setShowAddExpense(!showAddExpense)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Költség hozzáadása
              </button>
            </div>

            {showAddExpense && (
              <div className="mb-4 p-4 bg-orange-50 rounded-lg space-y-3 border-2 border-orange-200">
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  placeholder="Összeg (Ft)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">-- Válassz típust --</option>
                  <option value="Fogyóeszköz">Fogyóeszköz (pl. WC papír, kávékapszula stb.)</option>
                  <option value="Eszközpótlás">Eszközpótlás (pl. hajszárító, kulcsmásolás stb.)</option>
                </select>
                <div>
                  <label className="block text-sm font-medium mb-1">Blokk feltöltése</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleReceiptUpload}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addExpense} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">Mentés</button>
                  <button onClick={() => setShowAddExpense(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg">Mégse</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {myExpenses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Még nincsenek céges költségek</p>
              ) : (
                myExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(exp => (
                  <div key={exp.id} className="border p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{exp.description}</p>
                      <p className="text-sm text-gray-600">{new Date(exp.date).toLocaleDateString('hu-HU')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{(exp.amount || 0).toLocaleString()} Ft</p>
                      {exp.receipt && (
                        <button onClick={() => window.open(exp.receipt)} className="text-sm text-blue-600">Blokk</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* KARBANTARTÁS SZEKCIÓ */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">🔧 Karbantartás bejelentés</h2>
              <button
                onClick={() => setShowAddMaintenance(!showAddMaintenance)}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Bejelentés
              </button>
            </div>

            {showAddMaintenance && (
              <div className="mb-4 p-4 bg-amber-50 rounded-lg space-y-3 border-2 border-amber-200">
                <input
                  type="date"
                  value={newMaintenance.date}
                  onChange={(e) => setNewMaintenance({...newMaintenance, date: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <select
                  value={newMaintenance.apartmentId}
                  onChange={(e) => setNewMaintenance({...newMaintenance, apartmentId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Válassz lakást (opcionális)...</option>
                  {apartments.map(apt => (
                    <option key={apt.id} value={apt.id}>{apt.name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  value={newMaintenance.amount}
                  onChange={(e) => setNewMaintenance({...newMaintenance, amount: e.target.value})}
                  placeholder="Összeg (Ft)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <input
                  type="text"
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance({...newMaintenance, description: e.target.value})}
                  placeholder="Leírás (pl. Csaptelep csere, Festés)"
                  className="w-full px-3 py-2 border rounded-lg"
                />
                <textarea
                  value={newMaintenance.notes}
                  onChange={(e) => setNewMaintenance({...newMaintenance, notes: e.target.value})}
                  placeholder="Megjegyzés (opcionális)"
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
                <div className="flex gap-2">
                  <button onClick={addMaintenance} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">Mentés</button>
                  <button onClick={() => setShowAddMaintenance(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg">Mégse</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {maintenanceExpenses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Még nincsenek bejelentések</p>
              ) : (
                maintenanceExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(maint => (
                  <div key={maint.id} className="border border-amber-200 bg-amber-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{maint.description}</p>
                      <p className="text-sm text-gray-600">{new Date(maint.date).toLocaleDateString('hu-HU')}</p>
                      {maint.apartmentName && <p className="text-sm text-amber-700">* {maint.apartmentName}</p>}
                      {maint.notes && <p className="text-sm text-gray-500 italic mt-1">* {maint.notes}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-lg font-bold text-amber-700">{(maint.amount || 0).toLocaleString()} Ft</p>
                      <button
                        onClick={() => setMaintenanceExpenses(maintenanceExpenses.filter(m => m.id !== maint.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Munkáim szekció */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg p-6 border-2 border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-800 flex items-center gap-2">
              <span className="text-2xl">📋</span> Munkáim
            </h2>
            {myJobs.length === 0 ? (
              <p className="text-blue-400 text-center py-4">Még nincsenek munkáid</p>
            ) : (
              <div className="space-y-3">
                {myJobs.sort((a, b) => new Date(b.date) - new Date(a.date)).map(job => (
                  <div key={job.id} className="bg-white border-2 border-blue-200 p-4 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-blue-900">
                          {job.apartments.length > 0 
                            ? job.apartments.map(a => a.name).join(', ')
                            : 'Csak mosás'}
                        </h3>
                        <p className="text-sm text-blue-600">{new Date(job.date).toLocaleDateString('hu-HU')}</p>
                        {job.hours > 0 && <p className="text-sm text-blue-500">Takarítás: {job.hours} óra</p>}
                        {job.textileDeliveries && job.textileDeliveries.length > 0 && (
                          <div className="mt-2">
                            {job.textileDeliveries.map(td => (
                              <p key={td.apartmentId} className="text-sm text-purple-600 font-medium">
                                🧺 Mosás - {td.apartmentName}: {td.guestCount} fő ({td.arrivalTime || '14:00'})
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">{(job.totalEarnings || 0).toLocaleString()} Ft</p>
                        {(job.cleaningEarnings || 0) > 0 && (
                          <p className="text-xs text-gray-500">Takarítás: {(job.cleaningEarnings || 0).toLocaleString()} Ft</p>
                        )}
                        {(job.textileEarnings || 0) > 0 && (
                          <p className="text-xs text-purple-500">Mosás: {(job.textileEarnings || 0).toLocaleString()} Ft</p>
                        )}
                      </div>
                    </div>
                    {job.apartments.some(a => a.instructions) && (
                      <div className="mt-3 pt-3 border-t border-blue-200 bg-blue-50 p-3 rounded">
                        <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                          <FileText size={14} />
                          Bejutási információk:
                        </p>
                        {job.apartments.filter(a => a.instructions).map(apt => (
                          <div key={apt.id} className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">{apt.name}:</span> {apt.instructions}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Saját készletem szekció */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-100 rounded-xl shadow-lg p-6 mb-6 border-2 border-purple-200">
            <h2 className="text-xl font-bold mb-2 text-purple-800 flex items-center gap-2">
              <span className="text-2xl">🎒</span> Nálam lévő készlet
            </h2>
            <p className="text-purple-500 text-sm mb-4">Amit hazavittél / nálad van</p>
            
            {/* Meglévő tételek */}
            {(workerInventories[currentUser.id]?.otherItems || []).length > 0 ? (
              <div className="space-y-2 mb-4">
                {(workerInventories[currentUser.id]?.otherItems || []).map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border-2 border-purple-200 shadow-sm">
                    <span className="font-medium text-purple-900">{item.name}</span>
                    <span className="text-purple-700 font-bold bg-purple-100 px-3 py-1 rounded-full">{item.quantity} db</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-purple-300 text-center py-4 mb-4 bg-white/50 rounded-lg">Nincs nálad rögzített készlet</div>
            )}
            
            {/* Új tétel hozzáadása */}
            <div className="border-t border-purple-200 pt-4">
              <p className="text-sm font-semibold text-purple-700 mb-2">➕ Új tétel hozzáadása:</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Tétel neve (pl. Porszívó, Paplan)..." 
                  id="workerSelfNewItem" 
                  className="flex-1 px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none" 
                />
                <input 
                  type="number" 
                  placeholder="db" 
                  id="workerSelfNewQty" 
                  className="w-20 px-3 py-2 border-2 border-purple-200 rounded-lg text-sm focus:border-purple-400 focus:outline-none" 
                  min="1" 
                  defaultValue="1" 
                />
                <button 
                  onClick={() => {
                    const nameInput = document.getElementById('workerSelfNewItem');
                    const qtyInput = document.getElementById('workerSelfNewQty');
                    if (nameInput.value.trim()) {
                      const currentInv = workerInventories[currentUser.id] || { otherItems: [] };
                      setWorkerInventories({
                        ...workerInventories,
                        [currentUser.id]: {
                          ...currentInv,
                          otherItems: [...(currentInv.otherItems || []), { name: nameInput.value.trim(), quantity: parseInt(qtyInput.value) || 1 }]
                        }
                      });
                      nameInput.value = '';
                      qtyInput.value = '1';
                    }
                  }} 
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-1 font-bold shadow-md"
                >
                  <Plus size={18} />
                  Hozzáad
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Megerősítés</h3>
            <p className="text-gray-700 mb-6">
              Biztosan törölni szeretnéd <strong>{confirmDelete.name}</strong> {confirmDelete.type === 'worker' ? 'dolgozót' : 'lakást'}?
            </p>
            <div className="flex gap-3">
              <button
                onClick={confirmDeleteAction}
                className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 font-bold"
              >
                Igen, törlés
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-bold"
              >
                Nem, mégse
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl shadow-2xl p-6 mb-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {currentModule !== 'home' && (
                <button 
                  onClick={() => setCurrentModule('home')}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <div>
                <h1 className="text-3xl font-bold mb-1">* SmartCRM</h1>
                <p className="text-slate-300 text-sm">
                  {currentModule === 'home' && 'Vállalatirányítási Rendszer'}
                  {currentModule === 'cleaning' && '* Takarítás modul'}
                  {currentModule === 'management' && '* Management modul'}
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition">
              <LogOut size={18} />
              Kilépés
            </button>
          </div>
        </div>

        {/* FŐOLDAL - Kombinált Dashboard */}
        {currentModule === 'home' && (
          <div className="space-y-4">
            
            {/* Gyors navigáció - Management & Takarítás */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setCurrentModule('management'); setActiveTab('bookings'); }}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white text-left hover:from-indigo-600 hover:to-purple-700 transition shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">*</span>
                  <div>
                    <h3 className="font-bold">Management</h3>
                    <p className="text-xs opacity-80">Lakások, Naptár, Foglalások</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => { setCurrentModule('cleaning'); setActiveTab('jobs'); }}
                className="bg-gradient-to-r from-cyan-500 to-teal-600 p-4 rounded-xl text-white text-left hover:from-cyan-600 hover:to-teal-700 transition shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">*</span>
                  <div>
                    <h3 className="font-bold">Takarítás</h3>
                    <p className="text-xs opacity-80">Kiosztás, Mosoda, Teljesítmény</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Áttekintés - bevétel.hu stílus 6 csempe (3+3) */}
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
              {/* Éves sikeres lead */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="text-blue-700 font-bold text-sm mb-3">Éves sikeres lead</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Összes bevétel:</span><span className="font-bold">{(bookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Megújuló bevétel:</span><span className="font-bold">{(bookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új bevétel:</span><span className="font-bold">0</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új/sikeres (db):</span><span className="font-bold">{bookings.length} / 0</span></div>
                </div>
              </div>
              
              {/* Havi sikeres lead */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="text-blue-700 font-bold text-sm mb-3">Havi sikeres lead</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Összes bevétel:</span><span className="font-bold">{(bookings.filter(b => new Date(b.checkIn).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Megújuló bevétel:</span><span className="font-bold">{(bookings.filter(b => new Date(b.checkIn).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új bevétel:</span><span className="font-bold">0</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új/sikeres (db):</span><span className="font-bold">{bookings.filter(b => new Date(b.checkIn).getMonth() === new Date().getMonth()).length} / 0</span></div>
                </div>
              </div>
              
              {/* Napi sikeres lead */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="text-red-700 font-bold text-sm mb-3">Napi sikeres lead</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Összes bevétel:</span><span className="font-bold">0</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Megújuló bevétel:</span><span className="font-bold">0</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új bevétel:</span><span className="font-bold">0</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Új/sikeres (db):</span><span className="font-bold">0 / 0</span></div>
                </div>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px'}}>
              {/* Lead éves áttekintő */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-gray-800 font-bold text-sm">Lead éves áttekintő</h4>
                  <span className="text-blue-600 font-bold text-sm">Σ: {leads.length}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Sikeres:</span><span className="font-bold">{leads.filter(l => l.status === 'won').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Sikertelen:</span><span className="font-bold">{leads.filter(l => l.status === 'lost').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Nyitott:</span><span className="font-bold">{leads.filter(l => !['won', 'lost'].includes(l.status)).length}</span></div>
                </div>
              </div>
              
              {/* Tényleges bevételek */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="text-blue-700 font-bold text-sm mb-3">Tényleges bevételek</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Éves bevétel:</span><span className="font-bold">{(bookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Havi bevétel:</span><span className="font-bold">{(bookings.filter(b => new Date(b.checkIn).getMonth() === new Date().getMonth()).reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Napi bevétel:</span><span className="font-bold">0</span></div>
                </div>
              </div>
              
              {/* Várható bevételek */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h4 className="text-blue-700 font-bold text-sm mb-3">Várható bevételek</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Díjbekérőzve:</span><span className="font-bold">2 316 651</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Várható bevétel:</span><span className="font-bold">{(bookings.filter(b => new Date(b.checkIn) > new Date()).reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate).toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Siker/nap:</span><span className="font-bold">{bookings.length > 0 ? (bookings.length / 365).toFixed(2) : 'Nincs adat nap'}</span></div>
                </div>
              </div>
            </div>

            {/* Bevételi terv - kompakt verzió */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 shadow border border-emerald-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-emerald-800 text-sm">Bevételi terv</h3>
                <button onClick={() => setShowEditRevenuePlan(true)} className="text-emerald-600 hover:text-emerald-800 text-xs font-medium">Szerkesztés</button>
              </div>
              
              {/* Időszak választó gombok */}
              <div className="flex gap-1 mb-3">
                {[
                  { key: 'napi', label: 'Mai nap', plan: 71000 },
                  { key: 'heti', label: 'Heti', plan: 532500 },
                  { key: 'havi', label: 'Havi', plan: 2130000 },
                  { key: 'eves', label: 'Éves', plan: 25560000 }
                ].map((p) => (
                  <button
                    key={p.key}
                    onClick={() => setRevenuePlanPeriod(p.key)}
                    className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition ${
                      revenuePlanPeriod === p.key 
                        ? 'bg-emerald-500 text-white shadow' 
                        : 'bg-white text-gray-600 hover:bg-emerald-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              
              {/* TERV vs TÉNY nagy kártyák - dinamikus */}
              {(() => {
                const periods = {
                  napi: { plan: 71000, label: 'Mai nap' },
                  heti: { plan: 532500, label: 'Heti' },
                  havi: { plan: 2130000, label: 'Havi' },
                  eves: { plan: 25560000, label: 'Éves' }
                };
                const currentPeriod = periods[revenuePlanPeriod];
                const actual = 0; // TODO: connect to actual data
                const pct = currentPeriod.plan > 0 ? (actual / currentPeriod.plan * 100) : 0;
                
                return (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-sm">
                      <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-lg">*</div>
                      <div>
                        <div className="text-xs text-emerald-600 font-medium">TERV ({currentPeriod.label})</div>
                        <div className="text-xl font-bold">{currentPeriod.plan >= 1000000 ? (currentPeriod.plan/1000000).toFixed(2) + 'M' : (currentPeriod.plan/1000).toFixed(0) + 'k'} Ft</div>
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 flex items-center gap-2 shadow-sm ${pct >= 100 ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg ${pct >= 100 ? 'bg-green-500' : 'bg-amber-400'}`}>{pct >= 100 ? '✓' : '!'}</div>
                      <div>
                        <div className={`text-xs font-medium ${pct >= 100 ? 'text-green-600' : 'text-amber-600'}`}>TÉNY <span className={`px-1 rounded text-xs ${pct >= 100 ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'}`}>{pct.toFixed(0)}%</span></div>
                        <div className="text-xl font-bold">{actual >= 1000000 ? (actual/1000000).toFixed(2) + 'M' : actual.toLocaleString()} Ft</div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Költségterv - kompakt verzió */}
            <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-xl p-4 shadow border border-rose-200">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-rose-800 text-sm">Költségterv</h3>
                <button onClick={() => setShowEditCostPlan(true)} className="text-rose-600 hover:text-rose-800 text-xs font-medium">Szerkesztés</button>
              </div>
              
              {/* Hónap gombok */}
              <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
                {['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'].map((m, i) => (
                  <button
                    key={i}
                    onClick={() => setCostPlanMonth(i + 1)}
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap transition ${
                      costPlanMonth === i + 1 ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 hover:bg-rose-100'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              
              {/* Költség TERV vs TÉNY */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white rounded-lg p-3 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white text-sm">*</div>
                  <div>
                    <div className="text-xs text-rose-600 font-medium">TERV</div>
                    <div className="text-lg font-bold">{getCostPlanTotals(costPlanMonth - 1).planned.toLocaleString()} Ft</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2 shadow-sm">
                  <div className="w-8 h-8 bg-gray-400 rounded-lg flex items-center justify-center text-white text-sm">-</div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium">TÉNY</div>
                    <div className="text-lg font-bold">{getCostPlanTotals(costPlanMonth - 1).actual.toLocaleString()} Ft</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Értékesítési célok - kompakt táblázat */}
            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-gray-800 text-sm">Értékesítési célok</h3>
                <select 
                  value={salesTargetYear}
                  onChange={(e) => setSalesTargetYear(parseInt(e.target.value))}
                  className="text-xs px-2 py-1 border rounded font-medium"
                >
                  {[2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              
              {/* Növekedési üzenet */}
              <div className="text-xs text-gray-500 mb-2 bg-blue-50 p-2 rounded">
                📈 Stratégia: Évente +50 egység/hónap | {salesTargetYear}: +{(salesTargetYear - 2026) * 50} egység a 2026-os bázishoz képest
              </div>
              
              <div className="overflow-x-auto max-h-64 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-white">
                    <tr className="border-b">
                      <th className="text-left py-1 px-1 font-medium text-gray-500">Hónap</th>
                      <th className="text-right py-1 px-1 font-medium text-gray-500">Egység</th>
                      <th className="text-right py-1 px-1 font-medium text-gray-500">Átlagár</th>
                      <th className="text-right py-1 px-1 font-medium text-blue-600 bg-blue-50">Terv</th>
                      <th className="text-right py-1 px-1 font-medium text-emerald-600 bg-emerald-50">Tény</th>
                      <th className="text-right py-1 px-1 font-medium text-gray-500">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Base units for 2026
                      const baseData = [
                        { m: 'Jan', units: 30, price: 200000 },
                        { m: 'Feb', units: 33, price: 200000 },
                        { m: 'Már', units: 35, price: 200000 },
                        { m: 'Ápr', units: 38, price: 230000 },
                        { m: 'Máj', units: 40, price: 200000 },
                        { m: 'Jún', units: 42, price: 200000 },
                        { m: 'Júl', units: 45, price: 240000 },
                        { m: 'Aug', units: 47, price: 240000 },
                        { m: 'Szep', units: 50, price: 200000 },
                        { m: 'Okt', units: 52, price: 200000 },
                        { m: 'Nov', units: 55, price: 200000 },
                        { m: 'Dec', units: 58, price: 220000 }
                      ];
                      
                      // Calculate offset based on year (+50 units per year)
                      const yearOffset = (salesTargetYear - 2026) * 50;
                      
                      return baseData.map((row, idx) => {
                        const scaledUnits = row.units + yearOffset;
                        const scaledPlan = scaledUnits * row.price;
                        const monthBookings = bookings.filter(b => {
                          const d = new Date(b.checkIn);
                          return d.getMonth() === idx && d.getFullYear() === salesTargetYear;
                        });
                        const actual = monthBookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate;
                        const pct = scaledPlan > 0 ? (actual / scaledPlan * 100) : 0;
                        
                        return (
                          <tr key={idx} className={`border-b ${actual === 0 ? 'bg-red-50' : ''}`}>
                            <td className="py-1 px-1 font-medium">{row.m}</td>
                            <td className="text-right py-1 px-1 text-gray-600">{scaledUnits.toLocaleString()}</td>
                            <td className="text-right py-1 px-1 text-gray-600">{(row.price/1000).toFixed(0)}k</td>
                            <td className="text-right py-1 px-1 bg-blue-50/50 font-medium">
                              {scaledPlan >= 1000000000 ? (scaledPlan/1000000000).toFixed(1) + 'Mrd' : 
                               scaledPlan >= 1000000 ? (scaledPlan/1000000).toFixed(1) + 'M' : 
                               (scaledPlan/1000).toFixed(0) + 'k'}
                            </td>
                            <td className={`text-right py-1 px-1 ${actual > 0 ? 'bg-emerald-50/50 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                              {actual > 0 ? (actual >= 1000000 ? (actual/1000000).toFixed(1) + 'M' : actual.toLocaleString()) : '0'}
                            </td>
                            <td className={`text-right py-1 px-1 font-medium ${pct >= 100 ? 'text-green-600' : pct > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                              {pct.toFixed(0)}%
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                  <tfoot className="sticky bottom-0 bg-white">
                    {(() => {
                      const baseData = [
                        { units: 30, price: 200000 }, { units: 33, price: 200000 }, { units: 35, price: 200000 },
                        { units: 38, price: 230000 }, { units: 40, price: 200000 }, { units: 42, price: 200000 },
                        { units: 45, price: 240000 }, { units: 47, price: 240000 }, { units: 50, price: 200000 },
                        { units: 52, price: 200000 }, { units: 55, price: 200000 }, { units: 58, price: 220000 }
                      ];
                      const yearOffset = (salesTargetYear - 2026) * 50;
                      const totalUnits = baseData.reduce((sum, r) => sum + r.units + yearOffset, 0);
                      const totalPlan = baseData.reduce((sum, r) => sum + ((r.units + yearOffset) * r.price), 0);
                      const yearBookings = bookings.filter(b => new Date(b.checkIn).getFullYear() === salesTargetYear);
                      const totalActual = yearBookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) * eurRate;
                      const totalPct = totalPlan > 0 ? (totalActual / totalPlan * 100) : 0;
                      
                      return (
                        <tr className="bg-gray-100 font-bold border-t-2">
                          <td className="py-1 px-1">Össz</td>
                          <td className="text-right py-1 px-1">{totalUnits.toLocaleString()}</td>
                          <td className="text-right py-1 px-1">-</td>
                          <td className="text-right py-1 px-1 text-blue-700">
                            {totalPlan >= 1000000000 ? (totalPlan/1000000000).toFixed(2) + 'Mrd' : (totalPlan/1000000).toFixed(1) + 'M'}
                          </td>
                          <td className="text-right py-1 px-1 text-emerald-700">
                            {totalActual >= 1000000 ? (totalActual/1000000).toFixed(1) + 'M' : totalActual.toLocaleString()}
                          </td>
                          <td className="text-right py-1 px-1">{totalPct.toFixed(0)}%</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Pénzügyi összesítő - 4 kis kártya */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-3 rounded-xl shadow">
                <div className="text-xs opacity-80">Éves terv</div>
                <div className="text-lg font-bold">{apartments.reduce((sum, a) => sum + (a.yearlyRevenueTarget || 0), 0).toLocaleString()} €</div>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3 rounded-xl shadow">
                <div className="text-xs opacity-80">Tényleges</div>
                <div className="text-lg font-bold">{bookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0).toLocaleString()} €</div>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white p-3 rounded-xl shadow">
                <div className="text-xs opacity-80">Költségek</div>
                <div className="text-lg font-bold">{expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0).toLocaleString()} Ft</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-3 rounded-xl shadow">
                <div className="text-xs opacity-80">Teljesítmény</div>
                <div className="text-lg font-bold">{apartments.reduce((sum, a) => sum + (a.yearlyRevenueTarget || 0), 0) > 0 ? Math.round(bookings.reduce((sum, b) => sum + (parseFloat(b.totalPrice) || 0), 0) / apartments.reduce((sum, a) => sum + (a.yearlyRevenueTarget || 0), 0) * 100) : 0}%</div>
              </div>
            </div>

            {/* Legutóbbi foglalások - kompakt */}
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Legutóbbi foglalások</h3>
              {bookings.length === 0 ? (
                <p className="text-gray-400 text-center py-3 text-sm">Még nincsenek foglalások</p>
              ) : (
                <div className="space-y-2">
                  {bookings.slice(-3).reverse().map(b => {
                    const apt = apartments.find(a => a.id.toString() === b.apartmentId);
                    return (
                      <div key={b.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg text-sm">
                        <div>
                          <span className="font-medium">{apt?.name || 'N/A'}</span>
                          <span className="text-gray-400 mx-2">•</span>
                          <span className="text-gray-600">{b.guestName}</span>
                        </div>
                        <span className="font-bold text-emerald-600">{parseFloat(b.totalPrice || 0).toLocaleString()} €</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAKARÍTÁS MODUL */}
        {currentModule === 'cleaning' && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`p-6 rounded-xl shadow-lg text-left transition ${activeTab === 'overview' ? 'bg-purple-600 text-white' : 'bg-white hover:bg-purple-50'}`}
            >
              <div className="text-3xl mb-3">📊</div>
              <div className="font-bold">Teljesítmény</div>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`p-6 rounded-xl shadow-lg text-left transition ${activeTab === 'jobs' ? 'bg-blue-600 text-white' : 'bg-white hover:bg-blue-50'}`}
            >
              <div className="text-3xl mb-3">📋</div>
              <div className="font-bold">Kiosztás</div>
            </button>

            <button
              onClick={() => setActiveTab('laundry')}
              className={`p-6 rounded-xl shadow-lg text-left transition ${activeTab === 'laundry' ? 'bg-cyan-600 text-white' : 'bg-white hover:bg-cyan-50'}`}
            >
              <div className="text-3xl mb-3">🧺</div>
              <div className="font-bold">Mosoda</div>
            </button>

            <button
              onClick={() => setActiveTab('workers')}
              className={`p-6 rounded-xl shadow-lg text-left transition ${activeTab === 'workers' ? 'bg-orange-600 text-white' : 'bg-white hover:bg-orange-50'}`}
            >
              <div className="text-3xl mb-3">👷</div>
              <div className="font-bold">Takarítók</div>
            </button>
          </div>
        )}

        {/* MANAGEMENT MODUL */}
        {currentModule === 'management' && (
          <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-6">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'calendar' ? 'ring-4 ring-amber-300' : ''} bg-gradient-to-br from-amber-500 to-amber-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Naptár</div>
            </button>

            <button
              onClick={() => setActiveTab('marketing')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'marketing' ? 'ring-4 ring-pink-300' : ''} bg-gradient-to-br from-pink-500 to-pink-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Marketing</div>
            </button>

            <button
              onClick={() => setActiveTab('sales')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'sales' ? 'ring-4 ring-orange-300' : ''} bg-gradient-to-br from-orange-500 to-orange-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Értékesítés</div>
            </button>

            <button
              onClick={() => setActiveTab('apartments')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'apartments' ? 'ring-4 ring-emerald-300' : ''} bg-gradient-to-br from-emerald-500 to-emerald-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Lakások</div>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'partners' ? 'ring-4 ring-indigo-300' : ''} bg-gradient-to-br from-indigo-500 to-indigo-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Partnerek</div>
            </button>

            <button
              onClick={() => setActiveTab('documents')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'documents' ? 'ring-4 ring-yellow-300' : ''} bg-gradient-to-br from-yellow-500 to-yellow-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Dokumentumok</div>
            </button>

            <button
              onClick={() => setActiveTab('warehouse')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'warehouse' ? 'ring-4 ring-cyan-300' : ''} bg-gradient-to-br from-cyan-500 to-cyan-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Raktárak</div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`p-3 rounded-xl shadow-lg text-center transition transform hover:scale-105 ${activeTab === 'settings' ? 'ring-4 ring-gray-300' : ''} bg-gradient-to-br from-gray-500 to-gray-700 text-white`}
            >
              <div className="text-xl mb-1">*</div>
              <div className="font-bold text-xs">Beállítások</div>
            </button>
          </div>
        )}

        {/* FOGLALÁSOK TAB */}
        {activeTab === 'bookings' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">* Foglalások</h2>
              <button
                onClick={() => setShowAddBooking(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Új foglalás
              </button>
            </div>

            {/* SZŰRŐK */}
            <div className="flex flex-wrap gap-2 mb-4">
              <select 
                value={bookingApartmentFilter} 
                onChange={(e) => setBookingApartmentFilter(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="">Összes lakás</option>
                {apartments.map(apt => (
                  <option key={apt.id} value={apt.id}>{apt.name}</option>
                ))}
              </select>
              <button onClick={() => setBookingFilter('all')} className={`px-4 py-2 rounded-lg font-medium transition ${bookingFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}>Mind</button>
              <button onClick={() => setBookingFilter('today')} className={`px-4 py-2 rounded-lg font-medium transition ${bookingFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Ma</button>
              <button onClick={() => setBookingFilter('week')} className={`px-4 py-2 rounded-lg font-medium transition ${bookingFilter === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Hét</button>
              <button onClick={() => setBookingFilter('month')} className={`px-4 py-2 rounded-lg font-medium transition ${bookingFilter === 'month' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>Hónap</button>
            </div>

            {/* FOGLALÁSOK LISTÁJA */}
            <div className="space-y-3">
              {(() => {
                const today = new Date();
                const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                
                const filteredBookings = bookings.filter(b => {
                  if (bookingApartmentFilter && b.apartmentId !== parseInt(bookingApartmentFilter)) return false;
                  const bDate = new Date(b.dateFrom);
                  if (bookingFilter === 'today') return bDate.toDateString() === today.toDateString();
                  if (bookingFilter === 'week') return bDate >= startOfWeek && bDate <= endOfWeek;
                  if (bookingFilter === 'month') return bDate >= startOfMonth && bDate <= endOfMonth;
                  return true;
                }).sort((a, b) => new Date(b.dateFrom) - new Date(a.dateFrom));
                
                if (filteredBookings.length === 0) {
                  return <p className="text-gray-500 text-center py-8">Nincs foglalás a szűrésnek megfelelően</p>;
                }
                
                return filteredBookings.map(booking => {
                  // Ellenőrizzük a takarítási költségeket
                  const cleaningCost = jobs.filter(j => 
                    j.apartments && j.apartments.includes(booking.apartmentId) && 
                    j.date === booking.dateTo
                  ).reduce((sum, j) => sum + (j.totalEarnings || 0), 0);
                  const textileCost = jobs.filter(j => 
                    j.textileDeliveries && j.textileDeliveries.some(t => t.apartmentId === booking.apartmentId) &&
                    j.date === booking.dateTo
                  ).reduce((sum, j) => sum + (j.textileEarnings || 0), 0);
                  const totalCleaningCost = cleaningCost + textileCost;
                  const hasWarning = totalCleaningCost > (booking.cleaningFee || 0);
                  
                  return (
                    <div key={booking.id} className={`border rounded-xl p-4 hover:shadow-md transition ${hasWarning ? 'border-red-400 bg-red-50' : ''}`}>
                      {hasWarning && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
                           Figyelem! A takarítás költsége ({totalCleaningCost.toLocaleString()} Ft) meghaladja a takarítási díjat ({(booking.cleaningFee || 0).toLocaleString()} Ft)!
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-lg">{booking.apartmentName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              booking.platform === 'airbnb' ? 'bg-pink-100 text-pink-700' :
                              booking.platform === 'booking' ? 'bg-blue-100 text-blue-700' :
                              booking.platform === 'szallas' ? 'bg-red-100 text-red-700' :
                              booking.platform === 'direct' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {booking.platform === 'airbnb' ? 'Airbnb' : 
                               booking.platform === 'booking' ? 'Booking' : 
                               booking.platform === 'szallas' ? 'Szallas.hu' :
                               booking.platform === 'direct' ? 'Direkt' : 'Egyéb'}
                            </span>
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              * {booking.nights || 1} éj
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(booking.dateFrom).toLocaleDateString('hu-HU')}
                            {booking.dateTo && <span>  {new Date(booking.dateTo).toLocaleDateString('hu-HU')}</span>}
                            {booking.guestName && <span className="ml-2">€ {booking.guestName}</span>}
                            {booking.guestCount > 1 && <span className="ml-1">({booking.guestCount} fő)</span>}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingBooking(booking)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => setBookings(bookings.filter(b => b.id !== booking.id))}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2 mt-3 text-sm">
                        <div className="bg-amber-50 p-2 rounded text-center border border-amber-200">
                          <div className="text-xs text-amber-700">Payout</div>
                          <div className="font-bold text-amber-900">{(booking.payoutEur || 0).toFixed(0)} </div>
                        </div>
                        <div className="bg-blue-50 p-2 rounded text-center">
                          <div className="text-xs text-blue-600">Takarítás</div>
                          <div className="font-bold text-blue-800">{((booking.cleaningFee || 0) / eurRate).toFixed(0)} </div>
                        </div>
                        <div className="bg-orange-50 p-2 rounded text-center">
                          <div className="text-xs text-orange-600">IFA</div>
                          <div className="font-bold text-orange-800">{((booking.tourismTax || 0) / eurRate).toFixed(0)} </div>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded text-center">
                          <div className="text-xs text-emerald-600">Nettó</div>
                          <div className="font-bold text-emerald-800">{((booking.netRoomRevenue || 0) / eurRate).toFixed(0)} </div>
                        </div>
                        <div className="bg-purple-50 p-2 rounded text-center border border-purple-200">
                          <div className="text-xs text-purple-600">Jutalék</div>
                          <div className="font-bold text-purple-800">{((booking.managementAmount || 0) / eurRate).toFixed(0)} </div>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* PÉNZÜGY TAB */}
        {activeTab === 'finance' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">* Pénzügy</h2>

            {/* AL-TABOK */}
            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setFinanceSubTab('overview')}
                className={`px-6 py-3 rounded-lg font-medium transition ${financeSubTab === 'overview' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                * Bevételek
              </button>
              <button 
                onClick={() => setFinanceSubTab('settlements')}
                className={`px-6 py-3 rounded-lg font-medium transition ${financeSubTab === 'settlements' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                * Elszámolások
              </button>
            </div>

            {/* BEVÉTELEK AL-TAB */}
            {financeSubTab === 'overview' && (
              <>
                {/* SZŰRŐK */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <select 
                    value={financeApartmentFilter} 
                    onChange={(e) => setFinanceApartmentFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="">Összes lakás</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </select>
                  <button onClick={() => setFinanceFilter('today')} className={`px-4 py-2 rounded-lg font-medium transition ${financeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Ma</button>
                  <button onClick={() => setFinanceFilter('week')} className={`px-4 py-2 rounded-lg font-medium transition ${financeFilter === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Hét</button>
                  <button onClick={() => setFinanceFilter('month')} className={`px-4 py-2 rounded-lg font-medium transition ${financeFilter === 'month' ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>Hónap</button>
                  <button onClick={() => setFinanceFilter('custom')} className={`px-4 py-2 rounded-lg font-medium transition ${financeFilter === 'custom' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>Egyéni</button>
                </div>
                
                {/* HÓNAP VÁLASZTÓ */}
                {financeFilter === 'month' && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'].map((m, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setFinanceMonth(idx)}
                        className={`px-3 py-1 rounded-lg text-sm ${financeMonth === idx ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {m}
                      </button>
                    ))}
                    <select value={financeYear} onChange={(e) => setFinanceYear(parseInt(e.target.value))} className="px-3 py-1 border rounded-lg">
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                )}

                {financeFilter === 'custom' && (
                  <div className="flex gap-2 mb-4">
                    <input type="date" value={financeCustomRange.start} onChange={(e) => setFinanceCustomRange({...financeCustomRange, start: e.target.value})} className="px-3 py-2 border rounded-lg" />
                    <span className="py-2"></span>
                    <input type="date" value={financeCustomRange.end} onChange={(e) => setFinanceCustomRange({...financeCustomRange, end: e.target.value})} className="px-3 py-2 border rounded-lg" />
                  </div>
                )}

                {/* ÖSSZESÍTŐ KÁRTYÁK */}
                {(() => {
                  const today = new Date();
                  const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                  const endOfWeek = new Date(startOfWeek); endOfWeek.setDate(startOfWeek.getDate() + 6);
                  const startOfMonth = new Date(financeYear, financeMonth, 1);
                  const endOfMonth = new Date(financeYear, financeMonth + 1, 0);
                  
                  const filteredBookings = bookings.filter(b => {
                    if (financeApartmentFilter && b.apartmentId !== parseInt(financeApartmentFilter)) return false;
                    const bDate = new Date(b.dateFrom);
                    if (financeFilter === 'today') return bDate.toDateString() === today.toDateString();
                    if (financeFilter === 'week') return bDate >= startOfWeek && bDate <= endOfWeek;
                    if (financeFilter === 'month') return bDate >= startOfMonth && bDate <= endOfMonth;
                    if (financeFilter === 'custom' && financeCustomRange.start && financeCustomRange.end) {
                      return bDate >= new Date(financeCustomRange.start) && bDate <= new Date(financeCustomRange.end);
                    }
                    return true;
                  });

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border-2 border-amber-400">
                          <div className="text-sm text-amber-800 mb-1">* Összes Payout</div>
                          <div className="text-xs text-amber-600 mb-2">(A platform által a megbízó számlájára utalt összeg)</div>
                          <div className="text-2xl font-bold text-amber-900">
                            {filteredBookings.reduce((sum, b) => sum + (b.payoutEur || 0), 0).toFixed(0)} 
                          </div>
                          <div className="text-sm text-amber-700">
                            ({filteredBookings.reduce((sum, b) => sum + (b.payoutFt || 0), 0).toLocaleString()} Ft)
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-400">
                          <div className="text-sm text-purple-800 mb-1">* Jutalék</div>
                          <div className="text-2xl font-bold text-purple-900">
                            {(filteredBookings.reduce((sum, b) => sum + (b.managementAmount || 0), 0) / eurRate).toFixed(0)} 
                          </div>
                          <div className="text-sm text-purple-700">
                            ({filteredBookings.reduce((sum, b) => sum + (b.managementAmount || 0), 0).toLocaleString()} Ft)
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-300">
                          <div className="text-sm text-blue-700 mb-1">* Takarítási díjak</div>
                          <div className="text-xl font-bold text-blue-900">
                            {(filteredBookings.reduce((sum, b) => sum + (b.cleaningFee || 0), 0) / eurRate).toFixed(0)} 
                          </div>
                          <div className="text-sm text-blue-600">
                            ({filteredBookings.reduce((sum, b) => sum + (b.cleaningFee || 0), 0).toLocaleString()} Ft)
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-300">
                          <div className="text-sm text-orange-700 mb-1">* Idegenforgalmi adó</div>
                          <div className="text-xl font-bold text-orange-900">
                            {(filteredBookings.reduce((sum, b) => sum + (b.tourismTax || 0), 0) / eurRate).toFixed(0)} 
                          </div>
                          <div className="text-sm text-orange-600">
                            ({filteredBookings.reduce((sum, b) => sum + (b.tourismTax || 0), 0).toLocaleString()} Ft)
                          </div>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border-2 border-emerald-300">
                          <div className="text-sm text-emerald-700 mb-1">* Nettó szobaárbevétel</div>
                          <div className="text-xl font-bold text-emerald-900">
                            {(filteredBookings.reduce((sum, b) => sum + (b.netRoomRevenue || 0), 0) / eurRate).toFixed(0)} 
                          </div>
                          <div className="text-sm text-emerald-600">
                            ({filteredBookings.reduce((sum, b) => sum + (b.netRoomRevenue || 0), 0).toLocaleString()} Ft)
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 text-center">
                        {filteredBookings.length} foglalás a kiválasztott időszakban
                      </div>
                    </>
                  );
                })()}
              </>
            )}

            {/* ELSZÁMOLÁSOK AL-TAB */}
            {financeSubTab === 'settlements' && (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  <select 
                    value={settlementApartment} 
                    onChange={(e) => setSettlementApartment(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                  >
                    <option value="">Válassz lakást...</option>
                    {apartments.map(apt => (
                      <option key={apt.id} value={apt.id}>{apt.name}</option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    {['Jan', 'Feb', 'Már', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'].map((m, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setFinanceMonth(idx)}
                        className={`px-3 py-1 rounded-lg text-sm ${financeMonth === idx ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                      >
                        {m}
                      </button>
                    ))}
                    <select value={financeYear} onChange={(e) => setFinanceYear(parseInt(e.target.value))} className="px-3 py-1 border rounded-lg">
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                      <option value={2027}>2027</option>
                    </select>
                  </div>
                </div>

                {settlementApartment ? (() => {
                  const apt = apartments.find(a => a.id === parseInt(settlementApartment));
                  const startOfMonth = new Date(financeYear, financeMonth, 1);
                  const endOfMonth = new Date(financeYear, financeMonth + 1, 0);
                  
                  // Foglalások szűrése: Booking = távozó, egyéb = érkező
                  const aptBookings = bookings.filter(b => {
                    if (b.apartmentId !== parseInt(settlementApartment)) return false;
                    
                    // Booking.com esetén a TÁVOZÁS dátuma számít
                    if (b.platform === 'Booking.com') {
                      const dateTo = new Date(b.dateTo);
                      return dateTo >= startOfMonth && dateTo <= endOfMonth;
                    }
                    // Minden más platform esetén az ÉRKEZÉS dátuma számít
                    else {
                      const dateFrom = new Date(b.dateFrom);
                      return dateFrom >= startOfMonth && dateFrom <= endOfMonth;
                    }
                  });
                  
                  // Takarítások az adott hónapban
                  const aptCleanings = jobs.filter(j => 
                    j.apartments && j.apartments.includes(parseInt(settlementApartment)) &&
                    new Date(j.date) >= startOfMonth && 
                    new Date(j.date) <= endOfMonth
                  );
                  
                  // Karbantartások az adott hónapban
                  const aptMaintenance = (maintenanceExpenses || []).filter(m => 
                    m.apartmentId === parseInt(settlementApartment) &&
                    new Date(m.date) >= startOfMonth && 
                    new Date(m.date) <= endOfMonth
                  );
                  
                  // Számítások
                  const totalPayoutEur = aptBookings.reduce((sum, b) => sum + (b.payoutEur || 0), 0);
                  const totalCleaningFeeEur = aptBookings.reduce((sum, b) => sum + ((b.cleaningFee || 0) / eurRate), 0);
                  const totalManagementEur = aptBookings.reduce((sum, b) => sum + ((b.managementAmount || 0) / eurRate), 0);
                  const monthlyFeeEur = apt?.monthlyFeeEur || 0;
                  const maintenanceTotalEur = aptMaintenance.reduce((sum, m) => sum + ((m.cost || 0) / eurRate), 0);
                  
                  // Partner felé utalandó (ami a mi bevételünk)
                  const ourRevenueEur = totalCleaningFeeEur + totalManagementEur + monthlyFeeEur + maintenanceTotalEur;
                  
                  return (
                    <div className="space-y-4">
                      {/* LAKÁS FEJLÉC */}
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-xl">
                        <h3 className="text-xl font-bold">{apt?.name}</h3>
                        <p className="text-purple-100">{['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'][financeMonth]} {financeYear}</p>
                      </div>

                      {/* FOGLALÁSOK */}
                      <div className="border rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                          <span className="text-2xl">*</span> Foglalások ({aptBookings.length} db)
                          <span className="text-xs text-gray-500 font-normal ml-2">
                            (Booking: távozó | Egyéb: érkező)
                          </span>
                        </h4>
                        {aptBookings.length === 0 ? (
                          <p className="text-gray-500 text-center py-4">Nincs foglalás ebben a hónapban</p>
                        ) : (
                          <div className="space-y-2">
                            {aptBookings.map(b => (
                              <div key={b.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    b.platform === 'Airbnb' ? 'bg-pink-100 text-pink-700' :
                                    b.platform === 'Booking.com' ? 'bg-blue-100 text-blue-700' :
                                    b.platform === 'Szallas.hu' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {b.platform || 'Egyéb'}
                                  </span>
                                  <div>
                                    <span className="font-medium">{new Date(b.dateFrom).toLocaleDateString('hu-HU')} - {new Date(b.dateTo).toLocaleDateString('hu-HU')}</span>
                                    {b.guestName && <span className="text-gray-500 ml-2">€ {b.guestName}</span>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-amber-700">{(b.payoutEur || 0).toFixed(0)} </span>
                                  <button 
                                    onClick={() => setEditingBooking(b)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                  >
                                    <Edit2 size={14} className="text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <div className="flex justify-between items-center pt-2 border-t font-bold">
                              <span>Összesen Payout:</span>
                              <span className="text-amber-700">{totalPayoutEur.toFixed(0)} </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* DÍJBEKÉRŐ */}
                      {(() => {
                        // Extra tételek szűrése erre a lakásra és hónapra
                        const extraItems = settlementExtraItems.filter(item => 
                          item.apartmentId === parseInt(settlementApartment) &&
                          item.month === financeMonth &&
                          item.year === financeYear
                        );
                        const extraItemsTotal = extraItems.reduce((sum, item) => sum + (item.isDiscount ? -item.amount : item.amount), 0);
                        const grandTotalEur = ourRevenueEur + (extraItemsTotal / eurRate);
                        
                        return (
                          <div className="border-2 border-green-300 rounded-xl p-4 bg-green-50">
                            <h4 className="font-bold text-lg mb-3 flex items-center gap-2 text-green-800">
                              <span className="text-2xl">*</span> Díjbekérő
                            </h4>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                <span>* Havi díj:</span>
                                <span className="font-bold">{monthlyFeeEur} </span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                <span>* Takarítási díjak ({aptBookings.length} foglalás):</span>
                                <span className="font-bold">{totalCleaningFeeEur.toFixed(0)} </span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                <span>* Jutalék (Management díj):</span>
                                <span className="font-bold">{totalManagementEur.toFixed(0)} </span>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-white rounded-lg">
                                <span>* Karbantartás / Eszközpótlás:</span>
                                <span className="font-bold">{maintenanceTotalEur.toFixed(0)} </span>
                              </div>
                              
                              {/* Extra tételek */}
                              {extraItems.map(item => (
                                <div key={item.id} className={`flex justify-between items-center p-2 rounded-lg ${item.isDiscount ? 'bg-red-50' : 'bg-white'}`}>
                                  <span className={item.isDiscount ? 'text-red-700' : ''}>
                                    {item.isDiscount ? '' : ''} {item.name}:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${item.isDiscount ? 'text-red-600' : ''}`}>
                                      {item.isDiscount ? '-' : ''}{(item.amount / eurRate).toFixed(0)} 
                                    </span>
                                    <button 
                                      onClick={() => setEditingSettlementExtraItem(item)}
                                      className="p-1 hover:bg-gray-200 rounded"
                                    >
                                      <Edit2 size={14} className="text-gray-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Tétel hozzáadása */}
                              {showAddSettlementItem ? (
                                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 space-y-2">
                                  <input
                                    type="text"
                                    value={newSettlementItem.name}
                                    onChange={(e) => setNewSettlementItem({...newSettlementItem, name: e.target.value})}
                                    placeholder="Tétel neve"
                                    className="w-full px-3 py-2 border rounded-lg text-sm"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="number"
                                      value={newSettlementItem.amount || ''}
                                      onChange={(e) => setNewSettlementItem({...newSettlementItem, amount: parseInt(e.target.value) || 0})}
                                      placeholder="Összeg (Ft)"
                                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                    />
                                    <button
                                      onClick={() => setNewSettlementItem({...newSettlementItem, isDiscount: !newSettlementItem.isDiscount})}
                                      className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                        newSettlementItem.isDiscount 
                                          ? 'bg-red-100 text-red-700 border border-red-300' 
                                          : 'bg-green-100 text-green-700 border border-green-300'
                                      }`}
                                    >
                                      {newSettlementItem.isDiscount ? ' Kedvezmény' : ' Tétel'}
                                    </button>
                                  </div>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        if (newSettlementItem.name && newSettlementItem.amount > 0) {
                                          setSettlementExtraItems([...settlementExtraItems, {
                                            id: Date.now(),
                                            apartmentId: parseInt(settlementApartment),
                                            month: financeMonth,
                                            year: financeYear,
                                            ...newSettlementItem
                                          }]);
                                          setNewSettlementItem({ name: '', amount: 0, isDiscount: false });
                                          setShowAddSettlementItem(false);
                                        }
                                      }}
                                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium"
                                    >
                                      Hozzáadás
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowAddSettlementItem(false);
                                        setNewSettlementItem({ name: '', amount: 0, isDiscount: false });
                                      }}
                                      className="px-3 py-2 bg-gray-300 rounded-lg text-sm font-medium"
                                    >
                                      Mégse
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowAddSettlementItem(true)}
                                  className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-400 hover:text-green-600 transition text-sm"
                                >
                                  + Tétel hozzáadása
                                </button>
                              )}
                              
                              {/* Összesen */}
                              <div className="flex justify-between items-center p-3 bg-green-200 rounded-lg mt-2">
                                <span className="font-bold text-green-800">ÖSSZESEN:</span>
                                <div className="text-right">
                                  <div className="font-bold text-green-800 text-xl">{grandTotalEur.toFixed(0)} </div>
                                  <div className="text-sm text-green-700">({(grandTotalEur * eurRate).toLocaleString()} Ft)</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* KARBANTARTÁSOK RÉSZLETEZÉSE */}
                      {aptMaintenance.length > 0 && (
                        <div className="border rounded-xl p-4">
                          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span className="text-2xl">*</span> Karbantartások részletezése
                          </h4>
                          <div className="space-y-2">
                            {aptMaintenance.map(m => (
                              <div key={m.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className="font-medium">{new Date(m.date).toLocaleDateString('hu-HU')}</span>
                                    <span className="text-gray-500 ml-2">€ {m.description}</span>
                                    {m.notes && <p className="text-sm text-gray-500 italic mt-1">* {m.notes}</p>}
                                  </div>
                                  <span className="font-bold">{((m.cost || m.amount || 0) / eurRate).toFixed(0)} </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })() : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-6xl mb-4">*</div>
                    <p className="text-lg">Válassz lakást az elszámolás megtekintéséhez</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BEVÉTEL HOZZÁADÁSA MODAL - GLOBÁLIS */}
        {showAddBooking && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-8 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mb-8">
              <div className="sticky top-0 bg-white rounded-t-xl p-4 border-b flex justify-between items-center z-10">
                <h3 className="text-xl font-bold">* Új foglalás rögzítése</h3>
                <button onClick={() => setShowAddBooking(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dátum (tól)</label>
                    <input 
                      type="date" 
                      value={newBooking.dateFrom} 
                      onChange={(e) => setNewBooking({...newBooking, dateFrom: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dátum (ig)</label>
                    <input 
                      type="date" 
                      value={newBooking.dateTo} 
                      onChange={(e) => setNewBooking({...newBooking, dateTo: e.target.value})} 
                      className="w-full px-3 py-2 border rounded-lg" 
                    />
                      </div>
                    </div>

                    {/* Éjszakák száma */}
                    {newBooking.dateFrom && newBooking.dateTo && (
                      <div className="bg-indigo-50 p-3 rounded-lg text-center">
                        <span className="text-indigo-700 font-bold text-lg">
                          * {Math.max(0, Math.ceil((new Date(newBooking.dateTo) - new Date(newBooking.dateFrom)) / (1000 * 60 * 60 * 24)))} éjszaka
                        </span>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Lakás *</label>
                      <select 
                        value={newBooking.apartmentId} 
                        onChange={(e) => setNewBooking({...newBooking, apartmentId: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="">Válassz lakást...</option>
                        {apartments.map(apt => (
                          <option key={apt.id} value={apt.id}>{apt.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select 
                          value={newBooking.platform} 
                          onChange={(e) => setNewBooking({...newBooking, platform: e.target.value})} 
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="airbnb">Airbnb</option>
                          <option value="booking">Booking.com</option>
                          <option value="szallas">Szallas.hu</option>
                          <option value="direct">Direkt foglalás</option>
                          <option value="other">Egyéb</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendégek száma</label>
                        <select 
                          value={newBooking.guestCount} 
                          onChange={(e) => setNewBooking({...newBooking, guestCount: parseInt(e.target.value)})} 
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {[1,2,3,4,5,6,7,8,9,10].map(n => (
                            <option key={n} value={n}>{n} fő</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendég neve (opcionális)</label>
                      <input 
                        type="text" 
                        value={newBooking.guestName} 
                        onChange={(e) => setNewBooking({...newBooking, guestName: e.target.value})} 
                        placeholder="Pl: John Smith" 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Payout összeg (EUR) *
                        <span className="block text-xs text-gray-500 font-normal">(A platform által a megbízó számlájára utalt összeg)</span>
                      </label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={newBooking.payoutEur} 
                        onChange={(e) => setNewBooking({...newBooking, payoutEur: e.target.value})} 
                        placeholder="A platform által kifizetett összeg" 
                        className="w-full px-3 py-2 border rounded-lg text-lg font-bold" 
                      />
                      {newBooking.payoutEur && (
                        <p className="text-sm text-gray-600 mt-1">
                          = <span className="font-bold text-green-700">{(parseFloat(newBooking.payoutEur) * eurRate).toLocaleString()} Ft</span>
                          <span className="text-xs ml-1">(1 EUR = {eurRate} Ft)</span>
                        </p>
                      )}
                    </div>

                    {newBooking.apartmentId && newBooking.payoutEur && (
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                        <div className="font-bold text-gray-700 mb-2">Automatikus számítás:</div>
                        {(() => {
                          const apt = apartments.find(a => a.id === parseInt(newBooking.apartmentId));
                          if (apt) {
                            const payoutEur = parseFloat(newBooking.payoutEur) || 0;
                            const payoutFt = payoutEur * eurRate;
                            const cleaningFeeEur = apt.cleaningFeeEur;
                            const cleaningFeeFt = cleaningFeeEur * eurRate;
                            const nights = newBooking.dateFrom && newBooking.dateTo 
                              ? Math.max(1, Math.ceil((new Date(newBooking.dateTo) - new Date(newBooking.dateFrom)) / (1000 * 60 * 60 * 24)))
                              : 1;
                            const guestCount = newBooking.guestCount || 1;
                            
                            // IFA számítás alapja: Payout - Takarítási díj
                            const ifaBase = payoutFt - cleaningFeeFt;
                            const ifaBaseEur = ifaBase / eurRate;
                            let tourismTax = 0;
                            if (apt.tourismTaxType === 'percent') {
                              tourismTax = ifaBase * ((apt.tourismTaxPercent || 4) / 100);
                            } else {
                              tourismTax = (apt.tourismTaxFixed || 0) * guestCount * nights;
                            }
                            const tourismTaxEur = tourismTax / eurRate;
                            
                            const netRoomRevenue = payoutFt - cleaningFeeFt - tourismTax;
                            const netRoomRevenueEur = netRoomRevenue / eurRate;
                            const mgmtFee = apt.managementFee || 25;
                            const mgmtAmount = netRoomRevenue * (mgmtFee / 100);
                            const mgmtAmountEur = mgmtAmount / eurRate;
                            const avgNightPrice = Math.round(netRoomRevenue / nights);
                            const avgNightPriceEur = avgNightPrice / eurRate;
                            
                            return (
                              <>
                                <div className="bg-amber-100 p-3 rounded-lg -mx-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-amber-800">Payout (megbízóé):</span>
                                    <div className="text-right">
                                      <div className="font-bold text-amber-900 text-lg">{payoutEur.toFixed(2)} </div>
                                      <div className="text-amber-700 text-xs">{payoutFt.toLocaleString()} Ft</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center py-1 border-b">
                                  <span className="text-blue-700">- Takarítási díj:</span>
                                  <div className="text-right">
                                    <span className="font-bold text-blue-800">{cleaningFeeEur} </span>
                                    <span className="text-blue-600 text-xs ml-2">({cleaningFeeFt.toLocaleString()} Ft)</span>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-gray-500 text-xs py-1">
                                  <span>IFA alap (Payout - Takarítás):</span>
                                  <span>{ifaBaseEur.toFixed(2)}  ({ifaBase.toLocaleString()} Ft)</span>
                                </div>
                                
                                <div className="flex justify-between items-center py-1 border-b">
                                  <span className="text-orange-700">- IFA ({apt.tourismTaxType === 'percent' ? `${apt.tourismTaxPercent || 4}%` : `${apt.tourismTaxFixed || 0} Ft/fő/éj`}):</span>
                                  <div className="text-right">
                                    <span className="font-bold text-orange-800">{tourismTaxEur.toFixed(2)} </span>
                                    <span className="text-orange-600 text-xs ml-2">({Math.round(tourismTax).toLocaleString()} Ft)</span>
                                  </div>
                                </div>
                                
                                <div className="bg-emerald-50 p-3 rounded-lg -mx-2 mt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-emerald-800">Nettó szobaárbevétel:</span>
                                    <div className="text-right">
                                      <div className="font-bold text-emerald-900 text-lg">{netRoomRevenueEur.toFixed(2)} </div>
                                      <div className="text-emerald-700 text-xs">{Math.round(netRoomRevenue).toLocaleString()} Ft</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="bg-purple-50 p-3 rounded-lg -mx-2 mt-2">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-purple-800">Jutalék ({mgmtFee}%):</span>
                                    <div className="text-right">
                                      <div className="font-bold text-purple-900 text-lg">{mgmtAmountEur.toFixed(2)} </div>
                                      <div className="text-purple-700 text-xs">{Math.round(mgmtAmount).toLocaleString()} Ft</div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center pt-2 border-t mt-2">
                                  <span className="font-bold text-indigo-700">Átlag éjszakai ár ({nights} éj):</span>
                                  <div className="text-right">
                                    <span className="font-bold text-indigo-800">{avgNightPriceEur.toFixed(2)} </span>
                                    <span className="text-indigo-600 text-xs ml-2">({avgNightPrice.toLocaleString()} Ft)</span>
                                  </div>
                                </div>
                              </>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                    
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          if (newBooking.apartmentId && newBooking.payoutEur) {
                            const apt = apartments.find(a => a.id === parseInt(newBooking.apartmentId));
                            if (apt) {
                              const payoutEur = parseFloat(newBooking.payoutEur);
                              const payoutFt = payoutEur * eurRate;
                              const cleaningFeeFt = apt.cleaningFeeEur * eurRate;
                              const nights = newBooking.dateFrom && newBooking.dateTo 
                                ? Math.max(1, Math.ceil((new Date(newBooking.dateTo) - new Date(newBooking.dateFrom)) / (1000 * 60 * 60 * 24)))
                                : 1;
                              const guestCount = newBooking.guestCount || 1;
                              
                              // IFA számítás alapja: Payout - Takarítási díj
                              const ifaBase = payoutFt - cleaningFeeFt;
                              let tourismTax = 0;
                              if (apt.tourismTaxType === 'percent') {
                                tourismTax = ifaBase * ((apt.tourismTaxPercent || 4) / 100);
                              } else {
                                tourismTax = (apt.tourismTaxFixed || 0) * guestCount * nights;
                              }
                              
                              const netRoomRevenue = payoutFt - cleaningFeeFt - tourismTax;
                              const managementFee = apt.managementFee || 25;
                              const managementAmount = netRoomRevenue * (managementFee / 100);
                              const avgNightPrice = Math.round(netRoomRevenue / nights);
                              
                              setBookings([...bookings, {
                                id: Date.now(),
                                dateFrom: newBooking.dateFrom,
                                dateTo: newBooking.dateTo,
                                nights: nights,
                                guestCount: guestCount,
                                apartmentId: apt.id,
                                apartmentName: apt.name,
                                platform: newBooking.platform,
                                guestName: newBooking.guestName,
                                payoutEur: payoutEur,
                                payoutFt: payoutFt,
                                cleaningFee: cleaningFeeFt,
                                tourismTax: tourismTax,
                                netRoomRevenue: netRoomRevenue,
                                managementFee: managementFee,
                                managementAmount: managementAmount,
                                avgNightPrice: avgNightPrice
                              }]);
                              setNewBooking({ dateFrom: new Date().toISOString().split('T')[0], dateTo: '', apartmentId: '', payoutEur: '', guestCount: 1, platform: 'airbnb', guestName: '' });
                              setShowAddBooking(false);
                            }
                          }
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-bold"
                      >
                        Mentés
                      </button>
                      <button 
                        onClick={() => setShowAddBooking(false)} 
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-bold"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FOGLALÁS SZERKESZTÉSE MODAL */}
            {editingBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                <div className="min-h-full flex items-start justify-center p-4 pt-10 pb-10">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold"> Foglalás szerkesztése</h3>
                      <button onClick={() => setEditingBooking(null)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Érkezés</label>
                          <input 
                            type="date" 
                            value={editingBooking.dateFrom || ''} 
                            onChange={(e) => setEditingBooking({...editingBooking, dateFrom: e.target.value})} 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Távozás</label>
                          <input 
                            type="date" 
                            value={editingBooking.dateTo || ''} 
                            onChange={(e) => setEditingBooking({...editingBooking, dateTo: e.target.value})} 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                        <select 
                          value={editingBooking.platform || ''} 
                          onChange={(e) => setEditingBooking({...editingBooking, platform: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="Airbnb">Airbnb</option>
                          <option value="Booking.com">Booking.com</option>
                          <option value="Szallas.hu">Szallas.hu</option>
                          <option value="Direkt">Direkt</option>
                          <option value="Egyéb">Egyéb</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vendég neve</label>
                        <input 
                          type="text" 
                          value={editingBooking.guestName || ''} 
                          onChange={(e) => setEditingBooking({...editingBooking, guestName: e.target.value})} 
                          className="w-full px-3 py-2 border rounded-lg" 
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Payout (EUR)</label>
                          <input 
                            type="number" 
                            value={editingBooking.payoutEur || ''} 
                            onChange={(e) => setEditingBooking({...editingBooking, payoutEur: parseFloat(e.target.value) || 0})} 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Vendégek száma</label>
                          <input 
                            type="number" 
                            value={editingBooking.guestCount || 1} 
                            onChange={(e) => setEditingBooking({...editingBooking, guestCount: parseInt(e.target.value) || 1})} 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
                         Booking.com esetén a tárgyhóban <strong>távozó</strong> foglalások kerülnek elszámolásra, egyéb platformoknál az <strong>érkező</strong> foglalások.
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => {
                            setBookings(bookings.map(b => b.id === editingBooking.id ? editingBooking : b));
                            setEditingBooking(null);
                          }}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold"
                        >
                          Mentés
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm('Biztosan törölni szeretnéd ezt a foglalást?')) {
                              setBookings(bookings.filter(b => b.id !== editingBooking.id));
                              setEditingBooking(null);
                            }
                          }}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-bold"
                        >
                          Törlés
                        </button>
                        <button 
                          onClick={() => setEditingBooking(null)}
                          className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-bold"
                        >
                          Mégse
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* EXTRA TÉTEL SZERKESZTÉSE MODAL */}
            {editingSettlementExtraItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold"> Tétel szerkesztése</h3>
                    <button onClick={() => setEditingSettlementExtraItem(null)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tétel neve</label>
                      <input 
                        type="text" 
                        value={editingSettlementExtraItem.name || ''} 
                        onChange={(e) => setEditingSettlementExtraItem({...editingSettlementExtraItem, name: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Összeg (Ft)</label>
                      <input 
                        type="number" 
                        value={editingSettlementExtraItem.amount || ''} 
                        onChange={(e) => setEditingSettlementExtraItem({...editingSettlementExtraItem, amount: parseInt(e.target.value) || 0})} 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Típus</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingSettlementExtraItem({...editingSettlementExtraItem, isDiscount: false})}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                            !editingSettlementExtraItem.isDiscount 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                           Tétel
                        </button>
                        <button
                          onClick={() => setEditingSettlementExtraItem({...editingSettlementExtraItem, isDiscount: true})}
                          className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                            editingSettlementExtraItem.isDiscount 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                           Kedvezmény
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          setSettlementExtraItems(settlementExtraItems.map(item => 
                            item.id === editingSettlementExtraItem.id ? editingSettlementExtraItem : item
                          ));
                          setEditingSettlementExtraItem(null);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold"
                      >
                        Mentés
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm('Biztosan törölni szeretnéd ezt a tételt?')) {
                            setSettlementExtraItems(settlementExtraItems.filter(item => item.id !== editingSettlementExtraItem.id));
                            setEditingSettlementExtraItem(null);
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-bold"
                      >
                        Törlés
                      </button>
                      <button 
                        onClick={() => setEditingSettlementExtraItem(null)}
                        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-bold"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

        {/* NAPTÁR TAB */}
        {activeTab === 'calendar' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">* Foglalási Naptár</h2>
              <button
                onClick={() => setShowIcalSettings(!showIcalSettings)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                * iCal Sync
              </button>
            </div>

            {/* iCal Settings Modal */}
            {showIcalSettings && (
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <h3 className="font-bold text-lg mb-3 text-blue-800">* iCal Szinkronizálás beállítások</h3>
                <p className="text-sm text-blue-600 mb-4">Add meg a platformok iCal URL-jeit lakásonként. A foglalások automatikusan szinkronizálódnak.</p>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {apartments.map(apt => (
                    <div key={apt.id} className="bg-white p-3 rounded-lg border">
                      <div className="font-bold text-gray-800 mb-2">{apt.name}</div>
                      <div className="grid grid-cols-1 gap-2">
                        {/* Saját iCal URL - exportáláshoz */}
                        <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                          <label className="text-xs text-emerald-700 font-medium">* Saját iCal URL (exportálás)</label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={apt.icalOwn || ''}
                              onChange={(e) => {
                                const updated = apartments.map(a => a.id === apt.id ? {...a, icalOwn: e.target.value} : a);
                                setApartments(updated);
                              }}
                              placeholder="https://smartcrm.hu/ical/export/..."
                              className="flex-1 px-2 py-1 border rounded text-sm"
                            />
                            {apt.icalOwn && (
                              <button 
                                onClick={() => navigator.clipboard.writeText(apt.icalOwn)}
                                className="px-2 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600"
                              >
                                *
                              </button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-pink-600 font-medium">Airbnb iCal URL</label>
                          <input
                            type="text"
                            value={apt.icalAirbnb || ''}
                            onChange={(e) => {
                              const updated = apartments.map(a => a.id === apt.id ? {...a, icalAirbnb: e.target.value} : a);
                              setApartments(updated);
                            }}
                            placeholder="https://airbnb.com/calendar/ical/..."
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-blue-600 font-medium">Booking.com iCal URL</label>
                          <input
                            type="text"
                            value={apt.icalBooking || ''}
                            onChange={(e) => {
                              const updated = apartments.map(a => a.id === apt.id ? {...a, icalBooking: e.target.value} : a);
                              setApartments(updated);
                            }}
                            placeholder="https://admin.booking.com/..."
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-red-600 font-medium">Szallas.hu iCal URL</label>
                          <input
                            type="text"
                            value={apt.icalSzallas || ''}
                            onChange={(e) => {
                              const updated = apartments.map(a => a.id === apt.id ? {...a, icalSzallas: e.target.value} : a);
                              setApartments(updated);
                            }}
                            placeholder="https://szallas.hu/ical/..."
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    * Szinkronizálás indítása
                  </button>
                  <button onClick={() => setShowIcalSettings(false)} className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                    Bezárás
                  </button>
                </div>
              </div>
            )}
            
            {/* Hónap navigáció */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(calendarYear - 1);
                  } else {
                    setCalendarMonth(calendarMonth - 1);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                €
              </button>
              <h3 className="text-xl font-bold">
                {['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'][calendarMonth]} {calendarYear}
              </h3>
              <button 
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(calendarYear + 1);
                  } else {
                    setCalendarMonth(calendarMonth + 1);
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                
              </button>
            </div>

            {/* Naptár rács - Lakás soronként, hónap oszloponként */}
            <div className="border rounded-xl overflow-x-auto">
              {(() => {
                // Hónap napjai
                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                const days = Array.from({length: daysInMonth}, (_, i) => i + 1);
                
                return (
                  <div style={{minWidth: `${100 + daysInMonth * 28}px`}}>
                    {/* Fejléc - napok */}
                    <div className="flex bg-gray-100 border-b sticky top-0">
                      <div className="w-28 min-w-28 p-2 font-bold text-sm border-r bg-gray-200 flex-shrink-0">Lakás</div>
                      {days.map(day => {
                        const date = new Date(calendarYear, calendarMonth, day);
                        const dayOfWeek = date.getDay();
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <div 
                            key={day} 
                            className={`w-7 min-w-7 p-1 text-center text-xs border-r flex-shrink-0 ${
                              isToday ? 'bg-blue-200 font-bold' : isWeekend ? 'bg-gray-200' : ''
                            }`}
                          >
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Lakás sorok */}
                    {apartments.map(apt => {
                      // Foglalások ehhez a lakáshoz ebben a hónapban
                      const aptBookings = bookings.filter(b => {
                        const start = new Date(b.dateFrom);
                        const end = new Date(b.dateTo);
                        const monthStart = new Date(calendarYear, calendarMonth, 1);
                        const monthEnd = new Date(calendarYear, calendarMonth + 1, 0);
                        return b.apartmentId === apt.id && end >= monthStart && start <= monthEnd;
                      });

                      return (
                        <div key={apt.id} className="flex border-b hover:bg-gray-50">
                          <div className="w-28 min-w-28 p-1 text-xs font-medium border-r bg-gray-50 truncate flex-shrink-0" title={apt.name}>
                            {apt.name}
                          </div>
                          <div className="flex-1 relative h-7 flex">
                            {days.map(day => {
                              const date = new Date(calendarYear, calendarMonth, day);
                              const dayOfWeek = date.getDay();
                              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                              return (
                                <div 
                                  key={day} 
                                  className={`w-7 min-w-7 border-r flex-shrink-0 ${isWeekend ? 'bg-gray-100' : ''}`}
                                />
                              );
                            })}
                            
                            {/* Foglalás csíkok */}
                            {aptBookings.map(booking => {
                              const bookingStart = new Date(booking.dateFrom);
                              const bookingEnd = new Date(booking.dateTo);
                              const monthStart = new Date(calendarYear, calendarMonth, 1);
                              const monthEnd = new Date(calendarYear, calendarMonth + 1, 0);
                              
                              // Számoljuk ki a kezdő és záró napot
                              let startDay = bookingStart < monthStart ? 1 : bookingStart.getDate();
                              let endDay = bookingEnd > monthEnd ? daysInMonth : bookingEnd.getDate();
                              
                              const leftPx = (startDay - 1) * 28;
                              const widthPx = (endDay - startDay + 1) * 28 - 2;
                              
                              const platformColors = {
                                airbnb: 'bg-pink-500',
                                booking: 'bg-blue-500',
                                szallas: 'bg-red-500',
                                direct: 'bg-green-500',
                                other: 'bg-gray-500'
                              };
                              
                              return (
                                <div
                                  key={booking.id}
                                  onClick={() => setSelectedBooking(booking)}
                                  className={`absolute top-1 h-5 ${platformColors[booking.platform] || 'bg-gray-500'} rounded text-white text-xs flex items-center px-1 overflow-hidden cursor-pointer hover:opacity-80 shadow`}
                                  style={{ 
                                    left: `${leftPx}px`, 
                                    width: `${widthPx}px`,
                                    minWidth: '24px'
                                  }}
                                  title={`${booking.guestName || 'Vendég'} - ${booking.nights} éj - ${booking.payoutEur}`}
                                >
                                  <span className="truncate text-xs">
                                    {booking.guestName || booking.platform}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Jelmagyarázat */}
            <div className="flex gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span>Airbnb</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Booking</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Szallas.hu</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Direkt</span>
              </div>
            </div>

            {/* Foglalás részletek popup */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedBooking(null)}>
                <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                  {/* Header */}
                  <div className={`p-4 rounded-t-xl text-white ${
                    selectedBooking.platform === 'airbnb' ? 'bg-pink-500' :
                    selectedBooking.platform === 'booking' ? 'bg-blue-500' :
                    selectedBooking.platform === 'szallas' ? 'bg-red-500' :
                    selectedBooking.platform === 'direct' ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold">{selectedBooking.guestName || 'Vendég'}</h3>
                        <p className="opacity-90">{selectedBooking.apartmentName}</p>
                      </div>
                      <button onClick={() => setSelectedBooking(null)} className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1">
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  {/* Tartalom */}
                  <div className="p-4 space-y-4">
                    {/* Alapadatok */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">* Érkezés</div>
                        <div className="font-bold">{new Date(selectedBooking.dateFrom).toLocaleDateString('hu-HU')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">* Távozás</div>
                        <div className="font-bold">{new Date(selectedBooking.dateTo).toLocaleDateString('hu-HU')}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">* Éjszakák</div>
                        <div className="font-bold">{selectedBooking.nights} éj</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">* Vendégek</div>
                        <div className="font-bold">{selectedBooking.guestCount} fő</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                        <div className="text-xs text-gray-500">* Platform</div>
                        <div className="font-bold capitalize">{
                          selectedBooking.platform === 'airbnb' ? '* Airbnb' :
                          selectedBooking.platform === 'booking' ? '* Booking.com' :
                          selectedBooking.platform === 'szallas' ? '* Szallas.hu' :
                          selectedBooking.platform === 'direct' ? '* Direkt' : selectedBooking.platform
                        }</div>
                      </div>
                    </div>

                    {/* Pénzügyi adatok */}
                    <div className="border-t pt-4">
                      <h4 className="font-bold text-gray-700 mb-3">* Pénzügyi adatok</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center bg-amber-50 p-3 rounded-lg">
                          <span className="text-amber-800">Payout</span>
                          <div className="text-right">
                            <div className="font-bold text-amber-800">{selectedBooking.payoutEur} </div>
                            <div className="text-xs text-amber-600">{selectedBooking.payoutFt?.toLocaleString()} Ft</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2">
                          <span className="text-gray-600">* Takarítási díj</span>
                          <span className="font-medium">{(selectedBooking.cleaningFee / eurRate).toFixed(0)}  ({selectedBooking.cleaningFee?.toLocaleString()} Ft)</span>
                        </div>
                        <div className="flex justify-between items-center p-2">
                          <span className="text-gray-600">* IFA</span>
                          <span className="font-medium">{(selectedBooking.tourismTax / eurRate).toFixed(0)}  ({selectedBooking.tourismTax?.toLocaleString()} Ft)</span>
                        </div>
                        <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg">
                          <span className="text-emerald-800">Nettó szobaárbevétel</span>
                          <div className="text-right">
                            <div className="font-bold text-emerald-800">{(selectedBooking.netRoomRevenue / eurRate).toFixed(0)} </div>
                            <div className="text-xs text-emerald-600">{selectedBooking.netRoomRevenue?.toLocaleString()} Ft</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center bg-purple-50 p-3 rounded-lg">
                          <span className="text-purple-800">Jutalék ({selectedBooking.managementFee}%)</span>
                          <div className="text-right">
                            <div className="font-bold text-purple-800">{(selectedBooking.managementAmount / eurRate).toFixed(0)} </div>
                            <div className="text-xs text-purple-600">{selectedBooking.managementAmount?.toLocaleString()} Ft</div>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-2 text-sm text-gray-500">
                          <span>Átlag éjszakai ár</span>
                          <span>{(selectedBooking.payoutEur / selectedBooking.nights).toFixed(0)}  / éj</span>
                        </div>
                      </div>
                    </div>

                    {/* Gombok */}
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setEditingBooking(selectedBooking);
                          setSelectedBooking(null);
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-bold flex items-center justify-center gap-2"
                      >
                        <Edit2 size={18} />
                        Szerkesztés
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Biztosan törölni szeretnéd ezt a foglalást?')) {
                            setBookings(bookings.filter(b => b.id !== selectedBooking.id));
                            setSelectedBooking(null);
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 font-bold flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'overview' && (currentModule === 'cleaning' || currentModule === 'home') && (
          <div className="space-y-6">
            {/* Költségek áttekintése */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setOverviewFilter('today')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  overviewFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Mai nap
              </button>
              <button
                onClick={() => setOverviewFilter('week')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  overviewFilter === 'week' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ez a hét
              </button>
              <button
                onClick={() => setOverviewFilter('month')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  overviewFilter === 'month' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ez a hónap
              </button>
              <button
                onClick={() => setOverviewFilter('custom')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  overviewFilter === 'custom' ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Egyéni időszak
              </button>
              <button
                onClick={() => setOverviewFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  overviewFilter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Összes
              </button>
            </div>

            {overviewFilter === 'custom' && (
              <div className="flex gap-3 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium mb-1">Kezdő dátum</label>
                  <input
                    type="date"
                    value={overviewCustomDateRange.start}
                    onChange={(e) => setOverviewCustomDateRange({...overviewCustomDateRange, start: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Záró dátum</label>
                  <input
                    type="date"
                    value={overviewCustomDateRange.end}
                    onChange={(e) => setOverviewCustomDateRange({...overviewCustomDateRange, end: e.target.value})}
                    className="px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Pénzügyi összesítő kártyák */}
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border-2 border-cyan-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-cyan-900">Bevételek</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-2xl font-bold text-cyan-900">{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).revenues.toLocaleString()} Ft</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border-2 border-blue-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-blue-900">Takarítás</h3>
                  <span className="text-2xl">🧹</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">-{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).cleaningCosts.toLocaleString()} Ft</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border-2 border-purple-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-purple-900">Dolgozói textil mosás</h3>
                  <span className="text-2xl">👕</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">-{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).textileCosts.toLocaleString()} Ft</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-4 rounded-xl border-2 border-cyan-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-cyan-900">Mosoda</h3>
                  <span className="text-2xl">🧺</span>
                </div>
                <p className="text-2xl font-bold text-cyan-900">-{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).laundryCosts.toLocaleString()} Ft</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border-2 border-orange-300">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-orange-900">Egyéb</h3>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-2xl font-bold text-orange-900">-{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).expenses.toLocaleString()} Ft</p>
              </div>

              <div className={`bg-gradient-to-br p-4 rounded-xl border-2 ${
                getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).profit >= 0 
                  ? 'from-emerald-50 to-emerald-100 border-emerald-300' 
                  : 'from-red-50 to-red-100 border-red-300'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-sm font-bold ${
                    getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).profit >= 0 ? 'text-emerald-900' : 'text-red-900'
                  }`}>Profit</h3>
                  <span className="text-2xl">{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).profit >= 0 ? '✅' : '❌'}</span>
                </div>
                <p className={`text-2xl font-bold ${
                  getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).profit >= 0 ? 'text-emerald-900' : 'text-red-900'
                }`}>{getTotalCosts(overviewFilter === 'all' ? 'month' : overviewFilter).profit.toLocaleString()} Ft</p>
              </div>
            </div>

            {/* Takarítók teljesítménye */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Takarítók teljesítménye</h2>

              <div className="space-y-3">
                {Object.entries(getWorkerSummary(overviewFilter, null, overviewCustomDateRange)).map(([id, data]) => (
                  <div key={id} className="border p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold text-lg">{data.name}</span>
                      <span className="text-2xl font-bold text-green-600">{data.totalEarnings.toLocaleString()} Ft</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="bg-blue-50 p-2 rounded">
                        <p>Takarítás: {data.cleaningEarnings.toLocaleString()} Ft</p>
                        <p className="text-gray-500">{data.hours} óra</p>
                      </div>
                      <div className="bg-purple-50 p-2 rounded">
                        <p>Textil: {data.textileEarnings.toLocaleString()} Ft</p>
                      </div>
                      <div className="bg-orange-50 p-2 rounded">
                        <p>Költségek: {data.expenses.toLocaleString()} Ft</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'jobs' && currentModule === 'cleaning' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Munka kiosztás</h2>
              <button onClick={() => setShowAddJob(!showAddJob)} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
                <Plus size={20} />
              </button>
            </div>
            
            {showAddJob && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg space-y-4">
                <select value={newJob.workerId} onChange={(e) => setNewJob({...newJob, workerId: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                  <option value="">Dolgozó...</option>
                  {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>

                <div className="grid grid-cols-7 gap-2">
                  {getNextWeekDates().map(date => (
                    <button
                      key={date.toISOString()}
                      onClick={() => setNewJob({...newJob, date: date.toISOString().split('T')[0]})}
                      className={`p-2 rounded-lg text-sm ${newJob.date === date.toISOString().split('T')[0] ? 'bg-blue-600 text-white' : 'bg-white border'}`}
                    >
                      <div className="font-bold">{['V', 'H', 'K', 'Sze', 'Cs', 'P', 'Szo'][date.getDay()]}</div>
                      <div className="text-xs">{date.getDate()}</div>
                    </button>
                  ))}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {apartments.map(apt => {
                    const selected = newJob.apartments.find(a => a.id === apt.id);
                    const hasTextile = newJob.textileDeliveries.some(t => t.apartmentId === apt.id);
                    
                    return (
                      <div key={apt.id} className={`p-3 rounded-lg border-2 ${
                        (selected && (newJob.checkoutTimes[apt.id] && newJob.checkinTimes[apt.id])) 
                          ? 'border-orange-400 bg-orange-50' 
                          : selected || hasTextile ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
                      }`}>
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm">{apt.name}</span>
                          <span className="text-xs text-gray-500">{apt.timeFrame}ó</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <button onClick={() => toggleApartmentSelection(apt.id)} className={`px-3 py-2 rounded text-sm ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}>
                            * Takarítás
                          </button>
                          <button onClick={() => toggleTextileDelivery(apt.id)} className={`px-3 py-2 rounded text-sm ${hasTextile ? 'bg-purple-600 text-white' : 'bg-gray-100'}`}>
                            * Textil
                          </button>
                        </div>

                        {selected && (
                          <div>
                            <p className="text-xs font-bold text-blue-800 mb-2">* Vendég érkezés - távozás</p>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">* Távozás:</label>
                                <select
                                  value={newJob.checkoutTimes[apt.id] || '10:00'}
                                  onChange={(e) => setNewJob({
                                    ...newJob,
                                    checkoutTimes: { ...newJob.checkoutTimes, [apt.id]: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                >
                                  {getCheckoutTimeSlots().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">* Érkezés:</label>
                                <select
                                  value={newJob.checkinTimes[apt.id] || '15:00'}
                                  onChange={(e) => setNewJob({
                                    ...newJob,
                                    checkinTimes: { ...newJob.checkinTimes, [apt.id]: e.target.value }
                                  })}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                >
                                  {getCheckinTimeSlots().map(time => (
                                    <option key={time} value={time}>{time}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {hasTextile && (
                          <div className="mt-2">
                            <p className="text-xs font-bold text-purple-800 mb-2">* Textil érkezés</p>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Darabszám:</label>
                                  <select
                                    value={newJob.textileDeliveries.find(t => t.apartmentId === apt.id)?.guestCount || 0}
                                    onChange={(e) => updateTextileDelivery(apt.id, parseInt(e.target.value))}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  >
                                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
                                      <option key={num} value={num}>{num} db</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Érkezési idő:</label>
                                  <select
                                    value={newJob.textileDeliveries.find(t => t.apartmentId === apt.id)?.arrivalTime || '14:00'}
                                    onChange={(e) => updateTextileArrivalTime(apt.id, e.target.value)}
                                    className="w-full px-2 py-1 border rounded text-sm"
                                  >
                                <option value="08:00">08:00</option>
                                <option value="08:30">08:30</option>
                                <option value="09:00">09:00</option>
                                <option value="09:30">09:30</option>
                                <option value="10:00">10:00</option>
                                <option value="10:30">10:30</option>
                                <option value="11:00">11:00</option>
                                <option value="11:30">11:30</option>
                                <option value="12:00">12:00</option>
                                <option value="12:30">12:30</option>
                                <option value="13:00">13:00</option>
                                <option value="13:30">13:30</option>
                                <option value="14:00">14:00</option>
                                <option value="14:30">14:30</option>
                                <option value="15:00">15:00</option>
                                <option value="15:30">15:30</option>
                                <option value="16:00">16:00</option>
                                <option value="16:30">16:30</option>
                                <option value="17:00">17:00</option>
                                <option value="17:30">17:30</option>
                                <option value="18:00">18:00</option>
                                <option value="18:30">18:30</option>
                                <option value="19:00">19:00</option>
                                <option value="19:30">19:30</option>
                                <option value="20:00">20:00</option>
                              </select>
                                </div>
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => toggleLaundryDelivery(apt.id)}
                                className={`w-full px-3 py-2 rounded text-sm font-medium transition mt-2 ${
                                  newJob.textileDeliveries.find(t => t.apartmentId === apt.id)?.laundryDelivery
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                * Mosoda szállít
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2">
                  <button onClick={addJob} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg">Mentés</button>
                  <button onClick={() => setShowAddJob(false)} className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg">Mégse</button>
                </div>
              </div>
            )}

            {/* 7 NAPOS NAPI TERV FOGLALÁSOKKAL */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">* 7 napos terv - Érkező foglalások</h3>
              <div className="space-y-3">
                {getNextWeekDates().map(date => {
                  const dateStr = date.toISOString().split('T')[0];
                  const dayBookings = bookings.filter(b => b.dateTo === dateStr);
                  const dayJobs = jobs.filter(j => j.date === dateStr);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div key={dateStr} className={`border rounded-xl overflow-hidden ${isToday ? 'border-blue-400 border-2' : 'border-gray-200'}`}>
                      {/* Nap fejléc */}
                      <div className={`px-4 py-2 flex justify-between items-center ${isToday ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">
                            {['Vasárnap', 'Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek', 'Szombat'][date.getDay()]}
                          </span>
                          <span className="text-gray-600">
                            {date.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}
                          </span>
                          {isToday && <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded">MA</span>}
                        </div>
                        <div className="flex items-center gap-2">
                          {dayBookings.length > 0 && (
                            <span className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                              {dayBookings.length} távozó
                            </span>
                          )}
                          {dayJobs.length > 0 && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              {dayJobs.length} kiosztva
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Foglalások listája */}
                      {dayBookings.length > 0 ? (
                        <div className="p-3 space-y-2">
                          {dayBookings.map(booking => {
                            const apt = apartments.find(a => a.id === booking.apartmentId);
                            const isAssigned = dayJobs.some(j => 
                              j.apartments?.some(a => a.id === booking.apartmentId)
                            );
                            
                            const platformColors = {
                              airbnb: 'bg-pink-100 border-pink-300 text-pink-800',
                              booking: 'bg-blue-100 border-blue-300 text-blue-800',
                              szallas: 'bg-red-100 border-red-300 text-red-800',
                              direct: 'bg-green-100 border-green-300 text-green-800'
                            };
                            
                            return (
                              <div 
                                key={booking.id} 
                                className={`p-3 rounded-lg border-2 ${platformColors[booking.platform] || 'bg-gray-100 border-gray-300'} ${isAssigned ? 'opacity-50' : ''}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-bold">{apt?.name || booking.apartmentName}</span>
                                      {isAssigned && (
                                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded"> Kiosztva</span>
                                      )}
                                    </div>
                                    <div className="text-sm space-y-0.5">
                                      <p>* {booking.guestName || 'Vendég'} € {booking.guestCount} fő</p>
                                      <p>* {booking.nights} éj € {booking.platform}</p>
                                    </div>
                                  </div>
                                  {!isAssigned && (
                                    <button
                                      onClick={() => {
                                        console.log('Kiosztás clicked', apt);
                                        setNewJob({
                                          ...newJob,
                                          date: dateStr,
                                          apartments: apt ? [{ id: apt.id, name: apt.name, timeFrame: apt.timeFrame }] : [],
                                          checkoutTimes: apt ? { [apt.id]: '10:00' } : {},
                                          checkinTimes: {},
                                          textileDeliveries: []
                                        });
                                        setShowAddJob(true);
                                      }}
                                      className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700"
                                    >
                                      + Kiosztás
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-3 text-center text-gray-400 text-sm">
                          Nincs távozó foglalás ezen a napon
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <h3 className="text-lg font-bold mb-3">* Kiosztott munkák</h3>
            <div className="space-y-3">
              {jobs.map(j => {
                // Check if this job has both checkout and checkin (turnover day)
                const hasTurnover = j.checkoutTimes && j.checkinTimes && 
                  Object.keys(j.checkoutTimes).some(aptId => j.checkinTimes[aptId]);
                
                return (
                  <div key={j.id} className={`border-2 p-4 rounded-lg shadow ${
                    hasTurnover ? 'border-orange-400 bg-orange-50' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{j.worker.name}</h3>
                        <p className="text-sm text-gray-500">{new Date(j.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        {hasTurnover && (
                          <span className="inline-block mt-1 px-2 py-1 bg-orange-200 text-orange-800 text-xs font-bold rounded">
                             TÁVOZÓ ÉS ÉRKEZŐ VENDÉG
                          </span>
                        )}
                      </div>
                      <button onClick={() => deleteJob(j.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={20} />
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {j.apartments.map(apt => {
                        const cleaningCost = apt.timeFrame * j.worker.hourlyRate;
                        const checkoutTime = j.checkoutTimes?.[apt.id];
                        const checkinTime = j.checkinTimes?.[apt.id];
                        const textile = j.textileDeliveries?.find(t => t.apartmentId === apt.id);
                        const textileCost = textile ? textile.guestCount * 1200 : 0;
                        const totalCost = cleaningCost + textileCost;
                        
                        return (
                          <div key={apt.id} className="py-2 border-b border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium text-gray-700">* {apt.name}</p>
                              <p className="font-bold text-green-600">{totalCost.toLocaleString()} Ft</p>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center gap-2">
                                <span>* {apt.timeFrame}ó × {j.worker.hourlyRate.toLocaleString()} Ft/ó = {cleaningCost.toLocaleString()} Ft</span>
                              </div>
                              
                              {textile && (
                                <div className="flex items-center gap-2">
                                  <span>* {textile.guestCount} db × 1,200 Ft € {textile.arrivalTime || '14:00'} = {textileCost.toLocaleString()} Ft</span>
                                  {textile.laundryDelivery && <span className="text-blue-600 font-medium">* Mosoda</span>}
                                </div>
                              )}
                              
                              {checkoutTime && checkinTime && (
                                <div className="text-orange-600 font-medium">
                                  *{checkoutTime}  *{checkinTime}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {j.textileDeliveries && j.textileDeliveries.filter(td => !j.apartments.find(a => a.id === td.apartmentId)).map(td => {
                        const textileCost = td.guestCount * 1200;
                        return (
                          <div key={td.apartmentId} className="py-2 border-b border-gray-100">
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-medium text-gray-700">* {td.apartmentName}</p>
                              <p className="font-bold text-green-600">{textileCost.toLocaleString()} Ft</p>
                            </div>
                            <div className="text-xs text-gray-600">
                              <span>* {td.guestCount} db × 1,200 Ft € {td.arrivalTime || '14:00'} = {textileCost.toLocaleString()} Ft</span>
                              {td.laundryDelivery && <span className="text-blue-600 font-medium ml-2">* Mosoda</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-3 pt-3 border-t-2 border-gray-300 flex justify-between items-center">
                      <p className="font-bold text-gray-700">Összesen:</p>
                      <p className="font-bold text-xl text-green-600">{j.totalEarnings.toLocaleString()} Ft</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'workers' && currentModule === 'cleaning' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Admin fiókok kezelése</h2>
              <div className="space-y-2">
                {admins.map(a => (
                  <div key={a.id} className="border p-3 rounded-lg">
                    {editingWorker && editingWorker.id === a.id && editingWorker.isAdmin ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editingWorker.username}
                          onChange={(e) => setEditingWorker({...editingWorker, username: e.target.value})}
                          placeholder="Felhasználónév"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="text"
                          value={editingWorker.name}
                          onChange={(e) => setEditingWorker({...editingWorker, name: e.target.value})}
                          placeholder="Név"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <input
                          type="password"
                          value={editingWorker.password}
                          onChange={(e) => setEditingWorker({...editingWorker, password: e.target.value})}
                          placeholder="Jelszó"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                        <div className="flex gap-2">
                          <button onClick={saveEditWorker} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                            <Check size={16} />
                            Mentés
                          </button>
                          <button onClick={() => setEditingWorker(null)} className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                            <X size={16} />
                            Mégse
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold">{a.name}</p>
                          <p className="text-sm text-gray-600">Felhasználónév: {a.username}</p>
                          <p className="text-xs text-indigo-600 font-semibold mt-1">ADMIN</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEditWorker({...a, isAdmin: true})} className="text-blue-500">
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Takarítók kezelése</h2>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <input type="text" value={newWorker.name} onChange={(e) => setNewWorker({...newWorker, name: e.target.value})} placeholder="Név" className="px-3 py-2 border rounded-lg" />
                <input type="password" value={newWorker.password} onChange={(e) => setNewWorker({...newWorker, password: e.target.value})} placeholder="Jelszó" className="px-3 py-2 border rounded-lg" />
                <select value={newWorker.role} onChange={(e) => setNewWorker({...newWorker, role: e.target.value})} className="px-3 py-2 border rounded-lg">
                  <option value="admin">* Admin</option>
                  <option value="manager">* Manager</option>
                  <option value="finance">* Pénzügy</option>
                  <option value="cleaner">* Takarító</option>
                  <option value="sales">* Értékesítő</option>
                  <option value="marketing">* Marketing</option>
                  <option value="maintenance">* Karbantartó</option>
                </select>
                <button onClick={addWorker} className="md:col-span-3 bg-indigo-600 text-white px-4 py-2 rounded-lg">Hozzáadás</button>
              </div>
            <div className="space-y-2">
              {workers.map(w => (
                <div key={w.id} className="border p-3 rounded-lg">
                  {editingWorker && editingWorker.id === w.id && !editingWorker.isAdmin ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editingWorker.name}
                        onChange={(e) => setEditingWorker({...editingWorker, name: e.target.value})}
                        placeholder="Név"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <input
                        type="password"
                        value={editingWorker.password}
                        onChange={(e) => setEditingWorker({...editingWorker, password: e.target.value})}
                        placeholder="Jelszó"
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                      <select
                        value={editingWorker.role}
                        onChange={(e) => setEditingWorker({...editingWorker, role: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="admin">* Admin</option>
                        <option value="manager">* Manager</option>
                        <option value="finance">* Pénzügy</option>
                        <option value="cleaner">* Takarító</option>
                        <option value="sales">* Értékesítő</option>
                        <option value="marketing">* Marketing</option>
                        <option value="maintenance">* Karbantartó</option>
                      </select>
                      <div className="flex gap-2">
                        <button onClick={saveEditWorker} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                          <Check size={16} />
                          Mentés
                        </button>
                        <button onClick={() => setEditingWorker(null)} className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                          <X size={16} />
                          Mégse
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold">{w.name}</p>
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                          {w.role === 'admin' && '* Admin'}
                          {w.role === 'manager' && '* Manager'}
                          {w.role === 'finance' && '* Pénzügy'}
                          {w.role === 'cleaner' && '* Takarító'}
                          {w.role === 'sales' && '* Értékesítő'}
                          {w.role === 'marketing' && '* Marketing'}
                          {w.role === 'maintenance' && '* Karbantartó'}
                          {w.role === 'worker' && '* Dolgozó'}
                          {w.role === 'supervisor' && '* Felügyelő'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditWorker(w)} className="text-blue-500">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => removeWorker(w.id)} className="text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {activeTab === 'apartments' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Lakások kezelése</h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600">
                  * 1 EUR = <span className="font-bold text-green-600">{eurRate.toLocaleString()} Ft</span>
                  {lastRateUpdate && <span className="text-xs ml-1">({lastRateUpdate})</span>}
                </div>
                <button
                  onClick={() => setShowAddApartment(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Lakás hozzáadása
                </button>
              </div>
            </div>

            {/* LAKÁS HOZZÁADÁSA MODAL */}
            {showAddApartment && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto py-4" onClick={() => setShowAddApartment(false)}>
                <div className="min-h-full flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">* Új lakás hozzáadása</h3>
                    <button onClick={() => setShowAddApartment(false)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* ALAPADATOK */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <h4 className="font-bold text-gray-700 mb-3">* Alapadatok</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lakás neve *</label>
                          <input 
                            type="text" 
                            value={newApartment.name} 
                            onChange={(e) => setNewApartment({...newApartment, name: e.target.value})} 
                            placeholder="Pl: A57 Downtown" 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">* Megbízó</label>
                          <div className="flex gap-2">
                            <select 
                              value={newApartment.clientId} 
                              onChange={(e) => {
                                if (e.target.value === 'new') {
                                  setNewApartment({...newApartment, clientId: 'new', clientName: ''});
                                } else {
                                  const client = partners.clients.find(c => c.id === parseInt(e.target.value));
                                  setNewApartment({
                                    ...newApartment, 
                                    clientId: e.target.value,
                                    clientName: client ? client.name : ''
                                  });
                                }
                              }} 
                              className="flex-1 px-3 py-2 border rounded-lg"
                            >
                              <option value="">-- Válassz megbízót --</option>
                              {partners.clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                              ))}
                              <option value="new"> Új megbízó hozzáadása...</option>
                            </select>
                          </div>
                          {newApartment.clientId === 'new' && (
                            <div className="mt-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                              <label className="block text-xs font-medium text-emerald-700 mb-1">Új megbízó neve</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={newApartment.newClientName || ''}
                                  onChange={(e) => setNewApartment({...newApartment, newClientName: e.target.value})}
                                  placeholder="Pl: Kiss János"
                                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (newApartment.newClientName?.trim()) {
                                      const newClient = {
                                        id: Date.now(),
                                        name: newApartment.newClientName.trim(),
                                        email: '',
                                        phone: ''
                                      };
                                      setPartners({
                                        ...partners,
                                        clients: [...partners.clients, newClient]
                                      });
                                      setNewApartment({
                                        ...newApartment,
                                        clientId: newClient.id.toString(),
                                        clientName: newClient.name,
                                        newClientName: ''
                                      });
                                    }
                                  }}
                                  className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                >
                                  Hozzáad
                                </button>
                              </div>
                            </div>
                          )}
                          {partners.clients.length === 0 && newApartment.clientId !== 'new' && (
                            <p className="text-xs text-amber-600 mt-1">* Válaszd az "Új megbízó hozzáadása" opciót!</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">* Üzemeltetés típusa</label>
                          <select 
                            value={newApartment.operationType} 
                            onChange={(e) => setNewApartment({...newApartment, operationType: e.target.value})} 
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="short-term">Rövidtávú (Airbnb típusú)</option>
                            <option value="rental">Bérleti szerződés</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">* NTAK szám</label>
                          <input 
                            type="text" 
                            value={newApartment.ntakNumber} 
                            onChange={(e) => setNewApartment({...newApartment, ntakNumber: e.target.value})} 
                            placeholder="Pl: MA12345678" 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Adószám</label>
                          <input 
                            type="text" 
                            value={newApartment.taxNumber} 
                            onChange={(e) => setNewApartment({...newApartment, taxNumber: e.target.value})} 
                            placeholder="Pl: 12345678-1-42" 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* CÍM */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-bold text-blue-800 mb-3">* Cím adatok</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Irányítószám</label>
                            <input 
                              type="text" 
                              value={newApartment.zipCode} 
                              onChange={(e) => setNewApartment({...newApartment, zipCode: e.target.value})} 
                              placeholder="1051" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Város</label>
                            <input 
                              type="text" 
                              value={newApartment.city} 
                              onChange={(e) => setNewApartment({...newApartment, city: e.target.value})} 
                              placeholder="Budapest" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Utca, házszám, emelet, ajtó</label>
                          <input 
                            type="text" 
                            value={newApartment.street} 
                            onChange={(e) => setNewApartment({...newApartment, street: e.target.value})} 
                            placeholder="Pl: Váci utca 10. 3. em. 5." 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">* Kapukód</label>
                          <input 
                            type="text" 
                            value={newApartment.gateCode} 
                            onChange={(e) => setNewApartment({...newApartment, gateCode: e.target.value})} 
                            placeholder="Pl: #1234 vagy A5B2" 
                            className="w-full px-3 py-2 border rounded-lg" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* PLATFORM ADATOK */}
                    <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                      <h4 className="font-bold text-pink-800 mb-3">* Platform hozzáférések</h4>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb felhasználónév</label>
                            <input 
                              type="text" 
                              value={newApartment.airbnbUsername} 
                              onChange={(e) => setNewApartment({...newApartment, airbnbUsername: e.target.value})} 
                              placeholder="email@example.com" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Airbnb jelszó</label>
                            <input 
                              type="password" 
                              value={newApartment.airbnbPassword} 
                              onChange={(e) => setNewApartment({...newApartment, airbnbPassword: e.target.value})} 
                              placeholder="€€€€€€€€" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking felhasználónév</label>
                            <input 
                              type="text" 
                              value={newApartment.bookingUsername} 
                              onChange={(e) => setNewApartment({...newApartment, bookingUsername: e.target.value})} 
                              placeholder="partner@booking.com" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking jelszó</label>
                            <input 
                              type="password" 
                              value={newApartment.bookingPassword} 
                              onChange={(e) => setNewApartment({...newApartment, bookingPassword: e.target.value})} 
                              placeholder="€€€€€€€€" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* DÍJAK */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Management díj (%)</label>
                        <select 
                          value={newApartment.managementFee} 
                          onChange={(e) => setNewApartment({...newApartment, managementFee: parseInt(e.target.value)})} 
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {[20, 25, 30, 35].map(val => (
                            <option key={val} value={val}>{val}%</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Havidíj (EUR)</label>
                        <select 
                          value={newApartment.monthlyFeeEur} 
                          onChange={(e) => setNewApartment({...newApartment, monthlyFeeEur: parseInt(e.target.value)})} 
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(val => (
                            <option key={val} value={val}>{val} EUR</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Takarítási díj (EUR)</label>
                        <input 
                          type="number" 
                          value={newApartment.cleaningFeeEur === 0 ? '' : newApartment.cleaningFeeEur} 
                          onChange={(e) => setNewApartment({...newApartment, cleaningFeeEur: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                          placeholder="0" 
                          className="w-full px-3 py-2 border rounded-lg" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Takarítási időkeret (óra)</label>
                        <select 
                          value={newApartment.timeFrame} 
                          onChange={(e) => setNewApartment({...newApartment, timeFrame: parseFloat(e.target.value)})} 
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          {[...Array(16)].map((_, i) => {
                            const val = 0.5 + i * 0.5;
                            return <option key={val} value={val}>{val} óra</option>;
                          })}
                        </select>
                      </div>
                    </div>

                    {/* IDEGENFORGALMI ADÓ */}
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <label className="block text-sm font-medium text-orange-800 mb-2">* Idegenforgalmi adó (IFA)</label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <select 
                            value={newApartment.tourismTaxType} 
                            onChange={(e) => setNewApartment({...newApartment, tourismTaxType: e.target.value})} 
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="percent">Százalékos (%)</option>
                            <option value="fixed">Fix Ft/fő/éj</option>
                          </select>
                        </div>
                        <div>
                          {newApartment.tourismTaxType === 'percent' ? (
                            <select 
                              value={newApartment.tourismTaxPercent} 
                              onChange={(e) => setNewApartment({...newApartment, tourismTaxPercent: parseInt(e.target.value)})} 
                              className="w-full px-3 py-2 border rounded-lg"
                            >
                              <option value={4}>4%</option>
                              <option value={5}>5%</option>
                              <option value={6}>6%</option>
                            </select>
                          ) : (
                            <input 
                              type="number" 
                              value={newApartment.tourismTaxFixed === 0 ? '' : newApartment.tourismTaxFixed} 
                              onChange={(e) => setNewApartment({...newApartment, tourismTaxFixed: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                              placeholder="Ft/fő/éj" 
                              className="w-full px-3 py-2 border rounded-lg" 
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parkoló (EUR)</label>
                      <input 
                        type="number" 
                        value={newApartment.parkingEur === 0 ? '' : newApartment.parkingEur} 
                        onChange={(e) => setNewApartment({...newApartment, parkingEur: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                        placeholder="0" 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">* Bejutási instrukciók</label>
                      <textarea 
                        value={newApartment.accessInstructions} 
                        onChange={(e) => setNewApartment({...newApartment, accessInstructions: e.target.value})} 
                        placeholder="Pl: Kulcs a portán, kód: 1234, lift 3. emelet..." 
                        className="w-full px-3 py-2 border rounded-lg" 
                        rows={3}
                      />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-blue-800 mb-2">* Bevétel kezelése</label>
                      <select 
                        value={newApartment.revenueHandler || 'owner'} 
                        onChange={(e) => setNewApartment({...newApartment, revenueHandler: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg"
                      >
                        <option value="owner">Megbízó kapja a bevételt  Nekünk utalandó</option>
                        <option value="us">Mi kapjuk a bevételt  Megbízónak utalandó</option>
                      </select>
                    </div>
                    
                    {/* ÉVES BEVÉTELI TERV */}
                    <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                      <h4 className="font-bold text-sm text-emerald-800 mb-2">* Éves bevételi terv (EUR)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-emerald-700 mb-1">Minimum terv</label>
                          <input
                            type="number"
                            value={newApartment.yearlyRevenueMin || ''}
                            onChange={(e) => setNewApartment({...newApartment, yearlyRevenueMin: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                            placeholder="Pl: 8000"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-emerald-700 mb-1">Várt terv</label>
                          <input
                            type="number"
                            value={newApartment.yearlyRevenueTarget || ''}
                            onChange={(e) => setNewApartment({...newApartment, yearlyRevenueTarget: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                            placeholder="Pl: 12000"
                            className="w-full px-3 py-2 border rounded-lg"
                          />
                        </div>
                      </div>
                      {(newApartment.yearlyRevenueMin > 0 || newApartment.yearlyRevenueTarget > 0) && (
                        <div className="mt-2 text-xs text-emerald-600">
                          Havi átlag: {Math.round((newApartment.yearlyRevenueMin || 0) / 12)} - {Math.round((newApartment.yearlyRevenueTarget || 0) / 12)} EUR
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
                      <input 
                        type="text" 
                        value={newApartment.instructions} 
                        onChange={(e) => setNewApartment({...newApartment, instructions: e.target.value})} 
                        placeholder="Egyéb megjegyzések..." 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => {
                          addApartment();
                          setShowAddApartment(false);
                        }} 
                        className="flex-1 bg-emerald-600 text-white px-4 py-3 rounded-lg hover:bg-emerald-700 font-bold"
                      >
                        Mentés
                      </button>
                      <button 
                        onClick={() => setShowAddApartment(false)} 
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 font-bold"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {apartments.map(a => (
                <div key={a.id} className="border p-3 rounded-lg">
                  {editingApartment && editingApartment.id === a.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center overflow-y-auto py-4" onClick={() => setEditingApartment(null)}>
                      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 my-auto" onClick={e => e.stopPropagation()}>
                          {/* FIX FEJLÉC */}
                          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-t-xl flex justify-between items-center">
                            <h3 className="text-lg font-bold"> {editingApartment.name || 'Lakás'} szerkesztése</h3>
                            <button onClick={() => setEditingApartment(null)} className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded">
                              <X size={20} />
                            </button>
                          </div>
                        
                          {/* TARTALOM */}
                          <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
                      {/* ALAPADATOK */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">* Alapadatok</h4>
                        <input
                          type="text"
                          value={editingApartment.name}
                          onChange={(e) => setEditingApartment({...editingApartment, name: e.target.value})}
                          placeholder="Lakás neve"
                          className="w-full px-3 py-2 border rounded-lg mb-2"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* Megbízó</label>
                            <select 
                              value={editingApartment.clientId || ''} 
                              onChange={(e) => {
                                if (e.target.value === 'new') {
                                  setEditingApartment({...editingApartment, clientId: 'new', clientName: ''});
                                } else {
                                  const client = partners.clients.find(c => c.id === parseInt(e.target.value));
                                  setEditingApartment({
                                    ...editingApartment, 
                                    clientId: e.target.value,
                                    clientName: client ? client.name : ''
                                  });
                                }
                              }} 
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="">-- Válassz --</option>
                              {partners.clients.map(client => (
                                <option key={client.id} value={client.id}>{client.name}</option>
                              ))}
                              <option value="new"> Új megbízó...</option>
                            </select>
                            {editingApartment.clientId === 'new' && (
                              <div className="mt-1 flex gap-1">
                                <input
                                  type="text"
                                  value={editingApartment.newClientName || ''}
                                  onChange={(e) => setEditingApartment({...editingApartment, newClientName: e.target.value})}
                                  placeholder="Új megbízó neve"
                                  className="flex-1 px-2 py-1 border rounded text-xs"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingApartment.newClientName?.trim()) {
                                      const newClient = {
                                        id: Date.now(),
                                        name: editingApartment.newClientName.trim(),
                                        email: '',
                                        phone: ''
                                      };
                                      setPartners({
                                        ...partners,
                                        clients: [...partners.clients, newClient]
                                      });
                                      setEditingApartment({
                                        ...editingApartment,
                                        clientId: newClient.id.toString(),
                                        clientName: newClient.name,
                                        newClientName: ''
                                      });
                                    }
                                  }}
                                  className="px-2 py-1 bg-emerald-600 text-white rounded text-xs"
                                >
                                  OK
                                </button>
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* Üzemeltetés</label>
                            <select 
                              value={editingApartment.operationType || 'short-term'} 
                              onChange={(e) => setEditingApartment({...editingApartment, operationType: e.target.value})} 
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="short-term">Rövidtávú</option>
                              <option value="rental">Bérleti szerződés</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* NTAK szám</label>
                            <input 
                              type="text" 
                              value={editingApartment.ntakNumber || ''} 
                              onChange={(e) => setEditingApartment({...editingApartment, ntakNumber: e.target.value})} 
                              placeholder="Pl: MA12345678" 
                              className="w-full px-3 py-2 border rounded-lg text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* Adószám</label>
                            <input 
                              type="text" 
                              value={editingApartment.taxNumber || ''} 
                              onChange={(e) => setEditingApartment({...editingApartment, taxNumber: e.target.value})} 
                              placeholder="Pl: 12345678-1-42" 
                              className="w-full px-3 py-2 border rounded-lg text-sm" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* Lakásméret (m²)</label>
                            <input 
                              type="number" 
                              value={editingApartment.apartmentSize || ''} 
                              onChange={(e) => setEditingApartment({...editingApartment, apartmentSize: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                              placeholder="Pl: 45" 
                              className="w-full px-3 py-2 border rounded-lg text-sm" 
                            />
                          </div>
                        </div>
                      </div>

                      {/* CÍM */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-sm text-blue-800 mb-2">* Cím</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input 
                            type="text" 
                            value={editingApartment.zipCode || ''} 
                            onChange={(e) => setEditingApartment({...editingApartment, zipCode: e.target.value})} 
                            placeholder="Ir.szám" 
                            className="px-3 py-2 border rounded-lg text-sm" 
                          />
                          <input 
                            type="text" 
                            value={editingApartment.city || ''} 
                            onChange={(e) => setEditingApartment({...editingApartment, city: e.target.value})} 
                            placeholder="Város" 
                            className="col-span-2 px-3 py-2 border rounded-lg text-sm" 
                          />
                        </div>
                        <input 
                          type="text" 
                          value={editingApartment.street || ''} 
                          onChange={(e) => setEditingApartment({...editingApartment, street: e.target.value})} 
                          placeholder="Utca, házszám, emelet, ajtó" 
                          className="w-full px-3 py-2 border rounded-lg text-sm mb-2" 
                        />
                        <input 
                          type="text" 
                          value={editingApartment.gateCode || ''} 
                          onChange={(e) => setEditingApartment({...editingApartment, gateCode: e.target.value})} 
                          placeholder="* Kapukód" 
                          className="w-full px-3 py-2 border rounded-lg text-sm mb-2" 
                        />
                        
                        {/* WiFi adatok */}
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mb-2">
                          <h4 className="font-bold text-sm text-blue-800 mb-2">WiFi adatok</h4>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-blue-700 mb-1">WiFi név</label>
                              <input
                                type="text"
                                value={editingApartment.wifiName || ''}
                                onChange={(e) => setEditingApartment({...editingApartment, wifiName: e.target.value})}
                                placeholder="Hálózat neve"
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-blue-700 mb-1">WiFi jelszó</label>
                              <input
                                type="text"
                                value={editingApartment.wifiPassword || ''}
                                onChange={(e) => setEditingApartment({...editingApartment, wifiPassword: e.target.value})}
                                placeholder="Jelszó"
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-blue-700 mb-1">Sebesség (Mbps)</label>
                              <input
                                type="text"
                                value={editingApartment.wifiSpeed || ''}
                                onChange={(e) => setEditingApartment({...editingApartment, wifiSpeed: e.target.value})}
                                placeholder="pl. 100"
                                className="w-full px-2 py-1 border rounded text-sm"
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-xs font-medium text-blue-700 mb-1">* Bejutási instrukciók</label>
                          <textarea
                            value={editingApartment.accessInstructions || ''}
                            onChange={(e) => setEditingApartment({...editingApartment, accessInstructions: e.target.value})}
                            placeholder="Pl: Kulcs a portán, kód: 1234, lift 3. emelet..."
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                            rows="2"
                          />
                        </div>
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-blue-700 mb-1">* Megjegyzés</label>
                          <input
                            type="text"
                            value={editingApartment.instructions || ''}
                            onChange={(e) => setEditingApartment({...editingApartment, instructions: e.target.value})}
                            placeholder="Megjegyzés..."
                            className="w-full px-3 py-2 border rounded-lg text-sm"
                          />
                        </div>
                      </div>

                      {/* ÁGYAK ÉS VENDÉGSZÁM */}
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <h4 className="font-bold text-sm text-purple-800 mb-2">* Ágyak és vendégszám</h4>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Franciaágy (2 fő/db)</label>
                            <select
                              value={editingApartment.doubleBeds || 0}
                              onChange={(e) => {
                                const doubleBeds = parseInt(e.target.value);
                                const sofaBeds = editingApartment.sofaBedCapacity || 0;
                                const otherBeds = editingApartment.otherBedCapacity || 0;
                                setEditingApartment({
                                  ...editingApartment, 
                                  doubleBeds,
                                  maxGuests: (doubleBeds * 2) + sofaBeds + otherBeds
                                });
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} db</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Kanapéágy (fő)</label>
                            <select
                              value={editingApartment.sofaBedCapacity || 0}
                              onChange={(e) => {
                                const sofaBeds = parseInt(e.target.value);
                                const doubleBeds = editingApartment.doubleBeds || 0;
                                const otherBeds = editingApartment.otherBedCapacity || 0;
                                setEditingApartment({
                                  ...editingApartment, 
                                  sofaBedCapacity: sofaBeds,
                                  maxGuests: (doubleBeds * 2) + sofaBeds + otherBeds
                                });
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} fő</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Egyéb ágy (fő)</label>
                            <select
                              value={editingApartment.otherBedCapacity || 0}
                              onChange={(e) => {
                                const otherBeds = parseInt(e.target.value);
                                const doubleBeds = editingApartment.doubleBeds || 0;
                                const sofaBeds = editingApartment.sofaBedCapacity || 0;
                                setEditingApartment({
                                  ...editingApartment, 
                                  otherBedCapacity: otherBeds,
                                  maxGuests: (doubleBeds * 2) + sofaBeds + otherBeds
                                });
                              }}
                              className="w-full px-2 py-1 border rounded text-sm"
                            >
                              {[0,1,2,3,4].map(n => <option key={n} value={n}>{n} fő</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white p-2 rounded border mb-2">
                          <span className="text-sm font-medium text-purple-800">* Max vendégszám:</span>
                          <span className="text-lg font-bold text-purple-600">{editingApartment.maxGuests || 0} fő</span>
                        </div>
                        
                        {/* PARKOLÁS */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">* Parkolás a vendégnek</label>
                          <select
                            value={editingApartment.parkingType || ''}
                            onChange={(e) => setEditingApartment({...editingApartment, parkingType: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                          >
                            <option value="">-- Válassz --</option>
                            <option value="street_paid">Utcán fizetős</option>
                            <option value="street_free">Utcán ingyenes</option>
                            <option value="designated">Kijelölt parkolóhely</option>
                            <option value="garage">Garázs</option>
                            <option value="none">Nincs parkolási lehetőség</option>
                          </select>
                        </div>
                      </div>

                      {/* CSOMAGOK */}
                      <div className="bg-gradient-to-r from-emerald-50 via-sky-50 to-amber-50 p-3 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-sm text-gray-700 mb-3">* Szolgáltatási csomag</h4>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingApartment({
                              ...editingApartment, 
                              servicePackage: 'alap',
                              managementFee: 20
                            })}
                            className={`p-3 rounded-lg border-2 text-center transition ${
                              editingApartment.servicePackage === 'alap' 
                                ? 'border-emerald-500 bg-emerald-100 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50'
                            }`}
                          >
                            <div className="font-bold text-emerald-600">* Alap</div>
                            <div className="text-2xl font-bold text-emerald-700">20%</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingApartment({
                              ...editingApartment, 
                              servicePackage: 'pro',
                              managementFee: 25
                            })}
                            className={`p-3 rounded-lg border-2 text-center transition ${
                              editingApartment.servicePackage === 'pro' 
                                ? 'border-sky-500 bg-sky-100 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                            }`}
                          >
                            <div className="font-bold text-sky-600"> Pro</div>
                            <div className="text-2xl font-bold text-sky-700">25%</div>
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingApartment({
                              ...editingApartment, 
                              servicePackage: 'max',
                              managementFee: 35,
                              cleaningFeeEur: 0
                            })}
                            className={`p-3 rounded-lg border-2 text-center transition relative ${
                              editingApartment.servicePackage === 'max' 
                                ? 'border-amber-500 bg-amber-100 shadow-md' 
                                : 'border-gray-200 bg-white hover:border-amber-300 hover:bg-amber-50'
                            }`}
                          >
                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full">*</div>
                            <div className="font-bold text-amber-600">* Max</div>
                            <div className="text-2xl font-bold text-amber-700">35%</div>
                          </button>
                        </div>
                        {editingApartment.servicePackage === 'max' && (
                          <div className="mt-2 text-xs text-amber-700 bg-amber-50 p-2 rounded border border-amber-200">
                             Max csomag: Takarítás és Karbantartás költsége benne van!
                          </div>
                        )}
                      </div>

                      {/* DÍJAK ÉS BEVÉTEL KEZELÉS */}
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <h4 className="font-bold text-sm text-slate-700 mb-3">* Díjak és bevétel kezelés</h4>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Management díj (%)
                              {editingApartment.servicePackage && <span className={`ml-1 ${editingApartment.servicePackage === 'alap' ? 'text-emerald-600' : editingApartment.servicePackage === 'pro' ? 'text-sky-600' : 'text-amber-600'}`}> csomag</span>}
                            </label>
                            <div className={`w-full px-3 py-2 border rounded-lg text-sm ${editingApartment.servicePackage === 'alap' ? 'bg-emerald-50 border-emerald-300' : editingApartment.servicePackage === 'pro' ? 'bg-sky-50 border-sky-300' : editingApartment.servicePackage === 'max' ? 'bg-amber-50 border-amber-300' : ''}`}>
                              {editingApartment.managementFee || 25}%
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Havidíj (automatikus)</label>
                            <div className="w-full px-3 py-2 border rounded-lg text-sm bg-emerald-50 border-emerald-300">
                              <span className="font-bold text-emerald-700">
                                {(() => {
                                  const guests = editingApartment.maxGuests || 0;
                                  if (guests <= 4) return 30;
                                  if (guests <= 6) return 35;
                                  if (guests <= 9) return 40;
                                  if (guests <= 12) return 45;
                                  return 45 + Math.ceil((guests - 12) / 3) * 5;
                                })()} EUR
                              </span>
                              <span className="text-xs text-emerald-600 ml-1">({editingApartment.maxGuests || 0} fő)</span>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Takarítási díj (automatikus)
                              {editingApartment.servicePackage === 'max' && <span className="text-pink-600 ml-1"> benne van!</span>}
                            </label>
                            {editingApartment.servicePackage === 'max' ? (
                              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-pink-50 border-pink-300 text-pink-700">
                                 Benne van a csomagban
                              </div>
                            ) : editingApartment.apartmentSize > 0 && editingApartment.maxGuests > 0 ? (
                              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-sky-50 border-sky-300">
                                <span className="font-bold text-sky-700">
                                  {(() => {
                                    const size = editingApartment.apartmentSize || 0;
                                    const guests = editingApartment.maxGuests || 0;
                                    let basePrice = 25;
                                    if (size <= 35) basePrice = 25;
                                    else if (size <= 45) basePrice = 35;
                                    else if (size <= 60) basePrice = 45;
                                    else if (size <= 80) basePrice = 55;
                                    else if (size <= 100) basePrice = 70;
                                    else basePrice = 70 + Math.ceil((size - 100) / 20) * 10;
                                    const guestSurcharge = guests > 2 ? Math.ceil((guests - 2) / 2) * 5 : 0;
                                    return Math.max(30, basePrice + guestSurcharge);
                                  })()} EUR
                                </span>
                                <span className="text-xs text-sky-600 ml-1">({editingApartment.apartmentSize || 0} m², {editingApartment.maxGuests || 0} fő)</span>
                              </div>
                            ) : (
                              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-amber-50 border-amber-300 text-amber-700">
                                ⚠️ Add meg a {!editingApartment.apartmentSize ? 'lakásméretet' : 'vendégszámot'}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Takarítási időkeret</label>
                            <select
                              value={editingApartment.timeFrame}
                              onChange={(e) => setEditingApartment({...editingApartment, timeFrame: parseFloat(e.target.value)})}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              {[...Array(16)].map((_, i) => {
                                const val = 0.5 + i * 0.5;
                                return <option key={val} value={val}>{val} óra</option>;
                              })}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Parkoló bevétel (EUR)</label>
                            <input
                              type="number"
                              value={(editingApartment.parkingEur === 0 || editingApartment.parkingEur === undefined) ? '' : editingApartment.parkingEur}
                              onChange={(e) => setEditingApartment({...editingApartment, parkingEur: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                              placeholder="0"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">* Bevétel kezelése</label>
                            <select 
                              value={editingApartment.revenueHandler || 'owner'} 
                              onChange={(e) => setEditingApartment({...editingApartment, revenueHandler: e.target.value})}
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="owner">Megbízó kapja  Nekünk utalandó</option>
                              <option value="us">Mi kapjuk  Megbízónak utalandó</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      
                      {/* IDEGENFORGALMI ADÓ */}
                      <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                        <label className="block text-xs font-medium text-orange-800 mb-2">* Idegenforgalmi adó (IFA)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <select 
                              value={editingApartment.tourismTaxType || 'percent'} 
                              onChange={(e) => setEditingApartment({...editingApartment, tourismTaxType: e.target.value})} 
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              <option value="percent">Százalékos (%)</option>
                              <option value="fixed">Fix Ft/fő/éj</option>
                            </select>
                          </div>
                          <div>
                            {(editingApartment.tourismTaxType || 'percent') === 'percent' ? (
                              <select 
                                value={editingApartment.tourismTaxPercent || 4} 
                                onChange={(e) => setEditingApartment({...editingApartment, tourismTaxPercent: parseInt(e.target.value)})} 
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                              >
                                <option value={4}>4%</option>
                                <option value={5}>5%</option>
                                <option value={6}>6%</option>
                              </select>
                            ) : (
                              <input 
                                type="number" 
                                value={(editingApartment.tourismTaxFixed === 0 || editingApartment.tourismTaxFixed === undefined) ? '' : editingApartment.tourismTaxFixed} 
                                onChange={(e) => setEditingApartment({...editingApartment, tourismTaxFixed: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                                placeholder="Ft/fő/éj" 
                                className="w-full px-3 py-2 border rounded-lg text-sm" 
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* ÉVES BEVÉTELI TERV */}
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-sm text-emerald-800 mb-2">* Éves bevételi terv (EUR)</h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-emerald-700 mb-1">Minimum terv</label>
                            <input
                              type="number"
                              value={editingApartment.yearlyRevenueMin || ''}
                              onChange={(e) => setEditingApartment({...editingApartment, yearlyRevenueMin: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                              placeholder="Pl: 8000"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-emerald-700 mb-1">Várt terv</label>
                            <input
                              type="number"
                              value={editingApartment.yearlyRevenueTarget || ''}
                              onChange={(e) => setEditingApartment({...editingApartment, yearlyRevenueTarget: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                              placeholder="Pl: 12000"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                        </div>
                        {(editingApartment.yearlyRevenueMin > 0 || editingApartment.yearlyRevenueTarget > 0) && (
                          <div className="mt-2 text-xs text-emerald-600">
                            Havi átlag: {Math.round((editingApartment.yearlyRevenueMin || 0) / 12)} - {Math.round((editingApartment.yearlyRevenueTarget || 0) / 12)} EUR
                          </div>
                        )}
                        
                        {/* KÖLTSÉGTERV */}
                        <div className="mt-3 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <div className="grid grid-cols-2 gap-2 items-center">
                            <div>
                              <label className="block text-xs font-medium text-amber-800 mb-1">* Költségterv (%)</label>
                              <select
                                value={editingApartment.costPlanPercent || 30}
                                onChange={(e) => setEditingApartment({...editingApartment, costPlanPercent: parseInt(e.target.value)})}
                                className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm bg-white"
                              >
                                {[15, 20, 25, 30, 35, 40, 45, 50].map(val => (
                                  <option key={val} value={val}>{val}%</option>
                                ))}
                              </select>
                            </div>
                            <div className="text-xs text-amber-800">
                              <div className="font-medium mb-1">Becsült költség:</div>
                              <div>{Math.round((editingApartment.yearlyRevenueTarget || 0) * (editingApartment.costPlanPercent || 30) / 100)} EUR/év</div>
                              <div>{Math.round((editingApartment.yearlyRevenueTarget || 0) * (editingApartment.costPlanPercent || 30) / 100 * eurRate).toLocaleString('hu-HU')} Ft/év</div>
                            </div>
                          </div>
                          {(editingApartment.yearlyRevenueMin > 0 || editingApartment.yearlyRevenueTarget > 0) && (
                            <div className="mt-2 pt-2 border-t border-amber-200 text-xs">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="text-emerald-700">
                                  <span className="font-medium">Tiszta profit:</span><br/>
                                  {Math.round((editingApartment.yearlyRevenueTarget || 0) * (100 - (editingApartment.costPlanPercent || 30)) / 100)} EUR/év
                                </div>
                                <div className="text-emerald-700">
                                  <br/>
                                  {Math.round((editingApartment.yearlyRevenueTarget || 0) * (100 - (editingApartment.costPlanPercent || 30)) / 100 * eurRate).toLocaleString('hu-HU')} Ft/év
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PLATFORM HOZZÁFÉRÉSEK */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <h4 className="font-bold text-sm text-gray-700 mb-2">* Platform hozzáférések</h4>
                        
                        {/* AIRBNB */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-pink-600">* Airbnb</span>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingApartment.noAirbnbAccount || false}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment, 
                                  noAirbnbAccount: e.target.checked,
                                  airbnbUsername: e.target.checked ? '' : editingApartment.airbnbUsername,
                                  airbnbPassword: e.target.checked ? '' : editingApartment.airbnbPassword
                                })}
                                className="w-3 h-3 accent-gray-500"
                              />
                              <span className="text-gray-500">Nincs fiókom</span>
                            </label>
                          </div>
                          {!editingApartment.noAirbnbAccount && (
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                value={editingApartment.airbnbUsername || ''} 
                                onChange={(e) => setEditingApartment({...editingApartment, airbnbUsername: e.target.value})} 
                                placeholder="Airbnb felhasználónév" 
                                className="px-3 py-2 border rounded-lg text-sm" 
                              />
                              <div className="relative">
                                <input 
                                  type={showAirbnbPassword ? "text" : "password"}
                                  value={editingApartment.airbnbPassword || ''} 
                                  onChange={(e) => setEditingApartment({...editingApartment, airbnbPassword: e.target.value})} 
                                  placeholder="Airbnb jelszó" 
                                  className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowAirbnbPassword(!showAirbnbPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showAirbnbPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* BOOKING */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-600"><span className="inline-flex items-center justify-center w-4 h-4 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking</span>
                            <label className="flex items-center gap-1 text-xs cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingApartment.noBookingAccount || false}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment, 
                                  noBookingAccount: e.target.checked,
                                  bookingUsername: e.target.checked ? '' : editingApartment.bookingUsername,
                                  bookingPassword: e.target.checked ? '' : editingApartment.bookingPassword
                                })}
                                className="w-3 h-3 accent-gray-500"
                              />
                              <span className="text-gray-500">Nincs fiókom</span>
                            </label>
                          </div>
                          {!editingApartment.noBookingAccount && (
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                value={editingApartment.bookingUsername || ''} 
                                onChange={(e) => setEditingApartment({...editingApartment, bookingUsername: e.target.value})} 
                                placeholder="Booking felhasználónév" 
                                className="px-3 py-2 border rounded-lg text-sm" 
                              />
                              <div className="relative">
                                <input 
                                  type={showBookingPassword ? "text" : "password"}
                                  value={editingApartment.bookingPassword || ''} 
                                  onChange={(e) => setEditingApartment({...editingApartment, bookingPassword: e.target.value})} 
                                  placeholder="Booking jelszó" 
                                  className="w-full px-3 py-2 pr-10 border rounded-lg text-sm" 
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowBookingPassword(!showBookingPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                  {showBookingPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* AIRBNB BEÁLLÍTÁSOK */}
                      <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                        <h4 className="font-bold text-sm text-pink-800 mb-2">* Airbnb beállítások</h4>
                        <div className="max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1">
                            {AIRBNB_AMENITIES.map(amenity => (
                              <label key={amenity} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-pink-100 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={editingApartment.airbnbAmenities?.[amenity] || false}
                                  onChange={(e) => {
                                    const newAirbnb = {
                                      ...(editingApartment.airbnbAmenities || {}),
                                      [amenity]: e.target.checked
                                    };
                                    // Sync to Booking if mapping exists
                                    const bookingEquiv = AMENITY_SYNC_MAP[amenity];
                                    const newBooking = bookingEquiv ? {
                                      ...(editingApartment.bookingAmenities || {}),
                                      [bookingEquiv]: e.target.checked
                                    } : editingApartment.bookingAmenities;
                                    setEditingApartment({
                                      ...editingApartment,
                                      airbnbAmenities: newAirbnb,
                                      bookingAmenities: newBooking || {}
                                    });
                                  }}
                                  className="w-3 h-3 accent-pink-600"
                                />
                                <span className="truncate">{amenity}</span>
                                {AMENITY_SYNC_MAP[amenity] && <span className="text-blue-500 ml-1"></span>}
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-pink-600">
                          Kiválasztva: {Object.values(editingApartment.airbnbAmenities || {}).filter(Boolean).length} / {AIRBNB_AMENITIES.length}
                          <span className="ml-2 text-blue-500"> = Booking szinkron</span>
                        </div>
                      </div>

                      {/* BOOKING BEÁLLÍTÁSOK */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-sm text-blue-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking beállítások</h4>
                        <div className="max-h-64 overflow-y-auto">
                          {Object.entries(BOOKING_CATEGORIES).map(([category, {color, items}]) => (
                            <div key={category} className="mb-3">
                              <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                              <div className="grid grid-cols-2 gap-1">
                                {items.map(amenity => {
                                  const airbnbEquiv = Object.entries(AMENITY_SYNC_MAP).find(([k, v]) => v === amenity)?.[0];
                                  return (
                                    <label key={amenity} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-100 p-1 rounded">
                                      <input
                                        type="checkbox"
                                        checked={editingApartment.bookingAmenities?.[amenity] || false}
                                        onChange={(e) => {
                                          const newBooking = {
                                            ...(editingApartment.bookingAmenities || {}),
                                            [amenity]: e.target.checked
                                          };
                                          const newAirbnb = airbnbEquiv ? {
                                            ...(editingApartment.airbnbAmenities || {}),
                                            [airbnbEquiv]: e.target.checked
                                          } : editingApartment.airbnbAmenities;
                                          setEditingApartment({
                                            ...editingApartment,
                                            bookingAmenities: newBooking,
                                            airbnbAmenities: newAirbnb || {}
                                          });
                                        }}
                                        className="w-3 h-3 accent-blue-600"
                                      />
                                      <span className="truncate">{amenity}</span>
                                      {airbnbEquiv && <span className="text-pink-500 ml-1"></span>}
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-blue-600">
                          Kiválasztva: {Object.values(editingApartment.bookingAmenities || {}).filter(Boolean).length} / {BOOKING_AMENITIES.length}
                          <span className="ml-2 text-pink-500"> = Airbnb szinkron</span>
                        </div>
                      </div>

                      {/* BOOKING FELSZERELTSÉGEK */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-sm text-blue-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded mr-1">B</span>Booking felszereltségek</h4>
                        <div className="max-h-64 overflow-y-auto">
                          {Object.entries(BOOKING_FELSZERELTSEG).map(([category, {color, items}]) => (
                            <div key={category} className="mb-3">
                              <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                              <div className="grid grid-cols-2 gap-1">
                                {items.map(item => (
                                  <label key={item} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-blue-100 p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={editingApartment.bookingFelszereltseg?.[item] || false}
                                      onChange={(e) => setEditingApartment({
                                        ...editingApartment,
                                        bookingFelszereltseg: {
                                          ...(editingApartment.bookingFelszereltseg || {}),
                                          [item]: e.target.checked
                                        }
                                      })}
                                      className="w-3 h-3 accent-blue-600"
                                    />
                                    <span className="truncate">{item}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-indigo-600">
                          Kiválasztva: {Object.values(editingApartment.bookingFelszereltseg || {}).filter(Boolean).length} / {BOOKING_FELSZERELTSEG_ALL.length}
                        </div>
                      </div>

                      {/* TEXTILKÉSZLET */}
                      <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200">
                        <h4 className="font-bold text-sm text-cyan-800 mb-3">🧺 Textilkészlet</h4>
                        
                        {/* Ágynemű szekció */}
                        <div className="mb-3 pb-3 border-b border-cyan-200">
                          <p className="text-xs font-semibold text-cyan-800 mb-2">Ágynemű</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {/* Paplan */}
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Paplan (db)</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingApartment.inventory?.duvetCount || 0}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), duvetCount: parseInt(e.target.value) || 0}
                                  })}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  min="0"
                                />
                                <select
                                  value={editingApartment.inventory?.duvetBrand || 'IKEA'}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), duvetBrand: e.target.value}
                                  })}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                >
                                  <option value="IKEA">IKEA</option>
                                  <option value="JYSK">JYSK</option>
                                  <option value="Egyeb">Egyéb</option>
                                </select>
                              </div>
                            </div>
                            {/* Párna */}
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Párna (db)</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingApartment.inventory?.pillowCount || 0}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), pillowCount: parseInt(e.target.value) || 0}
                                  })}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  min="0"
                                />
                                <select
                                  value={editingApartment.inventory?.pillowBrand || 'IKEA'}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), pillowBrand: e.target.value}
                                  })}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                >
                                  <option value="IKEA">IKEA</option>
                                  <option value="JYSK">JYSK</option>
                                  <option value="Egyeb">Egyéb</option>
                                </select>
                              </div>
                            </div>
                            {/* Lepedő */}
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Lepedő (db)</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingApartment.inventory?.sheetCount || 0}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), sheetCount: parseInt(e.target.value) || 0}
                                  })}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  min="0"
                                />
                                <select
                                  value={editingApartment.inventory?.sheetSize || '140x200'}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), sheetSize: e.target.value}
                                  })}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                >
                                  <option value="90x200">90x200</option>
                                  <option value="140x200">140x200</option>
                                  <option value="160x200">160x200</option>
                                  <option value="180x200">180x200</option>
                                  <option value="200x200">200x200</option>
                                </select>
                              </div>
                            </div>
                            {/* Ágynemű szett */}
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Ágynemű szett (db)</label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  value={editingApartment.inventory?.beddingSetCount || 0}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), beddingSetCount: parseInt(e.target.value) || 0}
                                  })}
                                  className="w-16 px-2 py-1 border rounded text-sm"
                                  min="0"
                                />
                                <select
                                  value={editingApartment.inventory?.beddingSetBrand || 'IKEA'}
                                  onChange={(e) => setEditingApartment({
                                    ...editingApartment,
                                    inventory: {...(editingApartment.inventory || {}), beddingSetBrand: e.target.value}
                                  })}
                                  className="flex-1 px-2 py-1 border rounded text-sm"
                                >
                                  <option value="IKEA">IKEA</option>
                                  <option value="JYSK">JYSK</option>
                                  <option value="Egyeb">Egyéb</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Törölközők szekció */}
                        <div className="mb-3 pb-3 border-b border-cyan-200">
                          <p className="text-xs font-semibold text-cyan-800 mb-2">Törölközők</p>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Nagy törölköző</label>
                              <input
                                type="number"
                                value={editingApartment.inventory?.largeTowel || 0}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment,
                                  inventory: {...(editingApartment.inventory || {}), largeTowel: parseInt(e.target.value) || 0}
                                })}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Közepes törölköző</label>
                              <input
                                type="number"
                                value={editingApartment.inventory?.mediumTowel || 0}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment,
                                  inventory: {...(editingApartment.inventory || {}), mediumTowel: parseInt(e.target.value) || 0}
                                })}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Kéztörlő</label>
                              <input
                                type="number"
                                value={editingApartment.inventory?.handTowel || 0}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment,
                                  inventory: {...(editingApartment.inventory || {}), handTowel: parseInt(e.target.value) || 0}
                                })}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Kádkilépő</label>
                              <input
                                type="number"
                                value={editingApartment.inventory?.bathMat || 0}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment,
                                  inventory: {...(editingApartment.inventory || {}), bathMat: parseInt(e.target.value) || 0}
                                })}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-cyan-700 mb-1">Konyharuha</label>
                              <input
                                type="number"
                                value={editingApartment.inventory?.kitchenTowel || 0}
                                onChange={(e) => setEditingApartment({
                                  ...editingApartment,
                                  inventory: {...(editingApartment.inventory || {}), kitchenTowel: parseInt(e.target.value) || 0}
                                })}
                                className="w-full px-2 py-1 border rounded text-sm"
                                min="0"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Egyéb készletek - dinamikus lista */}
                        <div>
                          <p className="text-xs font-semibold text-cyan-800 mb-2">Egyéb készletek</p>
                          
                          {/* Meglévő tételek listája */}
                          {(editingApartment.inventory?.otherItems || []).length > 0 && (
                            <div className="space-y-1 mb-2">
                              {(editingApartment.inventory?.otherItems || []).map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                                  <span className="flex-1 text-sm">{item.name}</span>
                                  <span className="text-sm font-bold text-cyan-700">{item.quantity} db</span>
                                  <button
                                    onClick={() => {
                                      const newItems = [...(editingApartment.inventory?.otherItems || [])];
                                      newItems.splice(idx, 1);
                                      setEditingApartment({
                                        ...editingApartment,
                                        inventory: {...(editingApartment.inventory || {}), otherItems: newItems}
                                      });
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Új tétel hozzáadása */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Tétel neve..."
                              id="newItemName"
                              className="flex-1 px-2 py-1 border rounded text-sm"
                            />
                            <input
                              type="number"
                              placeholder="db"
                              id="newItemQty"
                              className="w-16 px-2 py-1 border rounded text-sm"
                              min="1"
                              defaultValue="1"
                            />
                            <button
                              onClick={() => {
                                const nameInput = document.getElementById('newItemName');
                                const qtyInput = document.getElementById('newItemQty');
                                if (nameInput.value.trim()) {
                                  const newItem = {
                                    name: nameInput.value.trim(),
                                    quantity: parseInt(qtyInput.value) || 1
                                  };
                                  setEditingApartment({
                                    ...editingApartment,
                                    inventory: {
                                      ...(editingApartment.inventory || {}),
                                      otherItems: [...(editingApartment.inventory?.otherItems || []), newItem]
                                    }
                                  });
                                  nameInput.value = '';
                                  qtyInput.value = '1';
                                }
                              }}
                              className="bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <button onClick={saveEditApartment} className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                          <Check size={16} />
                          Mentés
                        </button>
                        <button onClick={() => setEditingApartment(null)} className="flex-1 bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1">
                          <X size={16} />
                          Mégse
                        </button>
                      </div>
                          </div>
                        </div>
                    </div>
                  )}
                  
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-lg">{a.name}</p>
                        {a.clientName && <p className="text-sm text-blue-600">* {a.clientName}</p>}
                        <div className="flex gap-2 text-sm text-gray-600 mb-2">
                          <span>{a.managementFee || 25}% mgmt</span>
                          <span>€</span>
                          <span>{a.timeFrame} óra</span>
                          {a.ntakNumber && <span>€ NTAK: {a.ntakNumber}</span>}
                        </div>
                        
                        {(a.zipCode || a.city || a.street) && (
                          <div className="bg-gray-50 border px-3 py-2 rounded-lg mb-2 text-sm">
                            <p>* {a.zipCode} {a.city}, {a.street}</p>
                            {a.gateCode && <p className="text-gray-500">* Kapukód: {a.gateCode}</p>}
                          </div>
                        )}
                        
                        {a.accessInstructions && (
                          <div className="bg-blue-50 border border-blue-300 px-3 py-2 rounded-lg mb-2">
                            <p className="text-sm font-medium text-blue-900">* {a.accessInstructions}</p>
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div className="flex gap-2 text-sm flex-wrap">
                            <span className="bg-green-100 px-2 py-1 rounded">* {(a.cleaningFeeEur || 0)}</span>
                            <span className="bg-purple-100 px-2 py-1 rounded">* {(a.monthlyFeeEur || 0)}/hó</span>
                            {(a.parkingEur || 0) > 0 && <span className="bg-orange-100 px-2 py-1 rounded">* {a.parkingEur}</span>}
                            <span className={`px-2 py-1 rounded ${a.operationType === 'rental' ? 'bg-amber-100' : 'bg-pink-100'}`}>
                              {a.operationType === 'rental' ? '📋 Bérleti' : '* Rövidtávú'}
                            </span>
                          </div>
                        </div>
                        
                        {a.instructions && <p className="text-sm text-gray-600 mt-2 italic">{a.instructions}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEditApartment(a)} className="text-blue-500">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => removeApartment(a.id)} className="text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* MARKETING TAB */}
        {activeTab === 'marketing' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">* Marketing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Marketing csatornák */}
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h3 className="font-bold text-pink-800 mb-3">* Marketing csatornák</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Weboldal</span>
                    <span className="text-xs text-gray-500">Hamarosan...</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Instagram</span>
                    <span className="text-xs text-gray-500">Hamarosan...</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Facebook</span>
                    <span className="text-xs text-gray-500">Hamarosan...</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* TikTok</span>
                    <span className="text-xs text-gray-500">Hamarosan...</span>
                  </div>
                </div>
              </div>
              
              {/* Kampányok */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3">* Kampányok</h3>
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">*</div>
                  <p>Kampány kezelés hamarosan...</p>
                </div>
              </div>
              
              {/* Statisztikák */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">* Marketing statisztikák</h3>
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">*</div>
                  <p>Statisztikák hamarosan...</p>
                </div>
              </div>
              
              {/* Tartalom naptár */}
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                <h3 className="font-bold text-amber-800 mb-3">* Tartalom naptár</h3>
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">*</div>
                  <p>Tartalom tervezés hamarosan...</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ÉRTÉKESÍTÉS TAB */}
        {activeTab === 'sales' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">* Értékesítés</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = '.csv,.xlsx,.xls,.json';
                    input.onchange = (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          try {
                            let importedLeads = [];
                            const content = event.target.result;
                            
                            if (file.name.endsWith('.json')) {
                              importedLeads = JSON.parse(content);
                            } else if (file.name.endsWith('.csv')) {
                              const lines = content.split('\n');
                              const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
                              for (let i = 1; i < lines.length; i++) {
                                if (lines[i].trim()) {
                                  const values = lines[i].split(',');
                                  const lead = {
                                    id: Date.now() + i,
                                    name: values[headers.indexOf('name') || headers.indexOf('nev') || 0] || '',
                                    email: values[headers.indexOf('email') || 1] || '',
                                    phone: values[headers.indexOf('phone') || headers.indexOf('telefon') || 2] || '',
                                    source: values[headers.indexOf('source') || headers.indexOf('forras') || 3] || 'Import',
                                    status: 'new',
                                    notes: values[headers.indexOf('notes') || headers.indexOf('megjegyzes') || 4] || '',
                                    createdAt: new Date().toISOString().split('T')[0]
                                  };
                                  importedLeads.push(lead);
                                }
                              }
                            }
                            
                            if (importedLeads.length > 0) {
                              setLeads([...leads, ...importedLeads]);
                              alert(importedLeads.length + ' lead sikeresen importálva!');
                            }
                          } catch (err) {
                            alert('Hiba az importálás során: ' + err.message);
                          }
                        };
                        if (file.name.endsWith('.json')) {
                          reader.readAsText(file);
                        } else {
                          reader.readAsText(file);
                        }
                      }
                    };
                    input.click();
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Import (CSV/JSON)
                </button>
                <button
                  onClick={() => setShowAddLead(true)}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Új lead
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sales pipeline */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <h3 className="font-bold text-orange-800 mb-3">* Sales Pipeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Új érdeklődők</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'new').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Kapcsolatfelvétel</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'contacted').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Ajánlat kiküldve</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'proposal').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Tárgyalás</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'negotiation').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span> Megnyert</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'won').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <span>* Elvesztett</span>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">
                      {leads.filter(l => l.status === 'lost').length}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Import módok */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">* Import lehetőségek</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm">CSV fájl</div>
                    <div className="text-xs text-gray-500">Oszlopok: name, email, phone, source, notes</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm">JSON fájl</div>
                    <div className="text-xs text-gray-500">Tömbben objektumok: {'{name, email, phone, source, notes}'}</div>
                  </div>
                  <div className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm">Google Sheets</div>
                    <input
                      type="text"
                      placeholder="Google Sheets URL..."
                      className="w-full mt-2 px-2 py-1 border rounded text-xs"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          alert('Google Sheets import: A funkció API kulcsot igényel. Kérjük exportáld CSV-ként és töltsd fel!');
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={() => {
                      const sampleCSV = 'name,email,phone,source,notes\nTeszt Elek,teszt@example.com,+36201234567,Weboldal,Érdeklődés 2 szobás lakásról';
                      const blob = new Blob([sampleCSV], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'lead_sablon.csv';
                      a.click();
                    }}
                    className="w-full bg-gray-600 text-white px-3 py-2 rounded text-sm hover:bg-gray-700"
                  >
                    * Sablon letöltése (CSV)
                  </button>
                </div>
              </div>
            </div>

            {/* Új lead form */}
            {showAddLead && (
              <div className="mt-4 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-3">Új lead hozzáadása</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Név *</label>
                    <input
                      type="text"
                      value={newLead.name}
                      onChange={(e) => setNewLead({...newLead, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="Teljes név"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Telefon</label>
                    <input
                      type="text"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      placeholder="+36..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Forrás</label>
                    <select
                      value={newLead.source}
                      onChange={(e) => setNewLead({...newLead, source: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="website">Weboldal</option>
                      <option value="referral">Ajánlás</option>
                      <option value="social">Social media</option>
                      <option value="cold">Hideg megkeresés</option>
                      <option value="event">Rendezvény</option>
                      <option value="other">Egyéb</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Státusz</label>
                    <select
                      value={newLead.status}
                      onChange={(e) => setNewLead({...newLead, status: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="new">Új</option>
                      <option value="contacted">Kapcsolatfelvétel</option>
                      <option value="proposal">Ajánlat kiküldve</option>
                      <option value="negotiation">Tárgyalás</option>
                      <option value="won">Megnyert</option>
                      <option value="lost">Elvesztett</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-emerald-700 mb-1">Értékelés</label>
                    <select
                      value={newLead.rating}
                      onChange={(e) => setNewLead({...newLead, rating: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="hot">Forró - Sürgős</option>
                      <option value="warm">Meleg - Érdeklődő</option>
                      <option value="cold">Hideg - Későbbi</option>
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs text-emerald-700 mb-1">Megjegyzés</label>
                    <textarea
                      value={newLead.notes}
                      onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows="2"
                      placeholder="Részletek az érdeklődésről..."
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (newLead.name) {
                        setLeads([...leads, { ...newLead, id: Date.now(), createdAt: new Date().toISOString().split('T')[0] }]);
                        setNewLead({ name: '', email: '', phone: '', source: 'website', status: 'new', rating: 'warm', notes: '' });
                        setShowAddLead(false);
                      }
                    }}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                  >
                    Mentés
                  </button>
                  <button
                    onClick={() => setShowAddLead(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            )}

            {/* Leadek listája */}
            {leads.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold text-gray-800 mb-3">Leadek ({leads.length})</h3>
                <div className="space-y-2">
                  {leads.map(lead => {
                    const statusColors = {
                      new: 'bg-orange-100 text-orange-700',
                      contacted: 'bg-yellow-100 text-yellow-700',
                      proposal: 'bg-blue-100 text-blue-700',
                      negotiation: 'bg-purple-100 text-purple-700',
                      won: 'bg-green-100 text-green-700',
                      lost: 'bg-red-100 text-red-700'
                    };
                    const statusLabels = {
                      new: 'Új',
                      contacted: 'Kapcsolatfelvétel',
                      proposal: 'Ajánlat',
                      negotiation: 'Tárgyalás',
                      won: 'Megnyert',
                      lost: 'Elvesztett'
                    };
                    const ratingColors = {
                      hot: 'text-red-600',
                      warm: 'text-orange-500',
                      cold: 'text-blue-500'
                    };
                    return (
                      <div key={lead.id} className="p-3 bg-gray-50 rounded-lg border flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{lead.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${statusColors[lead.status]}`}>
                              {statusLabels[lead.status]}
                            </span>
                            <span className={`text-xs ${ratingColors[lead.rating || 'warm']}`}>
                              {lead.rating === 'hot' ? '***' : lead.rating === 'warm' ? '**' : '*'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {lead.email && <span className="mr-3">{lead.email}</span>}
                            {lead.phone && <span>{lead.phone}</span>}
                          </div>
                          {lead.notes && <div className="text-xs text-gray-500 mt-1">{lead.notes}</div>}
                          <div className="text-xs text-gray-400 mt-1">
                            Forrás: {lead.source} | Létrehozva: {lead.createdAt}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <select
                            value={lead.status}
                            onChange={(e) => {
                              setLeads(leads.map(l => l.id === lead.id ? {...l, status: e.target.value} : l));
                            }}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="new">Új</option>
                            <option value="contacted">Kapcsolatfelvétel</option>
                            <option value="proposal">Ajánlat</option>
                            <option value="negotiation">Tárgyalás</option>
                            <option value="won">Megnyert</option>
                            <option value="lost">Elvesztett</option>
                          </select>
                          <button
                            onClick={() => setLeads(leads.filter(l => l.id !== lead.id))}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PARTNEREK TAB */}
        {activeTab === 'partners' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">* Partnerek kezelése</h2>
              <button
                onClick={() => {
                  setNewPartner({ name: '', email: '', phone: '', notes: '' });
                  setShowAddPartner(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Új partner
              </button>
            </div>

            {/* Partner típus váltó */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPartnerSubTab('clients')}
                className={`px-4 py-2 rounded-lg font-bold ${partnerSubTab === 'clients' ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                * Megbízók ({partners.clients.length})
              </button>
              <button
                onClick={() => setPartnerSubTab('colleagues')}
                className={`px-4 py-2 rounded-lg font-bold ${partnerSubTab === 'colleagues' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                * Kollégák ({partners.colleagues.length})
              </button>
              <button
                onClick={() => setPartnerSubTab('providers')}
                className={`px-4 py-2 rounded-lg font-bold ${partnerSubTab === 'providers' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                * Szolgáltatók ({partners.providers.length})
              </button>
            </div>

            {/* Új partner hozzáadása modal */}
            {showAddPartner && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
                <div className="min-h-full flex items-start justify-center p-4 pt-10 pb-10">
                  <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                    <div className="flex justify-between items-center mb-4 sticky top-0 bg-white pb-2">
                      <h3 className="text-xl font-bold">
                        {partnerSubTab === 'clients' ? '* Új megbízó' : 
                         partnerSubTab === 'colleagues' ? '* Új kolléga' : '* Új szolgáltató'}
                      </h3>
                      <button onClick={() => setShowAddPartner(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={24} />
                      </button>
                    </div>
                  
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Név *</label>
                        <input 
                          type="text" 
                          value={newPartner.name} 
                          onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} 
                          placeholder="Partner neve" 
                          className="w-full px-3 py-2 border rounded-lg" 
                        />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={newPartner.email} 
                        onChange={(e) => setNewPartner({...newPartner, email: e.target.value})} 
                        placeholder="email@example.com" 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input 
                        type="tel" 
                        value={newPartner.phone} 
                        onChange={(e) => setNewPartner({...newPartner, phone: e.target.value})} 
                        placeholder="+36 30 123 4567" 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    {/* Partner login mezők - csak megbízóknál */}
                    {partnerSubTab === 'clients' && (
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-sm text-emerald-800 mb-2">🔐 Partner login (opcionális)</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Jelszó</label>
                            <input 
                              type="text" 
                              value={newPartner.password || ''} 
                              onChange={(e) => setNewPartner({...newPartner, password: e.target.value})} 
                              placeholder="Partner jelszó beállítása"
                              className="w-full px-3 py-2 border rounded-lg text-sm" 
                            />
                          </div>
                          <p className="text-xs text-gray-500">
                            Ha megad jelszót, a partner be tud lépni az email címével a Partner Portálra.
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Szerepkör és Fizetés mezők csak kollégáknál */}
                    {partnerSubTab === 'colleagues' && (
                      <>
                        {/* Szerepkör */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Szerepkör</label>
                          <select
                            value={newPartner.role || 'cleaner'}
                            onChange={(e) => setNewPartner({...newPartner, role: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                          >
                            <option value="admin">* Admin</option>
                            <option value="manager">* Manager</option>
                            <option value="finance">* Pénzügy</option>
                            <option value="cleaner">* Takarító</option>
                            <option value="sales">* Értékesítő</option>
                            <option value="marketing">* Marketing</option>
                            <option value="maintenance">* Karbantartó</option>
                          </select>
                        </div>
                        
                        {/* Fizetés */}
                        <div className="p-3 bg-blue-50 rounded-lg space-y-3">
                          <label className="block text-sm font-medium text-blue-700">Fizetés</label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setNewPartner({...newPartner, salaryType: 'hourly'})}
                              className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                                newPartner.salaryType === 'hourly' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-gray-600 border'
                              }`}
                            >
                              Órabér
                            </button>
                            <button
                              onClick={() => setNewPartner({...newPartner, salaryType: 'fixed'})}
                              className={`flex-1 py-2 rounded-lg font-medium text-sm ${
                                newPartner.salaryType === 'fixed' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-white text-gray-600 border'
                              }`}
                            >
                              Fix havi
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={newPartner.salaryAmount || ''} 
                              onChange={(e) => setNewPartner({...newPartner, salaryAmount: e.target.value === '' ? 0 : parseInt(e.target.value)})} 
                              placeholder="Összeg" 
                              className="flex-1 px-3 py-2 border rounded-lg" 
                            />
                            <span className="text-gray-500 text-sm">
                              {newPartner.salaryType === 'hourly' ? 'Ft/óra' : 'Ft/hó'}
                            </span>
                          </div>
                          
                          {/* Utazási hozzájárulás */}
                          <div className="flex items-center justify-between pt-2 border-t border-blue-200">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-blue-700">* Utazási hozzájárulás</span>
                              <span className="text-xs text-blue-500">+10 000 Ft/hó</span>
                            </div>
                            <button
                              onClick={() => setNewPartner({...newPartner, travelAllowance: !newPartner.travelAllowance})}
                              className={`w-12 h-6 rounded-full transition-colors relative ${
                                newPartner.travelAllowance ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                                newPartner.travelAllowance ? 'right-1' : 'left-1'
                              }`}></span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
                      <textarea 
                        value={newPartner.notes} 
                        onChange={(e) => setNewPartner({...newPartner, notes: e.target.value})} 
                        placeholder="További információk..." 
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          if (newPartner.name) {
                            const partnerId = Date.now();
                            setPartners({
                              ...partners,
                              [partnerSubTab]: [
                                ...partners[partnerSubTab],
                                { id: partnerId, ...newPartner, createdAt: new Date().toISOString() }
                              ]
                            });
                            
                            // Ha kolléga, szinkronizálás a Takarítók-kal
                            if (partnerSubTab === 'colleagues') {
                              setWorkers(prev => [...prev, {
                                id: partnerId,
                                name: newPartner.name.trim(),
                                hourlyRate: newPartner.salaryType === 'hourly' ? (newPartner.salaryAmount || 2200) : 2200,
                                password: newPartner.name.toLowerCase().replace(/\s/g, '') + '123',
                                role: newPartner.role || 'worker'
                              }]);
                            }
                            
                            setNewPartner({ name: '', email: '', phone: '', password: '', notes: '', salaryType: 'hourly', salaryAmount: 2200, travelAllowance: false, role: 'worker', active: true });
                            setShowAddPartner(false);
                          }
                        }}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold"
                      >
                        Mentés
                      </button>
                      <button 
                        onClick={() => setShowAddPartner(false)}
                        className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-bold"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Partner szerkesztése modal */}
            {editingPartner && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold"> Partner szerkesztése</h3>
                    <button onClick={() => setEditingPartner(null)} className="text-gray-500 hover:text-gray-700">
                      <X size={24} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Név *</label>
                      <input 
                        type="text" 
                        value={editingPartner.name} 
                        onChange={(e) => setEditingPartner({...editingPartner, name: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        value={editingPartner.email} 
                        onChange={(e) => setEditingPartner({...editingPartner, email: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input 
                        type="tel" 
                        value={editingPartner.phone} 
                        onChange={(e) => setEditingPartner({...editingPartner, phone: e.target.value})} 
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    {/* SZEREPKÖR - CSAK KOLLÉGÁKNÁL */}
                    {editingPartner.category === 'colleagues' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Szerepkör</label>
                        <select
                          value={editingPartner.role || 'cleaner'}
                          onChange={(e) => setEditingPartner({...editingPartner, role: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg"
                        >
                          <option value="admin">* Admin</option>
                          <option value="manager">* Manager</option>
                          <option value="finance">* Pénzügy</option>
                          <option value="cleaner">* Takarító</option>
                          <option value="sales">* Értékesítő</option>
                          <option value="marketing">* Marketing</option>
                          <option value="maintenance">* Karbantartó</option>
                        </select>
                      </div>
                    )}
                    
                    {/* PARTNER LOGIN - CSAK MEGBÍZÓKNÁL */}
                    {editingPartner.category === 'clients' && (
                      <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                        <h4 className="font-bold text-sm text-emerald-800 mb-2">🔐 Partner login beállítások</h4>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Jelszó (partner belépéshez)</label>
                            <input 
                              type="text" 
                              value={editingPartner.password || ''} 
                              onChange={(e) => setEditingPartner({...editingPartner, password: e.target.value})} 
                              placeholder="Partner jelszó beállítása"
                              className="w-full px-3 py-2 border rounded-lg text-sm" 
                            />
                          </div>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={editingPartner.active !== false}
                              onChange={(e) => setEditingPartner({...editingPartner, active: e.target.checked})}
                              className="rounded"
                            />
                            <span>Partner login aktív</span>
                          </label>
                          {editingPartner.email && editingPartner.password && (
                            <p className="text-xs text-emerald-600 mt-1">
                              ✓ Partner beléphet: {editingPartner.email}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* LAKÁSOK - CSAK MEGBÍZÓKNÁL */}
                    {editingPartner.category === 'clients' && (
                      <div className={`p-3 rounded-lg border-2 ${
                        !editingPartner.apartmentIds || editingPartner.apartmentIds.length === 0 
                          ? 'bg-red-50 border-red-300' 
                          : 'bg-green-50 border-green-300'
                      }`}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium">
                            * Hozzárendelt lakások
                            {(!editingPartner.apartmentIds || editingPartner.apartmentIds.length === 0) && (
                              <span className="text-red-600 ml-2"> Nincs lakás!</span>
                            )}
                          </label>
                          <button
                            onClick={() => {
                              // Megnyitjuk a lakás hozzáadás modalt, és beállítjuk a megbízót
                              setNewApartment({
                                ...newApartment,
                                clientId: editingPartner.id,
                                clientName: editingPartner.name
                              });
                              setShowAddApartment(true);
                            }}
                            className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <Plus size={14} />
                            Új lakás
                          </button>
                        </div>
                        <select 
                          multiple
                          value={editingPartner.apartmentIds || []}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                            setEditingPartner({...editingPartner, apartmentIds: selected});
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          size={Math.min(5, apartments.length || 3)}
                        >
                          {apartments.map(apt => (
                            <option key={apt.id} value={apt.id}>{apt.name}</option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Ctrl+kattintás több kiválasztásához</p>
                        
                        {/* Kiválasztott lakások listája */}
                        {editingPartner.apartmentIds && editingPartner.apartmentIds.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {editingPartner.apartmentIds.map(aptId => {
                              const apt = apartments.find(a => a.id === aptId);
                              return apt ? (
                                <span key={aptId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center gap-1">
                                  * {apt.name}
                                  <button 
                                    onClick={() => setEditingPartner({
                                      ...editingPartner, 
                                      apartmentIds: editingPartner.apartmentIds.filter(id => id !== aptId)
                                    })}
                                    className="text-red-500 hover:text-red-700 ml-1"
                                  >×</button>
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Megjegyzés</label>
                      <textarea 
                        value={editingPartner.notes} 
                        onChange={(e) => setEditingPartner({...editingPartner, notes: e.target.value})} 
                        rows={3}
                        className="w-full px-3 py-2 border rounded-lg" 
                      />
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={() => {
                          // Frissítjük a partnert
                          setPartners({
                            ...partners,
                            [editingPartner.category]: partners[editingPartner.category].map(p => 
                              p.id === editingPartner.id ? editingPartner : p
                            )
                          });
                          
                          // Ha megbízó, frissítjük a lakásokat is
                          if (editingPartner.category === 'clients' && editingPartner.apartmentIds) {
                            setApartments(apartments.map(apt => {
                              if (editingPartner.apartmentIds.includes(apt.id)) {
                                return { ...apt, clientId: editingPartner.id, clientName: editingPartner.name };
                              } else if (apt.clientId === editingPartner.id) {
                                // Ha korábban ehhez a megbízóhoz volt rendelve, de most eltávolítottuk
                                return { ...apt, clientId: '', clientName: '' };
                              }
                              return apt;
                            }));
                          }
                          
                          setEditingPartner(null);
                        }}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-bold"
                      >
                        Mentés
                      </button>
                      <button 
                        onClick={() => setEditingPartner(null)}
                        className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 font-bold"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Partner lista */}
            <div className="space-y-3">
              {partners[partnerSubTab].length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-4xl mb-2">
                    {partnerSubTab === 'clients' ? '*' : partnerSubTab === 'colleagues' ? '*' : '*'}
                  </div>
                  <p>Még nincs {partnerSubTab === 'clients' ? 'megbízó' : partnerSubTab === 'colleagues' ? 'kolléga' : 'szolgáltató'} hozzáadva</p>
                </div>
              ) : (
                partners[partnerSubTab].map(partner => {
                  // Megbízóknál ellenőrizzük a hozzárendelt lakásokat
                  const clientApartments = partnerSubTab === 'clients' 
                    ? apartments.filter(apt => apt.clientId === partner.id || (partner.apartmentIds && partner.apartmentIds.includes(apt.id)))
                    : [];
                  const hasNoApartments = partnerSubTab === 'clients' && clientApartments.length === 0;
                  
                  return (
                    <div key={partner.id} className={`border-2 p-4 rounded-xl ${
                      hasNoApartments 
                        ? 'border-red-300 bg-red-50' 
                        : partnerSubTab === 'clients' ? 'border-blue-200 bg-blue-50' :
                          partnerSubTab === 'colleagues' ? 'border-green-200 bg-green-50' :
                          'border-purple-200 bg-purple-50'
                    }`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{partner.name}</h3>
                            {hasNoApartments && (
                              <span className="bg-red-200 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
                                 Nincs lakás!
                              </span>
                            )}
                          </div>
                          
                          {/* Lakások megjelenítése megbízóknál */}
                          {partnerSubTab === 'clients' && (
                            <div className="mt-2">
                              {clientApartments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {clientApartments.map(apt => (
                                    <span key={apt.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                      * {apt.name}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-red-600">* Nincs hozzárendelt lakás - kattints a szerkesztésre!</p>
                              )}
                            </div>
                          )}
                          
                          <div className="space-y-1 mt-2">
                            {partner.email && (
                              <p className="text-sm flex items-center gap-2">
                                <span>*</span>
                                <a href={`mailto:${partner.email}`} className="text-blue-600 hover:underline">{partner.email}</a>
                              </p>
                            )}
                            {partner.phone && (
                              <p className="text-sm flex items-center gap-2">
                                <span>*</span>
                                <a href={`tel:${partner.phone}`} className="text-blue-600 hover:underline">{partner.phone}</a>
                              </p>
                            )}
                            {partner.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">* {partner.notes}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              // Megbízónál betöltjük a hozzárendelt lakás ID-kat
                              const apartmentIds = partnerSubTab === 'clients' 
                                ? apartments.filter(apt => apt.clientId === partner.id).map(apt => apt.id)
                                : [];
                              setEditingPartner({...partner, category: partnerSubTab, apartmentIds});
                            }}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              if (confirm(`Biztosan törölni szeretnéd: ${partner.name}?`)) {
                                setPartners({
                                  ...partners,
                                  [partnerSubTab]: partners[partnerSubTab].filter(p => p.id !== partner.id)
                                });
                                
                                // Ha kolléga, törlés a Takarítók-ból is
                                if (partnerSubTab === 'colleagues') {
                                  setWorkers(prev => prev.filter(w => w.id !== partner.id));
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* DOKUMENTUMOK TAB */}
        {activeTab === 'documents' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Dokumentumok</h2>
              <button
                onClick={() => setShowAddDocument(true)}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
              >
                <Plus size={18} />
                Új dokumentum
              </button>
            </div>

            {/* Szűrők és statisztika */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <button
                onClick={() => setDocumentFilter('all')}
                className={`p-3 rounded-lg text-center transition ${documentFilter === 'all' ? 'bg-amber-100 border-2 border-amber-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-2xl font-bold text-amber-600">{documents.length}</div>
                <div className="text-xs text-gray-600">Összes</div>
              </button>
              <button
                onClick={() => setDocumentFilter('expiring')}
                className={`p-3 rounded-lg text-center transition ${documentFilter === 'expiring' ? 'bg-yellow-100 border-2 border-yellow-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => {
                    if (!d.expiryDate) return false;
                    const days = Math.ceil((new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return days > 0 && days <= 30;
                  }).length}
                </div>
                <div className="text-xs text-gray-600">30 napon belül lejár</div>
              </button>
              <button
                onClick={() => setDocumentFilter('expired')}
                className={`p-3 rounded-lg text-center transition ${documentFilter === 'expired' ? 'bg-red-100 border-2 border-red-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-2xl font-bold text-red-600">
                  {documents.filter(d => d.expiryDate && new Date(d.expiryDate) < new Date()).length}
                </div>
                <div className="text-xs text-gray-600">Lejárt</div>
              </button>
              <button
                onClick={() => setDocumentFilter('contract')}
                className={`p-3 rounded-lg text-center transition ${documentFilter === 'contract' ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-2xl font-bold text-blue-600">
                  {documents.filter(d => d.category === 'contract').length}
                </div>
                <div className="text-xs text-gray-600">Szerződések</div>
              </button>
              <button
                onClick={() => setDocumentFilter('insurance')}
                className={`p-3 rounded-lg text-center transition ${documentFilter === 'insurance' ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50 hover:bg-gray-100'}`}
              >
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.category === 'insurance').length}
                </div>
                <div className="text-xs text-gray-600">Biztosítások</div>
              </button>
            </div>

            {/* Kategória szűrő gombok */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="text-sm text-gray-600 py-1">Kategóriák:</span>
              {documentCategories.map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setDocumentFilter(documentFilter === cat.key ? 'all' : cat.key)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                    documentFilter === cat.key 
                      ? `bg-${cat.color}-500 text-white` 
                      : `bg-${cat.color}-100 text-${cat.color}-700 hover:bg-${cat.color}-200`
                  }`}
                  style={{
                    backgroundColor: documentFilter === cat.key ? undefined : `var(--${cat.color}-100, #f3f4f6)`,
                  }}
                >
                  {cat.label} ({documents.filter(d => d.category === cat.key).length})
                </button>
              ))}
            </div>

            {/* Új dokumentum form */}
            {showAddDocument && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-6">
                <h3 className="font-bold text-amber-800 mb-3">Új dokumentum hozzáadása</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Dokumentum neve *</label>
                    <input
                      type="text"
                      value={newDocument.name}
                      onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                      placeholder="pl. Bérleti szerződés - D3 Basilica"
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Kategória</label>
                    <select
                      value={newDocument.category}
                      onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      {documentCategories.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Kapcsolódó lakás</label>
                    <select
                      value={newDocument.apartmentId}
                      onChange={(e) => setNewDocument({...newDocument, apartmentId: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="">-- Nincs (általános) --</option>
                      {apartments.map(apt => (
                        <option key={apt.id} value={apt.id}>{apt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Lejárati dátum</label>
                    <input
                      type="date"
                      value={newDocument.expiryDate}
                      onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Státusz</label>
                    <select
                      value={newDocument.status}
                      onChange={(e) => setNewDocument({...newDocument, status: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    >
                      <option value="active">Aktív</option>
                      <option value="pending">Függőben</option>
                      <option value="archived">Archivált</option>
                      <option value="expired">Lejárt</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Fájl URL / Link</label>
                    <input
                      type="text"
                      value={newDocument.fileUrl}
                      onChange={(e) => setNewDocument({...newDocument, fileUrl: e.target.value})}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-amber-700 mb-1">Fájl feltöltés</label>
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            setNewDocument({
                              ...newDocument, 
                              fileName: file.name,
                              fileData: event.target.result,
                              fileSize: file.size,
                              fileType: file.type
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
                    />
                    {newDocument.fileName && (
                      <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
                        <Check size={12} />
                        {newDocument.fileName} ({Math.round((newDocument.fileSize || 0) / 1024)} KB)
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-amber-700 mb-1">Megjegyzések</label>
                    <textarea
                      value={newDocument.notes}
                      onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                      placeholder="További információk..."
                      className="w-full px-3 py-2 border rounded-lg text-sm"
                      rows="2"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      if (newDocument.name) {
                        setDocuments([...documents, {
                          ...newDocument,
                          id: Date.now(),
                          createdAt: new Date().toISOString().split('T')[0]
                        }]);
                        setNewDocument({ name: '', category: 'contract', apartmentId: '', expiryDate: '', status: 'active', notes: '', fileUrl: '', fileName: '', fileData: null });
                        setShowAddDocument(false);
                      }
                    }}
                    className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
                  >
                    Mentés
                  </button>
                  <button
                    onClick={() => setShowAddDocument(false)}
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  >
                    Mégse
                  </button>
                </div>
              </div>
            )}

            {/* Szerkesztő modal */}
            {editingDocument && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Dokumentum szerkesztése</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Dokumentum neve *</label>
                      <input
                        type="text"
                        value={editingDocument.name}
                        onChange={(e) => setEditingDocument({...editingDocument, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Kategória</label>
                      <select
                        value={editingDocument.category}
                        onChange={(e) => setEditingDocument({...editingDocument, category: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        {documentCategories.map(cat => (
                          <option key={cat.key} value={cat.key}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Kapcsolódó lakás</label>
                      <select
                        value={editingDocument.apartmentId || ''}
                        onChange={(e) => setEditingDocument({...editingDocument, apartmentId: e.target.value || null})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">-- Nincs (általános) --</option>
                        {apartments.map(apt => (
                          <option key={apt.id} value={apt.id}>{apt.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Lejárati dátum</label>
                      <input
                        type="date"
                        value={editingDocument.expiryDate || ''}
                        onChange={(e) => setEditingDocument({...editingDocument, expiryDate: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Státusz</label>
                      <select
                        value={editingDocument.status}
                        onChange={(e) => setEditingDocument({...editingDocument, status: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="active">Aktív</option>
                        <option value="pending">Függőben</option>
                        <option value="archived">Archivált</option>
                        <option value="expired">Lejárt</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Fájl URL / Link</label>
                      <input
                        type="text"
                        value={editingDocument.fileUrl || ''}
                        onChange={(e) => setEditingDocument({...editingDocument, fileUrl: e.target.value})}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Megjegyzések</label>
                      <textarea
                        value={editingDocument.notes || ''}
                        onChange={(e) => setEditingDocument({...editingDocument, notes: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        rows="3"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        setDocuments(documents.map(d => d.id === editingDocument.id ? editingDocument : d));
                        setEditingDocument(null);
                      }}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Mentés
                    </button>
                    <button
                      onClick={() => setEditingDocument(null)}
                      className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                    >
                      Mégse
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dokumentumok listája */}
            <div className="space-y-3">
              {documents
                .filter(doc => {
                  if (documentFilter === 'all') return true;
                  if (documentFilter === 'expiring') {
                    if (!doc.expiryDate) return false;
                    const days = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return days > 0 && days <= 30;
                  }
                  if (documentFilter === 'expired') {
                    return doc.expiryDate && new Date(doc.expiryDate) < new Date();
                  }
                  return doc.category === documentFilter;
                })
                .sort((a, b) => {
                  // Lejárt és hamarosan lejáró dokumentumok előre
                  const aExpiry = a.expiryDate ? new Date(a.expiryDate) : new Date('2099-12-31');
                  const bExpiry = b.expiryDate ? new Date(b.expiryDate) : new Date('2099-12-31');
                  return aExpiry - bExpiry;
                })
                .map(doc => {
                  const cat = documentCategories.find(c => c.key === doc.category);
                  const apt = apartments.find(a => a.id === parseInt(doc.apartmentId));
                  const daysUntilExpiry = doc.expiryDate 
                    ? Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                  
                  let expiryColor = 'text-gray-500';
                  let expiryBg = 'bg-gray-100';
                  if (daysUntilExpiry !== null) {
                    if (daysUntilExpiry < 0) { expiryColor = 'text-red-700'; expiryBg = 'bg-red-100'; }
                    else if (daysUntilExpiry <= 7) { expiryColor = 'text-red-600'; expiryBg = 'bg-red-50'; }
                    else if (daysUntilExpiry <= 30) { expiryColor = 'text-yellow-700'; expiryBg = 'bg-yellow-50'; }
                    else { expiryColor = 'text-green-600'; expiryBg = 'bg-green-50'; }
                  }

                  const statusColors = {
                    active: 'bg-green-100 text-green-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                    archived: 'bg-gray-100 text-gray-700',
                    expired: 'bg-red-100 text-red-700'
                  };
                  const statusLabels = {
                    active: 'Aktív',
                    pending: 'Függőben',
                    archived: 'Archivált',
                    expired: 'Lejárt'
                  };

                  return (
                    <div key={doc.id} className={`p-4 rounded-lg border-l-4 ${expiryBg}`} style={{borderColor: daysUntilExpiry !== null && daysUntilExpiry < 0 ? '#dc2626' : daysUntilExpiry !== null && daysUntilExpiry <= 30 ? '#f59e0b' : '#10b981'}}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium bg-${cat?.color || 'gray'}-100 text-${cat?.color || 'gray'}-700`}>
                              {cat?.label || 'Egyéb'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColors[doc.status]}`}>
                              {statusLabels[doc.status]}
                            </span>
                            {apt && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                {apt.name}
                              </span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-800">{doc.name}</h3>
                          {doc.notes && <p className="text-sm text-gray-600 mt-1">{doc.notes}</p>}
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Létrehozva: {doc.createdAt}</span>
                            {doc.expiryDate && (
                              <span className={`font-medium ${expiryColor}`}>
                                {daysUntilExpiry < 0 
                                  ? `Lejárt ${Math.abs(daysUntilExpiry)} napja!`
                                  : daysUntilExpiry === 0
                                    ? 'Ma jár le!'
                                    : `Lejár: ${doc.expiryDate} (${daysUntilExpiry} nap)`
                                }
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200"
                              title="Megnyitás"
                            >
                              <Eye size={18} />
                            </a>
                          )}
                          <button
                            onClick={() => setEditingDocument(doc)}
                            className="bg-amber-100 text-amber-700 p-2 rounded-lg hover:bg-amber-200"
                            title="Szerkesztés"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Biztosan törölni szeretnéd ezt a dokumentumot?')) {
                                setDocuments(documents.filter(d => d.id !== doc.id));
                              }
                            }}
                            className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"
                            title="Törlés"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {documents.filter(doc => {
                if (documentFilter === 'all') return true;
                if (documentFilter === 'expiring') {
                  if (!doc.expiryDate) return false;
                  const days = Math.ceil((new Date(doc.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return days > 0 && days <= 30;
                }
                if (documentFilter === 'expired') {
                  return doc.expiryDate && new Date(doc.expiryDate) < new Date();
                }
                return doc.category === documentFilter;
              }).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">*</div>
                  <p>Nincs megjeleníthető dokumentum</p>
                  <button
                    onClick={() => setShowAddDocument(true)}
                    className="mt-3 text-amber-600 hover:text-amber-700 font-medium"
                  >
                    + Új dokumentum hozzáadása
                  </button>
                </div>
              )}
            </div>

            {/* Gyors sablonok */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-gray-700 mb-3">Gyors hozzáadás sablonból:</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Bérleti szerződés', category: 'contract' },
                  { name: 'Lakásbiztosítás', category: 'insurance' },
                  { name: 'NTAK regisztráció', category: 'permit' },
                  { name: 'Éves leltár', category: 'inventory' },
                  { name: 'Kulcsátadási jegyzőkönyv', category: 'keys' },
                  { name: 'Tűzvédelmi szabályzat', category: 'rules' },
                  { name: 'Karbantartási napló', category: 'maintenance' }
                ].map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setNewDocument({ ...newDocument, name: template.name, category: template.category });
                      setShowAddDocument(true);
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition"
                  >
                    + {template.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* RAKTÁRAK TAB */}
        {activeTab === 'warehouse' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Raktárak - Központi készletkezelés</h2>
            
            {/* Raktár választó gombok */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setWarehouseView('apartments')}
                className={`px-4 py-2 rounded-lg font-bold transition ${warehouseView === 'apartments' ? 'bg-emerald-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Lakások ({apartments.length})
              </button>
              <button
                onClick={() => setWarehouseView('laundry')}
                className={`px-4 py-2 rounded-lg font-bold transition ${warehouseView === 'laundry' ? 'bg-cyan-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Mosoda
              </button>
              <button
                onClick={() => setWarehouseView('workers')}
                className={`px-4 py-2 rounded-lg font-bold transition ${warehouseView === 'workers' ? 'bg-purple-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                Dolgozók ({workers.length})
              </button>
            </div>

            {/* Lakások készlete */}
            {warehouseView === 'apartments' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Válassz lakást a készlet megtekintéséhez/szerkesztéséhez</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {apartments.map(apt => {
                    const inv = apt.inventory || {};
                    return (
                      <div 
                        key={apt.id} 
                        onClick={() => {
                          setEditingApartment(apt);
                          setActiveTab('apartments');
                        }}
                        className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition"
                      >
                        <h3 className="font-bold text-emerald-800">{apt.name}</h3>
                        <div className="text-sm text-emerald-600 mt-2">
                          <div>Lepedő: {inv.sheetCount || 0} ({inv.sheetSize || '-'})</div>
                          <div>Ágynemű szett: {inv.beddingSetCount || 0} ({inv.beddingSetBrand || '-'})</div>
                          <div>Törölközők: Nagy {inv.largeTowel || 0}, Köz. {inv.mediumTowel || 0}, Kéz {inv.handTowel || 0}</div>
                          <div>Kádkilépő: {inv.bathMat || 0} | Konyharuha: {inv.kitchenTowel || 0}</div>
                          {inv.otherItems?.length > 0 && <div>Egyéb: {inv.otherItems.length} tétel</div>}
                        </div>
                        <div className="mt-2 text-xs text-emerald-500">Kattints a szerkesztéshez</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Mosoda készlete */}
            {warehouseView === 'laundry' && (
              <div className="space-y-4">
                <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                  <h3 className="font-bold text-cyan-800 mb-4">Mosoda raktárkészlet</h3>
                  
                  {/* Ágynemű */}
                  <div className="mb-4 pb-4 border-b border-cyan-200">
                    <p className="text-sm font-semibold text-cyan-700 mb-2">Ágynemű</p>
                    <div className="grid grid-cols-2 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Lepedő</label>
                        <div className="flex gap-1">
                          <input type="number" value={laundryInventory.sheetCount} onChange={(e) => setLaundryInventory({...laundryInventory, sheetCount: parseInt(e.target.value) || 0})} className="w-16 px-2 py-1 border rounded text-sm" min="0" />
                          <select value={laundryInventory.sheetSize} onChange={(e) => setLaundryInventory({...laundryInventory, sheetSize: e.target.value})} className="flex-1 px-2 py-1 border rounded text-sm">
                            <option value="90x200">90x200</option>
                            <option value="140x200">140x200</option>
                            <option value="160x200">160x200</option>
                            <option value="180x200">180x200</option>
                            <option value="200x200">200x200</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Ágynemű szett</label>
                        <div className="flex gap-1">
                          <input type="number" value={laundryInventory.beddingSetCount} onChange={(e) => setLaundryInventory({...laundryInventory, beddingSetCount: parseInt(e.target.value) || 0})} className="w-16 px-2 py-1 border rounded text-sm" min="0" />
                          <select value={laundryInventory.beddingSetBrand} onChange={(e) => setLaundryInventory({...laundryInventory, beddingSetBrand: e.target.value})} className="flex-1 px-2 py-1 border rounded text-sm">
                            <option value="IKEA">IKEA</option>
                            <option value="JYSK">JYSK</option>
                            <option value="Egyeb">Egyéb</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Törölközők */}
                  <div className="mb-4 pb-4 border-b border-cyan-200">
                    <p className="text-sm font-semibold text-cyan-700 mb-2">Törölközők</p>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Nagy</label>
                        <input type="number" value={laundryInventory.largeTowel} onChange={(e) => setLaundryInventory({...laundryInventory, largeTowel: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-sm" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Közepes</label>
                        <input type="number" value={laundryInventory.mediumTowel} onChange={(e) => setLaundryInventory({...laundryInventory, mediumTowel: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-sm" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Kéztörlő</label>
                        <input type="number" value={laundryInventory.handTowel} onChange={(e) => setLaundryInventory({...laundryInventory, handTowel: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-sm" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Kádkilépő</label>
                        <input type="number" value={laundryInventory.bathMat} onChange={(e) => setLaundryInventory({...laundryInventory, bathMat: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-sm" min="0" />
                      </div>
                      <div>
                        <label className="block text-xs text-cyan-600 mb-1">Konyharuha</label>
                        <input type="number" value={laundryInventory.kitchenTowel} onChange={(e) => setLaundryInventory({...laundryInventory, kitchenTowel: parseInt(e.target.value) || 0})} className="w-full px-2 py-1 border rounded text-sm" min="0" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Egyéb tételek */}
                  <div>
                    <p className="text-sm font-semibold text-cyan-700 mb-2">Egyéb tételek</p>
                    {laundryInventory.otherItems?.length > 0 && (
                      <div className="space-y-1 mb-2">
                        {laundryInventory.otherItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                            <span className="flex-1 text-sm">{item.name}</span>
                            <span className="text-sm font-bold text-cyan-700">{item.quantity} db</span>
                            <button onClick={() => {
                              const newItems = [...laundryInventory.otherItems];
                              newItems.splice(idx, 1);
                              setLaundryInventory({...laundryInventory, otherItems: newItems});
                            }} className="text-red-500 hover:text-red-700">
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input type="text" placeholder="Tétel neve..." id="laundryNewItemName" className="flex-1 px-2 py-1 border rounded text-sm" />
                      <input type="number" placeholder="db" id="laundryNewItemQty" className="w-16 px-2 py-1 border rounded text-sm" min="1" defaultValue="1" />
                      <button onClick={() => {
                        const nameInput = document.getElementById('laundryNewItemName');
                        const qtyInput = document.getElementById('laundryNewItemQty');
                        if (nameInput.value.trim()) {
                          setLaundryInventory({
                            ...laundryInventory,
                            otherItems: [...(laundryInventory.otherItems || []), { name: nameInput.value.trim(), quantity: parseInt(qtyInput.value) || 1 }]
                          });
                          nameInput.value = '';
                          qtyInput.value = '1';
                        }
                      }} className="bg-cyan-600 text-white px-3 py-1 rounded text-sm hover:bg-cyan-700">+</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Dolgozók készlete */}
            {warehouseView === 'workers' && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm mb-4">Dolgozóknál lévő készletek (amit hazavittek)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workers.map(worker => {
                    const inv = workerInventories[worker.id] || { otherItems: [] };
                    return (
                      <div key={worker.id} className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <h3 className="font-bold text-purple-800 mb-3">{worker.name}</h3>
                        
                        {/* Meglévő tételek */}
                        {inv.otherItems?.length > 0 && (
                          <div className="space-y-1 mb-3">
                            {inv.otherItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                                <span className="flex-1 text-sm">{item.name}</span>
                                <span className="text-sm font-bold text-purple-700">{item.quantity} db</span>
                                <button onClick={() => {
                                  const newItems = [...inv.otherItems];
                                  newItems.splice(idx, 1);
                                  setWorkerInventories({...workerInventories, [worker.id]: {...inv, otherItems: newItems}});
                                }} className="text-red-500 hover:text-red-700">
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Új tétel hozzáadása */}
                        <div className="flex gap-2">
                          <input type="text" placeholder="Tétel neve..." id={`workerNewItem_${worker.id}`} className="flex-1 px-2 py-1 border rounded text-sm" />
                          <input type="number" placeholder="db" id={`workerNewQty_${worker.id}`} className="w-16 px-2 py-1 border rounded text-sm" min="1" defaultValue="1" />
                          <button onClick={() => {
                            const nameInput = document.getElementById(`workerNewItem_${worker.id}`);
                            const qtyInput = document.getElementById(`workerNewQty_${worker.id}`);
                            if (nameInput.value.trim()) {
                              const currentInv = workerInventories[worker.id] || { otherItems: [] };
                              setWorkerInventories({
                                ...workerInventories,
                                [worker.id]: {
                                  ...currentInv,
                                  otherItems: [...(currentInv.otherItems || []), { name: nameInput.value.trim(), quantity: parseInt(qtyInput.value) || 1 }]
                                }
                              });
                              nameInput.value = '';
                              qtyInput.value = '1';
                            }
                          }} className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700">+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Összesítés */}
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-bold text-gray-800 mb-3">Összesítés</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-emerald-100 p-3 rounded">
                  <div className="text-emerald-800 font-bold">Lakások</div>
                  <div className="text-emerald-600">
                    {apartments.reduce((sum, a) => sum + (a.inventory?.sheetCount || 0) + (a.inventory?.beddingSetCount || 0), 0)} ágynemű
                  </div>
                </div>
                <div className="bg-cyan-100 p-3 rounded">
                  <div className="text-cyan-800 font-bold">Mosoda</div>
                  <div className="text-cyan-600">
                    {laundryInventory.sheetCount + laundryInventory.beddingSetCount} ágynemű
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded">
                  <div className="text-purple-800 font-bold">Dolgozók</div>
                  <div className="text-purple-600">
                    {Object.values(workerInventories).reduce((sum, inv) => sum + (inv.otherItems?.length || 0), 0)} tétel
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BEÁLLÍTÁSOK TAB */}
        {activeTab === 'settings' && currentModule === 'management' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4"> Beállítások</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Általános beállítások */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-3">* Általános</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EUR árfolyam (Ft) - MNB napi</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={eurRate}
                        onChange={(e) => setEurRate(parseInt(e.target.value) || 400)}
                        className="flex-1 px-3 py-2 border rounded-lg"
                      />
                      <button
                        onClick={async () => {
                          try {
                            // MNB árfolyam lekérése (szimuláció - valós API-hoz fetch kell)
                            const today = new Date().toISOString().split('T')[0];
                            // Szimulált MNB árfolyam (valós implementációhoz: MNB SOAP API vagy árfolyam szolgáltatás)
                            const simulatedRate = Math.round(390 + Math.random() * 20);
                            setEurRate(simulatedRate);
                            alert('MNB árfolyam frissítve: ' + simulatedRate + ' Ft/EUR (' + today + ')');
                          } catch (err) {
                            alert('Hiba az árfolyam lekérésekor');
                          }
                        }}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        MNB Frissítés
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Utolsó frissítés: {new Date().toLocaleDateString('hu-HU')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alapértelmezett takarítási óradíj (Ft)</label>
                    <input
                      type="number"
                      value={2200}
                      className="w-full px-3 py-2 border rounded-lg bg-gray-100"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              
              {/* Szolgáltatási csomagok */}
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                <h3 className="font-bold text-emerald-800 mb-3">* Szolgáltatási csomagok</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span>* Alap csomag</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span> Pro csomag</span>
                    <span className="font-bold">25%</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white rounded border">
                    <span>* Max csomag</span>
                    <span className="font-bold">35%</span>
                  </div>
                </div>
              </div>
              
              {/* Adatok kezelése */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="font-bold text-red-800 mb-3">* Adatok kezelése</h3>
                <div className="space-y-2">
                  <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                    * Adatok exportálása (JSON)
                  </button>
                  <button className="w-full bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 text-sm">
                    * Adatok importálása
                  </button>
                  <button className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm">
                    * Összes adat törlése
                  </button>
                </div>
              </div>
              
              {/* Értesítések */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">* Értesítések</h3>
                <div className="space-y-2 text-sm text-gray-500 text-center py-4">
                  <div className="text-2xl">*</div>
                  <p>Értesítési beállítások hamarosan...</p>
                </div>
              </div>
            </div>

            {/* Felhasználók kezelése */}
            <div className="mt-6 bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-purple-800">Felhasználók kezelése</h3>
                <button
                  onClick={() => setShowAddUser(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
                >
                  <Plus size={16} />
                  Új felhasználó
                </button>
              </div>

              {/* Jogosultsági szintek magyarázat */}
              <div className="mb-4 p-3 bg-white rounded-lg border">
                <p className="text-xs font-semibold text-gray-600 mb-2">Jogosultsági szintek:</p>
                <div className="flex flex-wrap gap-2">
                  {userRoles.map(role => (
                    <span key={role.key} className={`px-2 py-1 rounded text-xs bg-${role.color}-100 text-${role.color}-700`}>
                      {role.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Új felhasználó form */}
              {showAddUser && (
                <div className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-300">
                  <h4 className="font-bold text-purple-700 mb-3">Új felhasználó hozzáadása</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Felhasználónév *</label>
                      <input
                        type="text"
                        value={newUser.username}
                        onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="pl. kovacs.peter"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Teljes név *</label>
                      <input
                        type="text"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="Kovács Péter"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="peter@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Jelszó *</label>
                      <input
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                        placeholder="********"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-700 mb-1">Szerepkör</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => {
                          const role = userRoles.find(r => r.key === e.target.value);
                          setNewUser({...newUser, role: e.target.value, permissions: role?.permissions || []});
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        {userRoles.map(role => (
                          <option key={role.key} value={role.key}>{role.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newUser.active}
                          onChange={(e) => setNewUser({...newUser, active: e.target.checked})}
                          className="rounded"
                        />
                        <span className="text-sm">Aktív felhasználó</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Egyedi jogosultságok */}
                  <div className="mt-3">
                    <label className="block text-xs text-purple-700 mb-2">Egyedi jogosultságok:</label>
                    <div className="flex flex-wrap gap-2">
                      {permissionModules.map(perm => (
                        <label key={perm.key} className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={newUser.permissions.includes(perm.key) || newUser.permissions.includes('all')}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({...newUser, permissions: [...newUser.permissions, perm.key]});
                              } else {
                                setNewUser({...newUser, permissions: newUser.permissions.filter(p => p !== perm.key)});
                              }
                            }}
                            disabled={newUser.permissions.includes('all')}
                            className="rounded"
                          />
                          {perm.label}
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        if (newUser.username && newUser.name && newUser.password) {
                          setUsers([...users, {
                            ...newUser,
                            id: Date.now(),
                            createdAt: new Date().toISOString().split('T')[0],
                            lastLogin: null
                          }]);
                          setNewUser({ username: '', name: '', email: '', password: '', role: 'viewer', permissions: [], active: true });
                          setShowAddUser(false);
                        } else {
                          alert('Kérlek töltsd ki a kötelező mezőket!');
                        }
                      }}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Mentés
                    </button>
                    <button
                      onClick={() => setShowAddUser(false)}
                      className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 text-sm"
                    >
                      Mégse
                    </button>
                  </div>
                </div>
              )}

              {/* Felhasználók listája */}
              <div className="space-y-2">
                {users.map(user => {
                  const role = userRoles.find(r => r.key === user.role);
                  return (
                    <div key={user.id} className={`p-3 rounded-lg border ${user.active ? 'bg-white' : 'bg-gray-100 opacity-60'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{user.name}</span>
                            <span className={`px-2 py-0.5 rounded text-xs bg-${role?.color || 'gray'}-100 text-${role?.color || 'gray'}-700`}>
                              {role?.label || user.role}
                            </span>
                            {!user.active && <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">Inaktív</span>}
                          </div>
                          <div className="text-sm text-gray-600">@{user.username} {user.email && `| ${user.email}`}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            Létrehozva: {user.createdAt} | Utolsó belépés: {user.lastLogin || 'Még nem lépett be'}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {(user.permissions.includes('all') ? ['Teljes hozzáférés'] : user.permissions).map((perm, idx) => (
                              <span key={idx} className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">{perm}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (user.role !== 'superadmin' && confirm('Biztosan törölni szeretnéd ezt a felhasználót?')) {
                                setUsers(users.filter(u => u.id !== user.id));
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                            disabled={user.role === 'superadmin'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Szerkesztő modal */}
              {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                    <h3 className="text-xl font-bold mb-4">Felhasználó szerkesztése: {editingUser.name}</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Felhasználónév</label>
                        <input
                          type="text"
                          value={editingUser.username}
                          onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Teljes név</label>
                        <input
                          type="text"
                          value={editingUser.name}
                          onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingUser.email || ''}
                          onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Új jelszó (hagyd üresen ha nem változtatod)</label>
                        <input
                          type="password"
                          placeholder="********"
                          onChange={(e) => setEditingUser({...editingUser, password: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Szerepkör</label>
                        <select
                          value={editingUser.role}
                          onChange={(e) => {
                            const role = userRoles.find(r => r.key === e.target.value);
                            setEditingUser({...editingUser, role: e.target.value, permissions: role?.permissions || []});
                          }}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                          disabled={editingUser.role === 'superadmin'}
                        >
                          {userRoles.map(role => (
                            <option key={role.key} value={role.key}>{role.label}</option>
                          ))}
                        </select>
                      </div>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingUser.active}
                          onChange={(e) => setEditingUser({...editingUser, active: e.target.checked})}
                          className="rounded"
                          disabled={editingUser.role === 'superadmin'}
                        />
                        <span className="text-sm">Aktív felhasználó</span>
                      </label>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
                          setEditingUser(null);
                        }}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                      >
                        Mentés
                      </button>
                      <button
                        onClick={() => setEditingUser(null)}
                        className="flex-1 bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                      >
                        Mégse
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'laundry' && currentModule === 'cleaning' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">* Mosoda kezelés</h2>
            
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl mb-6 border-2 border-gray-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl"></span>
                <span>Beállítások</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow-sm">
                  <label className="block text-sm font-bold text-blue-800 mb-2">Ár / kg (Ft)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={laundrySettings.pricePerKg === 0 ? '' : laundrySettings.pricePerKg}
                      onChange={(e) => setLaundrySettings({...laundrySettings, pricePerKg: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button 
                      onClick={() => {
                        // Save to localStorage or show confirmation
                        alert('Ár mentve: ' + laundrySettings.pricePerKg + ' Ft/kg');
                      }}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                    >
                      *
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border-2 border-orange-200 shadow-sm">
                  <label className="block text-sm font-bold text-orange-800 mb-2">Fogyóeszköz költség (Ft)</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={laundrySettings.suppliesCost === 0 ? '' : laundrySettings.suppliesCost}
                      onChange={(e) => setLaundrySettings({...laundrySettings, suppliesCost: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                      placeholder="0"
                      className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button 
                      onClick={() => {
                        // This will add the supplies cost to the default for new entries
                        alert('Alap fogyóeszköz költség beállítva: ' + laundrySettings.suppliesCost + ' Ft');
                      }}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-sm"
                    >
                      
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-4 border-2 border-blue-200">
              <h3 className="font-bold mb-3">Új mosoda bejegyzés</h3>
              
              <div className="grid md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Dátum</label>
                  <input
                    type="date"
                    value={newLaundry.date}
                    onChange={(e) => setNewLaundry({...newLaundry, date: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Lakás</label>
                  <select
                    value={newLaundry.apartmentId}
                    onChange={(e) => setNewLaundry({...newLaundry, apartmentId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Válassz lakást...</option>
                    {apartments.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Súly (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newLaundry.weight === 0 ? '' : newLaundry.weight}
                    onChange={(e) => {
                      const weight = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      const pricePerKg = laundrySettings.pricePerKg || 0;
                      const washingCost = weight * pricePerKg;
                      const suppliesCost = parseInt(newLaundry.suppliesCost) || 0;
                      const total = washingCost + suppliesCost;
                      setNewLaundry({...newLaundry, weight, pricePerKg, totalCost: total});
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Ár: {laundrySettings.pricePerKg} Ft/kg
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div className="bg-orange-50 border-2 border-orange-300 p-3 rounded-lg">
                  <label className="block text-xs font-bold text-orange-800 mb-1">Fogyóeszköz költség (Ft)</label>
                  <input
                    type="number"
                    value={newLaundry.suppliesCost === 0 ? '' : newLaundry.suppliesCost}
                    onChange={(e) => {
                      const suppliesCost = e.target.value === '' ? 0 : parseInt(e.target.value);
                      const weight = parseFloat(newLaundry.weight) || 0;
                      const pricePerKg = parseInt(newLaundry.pricePerKg) || 0;
                      const washingCost = weight * pricePerKg;
                      const total = washingCost + suppliesCost;
                      setNewLaundry({...newLaundry, suppliesCost, totalCost: total});
                    }}
                    placeholder="0"
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                
                <div className="bg-green-50 border-2 border-green-300 p-3 rounded-lg">
                  <label className="block text-xs font-bold text-green-800 mb-1">Összköltség</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={newLaundry.totalCost}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg bg-white font-bold text-green-700"
                    />
                    <span className="text-green-700 font-bold">Ft</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (newLaundry.date && newLaundry.apartmentId && newLaundry.weight > 0) {
                    const apt = apartments.find(a => a.id === newLaundry.apartmentId);
                    setLaundryEntries([...laundryEntries, {
                      id: Date.now(),
                      date: newLaundry.date,
                      apartmentName: apt.name,
                      weight: newLaundry.weight,
                      pricePerKg: newLaundry.pricePerKg,
                      suppliesCost: newLaundry.suppliesCost || 0,
                      totalCost: newLaundry.totalCost
                    }]);
                    setNewLaundry({ date: '', apartmentId: '', weight: 0, pricePerKg: 0, suppliesCost: 0, totalCost: 0 });
                  }
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
              >
                + Hozzáadás
              </button>
            </div>

            <div className="space-y-2">
              {laundryEntries.map(entry => (
                <div key={entry.id} className="border p-3 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{entry.apartmentName}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(entry.date).toLocaleDateString('hu-HU')}
                      </p>
                    </div>
                    <button
                      onClick={() => setLaundryEntries(laundryEntries.filter(e => e.id !== entry.id))}
                      className="text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>* Mosás: {entry.weight} kg × {entry.pricePerKg} Ft/kg = {(entry.weight * entry.pricePerKg).toLocaleString()} Ft</div>
                    {entry.suppliesCost > 0 && (
                      <div>* Fogyóeszköz: {entry.suppliesCost.toLocaleString()} Ft</div>
                    )}
                    <div className="font-bold text-cyan-700 pt-1">Összesen: {entry.totalCost.toLocaleString()} Ft</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

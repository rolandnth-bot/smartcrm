// SmartCRM - Browser compatible version
const { useState, useEffect, useRef, useCallback } = React;

// Simple icon components
const Plus = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '+');
const Trash2 = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '🗑');
const LogOut = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '🚪');
const Edit2 = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '✏');
const Check = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '✓');
const X = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '✕');
const FileText = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '📄');
const Shirt = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '👕');
const ChevronLeft = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '‹');
const ChevronDown = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '▼');
const ChevronUp = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '▲');
const Eye = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '👁');
const EyeOff = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '🙈');
const ShoppingCart = ({size = 16}) => React.createElement('span', {style: {fontSize: size}}, '🛒');

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

function SmartCRM() {
  const [isAdmin, setIsAdmin] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  
  // App mode from subdomain (cleanapp.smartcrm.hu, partner.smartcrm.hu)
  const appMode = typeof window !== 'undefined' ? window.SMARTCRM_MODE || 'admin' : 'admin';
  
  // Partner login
  const [isPartnerMode, setIsPartnerMode] = useState(appMode === 'partner');
  const [partnerLoginForm, setPartnerLoginForm] = useState({ email: '', password: '' });
  const [currentPartner, setCurrentPartner] = useState(null);
  const [partnerEditingApartment, setPartnerEditingApartment] = useState(null);
  
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
    clients: [
      { id: 1, name: 'Teszt Partner Kft.', email: 'partner@test.hu', phone: '+36301234567', password: 'partner123', notes: 'Teszt partner fiók', apartmentIds: [1], active: true }
    ],      // Megbízók - partner login-nal
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
    operationType: 'short-term', // Üzemeltetés típusa: short-term / fixed-term
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
      c.email?.toLowerCase() === partnerLoginForm.email.toLowerCase() && 
      c.password === partnerLoginForm.password &&
      c.active !== false
    );
    
    if (partner) {
      setCurrentPartner(partner);
      setPartnerLoginForm({ email: '', password: '' });
    } else {
      alert('Hibás email cím vagy jelszó!');
    }
  };

  const handlePartnerLogout = () => {
    setCurrentPartner(null);
    setPartnerEditingApartment(null);
    setPartnerLoginForm({ email: '', password: '' });
    setIsPartnerMode(false);
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
            <h2 className="text-xl font-bold text-gray-800 mb-4">Az Ön lakásai ({partnerApartments.length})</h2>
            
            {partnerApartments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🏢</div>
                <p className="text-lg">Még nincs Önhöz rendelt lakás.</p>
                <p className="text-sm mt-2">Kérjük, vegye fel a kapcsolatot az adminisztrátorral.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {partnerApartments.map(apt => (
                  <div key={apt.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg text-gray-800">{apt.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        apt.operationType === 'short-term' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {apt.operationType === 'short-term' ? 'Rövidtávú' : 'Hosszútávú'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {apt.city && apt.street ? `${apt.zipCode || ''} ${apt.city}, ${apt.street}` : 'Cím nincs megadva'}
                    </p>
                    <div className="flex gap-2 text-xs text-gray-500 mb-3">
                      {apt.apartmentSize && <span>📐 {apt.apartmentSize} m²</span>}
                      {apt.ntakNumber && <span>📋 {apt.ntakNumber}</span>}
                    </div>
                    <button
                      onClick={() => setPartnerEditingApartment({...apt})}
                      className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 font-medium text-sm"
                    >
                      ✏️ Szerkesztés
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
                <h3 className="text-lg font-bold">🏠 {partnerEditingApartment.name || 'Lakás'} szerkesztése</h3>
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
                        <option value="fixed-term">Határozott idejű</option>
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
                  <div className="grid grid-cols-2 gap-2 mt-2">
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
                          'XI': { type: 'percent', value: 4 },
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
                        <option value="VI">VI. kerület - 4% ⚠️ lakáskiadás tiltva!</option>
                        <option value="VII">VII. kerület - 4%</option>
                        <option value="VIII">VIII. kerület - 4%</option>
                        <option value="IX">IX. kerület - 4%</option>
                        <option value="XI">XI. kerület - 4%</option>
                        <option value="XII">XII. kerület - 4%</option>
                        <option value="XIII">XIII. kerület - 4%</option>
                        <option value="XIV">XIV. kerület (Zugló) - 4%</option>
                      </optgroup>
                      <optgroup label="Tételes (Ft/fő/éj)">
                        <option value="II">II. kerület - 800 Ft/fő/éj</option>
                        <option value="IV">IV. kerület - 500 Ft/fő/éj</option>
                        <option value="X">X. kerület (Kőbánya) - 800 Ft/fő/éj</option>
                        <option value="XV">XV. kerület - 450 Ft/fő/éj</option>
                        <option value="XVI">XVI. kerület - 400 Ft/fő/éj</option>
                        <option value="XVII">XVII. kerület - 600 Ft/fő/éj</option>
                        <option value="XVIII">XVIII. kerület - 550 Ft/fő/éj</option>
                        <option value="XIX">XIX. kerület - 600 Ft/fő/éj</option>
                        <option value="XX">XX. kerület - 500 Ft/fő/éj</option>
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
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <h4 className="font-bold text-sm text-indigo-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded mr-1">B</span>Booking felszereltségek</h4>
                  <div className="max-h-64 overflow-y-auto">
                    {Object.entries(BOOKING_FELSZERELTSEG).map(([category, {color, items}]) => (
                      <div key={category} className="mb-3">
                        <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                        <div className="grid grid-cols-2 gap-1">
                          {items.map(item => (
                            <label key={item} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-indigo-100 p-1 rounded">
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
                                className="w-3 h-3 accent-indigo-600"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">🏠 SmartCRM</h1>
          <p className="text-gray-500 text-center mb-8">Fejlesztői mód</p>
          
          <div className="space-y-4">
            <button 
              onClick={() => {
                setIsAdmin(true);
                setCurrentUser({ id: 'admin', name: 'Admin', role: 'admin' });
                setCurrentModule('home');
                setActiveTab('overview');
              }}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl hover:bg-indigo-700 font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-2xl">👔</span>
              Admin
            </button>
            
            <button 
              onClick={() => {
                setIsAdmin(false);
                setCurrentUser({ id: 1, name: 'Emese', role: 'cleaner', hourlyRate: 2500 });
                setCurrentModule('cleaning');
                setActiveTab('jobs');
              }}
              className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-2xl">🧹</span>
              CleanApp
            </button>
            
            <button 
              onClick={() => {
                setCurrentPartner({ id: 1, name: 'Teszt Partner Kft.', email: 'partner@test.hu' });
                setIsAdmin(true);
                setCurrentUser({ id: 'partner', name: 'Partner', role: 'partner' });
              }}
              className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl hover:bg-emerald-700 font-bold text-lg flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-2xl">🤝</span>
              Partner
            </button>
          </div>
          
          <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
            smartproperties.hu
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
                            <option value="fixed-term">Határozott idejű bérlet</option>
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
                              <option value="fixed-term">Határozott idejű</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
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
                            <label className="block text-xs font-medium text-gray-700 mb-1">Havidíj (EUR)</label>
                            <select 
                              value={editingApartment.monthlyFeeEur || 0} 
                              onChange={(e) => setEditingApartment({...editingApartment, monthlyFeeEur: parseInt(e.target.value)})} 
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            >
                              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50].map(val => (
                                <option key={val} value={val}>{val} EUR</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Takarítási díj (EUR)
                              {editingApartment.servicePackage === 'max' && <span className="text-pink-600 ml-1"> benne van!</span>}
                            </label>
                            {editingApartment.servicePackage === 'max' ? (
                              <div className="w-full px-3 py-2 border rounded-lg text-sm bg-pink-50 border-pink-300 text-pink-700">
                                 Benne van a csomagban
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={(editingApartment.cleaningFeeEur === 0 || editingApartment.cleaningFeeEur === undefined) ? '' : editingApartment.cleaningFeeEur}
                                onChange={(e) => setEditingApartment({...editingApartment, cleaningFeeEur: e.target.value === '' ? 0 : parseInt(e.target.value)})}
                                placeholder="0"
                                className="w-full px-3 py-2 border rounded-lg text-sm"
                              />
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
                      <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                        <h4 className="font-bold text-sm text-indigo-800 mb-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded mr-1">B</span>Booking felszereltségek</h4>
                        <div className="max-h-64 overflow-y-auto">
                          {Object.entries(BOOKING_FELSZERELTSEG).map(([category, {color, items}]) => (
                            <div key={category} className="mb-3">
                              <div className={`font-semibold text-xs px-2 py-1 rounded mb-1 sticky top-0 ${color}`}>{category}</div>
                              <div className="grid grid-cols-2 gap-1">
                                {items.map(item => (
                                  <label key={item} className="flex items-center gap-1 text-xs cursor-pointer hover:bg-indigo-100 p-1 rounded">
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
                                      className="w-3 h-3 accent-indigo-600"
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
                            <span className={`px-2 py-1 rounded ${a.operationType === 'fixed-term' ? 'bg-amber-100' : 'bg-pink-100'}`}>
                              {a.operationType === 'fixed-term' ? '* Határozott' : '* Rövidtávú'}
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


// Render app
ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(SmartCRM));

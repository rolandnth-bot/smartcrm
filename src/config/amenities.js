/**
 * Felszereltségek (Amenities) – Airbnb és Booking.com listák
 * Lakás felszereltség kezeléshez (ApartmentsPage, stb.)
 */

/** Airbnb felszerelések (flat lista) - teljes lista */
export const AIRBNB_AMENITIES = [
  'Ablakrácsok',
  'Ajánlat bébiszitterekre',
  'Alapvető kellékek',
  'Bababiztonsági kapuk',
  'Babafigyelő',
  'Babakád',
  'Babaágy',
  'Beltéri kandalló',
  'Bidé',
  'Biliárdasztal',
  'Borospoharak',
  'Bowlingpálya',
  'Csomagmegőrzés',
  'Csónakkikötő',
  'Daráló',
  'Edzőfelszerelés',
  'Edzőterem',
  'Egyszintes otthon',
  'Elektromosjármű-töltő',
  'Elsősegélykészlet',
  'Etetőszék',
  'Ethernet kapcsolat',
  'Fagyasztó',
  'Fizetős parkolás a helyszínen',
  'Fizetős parkolás más helyszínen',
  'Függőágy',
  'Fürdőkád',
  'Fürdőszappan',
  'Füstérzékelő',
  'Fűtés',
  'Grillező',
  'Grillező eszközök',
  'Gyerekbicikli',
  'Gyerekkönyvek és játékok',
  'Gördeszkás rámpa',
  'Hajbalzsam',
  'Hajszárító',
  'Hifiberendezés',
  'Hokipálya',
  'Hordozható ventilátorok',
  'Hosszú távú foglalás megengedett',
  'Hátsó udvar',
  'Hűtő',
  'Ingyenes parkolás a helyszínen',
  'Ingyenes utcai parkolás',
  'Játszószoba gyerekeknek',
  'Játékgépek',
  'Játékkonzol',
  'Kajak',
  'Kandallórács',
  'Kenyérkészítő',
  'Kenyérpirító',
  'Kerékpárok',
  'Konnektorvédők',
  'Konyha',
  'Konyhai alapkellékek',
  'Kávéfőző',
  'Kávézók',
  'Könyvek és olvasnivalók',
  'Kültéri bútorzat',
  'Kültéri zuhanyzó',
  'Külön munkaterület',
  'Lemezjátszó',
  'Lift',
  'Légkondicionálás',
  'Lézerharc',
  'Medence',
  'Meleg víz',
  'Mennyezeti ventilátor',
  'Mikrohullámú sütő',
  'Minigolf',
  'Minihűtő',
  'Mosoda a közelben',
  'Mosogatógép',
  'Mosógép',
  'Mozi',
  'Mászófal',
  'Nyugágyak',
  'Pelenkázóasztal',
  'Pezsgőfürdő',
  'Pingpongasztal',
  'Plusz párnák és takarók',
  'Pályaszállás',
  'Reggeli',
  'Resort access',
  'Rizsfőző',
  'Ruhaszárító állvány',
  'Ruhatároló',
  'Saját bejárat',
  'Saját nappali',
  'Saját partszakasz',
  'Sampon',
  'Sarokvédő az asztalokon',
  'Strandkellékek',
  'Szabadtéri játszótér',
  'Szabadtéri konyha',
  'Szabadtéri étkezőterület',
  'Szauna',
  'Szemétprés',
  'Szárítógép',
  'Széf',
  'Szén-monoxid-érzékelő',
  'Szúnyogháló',
  'Sötétítők/árnyékolók',
  'Sütő',
  'Takarítás igényelhető',
  'Teakonyha',
  'Tematikus szoba',
  'Tepsi',
  'Terasz vagy erkély',
  'Tisztítószerek',
  'Tusfürdő',
  'TV',
  'Táblajátékok',
  'Tóparti kijárás',
  'Tűzhely',
  'Tűzoltó készülék',
  'Tűzrakóhely',
  'Utazóágy',
  'Vasaló',
  'Vállfák',
  'Vízforraló',
  'Vízparti',
  'Wifi',
  'Zongora',
  'Zsebwifi',
  'Ágynemű',
  'Életnagyságú játékok',
  'Étkezőasztal',
  'Étkészlet gyermekeknek',
  'Étkészlet és evőeszközök',
  'Ütőketrec'
];

/** Booking felszereltségek kategóriák szerint (teljes lista) */
export const BOOKING_FELSZERELTSEG = {
  'Legnépszerűbb szolgáltatások': {
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    items: [
      'Úszómedence',
      'Bár',
      'Szauna',
      'Kert',
      'Terasz',
      'Nemdohányzó szobák',
      'Családi szobák',
      'Pezsgőfürdő | masszázsmedence',
      'Légkondicionálás'
    ]
  },
  'Étkezések': {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    items: [
      'Reggeli',
      'Ebéd',
      'Vacsora'
    ]
  },
  'Beszélt nyelvek': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    items: [
      'Magyar',
      'Angol',
      'Német',
      'Francia',
      'Olasz',
      'Spanyol'
    ]
  },
  'Információk az épületről': {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    items: [
      'Épület szintjeinek száma',
      'Szobák száma'
    ]
  },
  'Biztonsági intézkedések': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Személyzet biztonsági előírásokat betart',
      'Nincsenek közös írószerek/magazinok',
      'Kézfertőtlenítő a szálláson',
      'Vendégek egészségi állapotának ellenőrzése',
      'Elsősegélydoboz',
      'Egészségügyi szakértők elérhetőek',
      'Lázmérő vendégeknek',
      'Arcmaszkok vendégeknek',
      'Érintkezés nélküli be/kijelentkezés',
      'Készpénzmentes fizetés',
      'Biztonságos távolság szabályozás',
      'Mobilapp szobaszervizhez',
      'Térelválasztók személyzet és vendégek között'
    ]
  },
  'Tisztaság és fertőtlenítés': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Koronavírus ellen hatásos tisztítószerek',
      'Ágynemű mosás előírás szerint',
      'Fertőtlenítés vendégváltáskor',
      'Szállás lezárása takarítás után',
      'Hivatásos takarító cégek',
      'Takarítás kihagyható kérésre'
    ]
  },
  'Ital- és ételbiztonság': {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    items: [
      'Távolságtartás étkezőkben',
      'Étel szállítás szállásegységbe',
      'Fertőtlenített étkészlet',
      'Reggeli elviteles dobozok',
      'Biztonságosan lezárt kiszállított étel'
    ]
  },
  'Önkiszolgáló bejelentkezés': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    items: [
      'Online útlevél/személyi beküldés',
      'Bejelentkezési automata előtérben',
      'Zárható kulcsmegőrző szálláson',
      'Zárható kulcsmegőrző másik helyszínen',
      'Szobaajtó bluetooth zárnyitás',
      'Szobaajtó internet zárnyitás',
      'PIN-kód zárnyitás',
      'QR-kód beolvasás',
      'Bejelentkezési app'
    ]
  },
  'Szabadidős lehetőségek': {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    items: [
      'Teniszfelszerelés',
      'Tollaslabda-kellékek',
      'Strand',
      'Időszaki képkiállítások',
      'Kocsmatúrák',
      'Stand-up előadások',
      'Filmestek',
      'Városnéző séta',
      'Kerékpártúrák',
      'Tematikus vacsorák',
      'Happy hour',
      'Túra helyi kultúráról',
      'Főzőiskola',
      'Élőzene/előadás',
      'Élő sportközvetítés',
      'Íjászat',
      'Aerobik',
      'Bingó',
      'Teniszpálya',
      'Biliárd',
      'Asztalitenisz',
      'Darts',
      'Fallabda',
      'Bowling',
      'Minigolf',
      'Golfpálya (3 km-en belül)',
      'Vízipark',
      'Vízi sport helyben',
      'Szörfözés',
      'Búvárkodás',
      'Sznorkelezés',
      'Kenu',
      'Horgászat',
      'Lovaglás',
      'Kerékpározás',
      'Túrázás',
      'Síelés'
    ]
  },
  'Étkezés': {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    items: [
      'Gyermekmenü',
      'Gyermekbarát étterem',
      'Bor | pezsgő',
      'Gyümölcs a szobában',
      'Kávézó helyben',
      'Étterem',
      'Büfé',
      'Élelmiszer-házhozszállítás',
      'Csomagolt ebéd',
      'Grillezési lehetőség',
      'Italautomata',
      'Ételautomata',
      'Speciális diétás étel',
      'Szobaszerviz',
      'Reggeli a szobában'
    ]
  },
  'Medence és wellness': {
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    items: [
      'Vízicsúszda',
      'Napozóágyak/székek',
      'Napernyők',
      'Szépészeti szolgáltatások',
      'Wellness szolgáltatások',
      'Gőzkamra',
      'Wellness pihenőterület',
      'Lábfürdő',
      'Wellnesscsomagok',
      'Masszázsszék'
    ]
  },
  'Fitnesz': {
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    items: [
      'Jógaórák',
      'Fitneszórák',
      'Személyi edző',
      'Fitnesz öltözőszekrények',
      'Gyerekmedence',
      'Wellnessközpont',
      'Törökfürdő | gőzfürdő',
      'Fitneszközpont',
      'Szolárium',
      'Termálvizes medence',
      'Masszázs',
      'Szabadtéri fürdő',
      'Nyilvános fürdő'
    ]
  },
  'Közlekedés': {
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    items: [
      'Tömegközlekedési jegyek',
      'Transzferszolgáltatás',
      'Kerékpártároló',
      'Kerékpárkölcsönzés',
      'Autókölcsönző',
      'Reptéri transzfer',
      'Parkolás'
    ]
  },
  'Recepció': {
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    items: [
      'Számla kérhető',
      'Éjjel-nappali recepció',
      'Egyedi be/kijelentkezés',
      'Soron kívüli be/kijelentkezés',
      'Concierge-szolgáltatás',
      'Utazásszervezés',
      'Pénzváltó',
      'Pénzkiadó automata',
      'Poggyászmegőrzés',
      'Zárható szekrények'
    ]
  },
  'Közös helyiségek': {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    items: [
      'Kerti bútorok',
      'Piknikezőhely',
      'Kandalló',
      'Tűzrakóhely',
      'Napozóterasz',
      'Közös konyha',
      'Közös társalgó | tévészoba',
      'Játékterem',
      'Kápolna | kegyhely'
    ]
  },
  'Szórakozás és családok': {
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    items: [
      'Társasjátékok | kirakók',
      'Beltéri játszóhelyiség',
      'Kültéri játszótéri játékok',
      'Gyermekbiztonsági kapuk',
      'Babakocsi',
      'Esti szórakozás',
      'Diszkó | DJ',
      'Kaszinó',
      'Karaoke',
      'Szórakoztatás',
      'Gyerekklub',
      'Játszótér',
      'Gyermekfelügyelet'
    ]
  },
  'Takarítási szolgáltatások': {
    color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    items: [
      'Vegytisztítás',
      'Vasalási szolgáltatás',
      'Mosoda',
      'Takarítás naponta',
      'Nadrágvasaló'
    ]
  },
  'Üzleti szolgáltatások': {
    color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
    items: [
      'Tárgyaló | rendezvényterem',
      'Üzleti központ',
      'Fax | fénymásolás'
    ]
  },
  'Üzletek': {
    color: 'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-300',
    items: [
      'Kisbolt helyben',
      'Fodrászat | szépségszalon'
    ]
  },
  'Egyéb': {
    color: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-900/30 dark:text-neutral-300',
    items: [
      'Kisállat fekhely',
      'Kisállat etetőtál',
      'Bejutás kulccsal',
      'Bejutás kulcskártyával',
      'Csak felnőtteket fogadó szállás',
      'Antiallergén szoba',
      'Nemdohányzó épület',
      'Kijelölt dohányzóhely',
      'Akadálymentesített',
      'Lift',
      'Hangszigetelt szobák',
      'Fűtés'
    ]
  },
  'Biztonság': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Éjjel-nappali biztonsági szolgálat',
      'Riasztórendszer',
      'Füstjelzők',
      'Biztonsági kamera közös helyiségekben',
      'Térfigyelő kamera',
      'Tűzoltókészülékek',
      'Szén-monoxid érzékelő',
      'Széf'
    ]
  },
  // Szoba szintű felszereltségek (részletes lista)
  'Szobafelszereltség': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    items: [
      'Kiságy | bölcső',
      'Ruhatartó állvány',
      'Ruhaszárító állvány',
      'Kihajtható ágy',
      'Kanapéágy',
      'Szemetes',
      'Fűtött medence',
      'Végtelenített medence',
      'Merülőmedence',
      'Medencetakaró',
      'Strandtörölközők',
      'Medencére nyíló kilátás',
      'Medence a tetőn',
      'Sós vizes medence',
      'Sekély rész',
      'Légkondicionálás',
      'Privát medence',
      'Szárítógép',
      'Ruhásszekrény',
      'Szőnyegpadló',
      'Öltöző',
      '2 méternél hosszabb ágyak',
      'Ventilátor',
      'Kandalló',
      'Fűtés',
      'Egymásba nyíló szoba',
      'Vasaló',
      'Vasalási lehetőség',
      'Pezsgőfürdő',
      'Szúnyogháló',
      'Saját bejárat',
      'Széf',
      'Kanapé',
      'Hangszigetelés',
      'Ülősarok',
      'Járólap | márványpadló',
      'Nadrágvasaló',
      'Mosógép',
      'Fapadló | parketta',
      'Íróasztal',
      'Antiallergén',
      'Takarítószerek',
      'Elektromosan fűthető takaró',
      'Pizsama',
      'Nyári kimonó',
      'Konnektor az ágy közelében',
      'Adapter',
      'Tollpárna',
      'Nem tollpárna',
      'Hipoallergén párna'
    ]
  },
  'Fürdőszoba': {
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    items: [
      'Vécépapír',
      'Fürdőkád',
      'Bidé',
      'Fürdőkád vagy zuhanykabin',
      'Fürdőköpeny',
      'Ingyen pipereholmi',
      'Vendég vécé',
      'Hajszárító',
      'Hidromasszázskád',
      'Közös használatú vécé',
      'Szauna',
      'Zuhany',
      'Papucs',
      'Vécé',
      'Fogkefe',
      'Sampon',
      'Hajbalzsam',
      'Tusfürdő',
      'Zuhanysapka'
    ]
  },
  'Média/technológia': {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    items: [
      'Játékkonzol - PS4',
      'Játékkonzol - Wii U',
      'Játékkonzol - Xbox One',
      'Számítógép',
      'Játékkonzol',
      'Játékkonzol - Nintendo Wii',
      'Játékkonzol - PS2',
      'Játékkonzol - PS3',
      'Játékkonzol - Xbox 360',
      'Laptop',
      'iPad',
      'Kábeltévé',
      'CD-lejátszó',
      'DVD-lejátszó',
      'Fax',
      'iPod-dokkoló állomás',
      'Laptopszéf',
      'Síkképernyős tévé',
      'Fizetős csatornák',
      'Rádió',
      'Műholdas csatornák',
      'Telefon',
      'Tévé',
      'Videólejátszó',
      'Videójátékok',
      'Blu-ray lejátszó',
      'Hordozható wifi hotspot',
      'Okostelefon',
      'Netflix/streaming'
    ]
  },
  'Étkezés': {
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    items: [
      'Étkező',
      'Étkezőasztal',
      'Borospohár',
      'Palackozott víz',
      'Csokoládé vagy keksz',
      'Gyümölcsök',
      'Bor/pezsgő',
      'Grillsütő',
      'Sütő',
      'Főzőlap',
      'Kenyérpirító',
      'Mosogatógép',
      'Vízforraló',
      'Kültéri étkező',
      'Kültéri bútorok',
      'Minibár',
      'Konyha',
      'Konyhasarok',
      'Konyhai felszerelés',
      'Mikrohullámú sütő',
      'Hűtőszekrény',
      'Tea- és kávéfőző',
      'Kávéfőző',
      'Etetőszék'
    ]
  },
  'Szolgáltatások/extrák': {
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    items: [
      'Kulcskártyás',
      'Zárható szekrény',
      'Kulccsal zárható',
      'Belépés az executive lounge-ba',
      'Ébresztőóra',
      'Ébresztés',
      'Ébresztő-szolgáltatás',
      'Ágynemű',
      'Törölközők',
      'Törölköző | ágynemű felár ellenében'
    ]
  },
  'Szabadtéri/kilátás': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Erkély',
      'Kültéri pihenősarok',
      'Kilátás',
      'Terasz',
      'Városra nyíló kilátás',
      'Kertre nyíló kilátás',
      'Tóra nyíló kilátás',
      'Nevezetességre nyíló kilátás',
      'Hegyre nyíló kilátás',
      'Medencére nyíló kilátás',
      'Folyóra nyíló kilátás',
      'Tengerre nyíló kilátás',
      'Belső udvarra nyíló kilátás',
      'Csendes utcára nyíló kilátás'
    ]
  },
  'Akadálymentesség': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    items: [
      'Lifttel megközelíthető',
      'Teljes szállásegység a földszinten',
      'Akadálymentesített (kerekesszék)',
      'Vizuális segítség hallássérülteknek',
      'Felső szintek lifttel érhetőek el',
      'Felső szintek csak lépcsőn',
      'Akadálymentesített kád',
      'Vészjelző a fürdőszobában',
      'Magasított vécécsésze',
      'Alacsony mosdó',
      'Akadálymentesített zuhanyzó',
      'Zuhanyszék',
      'Vécé korláttal',
      'Besétálós zuhanykabin'
    ]
  },
  'Az épület jellegzetességei': {
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    items: [
      'Különálló',
      'Különlakás az épületben',
      'Félig különálló'
    ]
  },
  'Szórakozás és családok': {
    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    items: [
      'Babarács',
      'Társasjátékok/kirakós játékok',
      'Könyv, DVD vagy zene gyerekeknek',
      'Gyermekbiztonsági konnektorvédő'
    ]
  },
  'Biztonság': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Szén-monoxid érzékelő',
      'Szén-monoxid források',
      'Füstjelző',
      'Tűzoltókészülék'
    ]
  },
  'Biztonsági intézkedések': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Légtisztító',
      'Távolság másoktól',
      'Szobánkénti légkondicionáló'
    ]
  },
  'Tisztaság és fertőtlenítés': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Kézfertőtlenítő'
    ]
  }
};

/**
 * Booking.com – 2 külön lista a kérésetek szerint:
 * - Booking beállítások: "Legnépszerűbb szolgáltatások", "Étkezések", stb. (extranet-szintű opciók)
 * - Booking felszereltségek: "Szobafelszereltség", "Fürdőszoba", stb. (szoba szintű felszereltségek)
 *
 * A `BOOKING_FELSZERELTSEG` marad a teljes (union) lista kompatibilitás miatt.
 */
const BOOKING_SETTINGS_KEYS = [
  'Legnépszerűbb szolgáltatások',
  'Étkezések',
  'Beszélt nyelvek',
  'Információk az épületről',
  'Biztonsági intézkedések',
  'Tisztaság és fertőtlenítés',
  'Ital- és ételbiztonság',
  'Önkiszolgáló bejelentkezés',
  'Szabadidős lehetőségek',
  'Étkezés',
  'Medence és wellness',
  'Fitnesz',
  'Közlekedés',
  'Recepció',
  'Közös helyiségek',
  'Szórakozás és családok',
  'Takarítási szolgáltatások',
  'Üzleti szolgáltatások',
  'Üzletek',
  'Egyéb',
  'Biztonság'
];

const BOOKING_ROOM_AMENITIES_KEYS = [
  'Szobafelszereltség',
  'Fürdőszoba',
  'Média/technológia',
  'Étkezés',
  'Szolgáltatások/extrák',
  'Szabadtéri/kilátás',
  'Akadálymentesség',
  'Az épület jellegzetességei',
  'Szórakozás és családok',
  'Biztonság',
  'Biztonsági intézkedések',
  'Tisztaság és fertőtlenítés'
];

const pickCategories = (keys) =>
  Object.fromEntries(
    keys
      .filter((k) => BOOKING_FELSZERELTSEG[k])
      .map((k) => [k, BOOKING_FELSZERELTSEG[k]])
  );

export const BOOKING_BEALLITASOK = pickCategories(BOOKING_SETTINGS_KEYS);
export const BOOKING_FELSZERELTSEGEK = pickCategories(BOOKING_ROOM_AMENITIES_KEYS);

/** Összes Booking felszereltség flat listában */
export const BOOKING_FELSZERELTSEG_ALL = Object.values(BOOKING_FELSZERELTSEG).flatMap(
  (cat) => cat.items
);

export const BOOKING_BEALLITASOK_ALL = Object.values(BOOKING_BEALLITASOK).flatMap((cat) => cat.items);
export const BOOKING_FELSZERELTSEGEK_ALL = Object.values(BOOKING_FELSZERELTSEGEK).flatMap((cat) => cat.items);

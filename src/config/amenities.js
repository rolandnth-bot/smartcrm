/**
 * Felszereltségek (Amenities)  Airbnb és Booking.com listák
 * Lakás felszereltség kezeléshez (ApartmentsPage, stb.)
 */

/** Airbnb felszerelések (flat lista) - teljes lista */
export const AIRBNB_AMENITIES = [
  'Ablakrácsok',
  'Ajánlat bébiszitterekre',
  'Alapvet kellékek',
  'Bababiztonsági kapuk',
  'Babafigyel',
  'Babakád',
  'Babaágy',
  'Beltéri kandalló',
  'Bidé',
  'Biliárdasztal',
  'Borospoharak',
  'Bowlingpálya',
  'Csomagmegrzés',
  'Csónakkiköt',
  'Daráló',
  'Edzfelszerelés',
  'Edzterem',
  'Egyszintes otthon',
  'Elektromosjárm-tölt',
  'Elssegélykészlet',
  'Etetszék',
  'Ethernet kapcsolat',
  'Fagyasztó',
  'Fizets parkolás a helyszínen',
  'Fizets parkolás más helyszínen',
  'Függágy',
  'Fürdkád',
  'Fürdszappan',
  'Füstérzékel',
  'Ftés',
  'Grillez',
  'Grillez eszközök',
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
  'Ht',
  'Ingyenes parkolás a helyszínen',
  'Ingyenes utcai parkolás',
  'Játszószoba gyerekeknek',
  'Játékgépek',
  'Játékkonzol',
  'Kajak',
  'Kandallórács',
  'Kenyérkészít',
  'Kenyérpirító',
  'Kerékpárok',
  'Konnektorvédk',
  'Konyha',
  'Konyhai alapkellékek',
  'Kávéfz',
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
  'Mikrohullámú süt',
  'Minigolf',
  'Miniht',
  'Mosoda a közelben',
  'Mosogatógép',
  'Mosógép',
  'Mozi',
  'Mászófal',
  'Nyugágyak',
  'Pelenkázóasztal',
  'Pezsgfürd',
  'Pingpongasztal',
  'Plusz párnák és takarók',
  'Pályaszállás',
  'Reggeli',
  'Resort access',
  'Rizsfz',
  'Ruhaszárító állvány',
  'Ruhatároló',
  'Saját bejárat',
  'Saját nappali',
  'Saját partszakasz',
  'Sampon',
  'Sarokvéd az asztalokon',
  'Strandkellékek',
  'Szabadtéri játszótér',
  'Szabadtéri konyha',
  'Szabadtéri étkezterület',
  'Szauna',
  'Szemétprés',
  'Szárítógép',
  'Széf',
  'Szén-monoxid-érzékel',
  'Szúnyogháló',
  'Sötétítk/árnyékolók',
  'Süt',
  'Takarítás igényelhet',
  'Teakonyha',
  'Tematikus szoba',
  'Tepsi',
  'Terasz vagy erkély',
  'Tisztítószerek',
  'Tusfürd',
  'TV',
  'Táblajátékok',
  'Tóparti kijárás',
  'Tzhely',
  'Tzoltó készülék',
  'Tzrakóhely',
  'Utazóágy',
  'Vasaló',
  'Vállfák',
  'Vízforraló',
  'Vízparti',
  'Wifi',
  'Zongora',
  'Zsebwifi',
  'Ágynem',
  'Életnagyságú játékok',
  'Étkezasztal',
  'Étkészlet gyermekeknek',
  'Étkészlet és eveszközök',
  'Ütketrec'
];

/** Booking felszereltségek kategóriák szerint (teljes lista) */
export const BOOKING_FELSZERELTSEG = {
  'Legnépszerbb szolgáltatások': {
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    items: [
      'Úszómedence',
      'Bár',
      'Szauna',
      'Kert',
      'Terasz',
      'Nemdohányzó szobák',
      'Családi szobák',
      'Pezsgfürd | masszázsmedence',
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
  'Információk az épületrl': {
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
    items: [
      'Épület szintjeinek száma',
      'Szobák száma'
    ]
  },
  'Biztonsági intézkedések': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Személyzet biztonsági elírásokat betart',
      'Nincsenek közös írószerek/magazinok',
      'Kézferttlenít a szálláson',
      'Vendégek egészségi állapotának ellenrzése',
      'Elssegélydoboz',
      'Egészségügyi szakértk elérhetek',
      'Lázmér vendégeknek',
      'Arcmaszkok vendégeknek',
      'Érintkezés nélküli be/kijelentkezés',
      'Készpénzmentes fizetés',
      'Biztonságos távolság szabályozás',
      'Mobilapp szobaszervizhez',
      'Térelválasztók személyzet és vendégek között'
    ]
  },
  'Tisztaság és ferttlenítés': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Koronavírus ellen hatásos tisztítószerek',
      'Ágynem mosás elírás szerint',
      'Ferttlenítés vendégváltáskor',
      'Szállás lezárása takarítás után',
      'Hivatásos takarító cégek',
      'Takarítás kihagyható kérésre'
    ]
  },
  'Ital- és ételbiztonság': {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    items: [
      'Távolságtartás étkezkben',
      'Étel szállítás szállásegységbe',
      'Ferttlenített étkészlet',
      'Reggeli elviteles dobozok',
      'Biztonságosan lezárt kiszállított étel'
    ]
  },
  'Önkiszolgáló bejelentkezés': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    items: [
      'Online útlevél/személyi beküldés',
      'Bejelentkezési automata eltérben',
      'Zárható kulcsmegrz szálláson',
      'Zárható kulcsmegrz másik helyszínen',
      'Szobaajtó bluetooth zárnyitás',
      'Szobaajtó internet zárnyitás',
      'PIN-kód zárnyitás',
      'QR-kód beolvasás',
      'Bejelentkezési app'
    ]
  },
  'Szabadids lehetségek': {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    items: [
      'Teniszfelszerelés',
      'Tollaslabda-kellékek',
      'Strand',
      'Idszaki képkiállítások',
      'Kocsmatúrák',
      'Stand-up eladások',
      'Filmestek',
      'Városnéz séta',
      'Kerékpártúrák',
      'Tematikus vacsorák',
      'Happy hour',
      'Túra helyi kultúráról',
      'Fziskola',
      'Élzene/eladás',
      'Él sportközvetítés',
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
      'Bor | pezsg',
      'Gyümölcs a szobában',
      'Kávézó helyben',
      'Étterem',
      'Büfé',
      'Élelmiszer-házhozszállítás',
      'Csomagolt ebéd',
      'Grillezési lehetség',
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
      'Napernyk',
      'Szépészeti szolgáltatások',
      'Wellness szolgáltatások',
      'Gzkamra',
      'Wellness pihenterület',
      'Lábfürd',
      'Wellnesscsomagok',
      'Masszázsszék'
    ]
  },
  'Fitnesz': {
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    items: [
      'Jógaórák',
      'Fitneszórák',
      'Személyi edz',
      'Fitnesz öltözszekrények',
      'Gyerekmedence',
      'Wellnessközpont',
      'Törökfürd | gzfürd',
      'Fitneszközpont',
      'Szolárium',
      'Termálvizes medence',
      'Masszázs',
      'Szabadtéri fürd',
      'Nyilvános fürd'
    ]
  },
  'Közlekedés': {
    color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300',
    items: [
      'Tömegközlekedési jegyek',
      'Transzferszolgáltatás',
      'Kerékpártároló',
      'Kerékpárkölcsönzés',
      'Autókölcsönz',
      'Reptéri transzfer',
      'Parkolás'
    ]
  },
  'Recepció': {
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300',
    items: [
      'Számla kérhet',
      'Éjjel-nappali recepció',
      'Egyedi be/kijelentkezés',
      'Soron kívüli be/kijelentkezés',
      'Concierge-szolgáltatás',
      'Utazásszervezés',
      'Pénzváltó',
      'Pénzkiadó automata',
      'Poggyászmegrzés',
      'Zárható szekrények'
    ]
  },
  'Közös helyiségek': {
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    items: [
      'Kerti bútorok',
      'Piknikezhely',
      'Kandalló',
      'Tzrakóhely',
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
      'Kisállat etettál',
      'Bejutás kulccsal',
      'Bejutás kulcskártyával',
      'Csak felntteket fogadó szállás',
      'Antiallergén szoba',
      'Nemdohányzó épület',
      'Kijelölt dohányzóhely',
      'Akadálymentesített',
      'Lift',
      'Hangszigetelt szobák',
      'Ftés'
    ]
  },
  'Biztonság': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Éjjel-nappali biztonsági szolgálat',
      'Riasztórendszer',
      'Füstjelzk',
      'Biztonsági kamera közös helyiségekben',
      'Térfigyel kamera',
      'Tzoltókészülékek',
      'Szén-monoxid érzékel',
      'Széf'
    ]
  },
  // Szoba szint felszereltségek (részletes lista)
  'Szobafelszereltség': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    items: [
      'Kiságy | bölcs',
      'Ruhatartó állvány',
      'Ruhaszárító állvány',
      'Kihajtható ágy',
      'Kanapéágy',
      'Szemetes',
      'Ftött medence',
      'Végtelenített medence',
      'Merülmedence',
      'Medencetakaró',
      'Strandtörölközk',
      'Medencére nyíló kilátás',
      'Medence a tetn',
      'Sós vizes medence',
      'Sekély rész',
      'Légkondicionálás',
      'Privát medence',
      'Szárítógép',
      'Ruhásszekrény',
      'Sznyegpadló',
      'Öltöz',
      '2 méternél hosszabb ágyak',
      'Ventilátor',
      'Kandalló',
      'Ftés',
      'Egymásba nyíló szoba',
      'Vasaló',
      'Vasalási lehetség',
      'Pezsgfürd',
      'Szúnyogháló',
      'Saját bejárat',
      'Széf',
      'Kanapé',
      'Hangszigetelés',
      'Ülsarok',
      'Járólap | márványpadló',
      'Nadrágvasaló',
      'Mosógép',
      'Fapadló | parketta',
      'Íróasztal',
      'Antiallergén',
      'Takarítószerek',
      'Elektromosan fthet takaró',
      'Pizsama',
      'Nyári kimonó',
      'Konnektor az ágy közelében',
      'Adapter',
      'Tollpárna',
      'Nem tollpárna',
      'Hipoallergén párna'
    ]
  },
  'Fürdszoba': {
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    items: [
      'Vécépapír',
      'Fürdkád',
      'Bidé',
      'Fürdkád vagy zuhanykabin',
      'Fürdköpeny',
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
      'Tusfürd',
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
      'Síkképernys tévé',
      'Fizets csatornák',
      'Rádió',
      'Mholdas csatornák',
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
      'Étkez',
      'Étkezasztal',
      'Borospohár',
      'Palackozott víz',
      'Csokoládé vagy keksz',
      'Gyümölcsök',
      'Bor/pezsg',
      'Grillsüt',
      'Süt',
      'Fzlap',
      'Kenyérpirító',
      'Mosogatógép',
      'Vízforraló',
      'Kültéri étkez',
      'Kültéri bútorok',
      'Minibár',
      'Konyha',
      'Konyhasarok',
      'Konyhai felszerelés',
      'Mikrohullámú süt',
      'Htszekrény',
      'Tea- és kávéfz',
      'Kávéfz',
      'Etetszék'
    ]
  },
  'Szolgáltatások/extrák': {
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    items: [
      'Kulcskártyás',
      'Zárható szekrény',
      'Kulccsal zárható',
      'Belépés az executive lounge-ba',
      'Ébresztóra',
      'Ébresztés',
      'Ébreszt-szolgáltatás',
      'Ágynem',
      'Törölközk',
      'Törölköz | ágynem felár ellenében'
    ]
  },
  'Szabadtéri/kilátás': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Erkély',
      'Kültéri pihensarok',
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
      'Bels udvarra nyíló kilátás',
      'Csendes utcára nyíló kilátás'
    ]
  },
  'Akadálymentesség': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    items: [
      'Lifttel megközelíthet',
      'Teljes szállásegység a földszinten',
      'Akadálymentesített (kerekesszék)',
      'Vizuális segítség hallássérülteknek',
      'Fels szintek lifttel érhetek el',
      'Fels szintek csak lépcsn',
      'Akadálymentesített kád',
      'Vészjelz a fürdszobában',
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
      'Gyermekbiztonsági konnektorvéd'
    ]
  },
  'Biztonság': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    items: [
      'Szén-monoxid érzékel',
      'Szén-monoxid források',
      'Füstjelz',
      'Tzoltókészülék'
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
  'Tisztaság és ferttlenítés': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    items: [
      'Kézferttlenít'
    ]
  }
};

/**
 * Booking.com  2 külön lista a kérésetek szerint:
 * - Booking beállítások: "Legnépszerbb szolgáltatások", "Étkezések", stb. (extranet-szint opciók)
 * - Booking felszereltségek: "Szobafelszereltség", "Fürdszoba", stb. (szoba szint felszereltségek)
 *
 * A `BOOKING_FELSZERELTSEG` marad a teljes (union) lista kompatibilitás miatt.
 */
const BOOKING_SETTINGS_KEYS = [
  'Legnépszerbb szolgáltatások',
  'Étkezések',
  'Beszélt nyelvek',
  'Információk az épületrl',
  'Biztonsági intézkedések',
  'Tisztaság és ferttlenítés',
  'Ital- és ételbiztonság',
  'Önkiszolgáló bejelentkezés',
  'Szabadids lehetségek',
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
  'Fürdszoba',
  'Média/technológia',
  'Étkezés',
  'Szolgáltatások/extrák',
  'Szabadtéri/kilátás',
  'Akadálymentesség',
  'Az épület jellegzetességei',
  'Szórakozás és családok',
  'Biztonság',
  'Biztonsági intézkedések',
  'Tisztaság és ferttlenítés'
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

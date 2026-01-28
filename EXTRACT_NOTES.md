# Extract Notes - Kiemelt részletek a forrásból

## Leads Modul (smartcrm.jsx ~603-8227)

### State változók
```javascript
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
const [newLead, setNewLead] = useState({
  name: '', email: '', phone: '', source: 'website', status: 'new', 
  apartmentInterest: '', budget: '', notes: '', assignedTo: ''
});
```

### Lead objektum struktúra
```javascript
{
  id: Date.now(),
  name: string,
  email: string,
  phone: string,
  source: string,
  status: 'new' | 'contacted' | 'proposal' | 'negotiation' | 'won' | 'lost',
  rating: 'hot' | 'warm' | 'cold',
  notes: string,
  createdAt: string (ISO date)
}
```

### Főbb funkciók
- Lead hozzáadása (név kötelező)
- Lead szerkesztése
- Lead törlése
- Státusz változtatás
- Import (CSV, JSON, Google Sheets - placeholder)
- Filter státusz szerint

## Marketing Modul (smartcrm.jsx ~7820-7877)

### Jelenlegi állapot
- Placeholder UI elemek
- Marketing csatornák lista (Weboldal, Instagram, Facebook, TikTok)
- Kampány kezelés: "Hamarosan..."
- Statisztikák: "Hamarosan..."
- Tartalom naptár: "Hamarosan..."

### Tervezett funkciók (később)
- Marketing csatornák integráció
- Kampány létrehozás/kezelés
- Marketing metrikák
- Tartalom tervezés naptár

## Ikonok
A monolitban emoji ikonok vannak használva:
- Plus: '+'
- Trash2: '🗑'
- LogOut: '🚪'
- Edit2: '✏'
- Check: '✓'
- X: '✕'

## Stílusok
- Tailwind utility classes
- Színkódok státuszokhoz (orange, yellow, blue, purple, cyan, green, red)
- Gradient gombok (from-{color}-500 to-{color}-700)


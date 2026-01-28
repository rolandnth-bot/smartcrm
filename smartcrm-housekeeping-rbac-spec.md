# SmartCRM - Housekeeping + RBAC Implementációs Csomag

## Összefoglaló

| Fejlesztés | Leírás | Prioritás |
|------------|--------|-----------|
| **A) Housekeeping** | Takarítás modul kiemelése Management-be | P0 |
| **B) RBAC** | Csempeszintű jogosultságkezelés | P0/P1 |

---

# A) HOUSEKEEPING MODUL

## A1) Adatmodell

### Firestore Collection: `cleanings`

```javascript
cleanings/{id}: {
  id: string,                    // auto-generated
  apartmentId: string,           // FK → apartments
  apartmentName: string,         // denormalizált (gyors megjelenítés)
  bookingId: string | null,      // FK → bookings (nullable)
  
  // Alapadatok
  date: string,                  // "2026-01-20" (takarítás napja)
  amount: number,                // összeg
  currency: "HUF" | "EUR",       // default: HUF
  
  // Státusz
  status: "planned" | "done" | "paid",
  
  // Hozzárendelés
  assigneeUserId: string | null, // FK → users
  assigneeName: string | null,   // denormalizált
  
  // Egyéb
  notes: string | null,
  
  // Kapcsolódó foglalás (denormalizált, gyors megjelenítés)
  booking: {
    guestName: string,
    checkIn: string,
    checkOut: string
  } | null,
  
  // Meta
  createdAt: timestamp,
  updatedAt: timestamp,
  createdBy: string              // userId
}
```

### Indexek (Firestore)
```
cleanings:
  - apartmentId + date (compound)
  - date + status (compound)
  - assigneeUserId + date (compound)
```

---

## A2) API Endpointok

### GET `/api/cleanings`
Takarítások listázása szűrőkkel.

**Query params:**
```
apartmentId?: string
year: number (required)
month: number (required, 1-12)
status?: "planned" | "done" | "paid"
assigneeUserId?: string
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "clean_abc123",
      "apartmentId": "apt_1",
      "apartmentName": "A57 Downtown",
      "date": "2026-01-20",
      "amount": 15000,
      "currency": "HUF",
      "status": "planned",
      "assigneeName": "Kiss Anna",
      "booking": {
        "guestName": "John Smith",
        "checkIn": "2026-01-15",
        "checkOut": "2026-01-20"
      }
    }
  ],
  "summary": {
    "total": 12,
    "planned": 3,
    "done": 5,
    "paid": 4,
    "totalAmount": 180000
  }
}
```

**Permission:** `cleaning.view`

---

### POST `/api/cleanings`
Új takarítás létrehozása.

**Request body:**
```json
{
  "apartmentId": "apt_1",
  "bookingId": "book_xyz",       // optional
  "date": "2026-01-20",
  "amount": 15000,
  "currency": "HUF",
  "status": "planned",
  "assigneeUserId": "user_123",  // optional
  "notes": "Extra mélytisztítás"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "clean_newid", ...fullObject }
}
```

**Permission:** `cleaning.edit`

---

### PATCH `/api/cleanings/:id`
Takarítás módosítása.

**Request body:** (partial update)
```json
{
  "status": "done",
  "amount": 18000,
  "notes": "Pótmunka: ablaktisztítás"
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updatedObject }
}
```

**Permission:** `cleaning.edit`

---

### DELETE `/api/cleanings/:id`
Takarítás törlése (soft delete opcionális).

**Response:**
```json
{
  "success": true,
  "message": "Takarítás törölve"
}
```

**Permission:** `cleaning.edit`

---

### POST `/api/cleanings/generate-from-bookings`
Takarítások automatikus generálása foglalásokból.

**Request body:**
```json
{
  "apartmentId": "apt_1",        // vagy "all"
  "year": 2026,
  "month": 1,
  "defaultAmount": 15000,
  "skipExisting": true           // ne hozzon létre duplikátumot
}
```

**Response:**
```json
{
  "success": true,
  "created": 8,
  "skipped": 3,
  "data": [ ...newCleanings ]
}
```

**Permission:** `cleaning.edit`

---

### GET `/api/cleanings/summary`
Összesítés a Pénzügy modulhoz (read-only).

**Query params:**
```
apartmentId?: string
year: number
month: number
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalCleanings": 12,
    "totalAmount": 180000,
    "byStatus": {
      "planned": { "count": 3, "amount": 45000 },
      "done": { "count": 5, "amount": 75000 },
      "paid": { "count": 4, "amount": 60000 }
    },
    "byApartment": [
      { "apartmentId": "apt_1", "name": "A57 Downtown", "count": 4, "amount": 60000 }
    ]
  }
}
```

**Permission:** `finance.view` VAGY `cleaning.view`

---

## A3) Frontend Komponensek

### Új komponensek

```
src/components/
├── cleaning/
│   ├── CleaningModule.jsx        # Fő modul wrapper
│   ├── CleaningList.jsx          # Lista nézet táblázattal
│   ├── CleaningFilters.jsx       # Szűrők (lakás, hónap, státusz)
│   ├── CleaningForm.jsx          # Új/szerkesztés modal
│   ├── CleaningStatusBadge.jsx   # Státusz pill (planned/done/paid)
│   ├── CleaningStats.jsx         # Összesítő kártyák
│   └── CleaningGenerateModal.jsx # Foglalásokból generálás
```

### State struktúra

```javascript
// cleaningState
{
  cleanings: [],
  filters: {
    apartmentId: null | string,
    year: 2026,
    month: 1,
    status: null | "planned" | "done" | "paid"
  },
  summary: {
    total: 0,
    planned: 0,
    done: 0,
    paid: 0,
    totalAmount: 0
  },
  isLoading: false,
  editingCleaning: null,    // modal state
  showGenerateModal: false
}
```

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🧹 Takarítás                        [+ Új] [⚡ Generálás]│
├─────────────────────────────────────────────────────────┤
│ [Lakás ▼] [Jan-Dec] [2026 ▼] [Státusz ▼]  🔍 Keresés   │
├─────────────────────────────────────────────────────────┤
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │
│ │ Összes  │ │ Terv.   │ │ Kész    │ │ Kifizetve       │ │
│ │   12    │ │   3     │ │   5     │ │   4             │ │
│ │ 180k Ft │ │ 45k Ft  │ │ 75k Ft  │ │  60k Ft         │ │
│ └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ Dátum     │ Lakás        │ Vendég      │ Összeg │ Státusz│
│───────────┼──────────────┼─────────────┼────────┼────────│
│ 01.20     │ A57 Downtown │ John Smith  │ 15,000 │ 🟡 Terv│
│ 01.22     │ B12 Castle   │ -           │ 12,000 │ 🟢 Kész│
│ 01.25     │ A57 Downtown │ Jane Doe    │ 15,000 │ 🔵 Fiz.│
└─────────────────────────────────────────────────────────┘
```

---

## A4) Pénzügy Integráció

### Elszámolások oldalon

```jsx
// Jelenlegi "Takarítási díjak" szekció módosítása:

// RÉGI: lokális számítás bookings-ból
const cleaningFee = bookings.filter(...).length * defaultFee;

// ÚJ: API hívás a cleanings summary-ból
const { data: cleaningSummary } = await fetch(`/api/cleanings/summary?apartmentId=${apt}&year=${year}&month=${month}`);
const cleaningFee = cleaningSummary.totalAmount;
```

### Read-only megjelenítés
```jsx
<div className="bg-gray-50 p-4 rounded-lg border">
  <h4 className="font-bold text-gray-700 mb-2">🧹 Takarítási díjak</h4>
  <p className="text-2xl font-bold text-teal-600">
    {cleaningSummary.totalAmount.toLocaleString()} Ft
  </p>
  <p className="text-sm text-gray-500">
    {cleaningSummary.totalCleanings} takarítás ({cleaningSummary.byStatus.paid.count} kifizetve)
  </p>
  <button 
    onClick={() => navigate('/management/cleaning')}
    className="text-sm text-blue-600 hover:underline mt-2"
  >
    Részletek megtekintése →
  </button>
</div>
```

---

# B) RBAC JOGOSULTSÁGKEZELÉS

## B1) Adatmodell

### Firestore Collection: `roles`

```javascript
roles/{id}: {
  id: string,
  name: string,                  // "Admin", "Manager", "Housekeeping", etc.
  description: string,
  permissions: string[],         // ["calendar.view", "calendar.edit", ...]
  isSystem: boolean,             // true = nem törölhető
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Default Roles

```javascript
const DEFAULT_ROLES = [
  {
    id: "admin",
    name: "Admin",
    description: "Teljes hozzáférés minden modulhoz",
    permissions: ["*"],  // wildcard = minden
    isSystem: true
  },
  {
    id: "manager",
    name: "Manager",
    description: "Naptár, pénzügy, takarítás, lakások kezelése",
    permissions: [
      "calendar.view", "calendar.edit",
      "finance.view", "finance.edit",
      "cleaning.view", "cleaning.edit",
      "apartments.view", "apartments.edit",
      "partners.view"
    ],
    isSystem: true
  },
  {
    id: "housekeeping",
    name: "Takarító",
    description: "Takarítás modul kezelése",
    permissions: [
      "calendar.view",
      "cleaning.view", "cleaning.edit"
    ],
    isSystem: true
  },
  {
    id: "accountant",
    name: "Könyvelő",
    description: "Pénzügyi adatok megtekintése",
    permissions: [
      "finance.view",
      "cleaning.view",
      "calendar.view"
    ],
    isSystem: true
  },
  {
    id: "readonly",
    name: "Csak olvasás",
    description: "Minden modul megtekintése, szerkesztés nélkül",
    permissions: [
      "calendar.view",
      "finance.view",
      "cleaning.view",
      "apartments.view",
      "projects.view",
      "partners.view",
      "documents.view",
      "warehouse.view"
    ],
    isSystem: true
  }
];
```

### Firestore Collection: `users` (bővítés)

```javascript
users/{id}: {
  ...existingFields,
  
  // ÚJ MEZŐK:
  roleId: string,                // FK → roles (default: "readonly")
  customPermissions: {
    granted: string[],           // extra jogok a role-on felül
    revoked: string[]            // elvett jogok a role-ból
  },
  
  // Computed (denormalizált, gyorsítótár)
  effectivePermissions: string[] // rolePermissions + granted - revoked
}
```

### Permission Keys

```javascript
const PERMISSION_KEYS = {
  // Naptár
  "calendar.view": "Naptár megtekintése",
  "calendar.edit": "Naptár szerkesztése",
  
  // Pénzügy
  "finance.view": "Pénzügy megtekintése",
  "finance.edit": "Pénzügy szerkesztése",
  
  // Takarítás
  "cleaning.view": "Takarítás megtekintése",
  "cleaning.edit": "Takarítás szerkesztése",
  
  // Marketing
  "marketing.view": "Marketing megtekintése",
  "marketing.edit": "Marketing szerkesztése",
  
  // Értékesítés
  "sales.view": "Értékesítés megtekintése",
  "sales.edit": "Értékesítés szerkesztése",
  
  // Lakások
  "apartments.view": "Lakások megtekintése",
  "apartments.edit": "Lakások szerkesztése",
  
  // Projektek
  "projects.view": "Projektek megtekintése",
  "projects.edit": "Projektek szerkesztése",
  
  // Partnerek
  "partners.view": "Partnerek megtekintése",
  "partners.edit": "Partnerek szerkesztése",
  
  // Dokumentumok
  "documents.view": "Dokumentumok megtekintése",
  "documents.edit": "Dokumentumok szerkesztése",
  
  // Raktárak
  "warehouse.view": "Raktárak megtekintése",
  "warehouse.edit": "Raktárak szerkesztése",
  
  // Beállítások
  "settings.view": "Beállítások megtekintése",
  "settings.edit": "Beállítások szerkesztése",
  "settings.users": "Felhasználók kezelése"  // admin only
};
```

---

## B2) API Endpointok

### GET `/api/roles`
Szerepkörök listázása.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "admin",
      "name": "Admin",
      "description": "Teljes hozzáférés",
      "permissions": ["*"],
      "isSystem": true
    }
  ]
}
```

**Permission:** `settings.users`

---

### GET `/api/permissions`
Összes permission kulcs listázása.

**Response:**
```json
{
  "success": true,
  "data": {
    "calendar": {
      "label": "📅 Naptár",
      "permissions": [
        { "key": "calendar.view", "label": "Megtekintés" },
        { "key": "calendar.edit", "label": "Szerkesztés" }
      ]
    },
    "finance": {
      "label": "💰 Pénzügy",
      "permissions": [
        { "key": "finance.view", "label": "Megtekintés" },
        { "key": "finance.edit", "label": "Szerkesztés" }
      ]
    }
    // ... többi modul
  }
}
```

**Permission:** `settings.users`

---

### GET `/api/users/:id/permissions`
Felhasználó effektív jogosultságai.

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "roleId": "manager",
    "roleName": "Manager",
    "rolePermissions": ["calendar.view", "calendar.edit", ...],
    "customPermissions": {
      "granted": ["settings.view"],
      "revoked": ["finance.edit"]
    },
    "effectivePermissions": ["calendar.view", "calendar.edit", "settings.view", ...]
  }
}
```

**Permission:** `settings.users` VAGY saját user

---

### PATCH `/api/users/:id/permissions`
Felhasználó jogosultságainak módosítása.

**Request body:**
```json
{
  "roleId": "manager",           // optional
  "customPermissions": {         // optional
    "granted": ["settings.view"],
    "revoked": ["finance.edit"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { ...updatedUser }
}
```

**Permission:** `settings.users`

---

### GET `/api/me/permissions`
Bejelentkezett felhasználó saját jogosultságai (frontend inicializáláshoz).

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "permissions": ["calendar.view", "finance.view", ...],
    "modules": {
      "calendar": { "view": true, "edit": false },
      "finance": { "view": true, "edit": true },
      "cleaning": { "view": true, "edit": true }
    }
  }
}
```

**Permission:** Bejelentkezett user (nincs extra permission)

---

## B3) Frontend Komponensek

### Permission Context

```jsx
// src/contexts/PermissionContext.jsx

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Bejelentkezéskor betöltés
    loadMyPermissions();
  }, [currentUser]);
  
  const hasPermission = (key) => {
    if (!permissions) return false;
    if (permissions.includes("*")) return true;  // Admin
    return permissions.includes(key);
  };
  
  const canView = (module) => hasPermission(`${module}.view`);
  const canEdit = (module) => hasPermission(`${module}.edit`);
  
  return (
    <PermissionContext.Provider value={{ 
      permissions, 
      hasPermission, 
      canView, 
      canEdit,
      isLoading 
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);
```

### Protected Route

```jsx
// src/components/auth/ProtectedRoute.jsx

const ProtectedRoute = ({ permission, children, fallback }) => {
  const { hasPermission, isLoading } = usePermissions();
  
  if (isLoading) return <LoadingSpinner />;
  
  if (!hasPermission(permission)) {
    return fallback || <AccessDenied />;
  }
  
  return children;
};

// Használat:
<ProtectedRoute permission="cleaning.view">
  <CleaningModule />
</ProtectedRoute>
```

### Menü Szűrés

```jsx
// src/components/navigation/ModuleMenu.jsx

const ModuleMenu = () => {
  const { canView } = usePermissions();
  
  const modules = [
    { key: "calendar", label: "📅 Naptár", path: "/calendar", permission: "calendar" },
    { key: "finance", label: "💰 Pénzügy", path: "/finance", permission: "finance" },
    { key: "cleaning", label: "🧹 Takarítás", path: "/cleaning", permission: "cleaning" },
    { key: "projects", label: "📋 Projektek", path: "/projects", permission: "projects" },
    // ...
  ].filter(m => canView(m.permission));
  
  return (
    <nav>
      {modules.map(m => (
        <NavLink key={m.key} to={m.path}>{m.label}</NavLink>
      ))}
    </nav>
  );
};
```

### User Permission Editor

```jsx
// src/components/settings/UserPermissionEditor.jsx

const UserPermissionEditor = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState({});
  
  return (
    <div className="space-y-6">
      {/* Role választó */}
      <div>
        <label className="font-bold">Szerepkör</label>
        <select 
          value={user.roleId}
          onChange={e => updateRole(e.target.value)}
          className="w-full border rounded p-2"
        >
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
      
      {/* Permission checkboxok modulonként */}
      <div>
        <label className="font-bold">Egyedi jogosultságok</label>
        {Object.entries(allPermissions).map(([module, data]) => (
          <div key={module} className="border rounded p-3 mb-2">
            <h4 className="font-medium mb-2">{data.label}</h4>
            <div className="flex gap-4">
              {data.permissions.map(p => (
                <label key={p.key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={user.effectivePermissions.includes(p.key)}
                    onChange={e => togglePermission(p.key, e.target.checked)}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## B4) Backend Guard (Middleware)

### Firebase Functions Middleware

```javascript
// functions/middleware/checkPermission.js

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.auth?.uid;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      // User permissions betöltése
      const userDoc = await db.collection("users").doc(userId).get();
      const user = userDoc.data();
      
      if (!user) {
        return res.status(403).json({ error: "User not found" });
      }
      
      const permissions = user.effectivePermissions || [];
      
      // Admin bypass
      if (permissions.includes("*")) {
        return next();
      }
      
      // Permission check
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ 
          error: "Access denied",
          required: requiredPermission 
        });
      }
      
      // Attach user to request
      req.user = user;
      req.permissions = permissions;
      
      next();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
};

// Használat:
app.get("/api/cleanings", checkPermission("cleaning.view"), getCleanings);
app.post("/api/cleanings", checkPermission("cleaning.edit"), createCleaning);
```

---

# C) IMPLEMENTÁCIÓS TERV

## C1) Fájl Struktúra

```
smartcrm/
├── functions/
│   ├── api/
│   │   ├── cleanings.js         # Cleaning CRUD
│   │   ├── permissions.js       # Permission API
│   │   └── users.js             # User management
│   ├── middleware/
│   │   └── checkPermission.js   # Auth guard
│   └── index.js
│
├── src/
│   ├── components/
│   │   ├── cleaning/            # Új modul
│   │   │   ├── CleaningModule.jsx
│   │   │   ├── CleaningList.jsx
│   │   │   ├── CleaningForm.jsx
│   │   │   └── ...
│   │   ├── settings/
│   │   │   ├── UserList.jsx
│   │   │   └── UserPermissionEditor.jsx
│   │   └── auth/
│   │       ├── ProtectedRoute.jsx
│   │       └── AccessDenied.jsx
│   ├── contexts/
│   │   └── PermissionContext.jsx
│   └── hooks/
│       └── useCleanings.js
```

---

## C2) Acceptance Criteria

### A) Housekeeping Modul

| # | Kritérium | Státusz |
|---|-----------|---------|
| A1 | 🧹 Takarítás csempe megjelenik a Management menüben Pénzügy után | ⬜ |
| A2 | Takarítás lista: szűrés lakás + hónap + év + státusz | ⬜ |
| A3 | Új takarítás létrehozása modal-ból | ⬜ |
| A4 | Takarítás szerkesztése (összeg, dátum, státusz, jegyzet) | ⬜ |
| A5 | Takarítás törlése megerősítéssel | ⬜ |
| A6 | Státusz váltás: planned → done → paid | ⬜ |
| A7 | "Generálás foglalásokból" funkció | ⬜ |
| A8 | Pénzügy/Elszámolások: takarítási díjak a cleanings-ből jönnek | ⬜ |
| A9 | Pénzügy/Elszámolások: takarítás read-only (link a modulhoz) | ⬜ |
| A10 | Firebase sync működik | ⬜ |

### B) RBAC

| # | Kritérium | Státusz |
|---|-----------|---------|
| B1 | Default role-ok létrejönnek (Admin, Manager, Housekeeping, Accountant, ReadOnly) | ⬜ |
| B2 | Beállítások → Felhasználók lista | ⬜ |
| B3 | User permission editor: role választás + egyedi checkboxok | ⬜ |
| B4 | Menüben csak az engedélyezett modulok látszanak | ⬜ |
| B5 | Direkt URL-ről tiltás, ha nincs permission | ⬜ |
| B6 | Edit gombok/műveletek elrejtése, ha csak view jog van | ⬜ |
| B7 | API endpointok permission-protected | ⬜ |
| B8 | Admin: minden elérhető | ⬜ |
| B9 | Housekeeping role: csak cleaning + calendar view | ⬜ |

---

## C3) Edge Cases

### Housekeeping
- [ ] Foglalás törlése → kapcsolódó cleaning megmarad (orphan kezelés)
- [ ] Dupla takarítás ugyanazon a napon ugyanahhoz a lakáshoz → warning
- [ ] 0 Ft összegű takarítás engedélyezése (pl. saját lakás)
- [ ] Múltbeli takarítás módosítása → audit log

### RBAC
- [ ] Admin törli saját admin jogát → tiltás
- [ ] Utolsó admin törlése → tiltás
- [ ] Role törlése, ami userhez van rendelve → cascade vagy tiltás?
- [ ] User role változtatása aktív session közben → permission újratöltés

---

## C4) Step-by-Step Implementáció

### P0 - Alapverzió (5-7 nap)

**Nap 1-2: Adatmodell + Backend**
1. ✅ Firestore collection létrehozás: `cleanings`, `roles`
2. ✅ Default roles feltöltése
3. ✅ Users collection bővítése (roleId, customPermissions)
4. ✅ checkPermission middleware

**Nap 3-4: Cleaning API + Frontend alap**
5. ✅ GET/POST/PATCH/DELETE /api/cleanings
6. ✅ CleaningModule.jsx alapstruktúra
7. ✅ CleaningList.jsx + CleaningFilters.jsx
8. ✅ CleaningForm.jsx (modal)

**Nap 5: RBAC Frontend**
9. ✅ PermissionContext.jsx
10. ✅ ProtectedRoute.jsx
11. ✅ Menü szűrés permission alapján
12. ✅ GET /api/me/permissions

**Nap 6-7: Integráció + Tesztelés**
13. ✅ Pénzügy/Elszámolások: cleanings summary integrálás
14. ✅ Beállítások → Felhasználók UI
15. ✅ E2E tesztek alapesetek

---

### P1 - Bővítések (3-5 nap)

**Extra funkciók:**
- [ ] "Generálás foglalásokból" modal
- [ ] Bulk státusz váltás (kijelölés + "Mind kifizetett")
- [ ] Export CSV/Excel
- [ ] Takarító hozzárendelés dropdown (users lista)
- [ ] Értesítések: email ha új takarítás van rendelve
- [ ] Audit log: ki mit módosított

### P2 - Nice to have
- [ ] Naptár nézet takarításokhoz
- [ ] Mobilbarát lista swipe-to-action
- [ ] Szerepkör szerkesztő UI (custom roles)
- [ ] Permission öröklődés (hierarchikus)

---

## C5) Tesztesetek

### Unit Tesztek

```javascript
// cleanings.test.js
describe("Cleaning Service", () => {
  test("creates cleaning with valid data");
  test("rejects cleaning without apartmentId");
  test("calculates summary correctly");
  test("filters by status");
  test("links to booking when bookingId provided");
});

// permissions.test.js
describe("Permission Check", () => {
  test("admin has wildcard access");
  test("manager can edit cleaning");
  test("readonly cannot edit cleaning");
  test("custom grant overrides role");
  test("custom revoke removes from role");
});
```

### E2E Tesztek

```javascript
// cleaning-module.e2e.js
describe("Cleaning Module", () => {
  test("create new cleaning from modal");
  test("change status planned → done → paid");
  test("filter by apartment and month");
  test("delete with confirmation");
});

// rbac.e2e.js
describe("RBAC", () => {
  test("housekeeping user sees only cleaning module");
  test("direct URL redirect to access denied");
  test("edit buttons hidden for readonly user");
});
```

---

## Összefoglalás

| Komponens | Fájlok | Becsült idő |
|-----------|--------|-------------|
| Cleaning Backend | 3 fájl | 1-2 nap |
| Cleaning Frontend | 6 komponens | 2-3 nap |
| RBAC Backend | 2 fájl | 1 nap |
| RBAC Frontend | 4 komponens | 2 nap |
| Integráció | - | 1 nap |
| Tesztek | - | 1-2 nap |
| **Összesen** | ~15 fájl | **8-11 nap** |

---

*Generálva: 2026-01-20*
*SmartCRM v2.1 - HNR Smart Invest Kft.*

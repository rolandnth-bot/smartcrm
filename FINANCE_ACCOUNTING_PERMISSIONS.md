# Finance & Accounting - Jogosultsági Modell

## 🔐 Szerepkörök (Roles)

### 1. Finance User (Pénzügyi felhasználó)
**Cél**: Napi pénzügyi műveletek kezelése

**Jogosultságok**:
- ✅ Finance modul teljes hozzáférése
- ✅ Bankszámlák kezelése
- ✅ Forgalmi tételek létrehozása/szerkesztése/törlése
- ✅ Kategóriák kezelése
- ✅ Cashflow dashboard megtekintése
- ❌ Accounting modulhoz nincs hozzáférés

**Permission keys**:
- `finance.view`
- `finance.edit`
- `finance.delete`

---

### 2. Accounting User (Könyvelő)
**Cél**: Jogi könyvelés, számlázás, NAV

**Jogosultságok**:
- ✅ Accounting modul teljes hozzáférése
- ✅ Számlák létrehozása/szerkesztése
- ✅ Díjbekérők kezelése
- ✅ Főkönyv megtekintése
- ✅ ÁFA regiszterek megtekintése
- ✅ Exportok generálása
- ❌ Period locking (csak admin)
- ❌ NAV API konfiguráció (csak admin)
- ❌ Finance modulhoz nincs hozzáférés

**Permission keys**:
- `accounting.view`
- `accounting.edit`
- `accounting.issue`
- `accounting.export`

---

### 3. Accounting Admin (Könyvelés admin)
**Cél**: Teljes könyvelési rendszer adminisztrációja

**Jogosultságok**:
- ✅ Accounting modul teljes hozzáférése
- ✅ Period locking/unlocking
- ✅ NAV API konfiguráció
- ✅ Számlafiókok kezelése
- ✅ Számlatükör szerkesztése
- ✅ Audit log megtekintése
- ✅ Storno és korrekciók
- ❌ Finance modulhoz nincs hozzáférés (kivéve ha van `finance.*` is)

**Permission keys**:
- `accounting.*` (wildcard)
- `accounting.admin`
- `accounting.nav`

---

### 4. Admin (Rendszergazda)
**Cél**: Teljes rendszer adminisztrációja

**Jogosultságok**:
- ✅ Minden modul teljes hozzáférése
- ✅ Finance + Accounting egyaránt
- ✅ Jogosultságok kezelése
- ✅ Minden admin funkció

**Permission keys**:
- `*` (wildcard - minden)

---

## 📋 Permission Key Lista

### Finance Module
```
finance.view          - Finance adatok megtekintése
finance.edit          - Forgalmi tételek, bankszámlák szerkesztése
finance.delete        - Forgalmi tételek törlése (soft delete)
finance.bank-accounts - Bankszámlák kezelése
finance.categories    - Kategóriák kezelése
finance.dashboard     - Cashflow dashboard megtekintése
```

### Accounting Module
```
accounting.view              - Számlák, főkönyv megtekintése
accounting.edit              - Számlák, díjbekérők szerkesztése
accounting.issue             - Számlák kiadása
accounting.pay               - Számlák fizetettként jelölése
accounting.storno            - Storno létrehozása
accounting.correct           - Korrekció létrehozása
accounting.proforma          - Díjbekérők kezelése
accounting.invoicing-accounts - Számlafiókok kezelése
accounting.chart-of-accounts  - Számlatükör szerkesztése
accounting.ledger            - Főkönyv megtekintése
accounting.ledger.post       - Főkönyvi bejegyzés létrehozása
accounting.ledger.lock       - Period locking
accounting.vat               - ÁFA regiszterek megtekintése
accounting.vat.lock          - ÁFA period locking
accounting.nav               - NAV Online Számla használata
accounting.nav.config        - NAV API konfiguráció
accounting.export            - Exportok generálása
accounting.audit             - Audit log megtekintése
accounting.admin             - Teljes admin hozzáférés
```

---

## 🔒 Szabályok (Rules)

### Finance Module
1. **Soft Delete**: Forgalmi tételek törlése soft delete (is_deleted flag)
2. **Edit History**: Módosítások naplózása (opcionális)
3. **No Period Locking**: Finance modulban nincs period locking

### Accounting Module
1. **No Delete**: Számlák, főkönyvi bejegyzések nem törölhetők
2. **Only Correction**: Hibák javítása korrekcióval vagy stornóval
3. **Period Locking**: Lezárt időszakok nem módosíthatók
4. **Full Audit**: Minden változás audit logba kerül
5. **NAV Integration**: NAV API használata külön jogosultság

---

## 👥 Szerepkör → Permission Mapping

### Default Role Permissions

```javascript
const rolePermissions = {
  admin: ['*'], // Minden
  
  finance_user: [
    'finance.view',
    'finance.edit',
    'finance.delete',
    'finance.bank-accounts',
    'finance.categories',
    'finance.dashboard'
  ],
  
  accounting_user: [
    'accounting.view',
    'accounting.edit',
    'accounting.issue',
    'accounting.pay',
    'accounting.proforma',
    'accounting.ledger',
    'accounting.vat',
    'accounting.export'
  ],
  
  accounting_admin: [
    'accounting.*', // Wildcard
    'accounting.admin',
    'accounting.nav',
    'accounting.ledger.lock',
    'accounting.vat.lock',
    'accounting.audit'
  ],
  
  accountant: [
    'accounting.view',
    'accounting.ledger',
    'accounting.vat',
    'accounting.export',
    'accounting.audit'
  ],
  
  manager: [
    'finance.*',
    'accounting.view',
    'accounting.export'
  ]
};
```

---

## 🔐 API Permission Checks

### Finance Endpoints
```php
// Example: POST /api/finance/transactions
if (!hasPermission('finance.edit')) {
    return jsonResponse(['error' => 'Nincs jogosultsága'], 403);
}
```

### Accounting Endpoints
```php
// Example: POST /api/accounting/invoices/:id/issue
if (!hasPermission('accounting.issue')) {
    return jsonResponse(['error' => 'Nincs jogosultsága számla kiadásához'], 403);
}

// Example: POST /api/accounting/ledger-entries/period/:period/lock
if (!hasPermission('accounting.ledger.lock')) {
    return jsonResponse(['error' => 'Nincs jogosultsága period zárolásához'], 403);
}
```

---

## 🎯 Frontend Permission Checks

### React Components

```jsx
const { canEdit: canEditFinance } = usePermissions();

// Finance transaction create
{canEditFinance('finance') && (
  <Button onClick={handleCreateTransaction}>
    Új forgalmi tétel
  </Button>
)}

// Accounting invoice issue
{hasPermission('accounting.issue') && (
  <Button onClick={handleIssueInvoice}>
    Számla kiadása
  </Button>
)}
```

---

## 📝 Megjegyzések

1. **Wildcard permissions**: `finance.*` vagy `accounting.*` = minden permission az adott modulban
2. **Admin wildcard**: `*` = minden permission minden modulban
3. **Permission inheritance**: Ha van `accounting.*`, akkor minden accounting permission megvan
4. **Multiple roles**: Egy felhasználó több szerepkört is kaphat
5. **Permission caching**: Permissions cache-elhetők session-ben vagy JWT-ben

---

## 🔄 Permission Context Update

A meglévő `PermissionContext.jsx`-t bővíteni kell:

```javascript
// Új permission keys hozzáadása
const rolePermissions = {
  // ... existing roles ...
  
  finance_user: [
    'finance.view',
    'finance.edit',
    'finance.delete',
    'finance.bank-accounts',
    'finance.categories',
    'finance.dashboard'
  ],
  
  accounting_user: [
    'accounting.view',
    'accounting.edit',
    'accounting.issue',
    // ...
  ]
};
```

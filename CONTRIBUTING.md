# Közreműködési Útmutató

Köszönjük, hogy részt veszel a SmartCRM projekt fejlesztésében! Ez az útmutató segít megérteni, hogyan lehet hozzájárulni a projekthez.

## 📋 Tartalomjegyzék

- [Kódolási Stílus](#kódolási-stílus)
- [Git Workflow](#git-workflow)
- [Pull Request Folyamat](#pull-request-folyamat)
- [Fejlesztési Környezet](#fejlesztési-környezet)
- [Tesztelés](#tesztelés)
- [Dokumentáció](#dokumentáció)

## 🎨 Kódolási Stílus

### Általános Elvek

- **Konzisztencia**: Kövesd a meglévő kód stílusát
- **Olvashatóság**: Írj tiszta, érthető kódot
- **Kommentek**: Használj JSDoc kommenteket komplex függvényekhez
- **Névadás**: Használj leíró, értelmes változó- és függvényneveket

### React Komponensek

```jsx
// ✅ Jó példa
import { useState, useEffect, useCallback } from 'react';
import useLeadsStore from '../stores/leadsStore';

const LeadsPage = () => {
  const { leads, isLoading } = useLeadsStore();
  // ...
};

// ❌ Kerüld
const LeadsPage = () => {
  const [leads, setLeads] = useState([]);
  // ...
};
```

### Fájl Struktúra

```
src/
├── components/     # Újrafelhasználható komponensek
├── pages/          # Oldal komponensek
├── stores/         # Zustand store-ok
├── services/       # API és külső szolgáltatások
├── utils/          # Segédfüggvények
└── hooks/          # Custom React hook-ok
```

### Névadás Konvenciók

- **Komponensek**: PascalCase (`LeadsPage.jsx`)
- **Fájlok**: camelCase vagy PascalCase (komponenseknél)
- **Függvények**: camelCase (`fetchFromApi`)
- **Konstansok**: UPPER_SNAKE_CASE (`MAX_FILE_SIZE`)
- **Store-ok**: camelCase + "Store" (`leadsStore.js`)

## 🔀 Git Workflow

### Branch Stratégia

- `main` - Production-ready kód
- `develop` - Fejlesztési branch
- `feature/feature-name` - Új funkciók
- `fix/bug-name` - Hibajavítások
- `refactor/component-name` - Refaktorálások

### Commit Üzenetek

Használj konvencionális commit üzeneteket:

```
feat: új funkció hozzáadása
fix: hibajavítás
docs: dokumentáció változás
style: formázás (nem változtat funkcionalitást)
refactor: kód refaktorálás
test: tesztek hozzáadása
chore: build folyamat, tooling változások
```

Példák:
```
feat(leads): hozzáadás export funkció CSV-hez
fix(api): retry mechanizmus javítása timeout hibákhoz
docs(readme): deployment útmutató frissítése
```

## 🔄 Pull Request Folyamat

### PR Létrehozása

1. **Fork** a repository-t (ha külső közreműködő vagy)
2. **Branch** létrehozása: `git checkout -b feature/amazing-feature`
3. **Változtatások** commit-olása
4. **Push** a branch-re: `git push origin feature/amazing-feature`
5. **Pull Request** nyitása

### PR Leírás

Minden PR-nek tartalmaznia kell:

- **Cél**: Mit old meg vagy ad hozzá?
- **Változtatások**: Részletes leírás
- **Tesztelés**: Hogyan tesztelted?
- **Képernyőképek**: Ha UI változások vannak
- **Breaking Changes**: Ha vannak, jelezd!

### PR Review

- Minimum 1 approve szükséges
- CI/CD teszteknek át kell menniük
- Nincs merge conflict
- Kód követi a stílus útmutatót

## 🛠️ Fejlesztési Környezet

### Előfeltételek

```bash
# Node.js 18+
node --version

# npm vagy yarn
npm --version
```

### Telepítés

```bash
# Repository klónozása
git clone https://github.com/your-org/smartcrm.git
cd smartcrm

# Függőségek telepítése
npm install

# Development szerver indítása
npm run dev
```

### Environment Változók

Hozz létre egy `.env` fájlt:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your-key
# ... további változók
```

Lásd: `.env.example`

## 🧪 Tesztelés

### Manuális Tesztelés

Minden új funkcióhoz:

1. **Happy Path**: Alapvető használati eset
2. **Edge Cases**: Szélsőséges bemenetek
3. **Error Handling**: Hibaüzenetek ellenőrzése
4. **Responsive**: Mobil és desktop nézet
5. **Accessibility**: Keyboard navigation, screen reader

### Automatizált Tesztek

```bash
# Unit tesztek (ha vannak)
npm test

# E2E tesztek (ha vannak)
npm run test:e2e
```

## 📝 Dokumentáció

### Kód Dokumentáció

Használj JSDoc kommenteket:

```javascript
/**
 * Lead létrehozása API-n keresztül
 * @param {Object} lead - Lead adatok
 * @param {string} lead.name - Lead neve
 * @param {string} lead.email - Email cím
 * @returns {Promise<Object>} Létrehozott lead
 * @throws {Error} Ha a lead létrehozása sikertelen
 */
export async function createLead(lead) {
  // ...
}
```

### README Frissítés

Ha új funkciót adsz hozzá:

1. Frissítsd a `README.md`-t
2. Adj példákat
3. Dokumentáld a konfigurációt

### CHANGELOG

Minden jelentős változást dokumentálj a `CHANGELOG.md`-ben:

```markdown
## [1.5.0] - 2026-01-24

### Hozzáadva
- Új export funkció CSV-hez
```

## 🐛 Hibajelentés

### Bug Report Létrehozása

Minden bug report tartalmazza:

- **Leírás**: Mi a probléma?
- **Lépések**: Hogyan reprodukálható?
- **Várt viselkedés**: Mit kellene látni?
- **Tényleges viselkedés**: Mit látsz?
- **Környezet**: Böngésző, OS, verzió
- **Képernyőképek**: Ha releváns

### Feature Request

- **Probléma**: Mit szeretnél megoldani?
- **Megoldás**: Hogyan képzeled el?
- **Alternatívák**: Más lehetőségek?
- **Kiegészítő információk**: További kontextus

## 🔒 Biztonság

### Biztonsági Jelentés

Ha biztonsági sebezhetőséget találsz:

1. **NE** nyiss publikus issue-t
2. Email: security@smartcrm.hu
3. Várj választ a jelentés után

### Biztonsági Elvek

- **Soha ne** commit-olj érzékeny adatokat (jelszavak, API kulcsok)
- **Használj** environment változókat
- **Validáld** minden felhasználói bemenetet
- **Sanitizálj** adatokat XSS védelemhez

## 📚 További Források

- [React Dokumentáció](https://react.dev)
- [Vite Dokumentáció](https://vitejs.dev)
- [Zustand Dokumentáció](https://zustand-demo.pmnd.rs)
- [Tailwind CSS Dokumentáció](https://tailwindcss.com)

## ❓ Kérdések?

Ha bármilyen kérdésed van:

1. Nézd meg a meglévő dokumentációt
2. Keress hasonló issue-kat
3. Nyiss egy új issue-t
4. Vagy írj emailt: dev@smartcrm.hu

---

**Köszönjük a közreműködésedet!** 🎉


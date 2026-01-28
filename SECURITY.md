# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Known Security Issues

### Development Dependencies

Az alkalmazás fejlesztési függőségeiben vannak ismert biztonsági problémák, amelyek **csak development módban** érintik az alkalmazást:

#### esbuild (moderate)
- **Verzió**: <=0.24.2
- **Probléma**: A development server bármely weboldalról küldhet kéréseket és olvashatja a válaszokat
- **Hatás**: Csak development módban érinti, production build nem érintett
- **Javasolt megoldás**: `npm audit fix --force` (breaking changes lehetnek)
- **Prioritás**: Alacsony (csak dev környezetben)

#### undici (moderate)
- **Verzió**: <=6.22.0
- **Problémák**:
  - Insufficiently Random Values
  - Denial of Service attack via bad certificate data
  - Unbounded decompression chain in HTTP responses
- **Hatás**: Csak development módban érinti, production build nem érintett
- **Javasolt megoldás**: `npm audit fix`
- **Prioritás**: Alacsony (csak dev környezetben)

### Production Build

A production build (`npm run build`) **nem érintett** ezekkel a biztonsági problémákkal, mert:
- A production build nem tartalmazza a development függőségeket
- A production bundle csak a szükséges kódot tartalmazza
- A production build statikus fájlokat generál, nincs development server

## Security Best Practices

### Environment Variables
- Soha ne commitolj `.env` fájlokat
- Használd a `.env.example` fájlt sablonként
- Ne oszd meg az API kulcsokat és jelszavakat

### API Keys
- Firebase API kulcsok: Csak a szükséges engedélyekkel
- Backend API: Token alapú autentikáció használata
- Email service: API kulcsok biztonságos tárolása

### Authentication
- Firebase Authentication: Jelszó alapú bejelentkezés
- Backend API: Session-based authentication
- Token kezelés: Biztonságos storage használata

### Input Validation
- Minden user input validálva van
- XSS védelem: React automatikusan kezeli
- SQL Injection: Nincs közvetlen SQL, csak API hívások

### Error Handling
- Ne mutass részletes hibákat a production-ben
- Error Boundary kezeli a React hibákat
- Toast üzenetek user-friendly hibaüzeneteket mutatnak

## Reporting a Vulnerability

Ha biztonsági problémát találsz:

1. **Ne nyiss publikus issue-t** a GitHub-on
2. Küldj emailt a biztonsági csapatnak
3. Várd meg a választ mielőtt publikálod

## Security Updates

A biztonsági frissítéseket rendszeresen ellenőrizzük:
- `npm audit` futtatása rendszeresen
- Függőségek frissítése amikor szükséges
- Security advisories követése

## Production Deployment

Production deployment előtt:
- [ ] `npm audit` futtatása
- [ ] Environment változók ellenőrzése
- [ ] API kulcsok ellenőrzése
- [ ] Firebase konfiguráció ellenőrzése
- [ ] Build tesztelése (`npm run build`)
- [ ] Preview tesztelése (`npm run preview`)

---

**Utolsó frissítés**: 2026-01-20  
**Verzió**: 1.0.0



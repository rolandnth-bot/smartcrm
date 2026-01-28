# SmartCRM - Deployment Útmutató

## Előfeltételek

- Node.js 18+ és npm
- PHP 8.1+ (backend API-hoz)
- MySQL 5.7+ / MariaDB 10.3+ (backend adatbázishoz)
- Web szerver (Apache/Nginx)

## Build és Deployment

### 1. Frontend Build

```bash
# Függőségek telepítése
npm install

# Production build
npm run build

# Build kimenet: dist/ mappa
```

### 2. Backend API Telepítés

Lásd: `smartcrm-cpanel/README.md`

### 3. Frontend Telepítés

#### Opció A: Statikus fájlok (Apache/Nginx)

1. Másold a `dist/` mappa tartalmát a web szerver root könyvtárába
2. Állítsd be az URL rewrite szabályokat (SPA routing támogatás)

**Apache (.htaccess):**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Nginx:**
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

#### Opció B: CDN/Static Hosting (Vercel, Netlify, Cloudflare Pages)

1. Csatlakoztasd a Git repository-t
2. Build command: `npm run build`
3. Output directory: `dist`
4. Environment változók beállítása (lásd `.env.example`)

### 4. Environment Változók

Hozz létre egy `.env.production` fájlt a production környezethez:

```env
# API Backend URL
VITE_API_BASE_URL=https://smartcrm.hu/api

# Firebase (opcionális)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Email Service (opcionális)
VITE_SENDGRID_API_KEY=your-sendgrid-key
VITE_RESEND_API_KEY=your-resend-key
VITE_EMAIL_FROM=noreply@smartcrm.hu
VITE_RACKHOST_SMTP_USER=registration@rackhost.hu
VITE_RACKHOST_SMTP_PASS=your-password
```

### 5. Service Worker (PWA)

A service worker automatikusan regisztrálódik production build-ben.

**Ellenőrzés:**
- `dist/sw.js` létezik
- `dist/manifest.json` létezik
- HTTPS kapcsolat (service worker csak HTTPS-en működik)

### 6. CORS Beállítások

Győződj meg róla, hogy a backend API CORS beállításai megfelelőek:

```php
// smartcrm-cpanel/config/config.php
header('Access-Control-Allow-Origin: https://smartcrm.hu');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
```

### 7. Cache Stratégia

**Statikus assetek:**
- Cache-Control: `public, max-age=31536000, immutable`
- Hash-elt fájlnevek (automatikus Vite-ben)

**HTML:**
- Cache-Control: `no-cache` vagy `max-age=0`
- Mindig friss HTML-t szolgálj ki (SPA routing miatt)

**API válaszok:**
- Cache-Control: `no-cache` (dinamikus adatok)

### 8. Monitoring és Logging

**Frontend:**
- Console logok csak development módban
- Error Boundary naplózás
- Performance monitoring (development módban)

**Backend:**
- PHP error log
- API request/response logolás
- SMTP email logolás

### 9. SSL/HTTPS

**Kötelező:**
- Service Worker csak HTTPS-en működik
- PWA funkciókhoz HTTPS szükséges
- API hívásokhoz ajánlott HTTPS

### 10. Verziókezelés

**Build verzió követés:**
```bash
# package.json verzió frissítése
npm version patch|minor|major

# Build timestamp hozzáadása
echo "BUILD_DATE=$(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .env.production
```

## Rollback Stratégia

1. **Statikus fájlok:**
   - Tartsd meg az előző `dist/` build-et
   - Visszaállítás: régi `dist/` mappa visszaállítása

2. **Git-based deployment:**
   - Visszaállás előző commit-ra
   - `git revert` vagy `git reset`

## Performance Optimalizációk

1. **Code Splitting:**
   - Lazy loading (React.lazy) ✅
   - Route-based code splitting ✅

2. **Asset Optimalizáció:**
   - Minification (Vite automatikus) ✅
   - Gzip/Brotli compression (szerver szinten)

3. **Caching:**
   - Service Worker cache ✅
   - Browser cache headers

4. **API Optimalizáció:**
   - Retry mechanizmus ✅
   - Request deduplication
   - Response caching (ahol lehetséges)

## Troubleshooting

### Service Worker nem működik
- Ellenőrizd, hogy HTTPS-en fut-e
- Ellenőrizd a böngésző console-t (service worker regisztráció)
- Töröld a cache-t és próbáld újra

### API hívások nem működnek
- Ellenőrizd a CORS beállításokat
- Ellenőrizd a `VITE_API_BASE_URL` értékét
- Ellenőrizd a hálózati kéréseket (DevTools Network tab)

### Build hibák
- Töröld a `node_modules/` és `dist/` mappákat
- Futtasd újra: `npm install && npm run build`

## További Dokumentáció

- [README.md](./README.md) - Projekt áttekintés
- [smartcrm-cpanel/README.md](./smartcrm-cpanel/README.md) - Backend telepítés
- [.env.example](./.env.example) - Environment változók példa


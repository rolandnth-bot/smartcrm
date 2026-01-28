# SmartCRM - Deployment Checklist

**Verzió**: 1.1.0  
**Dátum**: 2026-01-23

---

## 📋 Pre-Deployment Checklist

### Előfeltételek

- [ ] Node.js 18+ telepítve
- [ ] npm vagy yarn telepítve
- [ ] Git repository klónozva vagy fájlok letöltve
- [ ] Backend API elérhető (ha használod)
- [ ] Firebase projekt létrehozva (ha használod)
- [ ] Web szerver konfigurálva (Apache/Nginx)

---

## 🔧 Konfiguráció

### Environment Változók

- [ ] `.env` fájl létrehozva `.env.example` alapján
- [ ] `VITE_API_BASE_URL` beállítva (ha van backend API)
- [ ] Firebase konfiguráció beállítva (ha használod)
  - [ ] `VITE_FIREBASE_API_KEY`
  - [ ] `VITE_FIREBASE_AUTH_DOMAIN`
  - [ ] `VITE_FIREBASE_PROJECT_ID`
  - [ ] `VITE_FIREBASE_STORAGE_BUCKET`
  - [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `VITE_FIREBASE_APP_ID`
- [ ] Email service konfiguráció (opcionális)
  - [ ] `VITE_SENDGRID_API_KEY` vagy `VITE_RESEND_API_KEY`
  - [ ] `VITE_EMAIL_FROM`

### Backend API (ha használod)

- [ ] Backend API telepítve
- [ ] Adatbázis létrehozva és importálva
- [ ] `config/config.php` beállítva
- [ ] CORS beállítások konfigurálva
- [ ] API endpoint-ok tesztelve

---

## 🏗️ Build

### Frontend Build

- [ ] Függőségek telepítve: `npm install`
- [ ] Production build sikeres: `npm run build`
- [ ] Build kimenet ellenőrizve: `dist/` mappa létezik
- [ ] Build méret ellenőrizve (~473 kB main bundle)
- [ ] Nincs build hiba vagy figyelmeztetés

### Build Ellenőrzés

- [ ] `dist/index.html` létezik
- [ ] `dist/assets/` mappa létezik
- [ ] `dist/manifest.json` létezik (PWA)
- [ ] `dist/sw.js` létezik (Service Worker)

---

## 📤 Deployment

### Statikus Fájlok (Apache/Nginx)

- [ ] `dist/` mappa tartalma feltöltve a web szerverre
- [ ] `.htaccess` vagy Nginx konfiguráció beállítva (SPA routing)
- [ ] URL rewrite szabályok működnek
- [ ] Statikus assetek elérhetők

### CDN/Static Hosting (Vercel, Netlify, Cloudflare Pages)

- [ ] Git repository csatlakoztatva
- [ ] Build command beállítva: `npm run build`
- [ ] Output directory beállítva: `dist`
- [ ] Environment változók beállítva
- [ ] Deployment sikeres

---

## 🔒 Biztonság

### SSL/HTTPS

- [ ] SSL tanúsítvány telepítve
- [ ] HTTPS működik
- [ ] HTTP → HTTPS redirect beállítva
- [ ] Service Worker működik (HTTPS szükséges)

### Security Headers

- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: SAMEORIGIN`
- [ ] `X-XSS-Protection: 1; mode=block`
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`

### CORS

- [ ] CORS beállítások konfigurálva (backend API)
- [ ] Csak engedélyezett origin-ek
- [ ] Preflight (OPTIONS) kérések kezelve

---

## 🧪 Tesztelés

### Funkcionális Tesztek

- [ ] Főoldal betöltődik
- [ ] Bejelentkezés működik
- [ ] Dashboard statisztikák megjelennek
- [ ] CRUD műveletek működnek (Leads, Apartments, Bookings, stb.)
- [ ] Export funkciók működnek (CSV, Excel, PDF)
- [ ] Szűrés és keresés működik
- [ ] Naptár nézet működik
- [ ] Modal ablakok működnek
- [ ] Toast értesítések megjelennek

### Performance Tesztek

- [ ] Oldal betöltési idő < 3 másodperc
- [ ] Bundle méret ellenőrizve (~473 kB)
- [ ] Code splitting működik
- [ ] Lazy loading működik

### Accessibility Tesztek

- [ ] Keyboard navigation működik
- [ ] Screen reader kompatibilis
- [ ] ARIA attribútumok jelen vannak
- [ ] Focus management működik

### Cross-Browser Tesztek

- [ ] Chrome/Edge működik
- [ ] Firefox működik
- [ ] Safari működik
- [ ] Mobile böngészők működnek

---

## 📊 Monitoring

### Error Tracking

- [ ] Error Boundary működik
- [ ] Console hibák ellenőrizve (production módban nincs debug log)
- [ ] API hibák kezelve

### Performance Monitoring

- [ ] Build méret dokumentálva
- [ ] Load time mérve
- [ ] Bundle analyzer futtatva (opcionális)

---

## 📝 Dokumentáció

### Dokumentáció Frissítve

- [ ] README.md naprakész
- [ ] CHANGELOG.md frissítve
- [ ] DEPLOYMENT.md naprakész
- [ ] Environment változók dokumentálva

### Verziókezelés

- [ ] `package.json` verzió frissítve
- [ ] Git tag létrehozva (opcionális)
- [ ] Release notes készítve (opcionális)

---

## 🔄 Rollback Terv

### Rollback Stratégia

- [ ] Előző build mentve
- [ ] Rollback folyamat dokumentálva
- [ ] Rollback tesztelve (opcionális)

---

## ✅ Post-Deployment

### Ellenőrzés

- [ ] Alkalmazás elérhető production URL-en
- [ ] Minden funkció működik
- [ ] Nincs console hiba
- [ ] API hívások működnek
- [ ] Export funkciók működnek
- [ ] Service Worker regisztrálva (ha PWA)

### Monitoring

- [ ] Error tracking beállítva (opcionális)
- [ ] Analytics beállítva (opcionális)
- [ ] Performance monitoring beállítva (opcionális)

---

## 🎉 Deployment Kész!

Ha minden pont be van jelölve, az alkalmazás készen áll a production használatra!

---

## 📚 További Dokumentáció

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Részletes deployment útmutató
- [QUICK_START.md](./QUICK_START.md) - Gyors kezdés útmutató
- [README.md](./README.md) - Teljes projekt dokumentáció

---

**Utolsó frissítés**: 2026-01-23  
**Verzió**: 1.1.0

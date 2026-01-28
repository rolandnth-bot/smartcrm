# GitHub-ra Feltöltés - Utasítások

A projekt git repository-ként elő van készítve. Kövesd az alábbi lépéseket a GitHub-ra való feltöltéshez:

---

## 1. GitHub Repository Létrehozása

1. Menj a **GitHub.com**-ra és jelentkezz be
2. Kattints a **"+"** gombra (jobb felső sarok) → **"New repository"**
3. Töltsd ki:
   - **Repository name**: `SmartCRM` (vagy amit szeretnél)
   - **Description**: "Vállalatirányítási Rendszer - Ingatlan kezelés, foglalások, ügyfélkapcsolat-kezelés"
   - **Visibility**: 
     - ✅ **Public** (nyilvános) - ha nyílt forráskódú
     - ✅ **Private** (privát) - ha csak neked látható
   - **NE** jelöld be az "Initialize with README" opciót (már van README)
4. Kattints a **"Create repository"** gombra

---

## 2. Lokális Repository Csatlakoztatása

A GitHub létrehozása után megjelenik egy oldal utasításokkal. Használd ezeket a parancsokat:

```bash
cd /Users/roli/Desktop/SmartCRM

# GitHub repository URL-t add hozzá (cseréld ki a <USERNAME>-t a GitHub felhasználónevedre)
git remote add origin https://github.com/<USERNAME>/SmartCRM.git

# Vagy SSH-vel (ha be van állítva):
# git remote add origin git@github.com:<USERNAME>/SmartCRM.git

# Ellenőrzés:
git remote -v
```

---

## 3. Feltöltés GitHub-ra

```bash
# Main branch-re váltás (ha még nem ott vagy)
git branch -M main

# Feltöltés
git push -u origin main
```

**Első push esetén** a GitHub kérni fogja a hitelesítést:
- **Personal Access Token** (ha HTTPS-t használsz)
- Vagy **SSH kulcs** (ha SSH-t használsz)

---

## 4. Personal Access Token Létrehozása (ha szükséges)

Ha HTTPS-t használsz és kér a token:

1. GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. **"Generate new token"** → **"Generate new token (classic)"**
3. Adj neki nevet (pl. "SmartCRM Upload")
4. Válaszd ki a jogosultságokat:
   - ✅ **repo** (teljes repository hozzáférés)
5. **"Generate token"**
6. **Másold ki a tokent** (csak egyszer látható!)
7. A `git push` parancs során használd ezt a tokent jelszóként

---

## 5. Ellenőrzés

A feltöltés után frissítsd a GitHub repository oldalt. Láthatod:
- ✅ Összes fájl
- ✅ README.md
- ✅ Commit history
- ✅ Projekt struktúra

---

## 6. További Push-ok (jövőbeli változtatások)

Ha később módosítasz fájlokat:

```bash
# Változtatások hozzáadása
git add .

# Commit
git commit -m "Rövid leírás a változtatásokról"

# Feltöltés
git push
```

---

## ⚠️ Fontos Megjegyzések

- **`.env` fájlok NEM kerülnek fel** (a `.gitignore` kizárja őket)
- **`node_modules/` NEM kerül fel** (telepítés után `npm install` szükséges)
- **`dist/` build mappa NEM kerül fel** (build után `npm run build` szükséges)

---

## 🆘 Segítség

Ha problémába ütközöl:

1. **"Repository not found"**: Ellenőrizd a repository URL-t és a jogosultságokat
2. **"Authentication failed"**: Használj Personal Access Token-t vagy SSH kulcsot
3. **"Permission denied"**: Ellenőrizd, hogy a repository neve és a remote URL helyes-e

---

**Kész!** 🎉 A projekt most már GitHub-on van.

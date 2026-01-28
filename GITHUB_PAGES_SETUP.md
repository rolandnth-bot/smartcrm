# GitHub Pages Beállítás - Gyors Útmutató

## 1. GitHub Pages Aktiválása

1. Menj a repository beállításokhoz:
   - **URL:** https://github.com/rolandnth-bot/smartcrm/settings/pages
   - Vagy: Repository → **Settings** → **Pages** (bal oldali menü)

2. **Source** beállítása:
   - Válaszd: **"GitHub Actions"**
   - Ne válaszd a "Deploy from a branch" opciót!

3. **Save** gombra kattintás

4. Várj 1-2 percet, amíg a GitHub Actions újra lefut

## 2. Webapp Elérése

Miután a deployment sikeres, a webapp elérhető lesz:
- **URL:** https://rolandnth-bot.github.io/smartcrm/

## 3. Ha nem működik

Ha a GitHub Pages nem működik, használhatod a **Vercel**-t (ingyenes, gyorsabb):

1. Menj: https://vercel.com
2. **Sign in with GitHub**
3. **New Project** → Import `rolandnth-bot/smartcrm`
4. **Deploy** (automatikusan felismeri a Vite projektet)
5. Kész! 1-2 perc alatt elérhető lesz egy URL-en

## 4. Ellenőrzés

A GitHub Actions workflow állapota:
- https://github.com/rolandnth-bot/smartcrm/actions

Ha sikertelen, nézd meg a hibaüzeneteket a workflow futtatásban.

#!/usr/bin/env bash
# SmartCRM verzió mentése külön mappába (pl. 1.0 → SmartCRM-1.0)
# Használat: ./scripts/save-version.sh 1.0
#           ./scripts/save-version.sh 1.0 /path/to/szülő/mappa
#           ./scripts/save-version.sh -f 1.0   (felülírás kérdezése nélkül)

set -e

FORCE=""
if [[ "$1" == "-f" || "$1" == "--force" ]]; then
  FORCE=1
  shift
fi

VERSION="${1:-}"
DEST_PARENT="${2:-$(dirname "$(dirname "$(realpath "$0")")")}"
PROJECT_NAME="SmartCRM"
DEST_DIR="${DEST_PARENT}/${PROJECT_NAME}-${VERSION}"
SRC_ROOT="$(dirname "$(dirname "$(realpath "$0")")")"

if [[ -z "$VERSION" ]]; then
  echo "Használat: $0 [-f] <verzió> [cél mappa]"
  echo "  Pl.: $0 1.0"
  echo "  Pl.: $0 1.0 ~/Projektek"
  echo "  Pl.: $0 -f 1.0   (létező mappa felülírása)"
  exit 1
fi

echo "Verzió: ${VERSION}"
echo "Forrás: ${SRC_ROOT}"
echo "Cél:   ${DEST_DIR}"
echo ""

if [[ -d "$DEST_DIR" ]]; then
  if [[ -z "$FORCE" ]] && [[ -t 0 ]]; then
    read -p "A mappa már létezik: ${DEST_DIR}. Felülírjuk? (i/n) " -r
    if [[ ! $REPLY =~ ^[iIyY]$ ]]; then
      echo "Megszakítva."
      exit 1
    fi
  fi
  rm -rf "$DEST_DIR"
fi

mkdir -p "$DEST_DIR"

# Másolás, kihagyva: node_modules, dist, .git, .env, cache, stb.
rsync -a -v \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='.env.*' \
  --exclude='.cache' \
  --exclude='coverage' \
  --exclude='.vite' \
  --exclude='.cursor' \
  --exclude='*.local' \
  --exclude='.DS_Store' \
  --exclude='*.tgz' \
  "${SRC_ROOT}/" "${DEST_DIR}/"

# Verzió feljegyzése (date portable: macOS + Linux)
SAVED_AT=$(date '+%Y-%m-%d %H:%M:%S')
echo "${VERSION}" > "${DEST_DIR}/VERSION.txt"
echo "Mentve: ${SAVED_AT}" >> "${DEST_DIR}/VERSION.txt"

# package.json verzió frissítése a másolatban (opcionális)
if command -v node &>/dev/null; then
  VERSION="$VERSION" DEST_DIR="$DEST_DIR" node -e '
    const fs = require("fs");
    const p = JSON.parse(fs.readFileSync(process.env.DEST_DIR + "/package.json", "utf8"));
    p.version = process.env.VERSION;
    fs.writeFileSync(process.env.DEST_DIR + "/package.json", JSON.stringify(p, null, 2) + "\n");
  ' 2>/dev/null || true
fi

echo ""
echo "✓ Kész: ${DEST_DIR}"
echo ""
echo "Következő lépések a másolatban:"
echo "  cd ${DEST_DIR}"
echo "  npm install"
echo "  npm run build"
echo ""

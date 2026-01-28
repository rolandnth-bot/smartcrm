#!/bin/bash
# Email teszt automatikus indítás

cd "$(dirname "$0")/smartcrm-cpanel"

echo "🔍 PHP keresése..."
PHP_CMD=""

# Próbáljuk meg a különböző lehetséges PHP útvonalakat
if command -v php &> /dev/null; then
    PHP_CMD="php"
elif [ -f "/usr/bin/php" ]; then
    PHP_CMD="/usr/bin/php"
elif [ -f "/usr/local/bin/php" ]; then
    PHP_CMD="/usr/local/bin/php"
elif [ -f "/opt/homebrew/bin/php" ]; then
    PHP_CMD="/opt/homebrew/bin/php"
else
    echo "❌ PHP nem található!"
    echo ""
    echo "Telepítsd a PHP-t:"
    echo "  brew install php"
    echo ""
    echo "Vagy használd a MAMP/XAMPP PHP-jét:"
    echo "  /Applications/MAMP/bin/php/php8.x.x/bin/php -S localhost:8080"
    exit 1
fi

echo "✅ PHP található: $PHP_CMD"
echo "🚀 PHP szerver indítása..."
echo "📍 Könyvtár: $(pwd)"
echo "🌐 URL: http://localhost:8080"
echo ""
echo "📧 Email teszt oldal:"
echo "   http://localhost:8080/test-email.php"
echo ""
echo "⏹️  A szerver leállításához nyomj Ctrl+C-t"
echo ""
echo "⏳ Szerver indítása 2 másodperc múlva..."
sleep 2

# Szerver indítása háttérben
$PHP_CMD -S localhost:8080 > /tmp/smartcrm-php-server.log 2>&1 &
SERVER_PID=$!

echo "✅ Szerver elindítva (PID: $SERVER_PID)"
echo ""

# Várunk egy kicsit, hogy a szerver elinduljon
sleep 1

# Böngésző megnyitása (ha macOS)
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🌐 Böngésző megnyitása..."
    open "http://localhost:8080/test-email.php" 2>/dev/null || echo "Nyisd meg manuálisan: http://localhost:8080/test-email.php"
fi

echo ""
echo "📋 Log fájl: /tmp/smartcrm-php-server.log"
echo ""
echo "A szerver leállításához: kill $SERVER_PID"
echo ""

# Várunk, amíg a felhasználó nem nyom Ctrl+C-t
trap "kill $SERVER_PID 2>/dev/null; exit" INT TERM
wait $SERVER_PID



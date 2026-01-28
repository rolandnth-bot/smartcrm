#!/bin/bash
# PHP szerver indítása a SmartCRM backend-hez

cd "$(dirname "$0")/smartcrm-cpanel"

# PHP keresése
PHP_CMD=""
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
    echo "Vagy használd a MAMP/XAMPP PHP-ját"
    exit 1
fi

echo "✅ PHP található: $PHP_CMD"
echo "🚀 PHP szerver indítása..."
echo "📍 Könyvtár: $(pwd)"
echo "🌐 URL: http://localhost:8080"
echo "📧 Email teszt: http://localhost:8080/test-email.php"
echo ""
echo "⏹️  A szerver leállításához nyomj Ctrl+C-t"
echo ""

# Szerver indítása
$PHP_CMD -S localhost:8080


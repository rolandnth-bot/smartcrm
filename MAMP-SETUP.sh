#!/bin/bash
# MAMP automatikus beállítás script

echo "🔧 MAMP automatikus beállítás"
echo ""

# Ellenőrizzük, hogy a MAMP telepítve van-e
if [ ! -d "/Applications/MAMP" ]; then
    echo "❌ MAMP nem található!"
    echo ""
    echo "Töltsd le és telepítsd a MAMP-ot:"
    echo "https://www.mamp.info/en/downloads/"
    echo ""
    exit 1
fi

echo "✅ MAMP található!"
echo ""

# Fájlok másolása
echo "📁 Fájlok másolása a MAMP htdocs mappába..."
cp -r ~/Desktop/SmartCRM/smartcrm-cpanel /Applications/MAMP/htdocs/ 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Fájlok másolva!"
    echo ""
    echo "🌐 Most nyisd meg a böngészőben:"
    echo "   http://localhost:8888/smartcrm-cpanel/test-email.php"
    echo ""
    echo "💡 Ne felejtsd el elindítani a MAMP szervert!"
    echo "   (Nyisd meg a MAMP alkalmazást és kattints 'Start Servers')"
    echo ""
    
    # Böngésző megnyitása (ha macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2
        open "http://localhost:8888/smartcrm-cpanel/test-email.php" 2>/dev/null
    fi
else
    echo "❌ Hiba a fájlok másolásakor!"
    echo "Próbáld meg manuálisan:"
    echo "cp -r ~/Desktop/SmartCRM/smartcrm-cpanel /Applications/MAMP/htdocs/"
fi



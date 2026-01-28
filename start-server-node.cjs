#!/usr/bin/env node
/**
 * Node.js szerver indítás az email teszteléshez
 * Használat: node start-server-node.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const PORT = 8080;
const BASE_DIR = path.join(__dirname, 'smartcrm-cpanel');

console.log('🚀 SmartCRM Email Teszt Szerver');
console.log('📍 Könyvtár:', BASE_DIR);
console.log('🌐 URL: http://localhost:' + PORT);
console.log('📧 Email teszt: http://localhost:' + PORT + '/test-email.php');
console.log('');

// Próbáljuk meg a PHP-t indítani
const phpPaths = [
    'php',
    '/usr/bin/php',
    '/usr/local/bin/php',
    '/opt/homebrew/bin/php',
    '/Applications/MAMP/bin/php/php8.2.0/bin/php',
    '/Applications/MAMP/bin/php/php8.1.0/bin/php',
    '/Applications/XAMPP/xamppfiles/bin/php'
];

async function findPhp() {
    for (const phpPath of phpPaths) {
        try {
            const { stdout } = await execAsync(`${phpPath} -v 2>&1`);
            if (stdout.includes('PHP')) {
                return phpPath;
            }
        } catch (e) {
            // Következő próbálkozás
        }
    }
    return null;
}

async function main() {
    console.log('🔍 PHP keresése...');
    const phpPath = await findPhp();
    
    if (!phpPath) {
        console.log('❌ PHP nem található!');
        console.log('');
        console.log('📦 Telepítési lehetőségek:');
        console.log('');
        console.log('1. MAMP (AJÁNLOTT - legkönnyebb):');
        console.log('   https://www.mamp.info/en/downloads/');
        console.log('');
        console.log('2. Homebrew + PHP:');
        console.log('   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"');
        console.log('   brew install php');
        console.log('');
        console.log('3. XAMPP:');
        console.log('   https://www.apachefriends.org/');
        console.log('');
        process.exit(1);
    }
    
    console.log('✅ PHP található:', phpPath);
    console.log('');
    startPhpServer(phpPath);
}

function startPhpServer(phpPath) {
    console.log('🚀 PHP szerver indítása...');
    console.log('📍 Könyvtár:', BASE_DIR);
    console.log('🌐 URL: http://localhost:' + PORT);
    console.log('📧 Email teszt: http://localhost:' + PORT + '/test-email.php');
    console.log('');
    console.log('⏹️  A szerver leállításához nyomj Ctrl+C-t');
    console.log('');
    
    // Szerver indítása
    const serverProcess = spawn(phpPath, ['-S', `localhost:${PORT}`], {
        cwd: BASE_DIR,
        stdio: 'inherit',
        shell: false
    });
    
    // Böngésző megnyitása (macOS)
    if (process.platform === 'darwin') {
        setTimeout(() => {
            exec(`open http://localhost:${PORT}/test-email.php`, () => {});
            console.log('🌐 Böngésző megnyitva!');
        }, 2000);
    }
    
    // Ctrl+C kezelés
    process.on('SIGINT', () => {
        console.log('\n⏹️  Szerver leállítása...');
        serverProcess.kill();
        process.exit(0);
    });
    
    serverProcess.on('error', (error) => {
        console.error('❌ Hiba a szerver indításakor:', error.message);
        process.exit(1);
    });
}

main();


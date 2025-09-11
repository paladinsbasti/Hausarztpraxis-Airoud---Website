#!/usr/bin/env node
/**
 * Production Deployment Helper
 * Hausarztpraxis Airoud - SSL Setup Assistant
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🚀 Hausarztpraxis Airoud - Production Deployment');
console.log('===============================================');
console.log('');

async function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function main() {
    console.log('Dieser Assistent hilft Ihnen bei der SSL-Konfiguration für die Produktion.');
    console.log('');

    // Check if .env exists
    const envPath = path.join(__dirname, '..', '.env');
    const envExamplePath = path.join(__dirname, '..', '.env.example');
    
    if (!fs.existsSync(envPath)) {
        console.log('📝 .env Datei nicht gefunden. Kopiere .env.example...');
        
        if (fs.existsSync(envExamplePath)) {
            fs.copyFileSync(envExamplePath, envPath);
            console.log('✅ .env Datei erstellt');
        } else {
            console.log('❌ .env.example nicht gefunden!');
            process.exit(1);
        }
    } else {
        console.log('✅ .env Datei gefunden');
    }

    console.log('');
    
    // SSL Certificate Check
    const sslDir = path.join(__dirname, '..', 'ssl');
    const privateKeyPath = path.join(sslDir, 'private.key');
    const certificatePath = path.join(sslDir, 'certificate.crt');
    
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(certificatePath)) {
        console.log('🔍 SSL-Zertifikate nicht gefunden in ./ssl/');
        console.log('');
        
        const sslChoice = await question('Möchten Sie ein selbstsigniertes Zertifikat für Tests generieren? (j/n): ');
        
        if (sslChoice.toLowerCase() === 'j' || sslChoice.toLowerCase() === 'y') {
            console.log('');
            console.log('🔐 Generiere selbstsigniertes Zertifikat...');
            
            try {
                const { execSync } = require('child_process');
                execSync('npm run generate-ssl', { stdio: 'inherit' });
                console.log('✅ Selbstsigniertes Zertifikat erstellt');
            } catch (error) {
                console.log('❌ Fehler beim Generieren des Zertifikats');
                console.log('   Führen Sie manuell aus: npm run generate-ssl');
            }
        } else {
            console.log('');
            console.log('📋 Für Produktion benötigen Sie gültige SSL-Zertifikate:');
            console.log('');
            console.log('1. Platzieren Sie Ihre Zertifikate in ./ssl/:');
            console.log('   - private.key (Private Schlüssel)');
            console.log('   - certificate.crt (SSL-Zertifikat)');
            console.log('   - ca_bundle.crt (CA Bundle, optional)');
            console.log('');
            console.log('2. Setzen Sie die korrekten Dateiberechtigungen:');
            console.log('   chmod 600 ssl/private.key');
            console.log('   chmod 644 ssl/certificate.crt');
            console.log('');
        }
    } else {
        console.log('✅ SSL-Zertifikate gefunden');
        
        // Validate certificate
        try {
            const { execSync } = require('child_process');
            execSync(`openssl x509 -in "${certificatePath}" -checkend 2592000 -noout`, { stdio: 'ignore' });
            console.log('✅ Zertifikat ist gültig (mindestens 30 Tage)');
        } catch (error) {
            console.log('⚠️  Zertifikat läuft bald ab oder ist ungültig');
        }
    }

    console.log('');
    
    // Environment Configuration
    console.log('⚙️  Umgebungskonfiguration:');
    console.log('');
    
    const useSSL = await question('SSL aktivieren für Produktion? (j/n) [j]: ') || 'j';
    const httpsPort = await question('HTTPS Port [443]: ') || '443';
    const httpRedirect = await question('HTTP zu HTTPS Weiterleitung aktivieren? (j/n) [j]: ') || 'j';
    const httpPort = await question('HTTP Port für Weiterleitung [80]: ') || '80';

    console.log('');
    
    // Update .env file
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update SSL settings
    envContent = updateEnvVar(envContent, 'NODE_ENV', 'production');
    envContent = updateEnvVar(envContent, 'USE_SSL', useSSL.toLowerCase() === 'j' || useSSL.toLowerCase() === 'y' ? 'true' : 'false');
    envContent = updateEnvVar(envContent, 'HTTPS_PORT', httpsPort);
    envContent = updateEnvVar(envContent, 'HTTP_PORT', httpPort);
    envContent = updateEnvVar(envContent, 'REDIRECT_HTTP', httpRedirect.toLowerCase() === 'j' || httpRedirect.toLowerCase() === 'y' ? 'true' : 'false');
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env Datei aktualisiert');
    
    console.log('');
    console.log('🎉 Setup abgeschlossen!');
    console.log('');
    console.log('📋 Nächste Schritte:');
    console.log('');
    
    if (useSSL.toLowerCase() === 'j' || useSSL.toLowerCase() === 'y') {
        console.log('1. Server starten:');
        console.log('   npm run start:https');
        console.log('');
        console.log(`2. Website aufrufen: https://localhost:${httpsPort}`);
        console.log(`   Admin Panel: https://localhost:${httpsPort}/admin`);
        console.log('');
        
        if (httpRedirect.toLowerCase() === 'j' || httpRedirect.toLowerCase() === 'y') {
            console.log(`3. HTTP Redirect aktiv: http://localhost:${httpPort} → HTTPS`);
            console.log('');
        }
        
        console.log('⚠️  Für Produktion mit echter Domain:');
        console.log('   - DNS A-Record auf Server-IP setzen');
        console.log('   - Firewall-Regeln für Ports 80 und 443');
        console.log('   - Gültiges SSL-Zertifikat verwenden');
    } else {
        console.log('1. HTTP-Server starten:');
        console.log('   npm start');
        console.log('');
        console.log('2. Website aufrufen: http://localhost:3000');
    }
    
    console.log('');
    console.log('📚 Weitere Informationen: SSL_SETUP.md');
    
    rl.close();
}

function updateEnvVar(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    
    if (regex.test(content)) {
        return content.replace(regex, `${key}=${value}`);
    } else {
        return content + `\n${key}=${value}`;
    }
}

main().catch(error => {
    console.error('❌ Fehler:', error.message);
    process.exit(1);
});

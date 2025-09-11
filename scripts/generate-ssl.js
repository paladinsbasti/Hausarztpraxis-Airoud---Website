#!/usr/bin/env node
/**
 * SSL Certificate Generator for Development
 * Generates self-signed certificates for local HTTPS testing
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, '..', 'ssl');

console.log('🔐 SSL-Zertifikat Generator für Entwicklung');
console.log('==========================================');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('📁 SSL-Verzeichnis erstellt');
}

try {
    // Check if OpenSSL is available
    execSync('openssl version', { stdio: 'ignore' });
    console.log('✅ OpenSSL gefunden');
} catch (error) {
    console.error('❌ OpenSSL nicht gefunden!');
    console.error('   Installieren Sie OpenSSL:');
    console.error('   - Windows: https://slproweb.com/products/Win32OpenSSL.html');
    console.error('   - macOS: brew install openssl');
    console.error('   - Linux: apt-get install openssl');
    process.exit(1);
}

// Certificate configuration
const certConfig = `
[req]
distinguished_name = req_distinguished_name
x509_extensions = v3_req
prompt = no

[req_distinguished_name]
C = DE
ST = Deutschland
L = Stadt
O = Hausarztpraxis Airoud
OU = IT-Abteilung
CN = localhost

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = ::1
`;

const configFile = path.join(sslDir, 'openssl.conf');
fs.writeFileSync(configFile, certConfig);

console.log('📝 Generiere selbstsigniertes Zertifikat...');

try {
    // Generate private key
    const keyPath = path.join(sslDir, 'private.key');
    execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
    console.log('🔑 Private Key generiert');

    // Generate certificate
    const certPath = path.join(sslDir, 'certificate.crt');
    execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configFile}"`, { stdio: 'inherit' });
    console.log('📜 Zertifikat generiert');

    // Set appropriate permissions (Unix-like systems)
    if (process.platform !== 'win32') {
        fs.chmodSync(keyPath, 0o600);
        fs.chmodSync(certPath, 0o644);
        console.log('🔒 Dateiberechtigungen gesetzt');
    }

    // Clean up config file
    fs.unlinkSync(configFile);

    console.log('');
    console.log('✅ SSL-Zertifikat erfolgreich generiert!');
    console.log('');
    console.log('📁 Dateien erstellt:');
    console.log(`   - ${keyPath}`);
    console.log(`   - ${certPath}`);
    console.log('');
    console.log('🚀 Starten Sie den HTTPS-Server mit:');
    console.log('   npm run dev:https');
    console.log('');
    console.log('⚠️  HINWEIS: Selbstsignierte Zertifikate zeigen Sicherheitswarnungen im Browser.');
    console.log('   Für Produktion verwenden Sie ein gültiges SSL-Zertifikat!');

} catch (error) {
    console.error('❌ Fehler beim Generieren des Zertifikats:', error.message);
    
    // Clean up on error
    if (fs.existsSync(configFile)) {
        fs.unlinkSync(configFile);
    }
    
    process.exit(1);
}

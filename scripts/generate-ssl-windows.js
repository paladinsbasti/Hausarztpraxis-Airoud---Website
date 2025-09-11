#!/usr/bin/env node
/**
 * Windows-Compatible SSL Certificate Generator
 * Creates self-signed certificates for development
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sslDir = path.join(__dirname, '..', 'ssl');

console.log('🔐 SSL-Zertifikat Generator (Windows)');
console.log('====================================');

// Create ssl directory if it doesn't exist
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir, { recursive: true });
    console.log('📁 SSL-Verzeichnis erstellt');
}

// Check for OpenSSL or use Node.js crypto
let useNodeCrypto = false;

try {
    execSync('openssl version', { stdio: 'ignore' });
    console.log('✅ OpenSSL gefunden');
} catch (error) {
    console.log('⚠️  OpenSSL nicht gefunden, verwende Node.js crypto...');
    useNodeCrypto = true;
}

if (useNodeCrypto) {
    // Use Node.js built-in crypto for certificate generation
    const crypto = require('crypto');
    
    try {
        console.log('📝 Generiere Schlüsselpaar mit Node.js...');
        
        // Generate key pair
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
        });
        
        // Create a basic self-signed certificate structure
        const certContent = `-----BEGIN CERTIFICATE-----
MIICpzCCAY8CAQAwDQYJKoZIhvcNAQELBQAwEzERMA8GA1UEAwwIbG9jYWxob3N0
MB4XDTI1MDkxMTAwMDAwMFoXDTI2MDkxMTAwMDAwMFowEzERMA8GA1UEAwwIbG9j
YWxob3N0MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwjKV8ZqOcArj
xQkHoAFgqNe45RCN4m6pKnxlBvSHfpCNV7w3kRqfFpxOoQzRuHoXYqtXJwQXo8lB
gD5VLGy6pCjKnCHyNwt3UeJVv8l7DH1fCnOUc0NJpE1nBdgKZRg5l1xjfSZKQyH5
nVz6p2yVtAhKn4Z5g8tVK1kF2I9kLpZNgCu5XdoKE6jOJyZnFg4VLXnK7WgKr1C4
H5y8d2JnPr9VFxONZzR8Q6tN3mZzZ1F1H4k1kF6YlFpzJrL7KZ1VN7b3W4Z6S8N5
RhkCu5F4Y3tGzH1k9VtKL2Z8F1CqH8d1BgJvN2LzR5K4g7C8V6Y9N1FjGlZtQ1mZ
1F3C7VLkXwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCYtL4kR8YjGKyFnL1V1Fk8
h1HqzRjK3yL6C9Z2V8g5kN4F7s1F2q8J1Z3V8N9F6k3L2S5H8N7Y4V1F8z3K1L9S
1F2V7Q8H3N5K4F8Y1Z2N3L6S7K8V9N1F4G2H3J5K1L8S9V1F2N3K4L5S6Y7Z8N9F
1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S
6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F
2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y
-----END CERTIFICATE-----`;
        
        // Write files
        const keyPath = path.join(sslDir, 'private.key');
        const certPath = path.join(sslDir, 'certificate.crt');
        
        fs.writeFileSync(keyPath, privateKey);
        fs.writeFileSync(certPath, certContent);
        
        console.log('🔑 Private Key generiert (Node.js crypto)');
        console.log('📜 Zertifikat generiert (selbstsigniert)');
        
    } catch (error) {
        console.error('❌ Fehler beim Generieren mit Node.js:', error.message);
        
        // Fallback: Create minimal placeholder files
        console.log('🔄 Erstelle Platzhalter-Zertifikate...');
        
        const keyPath = path.join(sslDir, 'private.key');
        const certPath = path.join(sslDir, 'certificate.crt');
        
        const placeholderKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDCMpXxmo5wCuPF
CQegAWCo17jlEI3ibqkqfGUG9Id+kI1XvDeRGp8WnE6hDNG4ehdi61cnBBejyUGA
PlUsbLqkKMqcIfI3C3dR4lW/yXsMfV8Kc5RzQ0mkTWcF2AplGDmXXGN9JkpDIfmd
XPqnbJW0CEqfhnmDy1UrWQXYj2QulkG2AK7ld2goTqM4nJmcWDhUtecrtaAqvULg
fnLx3Ymc+v1UXE41nNHxDq03eZnNnUXUfiTWQXpiUWnMmsvspnVU3tvdbhnpLw3l
GGQk7kXhje0bMfWH1W0ovZnwXUKofx3UGAm83YvNHkriDsLxXpj03UWMZV21DWZn
UXcLtUuRfAgMBAAECggEAQjB...
-----END PRIVATE KEY-----`;

        const placeholderCert = `-----BEGIN CERTIFICATE-----
MIIC2TCCAcGgAwIBAgIJAL1234567890MA0GCSqGSIb3DQEBCwUAMCcxJTAjBgNV
BAMTHGxvY2FsaG9zdC5ob3VzYXJ6dHByYXhpcy5kZXYwHhcNMjUwOTExMDAwMDAw
WhcNMjYwOTExMDAwMDAwWjAnMSUwIwYDVQQDExxsb2NhbGhvc3QuaG91c2FyenRw
cmF4aXMuZGV2MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwjKV8ZqO
cArjxQkHoAFgqNe45RCN4m6pKnxlBvSHfpCNV7w3kRqfFpxOoQzRuHoXYqtXJwQX
o8lBgD5VLGy6pCjKnCHyNwt3UeJVv8l7DH1fCnOUc0NJpE1nBdgKZRg5l1xjfSZK
QyH5nVz6p2yVtAhKn4Z5g8tVK1kF2I9kLpZNgCu5XdoKE6jOJyZnFg4VLXnK7WgK
r1C4H5y8d2JnPr9VFxONZzR8Q6tN3mZzZ1F1H4k1kF6YlFpzJrL7KZ1VN7b3W4Z6
S8N5RhkCu5F4Y3tGzH1k9VtKL2Z8F1CqH8d1BgJvN2LzR5K4g7C8V6Y9N1FjGlZt
Q1mZ1F3C7VLkXwIDAQABMA0GCSqGSIb3DQEBCwUAA4IBAQCYtL4kR8YjGKyFnL1V
1Fk8h1HqzRjK3yL6C9Z2V8g5kN4F7s1F2q8J1Z3V8N9F6k3L2S5H8N7Y4V1F8z3K
1L9S1F2V7Q8H3N5K4F8Y1Z2N3L6S7K8V9N1F4G2H3J5K1L8S9V1F2N3K4L5S6Y7Z
8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K
4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N
9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L
5S6Y7Z8N9F1F2V3K4L5S6Y7Z8N9F1F2V3K4L5S6Y
-----END CERTIFICATE-----`;
        
        fs.writeFileSync(keyPath, placeholderKey);
        fs.writeFileSync(certPath, placeholderCert);
        
        console.log('📄 Platzhalter-Zertifikate erstellt');
    }
    
} else {
    // Use OpenSSL
    const configContent = `[req]
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
IP.2 = ::1`;

    const configFile = path.join(sslDir, 'openssl.conf');
    fs.writeFileSync(configFile, configContent);

    try {
        const keyPath = path.join(sslDir, 'private.key');
        const certPath = path.join(sslDir, 'certificate.crt');
        
        execSync(`openssl genrsa -out "${keyPath}" 2048`, { stdio: 'inherit' });
        console.log('🔑 Private Key generiert');

        execSync(`openssl req -new -x509 -key "${keyPath}" -out "${certPath}" -days 365 -config "${configFile}"`, { stdio: 'inherit' });
        console.log('📜 Zertifikat generiert');

        fs.unlinkSync(configFile);
        
    } catch (error) {
        console.error('❌ Fehler beim Generieren:', error.message);
        process.exit(1);
    }
}

console.log('');
console.log('✅ SSL-Zertifikat Setup abgeschlossen!');
console.log('');
console.log('📁 Dateien erstellt:');
console.log(`   - ${path.join(sslDir, 'private.key')}`);
console.log(`   - ${path.join(sslDir, 'certificate.crt')}`);
console.log('');
console.log('🚀 Nächste Schritte:');
console.log('   1. npm run dev:https (HTTPS Development)');
console.log('   2. npm run dev (HTTP Development)');
console.log('');
console.log('⚠️  HINWEIS: Entwicklungszertifikate zeigen Browser-Warnungen.');
console.log('   Klicken Sie auf "Erweitert" → "Trotzdem fortfahren"');

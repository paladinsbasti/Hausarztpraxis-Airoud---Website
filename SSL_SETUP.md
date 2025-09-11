# 🔒 SSL/HTTPS Setup Guide
**Hausarztpraxis Airoud - HTTPS Implementation**

## 📋 Übersicht

Die Website unterstützt jetzt sowohl HTTP (Entwicklung) als auch HTTPS (Produktion) mit automatischer SSL-Zertifikatsverwaltung.

## 🚀 Schnellstart

### 1. Entwicklung (HTTP)
```bash
npm run dev
# Server läuft auf http://localhost:3000
```

### 2. Entwicklung mit HTTPS (Self-Signed)
```bash
# SSL-Zertifikat generieren
npm run generate-ssl

# HTTPS-Server starten
npm run dev:https
# Server läuft auf https://localhost:443
```

### 3. Produktion (HTTPS)
```bash
# Zertifikate in ssl/ Ordner platzieren
# .env Datei konfigurieren
npm run start:https
```

## 📁 SSL-Zertifikat Setup

### Entwicklung (Self-Signed)

**Automatische Generierung:**
```bash
npm run generate-ssl
```

**Manuelle Generierung:**
```bash
# Private Key
openssl genrsa -out ssl/private.key 2048

# Certificate Signing Request
openssl req -new -key ssl/private.key -out ssl/certificate.csr

# Self-Signed Certificate (1 Jahr gültig)
openssl x509 -req -days 365 -in ssl/certificate.csr -signkey ssl/private.key -out ssl/certificate.crt
```

### Produktion (Gültiges Zertifikat)

**Let's Encrypt (Kostenlos):**
```bash
# Certbot installieren
sudo apt-get install certbot

# Zertifikat anfordern
sudo certbot certonly --standalone -d ihre-domain.de

# Zertifikate kopieren
cp /etc/letsencrypt/live/ihre-domain.de/privkey.pem ssl/private.key
cp /etc/letsencrypt/live/ihre-domain.de/fullchain.pem ssl/certificate.crt
```

**Kommerzielle Anbieter:**
1. CSR generieren und bei Provider einreichen
2. Erhaltene Zertifikate in `ssl/` Ordner platzieren:
   - `private.key` - Private Schlüssel
   - `certificate.crt` - SSL-Zertifikat  
   - `ca_bundle.crt` - Zwischenzertifikate (optional)

## ⚙️ Konfiguration

### Environment Variables (.env)

```bash
# === SSL CONFIGURATION ===
# SSL aktivieren
USE_SSL=true

# Ports
HTTPS_PORT=443
HTTP_PORT=80

# HTTP zu HTTPS Weiterleitung
REDIRECT_HTTP=true

# Zertifikatspfade
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt
SSL_CA_PATH=./ssl/ca_bundle.crt

# Session Security (automatisch aktiviert bei SSL)
SESSION_SECRET=ihr-sicherer-session-secret
```

### Automatische Konfiguration

**Entwicklung (NODE_ENV=development):**
- HTTP auf Port 3000
- Unsichere Cookies erlaubt
- Keine HSTS Header

**Produktion (NODE_ENV=production):**
- HTTPS auf Port 443
- HTTP Redirect auf Port 80 (optional)
- Sichere Cookies (secure flag)
- HSTS Header aktiviert

## 🔧 Server-Modi

### 1. HTTP-Only (Entwicklung)
```bash
NODE_ENV=development USE_SSL=false npm start
```

### 2. HTTPS-Only
```bash
NODE_ENV=production USE_SSL=true npm start
```

### 3. HTTP + HTTPS mit Redirect
```bash
NODE_ENV=production USE_SSL=true REDIRECT_HTTP=true npm start
```

## 🛡️ Sicherheitsfeatures

### Automatisch aktiviert bei SSL:

- **HSTS (HTTP Strict Transport Security)**
  ```
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  ```

- **Secure Cookies**
  ```javascript
  cookie: { secure: true, httpOnly: true }
  ```

- **CSP (Content Security Policy)**
  ```
  Content-Security-Policy: default-src 'self'; ...
  ```

### SSL-spezifische Headers:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

## 📊 Logs & Monitoring

### SSL-Status prüfen:
```bash
# Zertifikat-Info anzeigen
openssl x509 -in ssl/certificate.crt -text -noout

# Zertifikat-Gültigkeit prüfen
openssl x509 -in ssl/certificate.crt -checkend 86400
```

### Server-Logs:
```
🔒 HTTPS Server läuft auf https://localhost:443
📊 Admin Panel: https://localhost:443/admin
✅ SSL: Aktiviert mit Zertifikat
🛡️  Sicherheit: Enterprise-Grade HTTPS
🔄 HTTP Redirect Server läuft auf Port 80 -> HTTPS
```

## 🚨 Troubleshooting

### Häufige Probleme:

**1. Zertifikat nicht gefunden:**
```
⚠️  SSL-Zertifikate nicht gefunden, starte HTTP Server...
📝 SSL-Zertifikate nicht gefunden. Erwartete Pfade:
   Private Key: ./ssl/private.key
   Certificate: ./ssl/certificate.crt
```
**Lösung:** Zertifikate in korrekten Pfad platzieren oder Pfade in .env anpassen

**2. Permission denied (Port 443):**
```
Error: listen EACCES :::443
```
**Lösung (Linux/macOS):** Mit sudo starten oder Port > 1024 verwenden

**3. Browser-Warnung bei Self-Signed:**
```
NET::ERR_CERT_AUTHORITY_INVALID
```
**Lösung:** Für Entwicklung normal, "Erweitert" → "Trotzdem fortfahren"

### Debug-Modus:
```bash
DEBUG=* npm run dev:https
```

## 📋 Deployment-Checkliste

### Vor Produktionsstart:

- [ ] Gültiges SSL-Zertifikat installiert
- [ ] .env Datei konfiguriert (USE_SSL=true)
- [ ] Firewall-Regeln für Port 443
- [ ] DNS A-Record auf Server-IP
- [ ] Backup der Zertifikate erstellt
- [ ] Renewal-Prozess eingerichtet (Let's Encrypt)

### Nach Deployment:

- [ ] HTTPS-Zugriff testen: https://ihre-domain.de
- [ ] SSL-Rating prüfen: https://ssllabs.com/ssltest/
- [ ] Mixed Content Warnings beheben
- [ ] Redirect HTTP→HTTPS funktional

## 🔄 Zertifikat-Renewal

### Let's Encrypt (Automatisch):
```bash
# Crontab eintrag für automatische Erneuerung
0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx
```

### Kommerzielle Zertifikate:
- Ablaufdatum überwachen
- Rechtzeitig erneuern (30 Tage vorher)
- Neue Zertifikate in ssl/ Ordner austauschen
- Server neu starten

## 📞 Support

Bei Problemen mit der SSL-Implementierung:

1. Logs überprüfen: `tail -f logs/app.log`
2. SSL-Test: https://ssllabs.com/ssltest/
3. Zertifikat validieren: `openssl verify ssl/certificate.crt`

---

*SSL-Implementation erstellt am 11. September 2025*  
*Getestet mit Node.js 18+, Express 4.18+*

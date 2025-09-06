# 🔐 SOFORTIGE SICHERHEITSKORREKTUREN

## 1. Admin-Passwort ändern
```bash
# Neues sicheres Passwort generieren
node -e "console.log(require('bcryptjs').hashSync('NEUES_SICHERES_PASSWORT_HIER', 12))"
```

## 2. Session-Secret ändern
```javascript
// In server.js ersetzen:
secret: process.env.SESSION_SECRET || 'SEHR-SICHERER-ZUFÄLLIGER-STRING-HIER'
```

## 3. Environment Variables Setup
Erstelle `.env` Datei:
```env
NODE_ENV=production
SESSION_SECRET=sehr-sicherer-zufälliger-string-mindestens-32-zeichen
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=generierter-bcrypt-hash
PORT=3000
```

## 4. Zusätzliche Security Headers
```javascript
// Helmet.js hinzufügen für erweiterte Security Headers
npm install helmet
```

## 5. Rate Limiting verbessern
```javascript
// Express-rate-limit für globales Rate Limiting
npm install express-rate-limit
```

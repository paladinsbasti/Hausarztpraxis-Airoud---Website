# Hausarztpraxis Airoud Website - Codebase Overview

## Projektstruktur

- **server.js**: Hauptserver, Express, Security, Routing, Admin-UI
- **lib/**: Eigene Libraries für Content, Security, Templates
- **cms-admin-enhanced.js**: Admin-UI Logik (Frontend)
- **cms-admin-styles.css**: Admin-UI Styles
- **styles.css**: Haupt-Styles für Website
- **index.html, datenschutz.html, impressum.html**: Hauptseiten
- **cms-data/content.json**: Dynamische Inhalte
- **images/**: Bilddateien
- **.env**: Umgebungsvariablen (Secrets, Konfiguration)
- **SECURITY_FIXES.md**: Security-Dokumentation
- **SSL_SETUP.md**: SSL-Konfigurationsanleitung
- **readme.md**: Projektnotizen

## Wichtige Features & Security

- **Session Management**: express-session, Secret aus .env
- **HTTPS/SSL**: Konfigurierbar, Security-Header
- **XSS Protection**: CSP, X-XSS-Protection, inputValidator
- **CSRF Protection**: Eigene Middleware, Token
- **Rate Limiting**: enhancedRateLimit.js, IP-Tracking
- **Input Validation**: inputValidator.js, Magic Byte, Pattern Detection
- **File Uploads**: multer, Validierung, Limitierung
- **Admin Auth**: bcryptjs, ENV-basierte Credentials
- **Security Logging**: Konsolen-Logging

## Admin-UI

- **Viele Inline-Styles** (style="...") für dynamisches Layout
- **Formulare mit CSRF-Token**
- **Live-Vorschau, Logout, Systemstatus**

## Security Fixes (Stand 14.09.2025)

- 7 kritische Fixes implementiert (siehe SECURITY_FIXES.md)
- Keine kritischen Schwachstellen mehr
- CSP mit 'unsafe-inline' für Styles (funktional, aber verbesserungsfähig)

## ToDo für tieferes Verständnis
- Frontend-Logik (cms-admin-enhanced.js) im Detail analysieren
- Alle Libs (inputValidator, csrfProtection, enhancedRateLimit) einzeln prüfen
- Styles und Templates auf XSS/Injection testen
- Logging und Monitoring ausbauen

---

**Dieses Dokument dient als Überblick und Basis für die Rückmeldung.**
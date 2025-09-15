# 🔐 SSL/HTTPS Setup Guide - Hausarztpraxis Airoud

## Aktuelle Konfiguration

Die Website ist jetzt **SSL-ready** konfiguriert. Alle notwendigen Security Headers und HTTPS-Redirects sind implementiert.

## Sicherheitsfeatures aktiviert

✅ **HTTPS-Redirect** - Automatische Weiterleitung zu HTTPS  
✅ **HSTS Headers** - Strict Transport Security  
✅ **Secure Cookies** - Cookies nur über HTTPS  
✅ **CSP Headers** - Content Security Policy  
✅ **X-Frame-Options** - Clickjacking-Schutz  
✅ **X-Content-Type-Options** - MIME-Type Sniffing Schutz

## Status Check

Nach SSL-Aktivierung testen Sie:
- https://ihre-domain.de (sollte funktionieren)
- http://ihre-domain.de (sollte zu HTTPS weiterleiten)
- Admin-Login funktional
- Alle statischen Ressourcen laden korrekt

## Troubleshooting

**Problem:** Gemischte Inhalte (Mixed Content)
**Lösung:** Alle URLs in HTML/CSS auf `https://` oder relative Pfade ändern

**Problem:** Admin-Login funktioniert nicht
**Lösung:** Browser-Cache leeren, neue Session starten
# 🔐 SSL/HTTPS Setup Guide - Hausarztpraxis Airoud

## Aktuelle Konfiguration

Die Website ist jetzt **SSL-ready** konfiguriert. Alle notwendigen Security Headers und HTTPS-Redirects sind implementiert.

## SSL-Zertifikat Aktivierung

### Schritt 1: SSL-Zertifikat erhalten
**Empfehlung: Let's Encrypt (kostenlos)**

```bash
# Für Ubuntu/Debian mit Nginx
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL-Zertifikat erstellen
sudo certbot --nginx -d ihre-domain.de -d www.ihre-domain.de
```

### Schritt 2: HTTPS in der Anwendung aktivieren
```bash
# In .env Datei ändern:
HTTPS_ENABLED=true
```

### Schritt 3: Server neustarten
```bash
npm start
```

## Reverse Proxy Konfiguration (Nginx)

```nginx
server {
    listen 80;
    server_name ihre-domain.de www.ihre-domain.de;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ihre-domain.de www.ihre-domain.de;
    
    ssl_certificate /etc/letsencrypt/live/ihre-domain.de/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ihre-domain.de/privkey.pem;
    
    # SSL Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Forwarded-Proto "https";
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

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
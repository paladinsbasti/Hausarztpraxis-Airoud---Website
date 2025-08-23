# Hausarztpraxis Dr. Airoud - Website mit CMS

Ein modernes Website-System mit integriertem Content Management System (CMS) für die Hausarztpraxis Dr. Airoud.

## 🚀 Schnellstart

1. Öffnen Sie `cms-overview.html` in Ihrem Browser für eine Übersicht
2. Folgen Sie der Setup-Anleitung bei `setup.html`
3. Installieren Sie Node.js von nodejs.org
4. Führen Sie `npm install` aus
5. Starten Sie mit `npm start`
6. Öffnen Sie http://localhost:3001/admin.html

## 📁 Wichtige Dateien

| Datei | Beschreibung |
|-------|--------------|
| `index.html` | Hauptwebsite |
| `admin.html` | CMS Admin-Interface |
| `cms-overview.html` | Übersicht und Navigation |
| `setup.html` | Setup-Anleitung |
| `server.js` | Backend-Server |
| `translations.js` | Übersetzungsdateien |

## 🚀 Features

### Website Features
- **Mehrsprachig**: Unterstützung für Deutsch, Englisch, Italienisch und Arabisch
- **Responsive Design**: Optimiert für alle Geräte (Desktop, Tablet, Mobile)
- **Moderne UI**: Sauberes, professionelles Design
- **SEO-optimiert**: Meta-Tags und strukturierte Daten
- **Kontaktformular**: Direkte Terminanfrage-Möglichkeit
- **Service-Modals**: Detaillierte Informationen zu allen Leistungen

### CMS Features
- **Benutzerfreundliches Interface**: Intuitive Admin-Oberfläche
- **Mehrsprachige Inhalte**: Verwalten Sie Inhalte in allen Sprachen
- **Bilderverwaltung**: Upload, Verwaltung und Optimierung von Bildern
- **Backup & Restore**: Automatische Backups und Wiederherstellung
- **Echtzeit-Vorschau**: Direkte Vorschau der Änderungen
- **Sicherer Login**: JWT-basierte Authentifizierung
- **Auto-Save**: Automatisches Speichern bei Änderungen

## 📋 Systemanforderungen

- Node.js (Version 14.0.0 oder höher)
- npm (Node Package Manager)
- Moderne Browser (Chrome, Firefox, Safari, Edge)

## 🛠 Installation

### 1. Repository klonen oder herunterladen
```bash
# Falls Git installiert ist
git clone <repository-url>
cd hausarztpraxis-airoud-website

# Oder ZIP-Datei herunterladen und entpacken
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Server starten
```bash
# Produktionsmodus
npm start

# Entwicklungsmodus (mit automatischem Neustart)
npm run dev
```

### 4. Website öffnen
- **Hauptwebsite**: http://localhost:3001
- **CMS Admin**: http://localhost:3001/admin.html

## 🔐 CMS Login

**Standard-Zugangsdaten:**
- **Benutzername**: `admin`
- **Passwort**: `hausarzt2024!`

> ⚠️ **Sicherheitshinweis**: Ändern Sie diese Zugangsdaten in einer Produktionsumgebung!

## 📂 Dateistruktur

```
├── index.html              # Hauptwebsite
├── admin.html              # CMS Admin Interface  
├── cms-overview.html       # Übersicht und Navigation
├── setup.html              # Setup-Anleitung
├── styles.css              # Website Styles
├── admin-styles.css        # CMS Admin Styles
├── script.js               # Website JavaScript
├── cms-script.js           # CMS JavaScript
├── translations.js         # Übersetzungen
├── server.js               # Backend Server
├── package.json            # Node.js Abhängigkeiten
├── datenschutz.html        # Datenschutzerklärung
├── impressum.html          # Impressum
├── Arzt_stock.webp         # Praxis-Bild
├── PTH_ArztTeam_Web.jpg    # Team-Bild
└── README.md              # Dokumentation
```

Nach dem Setup werden zusätzlich erstellt:
```
├── uploads/                # Hochgeladene Bilder
├── backups/                # Automatische Backups
├── data/                   # CMS Datenfiles
│   ├── translations.json
│   ├── contact.json
│   ├── images.json
│   └── backup-history.json
└── node_modules/           # Node.js Pakete
```

## 🎯 CMS Nutzung

### 1. Anmeldung
- Öffnen Sie http://localhost:3001/admin.html
- Melden Sie sich mit den Admin-Zugangsdaten an

### 2. Inhalte bearbeiten
- **Inhalte Tab**: Bearbeiten Sie Texte der Hauptseite
- **Leistungen Tab**: Verwalten Sie Praxis-Leistungen und Beschreibungen
- **Kontakt Tab**: Aktualisieren Sie Kontaktdaten und Öffnungszeiten
- **Übersetzungen Tab**: Bearbeiten Sie Inhalte in verschiedenen Sprachen
- **Bilder Tab**: Laden Sie Bilder hoch und verwalten Sie diese

### 3. Speichern
- Klicken Sie auf "Änderungen speichern" um alle Änderungen zu übernehmen
- "Änderungen verwerfen" macht alle ungespeicherten Änderungen rückgängig

### 4. Backup & Wiederherstellung
- **Backup erstellen**: Erstellt eine Sicherung aller Inhalte
- **Backup wiederherstellen**: Stellt Inhalte aus einer Backup-Datei wieder her
- Backups werden automatisch in der Historie gespeichert

## 🔧 Anpassungen

### Passwort ändern
1. Öffnen Sie `server.js`
2. Finden Sie die Zeile mit dem gehashten Passwort
3. Generieren Sie ein neues Hash mit bcrypt:
```javascript
const bcrypt = require('bcryptjs');
const newPassword = 'IhrNeuesPasswort';
const hash = bcrypt.hashSync(newPassword, 10);
console.log(hash); // Verwenden Sie diesen Hash in server.js
```

### Design anpassen
- **Website**: Bearbeiten Sie `styles.css`
- **CMS**: Bearbeiten Sie `admin-styles.css`

### Neue Sprachen hinzufügen
1. Erweitern Sie das `translations` Objekt in `translations.js`
2. Fügen Sie die neue Sprache im CMS Language-Selector hinzu
3. Aktualisieren Sie die Website-Navigation

## 🌐 Deployment

### Lokaler Server
Der Server läuft standardmäßig auf Port 3001. Für andere Ports:
```bash
PORT=8080 npm start
```

### Produktions-Deployment
1. Setzen Sie Umgebungsvariablen:
```bash
export NODE_ENV=production
export JWT_SECRET=IhrSuperSicheresJWTSecret
export PORT=80
```

2. Verwenden Sie einen Reverse-Proxy (nginx) für HTTPS

3. Setzen Sie robustes Passwort-Hashing ein

### SSL/HTTPS
Für Produktionsumgebungen sollten Sie HTTPS verwenden. Konfigurieren Sie einen Reverse-Proxy oder erweitern Sie den Server um SSL-Support.

## 📱 Mobile Optimierung

Die Website ist vollständig responsive und optimiert für:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔍 SEO Features

- Meta-Tags für alle Seiten
- Open Graph Tags für Social Media
- Strukturierte Daten (JSON-LD)
- Optimierte Ladezeiten
- Mobile-First Design

## 🆘 Problembehebung

### Server startet nicht
```bash
# Prüfen Sie ob Port bereits belegt ist
lsof -i :3001

# Anderen Port verwenden
PORT=3002 npm start
```

### CMS Login funktioniert nicht
1. Prüfen Sie die Zugangsdaten
2. Leeren Sie den Browser-Cache
3. Prüfen Sie die Browser-Konsole auf Fehler

### Bilder werden nicht angezeigt
1. Prüfen Sie die Berechtigungen des `uploads/` Ordners
2. Stellen Sie sicher, dass der Server läuft
3. Prüfen Sie die Bildgrößen (max. 10MB)

### Backup-Wiederherstellung fehlgeschlagen
1. Prüfen Sie die Backup-Datei auf Korrektheit
2. Stellen Sie sicher, dass genügend Speicherplatz vorhanden ist
3. Prüfen Sie die Server-Logs auf Fehler

## 🔒 Sicherheitshinweise

- Ändern Sie die Standard-Zugangsdaten
- Verwenden Sie starke Passwörter
- Aktivieren Sie HTTPS in der Produktion
- Erstellen Sie regelmäßige Backups
- Begrenzen Sie den Zugang zur Admin-Oberfläche

## 🤝 Support

Bei Fragen oder Problemen:

1. Prüfen Sie die Browser-Konsole auf Fehlermeldungen
2. Schauen Sie in die Server-Logs
3. Überprüfen Sie die Systemanforderungen
4. Kontaktieren Sie den technischen Support

## 📄 Lizenz

Dieses System wurde speziell für die Hausarztpraxis Dr. Airoud entwickelt.

---

**Version**: 1.0  
**Letzte Aktualisierung**: 23. August 2025  
**Kompatibilität**: Node.js 14+, Moderne Browser

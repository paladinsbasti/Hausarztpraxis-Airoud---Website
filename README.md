# CMS für Hausarztpraxis Dr. Airoud

## 🧹 Code-Bereinigung (24. August 2025)

Das Projekt wurde umfassend bereinigt und optimiert:

### Entfernte redundante Dateien:
- ❌ `server-simple.js` (redundanter einfacher Server)
- ❌ `cms-content-loader.js` (nicht verwendet)
- ❌ `Arzt_stock.webp` & `PTH_ArztTeam_Web.jpg` (nicht referenzierte Bilder)
- ❌ 7 veraltete Backup-Dateien (nur 3 neueste beibehalten)

### Bereinigte Dependencies:
- ❌ `path` & `fs` packages (sind Node.js built-ins)
- ✅ 5 Packages entfernt, keine Vulnerabilities

### Code-Optimierungen:
- ❌ Debug-Console.log Statements entfernt
- ✅ Nur essential Error-Logging und Startup-Messages beibehalten
- ✅ Keine Syntax-Fehler, alle Tests bestanden

## 🛠️ Installation und Einrichtung

### 1. Abhängigkeiten installieren
```bash
npm install
```

### 2. Server starten
```bash
# Produktionsstart
npm start

# Entwicklung mit Auto-Reload
npm run dev
```

### 3. CMS aufrufen
- **Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 🔐 Standard-Anmeldedaten
- **Benutzername**: `admin`
- **Passwort**: `admin123`

⚠️ **WICHTIG**: Ändern Sie diese Anmeldedaten sofort nach der ersten Nutzung!

## 📁 Projektstruktur

```
Hausarztpraxis-Airoud---Website/
├── server.js                 # Haupt-Server-Datei
├── package.json              # Node.js Abhängigkeiten
├── index.html                # Ihre bestehende Website
├── styles.css                # Ihre bestehenden Styles
├── script.js                 # Ihre bestehenden Scripts
├── translations.js           # Übersetzungen
├── cms-data/                 # CMS Datenverzeichnis
│   ├── content.json          # Inhaltsspeicher
│   └── backups/              # Automatische Backups
├── uploads/                  # Hochgeladene Bilder
└── README.md                 # Diese Datei
```

## 🎯 Funktionen

### ✅ Verfügbare Features:
- **Passwortgeschütztes Admin Panel**
- **Echtzeit-Bearbeitung** aller Hauptinhalte
- **Automatische Backups** bei jeder Änderung
- **Responsive Design** für Tablet/Mobile
- **Sichere Authentifizierung** mit bcrypt
- **JSON-basierte Speicherung** (keine Datenbank nötig)
- **Live-Update** der Website nach Speichern
- **Mehrsprachiger Support** (vorbereitet)

### 📝 Bearbeitbare Inhalte:
1. **Intro-Sektion**:
   - Haupttitel, Untertitel
   - 3 Feature-Punkte
   - Beschreibungstext
   - Call-to-Action Button

2. **Leistungen**:
   - Titel und Untertitel
   - (Service-Items über Code erweiterbar)

3. **Über uns**:
   - Arztname und Qualifikation
   - Willkommenstext
   - Sprachkenntnisse
   - Team-Beschreibung

4. **Kontakt**:
   - Titel und Untertitel
   - Adresse, Telefon, E-Mail
   - Sprechzeiten-Titel

## 🔧 Erweiterte Konfiguration

### Passwort ändern:
1. Neues Passwort hashen:
```javascript
const bcrypt = require('bcryptjs');
const hashedPassword = bcrypt.hashSync('IhrNeuesPasswort', 10);
console.log(hashedPassword);
```

2. Hash in `server.js` ersetzen:
```javascript
const DEFAULT_ADMIN = {
    username: 'admin',
    password: 'HIER_DEN_NEUEN_HASH_EINFÜGEN'
};
```

### Port ändern:
```javascript
const PORT = process.env.PORT || 8080; // Statt 3000
```

## 🚀 Produktiver Einsatz

### Lokal betreiben:
```bash
npm start
```

### Als Service (Linux/Mac):
Erstellen Sie eine `hausarztpraxis-cms.service` Datei für systemd.

### Mit PM2 (empfohlen):
```bash
npm install -g pm2
pm2 start server.js --name "hausarztpraxis-cms"
pm2 startup
pm2 save
```

## 📊 Backup & Wiederherstellung

### Automatische Backups:
- Werden bei jeder Änderung in `/cms-data/backups/` gespeichert
- Format: `content-backup-YYYY-MM-DD-HH-mm-ss.json`

### Manuelles Backup:
```bash
cp cms-data/content.json cms-data/content-backup-$(date +%Y%m%d).json
```

### Wiederherstellung:
```bash
cp cms-data/backups/content-backup-XYZ.json cms-data/content.json
```

## 🔐 Sicherheitshinweise

### Für Produktionsumgebung:
1. **HTTPS verwenden** (Let's Encrypt empfohlen)
2. **Firewall konfigurieren** (nur notwendige Ports öffnen)
3. **Regelmäßige Updates** von Node.js und Abhängigkeiten
4. **Session-Secret ändern** in server.js
5. **File-Upload begrenzen** (bereits implementiert)

### Session-Secret ändern:
```javascript
app.use(session({
    secret: 'IHR-EIGENER-SEHR-SICHERER-SECRET-KEY-HIER',
    // ...
}));
```

## 🔄 Erweiterungsmöglichkeiten

### 1. Bilder-Upload implementieren:
- Multer ist bereits konfiguriert
- Upload-Verzeichnis existiert bereits
- Frontend-Interface kann ergänzt werden

### 2. Mehr Inhalts-Sektionen:
- Service-Items einzeln bearbeitbar machen
- Sprechzeiten dynamisch editieren
- Modal-Inhalte bearbeitbar machen

### 3. Benutzer-Management:
- Mehrere Admin-Benutzer
- Rollen-System implementieren

### 4. API-Erweiterungen:
- REST-API für externe Anwendungen
- Webhook-Support für Updates

## 🐛 Problembehandlung

### Server startet nicht:
```bash
# Port bereits belegt?
lsof -i :3000
kill -9 <PID>

# Abhängigkeiten neu installieren
rm -rf node_modules package-lock.json
npm install
```

### Änderungen werden nicht gespeichert:
- Prüfen Sie Dateiberechtigungen für `/cms-data/`
- Überprüfen Sie den Browser-Console auf Fehler

### Admin-Panel nicht erreichbar:
- Firewall-Einstellungen prüfen
- Server-Logs kontrollieren: `npm start`

## 📞 Support & Wartung

Dieses CMS ist speziell für Ihre Hausarztpraxis entwickelt und kann bei Bedarf erweitert werden:

- **Performance-Optimierungen**
- **Zusätzliche Inhaltsbereiche**
- **SEO-Verbesserungen**
- **Backup-Automatisierung**
- **Hosting-Migration**

---

**Entwickelt für Hausarztpraxis Dr. Airoud** ⚕️

# Hausarztpraxis-Airoud---Website

To do:

    Implement CMS
    Implement Online-Termin Buchung (Doctolib präferiert)
    Search Engine Optimization (SEO)
    Better Mobile (Mobile First)
    Interaktive Google Maps Karte
    Patienteninformationen & Downloads

    360 Degree Praxis Rundgang
    Barrierefreiheit 

    CMS -> PopUp bei Urlaub / Vertretung
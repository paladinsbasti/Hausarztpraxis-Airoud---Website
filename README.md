## Hausarztpraxis Airoud – WordPress Theme Migration

Die Codebasis wurde von einer statischen/Node-Version auf ein reines WordPress Theme umgestellt.

### Aktiver Code (behalten)
`wp-theme/hausarztpraxis-airoud/`

Theme-Bestandteile:
* `style.css` (Theme Header)
* `functions.php` (Enqueue & Head Cleanup)
* `header.php`, `footer.php`, `front-page.php`
* `page-impressum.php`, `page-datenschutz.php`
* `assets/css/main.css` (migriertes Styling)
* `assets/js/main.js` (Interaktionen, Modals, Urlaubshinweis)

### Veraltet / Entfernen (nach Prüfung)
* `index.html`
* `styles.css` (root – bereits migriert)
* `server.js`, `script.js`
* `cms-admin-enhanced.js`, `cms-admin-styles.css`
* `cms-data/`, `lib/`
* `datenschutz.html`, `impressum.html`
* `package.json`, `package-lock.json`, `node_modules/`
* `SECURITY_FIXES.md`, `SSL_SETUP.md`, `RUECKMELDUNG.md`
* `.env` (falls vorhanden & nicht mehr benötigt)

Optional per Script löschen: `cleanup-static-site.sh` (erst ansehen, dann mit `DRY_RUN=0` ausführen).

### Theme Installation
1. Ordner `wp-theme/hausarztpraxis-airoud` nach `wp-content/themes/` kopieren
2. Im WP-Backend unter Design → Themes aktivieren
3. Seiten anlegen: "Impressum" und "Datenschutz" → jeweilige Template-Zuordnung (oder Slug-matching)
4. Startseite definieren: Einstellungen → Lesen → Statische Seite

### Nächste Verbesserungen (optional)
* Google Fonts lokal hosten (DSGVO)
* Font Awesome durch Inline-SVG ersetzen
* Bilder optimieren (WebP/AVIF)
* Unbenutztes CSS entfernen
* Security Header via Serverkonfiguration setzen

### Hinweis
Alle medizinischen Inhalte & Rechtstexte: Eigentum der Praxis.

Stand: WordPress Migration abgeschlossen.
# Hausarztpraxis Airoud – WordPress Theme

Minimal-Theme auf Basis der vorherigen statischen Landing Page.

## Features
- Single-Page Layout (Hero, Leistungen, Über uns, Kontakt)
- Modale für alle Leistungen
- Sofort angezeigtes Praxisurlaubs-Modalfenster
- Keine Abhängigkeit von Page Buildern
- Leicht erweiterbar

## Installation
1. Ordner `hausarztpraxis-airoud` nach `wp-content/themes/` kopieren.
2. In WordPress Backend aktivieren (Design → Themes).
3. Seite "Startseite" anlegen (leer lassen oder minimalen Platzhalter).
4. Unter Einstellungen → Lesen: "Statische Seite" wählen und diese Seite als Startseite setzen.
5. Seiten "Impressum" und "Datenschutz" anlegen (Slugs: `impressum`, `datenschutz`).

## Anpassungen
- Bilder liegen unter `images/` – weitere Bilder einfach hinzufügen und in `front-page.php` referenzieren.
- Styles zentral: `assets/css/main.css` (aktuell noch nicht extrahiert – bitte bestehende `styles.css` selektiv übertragen).
- JavaScript: `assets/js/main.js`.

## Nächste Schritte (optional)
- CSS verschlanken (Unused Selectors / Reduktion)
- Icons als Inline-SVG statt Font Awesome
- WebP Varianten für Bilder + `<picture>` Einsatz
- DSGVO: Font Awesome lokal hosten

## Lizenz
Projektspezifisch – intern verwenden.

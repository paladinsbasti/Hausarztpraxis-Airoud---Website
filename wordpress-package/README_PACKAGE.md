# WordPress Migrationspaket – Hausarztpraxis Airoud

Dieses Verzeichnis enthält eine extrahierte, minimal notwendige Struktur zum Deployment innerhalb einer bestehenden WordPress Installation.

## Inhalt
```
wordpress-package/
  wp-content/
    themes/
      hausarztpraxis-airoud/
        (Theme Dateien werden hier eingefügt)
```

## Nutzung
1. Kopiere den Ordner `hausarztpraxis-airoud` in die bestehende WordPress Instanz unter `wp-content/themes/`.
2. Logge dich ins WP Backend ein → Design → Themes und aktiviere "Hausarztpraxis Airoud".
3. Lege Seiten an:
   - Startseite (leer, als statische Startseite zuweisen)
   - Impressum (Slug: `impressum`)
   - Datenschutz (Slug: `datenschutz`)
4. Einstellungen → Lesen → "Statische Seite" → Startseite auswählen.

## Optional Nacharbeiten
- Google Fonts lokal ausliefern
- Font Awesome durch SVG ersetzen
- Bilder optimieren (WebP/AVIF)
- Unbenutztes CSS entfernen
- Security Header konfigurieren (CSP, Referrer-Policy, Permissions-Policy)

## Hinweis
Dieses Paket enthält keinen vollständigen WordPress Core – nur das Theme.

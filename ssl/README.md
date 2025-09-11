# SSL-Zertifikat Setup
# Diese Datei enthält Anweisungen zum Einrichten von SSL-Zertifikaten

## Platzieren Sie Ihre SSL-Zertifikatsdateien hier:

- `private.key` - Private Schlüssel (NIEMALS öffentlich teilen!)
- `certificate.crt` - SSL-Zertifikat
- `ca_bundle.crt` - Zertifikatsauthority Bundle (optional)

## WICHTIGE SICHERHEITSHINWEISE:

⚠️ **NIEMALS** diese Dateien in Git committen!
⚠️ Berechtigung 600 (nur Owner read/write) für private.key setzen
⚠️ Sichere Backups der Zertifikate erstellen

## Für Entwicklung (Self-Signed Certificate):

Sie können ein selbstsigniertes Zertifikat für Tests erstellen:

```bash
# Private Key generieren
openssl genrsa -out private.key 2048

# Certificate Signing Request erstellen
openssl req -new -key private.key -out certificate.csr

# Selbstsigniertes Zertifikat erstellen (1 Jahr gültig)
openssl x509 -req -days 365 -in certificate.csr -signkey private.key -out certificate.crt
```

## Für Produktion:

Erhalten Sie ein gültiges SSL-Zertifikat von:
- Let's Encrypt (kostenlos)
- DigiCert, GlobalSign, etc. (kostenpflichtig)
- Ihr Hosting-Provider

## Dateiberechtigungen (Linux/macOS):

```bash
chmod 600 private.key
chmod 644 certificate.crt
chmod 644 ca_bundle.crt
```

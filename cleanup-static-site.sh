#!/usr/bin/env zsh
# Cleanup Script: Entfernt alle Backend/CMS/Node Artefakte für die reine statische Seite.
# Ausführung:  zsh cleanup-static-site.sh
# Sicherer Modus: Erst DRY_RUN=true lassen und prüfen. Dann auf false setzen.

set -euo pipefail

DRY_RUN=true   # Auf false setzen um wirklich zu löschen
BACKUP=true     # Falls true: Dateien vor Löschung in backup/ verschieben

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="backup-removed-${TIMESTAMP}"

FILES=(
  server.js
  script.js
  cms-admin-enhanced.js
  cms-admin-styles.css
  CODEBASE_OVERVIEW.md
  RUECKMELDUNG.md
  SECURITY_FIXES.md
  SSL_SETUP.md
  package.json
  package-lock.json
  .env
)
DIRS=(
  cms-data
  lib
  node_modules
)

echo "=== Static Cleanup Start ==="

echo "Dry Run: $DRY_RUN"

echo "Prüfe vorhandene Ziele..."

EXISTING_FILES=()
for f in $FILES; do
  [[ -f $f ]] && EXISTING_FILES+=$f
done

EXISTING_DIRS=()
for d in $DIRS; do
  [[ -d $d ]] && EXISTING_DIRS+=$d
done

echo "Dateien die entfernt werden: $EXISTING_FILES"
echo "Ordner die entfernt werden:  $EXISTING_DIRS"

if $DRY_RUN; then
  echo "DRY_RUN aktiv – nichts wird gelöscht. Passe DRY_RUN=false an, um zu löschen."
  exit 0
fi

if $BACKUP; then
  mkdir -p "$BACKUP_DIR"
  echo "Backup Ordner: $BACKUP_DIR"
  for f in $EXISTING_FILES; do
    mv "$f" "$BACKUP_DIR/"
  done
  for d in $EXISTING_DIRS; do
    mv "$d" "$BACKUP_DIR/"
  done
  echo "Backup abgeschlossen."
else
  echo "Kein Backup – endgültige Entfernung."  
  for f in $EXISTING_FILES; do
    rm -f "$f"
  done
  for d in $EXISTING_DIRS; do
    rm -rf "$d"
  done
fi

echo "Aufräumen abgeschlossen. Verbleibende Dateien:"
ls -1

echo "Hinweis: Du kannst den Backup-Ordner später manuell löschen, wenn alles passt." 

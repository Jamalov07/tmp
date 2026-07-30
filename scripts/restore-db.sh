#!/usr/bin/env bash
# Host PostgreSQL restore (PM2 app — no Docker)
set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/backup-common.sh"

cd "$PROJECT_DIR"

load_env "$PROJECT_DIR"
init_backup_config "$PROJECT_DIR"
CURRENT_LOG="$RESTORE_LOG"
ensure_dirs

trap 'unset PGPASSWORD || true' EXIT

usage() {
  cat <<EOF
Usage:
  $0 <backup-file.sql.gz>          Restore from local file
  $0 --from-remote <filename>      Download from Google Drive and restore
  $0 --list                        List local backups
  $0 --list-remote                 List remote backups on Google Drive
  $0 --dry-run <backup-file>       Show what would be restored (no changes)
  $0 --verbose ...                 Verbose logging

Examples:
  $0 backups/backup-2026-07-29_02-00-01.sql.gz
  $0 --from-remote backup-2026-07-29_02-00-01.sql.gz
EOF
}

DRY_RUN_RESTORE=false
ACTION=""
TARGET=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN_RESTORE=true; shift ;;
    --verbose|-v) VERBOSE=true; shift ;;
    --list) ACTION=list; shift ;;
    --list-remote) ACTION=list-remote; shift ;;
    --from-remote)
      ACTION=from-remote
      TARGET="${2:-}"
      [[ -n "$TARGET" ]] || { usage; exit 1; }
      shift 2
      ;;
    -h|--help) usage; exit 0 ;;
    -*)
      echo "Unknown option: $1" >&2
      usage
      exit 1
      ;;
    *)
      ACTION=local
      TARGET="$1"
      shift
      ;;
  esac
done

resolve_backup_file() {
  local input="$1"

  if [[ -f "$input" ]]; then
    echo "$input"
    return
  fi

  if [[ -f "$BACKUP_DIR/$input" ]]; then
    echo "$BACKUP_DIR/$input"
    return
  fi

  log_error "Backup file not found: $input"
  exit 1
}

download_remote_backup() {
  local filename="$1"
  local destination="$BACKUP_DIR/$filename"

  rclone_is_ready || exit 1

  if [[ -f "$destination" ]]; then
    log_info "Local copy already exists: $destination"
    echo "$destination"
    return
  fi

  log_info "Downloading $filename from $RCLONE_REMOTE"
  if [[ "$DRY_RUN_RESTORE" == "true" ]]; then
    log_info "[dry-run] Would download $RCLONE_REMOTE/$filename"
    echo "$destination"
    return
  fi

  rclone copy "$RCLONE_REMOTE/$filename" "$BACKUP_DIR/" --log-level INFO
  if [[ ! -f "$destination" ]]; then
    log_error "Download failed — file not found after rclone copy: $destination"
    exit 1
  fi
  echo "$destination"
}

verify_restore() {
  log_info "Verifying database connectivity..."
  if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1" | grep -q 1; then
    log_ok "Restore verification OK (SELECT 1 succeeded)"
  else
    log_error "Restore verification failed"
    exit 1
  fi
}

restore_backup() {
  local backup_file="$1"

  if [[ ! -f "$backup_file" && "$DRY_RUN_RESTORE" != "true" ]]; then
    log_error "Backup file missing: $backup_file"
    exit 1
  fi

  require_pg_tools || exit 1

  if ! db_is_reachable; then
    log_error "PostgreSQL not reachable at $DB_HOST:$DB_PORT"
    exit 1
  fi

  local size_human="n/a"
  if [[ -f "$backup_file" ]]; then
    size_human="$(human_size "$(wc -c <"$backup_file" | tr -d ' ')")"
  fi

  log_info "Restore target : $backup_file"
  log_info "Database       : $DB_NAME @ $DB_HOST:$DB_PORT"
  log_info "Size           : $size_human"
  log_info "PM2 app        : $PM2_APP_NAME"

  if [[ "$DRY_RUN_RESTORE" == "true" ]]; then
    log_warn "[dry-run] Would: pm2 stop → gunzip | psql → pm2 start"
    return 0
  fi

  pm2_stop_app

  local restore_ok=0
  log_info "Restoring database..."
  if gunzip -c "$backup_file" | psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1; then
    restore_ok=1
  fi

  pm2_start_app

  if [[ $restore_ok -ne 1 ]]; then
    {
      echo ""
      echo "[$(date '+%Y-%m-%d %H:%M:%S')]"
      echo "Database : $DB_NAME"
      echo "Backup   : $(basename "$backup_file")"
      echo "Status   : FAILED"
      echo ""
    } >>"$RESTORE_LOG"
    log_error "Restore failed"
    exit 1
  fi

  verify_restore

  {
    echo ""
    echo "[$(date '+%Y-%m-%d %H:%M:%S')]"
    echo "Database : $DB_NAME"
    echo "Backup   : $(basename "$backup_file")"
    echo "Size     : $size_human"
    echo "Status   : SUCCESS"
    echo ""
  } >>"$RESTORE_LOG"

  log_ok "Restore completed successfully."
}

case "${ACTION:-}" in
  list)
    log_info "Local backups in $BACKUP_DIR:"
    ls -lh "$BACKUP_DIR"/*.sql.gz 2>/dev/null || log_warn "No local backups found"
    ;;
  list-remote)
    rclone_is_ready || exit 1
    log_info "Remote backups at $RCLONE_REMOTE:"
    rclone lsl "$RCLONE_REMOTE/" 2>/dev/null || log_warn "Remote backup list unavailable"
    ;;
  from-remote)
    backup_file="$(download_remote_backup "$TARGET")"
    restore_backup "$backup_file"
    ;;
  local)
    backup_file="$(resolve_backup_file "$TARGET")"
    restore_backup "$backup_file"
    ;;
  *)
    usage
    exit 1
    ;;
esac

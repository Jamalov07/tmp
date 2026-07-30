#!/usr/bin/env bash
# Shared helpers for host PostgreSQL + PM2 backups (tmp project)
# shellcheck disable=SC2034

# ─── Colors ──────────────────────────────────────────────────────────────────
if [[ -t 1 ]] && [[ "${NO_COLOR:-}" != "1" ]]; then
  C_RESET=$'\033[0m'
  C_RED=$'\033[0;31m'
  C_GREEN=$'\033[0;32m'
  C_YELLOW=$'\033[0;33m'
  C_BLUE=$'\033[0;34m'
  C_CYAN=$'\033[0;36m'
  C_BOLD=$'\033[1m'
else
  C_RESET='' C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_CYAN='' C_BOLD=''
fi

# ─── Config ──────────────────────────────────────────────────────────────────
load_env() {
  local project_dir="$1"
  if [[ -f "$project_dir/.env" ]]; then
    set -a
    # shellcheck disable=SC1091
    source "$project_dir/.env"
    set +a
  fi
}

# Parse postgres://user:pass@host:port/dbname (also postgresql://)
parse_database_url() {
  local url="${1:-}"
  [[ -n "$url" ]] || return 1

  # Strip scheme
  local rest="${url#postgres://}"
  rest="${rest#postgresql://}"

  local creds hostport_and_db hostport db
  creds="${rest%%@*}"
  hostport_and_db="${rest#*@}"
  hostport="${hostport_and_db%%/*}"
  db="${hostport_and_db#*/}"
  db="${db%%\?*}" # drop query string

  if [[ "$creds" == *:* ]]; then
    PARSED_DB_USER="${creds%%:*}"
    PARSED_DB_PASSWORD="${creds#*:}"
    # URL-decode common escapes (e.g. %40 -> @)
    PARSED_DB_PASSWORD="$(printf '%b' "${PARSED_DB_PASSWORD//%/\\x}")"
  else
    PARSED_DB_USER="$creds"
    PARSED_DB_PASSWORD=""
  fi

  if [[ "$hostport" == *:* ]]; then
    PARSED_DB_HOST="${hostport%%:*}"
    PARSED_DB_PORT="${hostport##*:}"
  else
    PARSED_DB_HOST="$hostport"
    PARSED_DB_PORT="5432"
  fi
  PARSED_DB_NAME="$db"
}

init_backup_config() {
  local project_dir="$1"

  PROJECT_NAME="$(basename "$project_dir")"
  LOCAL_RETENTION_DAYS=7
  REMOTE_RETENTION_DAYS=30

  # Prefer explicit DB_* ; else parse DATABASE_URL
  if [[ -n "${DATABASE_URL:-}" ]]; then
    parse_database_url "$DATABASE_URL" || true
  fi

  DB_HOST="${DB_HOST:-${PARSED_DB_HOST:-127.0.0.1}}"
  DB_PORT="${DB_PORT:-${PARSED_DB_PORT:-5432}}"
  DB_USER="${DB_USER:-${PARSED_DB_USER:-postgres}}"
  DB_PASSWORD="${DB_PASSWORD:-${PARSED_DB_PASSWORD:-}}"
  DB_NAME="${DB_NAME:-${PARSED_DB_NAME:-tmp}}"

  # PM2 process name (restore paytida stop/start)
  PM2_APP_NAME="${PM2_APP_NAME:-$PROJECT_NAME}"

  BACKUP_DIR="${BACKUP_DIR:-$project_dir/backups}"
  LOG_DIR="${LOG_DIR:-$project_dir/logs}"
  BACKUP_LOG="${BACKUP_LOG:-$LOG_DIR/backup.log}"
  RESTORE_LOG="${RESTORE_LOG:-$LOG_DIR/restore.log}"
  LOCK_FILE="${LOCK_FILE:-$LOG_DIR/backup.lock}"

  RCLONE_REMOTE="${RCLONE_REMOTE:-gdrive:${PROJECT_NAME}/backups}"
  RCLONE_ENABLED="${RCLONE_ENABLED:-true}"

  BOT_TOKEN="${BOT_TOKEN:-}"
  BACKUP_CHANNEL_ID="${BACKUP_CHANNEL_ID:-}"
  TELEGRAM_ENABLED="${TELEGRAM_ENABLED:-true}"

  MIN_FREE_MB="${MIN_FREE_MB:-500}"
  LOG_MAX_BYTES="${LOG_MAX_BYTES:-10485760}"
  DRY_RUN="${DRY_RUN:-false}"
  VERBOSE="${VERBOSE:-false}"

  export PGPASSWORD="$DB_PASSWORD"
}

ensure_dirs() {
  mkdir -p "$BACKUP_DIR" "$LOG_DIR"
}

# ─── Logging ─────────────────────────────────────────────────────────────────
rotate_log_if_needed() {
  local log_file="$1"
  [[ -f "$log_file" ]] || return 0
  local size
  size="$(wc -c <"$log_file" | tr -d ' ')"
  if (( size >= LOG_MAX_BYTES )); then
    local rotated="${log_file}.$(date +%Y%m%d_%H%M%S)"
    mv "$log_file" "$rotated"
    gzip -f "$rotated" 2>/dev/null || true
    find "$(dirname "$log_file")" -name "$(basename "$log_file").*.gz" -type f \
      | sort -r | tail -n +6 | xargs -r rm -f
  fi
}

_log_to_file() {
  local log_file="$1"
  shift
  rotate_log_if_needed "$log_file"
  printf '%s\n' "$*" >>"$log_file"
}

log_info() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "${C_CYAN}${msg}${C_RESET}"
  if [[ -n "${CURRENT_LOG:-}" ]]; then
    _log_to_file "$CURRENT_LOG" "$msg"
  fi
}

log_ok() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] $*"
  echo "${C_GREEN}${msg}${C_RESET}"
  if [[ -n "${CURRENT_LOG:-}" ]]; then
    _log_to_file "$CURRENT_LOG" "$msg"
  fi
}

log_warn() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] WARNING: $*"
  echo "${C_YELLOW}${msg}${C_RESET}" >&2
  if [[ -n "${CURRENT_LOG:-}" ]]; then
    _log_to_file "$CURRENT_LOG" "$msg"
  fi
}

log_error() {
  local msg="[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*"
  echo "${C_RED}${msg}${C_RESET}" >&2
  if [[ -n "${CURRENT_LOG:-}" ]]; then
    _log_to_file "$CURRENT_LOG" "$msg"
  fi
}

log_verbose() {
  if [[ "$VERBOSE" == "true" ]]; then
    log_info "$*"
  fi
}

# ─── Utilities ───────────────────────────────────────────────────────────────
human_size() {
  local bytes="$1"
  if command -v numfmt >/dev/null 2>&1; then
    numfmt --to=iec --suffix=B "$bytes"
  else
    awk -v b="$bytes" 'BEGIN {
      split("B KB MB GB TB", u, " ")
      i = 1
      while (b >= 1024 && i < 5) { b /= 1024; i++ }
      printf "%.1f %s", b, u[i]
    }'
  fi
}

seconds_since() {
  local start="$1"
  echo $(( $(date +%s) - start ))
}

check_disk_space() {
  local path="$1"
  local min_mb="${2:-$MIN_FREE_MB}"
  local avail_kb
  avail_kb="$(df -Pk "$path" | awk 'NR==2 {print $4}')"
  local avail_mb=$(( avail_kb / 1024 ))
  log_verbose "Free disk space on $path: ${avail_mb} MB (min required: ${min_mb} MB)"
  if (( avail_mb < min_mb )); then
    log_error "Insufficient disk space: ${avail_mb} MB free, need at least ${min_mb} MB"
    return 1
  fi
}

require_pg_tools() {
  local missing=0
  for cmd in pg_dump psql gzip; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      log_error "Required command not found: $cmd"
      missing=1
    fi
  done
  return "$missing"
}

db_is_reachable() {
  if command -v pg_isready >/dev/null 2>&1; then
    pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1
    return $?
  fi
  psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT 1" >/dev/null 2>&1
}

# ─── PM2 ─────────────────────────────────────────────────────────────────────
pm2_stop_app() {
  if ! command -v pm2 >/dev/null 2>&1; then
    log_warn "pm2 not found — skipping app stop"
    return 0
  fi
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    log_info "Stopping PM2 app '$PM2_APP_NAME'..."
    pm2 stop "$PM2_APP_NAME" >/dev/null
  else
    log_warn "PM2 app '$PM2_APP_NAME' not found — continue without stop"
  fi
}

pm2_start_app() {
  if ! command -v pm2 >/dev/null 2>&1; then
    log_warn "pm2 not found — skipping app start"
    return 0
  fi
  if pm2 describe "$PM2_APP_NAME" >/dev/null 2>&1; then
    log_info "Starting PM2 app '$PM2_APP_NAME'..."
    pm2 start "$PM2_APP_NAME" >/dev/null
  else
    log_warn "PM2 app '$PM2_APP_NAME' not found — start manually if needed"
  fi
}

# ─── Lock ────────────────────────────────────────────────────────────────────
acquire_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    local old_pid
    old_pid="$(cat "$LOCK_FILE" 2>/dev/null || true)"
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
      log_error "Another backup is already running (PID $old_pid). Lock: $LOCK_FILE"
      return 1
    fi
    log_warn "Stale lock file found (PID $old_pid). Removing."
    rm -f "$LOCK_FILE"
  fi
  echo $$ >"$LOCK_FILE"
}

release_lock() {
  if [[ -f "$LOCK_FILE" ]]; then
    local lock_pid
    lock_pid="$(cat "$LOCK_FILE" 2>/dev/null || true)"
    if [[ "$lock_pid" == "$$" ]]; then
      rm -f "$LOCK_FILE"
    fi
  fi
}

# ─── Telegram ────────────────────────────────────────────────────────────────
send_telegram() {
  local status="$1"
  local size_human="$2"
  local reason="${3:-}"

  if [[ "$TELEGRAM_ENABLED" != "true" ]]; then
    log_verbose "Telegram notifications disabled."
    return 0
  fi

  if [[ -z "$BOT_TOKEN" || -z "$BACKUP_CHANNEL_ID" ]]; then
    log_warn "Telegram skipped: BOT_TOKEN or BACKUP_CHANNEL_ID not set."
    return 0
  fi

  local emoji
  if [[ "$status" == "SUCCESS" ]]; then
    emoji="✅"
  else
    emoji="❌"
  fi

  local text
  text="$(cat <<EOF
${emoji} *PostgreSQL Backup*

*Project:* \`${PROJECT_NAME}\`
*Database:* \`${DB_NAME}\`
*Status:* *${status}*
*Size:* ${size_human}
*Host:* \`$(hostname)\`
*Time:* $(date '+%Y-%m-%d %H:%M:%S')
EOF
)"

  if [[ -n "$reason" ]]; then
    text+=$'\n'"*Reason:* \`${reason}\`"
  fi

  if [[ "$DRY_RUN" == "true" ]]; then
    log_info "[dry-run] Would send Telegram notification: $status / $size_human"
    return 0
  fi

  local response http_code
  response="$(curl -sS -w '\n%{http_code}' -X POST \
    "https://api.telegram.org/bot${BOT_TOKEN}/sendMessage" \
    --data-urlencode "chat_id=${BACKUP_CHANNEL_ID}" \
    --data-urlencode "text=${text}" \
    --data-urlencode "parse_mode=Markdown" \
    --data-urlencode "disable_web_page_preview=true" \
    2>&1)" || true

  http_code="$(echo "$response" | tail -n1)"
  if [[ "$http_code" != "200" ]]; then
    log_warn "Telegram send failed (HTTP $http_code). Check BOT_TOKEN / BACKUP_CHANNEL_ID / bot membership."
    return 0
  fi
  log_verbose "Telegram notification sent."
}

# ─── rclone ──────────────────────────────────────────────────────────────────
rclone_remote_name() {
  echo "${RCLONE_REMOTE%%:*}"
}

rclone_is_ready() {
  if ! command -v rclone >/dev/null 2>&1; then
    log_error "rclone not found. Install: https://rclone.org/install/"
    return 1
  fi
  local remote
  remote="$(rclone_remote_name)"
  if ! rclone config show "$remote" >/dev/null 2>&1; then
    log_error "rclone remote '$remote' is not configured. Run: rclone config"
    return 1
  fi
}

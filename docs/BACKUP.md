# Database Backup va Restore (tmp — host PostgreSQL + PM2)

Bu loyiha **Docker emas**: app **PM2**, baza VPS dagi **host PostgreSQL**.

Ulanish `.env` dagi `DATABASE_URL` dan olinadi:

```env
DATABASE_URL=postgres://user:password@127.0.0.1:5432/tmp
```

## Talablar

- VPS da `postgresql-client` (`pg_dump`, `psql`, `pg_isready`)
- Ishlayotgan PostgreSQL
- [rclone](https://rclone.org/) + Google Drive remote
- Telegram: `BOT_TOKEN` + `BACKUP_CHANNEL_ID`
- (Restore uchun) `pm2`

```bash
# Debian/Ubuntu
sudo apt install -y postgresql-client
```

## Tez sozlash

### 1. rclone

```bash
rclone config   # remote: gdrive (yoki boshqa VPS dan rclone.conf ko'chirish)
rclone mkdir gdrive:tmp/backups
```

### 2. `.env`

Asosiy `DATABASE_URL` bo'lishi shart. Qo'shimcha:

```env
RCLONE_REMOTE=gdrive:tmp/backups
RCLONE_ENABLED=true
TELEGRAM_ENABLED=true
BACKUP_CHANNEL_ID=-100xxxxxxxxx
PM2_APP_NAME=tmp
```

`PROJECT_NAME` = papka nomi (`tmp`). Retention: lokal 7 kun, Drive 30 kun.

### 3. Tekshiruv

```bash
chmod +x scripts/backup-db.sh scripts/restore-db.sh scripts/install-backup-cron.sh

./scripts/backup-db.sh --dry-run --verbose
./scripts/backup-db.sh --verbose
```

### 4. Cron (har kuni 02:00)

```bash
./scripts/install-backup-cron.sh
crontab -l
```

## Farqi (Docker loyihalardan)

| | ramz / kas / jas | **tmp** |
|--|------------------|---------|
| App | Docker Compose | **PM2** |
| DB | `docker compose exec db pg_dump` | **host `pg_dump`** |
| Config | `DB_USER` / `DB_NAME` | **`DATABASE_URL`** |
| Restore | `docker compose stop app` | **`pm2 stop` / `start`** |

## Restore

```bash
./scripts/restore-db.sh --list
./scripts/restore-db.sh backups/backup-2026-07-29_02-00-01.sql.gz

./scripts/restore-db.sh --list-remote
./scripts/restore-db.sh --from-remote backup-2026-07-29_02-00-01.sql.gz
```

Restore paytida PM2 app (`PM2_APP_NAME`) vaqtincha to'xtatiladi.

## Loglar

```bash
tail -f logs/backup.log
tail -f logs/restore.log
tail -f logs/cron-backup.log
```

## Muammolarni hal qilish

| Muammo | Yechim |
|--------|--------|
| `pg_dump: command not found` | `sudo apt install postgresql-client` |
| `PostgreSQL not reachable` | `DATABASE_URL`, `pg_isready -h 127.0.0.1` |
| Auth failed | `DATABASE_URL` dagi user/password |
| `rclone remote is not configured` | `rclone config` yoki conf ko'chirish |
| PM2 topilmadi | `pm2 list`, `PM2_APP_NAME` ni tekshiring |

## Papka strukturasi

```text
tmp/
├── backups/
├── logs/
├── scripts/
│   ├── backup-db.sh
│   ├── restore-db.sh
│   ├── install-backup-cron.sh
│   └── lib/backup-common.sh
├── .env
└── .env.backup.example
```

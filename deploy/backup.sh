#!/usr/bin/env bash
#
# بکاپ روزانه از دیتابیس و تصاویر آپلودشده.
#
# نصب در کرون (با root):
#   crontab -e
#   30 3 * * * /var/www/amorz/deploy/backup.sh >> /var/log/amorz-backup.log 2>&1

set -euo pipefail

APP_DIR="/var/www/amorz"
DEST="/var/backups/amorz"
KEEP_DAYS=14
STAMP="$(date +%Y-%m-%d_%H%M)"
DB_NAME="${MONGODB_DB:-amorz}"

mkdir -p "$DEST"

echo "[$(date '+%F %T')] شروع بکاپ"

# ---------- دیتابیس ----------
mongodump --db "$DB_NAME" --archive="${DEST}/db-${STAMP}.archive.gz" --gzip --quiet
echo "  ✔ دیتابیس: db-${STAMP}.archive.gz"

# ---------- تصاویر آپلودشده ----------
if [[ -d "${APP_DIR}/public/uploads" ]]; then
  tar -czf "${DEST}/uploads-${STAMP}.tar.gz" -C "${APP_DIR}/public" uploads
  echo "  ✔ تصاویر: uploads-${STAMP}.tar.gz"
fi

# ---------- فایل تنظیمات ----------
[[ -f "${APP_DIR}/.env" ]] && cp "${APP_DIR}/.env" "${DEST}/env-${STAMP}.bak"

# ---------- پاک کردن بکاپ‌های قدیمی ----------
find "$DEST" -maxdepth 1 -type f -mtime "+${KEEP_DAYS}" -delete
echo "  ✔ بکاپ‌های قدیمی‌تر از ${KEEP_DAYS} روز حذف شدند"

echo "[$(date '+%F %T')] پایان بکاپ — حجم کل: $(du -sh "$DEST" | cut -f1)"

# ---------------------------------------------------------------
# بازگردانی:
#   mongorestore --db amorz --archive=/var/backups/amorz/db-XXX.archive.gz --gzip --drop
#   tar -xzf /var/backups/amorz/uploads-XXX.tar.gz -C /var/www/amorz/public
# ---------------------------------------------------------------

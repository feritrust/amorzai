#!/usr/bin/env bash
#
# دیپلوی نسخه جدید از مخزن Git.
# اجرا با کاربر amorz:   cd /var/www/amorz && ./deploy/deploy.sh
#
# اگر بیلد شکست بخورد، نسخه قبلی بدون قطعی سرو می‌شود (rollback خودکار).

set -euo pipefail

APP_DIR="/var/www/amorz"
BRANCH="${1:-main}"
BACKUP_DIR="/var/backups/amorz/next-previous"

log()  { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1"; exit 1; }

# اجرا با root باعث می‌شود پوشه .next و node_modules مالک root شوند و بعد
# سرویس (که با کاربر amorz اجرا می‌شود) نتواند کش ISR را بنویسد.
if [[ $EUID -eq 0 ]]; then
  fail "این اسکریپت را با root اجرا نکنید. به‌جایش:  sudo -u amorz -H bash -c 'cd $APP_DIR && bash deploy/deploy.sh'"
fi

cd "$APP_DIR" || fail "پوشه $APP_DIR پیدا نشد"
[[ -f .env ]] || fail "فایل .env وجود ندارد"

log "دریافت آخرین تغییرات از شاخه ${BRANCH}"
git fetch --prune origin
git checkout -B "$BRANCH" "origin/${BRANCH}"
git reset --hard "origin/${BRANCH}"

# devDependencies برای بیلد لازم است (tailwind و postcss)، پس حذفشان نمی‌کنیم
log "نصب وابستگی‌ها"
if [[ -f package-lock.json ]]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

log "نگه‌داشتن نسخه قبلی برای بازگشت اضطراری"
rm -rf "$BACKUP_DIR"
[[ -d .next ]] && cp -r .next "$BACKUP_DIR"

log "بیلد پروداکشن"
if ! npm run build; then
  if [[ -d "$BACKUP_DIR" ]]; then
    rm -rf .next && mv "$BACKUP_DIR" .next
    fail "بیلد ناموفق بود — نسخه قبلی برگردانده شد و سایت بالا ماند"
  fi
  fail "بیلد ناموفق بود"
fi

log "راه‌اندازی مجدد سرویس"
sudo systemctl restart amorz

sleep 4
for i in 1 2 3 4 5; do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ || true)
  [[ "$code" == "200" ]] && break
  sleep 3
done

if [[ "${code:-}" == "200" ]]; then
  log "دیپلوی موفق بود — سایت پاسخ می‌دهد (HTTP 200)"
  rm -rf "$BACKUP_DIR"
else
  fail "سرویس بالا نیامد. لاگ:  journalctl -u amorz -n 50 --no-pager"
fi

log "خلاصه"
git --no-pager log -1 --pretty='  کامیت: %h — %s (%an، %ar)'

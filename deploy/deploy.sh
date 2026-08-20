#!/usr/bin/env bash
#
# دیپلوی نسخه جدید از مخزن Git.
#
#   sudo -u amorz -H bash -c 'cd /var/www/amorz && ./deploy/deploy.sh'
#
# اگر بیلد شکست بخورد، نسخه قبلی برگردانده می‌شود و سایت پایین نمی‌آید.
#
# نکته فنی: این اسکریپت خودش را هم از گیت به‌روز می‌کند. چون bash فایل اسکریپت را
# در حال اجرا می‌خواند، بعد از pull خودش را دوباره اجرا (exec) می‌کند تا از آن به
# بعد نسخه جدید اجرا شود، نه نسخه‌ای که در حافظه مانده.

set -euo pipefail

APP_DIR="/var/www/amorz"
BRANCH="${1:-main}"
BACKUP_DIR="/var/backups/amorz/next-previous"

log()  { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$1"; }
fail() { printf '\n\033[1;31m✖ %s\033[0m\n' "$1"; exit 1; }

# اجرا با root باعث می‌شود .next و node_modules مالک root شوند و بعد سرویس
# (که با کاربر amorz اجرا می‌شود) نتواند کش ISR را بنویسد.
if [[ $EUID -eq 0 ]]; then
  fail "این اسکریپت را با root اجرا نکنید. به‌جایش:  sudo -u amorz -H bash -c 'cd $APP_DIR && ./deploy/deploy.sh'"
fi

cd "$APP_DIR" || fail "پوشه $APP_DIR پیدا نشد"
[[ -f .env ]] || fail "فایل .env وجود ندارد"

# ---------------------------------------------------------------- مرحله ۱: pull
if [[ "${AMORZ_DEPLOY_STAGE2:-0}" != "1" ]]; then
  log "دریافت آخرین تغییرات از شاخه ${BRANCH}"
  git fetch --prune origin
  git checkout -B "$BRANCH" "origin/${BRANCH}"
  git reset --hard "origin/${BRANCH}"

  # از اینجا به بعد با نسخه تازه‌ی همین اسکریپت ادامه می‌دهیم
  export AMORZ_DEPLOY_STAGE2=1
  exec bash "$APP_DIR/deploy/deploy.sh" "$BRANCH"
fi

# ---------------------------------------------------------------- مرحله ۲: بیلد
# devDependencies برای بیلد لازم است (tailwind و postcss)، پس حذفشان نمی‌کنیم
log "نصب وابستگی‌ها"
if [[ -f package-lock.json ]]; then
  npm ci --no-audit --no-fund
else
  npm install --no-audit --no-fund
fi

log "نگه‌داشتن نسخه قبلی برای بازگشت اضطراری"
HAVE_BACKUP=0
if mkdir -p "$(dirname "$BACKUP_DIR")" 2>/dev/null && [[ -w "$(dirname "$BACKUP_DIR")" ]]; then
  rm -rf "$BACKUP_DIR"
  if [[ -d .next ]] && cp -r .next "$BACKUP_DIR" 2>/dev/null; then
    HAVE_BACKUP=1
    echo "  بکاپ در $BACKUP_DIR"
  fi
fi
if [[ $HAVE_BACKUP -eq 0 ]]; then
  warn "بکاپ نسخه قبلی گرفته نشد — در صورت شکست بیلد، بازگشت خودکار انجام نمی‌شود"
  warn "برای فعال شدنش یک بار با root:  mkdir -p /var/backups/amorz && chown amorz:amorz /var/backups/amorz"
fi

log "بیلد پروداکشن"
if ! npm run build; then
  if [[ $HAVE_BACKUP -eq 1 ]]; then
    rm -rf .next && mv "$BACKUP_DIR" .next
    fail "بیلد ناموفق بود — نسخه قبلی برگردانده شد و سایت بالا ماند"
  fi
  fail "بیلد ناموفق بود"
fi

log "راه‌اندازی مجدد سرویس"
# -n یعنی هرگز رمز نپرس؛ اگر قانون sudoers نباشد، به‌جای معطل ماندن پشت
# پرامپت رمز، پیام روشن می‌دهیم. بیلد جدید از قبل روی دیسک است.
if ! sudo -n systemctl restart amorz 2>/dev/null; then
  warn "اجازه ری‌استارت بدون رمز وجود ندارد و سرویس ری‌استارت نشد."
  warn "بیلد جدید آماده است؛ فقط با root این را بزنید:  systemctl restart amorz"
  warn ""
  warn "برای اینکه دفعه بعد خودکار انجام شود، یک بار با root:"
  warn "  printf 'amorz ALL=(root) NOPASSWD: /usr/bin/systemctl restart amorz, /usr/bin/systemctl status amorz, /usr/bin/systemctl reload nginx\\n' > /etc/sudoers.d/amorz"
  warn "  chmod 440 /etc/sudoers.d/amorz"
  exit 1
fi

code=""
sleep 4
for _ in 1 2 3 4 5; do
  code=$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3000/ || true)
  [[ "$code" == "200" ]] && break
  sleep 3
done

if [[ "$code" == "200" ]]; then
  log "دیپلوی موفق بود — سایت پاسخ می‌دهد (HTTP 200)"
  [[ $HAVE_BACKUP -eq 1 ]] && rm -rf "$BACKUP_DIR"
else
  fail "سرویس بالا نیامد. لاگ:  journalctl -u amorz -n 50 --no-pager"
fi

log "خلاصه"
git --no-pager log -1 --pretty='  کامیت: %h — %s (%an، %ar)'
echo

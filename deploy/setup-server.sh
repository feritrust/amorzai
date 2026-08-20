#!/usr/bin/env bash
#
# آماده‌سازی سرور Ubuntu 24.04 برای اجرای آمرز
# اجرا با کاربر root:   bash setup-server.sh
#
# این اسکریپت idempotent است؛ اجرای دوباره‌اش مشکلی ایجاد نمی‌کند.

set -euo pipefail

APP_USER="amorz"
APP_DIR="/var/www/amorz"
NODE_MAJOR="22"
DOMAIN="amorz.ir"

log()  { printf '\n\033[1;32m▸ %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m! %s\033[0m\n' "$1"; }

if [[ $EUID -ne 0 ]]; then
  echo "این اسکریپت باید با کاربر root اجرا شود." >&2
  exit 1
fi

# ---------------------------------------------------------------- پایه
log "به‌روزرسانی سیستم و نصب ابزارهای پایه"
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl gnupg ca-certificates lsb-release ufw fail2ban \
  git rsync unzip htop tzdata

timedatectl set-timezone Asia/Tehran || warn "تنظیم تایم‌زون انجام نشد"

# ---------------------------------------------------------------- Node.js
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -c2-3)" -lt "$NODE_MAJOR" ]]; then
  log "نصب Node.js ${NODE_MAJOR}"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y -qq nodejs
else
  log "Node.js از قبل نصب است: $(node -v)"
fi

# ---------------------------------------------------------------- MongoDB
if ! command -v mongod >/dev/null 2>&1; then
  log "نصب MongoDB 8"
  curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc \
    | gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg --dearmor --yes
  echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu noble/mongodb-org/8.0 multiverse" \
    > /etc/apt/sources.list.d/mongodb-org-8.0.list
  apt-get update -qq
  apt-get install -y -qq mongodb-org
else
  log "MongoDB از قبل نصب است"
fi

# فقط روی لوکال‌هاست گوش می‌دهد — از بیرون قابل دسترسی نیست
sed -i 's/^\( *bindIp:\).*/\1 127.0.0.1/' /etc/mongod.conf
systemctl enable --now mongod

# ---------------------------------------------------------------- Nginx
if ! command -v nginx >/dev/null 2>&1; then
  log "نصب Nginx"
  apt-get install -y -qq nginx
fi
systemctl enable --now nginx

# ---------------------------------------------------------------- کاربر اپلیکیشن
if ! id -u "$APP_USER" >/dev/null 2>&1; then
  log "ساخت کاربر ${APP_USER}"
  adduser --system --group --home "$APP_DIR" --shell /bin/bash "$APP_USER"
fi
mkdir -p "$APP_DIR" /var/backups/amorz
chown -R "$APP_USER:$APP_USER" "$APP_DIR" /var/backups/amorz

# اجازه ری‌استارت سرویس به کاربر اپلیکیشن، بدون رمز و بدون دسترسی root کامل
cat > /etc/sudoers.d/amorz <<EOF
${APP_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart amorz, /usr/bin/systemctl status amorz, /usr/bin/systemctl reload nginx
EOF
chmod 440 /etc/sudoers.d/amorz

# ---------------------------------------------------------------- فایروال
log "تنظیم فایروال (فقط SSH و IPهای کلادفلر)"
ufw --force reset >/dev/null
ufw default deny incoming >/dev/null
ufw default allow outgoing >/dev/null
ufw allow OpenSSH >/dev/null

# پورت ۸۰ و ۴۴۳ فقط برای رنج IP کلادفلر باز می‌شود تا کسی نتواند
# با زدن مستقیم IP سرور، کلادفلر را دور بزند
for ip in $(curl -fsS https://www.cloudflare.com/ips-v4) $(curl -fsS https://www.cloudflare.com/ips-v6); do
  ufw allow from "$ip" to any port 80,443 proto tcp >/dev/null
done
ufw --force enable >/dev/null
log "فایروال فعال شد"

# ---------------------------------------------------------------- fail2ban
systemctl enable --now fail2ban

# ---------------------------------------------------------------- گواهی SSL کلادفلر
mkdir -p /etc/ssl/cloudflare
chmod 700 /etc/ssl/cloudflare
cat <<'EOF'

──────────────────────────────────────────────────────────────
گام بعدی: گواهی Origin کلادفلر

۱. در پنل کلادفلر → SSL/TLS → Origin Server → Create Certificate
۲. محتوای «Origin Certificate» را در این فایل بگذارید:
     /etc/ssl/cloudflare/amorz.pem
۳. محتوای «Private Key» را در این فایل بگذارید:
     /etc/ssl/cloudflare/amorz.key
۴. سپس:
     chmod 600 /etc/ssl/cloudflare/amorz.key
     systemctl reload nginx

این گواهی ۱۵ سال اعتبار دارد و نیازی به تمدید خودکار ندارد.
──────────────────────────────────────────────────────────────

EOF

log "آماده‌سازی سرور تمام شد"
echo "نسخه‌ها:  node $(node -v) | npm $(npm -v) | mongod $(mongod --version | head -1 | awk '{print $3}')"
echo "دامنه هدف: ${DOMAIN}"

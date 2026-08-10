# راهنمای دیپلوی آمرز روی سرور آلمان + کلادفلر

سرور: Ubuntu 24.04 · دامنه: `amorz.ir` (بدون www) · دیپلوی از مخزن Git

---

## ۰. پیش‌نیاز: پروژه را روی Git بگذارید

روی کامپیوتر خودتان، داخل پوشه پروژه:

```bash
git init
git add .
git commit -m "نسخه اولیه سایت آمرز"
git branch -M main
git remote add origin git@github.com:USERNAME/amorz.git
git push -u origin main
```

> فایل `.env` در `.gitignore` هست و روی گیت نمی‌رود — درست هم همین است.
> مقادیر واقعی را فقط روی سرور می‌گذاریم.

اگر مخزن **خصوصی** است، روی سرور یک کلید SSH بسازید و کلید عمومی را در
GitHub → Settings → Deploy keys اضافه کنید:

```bash
sudo -u amorz ssh-keygen -t ed25519 -C "amorz-server" -f /var/www/amorz/.ssh/id_ed25519 -N ""
sudo -u amorz cat /var/www/amorz/.ssh/id_ed25519.pub
```

---

## ۱. آماده‌سازی سرور

با کاربر root به سرور وصل شوید:

```bash
ssh root@IP-SERVER

# اسکریپت را از مخزن بردارید یا محتوایش را کپی کنید
curl -fsSL https://raw.githubusercontent.com/USERNAME/amorz/main/deploy/setup-server.sh -o setup-server.sh
bash setup-server.sh
```

این اسکریپت نصب می‌کند: **Node.js 22، MongoDB 8، Nginx، UFW، fail2ban** و کاربر `amorz`.
همچنین پورت ۸۰ و ۴۴۳ را **فقط روی IPهای کلادفلر** باز می‌کند تا کسی نتواند با زدن مستقیم
IP سرور، کلادفلر را دور بزند.

---

## ۲. تنظیمات کلادفلر

### ۲.۱ DNS

| نوع | نام | مقصد | پروکسی |
|---|---|---|---|
| A | `amorz.ir` | IP سرور | ☁️ **Proxied** (نارنجی) |
| CNAME | `www` | `amorz.ir` | ☁️ **Proxied** |

در پنل ایرنیک، نیم‌سرورهای دامنه را روی نیم‌سرورهای کلادفلر تنظیم کنید.

### ۲.۲ گواهی Origin

**SSL/TLS → Origin Server → Create Certificate** → گواهی و کلید را روی سرور بگذارید:

```bash
nano /etc/ssl/cloudflare/amorz.pem   # محتوای Origin Certificate
nano /etc/ssl/cloudflare/amorz.key   # محتوای Private Key
chmod 600 /etc/ssl/cloudflare/amorz.key
```

### ۲.۳ تنظیماتی که حتماً باید درست باشند

| بخش | تنظیم | مقدار | چرا |
|---|---|---|---|
| SSL/TLS | Encryption mode | **Full (strict)** | حالت Flexible باعث حلقه ریدایرکت و مشکل امنیتی می‌شود |
| SSL/TLS | Always Use HTTPS | **On** | نسخه http نباید ایندکس شود |
| SSL/TLS | Minimum TLS | **1.2** | — |
| Speed | **Rocket Loader** | **Off** ⚠️ | ترتیب اجرای اسکریپت را عوض می‌کند و hydration ری‌اکت را می‌شکند |
| Speed | Brotli | **On** | — |
| Scrape Shield | Email Obfuscation | **Off** | داخل HTML اسکریپت تزریق می‌کند |
| Security | **Bot Fight Mode** | **Off** ⚠️ | می‌تواند Googlebot را چالش بدهد و کرال را متوقف کند |
| Security | Security Level | **Medium** یا کمتر | حالت "I'm Under Attack" کرال گوگل را کامل می‌بندد |
| Caching | Browser Cache TTL | **Respect Existing Headers** ⚠️ | وگرنه کش ISR نکست بی‌اثر می‌شود و تغییرات پنل دیر اعمال می‌شوند |
| Caching | Tiered Cache | **On** | برای بازدیدکننده ایرانی سرعت بهتری می‌دهد |

### ۲.۴ قانون کش برای پنل و API

**Caching → Cache Rules → Create rule**

- نام: `bypass admin & api`
- شرط: `URI Path starts with /admin` **OR** `URI Path starts with /api`
- عمل: **Bypass cache**

بدون این قانون، ممکن است صفحات پنل برای کاربران دیگر کش شوند.

---

## ۳. آوردن پروژه روی سرور

```bash
sudo -u amorz -H bash
cd /var/www/amorz
git clone git@github.com:USERNAME/amorz.git .
```

### فایل `.env` را بسازید

```bash
nano /var/www/amorz/.env
```

```env
NEXT_PUBLIC_SITE_URL=https://amorz.ir

MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DB=amorz

NEXT_PUBLIC_PHONE=02155005000
NEXT_PUBLIC_MOBILE=09120000000

ADMIN_PASSWORD=یک-رمز-قوی-و-طولانی
ADMIN_SECRET=یک-رشته-تصادفی-۶۴-کاراکتری
SEED_SECRET=یک-رشته-تصادفی-دیگر

GOOGLE_SITE_VERIFICATION=
```

برای ساخت رشته تصادفی:

```bash
openssl rand -hex 32
```

سپس دسترسی فایل را محدود کنید:

```bash
chmod 600 /var/www/amorz/.env
```

### نصب، بیلد و پر کردن دیتابیس

```bash
cd /var/www/amorz
npm install
npm run build
npm run seed        # فقط بار اول
```

---

## ۴. سرویس و Nginx

با کاربر root:

```bash
# سرویس systemd
cp /var/www/amorz/deploy/amorz.service /etc/systemd/system/amorz.service
systemctl daemon-reload
systemctl enable --now amorz
systemctl status amorz --no-pager

# Nginx
cp /var/www/amorz/deploy/proxy-amorz.conf /etc/nginx/proxy-amorz.conf
cp /var/www/amorz/deploy/nginx-amorz.conf /etc/nginx/sites-available/amorz
ln -sf /etc/nginx/sites-available/amorz /etc/nginx/sites-enabled/amorz
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

اجازه خواندن فایل‌های استاتیک برای Nginx:

```bash
chmod o+x /var/www /var/www/amorz
```

---

## ۵. بکاپ خودکار

```bash
chmod +x /var/www/amorz/deploy/*.sh
crontab -e
```

خط زیر را اضافه کنید (هر شب ساعت ۳:۳۰):

```
30 3 * * * /var/www/amorz/deploy/backup.sh >> /var/log/amorz-backup.log 2>&1
```

بکاپ‌ها در `/var/backups/amorz` ذخیره و بعد از ۱۴ روز پاک می‌شوند.
توصیه: هفته‌ای یک‌بار یک نسخه را روی فضای دیگری هم کپی کنید.

---

## ۶. تست نهایی

```bash
curl -I https://amorz.ir                       # باید 200 بدهد
curl -I https://www.amorz.ir                   # باید 301 به amorz.ir
curl -I https://amorz.ir/product/does-not-exist # باید 404 بدهد، نه 200
curl -s https://amorz.ir/robots.txt
curl -s https://amorz.ir/sitemap.xml | head -20
```

سپس در مرورگر:

- `/admin/login` → ورود با `ADMIN_PASSWORD`
- یک محصول تستی بسازید و ببینید بلافاصله در سایت ظاهر می‌شود
- یک تصویر آپلود کنید و بعد از رفرش، هنوز نمایش داده شود

---

## ۷. سرچ کنسول

1. دامنه را در [Google Search Console](https://search.google.com/search-console) ثبت کنید
   (تأیید با رکورد TXT در کلادفلر ساده‌ترین راه است).
2. `sitemap.xml` را ثبت کنید.
3. با ابزار **URL Inspection** چند صفحه را تست کنید — باید «Page is available to Google» بدهد.
4. اگر خواستید از روش تأیید متا تگ استفاده کنید، مقدار را در `GOOGLE_SITE_VERIFICATION` بگذارید
   و یک‌بار `npm run build && sudo systemctl restart amorz` بزنید.

---

## آپدیت‌های بعدی

روی کامپیوتر خودتان `git push` بزنید، بعد روی سرور:

```bash
sudo -u amorz -H bash
cd /var/www/amorz && ./deploy/deploy.sh
```

اسکریپت خودش نسخه قبلی `.next` را نگه می‌دارد؛ اگر بیلد شکست بخورد، **برمی‌گردد به نسخه قبلی
و سایت پایین نمی‌آید**.

---

## عیب‌یابی سریع

| نشانه | علت محتمل | راه‌حل |
|---|---|---|
| خطای ۵۲۱ یا ۵۲۲ کلادفلر | فایروال IP کلادفلر را نمی‌شناسد یا سرویس پایین است | `systemctl status amorz` و `ufw status` |
| حلقه بی‌نهایت ریدایرکت | حالت SSL روی Flexible است | به **Full (strict)** تغییر دهید |
| صفحه لود می‌شود ولی دکمه‌ها کار نمی‌کنند | Rocket Loader روشن است | خاموشش کنید |
| تغییرات پنل در سایت دیده نمی‌شود | کش کلادفلر | Browser Cache TTL روی Respect Existing Headers + یک‌بار Purge Cache |
| آپلود تصویر خطای ۴۱۳ | سقف حجم Nginx | `client_max_body_size` در کانفیگ |
| سایت کند است برای کاربر ایرانی | کش نشدن استاتیک‌ها | Tiered Cache روشن، و بررسی هدر `cf-cache-status` |

مشاهده لاگ زنده اپلیکیشن:

```bash
journalctl -u amorz -f
tail -f /var/log/nginx/amorz.error.log
```

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AUTH_COOKIE, SESSION_MAX_AGE, createToken, passwordMatches } from '@/lib/auth';
import { adminDelete, adminSave, categoryUsage, parseEntityPayload, DbUnavailableError } from '@/lib/adminData';
import { getEntity } from '@/lib/entities';

/* ----------------------------- ورود و خروج ----------------------------- */

export async function loginAction(prevState, formData) {
  const password = formData.get('password');
  const next = String(formData.get('next') || '/admin');

  if (!process.env.ADMIN_PASSWORD) {
    return { error: 'ADMIN_PASSWORD در فایل .env تنظیم نشده است.' };
  }
  if (!passwordMatches(password)) {
    // تأخیر کوتاه برای کند کردن حملات brute force
    await new Promise((r) => setTimeout(r, 600));
    return { error: 'رمز عبور نادرست است.' };
  }

  const token = await createToken();
  (await cookies()).set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next.startsWith('/admin') ? next : '/admin');
}

export async function logoutAction() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect('/admin/login');
}

/* ------------------------------- ذخیره ------------------------------- */

function revalidateFor(entityKey, doc, extra = []) {
  const entity = getEntity(entityKey);
  const paths = new Set([...(entity.revalidate?.(doc) || []), ...extra, '/sitemap.xml']);
  for (const p of paths) {
    try {
      revalidatePath(p);
    } catch {
      /* مسیر ممکن است هنوز ساخته نشده باشد */
    }
  }
}

/**
 * ذخیره رکورد. داده به‌صورت JSON از فرم کلاینت می‌آید تا آرایه‌ها و
 * ساختارهای تودرتو (مشخصات، سوالات متداول) بدون تبدیل عجیب منتقل شوند.
 */
export async function saveEntityAction(entityKey, id, payload) {
  const entity = getEntity(entityKey);
  if (!entity) return { ok: false, errors: { _form: 'موجودیت نامعتبر' } };

  const { values, errors } = parseEntityPayload(entityKey, payload);
  if (Object.keys(errors).length) return { ok: false, errors };

  try {
    const result = await adminSave(entityKey, id, values);
    if (!result.ok) return result;

    revalidateFor(entityKey, result.doc);
    revalidatePath(`/admin/${entityKey}`);

    return { ok: true, id: result.doc._id, slug: result.doc.slug };
  } catch (err) {
    if (err instanceof DbUnavailableError) return { ok: false, errors: { _form: err.message } };
    console.error('[admin:save]', err);
    return { ok: false, errors: { _form: 'ذخیره‌سازی ناموفق بود: ' + err.message } };
  }
}

/* -------------------------------- حذف -------------------------------- */

export async function deleteEntityAction(entityKey, id) {
  const entity = getEntity(entityKey);
  if (!entity) return { ok: false, message: 'موجودیت نامعتبر' };

  try {
    // دسته‌بندی دارای محصول یا خدمت حذف نمی‌شود تا صفحه‌های زنده ۴۰۴ نشوند
    if (entityKey === 'categories') {
      const { adminGet } = await import('@/lib/adminData');
      const target = await adminGet('categories', id);
      if (target) {
        const used = await categoryUsage(target.slug);
        if (used > 0) {
          return {
            ok: false,
            message: `این دسته ${used} محصول یا خدمت دارد. ابتدا آن‌ها را به دسته دیگری منتقل کنید.`,
          };
        }
      }
    }

    const removed = await adminDelete(entityKey, id);
    if (!removed) return { ok: false, message: 'رکورد پیدا نشد' };

    revalidateFor(entityKey, removed);
    revalidatePath(`/admin/${entityKey}`);
    return { ok: true };
  } catch (err) {
    if (err instanceof DbUnavailableError) return { ok: false, message: err.message };
    console.error('[admin:delete]', err);
    return { ok: false, message: 'حذف ناموفق بود' };
  }
}

/** پیش از حذف دسته‌بندی، تعداد آیتم‌های وابسته را برمی‌گرداند */
export async function checkCategoryUsageAction(slug) {
  try {
    return { ok: true, count: await categoryUsage(slug) };
  } catch {
    return { ok: false, count: 0 };
  }
}

/* --------------------------- بازسازی دستی کش --------------------------- */

export async function revalidateAllAction() {
  for (const p of ['/', '/products', '/services', '/categories', '/blog', '/sitemap.xml']) {
    try {
      revalidatePath(p);
    } catch {
      /* ignore */
    }
  }
  return { ok: true, at: new Date().toISOString() };
}

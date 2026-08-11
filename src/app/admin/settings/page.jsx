import EntityForm from '@/components/admin/EntityForm';
import { SETTINGS_ENTITY } from '@/lib/entities';
import { adminGetSettings } from '@/lib/adminData';
import { hasDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  let doc = {};
  let error = null;

  if (hasDatabase()) {
    try {
      doc = await adminGetSettings();
    } catch (e) {
      error = e.message;
    }
  } else {
    error = 'برای ذخیره تنظیمات باید MONGODB_URI تنظیم شود.';
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="mb-1 text-xl font-extrabold">تنظیمات سایت</h1>
        <p className="max-w-3xl text-[13px] leading-7 text-ink-muted">
          شماره تماس، نشانی و شبکه‌های اجتماعی از اینجا در کل سایت — هدر، فوتر، صفحه تماس، دکمه‌های
          تماس و Structured Data — به‌روز می‌شوند. هر فیلدی را خالی بگذارید، مقدار پیش‌فرض پروژه
          استفاده می‌شود.
        </p>
      </header>

      {error ? <p className="rounded-xl bg-gold-100 px-4 py-3 text-[13px] text-gold-600">{error}</p> : null}

      <EntityForm
        entityKey="settings"
        entityLabel="تنظیمات سایت"
        fields={SETTINGS_ENTITY.fields}
        doc={Object.keys(doc).length ? doc : null}
      />
    </div>
  );
}

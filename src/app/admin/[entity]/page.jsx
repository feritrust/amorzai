import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ENTITY_KEYS, getEntity } from '@/lib/entities';
import { adminList } from '@/lib/adminData';
import { hasDatabase } from '@/lib/mongodb';
import DeleteButton from '@/components/admin/DeleteButton';
import { formatPrice, toFa } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const COLUMN_LABELS = {
  title: 'عنوان',
  category: 'دسته‌بندی',
  price: 'قیمت',
  available: 'وضعیت',
  kind: 'نوع',
  order: 'ترتیب',
  status: 'وضعیت',
  publishedAt: 'تاریخ انتشار',
};

function renderCell(col, doc) {
  switch (col) {
    case 'price':
      return formatPrice(doc.price);
    case 'available':
      return doc.available === false ? (
        <span className="chip bg-gold-100 text-gold-600">ناموجود</span>
      ) : (
        <span className="chip">فعال</span>
      );
    case 'kind':
      return doc.kind === 'product' ? 'محصول' : 'خدمت';
    case 'status':
      return doc.status === 'published' ? (
        <span className="chip">منتشرشده</span>
      ) : (
        <span className="chip bg-line/60 text-ink-muted">پیش‌نویس</span>
      );
    case 'publishedAt':
      return doc.publishedAt ? toFa(new Date(doc.publishedAt).toLocaleDateString('fa-IR')) : '—';
    case 'order':
      return toFa(doc.order ?? '');
    default:
      return doc[col] ?? '—';
  }
}

export default async function EntityListPage({ params }) {
  const { entity: entityKey } = await params;
  if (!ENTITY_KEYS.includes(entityKey)) notFound();

  const entity = getEntity(entityKey);

  let docs = [];
  let error = null;
  if (hasDatabase()) {
    try {
      docs = await adminList(entityKey);
    } catch (e) {
      error = e.message;
    }
  } else {
    error = 'برای مدیریت محتوا باید MONGODB_URI تنظیم شود.';
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">{entity.label}</h1>
          <p className="text-[13px] text-ink-muted">
            {error ? '—' : `${toFa(docs.length)} مورد ثبت شده است`}
          </p>
        </div>
        <Link href={`/admin/${entityKey}/new`} className="btn-primary !px-4 !py-2.5 text-xs">
          + افزودن {entity.singular}
        </Link>
      </header>

      {error ? (
        <p className="rounded-xl bg-gold-100 px-4 py-3 text-[13px] text-gold-600">{error}</p>
      ) : docs.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="mb-4 text-sm text-ink-muted">هنوز {entity.singular}ی ثبت نشده است.</p>
          <Link href={`/admin/${entityKey}/new`} className="btn-primary !px-4 !py-2.5 text-xs">
            افزودن اولین {entity.singular}
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-[#FAF8F5] text-right">
                {entity.listColumns.map((col) => (
                  <th key={col} scope="col" className="px-4 py-3 font-semibold text-ink-muted">
                    {COLUMN_LABELS[col] || col}
                  </th>
                ))}
                <th scope="col" className="px-4 py-3 text-left font-semibold text-ink-muted">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => (
                <tr key={doc._id} className="border-b border-line/70 last:border-0 hover:bg-sage-50/40">
                  {entity.listColumns.map((col, i) => (
                    <td key={col} className="px-4 py-3">
                      {i === 0 ? (
                        <Link href={`/admin/${entityKey}/${doc._id}`} className="font-semibold hover:text-sage-700">
                          {doc.title}
                        </Link>
                      ) : (
                        renderCell(col, doc)
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-left">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={entity.publicPath(doc)}
                        target="_blank"
                        className="rounded-lg px-2.5 py-1.5 text-[12px] text-ink-muted hover:bg-sage-50 hover:text-sage-700"
                      >
                        مشاهده
                      </Link>
                      <Link
                        href={`/admin/${entityKey}/${doc._id}`}
                        className="rounded-lg px-2.5 py-1.5 text-[12px] text-sage-700 hover:bg-sage-50"
                      >
                        ویرایش
                      </Link>
                      <DeleteButton entityKey={entityKey} id={doc._id} title={doc.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

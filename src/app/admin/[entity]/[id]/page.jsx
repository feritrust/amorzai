import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ENTITY_KEYS, getEntity } from '@/lib/entities';
import { adminGet } from '@/lib/adminData';
import EntityForm from '@/components/admin/EntityForm';
import { getFormContext } from '@/app/admin/[entity]/formContext';

export const dynamic = 'force-dynamic';

export default async function EditEntityPage({ params }) {
  const { entity: entityKey, id } = await params;
  if (!ENTITY_KEYS.includes(entityKey)) notFound();

  const entity = getEntity(entityKey);

  let doc = null;
  try {
    doc = await adminGet(entityKey, id);
  } catch {
    doc = null;
  }
  if (!doc) notFound();

  const { categories, items } = await getFormContext(entityKey);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="mb-1 text-xl font-extrabold">ویرایش {entity.singular}</h1>
          <p className="font-mono text-[12px] text-ink-muted" dir="ltr">
            {entity.publicPath(doc)}
          </p>
        </div>
        <Link href={entity.publicPath(doc)} target="_blank" className="btn-outline !px-4 !py-2.5 text-xs">
          مشاهده در سایت
        </Link>
      </header>

      <EntityForm
        entityKey={entityKey}
        entityLabel={entity.singular}
        fields={entity.fields}
        doc={doc}
        categories={categories}
        items={items}
      />
    </div>
  );
}

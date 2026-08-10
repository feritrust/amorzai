import { notFound } from 'next/navigation';
import { ENTITY_KEYS, getEntity } from '@/lib/entities';
import EntityForm from '@/components/admin/EntityForm';
import { getFormContext } from '@/app/admin/[entity]/formContext';

export const dynamic = 'force-dynamic';

export default async function NewEntityPage({ params }) {
  const { entity: entityKey } = await params;
  if (!ENTITY_KEYS.includes(entityKey)) notFound();

  const entity = getEntity(entityKey);
  const { categories, items } = await getFormContext(entityKey);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold">افزودن {entity.singular}</h1>
      </header>

      <EntityForm
        entityKey={entityKey}
        entityLabel={entity.singular}
        fields={entity.fields}
        categories={categories}
        items={items}
      />
    </div>
  );
}

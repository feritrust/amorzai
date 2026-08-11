import { dbConnect, hasDatabase } from '@/lib/mongodb';
import CategoryModel from '@/models/Category';
import ProductModel from '@/models/Product';
import ServiceModel from '@/models/Service';
import ArticleModel from '@/models/Article';
import SettingModel from '@/models/Setting';
import { getEntity } from '@/lib/entities';
import { isValidSlug } from '@/lib/slugify';

const MODELS = {
  Category: CategoryModel,
  Product: ProductModel,
  Service: ServiceModel,
  Article: ArticleModel,
  Setting: SettingModel,
};

export class DbUnavailableError extends Error {
  constructor() {
    super('اتصال به MongoDB برقرار نیست. برای استفاده از پنل مدیریت باید MONGODB_URI را تنظیم کنید.');
    this.name = 'DbUnavailableError';
  }
}

export async function requireDb() {
  if (!hasDatabase()) throw new DbUnavailableError();
  const conn = await dbConnect();
  if (!conn) throw new DbUnavailableError();
  return conn;
}

export function modelFor(entityKey) {
  const entity = getEntity(entityKey);
  if (!entity) throw new Error(`موجودیت ناشناخته: ${entityKey}`);
  return MODELS[entity.model];
}

/** فهرست رکوردها برای جدول پنل (بدون کش — همیشه تازه) */
export async function adminList(entityKey, { q } = {}) {
  await requireDb();
  const Model = modelFor(entityKey);

  const filter = q ? { $or: [{ title: new RegExp(q, 'i') }, { slug: new RegExp(q, 'i') }] } : {};
  const sort = entityKey === 'articles' ? { publishedAt: -1, createdAt: -1 } : entityKey === 'categories' ? { order: 1 } : { updatedAt: -1 };

  const docs = await Model.find(filter).sort(sort).lean();
  return docs.map(serialize);
}

export async function adminGet(entityKey, id) {
  await requireDb();
  const Model = modelFor(entityKey);
  const doc = await Model.findById(id).lean();
  return doc ? serialize(doc) : null;
}

export async function adminCount(entityKey) {
  await requireDb();
  return modelFor(entityKey).countDocuments();
}

/** تبدیل سند Mongoose به شیء ساده و قابل انتقال به کامپوننت کلاینت */
function serialize(doc) {
  const out = { ...doc, _id: String(doc._id) };
  for (const [k, v] of Object.entries(out)) {
    if (v instanceof Date) out[k] = v.toISOString();
  }
  delete out.__v;
  return out;
}

/**
 * اعتبارسنجی و پاک‌سازی داده فرم بر اساس تعریف فیلدها.
 * @returns {{ values: object, errors: object }}
 */
export function parseEntityPayload(entityKey, raw) {
  const entity = getEntity(entityKey);
  const values = {};
  const errors = {};

  for (const field of entity.fields) {
    const key = field.name;
    let value = raw[key];

    switch (field.type) {
      case 'number':
        value = value === '' || value === null || value === undefined ? null : Number(value);
        if (value !== null && Number.isNaN(value)) errors[key] = 'عدد معتبر وارد کنید';
        break;

      case 'checkbox':
        value = value === true || value === 'true' || value === 'on';
        break;

      case 'list':
      case 'itemRefs':
        value = Array.isArray(value) ? value.map((v) => String(v).trim()).filter(Boolean) : [];
        break;

      case 'pairs':
        value = Array.isArray(value)
          ? value.map((p) => [String(p?.[0] ?? '').trim(), String(p?.[1] ?? '').trim()]).filter(([a, b]) => a && b)
          : [];
        break;

      case 'faq':
        value = Array.isArray(value)
          ? value.map((f) => ({ q: String(f?.q ?? '').trim(), a: String(f?.a ?? '').trim() })).filter((f) => f.q && f.a)
          : [];
        break;

      case 'datetime':
        value = value ? new Date(value) : null;
        if (value && Number.isNaN(value.getTime())) {
          errors[key] = 'تاریخ معتبر نیست';
          value = null;
        }
        break;

      case 'slug':
        value = String(value ?? '').trim().toLowerCase();
        if (value && !isValidSlug(value)) {
          errors[key] = 'اسلاگ فقط می‌تواند شامل حروف کوچک انگلیسی، عدد و خط تیره باشد';
        }
        break;

      default:
        value = value === undefined || value === null ? '' : String(value).trim();
    }

    if (field.required && (value === '' || value === null || (Array.isArray(value) && !value.length))) {
      errors[key] = 'این فیلد الزامی است';
    }
    if (field.max && typeof value === 'string' && value.length > field.max) {
      errors[key] = `حداکثر ${field.max} کاراکتر`;
    }

    values[key] = value;
  }

  // مقاله منتشرشده بدون تاریخ → همین حالا
  if (entityKey === 'articles' && values.status === 'published' && !values.publishedAt) {
    values.publishedAt = new Date();
  }

  return { values, errors };
}

/** خواندن سند تک‌رکوردی تنظیمات (در صورت نبود، شیء خالی) */
export async function adminGetSettings() {
  await requireDb();
  const doc = await SettingModel.findOne({ key: 'main' }).lean();
  return doc ? serialize(doc) : {};
}

/** ذخیره تنظیمات تک‌رکوردی */
export async function adminSaveSettings(values) {
  await requireDb();
  const doc = await SettingModel.findOneAndUpdate(
    { key: 'main' },
    { $set: { ...values, key: 'main' } },
    { new: true, upsert: true, runValidators: true }
  ).lean();
  return { ok: true, doc: serialize(doc) };
}

/** ایجاد یا به‌روزرسانی. در صورت تکراری بودن اسلاگ خطای خوانا برمی‌گرداند. */
export async function adminSave(entityKey, id, values) {
  await requireDb();
  const Model = modelFor(entityKey);

  const clash = await Model.findOne({ slug: values.slug, ...(id ? { _id: { $ne: id } } : {}) }).lean();
  if (clash) {
    return { ok: false, errors: { slug: 'این اسلاگ قبلاً استفاده شده است' } };
  }

  const doc = id
    ? await Model.findByIdAndUpdate(id, { $set: values }, { new: true, runValidators: true }).lean()
    : await Model.create(values).then((d) => d.toObject());

  if (!doc) return { ok: false, errors: { _form: 'رکورد پیدا نشد' } };
  return { ok: true, doc: serialize(doc) };
}

export async function adminDelete(entityKey, id) {
  await requireDb();
  const doc = await modelFor(entityKey).findByIdAndDelete(id).lean();
  return doc ? serialize(doc) : null;
}

/** بررسی اینکه دسته‌ای که قرار است حذف شود، آیتم وابسته دارد یا نه */
export async function categoryUsage(slug) {
  await requireDb();
  const [products, services] = await Promise.all([
    ProductModel.countDocuments({ category: slug }),
    ServiceModel.countDocuments({ category: slug }),
  ]);
  return products + services;
}

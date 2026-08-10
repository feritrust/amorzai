/**
 * تعریف موجودیت‌های قابل مدیریت در پنل.
 * فرم، جدول، اعتبارسنجی و مسیرهای revalidate همگی از همین تعریف ساخته می‌شوند —
 * برای افزودن فیلد جدید فقط همین فایل را ویرایش کنید.
 */

const seoFields = [
  {
    name: 'metaTitle',
    label: 'عنوان سئو (Title)',
    type: 'text',
    group: 'seo',
    help: 'اگر خالی بماند از عنوان اصلی ساخته می‌شود. حدود ۶۰ کاراکتر مناسب است.',
    max: 70,
  },
  {
    name: 'metaDescription',
    label: 'توضیحات متا (Description)',
    type: 'textarea',
    group: 'seo',
    help: 'اگر خالی بماند از خلاصه ساخته می‌شود. حدود ۱۵۵ کاراکتر مناسب است.',
    max: 170,
    rows: 3,
  },
  {
    name: 'noindex',
    label: 'از ایندکس گوگل خارج شود (noindex)',
    type: 'checkbox',
    group: 'seo',
    help: 'برای صفحات آزمایشی یا تکراری.',
  },
];

const itemFields = (kindLabel) => [
  { name: 'title', label: 'عنوان', type: 'text', required: true, group: 'main' },
  {
    name: 'slug',
    label: 'اسلاگ (آدرس صفحه)',
    type: 'slug',
    required: true,
    group: 'main',
    from: 'title',
    help: 'فقط حروف کوچک انگلیسی، عدد و خط تیره. پس از انتشار تغییرش ندهید.',
  },
  { name: 'category', label: 'دسته‌بندی', type: 'category', required: true, group: 'main' },
  {
    name: 'excerpt',
    label: 'خلاصه',
    type: 'textarea',
    rows: 3,
    group: 'main',
    required: true,
    help: 'یک تا دو جمله؛ در کارت‌ها و توضیحات متا استفاده می‌شود.',
  },
  {
    name: 'description',
    label: 'توضیحات کامل (هر بند یک پاراگراف)',
    type: 'list',
    group: 'main',
    itemType: 'textarea',
    help: 'حداقل دو پاراگراف بنویسید؛ محتوای واقعی مهم‌ترین عامل رتبه گرفتن این صفحه است.',
  },
  { name: 'price', label: 'قیمت (تومان)', type: 'number', group: 'price', help: 'خالی بگذارید تا «استعلام تلفنی» نمایش داده شود.' },
  { name: 'unit', label: 'واحد', type: 'text', group: 'price', placeholder: kindLabel === 'محصول' ? 'عدد' : 'هر مراسم' },
  { name: 'sku', label: 'کد کالا/خدمت', type: 'text', group: 'price' },
  { name: 'available', label: 'قابل سفارش است', type: 'checkbox', group: 'price', default: true },
  { name: 'image', label: 'تصویر', type: 'image', group: 'media', help: 'اگر خالی بماند تصویر پیش‌فرض دسته‌بندی استفاده می‌شود.' },
  { name: 'features', label: 'ویژگی‌ها', type: 'list', group: 'extra', itemType: 'text' },
  { name: 'specs', label: 'مشخصات (عنوان / مقدار)', type: 'pairs', group: 'extra' },
  ...seoFields,
];

export const ENTITIES = {
  products: {
    key: 'products',
    model: 'Product',
    label: 'محصولات',
    singular: 'محصول',
    icon: 'flower',
    publicPath: (doc) => `/product/${doc.slug}`,
    listColumns: ['title', 'category', 'price', 'available'],
    fields: itemFields('محصول'),
    revalidate: (doc) => ['/', '/products', '/categories', `/category/${doc.category}`, `/product/${doc.slug}`],
  },
  services: {
    key: 'services',
    model: 'Service',
    label: 'خدمات',
    singular: 'خدمت',
    icon: 'chair',
    publicPath: (doc) => `/service/${doc.slug}`,
    listColumns: ['title', 'category', 'price', 'available'],
    fields: itemFields('خدمت'),
    revalidate: (doc) => ['/', '/services', '/categories', `/category/${doc.category}`, `/service/${doc.slug}`],
  },
  categories: {
    key: 'categories',
    model: 'Category',
    label: 'دسته‌بندی‌ها',
    singular: 'دسته‌بندی',
    icon: 'more',
    publicPath: (doc) => `/category/${doc.slug}`,
    listColumns: ['title', 'kind', 'order'],
    fields: [
      { name: 'title', label: 'عنوان کامل', type: 'text', required: true, group: 'main' },
      { name: 'shortTitle', label: 'عنوان کوتاه (منو)', type: 'text', group: 'main' },
      { name: 'slug', label: 'اسلاگ', type: 'slug', required: true, group: 'main', from: 'title' },
      {
        name: 'kind',
        label: 'نوع',
        type: 'select',
        group: 'main',
        required: true,
        options: [
          { value: 'product', label: 'محصول' },
          { value: 'service', label: 'خدمت' },
        ],
      },
      { name: 'order', label: 'ترتیب نمایش', type: 'number', group: 'main', default: 100 },
      {
        name: 'icon',
        label: 'آیکون',
        type: 'select',
        group: 'main',
        options: [
          { value: 'flower', label: 'گل' },
          { value: 'stone', label: 'سنگ' },
          { value: 'print', label: 'چاپ' },
          { value: 'chair', label: 'صندلی' },
          { value: 'tent', label: 'سایبان' },
          { value: 'tea', label: 'پذیرایی' },
          { value: 'food', label: 'غذا' },
          { value: 'mic', label: 'مداحی' },
          { value: 'more', label: 'سایر' },
        ],
      },
      { name: 'excerpt', label: 'خلاصه', type: 'textarea', rows: 2, group: 'main', required: true },
      {
        name: 'description',
        label: 'متن معرفی دسته (هر بند یک پاراگراف)',
        type: 'list',
        itemType: 'textarea',
        group: 'main',
        help: 'این متن بالای صفحه دسته نمایش داده می‌شود و برای ایندکس شدن صفحه ضروری است.',
      },
      { name: 'faq', label: 'سوالات متداول این دسته', type: 'faq', group: 'extra', help: 'با Schema مخصوص FAQ در گوگل نمایش داده می‌شود.' },
      ...seoFields,
    ],
    revalidate: (doc) => ['/', '/categories', '/products', '/services', `/category/${doc.slug}`],
  },
  articles: {
    key: 'articles',
    model: 'Article',
    label: 'مقالات',
    singular: 'مقاله',
    icon: 'print',
    publicPath: (doc) => `/blog/${doc.slug}`,
    listColumns: ['title', 'status', 'publishedAt'],
    fields: [
      { name: 'title', label: 'عنوان مقاله', type: 'text', required: true, group: 'main' },
      { name: 'slug', label: 'اسلاگ', type: 'slug', required: true, group: 'main', from: 'title' },
      {
        name: 'excerpt',
        label: 'خلاصه',
        type: 'textarea',
        rows: 3,
        required: true,
        group: 'main',
        help: 'در فهرست مقالات و توضیحات متا استفاده می‌شود.',
      },
      { name: 'content', label: 'متن مقاله', type: 'markdown', group: 'main', required: true },
      { name: 'cover', label: 'تصویر شاخص', type: 'image', group: 'media' },
      { name: 'coverAlt', label: 'متن جایگزین تصویر (alt)', type: 'text', group: 'media', help: 'برای سئوی تصویر و دسترس‌پذیری.' },
      { name: 'tags', label: 'برچسب‌ها', type: 'list', itemType: 'text', group: 'extra' },
      { name: 'author', label: 'نویسنده', type: 'text', group: 'extra', default: 'تیم آمرز' },
      {
        name: 'status',
        label: 'وضعیت',
        type: 'select',
        group: 'publish',
        required: true,
        options: [
          { value: 'draft', label: 'پیش‌نویس' },
          { value: 'published', label: 'منتشرشده' },
        ],
      },
      {
        name: 'publishedAt',
        label: 'تاریخ انتشار',
        type: 'datetime',
        group: 'publish',
        help: 'اگر خالی بماند هنگام انتشار، زمان فعلی ثبت می‌شود.',
      },
      {
        name: 'relatedItems',
        label: 'محصولات و خدمات مرتبط',
        type: 'itemRefs',
        group: 'extra',
        help: 'لینک داخلی به این صفحات، هم برای کاربر مفید است هم برای سئو.',
      },
      { name: 'faq', label: 'سوالات متداول مقاله', type: 'faq', group: 'extra' },
      ...seoFields,
    ],
    revalidate: (doc) => ['/blog', `/blog/${doc.slug}`, '/'],
  },
};

export const GROUPS = {
  main: 'محتوای اصلی',
  price: 'قیمت و موجودی',
  media: 'تصویر',
  publish: 'انتشار',
  extra: 'اطلاعات تکمیلی',
  seo: 'تنظیمات سئو',
};

export const ENTITY_KEYS = Object.keys(ENTITIES);

export function getEntity(key) {
  return ENTITIES[key] || null;
}

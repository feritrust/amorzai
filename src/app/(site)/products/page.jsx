import CatalogView from '@/components/CatalogView';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

const H1 = 'محصولات مراسم ترحیم';
const INTRO = [
  'در این بخش، محصولات فیزیکی مورد نیاز مراسم ترحیم را با قیمت روز مشاهده می‌کنید: تاج گل و سبد گل، سنگ مزار گرانیت و مرمر، بنر و کارت ختم و قاب عکس متوفی.',
  'قیمت‌ها به تومان و بدون هزینه پنهان اعلام شده‌اند. برای ثبت سفارش، انتخاب مدل و هماهنگی زمان تحویل، کافی است با کارشناسان آمرز تماس بگیرید؛ پرداخت آنلاین در سایت وجود ندارد.',
];

export const metadata = buildMetadata({
  title: 'محصولات مراسم ترحیم — تاج گل، سنگ مزار و اقلام چاپی',
  description:
    'خرید تاج گل ترحیم، سبد گل، سنگ مزار گرانیت و مرمر، بنر ترحیم و کارت دعوت ختم با قیمت روز و تحویل در بهشت زهرا. مشاهده قیمت و رزرو تلفنی.',
  path: '/products',
});

export default async function ProductsPage() {
  return (
    <CatalogView
      type="product"
      page={1}
      basePath="/products"
      h1={H1}
      intro={INTRO}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: H1, path: '/products' },
      ]}
    />
  );
}

import CatalogView from '@/components/CatalogView';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

const H1 = 'خدمات مراسم ترحیم';
const INTRO = [
  'خدمات اجرایی مراسم ترحیم شامل اجاره میز و صندلی، سایبان و سیستم صوتی، پذیرایی و کترینگ، رزرو ناهار رستوران، اعزام مداح و قاری و هماهنگی مراحل اداری غسل و کفن و دفن.',
  'هر خدمت با شرح دقیق، شرایط اجرا و قیمت مشخص ارائه شده است. تیم آمرز پیش از شروع مراسم در محل مستقر می‌شود و اجرا را تا پایان بر عهده می‌گیرد.',
];

export const metadata = buildMetadata({
  title: 'خدمات مراسم ترحیم — صندلی، سایبان، پذیرایی و مداح',
  description:
    'اجاره میز و صندلی، سایبان، سیستم صوتی، پذیرایی و کترینگ، ناهار ترحیم، اعزام مداح و قاری و هماهنگی غسل و کفن و دفن در بهشت زهرا. قیمت شفاف و رزرو تلفنی.',
  path: '/services',
});

export default async function ServicesPage() {
  return (
    <CatalogView
      type="service"
      page={1}
      basePath="/services"
      h1={H1}
      intro={INTRO}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: H1, path: '/services' },
      ]}
    />
  );
}

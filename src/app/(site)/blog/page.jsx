import BlogList from '@/components/BlogList';
import { buildMetadata } from '@/lib/seo';

export const revalidate = 3600;

const H1 = 'مجله آمرز؛ راهنمای مراسم ترحیم';
const INTRO = [
  'راهنماها و مقالاتی درباره برگزاری مراسم ترحیم: از مراحل اداری بهشت زهرا و انتخاب سنگ مزار تا برآورد هزینه‌ها و نکات عملی که کمتر جایی گفته می‌شود.',
  'همه مطالب بر اساس تجربه واقعی تیم آمرز در اجرای مراسم نوشته شده‌اند و به‌مرور به‌روزرسانی می‌شوند.',
];

export const metadata = buildMetadata({
  title: 'مجله آمرز — راهنمای برگزاری مراسم ترحیم',
  description:
    'مقالات آموزشی درباره مراسم ترحیم در بهشت زهرا: مراحل اداری، انتخاب تاج گل و سنگ مزار، برآورد هزینه پذیرایی و نکات عملی برگزاری مراسم.',
  path: '/blog',
});

export default function BlogPage() {
  return (
    <BlogList
      page={1}
      basePath="/blog"
      h1={H1}
      intro={INTRO}
      breadcrumbs={[
        { name: 'خانه', path: '/' },
        { name: 'مجله', path: '/blog' },
      ]}
    />
  );
}

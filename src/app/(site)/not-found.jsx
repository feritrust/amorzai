import NotFoundContent from '@/components/NotFoundContent';

export const metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: true },
};

export default function SiteNotFound() {
  return <NotFoundContent />;
}

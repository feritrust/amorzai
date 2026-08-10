import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NotFoundContent from '@/components/NotFoundContent';

export const metadata = {
  title: 'صفحه پیدا نشد',
  robots: { index: false, follow: true },
};

/** ۴۰۴ برای آدرس‌هایی که با هیچ مسیری تطبیق ندارند (خارج از گروه site) */
export default function RootNotFound() {
  return (
    <>
      <Header />
      <main id="main">
        <NotFoundContent />
      </main>
      <Footer />
    </>
  );
}

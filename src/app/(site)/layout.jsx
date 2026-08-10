import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JsonLd from '@/components/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo';

export default function SiteLayout({ children }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-sage-600 focus:px-4 focus:py-2 focus:text-white"
      >
        پرش به محتوای اصلی
      </a>

      <Header />
      <main id="main">{children}</main>
      <Footer />

      <JsonLd data={[organizationSchema(), websiteSchema()]} />
    </>
  );
}

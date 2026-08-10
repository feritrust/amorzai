import './globals.css';
import { site } from '@/lib/site';

/**
 * لایه ریشه فقط ساختار html/body و متادیتای پایه را می‌سازد.
 * هدر و فوتر سایت در گروه (site) و پوسته پنل در گروه admin تعریف شده‌اند.
 *
 * توجه: در ریشه عمداً فایل loading.jsx نداریم — وجودش باعث می‌شود پاسخ
 * زودتر استریم شود و همه صفحات ۴۰۴ وضعیت ۲۰۰ بگیرند (soft-404).
 */
export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.legalName} | گل، سنگ مزار، پذیرایی و تجهیزات`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  keywords: site.keywords,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: '/',
    languages: { 'fa-IR': '/' },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.legalName,
    description: site.description,
    images: [{ url: '/images/og-default.png', width: 1200, height: 630, alt: site.legalName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.legalName,
    description: site.description,
    images: ['/images/og-default.png'],
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    apple: '/images/logo.svg',
  },
  manifest: '/manifest.webmanifest',
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  formatDetection: { telephone: true, address: false, email: false },
  category: 'خدمات مراسم ترحیم',
};

export const viewport = {
  themeColor: '#4A6152',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

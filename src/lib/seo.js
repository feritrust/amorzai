import { site } from '@/lib/site';
import { clamp } from '@/lib/utils';

/** آدرس مطلق کانونیکال */
export function abs(path = '/') {
  if (!path) return site.url;
  if (path.startsWith('http')) return path;
  return `${site.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * سازنده مرکزی متادیتا. همه صفحات از این تابع استفاده می‌کنند تا
 * canonical، Open Graph، Twitter Card و robots همه‌جا یکدست باشند.
 */
export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  type = 'website',
  keywords,
  noindex = false,
  publishedTime,
  modifiedTime,
} = {}) {
  const url = abs(path);
  // شبکه‌های اجتماعی SVG را رندر نمی‌کنند؛ برای og همیشه تصویر PNG استفاده می‌شود
  const safeImage = image && !image.endsWith('.svg') ? image : '/images/og-default.png';
  const ogImage = abs(safeImage);
  const desc = clamp(description || site.description);

  return {
    title,
    description: desc,
    keywords: keywords?.length ? keywords : site.keywords,
    alternates: {
      canonical: url,
    },
    robots: noindex
      ? { index: false, follow: true, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    openGraph: {
      type,
      url,
      siteName: site.name,
      locale: site.locale,
      title: title ? `${title}` : site.legalName,
      description: desc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title || site.legalName }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title || site.legalName,
      description: desc,
      images: [ogImage],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  JSON-LD / Structured Data                                          */
/* ------------------------------------------------------------------ */

const ORG_ID = `${site.url}/#organization`;
const WEBSITE_ID = `${site.url}/#website`;

/**
 * @param s تنظیمات سایت (خروجی getSettings). اگر پاس داده نشود، مقادیر پیش‌فرض استفاده می‌شود.
 */
export function organizationSchema(s = site) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': ORG_ID,
    name: s.legalName,
    alternateName: s.name,
    url: site.url,
    logo: { '@type': 'ImageObject', url: abs('/images/logo.svg'), width: 512, height: 512 },
    image: abs('/images/og-default.png'),
    description: s.description,
    slogan: s.slogan,
    telephone: `+98${String(s.phone).replace(/^0/, '')}`,
    email: s.email,
    priceRange: '$$',
    currenciesAccepted: 'IRR',
    paymentAccepted: 'نقدی، کارت به کارت',
    address: {
      '@type': 'PostalAddress',
      streetAddress: s.address.street,
      addressLocality: s.address.city,
      addressRegion: s.address.region,
      postalCode: s.address.postalCode,
      addressCountry: s.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng },
    areaServed: { '@type': 'City', name: 'تهران' },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    ],
    sameAs: Object.values(s.social || {}).filter(Boolean),
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: site.url,
    name: site.name,
    inLanguage: 'fa-IR',
    publisher: { '@id': ORG_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${site.url}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

/** breadcrumbs: [{ name, path }] — آخرین آیتم صفحه فعلی است */
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function productSchema(item, category) {
  const url = abs(item.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${url}#product`,
    name: item.title,
    sku: item.sku || undefined,
    description: clamp(item.excerpt || item.description?.[0] || '', 300),
    image: [abs(item.image)],
    url,
    category: category?.title,
    brand: { '@type': 'Brand', name: site.name },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IRR',
      // قیمت‌ها در سایت به تومان است؛ برای Schema به ریال تبدیل می‌شود
      price: item.price ? String(item.price * 10) : undefined,
      availability: item.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      availableAtOrFrom: { '@id': ORG_ID },
      seller: { '@id': ORG_ID },
      priceValidUntil: new Date(new Date().setMonth(new Date().getMonth() + 3))
        .toISOString()
        .slice(0, 10),
    },
  };
}

export function serviceSchema(item, category) {
  const url = abs(item.href);
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: item.title,
    serviceType: category?.title || 'خدمات مراسم ترحیم',
    description: clamp(item.excerpt || item.description?.[0] || '', 300),
    image: abs(item.image),
    url,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'City', name: 'تهران' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'IRR',
      price: item.price ? String(item.price * 10) : undefined,
      availability: 'https://schema.org/InStock',
      seller: { '@id': ORG_ID },
    },
  };
}

/** برای صفحات دسته‌بندی و فهرست — کمک به درک ساختار توسط گوگل */
export function itemListSchema(items, listName) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: items.length,
    itemListElement: items.map((it, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      url: abs(it.href),
      name: it.title,
    })),
  };
}

export function faqSchema(faq) {
  if (!faq?.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export function collectionPageSchema({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name,
    description: clamp(description, 300),
    url: abs(path),
    isPartOf: { '@id': WEBSITE_ID },
    inLanguage: 'fa-IR',
  };
}

import { site } from '@/lib/site';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // صفحاتی که نباید ایندکس شوند یا ارزش خزش ندارند
        disallow: ['/api/', '/search', '/*?q=', '/_next/'],
      },
      {
        // ربات‌های اسکرپر که فقط پهنای باند مصرف می‌کنند
        userAgent: ['AhrefsBot', 'SemrushBot', 'MJ12bot', 'DotBot'],
        disallow: '/',
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}

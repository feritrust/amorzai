import { site } from '@/lib/site';

export default function manifest() {
  return {
    name: site.legalName,
    short_name: site.shortName,
    description: site.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FAF8F5',
    theme_color: '#4A6152',
    lang: 'fa-IR',
    dir: 'rtl',
    categories: ['business', 'shopping'],
    icons: [
      { src: '/images/logo.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
  };
}

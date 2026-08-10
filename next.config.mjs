/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536],
    imageSizes: [96, 128, 192, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**.amorz.ir' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },

  // هدرهای امنیتی و کشِ استاتیک — کمک مستقیم به Core Web Vitals و اعتماد گوگل
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },

  // جلوگیری از duplicate content: مسیرهای قدیمی/جایگزین به مسیر کانونیکال ریدایرکت دائم می‌شوند
  async redirects() {
    return [
      { source: '/index', destination: '/', permanent: true },
      { source: '/home', destination: '/', permanent: true },
      { source: '/category', destination: '/categories', permanent: true },
      { source: '/product', destination: '/products', permanent: true },
      { source: '/service', destination: '/services', permanent: true },
      { source: '/products/page/1', destination: '/products', permanent: true },
      { source: '/services/page/1', destination: '/services', permanent: true },
      { source: '/category/:slug/page/1', destination: '/category/:slug', permanent: true },
      { source: '/blog/page/1', destination: '/blog', permanent: true },
      { source: '/blog/tag/:tag/page/1', destination: '/blog/tag/:tag', permanent: true },
    ];
  },
};

export default nextConfig;

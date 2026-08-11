/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,mdx}'],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1rem', lg: '2rem' },
      screens: { '2xl': '1280px' },
    },
    extend: {
      colors: {
        paper: '#FAF8F5',
        // کنتراست همه این رنگ‌ها روی پس‌زمینه paper بالاتر از حد استاندارد WCAG AA است
        ink: {
          DEFAULT: '#161A18',
          soft: '#2F3532',
          muted: '#565D58', // قبلاً #6E756F بود و روی متن‌های ریز خوانا نبود
        },
        line: '#E7E2DA',
        sage: {
          50: '#F2F5F2',
          100: '#E1E9E3',
          200: '#C2D2C7',
          400: '#7C9686',
          600: '#4A6152',
          700: '#3A4D42',
          900: '#212C25',
        },
        gold: {
          100: '#F3E9D8',
          400: '#C9A96A',
          600: '#A8863F',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'system-ui', 'Segoe UI', 'Tahoma', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(27,31,29,.04), 0 8px 24px -12px rgba(27,31,29,.12)',
        lift: '0 2px 6px rgba(27,31,29,.06), 0 18px 40px -18px rgba(27,31,29,.22)',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

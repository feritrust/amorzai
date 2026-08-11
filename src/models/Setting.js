import mongoose from 'mongoose';

/**
 * تنظیمات عمومی سایت — همیشه فقط یک سند با کلید «main» وجود دارد.
 * مقادیر خالی نادیده گرفته می‌شوند و مقدار پیش‌فرض از src/lib/site.js می‌آید.
 */
const SettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true, index: true },

    siteName: { type: String, default: '' },
    slogan: { type: String, default: '' },
    description: { type: String, default: '' },

    phone: { type: String, default: '' },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },

    addressStreet: { type: String, default: '' },
    addressCity: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    geoLat: { type: Number, default: null },
    geoLng: { type: Number, default: null },

    openingHours: { type: String, default: '' },
    footerAbout: { type: String, default: '' },

    instagram: { type: String, default: '' },
    telegram: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

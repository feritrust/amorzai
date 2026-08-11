import mongoose from 'mongoose';

/**
 * یک رکورد به ازای هر بازدید صفحه.
 *
 * حریم خصوصی: هیچ IP یا کوکی‌ای ذخیره نمی‌شود. برای شمارش «بازدیدکننده یکتا»
 * یک هش یک‌طرفه از (IP + مرورگر + تاریخ روز + کلید مخفی) ساخته می‌شود که
 * فردا دیگر قابل بازسازی نیست و به شخص قابل ردیابی نیست.
 */
const PageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, index: true },
    day: { type: String, required: true, index: true }, // YYYY-MM-DD به وقت تهران
    visitor: { type: String, required: true, index: true }, // هش روزانه
    referrer: { type: String, default: '' },
    device: { type: String, enum: ['mobile', 'tablet', 'desktop'], default: 'desktop', index: true },
    country: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// داده خام بعد از ۱۸۰ روز خودکار حذف می‌شود تا دیتابیس بی‌رویه بزرگ نشود
PageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 });
PageViewSchema.index({ day: 1, visitor: 1 });
PageViewSchema.index({ day: 1, path: 1 });

export default mongoose.models.PageView || mongoose.model('PageView', PageViewSchema);

import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({ q: String, a: String }, { _id: false });

const CategorySchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    shortTitle: { type: String, trim: true },
    kind: { type: String, enum: ['product', 'service'], default: 'product', index: true },
    order: { type: Number, default: 100 },
    icon: { type: String, default: 'more' },
    excerpt: { type: String, default: '' },
    description: { type: [String], default: [] },
    faq: { type: [FaqSchema], default: [] },
    // فیلدهای اختصاصی SEO — در صورت خالی بودن از عنوان و خلاصه ساخته می‌شود
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.index({ order: 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);

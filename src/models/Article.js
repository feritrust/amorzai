import mongoose from 'mongoose';

const ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' }, // مارک‌داون
    cover: { type: String, default: '' },
    coverAlt: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    author: { type: String, default: 'تیم آمرز' },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
    publishedAt: { type: Date, default: null },
    // محصولات/خدمات مرتبط برای لینک‌سازی داخلی (اسلاگ با پیشوند نوع: product:xxx یا service:yyy)
    relatedItems: { type: [String], default: [] },
    faq: { type: [{ q: String, a: String, _id: false }], default: [] },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ArticleSchema.index({ publishedAt: -1 });
ArticleSchema.index({ title: 'text', excerpt: 'text' });

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);

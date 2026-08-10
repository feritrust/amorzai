import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, default: null },
    unit: { type: String, default: 'هر مراسم' },
    sku: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    description: { type: [String], default: [] },
    features: { type: [String], default: [] },
    specs: { type: [[String]], default: [] },
    image: { type: String, default: '' },
    available: { type: Boolean, default: true },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    noindex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ServiceSchema.index({ title: 'text', excerpt: 'text' });

export default mongoose.models.Service || mongoose.model('Service', ServiceSchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    nameFr: { type: String, trim: true, default: '' },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    descriptionFr: { type: String, default: '' },

    price: { type: Number, required: true, min: 0 }, // current selling price in FCFA
    comparePrice: { type: Number, default: 0 }, // original/"was" price in FCFA
    discount: { type: Number, default: 0 }, // percentage, derived but stored for fast sort/filter

    images: [{ type: String, required: true }],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    brand: { type: String, default: 'BUEA ONLINE SHOP' },

    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },

    colors: [{ type: String }], // e.g. ["Black", "Blue", "White"]
    sizes: [{ type: String }], // e.g. ["S", "M", "L", "XL"] or shoe sizes

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null = platform-owned stock

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isDealOfTheDay: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('validate', function generateSlug(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  if (this.comparePrice && this.comparePrice > this.price) {
    this.discount = Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  } else {
    this.discount = 0;
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Optional translated name so the storefront can show FR without a second collection
    nameFr: { type: String, trim: true, default: '' },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    descriptionFr: { type: String, default: '' },
    image: { type: String, default: '' },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function generateSlug(next) {
  // Only auto-generate when no slug was explicitly provided (e.g. by the seed
  // script, which disambiguates subcategory name collisions like "Accessories"
  // appearing under both Clothing and Electronics). Without this guard, this
  // hook would silently overwrite any explicit slug on every new document.
  if (this.name && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Category', categorySchema);

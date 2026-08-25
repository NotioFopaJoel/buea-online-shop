const mongoose = require('mongoose');

/**
 * Homepage advertising banner. Supports a short promotional video (preferred,
 * ~10s) OR a static image as a fallback, an optional CTA linking to a
 * product, a category, or a custom URL, scheduling via start/end dates, and
 * basic performance tracking (views/clicks) so the admin can see what works.
 */
const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    titleFr: { type: String, trim: true, default: '' },
    description: { type: String, default: '' },
    descriptionFr: { type: String, default: '' },
    ctaText: { type: String, default: 'Shop Now' },
    ctaTextFr: { type: String, default: 'Acheter maintenant' },

    videoUrl: { type: String, default: '' },
    imageUrl: { type: String, default: '' }, // fallback/poster if no video, or image-only ad

    linkType: { type: String, enum: ['product', 'category', 'url', 'none'], default: 'none' },
    linkProduct: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
    linkCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    linkUrl: { type: String, default: '' },

    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    sortOrder: { type: Number, default: 0 },

    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/**
 * True when the ad is toggled on AND (if scheduled) within its date window.
 * Used by the public endpoint so expired/future-dated ads never show.
 */
advertisementSchema.methods.isCurrentlyActive = function isCurrentlyActive() {
  if (!this.isActive) return false;
  const now = new Date();
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
};

module.exports = mongoose.model('Advertisement', advertisementSchema);

const mongoose = require('mongoose');

/**
 * Represents a deliverable neighborhood/zone.
 * v1 only has city="Buea", but the schema already supports other cities
 * so expansion (point 69 of the brief) doesn't require a model change.
 */
const deliveryZoneSchema = new mongoose.Schema(
  {
    city: { type: String, required: true, default: 'Buea' },
    neighborhood: { type: String, required: true }, // e.g. Molyko, Mile 16
    isActive: { type: Boolean, default: true },
    // Optional per-zone override of the default delivery fee logic. Null = use global rule.
    customDeliveryFee: { type: Number, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

deliveryZoneSchema.index({ city: 1, neighborhood: 1 }, { unique: true });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);

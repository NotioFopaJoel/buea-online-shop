const mongoose = require('mongoose');

/**
 * Singleton-style settings document. There should only ever be one row.
 * Lets the admin change the WhatsApp number, delivery thresholds, etc.
 * without redeploying code (Admin Dashboard -> Settings -> WhatsApp).
 */
const settingsSchema = new mongoose.Schema(
  {
    whatsappBusinessNumber: { type: String, required: true, default: '237670000000' },
    deliveryFreeThreshold: { type: Number, default: 10000 },
    deliveryFeeStandard: { type: Number, default: 1000 },
    activeDeliveryCity: { type: String, default: 'Buea' },
    supportEmail: { type: String, default: 'support@bueaonlineshop.com' },
    supportPhone: { type: String, default: '+237670000000' },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      tiktok: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Settings', settingsSchema);

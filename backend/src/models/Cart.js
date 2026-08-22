const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    // Price snapshot at time of adding, used for display only.
    // The backend ALWAYS recalculates real prices from Product at checkout time.
    priceSnapshot: { type: Number, required: true },
  },
  { _id: true, timestamps: true }
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

cartSchema.virtual('subtotal').get(function computeSubtotal() {
  return this.items.reduce((sum, item) => sum + item.priceSnapshot * item.quantity, 0);
});

cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);

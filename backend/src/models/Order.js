const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true }, // snapshot, in case product changes later
    image: { type: String, default: '' },
    price: { type: Number, required: true }, // snapshot price at order time (server-recalculated)
    quantity: { type: Number, required: true, min: 1 },
    color: { type: String, default: '' },
    size: { type: String, default: '' },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    whatsappNumber: { type: String, default: '' },
    city: { type: String, required: true, default: 'Buea' }, // v1: must equal "Buea"
    neighborhood: { type: String, required: true }, // e.g. Molyko, Mile 16
    address: { type: String, required: true },
    landmark: { type: String, default: '' },
    deliveryInstructions: { type: String, default: '' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true }, // e.g. BOS-10025

    // Order can belong to a registered user OR be a guest checkout
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isGuestOrder: { type: Boolean, default: false },

    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    // All monetary fields below are ALWAYS recalculated server-side. Never trusted from client.
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    creditUsed: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    couponCode: { type: String, default: '' },

    paymentMethod: {
      type: String,
      enum: ['MTN_MOBILE_MONEY', 'ORANGE_MONEY', 'CASH'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PENDING',
    },

    orderStatus: {
      type: String,
      enum: [
        'PENDING_CONFIRMATION',
        'WHATSAPP_CONTACTED',
        'CONFIRMED',
        'PROCESSING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ],
      default: 'PENDING_CONFIRMATION',
    },

    whatsappStatus: {
      type: String,
      enum: ['NOT_CONTACTED', 'LINK_OPENED', 'CONTACTED', 'CONFIRMED'],
      default: 'NOT_CONTACTED',
    },
    whatsappContactedAt: { type: Date, default: null },
    whatsappConfirmedAt: { type: Date, default: null },

    deliveredAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'shippingAddress.phone': 1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);

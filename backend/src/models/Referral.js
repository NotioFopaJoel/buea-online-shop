const mongoose = require('mongoose');

/**
 * Tracks a referral relationship and its associated reward.
 *
 * Status lifecycle:
 *   PENDING    → order placed by the referred user
 *   VALIDATED  → order delivered + payment confirmed (credit granted)
 *   CANCELLED  → referred order was cancelled
 *
 * One referral per referee is enforced by the unique index on `referee`.
 */
const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    referee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // one reward per referred person
    },
    code: { type: String, required: true }, // referral code used

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },

    merchandiseSubtotal: { type: Number, required: true, min: 0 },
    rewardPercentage: { type: Number, required: true },
    rewardAmount: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ['PENDING', 'VALIDATED', 'CANCELLED'],
      default: 'PENDING',
    },
    validatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referee: 1, status: 1 });

module.exports = mongoose.model('Referral', referralSchema);

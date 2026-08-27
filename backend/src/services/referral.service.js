const mongoose = require('mongoose');
const Referral = require('../models/Referral');
const User = require('../models/User');
const Settings = require('../models/Settings');

/**
 * Returns current referral settings, creating defaults if none exist.
 */
async function getSettings() {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
}

/**
 * Called after order creation. If the buyer was referred and has never had a
 * reward created for them yet, creates a PENDING referral record.
 */
async function handleNewOrder(order) {
  if (!order.user) return null;

  const settings = await getSettings();
  if (!settings.referralEnabled) return null;

  const buyer = await User.findById(order.user);
  if (!buyer || !buyer.referredBy) return null;

  const existing = await Referral.findOne({
    referee: buyer._id,
    status: { $ne: 'CANCELLED' },
  });
  if (existing) return null;

  const rewardAmount = Math.round(order.subtotal * settings.referralRewardPercentage / 100);

  if (rewardAmount <= 0) return null;

  const referral = await Referral.create({
    referrer: buyer.referredBy,
    referee: buyer._id,
    code: buyer.referralCode || '',
    order: order._id,
    merchandiseSubtotal: order.subtotal,
    rewardPercentage: settings.referralRewardPercentage,
    rewardAmount,
    status: 'PENDING',
  });

  return referral;
}

/**
 * Validates a pending referral when the linked order is both DELIVERED and PAID.
 * Atomically credits the referrer's balance.
 */
async function maybeValidateReferral(order) {
  if (!order.user || order.orderStatus !== 'DELIVERED' || order.paymentStatus !== 'PAID') return null;

  const referral = await Referral.findOne({
    order: order._id,
    status: 'PENDING',
  });
  if (!referral) return null;

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      await Referral.updateOne(
        { _id: referral._id, status: 'PENDING' },
        { $set: { status: 'VALIDATED', validatedAt: new Date() } },
        { session }
      );

      await User.updateOne(
        { _id: referral.referrer },
        { $inc: { creditBalance: referral.rewardAmount } },
        { session }
      );
    });
  } finally {
    session.endSession();
  }

  return referral;
}

/**
 * Cancels a PENDING referral when the linked order is cancelled.
 * If the order was already validated (delivered+paid), credit is not withdrawn
 * (the order fulfilled the conditions).
 */
async function cancelReferralOnOrderCancel(order) {
  const referral = await Referral.findOne({
    order: order._id,
    status: 'PENDING',
  });
  if (!referral) return null;

  await Referral.updateOne(
    { _id: referral._id, status: 'PENDING' },
    { $set: { status: 'CANCELLED' } }
  );

  return referral;
}

/**
 * Refund credit if an order that used credit is cancelled.
 */
async function refundCreditOnCancel(order) {
  if (!order.user || !order.creditUsed || order.creditUsed <= 0) return;

  await User.updateOne(
    { _id: order.user, creditBalance: { $gte: 0 } },
    { $inc: { creditBalance: order.creditUsed } }
  );
}

/**
 * Deduct credit at checkout. Returns the actual amount deducted.
 */
async function deductCredit(userId, amountToUse) {
  if (!userId || !amountToUse || amountToUse <= 0) return 0;

  const user = await User.findById(userId);
  if (!user || user.creditBalance <= 0) return 0;

  const actual = Math.min(user.creditBalance, amountToUse);

  const result = await User.updateOne(
    { _id: userId, creditBalance: { $gte: actual } },
    { $inc: { creditBalance: -actual } }
  );

  return result.modifiedCount > 0 ? actual : 0;
}

module.exports = {
  getSettings,
  handleNewOrder,
  maybeValidateReferral,
  cancelReferralOnOrderCancel,
  refundCreditOnCancel,
  deductCredit,
};

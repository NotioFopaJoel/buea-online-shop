const env = require('../config/environment');
const Payment = require('../models/Payment');

/**
 * BUEA ONLINE SHOP v1 uses "pay after delivery" - no money moves at checkout.
 * This service exists so that when MTN Mobile Money / Orange Money APIs are
 * ready, only THIS file needs to change (order.controller.js and the
 * checkout UI never call MTN/Orange directly).
 */

/**
 * Creates a Payment record in PENDING state when an order is placed.
 * No external API call happens here in v1.
 */
async function initializePayment(order) {
  const payment = await Payment.create({
    order: order._id,
    method: order.paymentMethod,
    amount: order.total,
    status: 'PENDING',
  });
  return payment;
}

/**
 * Mock MTN Mobile Money charge. Replace the body with a real call to the
 * MTN MoMo API once MTN_API_KEY / MTN_API_SECRET are configured.
 * Kept async and same-shaped as a real gateway response so swapping it out
 * later doesn't require touching callers.
 */
async function chargeMTNMobileMoney({ phone, amount, reference }) {
  if (!env.MTN_API_KEY) {
    return {
      success: false,
      mocked: true,
      message: 'MTN Mobile Money API not configured yet. Payment stays Pending until confirmed manually.',
    };
  }
  // TODO: integrate real MTN MoMo Collection API call here.
  return { success: false, mocked: true, message: 'MTN integration not implemented yet.' };
}

/**
 * Mock Orange Money charge. Same rationale as chargeMTNMobileMoney above.
 */
async function chargeOrangeMoney({ phone, amount, reference }) {
  if (!env.ORANGE_API_KEY) {
    return {
      success: false,
      mocked: true,
      message: 'Orange Money API not configured yet. Payment stays Pending until confirmed manually.',
    };
  }
  // TODO: integrate real Orange Money Web Payment API call here.
  return { success: false, mocked: true, message: 'Orange integration not implemented yet.' };
}

/**
 * Marks a payment (and its order) as Paid. This is what the admin dashboard
 * calls today ("Mark payment as Paid" button) after manually confirming
 * cash/mobile-money receipt from the customer post-delivery.
 */
async function markPaymentPaid(paymentId, confirmedByUserId, notes = '') {
  const payment = await Payment.findById(paymentId);
  if (!payment) {
    const err = new Error('Payment record not found');
    err.statusCode = 404;
    throw err;
  }
  payment.status = 'PAID';
  payment.confirmedBy = confirmedByUserId;
  payment.confirmedAt = new Date();
  if (notes) payment.notes = notes;
  await payment.save();
  return payment;
}

module.exports = {
  initializePayment,
  chargeMTNMobileMoney,
  chargeOrangeMoney,
  markPaymentPaid,
};

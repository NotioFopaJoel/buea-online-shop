const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const paymentService = require('../services/payment.service');

/**
 * GET /api/payments/order/:orderId
 */
const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return errorResponse(res, 404, 'Payment record not found');
  return successResponse(res, 200, 'Payment fetched', { payment });
});

/**
 * PUT /api/payments/:id/confirm
 * Admin manually confirms a payment was received after delivery
 * (MTN/Orange automation can call this same flow once wired up in payment.service.js).
 */
const confirmPayment = asyncHandler(async (req, res) => {
  const { notes } = req.body;
  const payment = await paymentService.markPaymentPaid(req.params.id, req.user._id, notes);

  await Order.findByIdAndUpdate(payment.order, { paymentStatus: 'PAID', paidAt: new Date() });

  return successResponse(res, 200, 'Payment confirmed as Paid', { payment });
});

module.exports = { getPaymentByOrder, confirmPayment };

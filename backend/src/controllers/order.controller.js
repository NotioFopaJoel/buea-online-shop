const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Order = require('../models/Order');
const User = require('../models/User');
const orderService = require('../services/order.service');
const paymentService = require('../services/payment.service');
const whatsappService = require('../services/whatsapp.service');
const notificationService = require('../services/notification.service');
const generateOrderNumber = require('../utils/generateOrderNumber');

/**
 * POST /api/orders
 * Creates an order for a logged-in user OR a guest.
 * This is the single most important endpoint in the platform: it must never
 * trust client-sent prices/fees, and must enforce Buea-only delivery and the
 * 10,000 FCFA free-delivery threshold server-side (brief sections 47 & 65).
 */
const createOrder = asyncHandler(async (req, res) => {
  const {
    items: requestedItems,
    shippingAddress,
    paymentMethod,
    couponCode,
    lang = 'en',
  } = req.body;

  if (!shippingAddress || !shippingAddress.neighborhood || !shippingAddress.address || !shippingAddress.phone || !shippingAddress.fullName) {
    return errorResponse(res, 400, 'Complete shipping information is required');
  }
  if (!['MTN_MOBILE_MONEY', 'ORANGE_MONEY'].includes(paymentMethod)) {
    return errorResponse(res, 400, 'A valid payment method (MTN Mobile Money or Orange Money) is required');
  }

  // 1. Verify Buea-only delivery zone
  const validatedCity = await orderService.validateDeliveryZone(
    shippingAddress.city || 'Buea',
    shippingAddress.neighborhood
  );

  // 2. Rebuild items + subtotal purely from the database (never trust client prices)
  const { items, subtotal } = await orderService.buildVerifiedItems(requestedItems);

  // 3. Apply coupon if provided
  let discount = 0;
  if (couponCode) {
    const result = await orderService.calculateDiscount(subtotal, couponCode);
    discount = result.discount;
  }

  // 4. Calculate delivery fee: FREE at/above 10,000 FCFA, else 1,000 FCFA
  const deliveryFee = await orderService.calculateDeliveryFee(subtotal - discount);

  const total = subtotal - discount + deliveryFee;

  // 5. Create the order
  const orderNumber = await generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user ? req.user._id : null,
    isGuestOrder: !req.user,
    items,
    shippingAddress: { ...shippingAddress, city: validatedCity },
    subtotal,
    deliveryFee,
    discount,
    total,
    couponCode: couponCode || '',
    paymentMethod,
    paymentStatus: 'PENDING',
    orderStatus: 'PENDING_CONFIRMATION',
  });

  // 6. Reserve/deduct stock
  await orderService.deductStock(items);

  // 7. Initialize payment record (pending - no charge happens now, see payment.service.js)
  await paymentService.initializePayment(order);

  // 8. Generate the WhatsApp confirmation link from REAL order data
  const whatsappLink = await whatsappService.buildWhatsAppLink(order, lang);

  return successResponse(res, 201, 'Order placed successfully', {
    order,
    whatsappLink,
    notification: notificationService.getNotification('ORDER_RECEIVED', lang),
  });
});

/**
 * GET /api/orders - orders for the logged-in user
 */
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  return successResponse(res, 200, 'Orders fetched', { orders });
});

/**
 * GET /api/orders/:id
 */
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  // Owner, or admin/seller can view
  const isOwner = req.user && order.user && String(order.user) === String(req.user._id);
  const isStaff = req.user && ['admin', 'seller'].includes(req.user.role);
  if (!isOwner && !isStaff) return errorResponse(res, 403, 'Not authorized to view this order');

  return successResponse(res, 200, 'Order fetched', { order });
});

/**
 * GET /api/orders/track/:orderNumber - public order tracking, no auth required
 */
const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber }).select(
    'orderNumber orderStatus paymentStatus whatsappStatus createdAt deliveredAt items subtotal deliveryFee discount total shippingAddress.neighborhood shippingAddress.city'
  );
  if (!order) return errorResponse(res, 404, 'No order found with this order number');
  return successResponse(res, 200, 'Order status fetched', { order });
});

/**
 * PUT /api/orders/:id/whatsapp-status - mark that the WhatsApp link was opened/contacted
 */
const updateWhatsAppStatus = asyncHandler(async (req, res) => {
  const { whatsappStatus } = req.body; // LINK_OPENED | CONTACTED | CONFIRMED
  const order = await Order.findById(req.params.id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  order.whatsappStatus = whatsappStatus;
  if (whatsappStatus === 'CONTACTED' && !order.whatsappContactedAt) {
    order.whatsappContactedAt = new Date();
    order.orderStatus = 'WHATSAPP_CONTACTED';
  }
  if (whatsappStatus === 'CONFIRMED') {
    order.whatsappConfirmedAt = new Date();
    order.orderStatus = 'CONFIRMED';
  }
  await order.save();
  return successResponse(res, 200, 'WhatsApp status updated', { order });
});

/**
 * PUT /api/orders/:id/status - admin/seller updates order status (dashboard action)
 */
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, cancelReason } = req.body;
  const validStatuses = [
    'PENDING_CONFIRMATION', 'WHATSAPP_CONTACTED', 'CONFIRMED', 'PROCESSING',
    'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
  ];
  if (!validStatuses.includes(orderStatus)) {
    return errorResponse(res, 400, 'Invalid order status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  order.orderStatus = orderStatus;
  if (orderStatus === 'DELIVERED') order.deliveredAt = new Date();
  if (orderStatus === 'CANCELLED') {
    order.cancelledAt = new Date();
    order.cancelReason = cancelReason || '';
  }

  await order.save();
  return successResponse(res, 200, 'Order status updated', { order });
});

/**
 * PUT /api/orders/:id/payment-status - admin marks "Paid" after delivery, per pay-after-delivery model
 */
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  if (!['PENDING', 'PAID', 'FAILED', 'CANCELLED'].includes(paymentStatus)) {
    return errorResponse(res, 400, 'Invalid payment status');
  }

  const order = await Order.findById(req.params.id);
  if (!order) return errorResponse(res, 404, 'Order not found');

  order.paymentStatus = paymentStatus;
  if (paymentStatus === 'PAID') order.paidAt = new Date();
  await order.save();

  return successResponse(res, 200, 'Payment status updated', { order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  updateWhatsAppStatus,
  updateOrderStatus,
  updatePaymentStatus,
};

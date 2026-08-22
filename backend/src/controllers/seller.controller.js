const { asyncHandler, successResponse } = require('../utils/response');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * GET /api/seller/dashboard
 * Stats scoped to items sold by this seller only (order.items.sellerId).
 */
const getSellerDashboard = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;

  const [totalProducts, orders] = await Promise.all([
    Product.countDocuments({ sellerId, isActive: true }),
    Order.find({ 'items.sellerId': sellerId }),
  ]);

  let totalSales = 0;
  let totalOrders = 0;
  let pendingOrders = 0;

  orders.forEach((order) => {
    const sellerItems = order.items.filter((item) => String(item.sellerId) === String(sellerId));
    if (!sellerItems.length) return;
    totalOrders += 1;
    if (['PENDING_CONFIRMATION', 'WHATSAPP_CONTACTED'].includes(order.orderStatus)) pendingOrders += 1;
    if (order.paymentStatus === 'PAID') {
      totalSales += sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    }
  });

  return successResponse(res, 200, 'Seller dashboard fetched', {
    totalProducts, totalOrders, pendingOrders, totalSales,
  });
});

/**
 * GET /api/seller/orders
 * Orders that contain at least one of this seller's products.
 */
const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const orders = await Order.find({ 'items.sellerId': sellerId }).sort({ createdAt: -1 }).limit(100);
  return successResponse(res, 200, 'Seller orders fetched', { orders });
});

/**
 * GET /api/seller/earnings
 * Paid-order earnings broken down, scoped to this seller's items only.
 */
const getSellerEarnings = asyncHandler(async (req, res) => {
  const sellerId = req.user._id;
  const orders = await Order.find({ 'items.sellerId': sellerId, paymentStatus: 'PAID' }).sort({ paidAt: -1 });

  const earnings = orders.map((order) => {
    const sellerItems = order.items.filter((item) => String(item.sellerId) === String(sellerId));
    const amount = sellerItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { orderNumber: order.orderNumber, amount, paidAt: order.paidAt, items: sellerItems.length };
  });

  const totalEarnings = earnings.reduce((sum, e) => sum + e.amount, 0);

  return successResponse(res, 200, 'Seller earnings fetched', { earnings, totalEarnings });
});

module.exports = { getSellerDashboard, getSellerOrders, getSellerEarnings };

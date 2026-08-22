const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const DeliveryZone = require('../models/DeliveryZone');
const Settings = require('../models/Settings');
const Coupon = require('../models/Coupon');

/**
 * GET /api/admin/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalOrders, pendingOrders, deliveredOrders, totalCustomers, totalProducts,
    paidOrders,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: { $in: ['PENDING_CONFIRMATION', 'WHATSAPP_CONTACTED'] } }),
    Order.countDocuments({ orderStatus: 'DELIVERED' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments({ isActive: true }),
    Order.find({ paymentStatus: 'PAID' }).select('total'),
  ]);

  const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0);

  // Last 30 days sales trend for charts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } }).select('createdAt total orderStatus');

  return successResponse(res, 200, 'Dashboard stats fetched', {
    totalSales,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    totalCustomers,
    totalProducts,
    recentOrders,
  });
});

/**
 * GET /api/admin/orders - with filters used by the Orders dashboard section (brief #60)
 */
const getAdminOrders = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (orderStatus) filter.orderStatus = orderStatus;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Orders fetched', { orders }, { total, page: Number(page), limit: Number(limit) });
});

// ---------- Delivery Zones (brief #46) ----------

const getDeliveryZones = asyncHandler(async (req, res) => {
  const zones = await DeliveryZone.find().sort({ sortOrder: 1, neighborhood: 1 });
  return successResponse(res, 200, 'Delivery zones fetched', { zones });
});

/**
 * Public version (no admin auth) used by the checkout page to populate the
 * neighborhood selector. Only returns active zones.
 */
const getPublicDeliveryZones = asyncHandler(async (req, res) => {
  const zones = await DeliveryZone.find({ isActive: true }).sort({ sortOrder: 1, neighborhood: 1 });
  return successResponse(res, 200, 'Delivery zones fetched', { zones });
});

/**
 * Public settings subset (WhatsApp number is NOT exposed here for spam reasons
 * beyond what's needed; the frontend only needs delivery/threshold info + support contacts).
 */
const getPublicSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  const {
    deliveryFreeThreshold, deliveryFeeStandard, activeDeliveryCity, supportEmail, supportPhone, socialLinks,
  } = settings;
  return successResponse(res, 200, 'Settings fetched', {
    settings: { deliveryFreeThreshold, deliveryFeeStandard, activeDeliveryCity, supportEmail, supportPhone, socialLinks },
  });
});

const createDeliveryZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.create(req.body);
  return successResponse(res, 201, 'Delivery zone created', { zone });
});

const updateDeliveryZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!zone) return errorResponse(res, 404, 'Delivery zone not found');
  return successResponse(res, 200, 'Delivery zone updated', { zone });
});

const deleteDeliveryZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
  if (!zone) return errorResponse(res, 404, 'Delivery zone not found');
  return successResponse(res, 200, 'Delivery zone deleted');
});

// ---------- Settings (WhatsApp number, brief #53) ----------

const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return successResponse(res, 200, 'Settings fetched', { settings });
});

const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings({});
  Object.assign(settings, req.body);
  await settings.save();
  return successResponse(res, 200, 'Settings updated', { settings });
});

// ---------- Coupons ----------

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  return successResponse(res, 200, 'Coupons fetched', { coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  return successResponse(res, 201, 'Coupon created', { coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return errorResponse(res, 404, 'Coupon not found');
  return successResponse(res, 200, 'Coupon updated', { coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) return errorResponse(res, 404, 'Coupon not found');
  return successResponse(res, 200, 'Coupon deleted');
});

module.exports = {
  getDashboardStats,
  getAdminOrders,
  getDeliveryZones,
  getPublicDeliveryZones,
  getPublicSettings,
  createDeliveryZone,
  updateDeliveryZone,
  deleteDeliveryZone,
  getSettings,
  updateSettings,
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
};

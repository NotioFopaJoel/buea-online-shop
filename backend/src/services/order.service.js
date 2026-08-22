const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Settings = require('../models/Settings');
const DeliveryZone = require('../models/DeliveryZone');
const env = require('../config/environment');

/**
 * Computes the delivery fee from a subtotal, per business rule (section 47/65 of brief):
 *   subtotal < threshold  -> DELIVERY_FEE_STANDARD
 *   subtotal >= threshold -> 0 (free)
 * Reads threshold/fee from Settings (admin-configurable) with .env as fallback.
 */
async function calculateDeliveryFee(subtotal) {
  const settings = await Settings.findOne();
  const threshold = (settings && settings.deliveryFreeThreshold) || env.DELIVERY_FREE_THRESHOLD;
  const standardFee = (settings && settings.deliveryFeeStandard) || env.DELIVERY_FEE_STANDARD;

  return subtotal >= threshold ? 0 : standardFee;
}

/**
 * Applies a coupon (if provided) to a subtotal and returns the discount amount.
 * Throws if the coupon is invalid, expired, or below its minimum order value.
 */
async function calculateDiscount(subtotal, couponCode) {
  if (!couponCode) return 0;

  const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
  if (!coupon || !coupon.isValidNow()) {
    const err = new Error('Invalid or expired coupon code');
    err.statusCode = 400;
    throw err;
  }
  if (subtotal < coupon.minimumOrder) {
    const err = new Error(`This coupon requires a minimum order of ${coupon.minimumOrder} FCFA`);
    err.statusCode = 400;
    throw err;
  }

  let discount = coupon.type === 'PERCENTAGE' ? (subtotal * coupon.value) / 100 : coupon.value;

  if (coupon.maximumDiscount && discount > coupon.maximumDiscount) {
    discount = coupon.maximumDiscount;
  }
  if (discount > subtotal) discount = subtotal;

  return { discount: Math.round(discount), coupon };
}

/**
 * Validates and rebuilds an order's items purely from the database.
 * Never trusts prices, names, or images sent by the client - only product IDs and quantities.
 * Throws a descriptive error (with statusCode) on any invalid product, insufficient stock, etc.
 *
 * @param {Array<{productId, quantity, color, size}>} requestedItems
 * @returns {Promise<{items: Array, subtotal: number}>}
 */
async function buildVerifiedItems(requestedItems) {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    const err = new Error('Order must contain at least one item');
    err.statusCode = 400;
    throw err;
  }

  const items = [];
  let subtotal = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const reqItem of requestedItems) {
    // eslint-disable-next-line no-await-in-loop
    const product = await Product.findById(reqItem.productId);

    if (!product || !product.isActive) {
      const err = new Error(`Product not found or unavailable: ${reqItem.productId}`);
      err.statusCode = 404;
      throw err;
    }

    const quantity = Number(reqItem.quantity) || 1;

    if (product.stock < quantity) {
      const err = new Error(`Insufficient stock for "${product.name}". Available: ${product.stock}`);
      err.statusCode = 400;
      throw err;
    }

    items.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || '',
      price: product.price, // server truth, ignores any client-sent price
      quantity,
      color: reqItem.color || '',
      size: reqItem.size || '',
      sellerId: product.sellerId || null,
    });

    subtotal += product.price * quantity;
  }

  return { items, subtotal };
}

/**
 * Validates that the requested city/neighborhood is currently deliverable.
 * v1 only supports Buea, but this reads from DeliveryZone so it's admin-extensible.
 */
async function validateDeliveryZone(city, neighborhood) {
  const settings = await Settings.findOne();
  const activeCity = (settings && settings.activeDeliveryCity) || env.DEFAULT_DELIVERY_CITY;

  if (city.trim().toLowerCase() !== activeCity.trim().toLowerCase()) {
    const err = new Error(`Delivery is currently available only in ${activeCity}.`);
    err.statusCode = 400;
    throw err;
  }

  const zone = await DeliveryZone.findOne({
    city: { $regex: new RegExp(`^${activeCity}$`, 'i') },
    neighborhood: { $regex: new RegExp(`^${neighborhood}$`, 'i') },
    isActive: true,
  });

  // If no zones have been seeded yet, don't hard-block checkout - only enforce once zones exist.
  const anyZonesExist = await DeliveryZone.exists({ city: activeCity });
  if (anyZonesExist && !zone) {
    const err = new Error(`We do not currently deliver to "${neighborhood}". Please choose a valid area in ${activeCity}.`);
    err.statusCode = 400;
    throw err;
  }

  return activeCity;
}

/**
 * Deducts stock for each purchased item. Called only after the order is successfully created.
 */
async function deductStock(items) {
  const bulkOps = items.map((item) => ({
    updateOne: {
      filter: { _id: item.product, stock: { $gte: item.quantity } },
      update: { $inc: { stock: -item.quantity } },
    },
  }));
  if (bulkOps.length) {
    await Product.bulkWrite(bulkOps);
  }
}

module.exports = {
  calculateDeliveryFee,
  calculateDiscount,
  buildVerifiedItems,
  validateDeliveryZone,
  deductStock,
};

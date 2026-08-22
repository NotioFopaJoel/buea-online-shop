const Order = require('../models/Order');

/**
 * Generates a unique, human-friendly order number: BOS-10000, BOS-10001, ...
 * Retries on the rare collision instead of trusting a single count() call,
 * since count() can race under concurrent checkouts.
 */
async function generateOrderNumber() {
  const totalOrders = await Order.countDocuments();
  let candidate = 10000 + totalOrders;
  let orderNumber = `BOS-${candidate}`;

  // Guard against collisions (e.g. two orders created in the same millisecond)
  // eslint-disable-next-line no-await-in-loop
  while (await Order.exists({ orderNumber })) {
    candidate += 1;
    orderNumber = `BOS-${candidate}`;
  }

  return orderNumber;
}

module.exports = generateOrderNumber;

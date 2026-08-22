const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Recomputes and persists a product's average rating + review count.
 */
async function recalculateProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const rating = reviewCount ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount : 0;
  await Product.findByIdAndUpdate(productId, { rating: Math.round(rating * 10) / 10, reviewCount });
}

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return successResponse(res, 200, 'Reviews fetched', { reviews, distribution });
});

const createReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, comment, images = [] } = req.body;

  if (!rating || !comment) return errorResponse(res, 400, 'Rating and comment are required');

  // Verify the purchase: the order must belong to this user, be delivered,
  // and contain this exact product.
  const order = await Order.findOne({ _id: orderId, user: req.user._id, orderStatus: 'DELIVERED' });
  if (!order) {
    return errorResponse(res, 403, 'You can only review products from delivered orders you purchased');
  }
  const purchasedProduct = order.items.find((item) => String(item.product) === String(productId));
  if (!purchasedProduct) {
    return errorResponse(res, 403, 'This product was not part of the specified order');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: orderId,
    rating,
    comment,
    images,
    verifiedPurchase: true,
  });

  await recalculateProductRating(productId);

  return successResponse(res, 201, 'Review submitted', { review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return errorResponse(res, 404, 'Review not found');

  const isOwner = String(review.user) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    return errorResponse(res, 403, 'Not authorized to delete this review');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  return successResponse(res, 200, 'Review deleted');
});

module.exports = { getProductReviews, createReview, deleteReview };

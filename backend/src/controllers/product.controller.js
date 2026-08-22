const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Product = require('../models/Product');

/**
 * GET /api/products
 * Supports: search (q), category, brand, minPrice, maxPrice, rating, discount,
 * color, size, inStock, sort, page, limit
 */
const getProducts = asyncHandler(async (req, res) => {
  const {
    q, category, brand, minPrice, maxPrice, rating, discount, color, size,
    inStock, isFeatured, isBestSeller, isNewArrival, isDealOfTheDay, sellerId,
    sort = 'newest', page = 1, limit = 20,
  } = req.query;

  const filter = { isActive: true };

  if (q) filter.$text = { $search: q };
  if (category) filter.category = category;
  if (sellerId) filter.sellerId = sellerId;
  if (brand) filter.brand = { $regex: brand, $options: 'i' };
  if (color) filter.colors = color;
  if (size) filter.sizes = size;
  if (inStock === 'true') filter.stock = { $gt: 0 };
  if (isFeatured === 'true') filter.isFeatured = true;
  if (isBestSeller === 'true') filter.isBestSeller = true;
  if (isNewArrival === 'true') filter.isNewArrival = true;
  if (isDealOfTheDay === 'true') filter.isDealOfTheDay = true;
  if (rating) filter.rating = { $gte: Number(rating) };
  if (discount) filter.discount = { $gte: Number(discount) };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    newest: { createdAt: -1 },
    popular: { reviewCount: -1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
    best_rated: { rating: -1 },
  };
  const sortBy = sortMap[sort] || sortMap.newest;

  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name nameFr slug').sort(sortBy).skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Products fetched', { products }, {
    total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)),
  });
});

const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name nameFr slug')
    .populate('subcategory', 'name nameFr slug')
    .populate('sellerId', 'name sellerProfile.shopName');

  if (!product) return errorResponse(res, 404, 'Product not found');

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(8);

  return successResponse(res, 200, 'Product fetched', { product, relatedProducts });
});

const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  // If the creator is a seller (not admin), force sellerId to themselves
  if (req.user.role === 'seller') {
    body.sellerId = req.user._id;
  }

  const product = await Product.create(body);
  return successResponse(res, 201, 'Product created', { product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 404, 'Product not found');

  // Sellers may only edit their own products
  if (req.user.role === 'seller' && String(product.sellerId) !== String(req.user._id)) {
    return errorResponse(res, 403, 'You can only edit your own products');
  }

  Object.assign(product, req.body);
  await product.save();
  return successResponse(res, 200, 'Product updated', { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return errorResponse(res, 404, 'Product not found');

  if (req.user.role === 'seller' && String(product.sellerId) !== String(req.user._id)) {
    return errorResponse(res, 403, 'You can only delete your own products');
  }

  // Soft delete to preserve order history integrity
  product.isActive = false;
  await product.save();
  return successResponse(res, 200, 'Product removed');
});

module.exports = { getProducts, getProductBySlug, createProduct, updateProduct, deleteProduct };

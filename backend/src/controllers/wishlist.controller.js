const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products');
  if (!wishlist) wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  return successResponse(res, 200, 'Wishlist fetched', { wishlist });
});

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findById(productId);
  if (!product) return errorResponse(res, 404, 'Product not found');

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });

  if (!wishlist.products.some((p) => String(p) === String(productId))) {
    wishlist.products.push(productId);
    await wishlist.save();
  }

  await wishlist.populate('products');
  return successResponse(res, 200, 'Added to wishlist', { wishlist });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await Wishlist.findOneAndUpdate(
    { user: req.user._id },
    { $pull: { products: req.params.productId } },
    { new: true }
  ).populate('products');

  if (!wishlist) return errorResponse(res, 404, 'Wishlist not found');
  return successResponse(res, 200, 'Removed from wishlist', { wishlist });
});

module.exports = { getWishlist, addToWishlist, removeFromWishlist };

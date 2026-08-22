const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }
  return successResponse(res, 200, 'Cart fetched', { cart });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, color = '', size = '' } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) return errorResponse(res, 404, 'Product not found');
  if (product.stock < quantity) return errorResponse(res, 400, `Only ${product.stock} in stock`);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existingItem = cart.items.find(
    (item) => String(item.product) === String(productId) && item.color === color && item.size === size
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
    existingItem.priceSnapshot = product.price;
  } else {
    cart.items.push({ product: productId, quantity, color, size, priceSnapshot: product.price });
  }

  await cart.save();
  await cart.populate('items.product');
  return successResponse(res, 200, 'Added to cart', { cart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return errorResponse(res, 404, 'Cart not found');

  const item = cart.items.id(req.params.itemId);
  if (!item) return errorResponse(res, 404, 'Cart item not found');

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  await cart.populate('items.product');
  return successResponse(res, 200, 'Cart updated', { cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return errorResponse(res, 404, 'Cart not found');

  cart.items = cart.items.filter((item) => String(item._id) !== req.params.itemId);
  await cart.save();
  await cart.populate('items.product');
  return successResponse(res, 200, 'Item removed from cart', { cart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] }, { new: true });
  return successResponse(res, 200, 'Cart cleared', { cart });
});

module.exports = { getCart, addToCart, updateCartItem, removeCartItem, clearCart };

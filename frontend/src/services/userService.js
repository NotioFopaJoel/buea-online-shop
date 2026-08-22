import api from './api';

export default {
  // Cart
  getCart() {
    return api.get('/cart');
  },
  addToCart(payload) {
    return api.post('/cart', payload);
  },
  updateCartItem(itemId, quantity) {
    return api.put(`/cart/${itemId}`, { quantity });
  },
  removeCartItem(itemId) {
    return api.delete(`/cart/${itemId}`);
  },
  clearCart() {
    return api.delete('/cart');
  },

  // Wishlist
  getWishlist() {
    return api.get('/wishlist');
  },
  addToWishlist(productId) {
    return api.post('/wishlist', { productId });
  },
  removeFromWishlist(productId) {
    return api.delete(`/wishlist/${productId}`);
  },

  // Admin - user management
  getAllUsers(params = {}) {
    return api.get('/users', { params });
  },
  updateUserStatus(id, isActive) {
    return api.put(`/users/${id}/status`, { isActive });
  },
  updateUserRole(id, role) {
    return api.put(`/users/${id}/role`, { role });
  },
};

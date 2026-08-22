import api from './api';

export default {
  getProducts(params = {}) {
    return api.get('/products', { params });
  },
  getProductBySlug(slug) {
    return api.get(`/products/${slug}`);
  },
  getProductReviews(productId) {
    return api.get(`/products/${productId}/reviews`);
  },
  createReview(payload) {
    return api.post('/reviews', payload);
  },
  getCategories() {
    return api.get('/categories');
  },
  getCategoryBySlug(slug) {
    return api.get(`/categories/${slug}`);
  },
};

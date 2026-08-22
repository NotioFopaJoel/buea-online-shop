import { defineStore } from 'pinia';
import productService from '../services/productService';

export const useProductStore = defineStore('product', {
  state: () => ({
    products: [],
    total: 0,
    totalPages: 1,
    currentProduct: null,
    relatedProducts: [],
    categories: [],
    loading: false,
    error: null,
    recentlyViewed: JSON.parse(localStorage.getItem('bos_recently_viewed') || '[]'),
  }),

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res = await productService.getProducts(params);
        this.products = res.data.products;
        this.total = res.meta?.total || 0;
        this.totalPages = res.meta?.totalPages || 1;
        return res;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchProductBySlug(slug) {
      this.loading = true;
      this.error = null;
      try {
        const res = await productService.getProductBySlug(slug);
        this.currentProduct = res.data.product;
        this.relatedProducts = res.data.relatedProducts;
        this.addToRecentlyViewed(res.data.product);
        return res.data.product;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        const res = await productService.getCategories();
        this.categories = res.data.categories;
        return res.data.categories;
      } catch (err) {
        this.error = err.message;
        throw err;
      }
    },

    addToRecentlyViewed(product) {
      const filtered = this.recentlyViewed.filter((p) => p._id !== product._id);
      filtered.unshift({ _id: product._id, name: product.name, slug: product.slug, price: product.price, images: product.images });
      this.recentlyViewed = filtered.slice(0, 10);
      localStorage.setItem('bos_recently_viewed', JSON.stringify(this.recentlyViewed));
    },
  },
});

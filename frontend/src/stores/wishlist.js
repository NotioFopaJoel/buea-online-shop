import { defineStore } from 'pinia';
import userService from '../services/userService';
import { useAuthStore } from './auth';

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),

  getters: {
    count: (state) => state.products.length,
    isInWishlist: (state) => (productId) => state.products.some((p) => p._id === productId),
  },

  actions: {
    async fetchWishlist() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      this.loading = true;
      try {
        const res = await userService.getWishlist();
        this.products = res.data.wishlist.products;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    async toggle(product) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        const err = new Error('Please sign in to use your wishlist');
        err.requiresAuth = true;
        throw err;
      }

      if (this.isInWishlist(product._id)) {
        const res = await userService.removeFromWishlist(product._id);
        this.products = res.data.wishlist.products;
      } else {
        const res = await userService.addToWishlist(product._id);
        this.products = res.data.wishlist.products;
      }
    },
  },
});

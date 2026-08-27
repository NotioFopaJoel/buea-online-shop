import { defineStore } from 'pinia';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('bos_user') || 'null'),
    token: localStorage.getItem('bos_token') || null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isSeller: (state) => state.user?.role === 'seller',
  },

  actions: {
    persist(user, token) {
      this.user = user;
      this.token = token;
      localStorage.setItem('bos_user', JSON.stringify(user));
      localStorage.setItem('bos_token', token);
    },

    async register(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await authService.register(payload);
        this.persist(res.data.user, res.data.token);
        // New accounts start with an empty cart.
        import('./cart').then(({ useCartStore }) => useCartStore().clearCart());
        return res;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async login(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await authService.login(payload);
        this.persist(res.data.user, res.data.token);
        // Load this account's own cart so it never bleeds over from another user.
        const { useCartStore } = await import('./cart');
        await useCartStore().loadFromServer();
        return res;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('bos_user');
      localStorage.removeItem('bos_token');
      // Clear the shared local cart so it doesn't carry to the next account.
      import('./cart').then(({ useCartStore }) => useCartStore().clearCart());
    },

    async fetchProfile() {
      if (!this.token) return;
      try {
        const res = await authService.getProfile();
        this.user = res.data.user;
        localStorage.setItem('bos_user', JSON.stringify(this.user));
      } catch (err) {
        // Token likely expired - api.js interceptor already clears storage on 401
        this.logout();
      }
    },
  },
});

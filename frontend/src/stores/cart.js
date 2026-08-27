import { defineStore } from 'pinia';
import userService from '../services/userService';
import { useAuthStore } from './auth';

const CART_STORAGE_KEY = 'bos_cart';

function loadLocalCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

/**
 * Cart works locally (localStorage) for guests, which lets BUEA ONLINE SHOP
 * support Guest Checkout (brief #66) without forcing an account. When a user
 * is authenticated, the same local list is also mirrored to the backend cart
 * so it's available across devices.
 *
 * Each local item shape: { id, product: {...snapshot}, quantity, color, size }
 */
export const useCartStore = defineStore('cart', {
  state: () => ({
    items: loadLocalCart(),
  }),

  getters: {
    itemCount: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: (state) => state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    isEmpty: (state) => state.items.length === 0,
  },

  actions: {
    persist() {
      saveLocalCart(this.items);
    },

    addItem(product, quantity = 1, color = '', size = '') {
      const existing = this.items.find(
        (i) => i.product._id === product._id && i.color === color && i.size === size
      );
      if (existing) {
        existing.quantity += quantity;
      } else {
        this.items.push({
          id: `${product._id}-${color}-${size}-${Date.now()}`,
          product,
          quantity,
          color,
          size,
        });
      }
      this.persist();
      this.syncToBackend();
    },

    updateQuantity(itemId, quantity) {
      const item = this.items.find((i) => i.id === itemId);
      if (!item) return;
      if (quantity <= 0) {
        this.removeItem(itemId);
        return;
      }
      item.quantity = quantity;
      this.persist();
    },

    removeItem(itemId) {
      this.items = this.items.filter((i) => i.id !== itemId);
      this.persist();
    },

    clearCart() {
      this.items = [];
      this.persist();
    },

    /**
     * Replaces the local cart with the authenticated user's server-side cart.
     * Called after login so each account keeps its own cart.
     */
    async loadFromServer() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        this.clearCart();
        return;
      }
      try {
        const res = await userService.getCart();
        const serverItems = ((res.data.cart && res.data.cart.items) || []).map((ci) => ({
          id: `${ci.product?._id || ci.product}-${ci.color || ''}-${ci.size || ''}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          product: ci.product || { _id: ci.product, price: 0, name: 'Unknown', images: [] },
          quantity: ci.quantity,
          color: ci.color || '',
          size: ci.size || '',
        }));
        this.items = serverItems;
        this.persist();
      } catch {
        // Non-blocking - keep current local cart
      }
    },

    /**
     * Best-effort sync to the authenticated user's server-side cart.
     * Failures are silent - the local cart (source of truth for checkout)
     * still works even if the backend sync fails.
     */
    async syncToBackend() {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      try {
        const lastItem = this.items[this.items.length - 1];
        if (lastItem) {
          await userService.addToCart({
            productId: lastItem.product._id,
            quantity: lastItem.quantity,
            color: lastItem.color,
            size: lastItem.size,
          });
        }
      } catch {
        // Non-blocking - local cart already has the data
      }
    },

    /**
     * Builds the payload expected by POST /api/orders - only product IDs and
     * quantities, since the backend always recalculates real prices itself.
     */
    toOrderItems() {
      return this.items.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      }));
    },
  },
});

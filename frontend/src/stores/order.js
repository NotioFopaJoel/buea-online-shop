import { defineStore } from 'pinia';
import orderService from '../services/orderService';

export const useOrderStore = defineStore('order', {
  state: () => ({
    orders: [],
    currentOrder: null,
    lastWhatsappLink: null,
    trackedOrder: null,
    deliveryZones: [],
    publicSettings: null,
    loading: false,
    error: null,
  }),

  actions: {
    /**
     * Places the order. Payload shape: { items, shippingAddress, paymentMethod, couponCode, lang }
     * The backend is the sole source of truth for subtotal/deliveryFee/total (see order.service.js).
     */
    async placeOrder(payload) {
      this.loading = true;
      this.error = null;
      try {
        const res = await orderService.createOrder(payload);
        this.currentOrder = res.data.order;
        this.lastWhatsappLink = res.data.whatsappLink;
        return res.data;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchMyOrders() {
      this.loading = true;
      try {
        const res = await orderService.getMyOrders();
        this.orders = res.data.orders;
        return res.data.orders;
      } catch (err) {
        this.error = err.message;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchOrderById(id) {
      const res = await orderService.getOrderById(id);
      this.currentOrder = res.data.order;
      return res.data.order;
    },

    async trackOrder(orderNumber) {
      this.loading = true;
      this.error = null;
      try {
        const normalized = String(orderNumber || '').trim().replace(/^#/, '');
        const res = await orderService.trackOrder(normalized);
        this.trackedOrder = res.data.order;
        return res.data.order;
      } catch (err) {
        this.error = err.message;
        this.trackedOrder = null;
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async markWhatsappOpened(orderId) {
      try {
        await orderService.updateWhatsAppStatus(orderId, 'LINK_OPENED');
      } catch {
        // Non-critical - don't block the user's WhatsApp flow if this fails
      }
    },

    async fetchDeliveryZones() {
      const res = await orderService.getPublicDeliveryZones();
      this.deliveryZones = res.data.zones;
      return res.data.zones;
    },

    async fetchPublicSettings() {
      const res = await orderService.getPublicSettings();
      this.publicSettings = res.data.settings;
      return res.data.settings;
    },
  },
});

import api from './api';

export default {
  createOrder(payload) {
    return api.post('/orders', payload);
  },
  getMyOrders() {
    return api.get('/orders');
  },
  getOrderById(id) {
    return api.get(`/orders/${id}`);
  },
  trackOrder(orderNumber) {
    return api.get(`/orders/track/${orderNumber}`);
  },
  updateWhatsAppStatus(id, whatsappStatus) {
    return api.put(`/orders/${id}/whatsapp-status`, { whatsappStatus });
  },
  getPublicDeliveryZones() {
    return api.get('/public/delivery-zones');
  },
  getPublicSettings() {
    return api.get('/public/settings');
  },
};

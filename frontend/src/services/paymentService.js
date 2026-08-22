import api from './api';

export default {
  getPaymentByOrder(orderId) {
    return api.get(`/payments/order/${orderId}`);
  },
  confirmPayment(paymentId, notes = '') {
    return api.put(`/payments/${paymentId}/confirm`, { notes });
  },
};

import api from './api';

export default {
  register(payload) {
    return api.post('/auth/register', payload);
  },
  login(payload) {
    return api.post('/auth/login', payload);
  },
  logout() {
    return api.post('/auth/logout');
  },
  getProfile() {
    return api.get('/auth/profile');
  },
  updateProfile(payload) {
    return api.put('/auth/profile', payload);
  },
  addAddress(payload) {
    return api.post('/auth/addresses', payload);
  },
  deleteAddress(addressId) {
    return api.delete(`/auth/addresses/${addressId}`);
  },
  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email });
  },
  resetPassword(token, password) {
    return api.post(`/auth/reset-password/${token}`, { password });
  },
};

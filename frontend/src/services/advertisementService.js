import api from './api';

export default {
  // Public - homepage carousel
  getActiveAds() {
    return api.get('/advertisements/active');
  },
  trackView(id) {
    return api.post(`/advertisements/${id}/view`);
  },
  trackClick(id) {
    return api.post(`/advertisements/${id}/click`);
  },

  // Admin
  getAllAds() {
    return api.get('/advertisements');
  },
  createAd(payload) {
    return api.post('/advertisements', payload);
  },
  updateAd(id, payload) {
    return api.put(`/advertisements/${id}`, payload);
  },
  deleteAd(id) {
    return api.delete(`/advertisements/${id}`);
  },
};

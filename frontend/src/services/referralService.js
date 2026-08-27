import api from './api';

export default {
  getMyReferral() {
    return api.get('/referrals/me');
  },
  getReferralSettings() {
    return api.get('/referrals/settings');
  },
  updateReferralSettings(payload) {
    return api.put('/referrals/settings', payload);
  },
  getReferralStats() {
    return api.get('/referrals/stats');
  },
  getReferrers() {
    return api.get('/referrals');
  },
};

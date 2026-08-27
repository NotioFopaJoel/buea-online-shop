const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Referral = require('../models/Referral');
const User = require('../models/User');
const Settings = require('../models/Settings');
const referralService = require('../services/referral.service');
const env = require('../config/environment');

/**
 * GET /api/referrals/me
 * Returns the logged-in user's referral info: code, link, credit, stats, history.
 */
const getMyReferral = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.referralCode) {
    const generateReferralCode = require('../utils/generateReferralCode');
    user.referralCode = await generateReferralCode(User, user.name);
    await user.save();
  }

  const code = user.referralCode;
  const clientUrl = (env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
  const referralLink = `${clientUrl}/r/${code}`;

  const referrals = await Referral.find({ referrer: user._id })
    .populate('referee', 'name email')
    .sort({ createdAt: -1 });

  const stats = {
    pendingBalance: referrals
      .filter((r) => r.status === 'VALIDATED')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
    pendingRewards: referrals
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
    successfulReferrals: referrals.filter((r) => r.status === 'VALIDATED').length,
    totalEarned: referrals
      .filter((r) => r.status === 'VALIDATED')
      .reduce((sum, r) => sum + r.rewardAmount, 0),
  };

  return successResponse(res, 200, 'Referral info fetched', {
    code,
    referralLink,
    creditBalance: user.creditBalance,
    rewardPercentage: (await referralService.getSettings()).referralRewardPercentage || 2,
    ...stats,
    history: referrals.map((r) => ({
      _id: r._id,
      refereeName: r.referee?.name || 'Unknown',
      status: r.status,
      merchandiseSubtotal: r.merchandiseSubtotal,
      rewardPercentage: r.rewardPercentage,
      rewardAmount: r.rewardAmount,
      createdAt: r.createdAt,
      validatedAt: r.validatedAt,
    })),
  });
});

// ---------- Admin endpoints ----------

/**
 * GET /api/admin/referrals/settings
 */
const getReferralSettings = asyncHandler(async (req, res) => {
  const settings = await referralService.getSettings();
  return successResponse(res, 200, 'Referral settings fetched', {
    referralEnabled: settings.referralEnabled,
    referralRewardPercentage: settings.referralRewardPercentage,
  });
});

/**
 * PUT /api/admin/referrals/settings
 */
const updateReferralSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = new Settings({});

  if (req.body.referralEnabled !== undefined) settings.referralEnabled = req.body.referralEnabled;
  if (req.body.referralRewardPercentage !== undefined) settings.referralRewardPercentage = req.body.referralRewardPercentage;
  await settings.save();

  return successResponse(res, 200, 'Referral settings updated', {
    referralEnabled: settings.referralEnabled,
    referralRewardPercentage: settings.referralRewardPercentage,
  });
});

/**
 * GET /api/admin/referrals/stats
 */
const getReferralStats = asyncHandler(async (req, res) => {
  const referrals = await Referral.find({ status: { $in: ['PENDING', 'VALIDATED'] } });
  const users = await User.find({ referralCode: { $ne: null } }).select('creditBalance');

  const totalRewardsGenerated = referrals
    .filter((r) => r.status === 'VALIDATED')
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  const totalRewardsPending = referrals
    .filter((r) => r.status === 'PENDING')
    .reduce((sum, r) => sum + r.rewardAmount, 0);

  const totalCreditBalance = users.reduce((sum, u) => sum + (u.creditBalance || 0), 0);

  const totalRewardsUsed = totalRewardsGenerated - totalCreditBalance;
  const activeReferrers = new Set(referrals.filter((r) => r.status === 'VALIDATED').map((r) => String(r.referrer))).size;

  const settings = await referralService.getSettings();

  return successResponse(res, 200, 'Referral stats fetched', {
    totalRewardsGenerated,
    totalRewardsPending,
    totalRewardsUsed: totalRewardsUsed > 0 ? totalRewardsUsed : 0,
    totalCreditBalance,
    activeReferrers,
    referralEnabled: settings.referralEnabled,
    referralRewardPercentage: settings.referralRewardPercentage,
  });
});

/**
 * GET /api/admin/referrals
 * List all referrers with aggregated stats.
 */
const getReferrers = asyncHandler(async (req, res) => {
  const referrers = await User.find({ referralCode: { $ne: null } })
    .select('name email referralCode creditBalance')
    .sort({ name: 1 });

  const result = await Promise.all(
    referrers.map(async (user) => {
      const referrals = await Referral.find({ referrer: user._id });
      const validated = referrals.filter((r) => r.status === 'VALIDATED');
      const pending = referrals.filter((r) => r.status === 'PENDING');
      const totalEarned = validated.reduce((sum, r) => sum + r.rewardAmount, 0);
      const totalPending = pending.reduce((sum, r) => sum + r.rewardAmount, 0);

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode,
        creditBalance: user.creditBalance,
        successfulReferrals: validated.length,
        pendingReferrals: pending.length,
        totalEarned,
        totalPending,
      };
    })
  );

  return successResponse(res, 200, 'Referrers fetched', { referrers: result });
});

module.exports = {
  getMyReferral,
  getReferralSettings,
  updateReferralSettings,
  getReferralStats,
  getReferrers,
};

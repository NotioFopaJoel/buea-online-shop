const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Advertisement = require('../models/Advertisement');

/**
 * GET /api/public/advertisements
 * Only ads that are active AND within their scheduled date window (if any),
 * ordered for display. This is what the homepage carousel fetches.
 */
const getActiveAdvertisements = asyncHandler(async (req, res) => {
  const now = new Date();
  const ads = await Advertisement.find({
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  })
    .populate('linkProduct', 'slug name')
    .populate('linkCategory', 'slug name')
    .sort({ sortOrder: 1, createdAt: -1 });

  return successResponse(res, 200, 'Active advertisements fetched', { advertisements: ads });
});

/**
 * POST /api/public/advertisements/:id/view - fire-and-forget impression counter
 */
const trackView = asyncHandler(async (req, res) => {
  await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
  return successResponse(res, 200, 'View tracked');
});

/**
 * POST /api/public/advertisements/:id/click - fire-and-forget click counter
 */
const trackClick = asyncHandler(async (req, res) => {
  await Advertisement.findByIdAndUpdate(req.params.id, { $inc: { clicks: 1 } });
  return successResponse(res, 200, 'Click tracked');
});

// ---------- Admin ----------

const getAllAdvertisements = asyncHandler(async (req, res) => {
  const ads = await Advertisement.find()
    .populate('linkProduct', 'slug name')
    .populate('linkCategory', 'slug name')
    .sort({ sortOrder: 1, createdAt: -1 });
  return successResponse(res, 200, 'Advertisements fetched', { advertisements: ads });
});

const createAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.create(req.body);
  return successResponse(res, 201, 'Advertisement created', { advertisement: ad });
});

const updateAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ad) return errorResponse(res, 404, 'Advertisement not found');
  return successResponse(res, 200, 'Advertisement updated', { advertisement: ad });
});

const deleteAdvertisement = asyncHandler(async (req, res) => {
  const ad = await Advertisement.findByIdAndDelete(req.params.id);
  if (!ad) return errorResponse(res, 404, 'Advertisement not found');
  return successResponse(res, 200, 'Advertisement deleted');
});

module.exports = {
  getActiveAdvertisements,
  trackView,
  trackClick,
  getAllAdvertisements,
  createAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
};

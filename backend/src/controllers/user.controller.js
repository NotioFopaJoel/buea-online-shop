const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const User = require('../models/User');

const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20, search } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(filter),
  ]);

  return successResponse(res, 200, 'Users fetched', { users }, { total, page: Number(page), limit: Number(limit) });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return errorResponse(res, 404, 'User not found');
  return successResponse(res, 200, 'User fetched', { user: user.toSafeJSON() });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) return errorResponse(res, 404, 'User not found');
  return successResponse(res, 200, 'User status updated', { user: user.toSafeJSON() });
});

const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['customer', 'seller', 'admin'].includes(role)) {
    return errorResponse(res, 400, 'Invalid role');
  }
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return errorResponse(res, 404, 'User not found');
  return successResponse(res, 200, 'User role updated', { user: user.toSafeJSON() });
});

const approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'seller') return errorResponse(res, 404, 'Seller not found');
  user.sellerProfile.isApproved = true;
  await user.save();
  return successResponse(res, 200, 'Seller approved', { user: user.toSafeJSON() });
});

module.exports = { getAllUsers, getUserById, updateUserStatus, updateUserRole, approveSeller };

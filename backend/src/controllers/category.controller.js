const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const Category = require('../models/Category');

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parentCategory: null })
    .populate('subcategories')
    .sort({ sortOrder: 1, name: 1 });
  return successResponse(res, 200, 'Categories fetched', { categories });
});

const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).populate('subcategories');
  if (!category) return errorResponse(res, 404, 'Category not found');
  return successResponse(res, 200, 'Category fetched', { category });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  return successResponse(res, 201, 'Category created', { category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return errorResponse(res, 404, 'Category not found');
  return successResponse(res, 200, 'Category updated', { category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!category) return errorResponse(res, 404, 'Category not found');
  return successResponse(res, 200, 'Category removed');
});

module.exports = { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory };

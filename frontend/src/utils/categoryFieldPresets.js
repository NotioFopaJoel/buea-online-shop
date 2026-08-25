export const SHOE_SIZES = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'];
export const KIDS_SHOE_SIZES = ['24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34'];
export const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const KIDS_CLOTHING_SIZES = ['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y', '12-13Y'];
export const RING_SIZES = ['5', '6', '7', '8', '9', '10', '11', '12'];

export const COLOR_PRESETS = ['Black', 'White', 'Blue', 'Red', 'Grey', 'Green', 'Gold', 'Silver', 'Beige', 'Pink', 'Navy', 'Brown'];

/**
 * Returns quick-add size suggestions based on the selected category/subcategory
 * name - the same product form works for every department, but only shows
 * size shortcuts where sizes actually make sense (shoes, clothing, rings...).
 * Returns an empty array when sizes aren't relevant (electronics, home decor...).
 */
export function getSizePresets(categoryLabel) {
  const name = (categoryLabel || '').toLowerCase();
  const isKids = name.includes('kid');

  if (name.includes('shoe')) return isKids ? KIDS_SHOE_SIZES : SHOE_SIZES;
  if (name.includes('ring')) return RING_SIZES;
  if (isKids) return KIDS_CLOTHING_SIZES;
  if (name.includes('clothing') || name.includes("men") || name.includes("women") || name.includes('underwear') || name.includes('lingerie')) {
    return CLOTHING_SIZES;
  }
  return [];
}

/**
 * Whether the Colors field is worth showing at all for this category.
 * Almost everything benefits from a color, so this mostly excludes things
 * like books where it would be noise - kept permissive by default.
 */
export function isColorRelevant(categoryLabel) {
  const name = (categoryLabel || '').toLowerCase();
  return !name.includes('book');
}

/**
 * Formats a number as FCFA currency, e.g. 18000 -> "18,000 FCFA"
 * Used everywhere instead of "$" per brief section 7.
 */
export function formatPrice(amount) {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return '0 FCFA';
  return `${Math.round(Number(amount)).toLocaleString('en-US')} FCFA`;
}

export default formatPrice;

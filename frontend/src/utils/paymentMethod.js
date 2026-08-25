/**
 * Returns the translated display label for a paymentMethod enum value.
 * Centralized so MTN/Orange/Cash are labeled consistently everywhere
 * (order summary, order details, admin dashboards, etc.).
 */
export function paymentMethodLabel(method, uiStore) {
  if (method === 'MTN_MOBILE_MONEY') return uiStore.t('checkout.mtn');
  if (method === 'ORANGE_MONEY') return uiStore.t('checkout.orange');
  if (method === 'CASH') return uiStore.t('checkout.cash');
  return method;
}

export default paymentMethodLabel;

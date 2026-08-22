import { computed } from 'vue';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/order';

export function useCart() {
  const cartStore = useCartStore();
  const orderStore = useOrderStore();

  const items = computed(() => cartStore.items);
  const itemCount = computed(() => cartStore.itemCount);
  const subtotal = computed(() => cartStore.subtotal);

  // Client-side preview only - the backend is the authoritative calculation (brief #47/#65)
  const freeDeliveryThreshold = computed(() => orderStore.publicSettings?.deliveryFreeThreshold ?? 10000);
  const standardDeliveryFee = computed(() => orderStore.publicSettings?.deliveryFeeStandard ?? 1000);
  const estimatedDeliveryFee = computed(() =>
    subtotal.value >= freeDeliveryThreshold.value ? 0 : standardDeliveryFee.value
  );
  const estimatedTotal = computed(() => subtotal.value + estimatedDeliveryFee.value);
  const amountUntilFreeDelivery = computed(() =>
    Math.max(0, freeDeliveryThreshold.value - subtotal.value)
  );

  return {
    items,
    itemCount,
    subtotal,
    estimatedDeliveryFee,
    estimatedTotal,
    freeDeliveryThreshold,
    amountUntilFreeDelivery,
    addItem: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeItem: cartStore.removeItem,
    clearCart: cartStore.clearCart,
  };
}

<template>
  <div class="space-y-5">
    <div>
      <h4 class="text-sm font-semibold mb-2">{{ uiStore.t('checkout.step1') }}</h4>
      <div v-for="item in items" :key="item.id" class="flex justify-between text-sm py-1.5">
        <span style="color: var(--text-secondary);">{{ item.product.name }} x{{ item.quantity }}</span>
        <span class="font-medium">{{ formatPrice(item.product.price * item.quantity) }}</span>
      </div>
    </div>

    <div class="pt-3" style="border-top: 1px solid var(--border-color);">
      <h4 class="text-sm font-semibold mb-1">{{ uiStore.t('checkout.shippingAddress') }}</h4>
      <p class="text-sm" style="color: var(--text-secondary);">{{ address.fullName }} — {{ address.phone }}</p>
      <p class="text-sm" style="color: var(--text-secondary);">{{ address.address }}, {{ address.neighborhood }}, {{ address.city }}</p>
    </div>

    <div class="pt-3" style="border-top: 1px solid var(--border-color);">
      <h4 class="text-sm font-semibold mb-1">{{ uiStore.t('checkout.paymentMethod') }}</h4>
      <p class="text-sm" style="color: var(--text-secondary);">{{ paymentMethodLabel(paymentMethod, uiStore) }} — {{ uiStore.t('checkout.payAfterDeliveryTag') }}</p>
    </div>

    <CartSummary
      :subtotal="subtotal"
      :delivery-fee="deliveryFee"
      :total="total"
      :amount-until-free="0"
    />
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import { formatPrice } from '../../utils/formatPrice';
import { paymentMethodLabel } from '../../utils/paymentMethod';
import CartSummary from '../cart/CartSummary.vue';

defineProps({
  items: { type: Array, required: true },
  address: { type: Object, required: true },
  paymentMethod: { type: String, required: true },
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  total: { type: Number, required: true },
});

const uiStore = useUiStore();
</script>

<template>
  <div class="space-y-5">
    <div>
      <h4 class="text-sm font-semibold mb-2">{{ uiStore.t('checkout.step1') }}</h4>
      <div v-for="item in items" :key="item.id" class="flex justify-between text-sm py-1.5">
        <div>
          <span style="color: var(--text-secondary);">{{ item.product.name }} x{{ item.quantity }}</span>
          <div v-if="item.color || item.size" class="text-xs mt-0.5" style="color: var(--text-secondary);">
            <span v-if="item.color">{{ uiStore.t('products.color') }} : {{ item.color }}</span>
            <span v-if="item.size" class="ml-2">{{ uiStore.t('products.size') }} : {{ item.size }}</span>
          </div>
        </div>
        <span class="font-medium shrink-0">{{ formatPrice(item.product.price * item.quantity) }}</span>
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
      :credit-used="creditUsed"
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
  creditUsed: { type: Number, default: 0 },
});

const uiStore = useUiStore();
</script>

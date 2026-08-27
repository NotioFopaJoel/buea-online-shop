<template>
  <div class="rounded-card p-5 card-surface">
    <h3 class="font-display font-semibold text-base mb-4">{{ uiStore.t('cart.title') }} {{ uiStore.language === 'fr' ? '' : 'Summary' }}</h3>

    <div class="space-y-2 text-sm">
      <div class="flex justify-between"><span style="color: var(--text-secondary);">{{ uiStore.t('cart.subtotal') }}</span><span class="font-medium">{{ formatPrice(subtotal) }}</span></div>
      <div class="flex justify-between">
        <span style="color: var(--text-secondary);">{{ uiStore.t('cart.deliveryFee') }}</span>
        <span class="font-medium">{{ deliveryFee === 0 ? uiStore.t('cart.free') : formatPrice(deliveryFee) }}</span>
      </div>
      <div v-if="discount > 0" class="flex justify-between"><span style="color: var(--text-secondary);">{{ uiStore.t('cart.discount') }}</span><span class="font-medium text-promo">-{{ formatPrice(discount) }}</span></div>
      <div v-if="creditUsed > 0" class="flex justify-between"><span style="color: var(--text-secondary);">{{ uiStore.t('referral.creditBalance') }}</span><span class="font-medium text-green-600">-{{ formatPrice(creditUsed) }}</span></div>
    </div>

    <div class="flex justify-between items-baseline mt-4 pt-4" style="border-top: 1px solid var(--border-color);">
      <span class="font-semibold">{{ uiStore.t('cart.total') }}</span>
      <span class="font-display font-bold text-xl">{{ formatPrice(total) }}</span>
    </div>

    <p v-if="amountUntilFree > 0" class="text-xs mt-3 px-3 py-2 rounded-lg bg-electric-500/10 text-electric-600">
      {{ uiStore.t('cart.freeDeliveryNotice') }}
    </p>

    <slot name="action" />
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import { formatPrice } from '../../utils/formatPrice';

defineProps({
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  creditUsed: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountUntilFree: { type: Number, default: 0 },
});

const uiStore = useUiStore();
</script>

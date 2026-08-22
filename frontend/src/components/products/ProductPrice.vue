<template>
  <div class="flex items-baseline gap-3 flex-wrap">
    <span class="font-display font-bold text-2xl" style="color: var(--text-primary);">{{ formatPrice(price) }}</span>
    <span v-if="comparePrice > price" class="text-base line-through" style="color: var(--text-secondary);">{{ formatPrice(comparePrice) }}</span>
    <span v-if="comparePrice > price" class="text-sm font-semibold text-promo">
      {{ uiStore.t('product.youSave') }} {{ formatPrice(comparePrice - price) }} ({{ discount }}%)
    </span>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import { formatPrice } from '../../utils/formatPrice';

defineProps({
  price: { type: Number, required: true },
  comparePrice: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
});

const uiStore = useUiStore();
</script>

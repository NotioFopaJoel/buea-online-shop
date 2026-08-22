<template>
  <div class="rounded-card p-4 card-surface space-y-2">
    <p class="text-sm font-semibold">{{ uiStore.t('checkout.step2') }}</p>
    <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('checkout.deliveryOnlyBuea') }}</p>
    <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('checkout.deliveryFeeNotice') }}</p>
    <p class="text-xs text-electric-500 font-medium">{{ uiStore.t('checkout.freeDeliveryFrom') }}</p>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
const uiStore = useUiStore();
</script>

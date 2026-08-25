<template>
  <div class="space-y-3">
    <p class="text-sm px-3 py-2.5 rounded-lg bg-electric-500/10 text-electric-600 font-medium">
      {{ uiStore.t('checkout.payAfterDelivery') }} — {{ uiStore.t('checkout.payAfterDeliveryDesc') }}
    </p>

    <label
      v-for="method in methods"
      :key="method.value"
      class="flex items-center justify-between gap-3 p-4 rounded-card cursor-pointer"
      :style="{ border: selected === method.value ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', backgroundColor: 'var(--card-background)' }"
    >
      <div class="flex items-center gap-3">
        <input type="radio" :value="method.value" v-model="selected" name="paymentMethod" />
        <div>
          <p class="font-medium text-sm">{{ uiStore.t(method.labelKey) }}</p>
          <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('checkout.payAfterDeliveryTag') }}</p>
        </div>
      </div>
      <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold" :style="{ backgroundColor: method.color }">
        {{ method.short }}
      </div>
    </label>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';

const selected = defineModel({ type: String, default: 'MTN_MOBILE_MONEY' });
const uiStore = useUiStore();

const methods = [
  { value: 'MTN_MOBILE_MONEY', labelKey: 'checkout.mtn', short: 'MTN', color: '#FFCC00' },
  { value: 'ORANGE_MONEY', labelKey: 'checkout.orange', short: 'OM', color: '#FF6600' },
  { value: 'CASH', labelKey: 'checkout.cash', short: '\u20A3', color: '#22C55E' },
];
</script>

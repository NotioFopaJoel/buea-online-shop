<template>
  <div class="space-y-4">
    <p class="text-xs px-3 py-2 rounded-lg bg-electric-500/10 text-electric-600 flex items-center gap-2">
      <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      {{ uiStore.t('checkout.deliveryOnlyBuea') }}
    </p>

    <div class="grid sm:grid-cols-2 gap-4">
      <FormField v-model="form.fullName" :label="uiStore.t('checkout.fullName')" required />
      <FormField v-model="form.phone" :label="uiStore.t('checkout.phone')" type="tel" required placeholder="+237 6XX XXX XXX" />
      <FormField v-model="form.whatsappNumber" :label="uiStore.t('checkout.whatsapp')" type="tel" placeholder="+237 6XX XXX XXX" />
      <FormField v-model="form.email" :label="uiStore.t('checkout.email')" type="email" />

      <div>
        <label class="text-sm font-medium block mb-1.5">{{ uiStore.t('checkout.city') }}</label>
        <input :value="form.city" disabled class="w-full px-3 py-2.5 rounded-lg text-sm opacity-70" style="border: 1px solid var(--border-color); background-color: var(--bg-primary); color: var(--text-primary);" />
      </div>

      <div>
        <label class="text-sm font-medium block mb-1.5">{{ uiStore.t('checkout.neighborhood') }} <span class="text-promo">*</span></label>
        <select v-model="form.neighborhood" required class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
          <option value="" disabled>{{ uiStore.t('checkout.neighborhood') }}</option>
          <option v-for="zone in orderStore.deliveryZones" :key="zone._id" :value="zone.neighborhood">{{ zone.neighborhood }}</option>
        </select>
      </div>
    </div>

    <FormField v-model="form.address" :label="uiStore.t('checkout.address')" required />
    <FormField v-model="form.landmark" :label="uiStore.t('checkout.landmark')" />
    <div>
      <label class="text-sm font-medium block mb-1.5">{{ uiStore.t('checkout.deliveryInstructions') }}</label>
      <textarea v-model="form.deliveryInstructions" rows="2" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUiStore } from '../../stores/ui';
import { useOrderStore } from '../../stores/order';
import FormField from '../common/FormField.vue';

const form = defineModel({ type: Object, required: true });

const uiStore = useUiStore();
const orderStore = useOrderStore();

onMounted(() => {
  if (!orderStore.deliveryZones.length) orderStore.fetchDeliveryZones().catch(() => {});
});
</script>

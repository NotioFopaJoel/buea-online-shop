<template>
  <div class="container-bos py-8 max-w-lg mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">{{ uiStore.t('trackOrder.title') }}</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">{{ uiStore.t('checkout.whatsappConfirmNotice') }}</p>

    <form class="flex gap-2 mb-6" @submit.prevent="handleTrack">
      <input
        v-model="orderNumber"
        type="text"
        :placeholder="uiStore.t('trackOrder.placeholder')"
        class="flex-1 px-4 py-3 rounded-lg text-sm"
        style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
      />
      <Button variant="primary" size="lg" type="submit" :loading="orderStore.loading">{{ uiStore.t('trackOrder.button') }}</Button>
    </form>

    <p v-if="notFound" class="text-sm text-center text-promo">{{ uiStore.t('trackOrder.notFound') }}</p>

    <div v-if="order" class="rounded-card card-surface p-5">
      <div class="flex justify-between items-center mb-4">
        <div>
          <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('orderSuccess.orderNumber') }}</p>
          <p class="font-display font-bold text-lg">#{{ order.orderNumber }}</p>
        </div>
        <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-electric-500/10 text-electric-600">
          {{ uiStore.t(`orderStatus.${order.orderStatus}`) }}
        </span>
      </div>

      <div class="space-y-3">
        <div v-for="(s, i) in statusSteps" :key="s" class="flex items-center gap-3">
          <div
            class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            :class="i <= currentStepIndex ? 'bg-navy-900 text-white dark:bg-electric-500' : 'bg-black/5 dark:bg-white/10'"
          >
            <svg v-if="i <= currentStepIndex" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span class="text-sm" :style="{ color: i <= currentStepIndex ? 'var(--text-primary)' : 'var(--text-secondary)' }">
            {{ uiStore.t(`orderStatus.${s}`) }}
          </span>
        </div>
      </div>

      <div class="mt-5 pt-4 space-y-1 text-sm" style="border-top: 1px solid var(--border-color); color: var(--text-secondary);">
        <p>{{ order.shippingAddress?.neighborhood }}, {{ order.shippingAddress?.city }}</p>
        <p>{{ uiStore.t('cart.total') }}: {{ formatPrice(order.total) }}</p>
        <p>{{ uiStore.t('checkout.paymentMethod') }}: {{ uiStore.t(`paymentStatus.${order.paymentStatus}`) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import { formatPrice } from '../utils/formatPrice';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const orderStore = useOrderStore();

const orderNumber = ref('');
const notFound = ref(false);
const order = computed(() => orderStore.trackedOrder);

const statusSteps = ['PENDING_CONFIRMATION', 'WHATSAPP_CONTACTED', 'CONFIRMED', 'PROCESSING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
const currentStepIndex = computed(() => (order.value ? statusSteps.indexOf(order.value.orderStatus) : -1));

async function handleTrack() {
  notFound.value = false;
  try {
    await orderStore.trackOrder(orderNumber.value.trim());
  } catch {
    notFound.value = true;
  }
}
</script>

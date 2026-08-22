<template>
  <div class="container-bos py-6 max-w-2xl mx-auto">
    <Loader v-if="loading" full-page />

    <template v-else-if="order">
      <div class="flex items-center justify-between mb-6">
        <div>
          <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('orderSuccess.orderNumber') }}</p>
          <h1 class="font-display font-bold text-xl">#{{ order.orderNumber }}</h1>
        </div>
        <span class="text-xs font-semibold px-3 py-1.5 rounded-full bg-electric-500/10 text-electric-600">{{ uiStore.t(`orderStatus.${order.orderStatus}`) }}</span>
      </div>

      <div class="rounded-card card-surface p-5 mb-4">
        <h3 class="text-sm font-semibold mb-3">Items</h3>
        <div v-for="item in order.items" :key="item.product" class="flex justify-between text-sm py-1.5">
          <span style="color: var(--text-secondary);">{{ item.name }} x{{ item.quantity }}</span>
          <span class="font-medium">{{ formatPrice(item.price * item.quantity) }}</span>
        </div>
        <div class="flex justify-between text-sm pt-3 mt-3" style="border-top: 1px solid var(--border-color);">
          <span style="color: var(--text-secondary);">{{ uiStore.t('cart.subtotal') }}</span><span>{{ formatPrice(order.subtotal) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span style="color: var(--text-secondary);">{{ uiStore.t('cart.deliveryFee') }}</span><span>{{ order.deliveryFee === 0 ? uiStore.t('cart.free') : formatPrice(order.deliveryFee) }}</span>
        </div>
        <div class="flex justify-between font-semibold pt-2">
          <span>{{ uiStore.t('cart.total') }}</span><span>{{ formatPrice(order.total) }}</span>
        </div>
      </div>

      <div class="rounded-card card-surface p-5 mb-4 text-sm space-y-1" style="color: var(--text-secondary);">
        <p class="font-semibold" style="color: var(--text-primary);">{{ uiStore.t('checkout.shippingAddress') }}</p>
        <p>{{ order.shippingAddress.fullName }} — {{ order.shippingAddress.phone }}</p>
        <p>{{ order.shippingAddress.address }}, {{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }}</p>
      </div>

      <div class="rounded-card card-surface p-5 flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold">{{ uiStore.t('checkout.paymentMethod') }}</p>
          <p class="text-xs" style="color: var(--text-secondary);">{{ order.paymentMethod === 'MTN_MOBILE_MONEY' ? 'MTN Mobile Money' : 'Orange Money' }}</p>
        </div>
        <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="order.paymentStatus === 'PAID' ? 'bg-green-500/10 text-green-600' : 'bg-amber-500/10 text-amber-600'">
          {{ uiStore.t(`paymentStatus.${order.paymentStatus}`) }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';

const route = useRoute();
const uiStore = useUiStore();
const orderStore = useOrderStore();
const loading = ref(true);
const order = computed(() => orderStore.currentOrder);

onMounted(async () => {
  try {
    await orderStore.fetchOrderById(route.params.id);
  } finally {
    loading.value = false;
  }
});
</script>

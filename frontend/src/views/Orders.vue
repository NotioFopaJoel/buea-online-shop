<template>
  <div class="container-bos py-6">
    <h1 class="font-display font-bold text-2xl mb-6">{{ uiStore.t('nav.trackOrder') }}</h1>

    <Loader v-if="loading" />

    <EmptyState v-else-if="!orderStore.orders.length" title="No orders yet" description="Your placed orders will show up here.">
      <template #action><Button variant="primary" :to="{ name: 'Shop' }">{{ uiStore.t('home.shopNow') }}</Button></template>
    </EmptyState>

    <div v-else class="space-y-3">
      <router-link
        v-for="order in orderStore.orders"
        :key="order._id"
        :to="{ name: 'OrderDetails', params: { id: order._id } }"
        class="flex items-center justify-between p-4 rounded-card card-surface"
      >
        <div>
          <p class="font-semibold text-sm">#{{ order.orderNumber }}</p>
          <p class="text-xs mt-0.5" style="color: var(--text-secondary);">{{ new Date(order.createdAt).toLocaleDateString() }} · {{ order.items.length }} item(s)</p>
        </div>
        <div class="text-right">
          <p class="font-semibold text-sm">{{ formatPrice(order.total) }}</p>
          <span class="text-xs font-medium px-2 py-0.5 rounded-full bg-electric-500/10 text-electric-600">{{ uiStore.t(`orderStatus.${order.orderStatus}`) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import EmptyState from '../components/common/EmptyState.vue';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const orderStore = useOrderStore();
const loading = ref(true);

onMounted(async () => {
  try {
    await orderStore.fetchMyOrders();
  } finally {
    loading.value = false;
  }
});
</script>

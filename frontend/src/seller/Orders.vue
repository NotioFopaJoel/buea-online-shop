<template>
  <div class="container-bos py-6">
    <SellerNav />
    <h1 class="font-display font-bold text-2xl mb-6">Orders</h1>

    <Loader v-if="loading" />

    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order._id" class="rounded-card card-surface p-4">
        <div class="flex items-center justify-between mb-2">
          <p class="font-semibold text-sm">#{{ order.orderNumber }}</p>
          <StatusBadge :status="order.orderStatus" />
        </div>
        <p class="text-xs" style="color: var(--text-secondary);">
          {{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }} · {{ new Date(order.createdAt).toLocaleDateString() }}
        </p>
      </div>
      <p v-if="!orders.length" class="text-sm text-center py-10" style="color: var(--text-secondary);">No orders yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Loader from '../components/common/Loader.vue';
import SellerNav from './components/SellerNav.vue';
import StatusBadge from '../admin/components/StatusBadge.vue';

const orders = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get('/seller/orders');
    orders.value = res.data.orders;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container-bos py-6">
    <AdminNav />
    <h1 class="font-display font-bold text-2xl mb-6">Dashboard</h1>

    <Loader v-if="loading" />

    <template v-else-if="stats">
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Sales" :value="formatPrice(stats.totalSales)" />
        <StatCard label="Total Orders" :value="stats.totalOrders" />
        <StatCard label="Pending Orders" :value="stats.pendingOrders" accent="amber" />
        <StatCard label="Delivered Orders" :value="stats.deliveredOrders" accent="green" />
        <StatCard label="Total Customers" :value="stats.totalCustomers" />
        <StatCard label="Total Products" :value="stats.totalProducts" />
      </div>

      <div class="rounded-card card-surface p-5">
        <h3 class="font-semibold mb-3">Recent Orders (30 days)</h3>
        <p class="text-sm" style="color: var(--text-secondary);">{{ stats.recentOrders.length }} orders in the last 30 days.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import AdminNav from './components/AdminNav.vue';
import StatCard from './components/StatCard.vue';

const stats = ref(null);
const loading = ref(true);

onMounted(async () => {
  try {
    const res = await api.get('/admin/dashboard');
    stats.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="container-bos py-6">
    <SellerNav />
    <h1 class="font-display font-bold text-2xl mb-6">Seller Dashboard</h1>

    <Loader v-if="loading" />

    <div v-else class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <StatCard label="Total Sales" :value="formatPrice(stats.totalSales)" />
      <StatCard label="Total Orders" :value="stats.totalOrders" />
      <StatCard label="Pending Orders" :value="stats.pendingOrders" accent="amber" />
      <StatCard label="My Products" :value="stats.totalProducts" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import SellerNav from './components/SellerNav.vue';
import StatCard from '../admin/components/StatCard.vue';

const loading = ref(true);
const stats = ref({ totalSales: 0, totalOrders: 0, pendingOrders: 0, totalProducts: 0 });

onMounted(async () => {
  try {
    const res = await api.get('/seller/dashboard');
    stats.value = res.data;
  } finally {
    loading.value = false;
  }
});
</script>

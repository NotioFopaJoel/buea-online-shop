<template>
  <div class="container-bos py-6">
    <SellerNav />
    <h1 class="font-display font-bold text-2xl mb-4">Earnings</h1>

    <Loader v-if="loading" />

    <template v-else>
      <div class="rounded-card card-surface p-5 mb-6">
        <p class="text-xs" style="color: var(--text-secondary);">Total Earnings (Paid Orders)</p>
        <p class="font-display font-bold text-2xl">{{ formatPrice(totalEarnings) }}</p>
      </div>

      <div class="rounded-card card-surface overflow-hidden">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left" style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
              <th class="p-3 font-medium">Order</th>
              <th class="p-3 font-medium">Items</th>
              <th class="p-3 font-medium">Paid On</th>
              <th class="p-3 font-medium text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in earnings" :key="e.orderNumber" style="border-bottom: 1px solid var(--border-color);">
              <td class="p-3 font-medium">#{{ e.orderNumber }}</td>
              <td class="p-3">{{ e.items }}</td>
              <td class="p-3" style="color: var(--text-secondary);">{{ new Date(e.paidAt).toLocaleDateString() }}</td>
              <td class="p-3 text-right font-semibold">{{ formatPrice(e.amount) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="!earnings.length" class="text-sm text-center py-8" style="color: var(--text-secondary);">No paid orders yet.</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import SellerNav from './components/SellerNav.vue';

const loading = ref(true);
const earnings = ref([]);
const totalEarnings = ref(0);

onMounted(async () => {
  try {
    const res = await api.get('/seller/earnings');
    earnings.value = res.data.earnings;
    totalEarnings.value = res.data.totalEarnings;
  } finally {
    loading.value = false;
  }
});
</script>

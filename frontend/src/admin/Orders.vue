<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <h1 class="font-display font-bold text-2xl">Orders</h1>
      <input
        v-model="search"
        type="text"
        placeholder="Search by order #, name or phone"
        class="px-3 py-2 rounded-lg text-sm w-64"
        style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
        @keyup.enter="fetchOrders"
      />
    </div>

    <div class="flex gap-2 overflow-x-auto mb-4 pb-1">
      <button
        v-for="s in statusFilters"
        :key="s.value"
        class="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap"
        :class="statusFilter === s.value ? 'bg-navy-900 text-white dark:bg-electric-500' : 'card-surface'"
        @click="statusFilter = s.value; fetchOrders()"
      >
        {{ s.label }}
      </button>
    </div>

    <Loader v-if="loading" />

    <div v-else class="space-y-3">
      <div v-for="order in orders" :key="order._id" class="rounded-card card-surface p-4">
        <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
          <div>
            <p class="font-semibold text-sm">#{{ order.orderNumber }}</p>
            <p class="text-xs" style="color: var(--text-secondary);">{{ order.shippingAddress.fullName }} · {{ order.shippingAddress.phone }}</p>
          </div>
          <div class="flex gap-2">
            <StatusBadge :status="order.orderStatus" />
            <StatusBadge :status="order.paymentStatus" />
          </div>
        </div>

        <p class="text-xs mb-3" style="color: var(--text-secondary);">
          {{ order.shippingAddress.neighborhood }}, {{ order.shippingAddress.city }} · {{ formatPrice(order.total) }} · {{ order.items.length }} item(s)
        </p>

        <div class="flex flex-wrap gap-2">
          <a
            :href="whatsappContactLink(order)"
            target="_blank"
            rel="noopener"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#25D366] text-white"
          >
            Contact on WhatsApp
          </a>
          <select
            :value="order.orderStatus"
            class="px-2 py-1.5 rounded-lg text-xs"
            style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
            @change="updateStatus(order, $event.target.value)"
          >
            <option v-for="s in orderStatuses" :key="s" :value="s">{{ s.replace(/_/g, ' ') }}</option>
          </select>
          <button
            v-if="order.paymentStatus !== 'PAID'"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white"
            @click="markPaid(order)"
          >
            Mark payment as Paid
          </button>
        </div>
      </div>

      <p v-if="!orders.length" class="text-sm text-center py-10" style="color: var(--text-secondary);">No orders match this filter.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import { ORDER_STATUSES } from '../utils/constants';
import Loader from '../components/common/Loader.vue';
import AdminNav from './components/AdminNav.vue';
import StatusBadge from './components/StatusBadge.vue';

const orders = ref([]);
const loading = ref(true);
const search = ref('');
const statusFilter = ref('');
const orderStatuses = ORDER_STATUSES.filter((s) => s !== 'CANCELLED').concat('CANCELLED');

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'PENDING_CONFIRMATION', label: 'Pending Confirmation' },
  { value: 'WHATSAPP_CONTACTED', label: 'WhatsApp Contacted' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

async function fetchOrders() {
  loading.value = true;
  try {
    const res = await api.get('/admin/orders', {
      params: { orderStatus: statusFilter.value || undefined, search: search.value || undefined, limit: 50 },
    });
    orders.value = res.data.orders;
  } finally {
    loading.value = false;
  }
}

function whatsappContactLink(order) {
  const phone = order.shippingAddress.whatsappNumber || order.shippingAddress.phone;
  const cleaned = phone.replace(/[^\d]/g, '');
  const message = encodeURIComponent(`Hello ${order.shippingAddress.fullName}, this is BUEA ONLINE SHOP regarding your order #${order.orderNumber}.`);
  return `https://wa.me/${cleaned}?text=${message}`;
}

async function updateStatus(order, orderStatus) {
  const res = await api.put(`/orders/${order._id}/status`, { orderStatus });
  Object.assign(order, res.data.order);
}

async function markPaid(order) {
  const paymentRes = await api.get(`/payments/order/${order._id}`);
  await api.put(`/payments/${paymentRes.data.payment._id}/confirm`, { notes: 'Confirmed by admin after delivery' });
  order.paymentStatus = 'PAID';
}

onMounted(fetchOrders);
</script>

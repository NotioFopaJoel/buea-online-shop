<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-display font-bold text-2xl">Promotions</h1>
      <Button variant="primary" @click="openCreate">+ Add Coupon</Button>
    </div>

    <Loader v-if="loading" />

    <div v-else class="rounded-card card-surface overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left" style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
            <th class="p-3 font-medium">Code</th>
            <th class="p-3 font-medium">Discount</th>
            <th class="p-3 font-medium">Min Order</th>
            <th class="p-3 font-medium">Valid</th>
            <th class="p-3 font-medium">Status</th>
            <th class="p-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in coupons" :key="c._id" style="border-bottom: 1px solid var(--border-color);">
            <td class="p-3 font-mono font-semibold">{{ c.code }}</td>
            <td class="p-3">{{ c.type === 'PERCENTAGE' ? `${c.value}%` : formatPrice(c.value) }}</td>
            <td class="p-3">{{ formatPrice(c.minimumOrder) }}</td>
            <td class="p-3 text-xs" style="color: var(--text-secondary);">{{ new Date(c.startDate).toLocaleDateString() }} - {{ new Date(c.endDate).toLocaleDateString() }}</td>
            <td class="p-3">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="c.isActive ? 'bg-green-500/10 text-green-600' : 'bg-black/5'">{{ c.isActive ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="p-3 text-right">
              <button class="text-xs font-medium text-promo" @click="handleDelete(c)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-model="showModal" title="Add Coupon">
      <form class="space-y-3" @submit.prevent="handleSave">
        <FormField v-model="form.code" label="Coupon Code" required placeholder="e.g. WELCOME10" />
        <div>
          <label class="text-sm font-medium block mb-1.5">Type</label>
          <select v-model="form.type" class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FIXED">Fixed Amount (FCFA)</option>
          </select>
        </div>
        <FormField v-model.number="form.value" label="Value" type="number" required />
        <FormField v-model.number="form.minimumOrder" label="Minimum Order (FCFA)" type="number" />
        <FormField v-model.number="form.maximumDiscount" label="Maximum Discount (FCFA, optional)" type="number" />
        <div class="grid grid-cols-2 gap-3">
          <FormField v-model="form.startDate" label="Start Date" type="date" required />
          <FormField v-model="form.endDate" label="End Date" type="date" required />
        </div>
        <Button type="submit" variant="primary" full :loading="saving">Save Coupon</Button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import Modal from '../components/common/Modal.vue';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const coupons = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);

const form = reactive({ code: '', type: 'PERCENTAGE', value: 10, minimumOrder: 0, maximumDiscount: null, startDate: '', endDate: '' });

async function fetchCoupons() {
  loading.value = true;
  try {
    const res = await api.get('/admin/coupons');
    coupons.value = res.data.coupons;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  Object.assign(form, { code: '', type: 'PERCENTAGE', value: 10, minimumOrder: 0, maximumDiscount: null, startDate: '', endDate: '' });
  showModal.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    await api.post('/admin/coupons', form);
    showModal.value = false;
    await fetchCoupons();
  } finally {
    saving.value = false;
  }
}

async function handleDelete(coupon) {
  if (!confirm(`Delete coupon "${coupon.code}"?`)) return;
  await api.delete(`/admin/coupons/${coupon._id}`);
  await fetchCoupons();
}

onMounted(fetchCoupons);
</script>

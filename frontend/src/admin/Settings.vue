<template>
  <div class="container-bos py-6">
    <AdminNav />
    <h1 class="font-display font-bold text-2xl mb-6">Settings</h1>

    <Loader v-if="loading" />

    <template v-else>
      <div class="rounded-card card-surface p-5 mb-6">
        <h3 class="font-semibold mb-4">General</h3>
        <div class="grid sm:grid-cols-2 gap-4">
          <FormField v-model="settingsForm.whatsappBusinessNumber" label="WhatsApp Business Number" placeholder="237670000000" />
          <FormField v-model.number="settingsForm.deliveryFreeThreshold" label="Free Delivery Threshold (FCFA)" type="number" />
          <FormField v-model.number="settingsForm.deliveryFeeStandard" label="Standard Delivery Fee (FCFA)" type="number" />
          <FormField v-model="settingsForm.activeDeliveryCity" label="Active Delivery City" />
          <FormField v-model="settingsForm.supportEmail" label="Support Email" type="email" />
          <FormField v-model="settingsForm.supportPhone" label="Support Phone" />
        </div>
        <Button variant="primary" class="mt-4" :loading="savingSettings" @click="handleSaveSettings">Save Settings</Button>
      </div>

      <div class="rounded-card card-surface p-5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold">Buea Delivery Zones</h3>
          <Button variant="outline" size="sm" @click="showZoneModal = true">+ Add Zone</Button>
        </div>
        <div class="space-y-2">
          <div v-for="zone in zones" :key="zone._id" class="flex items-center justify-between p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <span class="text-sm">{{ zone.neighborhood }}</span>
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="zone.isActive ? 'bg-green-500/10 text-green-600' : 'bg-black/5'">{{ zone.isActive ? 'Active' : 'Disabled' }}</span>
              <button class="text-xs font-medium text-electric-500" @click="toggleZone(zone)">{{ zone.isActive ? 'Disable' : 'Enable' }}</button>
              <button class="text-xs font-medium text-promo" @click="deleteZone(zone)">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <Modal v-model="showZoneModal" title="Add Delivery Zone">
      <form class="space-y-3" @submit.prevent="handleAddZone">
        <FormField v-model="newZone.neighborhood" label="Neighborhood" required placeholder="e.g. Bomaka" />
        <Button type="submit" variant="primary" full>Add Zone</Button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import Loader from '../components/common/Loader.vue';
import Modal from '../components/common/Modal.vue';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const loading = ref(true);
const savingSettings = ref(false);
const showZoneModal = ref(false);
const zones = ref([]);
const newZone = reactive({ neighborhood: '' });

const settingsForm = reactive({
  whatsappBusinessNumber: '', deliveryFreeThreshold: 10000, deliveryFeeStandard: 1000,
  activeDeliveryCity: 'Buea', supportEmail: '', supportPhone: '',
});

async function fetchAll() {
  loading.value = true;
  try {
    const [settingsRes, zonesRes] = await Promise.all([
      api.get('/admin/settings'),
      api.get('/admin/delivery-zones'),
    ]);
    Object.assign(settingsForm, settingsRes.data.settings);
    zones.value = zonesRes.data.zones;
  } finally {
    loading.value = false;
  }
}

async function handleSaveSettings() {
  savingSettings.value = true;
  try {
    await api.put('/admin/settings', settingsForm);
  } finally {
    savingSettings.value = false;
  }
}

async function handleAddZone() {
  await api.post('/admin/delivery-zones', { city: settingsForm.activeDeliveryCity, neighborhood: newZone.neighborhood });
  newZone.neighborhood = '';
  showZoneModal.value = false;
  await fetchAll();
}

async function toggleZone(zone) {
  const res = await api.put(`/admin/delivery-zones/${zone._id}`, { isActive: !zone.isActive });
  zone.isActive = res.data.zone.isActive;
}

async function deleteZone(zone) {
  if (!confirm(`Delete zone "${zone.neighborhood}"?`)) return;
  await api.delete(`/admin/delivery-zones/${zone._id}`);
  await fetchAll();
}

onMounted(fetchAll);
</script>

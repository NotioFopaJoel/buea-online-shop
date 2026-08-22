<template>
  <div class="container-bos py-6 max-w-lg mx-auto">
    <h1 class="font-display font-bold text-2xl mb-6">{{ uiStore.t('header.account') }}</h1>

    <router-link
      v-if="authStore.isAdmin"
      to="/admin"
      class="flex items-center justify-between gap-3 rounded-card p-4 mb-4 bg-navy-900 dark:bg-electric-500 text-white"
    >
      <div>
        <p class="font-semibold text-sm">{{ uiStore.t('header.adminDashboard') }}</p>
        <p class="text-xs text-white/70">Manage products, orders, users, promotions and settings</p>
      </div>
      <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
    </router-link>

    <router-link
      v-else-if="authStore.isSeller"
      to="/seller"
      class="flex items-center justify-between gap-3 rounded-card p-4 mb-4 bg-navy-900 dark:bg-electric-500 text-white"
    >
      <div>
        <p class="font-semibold text-sm">{{ uiStore.t('header.sellerDashboard') }}</p>
        <p class="text-xs text-white/70">Manage your products, orders and earnings</p>
      </div>
      <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
    </router-link>

    <div class="rounded-card card-surface p-5 mb-4">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-full bg-electric-500/10 text-electric-600 flex items-center justify-center font-display font-bold text-lg">
          {{ authStore.user?.name?.[0] }}
        </div>
        <div>
          <p class="font-semibold">{{ authStore.user?.name }}</p>
          <p class="text-sm" style="color: var(--text-secondary);">{{ authStore.user?.email }}</p>
        </div>
      </div>
      <FormField v-model="form.name" label="Full Name" />
      <div class="h-3" />
      <FormField v-model="form.phone" label="Phone" />
      <div class="h-3" />
      <FormField v-model="form.whatsappNumber" label="WhatsApp Number" />
      <Button variant="primary" class="mt-4" :loading="saving" @click="handleSave">{{ uiStore.t('common.save') }}</Button>
    </div>

    <div class="rounded-card card-surface p-5 mb-4">
      <h3 class="font-semibold mb-2">Addresses</h3>
      <div v-for="addr in authStore.user?.addresses" :key="addr._id" class="text-sm py-2" style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
        {{ addr.neighborhood }}, {{ addr.city }} — {{ addr.phone }}
      </div>
      <p v-if="!authStore.user?.addresses?.length" class="text-sm" style="color: var(--text-secondary);">No saved addresses yet.</p>
    </div>

    <Button variant="outline" full @click="handleLogout">Log Out</Button>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import authService from '../services/authService';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();

const form = reactive({
  name: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  whatsappNumber: authStore.user?.whatsappNumber || '',
});
const saving = ref(false);

async function handleSave() {
  saving.value = true;
  try {
    const res = await authService.updateProfile(form);
    authStore.user = res.data.user;
    localStorage.setItem('bos_user', JSON.stringify(res.data.user));
    uiStore.pushToast('Profile updated ✓');
  } finally {
    saving.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'Home' });
}
</script>

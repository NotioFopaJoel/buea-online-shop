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

    <!-- Refer & Earn -->
    <div class="rounded-card card-surface p-5 mb-4">
      <h3 class="font-semibold mb-4">{{ uiStore.t('referral.title') }}</h3>
      <template v-if="referral">
        <p class="text-sm mb-3" style="white-space: pre-line; color: var(--text-secondary);">Invite your friends and earn {{ referral.rewardPercentage }}% in BUEA SHOP CREDIT.</p>

        <div class="flex items-center gap-2 p-3 rounded-lg mb-4" style="border: 1px solid var(--border-color);">
          <span class="font-mono text-sm font-semibold flex-1">{{ referral.referralLink }}</span>
          <button class="text-xs font-medium text-electric-500 whitespace-nowrap" @click="copyLink">{{ copied ? uiStore.t('referral.copied') : uiStore.t('referral.copyLink') }}</button>
        </div>
        <a :href="`https://wa.me/?text=${encodeURIComponent(shareMessage)}`" target="_blank" rel="noopener" class="block w-full text-center py-2.5 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors">
          {{ uiStore.t('referral.shareWhatsapp') }}
        </a>

        <div class="grid grid-cols-2 gap-3 mt-4">
          <div class="p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('referral.shopCredit') }}</p>
            <p class="text-lg font-bold text-green-600 mt-1">{{ formatPrice(referral.creditBalance) }}</p>
            <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('referral.available') }}</p>
          </div>
          <div class="p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('referral.pendingRewards') }}</p>
            <p class="text-lg font-bold text-amber-500 mt-1">{{ formatPrice(referral.pendingRewards) }}</p>
          </div>
          <div class="p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('referral.successfulReferrals') }}</p>
            <p class="text-lg font-bold mt-1">{{ referral.successfulReferrals }}</p>
          </div>
          <div class="p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <p class="text-xs" style="color: var(--text-secondary);">{{ uiStore.t('referral.totalEarned') }}</p>
            <p class="text-lg font-bold mt-1">{{ formatPrice(referral.totalEarned) }}</p>
          </div>
        </div>

        <div v-if="showHistory && referral.history.length" class="mt-4">
          <h4 class="text-sm font-semibold mb-2">{{ uiStore.t('referral.history') }}</h4>
          <div class="space-y-2">
            <div v-for="h in referral.history" :key="h._id" class="flex items-center justify-between text-sm py-2" style="border-bottom: 1px solid var(--border-color);">
              <div>
                <span>{{ uiStore.t('referral.earnedFrom') }} {{ h.refereeName }}</span>
                <span class="text-xs ml-1" style="color: var(--text-secondary);">+{{ formatPrice(h.rewardAmount) }}</span>
              </div>
              <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="h.status === 'VALIDATED' ? 'bg-green-500/10 text-green-600' : h.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600' : 'bg-black/5'" style="color: var(--text-secondary);">
                {{ h.status === 'VALIDATED' ? uiStore.t('referral.validated') : h.status === 'PENDING' ? uiStore.t('referral.pending') : uiStore.t('referral.cancelled') }}
              </span>
            </div>
          </div>
        </div>
        <button class="text-sm font-medium text-electric-500 mt-3" @click="showHistory = !showHistory">
          {{ showHistory ? uiStore.t('referral.viewHistory') + ' ▲' : uiStore.t('referral.viewHistory') + ' ▼' }}
        </button>
      </template>
      <p v-else class="text-sm" style="color: var(--text-secondary);">Loading...</p>
    </div>

    <!-- My Messages -->
    <div class="rounded-card card-surface p-5 mb-4">
      <h3 class="font-semibold mb-4">My Messages</h3>
      <p v-if="!messagesLoaded" class="text-sm" style="color: var(--text-secondary);">Loading...</p>
      <template v-else>
        <p v-if="!myMessages.length" class="text-sm" style="color: var(--text-secondary);">
          No messages yet. <router-link to="/contact" class="text-electric-500 font-medium">Contact us</router-link>.
        </p>
        <div v-else class="space-y-4">
          <div v-for="m in myMessages" :key="m._id" class="p-3 rounded-lg" style="border: 1px solid var(--border-color);">
            <p class="text-sm font-medium text-electric-600">{{ m.subject }}</p>
            <div class="mt-2 space-y-2">
              <div v-for="(entry, i) in thread(m)" :key="i" class="text-xs p-2.5 rounded-lg max-w-[90%]" :class="entry.from === 'admin' ? 'bg-electric-500/10 ml-auto' : 'bg-black/5 dark:bg-white/5'">
                <p class="font-medium mb-0.5">{{ entry.from === 'admin' ? 'BUEA ONLINE SHOP' : 'You' }}</p>
                <p class="whitespace-pre-wrap">{{ entry.body }}</p>
              </div>
            </div>
            <p class="mt-2 text-xs" style="color: var(--text-secondary);">{{ formatDate(m.updatedAt || m.createdAt) }}</p>
          </div>
        </div>
      </template>
    </div>

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
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import authService from '../services/authService';
import referralService from '../services/referralService';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
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
const referral = ref(null);
const copied = ref(false);
const showHistory = ref(false);
const myMessages = ref([]);
const messagesLoaded = ref(false);

const shareMessage = ref('');

async function handleSave() {
  saving.value = true;
  try {
    const res = await authService.updateProfile(form);
    authStore.user = res.data.user;
    localStorage.setItem('bos_user', JSON.stringify(res.data.user));
    uiStore.pushToast('Profile updated');
  } finally {
    saving.value = false;
  }
}

function handleLogout() {
  authStore.logout();
  router.push({ name: 'Home' });
}

function copyLink() {
  navigator.clipboard.writeText(referral.value?.referralLink || '').then(() => {
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
  });
}

function thread(m) {
  return Array.isArray(m.conversation) && m.conversation.length ? m.conversation : [{ from: 'customer', body: m.message, createdAt: m.createdAt }];
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

async function loadMyMessages() {
  try {
    const res = await api.get('/contact/mine');
    myMessages.value = res.data.messages;
  } catch {
    myMessages.value = [];
  } finally {
    messagesLoaded.value = true;
  }
}

onMounted(async () => {
  try {
    const res = await referralService.getMyReferral();
    referral.value = res.data;
    shareMessage.value = `Hey! I shop on BUEA ONLINE SHOP. Use my referral link to get started: ${res.data.referralLink}`;
  } catch {
    // Not logged in or error — silently ignore
  }
  loadMyMessages();
});
</script>

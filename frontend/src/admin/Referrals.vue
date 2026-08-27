<template>
  <div class="container-bos py-6">
    <AdminNav />
    <h1 class="font-display font-bold text-2xl mb-6">{{ uiStore.t('referral.admin.title') }}</h1>

    <Loader v-if="loading" />

    <template v-else>
      <!-- Program Settings Card -->
      <div class="rounded-card card-surface p-5 mb-6">
        <h3 class="font-semibold mb-4">{{ uiStore.t('referral.admin.settings') }}</h3>
        <div class="flex items-center gap-3 mb-4">
          <button
            class="relative w-12 h-6 rounded-full transition-colors"
            :class="settingsForm.referralEnabled ? 'bg-green-500' : 'bg-black/20'"
            @click="settingsForm.referralEnabled = !settingsForm.referralEnabled"
          >
            <span
              class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
              :class="settingsForm.referralEnabled ? 'translate-x-6' : ''"
            />
          </button>
          <span class="text-sm font-medium">{{ uiStore.t('referral.admin.enabled') }}</span>
        </div>
        <div class="max-w-xs">
          <FormField v-model.number="settingsForm.referralRewardPercentage" :label="uiStore.t('referral.admin.rewardRate')" type="number" />
        </div>
        <Button variant="primary" class="mt-3" :loading="savingSettings" @click="handleSaveSettings">{{ uiStore.t('common.save') }}</Button>
      </div>

      <!-- Stats Cards -->
      <div v-if="stats" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard :label="uiStore.t('referral.admin.totalRewardsGenerated')" :value="formatPrice(stats.totalRewardsGenerated)" accent="green" />
        <StatCard :label="uiStore.t('referral.admin.totalRewardsPending')" :value="formatPrice(stats.totalRewardsPending)" accent="amber" />
        <StatCard :label="uiStore.t('referral.admin.totalRewardsUsed')" :value="formatPrice(stats.totalRewardsUsed)" />
        <StatCard :label="uiStore.t('referral.admin.totalCreditBalance')" :value="formatPrice(stats.totalCreditBalance)" />
        <StatCard :label="uiStore.t('referral.admin.activeReferrers')" :value="stats.activeReferrers" />
      </div>

      <!-- Referrers List -->
      <div class="rounded-card card-surface p-5">
        <h3 class="font-semibold mb-4">{{ uiStore.t('referral.admin.referrers') }}</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left" style="border-bottom: 1px solid var(--border-color);">
                <th class="py-2 pr-3">{{ uiStore.t('referral.admin.name') }}</th>
                <th class="py-2 pr-3">{{ uiStore.t('referral.admin.email') }}</th>
                <th class="py-2 pr-3">{{ uiStore.t('referral.admin.code') }}</th>
                <th class="py-2 pr-3 text-right">{{ uiStore.t('referral.admin.referrals') }}</th>
                <th class="py-2 pr-3 text-right">{{ uiStore.t('referral.admin.earned') }}</th>
                <th class="py-2 text-right">{{ uiStore.t('referral.admin.balance') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in referrers" :key="r._id" style="border-bottom: 1px solid var(--border-color);">
                <td class="py-2.5 pr-3 font-medium">{{ r.name }}</td>
                <td class="py-2.5 pr-3" style="color: var(--text-secondary);">{{ r.email }}</td>
                <td class="py-2.5 pr-3 font-mono text-xs">{{ r.referralCode }}</td>
                <td class="py-2.5 pr-3 text-right">{{ r.successfulReferrals }}</td>
                <td class="py-2.5 pr-3 text-right font-medium">{{ formatPrice(r.totalEarned) }}</td>
                <td class="py-2.5 text-right font-medium text-green-600">{{ formatPrice(r.creditBalance) }}</td>
              </tr>
              <tr v-if="!referrers.length">
                <td colspan="6" class="py-6 text-center" style="color: var(--text-secondary);">No referrers yet.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import referralService from '../services/referralService';
import { formatPrice } from '../utils/formatPrice';
import { useUiStore } from '../stores/ui';
import Loader from '../components/common/Loader.vue';
import Button from '../components/common/Button.vue';
import FormField from '../components/common/FormField.vue';
import StatCard from './components/StatCard.vue';
import AdminNav from './components/AdminNav.vue';

const uiStore = useUiStore();
const loading = ref(true);
const savingSettings = ref(false);
const stats = ref(null);
const referrers = ref([]);
const settingsForm = reactive({
  referralEnabled: true,
  referralRewardPercentage: 2,
});

onMounted(async () => {
  try {
    const [statsRes, referrersRes, settingsRes] = await Promise.all([
      referralService.getReferralStats(),
      referralService.getReferrers(),
      referralService.getReferralSettings(),
    ]);
    stats.value = statsRes.data;
    referrers.value = referrersRes.data.referrers;
    settingsForm.referralEnabled = settingsRes.data.referralEnabled;
    settingsForm.referralRewardPercentage = settingsRes.data.referralRewardPercentage;
  } finally {
    loading.value = false;
  }
});

async function handleSaveSettings() {
  savingSettings.value = true;
  try {
    const res = await referralService.updateReferralSettings(settingsForm);
    settingsForm.referralEnabled = res.data.referralEnabled;
    settingsForm.referralRewardPercentage = res.data.referralRewardPercentage;
    uiStore.pushToast('Settings saved');
  } finally {
    savingSettings.value = false;
  }
}
</script>

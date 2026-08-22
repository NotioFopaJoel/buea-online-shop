<template>
  <section class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
    <div v-for="item in items" :key="item.label" class="flex items-center gap-2 rounded-card px-3 py-3 card-surface">
      <svg class="w-4 h-4 text-electric-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
      <span class="text-xs sm:text-sm font-medium" style="color: var(--text-primary);">{{ item.label }}</span>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();

const items = computed(() => [
  { label: uiStore.t('trust.payAfterDelivery') },
  { label: uiStore.t('trust.mtn') },
  { label: uiStore.t('trust.orange') },
  { label: uiStore.t('trust.whatsappConfirm') },
]);
</script>

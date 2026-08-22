<template>
  <router-link
    to="/shop"
    class="flex items-center justify-between gap-4 rounded-card overflow-hidden p-6 sm:p-8 mb-8"
    style="background: linear-gradient(120deg, var(--navy) 0%, #172759 100%);"
  >
    <div>
      <h3 class="font-display font-bold text-xl sm:text-2xl text-white mb-1">{{ uiStore.t('home.specialOffer') }}</h3>
      <p class="text-white/70 text-sm sm:text-base mb-4">{{ uiStore.t('home.specialOfferDesc') }}</p>
      <span class="inline-flex items-center px-5 py-2.5 rounded-lg bg-cyan-400 text-navy-900 font-semibold text-sm">
        {{ uiStore.t('home.shopNow') }}
      </span>
    </div>
    <img src="https://picsum.photos/seed/bos-promo/300/220" alt="Special offer" class="hidden sm:block w-40 h-32 object-cover rounded-xl" />
  </router-link>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
const uiStore = useUiStore();
</script>

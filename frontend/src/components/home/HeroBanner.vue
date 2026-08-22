<template>
  <section class="rounded-card overflow-hidden mb-8" style="background: linear-gradient(135deg, #E8EEFB 0%, #F3F0E8 100%);">
    <div class="grid md:grid-cols-2 items-center gap-6 p-6 sm:p-10">
      <div>
        <span class="inline-block text-xs font-bold tracking-wide text-electric-600 bg-electric-500/10 px-3 py-1 rounded-full mb-3">NEW COLLECTION</span>
        <h1 class="font-display font-bold text-3xl sm:text-5xl leading-tight text-navy-900 mb-3">
          {{ uiStore.t('hero.title') }}
        </h1>
        <p class="text-navy-700/80 text-base sm:text-lg mb-6">{{ uiStore.t('hero.subtitle') }}</p>
        <router-link to="/shop" class="inline-flex items-center px-6 py-3 rounded-lg bg-navy-900 text-white font-semibold hover:bg-navy-800 transition-colors">
          {{ uiStore.t('hero.cta') }}
        </router-link>
      </div>
      <div class="hidden md:block">
        <img src="https://picsum.photos/seed/bos-hero/700/560" alt="Upgrade your style" class="w-full h-full object-cover rounded-2xl" />
      </div>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 px-6 sm:px-10 py-5 border-t border-navy-900/10 bg-white/50">
      <ServiceFeature icon="delivery" :title="uiStore.t('services.fastDelivery')" :desc="uiStore.t('services.fastDeliveryDesc')" />
      <ServiceFeature icon="secure" :title="uiStore.t('services.securePayment')" :desc="uiStore.t('services.securePaymentDesc')" />
      <ServiceFeature icon="returns" :title="uiStore.t('services.easyReturns')" :desc="uiStore.t('services.easyReturnsDesc')" />
      <ServiceFeature icon="support" :title="uiStore.t('services.support')" :desc="uiStore.t('services.supportDesc')" />
    </div>
  </section>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import ServiceFeature from './ServiceFeatures.vue';

const uiStore = useUiStore();
</script>

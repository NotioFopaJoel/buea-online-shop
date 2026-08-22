<template>
  <div class="container-bos py-10 max-w-lg mx-auto text-center">
    <div class="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center mx-auto mb-4">
      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
    </div>
    <h1 class="font-display font-bold text-2xl mb-2">{{ uiStore.t('orderSuccess.title') }}</h1>
    <p class="text-sm mb-1" style="color: var(--text-secondary);">{{ uiStore.t('orderSuccess.subtitle') }}</p>
    <p class="font-display font-semibold text-lg my-3">{{ uiStore.t('orderSuccess.orderNumber') }}: #{{ orderNumber }}</p>
    <p class="text-sm mb-6 px-4 py-3 rounded-lg bg-electric-500/10 text-electric-600">{{ uiStore.t('orderSuccess.whatsappNotice') }}</p>

    <div class="space-y-3">
      <a
        v-if="orderStore.lastWhatsappLink"
        :href="orderStore.lastWhatsappLink"
        target="_blank"
        rel="noopener"
        class="flex items-center justify-center gap-2 w-full py-3.5 rounded-lg bg-[#25D366] text-white font-semibold"
        @click="handleWhatsAppClick"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.52 3.48A11.93 11.93 0 0012.04 0C5.5 0 .17 5.33.17 11.87c0 2.09.55 4.13 1.6 5.93L0 24l6.35-1.66a11.86 11.86 0 005.69 1.45h.01c6.54 0 11.87-5.33 11.87-11.87 0-3.17-1.24-6.15-3.4-8.44zM12.05 21.5a9.6 9.6 0 01-4.9-1.34l-.35-.21-3.65.96.97-3.56-.23-.36a9.63 9.63 0 01-1.48-5.12c0-5.32 4.33-9.65 9.66-9.65 2.58 0 5 1.01 6.82 2.84a9.58 9.58 0 012.83 6.82c0 5.32-4.33 9.62-9.67 9.62zm5.3-7.2c-.29-.15-1.72-.85-1.99-.94-.27-.1-.46-.15-.66.15-.2.29-.75.94-.92 1.13-.17.2-.34.22-.63.07-.29-.14-1.22-.45-2.32-1.43-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.48.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.18-.24-.58-.48-.5-.66-.5-.17 0-.37-.02-.56-.02s-.51.07-.78.37c-.27.29-1.02 1-1.02 2.44 0 1.43 1.05 2.82 1.19 3.01.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.12-.26-.2-.55-.34z" /></svg>
        {{ uiStore.t('orderSuccess.contactWhatsapp') }}
      </a>
      <Button variant="outline" size="lg" full :to="{ name: 'TrackOrder' }">{{ uiStore.t('orderSuccess.trackOrder') }}</Button>
      <Button variant="ghost" size="lg" full :to="{ name: 'Home' }">{{ uiStore.t('orderSuccess.continueShopping') }}</Button>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import Button from '../components/common/Button.vue';

const route = useRoute();
const uiStore = useUiStore();
const orderStore = useOrderStore();

const orderNumber = route.params.orderNumber;

function handleWhatsAppClick() {
  if (orderStore.currentOrder?._id) {
    orderStore.markWhatsappOpened(orderStore.currentOrder._id);
  }
}
</script>

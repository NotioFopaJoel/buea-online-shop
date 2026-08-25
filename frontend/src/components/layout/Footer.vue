<template>
  <footer style="background-color: var(--navy);" class="text-white/80 pt-10 pb-24 md:pb-8">
    <div class="container-bos">
      <!-- Trust badges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10 pb-8 sm:pb-10 border-b border-white/10">
        <div v-for="badge in trustBadges" :key="badge" class="flex items-center gap-2 text-xs sm:text-sm">
          <svg class="w-4 h-4 text-cyan-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
          {{ badge }}
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
        <div class="sm:col-span-2 md:col-span-2">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-500 to-cyan-400 flex items-center justify-center">
              <span class="text-white font-display font-bold text-sm">B</span>
            </div>
            <span class="font-display font-bold text-white">BUEA ONLINE SHOP</span>
          </div>
          <p class="text-sm text-white/60 mb-4">Shop Everything. Delivered in Buea.</p>
          <p class="text-xs text-white/50 mb-4">{{ uiStore.t('footer.newsletter') }}</p>
          <form class="flex gap-2" @submit.prevent="subscribed = true">
            <input type="email" required placeholder="you@email.com" class="flex-1 min-w-0 px-3 py-2 rounded-lg text-sm bg-white/10 border border-white/10 text-white placeholder-white/40 focus:outline-none" />
            <button type="submit" class="px-3 py-2 rounded-lg bg-electric-500 text-white text-sm font-semibold shrink-0">{{ uiStore.t('footer.subscribe') }}</button>
          </form>
          <p v-if="subscribed" class="text-xs text-cyan-300 mt-2">✓ Subscribed</p>
        </div>

        <div>
          <h4 class="text-white font-semibold text-sm mb-3">{{ uiStore.t('footer.customerService') }}</h4>
          <ul class="space-y-2 text-sm text-white/60">
            <li><router-link to="/about" class="hover:text-white">{{ uiStore.t('footer.aboutUs') }}</router-link></li>
            <li><router-link to="/contact" class="hover:text-white">{{ uiStore.t('footer.contact') }}</router-link></li>
            <li><router-link to="/contact" class="hover:text-white">{{ uiStore.t('footer.helpCenter') }}</router-link></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold text-sm mb-3">{{ uiStore.t('footer.deliveryInfo') }}</h4>
          <ul class="space-y-2 text-sm text-white/60">
            <li>{{ uiStore.t('checkout.deliveryOnlyBuea') }}</li>
            <li>{{ uiStore.t('checkout.freeDeliveryFrom') }}</li>
            <li><router-link to="/track-order" class="hover:text-white">{{ uiStore.t('nav.trackOrder') }}</router-link></li>
          </ul>
        </div>

        <div>
          <h4 class="text-white font-semibold text-sm mb-3">{{ uiStore.t('footer.followUs') }}</h4>
          <ul class="space-y-2 text-sm text-white/60">
            <li><router-link to="#" class="hover:text-white">Facebook</router-link></li>
            <li><router-link to="#" class="hover:text-white">Instagram</router-link></li>
            <li><router-link to="#" class="hover:text-white">TikTok</router-link></li>
            <li><router-link to="#" class="hover:text-white">WhatsApp</router-link></li>
          </ul>
        </div>
      </div>

      <div class="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-3 text-xs text-white/50">
        <span>&copy; {{ year }} BUEA ONLINE SHOP. All rights reserved.</span>
        <div class="flex gap-4">
          <router-link to="#" class="hover:text-white">{{ uiStore.t('footer.privacyPolicy') }}</router-link>
          <router-link to="#" class="hover:text-white">{{ uiStore.t('footer.terms') }}</router-link>
          <router-link to="#" class="hover:text-white">{{ uiStore.t('footer.returnPolicy') }}</router-link>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();
const subscribed = ref(false);
const year = computed(() => new Date().getFullYear());

const trustBadges = computed(() => [
  uiStore.t('trust.payAfterDelivery'),
  uiStore.t('trust.deliveryBuea'),
  uiStore.t('trust.freeDelivery'),
  uiStore.t('trust.whatsappConfirm'),
]);
</script>

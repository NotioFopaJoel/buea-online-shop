<template>
  <header class="sticky top-0 z-50" style="background-color: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
    <div class="container-bos flex items-center gap-4 py-3">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2 shrink-0">
        <BrandLogo :width="34" :height="35" icon-only class="shrink-0" />
        <div class="hidden sm:block leading-tight">
          <div class="font-display font-bold text-base tracking-tight" style="color: var(--text-primary);">BUEA <span class="text-electric-500">ONLINE SHOP</span></div>
        </div>
      </router-link>

      <!-- Search (desktop) -->
      <SearchBar class="hidden md:flex" />

      <!-- Right icons -->
      <div class="flex items-center gap-1 ml-auto">
        <!-- Language switcher -->
        <button
          class="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          style="color: var(--text-secondary);"
          @click="uiStore.toggleLanguage()"
        >
          <span :class="uiStore.language === 'en' ? 'text-electric-500' : ''">EN</span>
          <span class="opacity-40">|</span>
          <span :class="uiStore.language === 'fr' ? 'text-electric-500' : ''">FR</span>
        </button>

        <!-- Help / onboarding tour -->
        <button
          class="flex w-9 h-9 items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          style="color: var(--text-secondary);"
          :title="uiStore.t('onboarding.reopen')"
          @click="uiStore.openOnboarding()"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3m.08 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </button>

        <!-- Theme toggle -->
        <button
          class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
          style="color: var(--text-secondary);"
          @click="uiStore.toggleTheme()"
        >
          <svg v-if="uiStore.isDark" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.02 0l-.7.7M6.34 17.66l-.7.7M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        </button>

        <!-- Admin / Seller dashboard shortcut - only visible to that role -->
        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-white dark:bg-electric-500"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 3v18M4 3h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z" /></svg>
          {{ uiStore.t('header.adminDashboard') }}
        </router-link>
        <router-link
          v-else-if="authStore.isSeller"
          to="/seller"
          class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-900 text-white dark:bg-electric-500"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
          {{ uiStore.t('header.sellerDashboard') }}
        </router-link>

        <!-- Account -->
        <router-link :to="isAuthenticated ? '/profile' : '/login'" class="hidden sm:flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10" style="color: var(--text-primary);">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <span class="text-xs font-medium">{{ isAuthenticated ? user.name.split(' ')[0] : uiStore.t('header.signIn') }}</span>
        </router-link>

        <!-- Wishlist -->
        <router-link to="/wishlist" class="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10" style="color: var(--text-primary);">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          <span v-if="wishlistStore.count > 0" class="absolute -top-1 -right-1 bg-promo text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ wishlistStore.count }}</span>
        </router-link>

        <!-- Cart -->
        <router-link to="/cart" class="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10" style="color: var(--text-primary);">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          <span v-if="cartStore.itemCount > 0" class="absolute -top-1 -right-1 bg-electric-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{{ cartStore.itemCount }}</span>
        </router-link>
      </div>
    </div>

    <!-- Search (mobile) -->
    <div class="md:hidden container-bos pb-3">
      <SearchBar />
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import SearchBar from './SearchBar.vue';
import BrandLogo from '../common/BrandLogo.vue';
import { useUiStore } from '../../stores/ui';
import { useAuthStore } from '../../stores/auth';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';

const uiStore = useUiStore();
const authStore = useAuthStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
</script>

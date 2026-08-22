<template>
  <nav
    class="fixed bottom-0 left-0 right-0 z-50 grid grid-cols-5"
    style="background-color: var(--bg-secondary); border-top: 1px solid var(--border-color);"
  >
    <router-link
      v-for="item in items"
      :key="item.name"
      :to="item.to"
      class="flex flex-col items-center justify-center gap-1 py-2 relative"
      :class="isActive(item) ? 'text-electric-500' : ''"
      style="color: var(--text-secondary);"
    >
      <div class="relative">
        <component :is="item.icon" class="w-5 h-5" />
        <span
          v-if="item.badge"
          class="absolute -top-1.5 -right-2 bg-promo text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center"
        >
          {{ item.badge }}
        </span>
      </div>
      <span class="text-[10px] font-medium">{{ item.label }}</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed, h } from 'vue';
import { useRoute } from 'vue-router';
import { useUiStore } from '../../stores/ui';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const uiStore = useUiStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();

const icon = (path) => ({ render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: path })]) });

const items = computed(() => [
  { name: 'home', label: uiStore.t('nav.home'), to: '/', icon: icon('M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6') },
  { name: 'categories', label: uiStore.t('nav.categories'), to: '/shop', icon: icon('M4 6h16M4 12h16M4 18h16') },
  { name: 'cart', label: uiStore.t('header.cart'), to: '/cart', badge: cartStore.itemCount || null, icon: icon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z') },
  { name: 'wishlist', label: uiStore.t('header.wishlist'), to: '/wishlist', badge: wishlistStore.count || null, icon: icon('M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z') },
  { name: 'account', label: uiStore.t('header.account'), to: authStore.isAuthenticated ? '/profile' : '/login', icon: icon('M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z') },
]);

function isActive(item) {
  return route.path === item.to || (item.to !== '/' && route.path.startsWith(item.to));
}
</script>

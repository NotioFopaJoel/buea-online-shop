<template>
  <nav class="hidden md:block" style="background-color: var(--navy);">
    <div class="container-bos flex items-center gap-6 py-2.5 text-sm">
      <div class="relative">
        <button
          class="flex items-center gap-2 text-white font-medium"
          @mouseenter="showMegaMenu = true"
          @mouseleave="showMegaMenu = false"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          {{ uiStore.t('nav.allCategories') }}

          <div
            v-if="showMegaMenu"
            class="absolute top-full left-0 w-64 rounded-b-lg shadow-xl py-2 z-40"
            style="background-color: var(--card-background); border: 1px solid var(--border-color);"
          >
            <router-link
              v-for="cat in productStore.categories"
              :key="cat._id"
              :to="{ name: 'Category', params: { slug: cat.slug } }"
              class="block px-4 py-2 text-sm hover:bg-electric-500/10"
              style="color: var(--text-primary);"
            >
              {{ uiStore.language === 'fr' && cat.nameFr ? cat.nameFr : cat.name }}
            </router-link>
          </div>
        </button>
      </div>

      <router-link to="/" class="text-white/90 hover:text-cyan-300">{{ uiStore.t('nav.home') }}</router-link>
      <router-link to="/shop?deal=true" class="text-white/90 hover:text-cyan-300">{{ uiStore.t('nav.deals') }}</router-link>
      <router-link to="/shop?new=true" class="text-white/90 hover:text-cyan-300">{{ uiStore.t('nav.newArrivals') }}</router-link>
      <router-link to="/shop?bestseller=true" class="text-white/90 hover:text-cyan-300">{{ uiStore.t('nav.bestSellers') }}</router-link>
      <router-link to="/track-order" class="text-white/90 hover:text-cyan-300">{{ uiStore.t('nav.trackOrder') }}</router-link>
      <router-link to="/contact" class="text-white/90 hover:text-cyan-300 ml-auto">{{ uiStore.t('nav.help') }}</router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUiStore } from '../../stores/ui';
import { useProductStore } from '../../stores/product';

const uiStore = useUiStore();
const productStore = useProductStore();
const showMegaMenu = ref(false);

onMounted(() => {
  if (!productStore.categories.length) {
    productStore.fetchCategories().catch(() => {});
  }
});
</script>

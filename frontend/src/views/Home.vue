<template>
  <div class="container-bos py-6">
    <HeroBanner />

    <AdBanner />

    <!-- Shop by Category -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-bold text-xl">{{ uiStore.t('home.shopByCategory') }}</h2>
        <router-link to="/shop" class="text-sm font-medium text-electric-500">{{ uiStore.t('home.viewAll') }}</router-link>
      </div>
      <div class="flex gap-5 overflow-x-auto pb-2 scrollbar-hide">
        <CategoryCard v-for="cat in productStore.categories" :key="cat._id" :category="cat" variant="compact" />
      </div>
    </section>

    <!-- Deals of the Day -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-display font-bold text-xl">{{ uiStore.t('home.dealsOfTheDay') }}</h2>
        </div>
        <router-link to="/shop?deal=true" class="text-sm font-medium text-electric-500">{{ uiStore.t('home.viewAll') }}</router-link>
      </div>
      <Loader v-if="loadingDeals" />
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <DealCard v-for="product in deals" :key="product._id" :product="product" />
      </div>
    </section>

    <PromoBanner />

    <!-- Category showcase banners (from reference design) -->
    <section class="mb-8 grid sm:grid-cols-2 gap-4">
      <CategoryCard
        v-for="(cat, i) in showcaseCategories"
        :key="cat._id"
        :category="cat"
        variant="banner"
        :bg-color="showcaseColors[i % showcaseColors.length]"
      />
    </section>

    <BrandSection />

    <!-- Best Sellers -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-bold text-xl">{{ uiStore.t('nav.bestSellers') }}</h2>
        <router-link to="/shop?bestseller=true" class="text-sm font-medium text-electric-500">{{ uiStore.t('home.viewAll') }}</router-link>
      </div>
      <ProductGrid :products="bestSellers" :loading="loadingBestSellers" />
    </section>

    <!-- New Arrivals -->
    <section class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-display font-bold text-xl">{{ uiStore.t('nav.newArrivals') }}</h2>
        <router-link to="/shop?new=true" class="text-sm font-medium text-electric-500">{{ uiStore.t('home.viewAll') }}</router-link>
      </div>
      <ProductGrid :products="newArrivals" :loading="loadingNewArrivals" />
    </section>

    <!-- Browse the entire catalog - a real "see everything" CTA, not filtered by any section -->
    <section class="flex flex-col items-center text-center py-10 mb-4 rounded-card" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
      <h2 class="font-display font-bold text-xl mb-2">{{ uiStore.t('home.browseAllTitle') }}</h2>
      <p class="text-sm max-w-md mb-5" style="color: var(--text-secondary);">{{ uiStore.t('home.browseAllDesc') }}</p>
      <router-link
        :to="{ name: 'Shop' }"
        class="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-navy-900 dark:bg-electric-500 text-white font-semibold text-sm hover:bg-navy-800 dark:hover:bg-electric-400 transition-colors"
      >
        {{ uiStore.t('home.viewAllProducts') }}
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </router-link>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { useProductStore } from '../stores/product';
import { useOrderStore } from '../stores/order';
import productService from '../services/productService';

import HeroBanner from '../components/home/HeroBanner.vue';
import AdBanner from '../components/home/AdBanner.vue';
import CategoryCard from '../components/home/CategoryCard.vue';
import DealCard from '../components/home/DealCard.vue';
import PromoBanner from '../components/home/PromoBanner.vue';
import BrandSection from '../components/home/BrandSection.vue';
import ProductGrid from '../components/products/ProductGrid.vue';
import Loader from '../components/common/Loader.vue';

const uiStore = useUiStore();
const productStore = useProductStore();
const orderStore = useOrderStore();

const deals = ref([]);
const bestSellers = ref([]);
const newArrivals = ref([]);
const loadingDeals = ref(true);
const loadingBestSellers = ref(true);
const loadingNewArrivals = ref(true);

const showcaseColors = ['#EEF2FB', '#FBF3E4', '#E9F2FB', '#EFEDE6', '#0A1230', '#FBEAF0'];
const showcaseCategories = computed(() => productStore.categories.slice(0, 6));

onMounted(async () => {
  productStore.fetchCategories().catch(() => {});
  orderStore.fetchPublicSettings().catch(() => {});
  orderStore.fetchDeliveryZones().catch(() => {});

  try {
    const res = await productService.getProducts({ isDealOfTheDay: 'true', limit: 5 });
    deals.value = res.data.products;
  } catch { /* noop */ } finally { loadingDeals.value = false; }

  try {
    const res = await productService.getProducts({ isBestSeller: 'true', limit: 8 });
    bestSellers.value = res.data.products;
  } catch { /* noop */ } finally { loadingBestSellers.value = false; }

  try {
    const res = await productService.getProducts({ isNewArrival: 'true', limit: 8 });
    newArrivals.value = res.data.products;
  } catch { /* noop */ } finally { loadingNewArrivals.value = false; }
});
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

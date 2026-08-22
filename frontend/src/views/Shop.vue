<template>
  <div class="container-bos py-6">
    <div class="flex flex-col md:flex-row gap-6">
      <!-- Filters sidebar -->
      <aside class="md:w-64 shrink-0">
        <button class="md:hidden w-full mb-3 py-2.5 rounded-lg text-sm font-semibold" style="border: 1px solid var(--border-color);" @click="showFilters = true">
          Filters & Sort
        </button>

        <div class="hidden md:block space-y-6 sticky top-24">
          <FilterPanel v-model:filters="filters" @apply="applyFilters" />
        </div>
      </aside>

      <!-- Products -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h1 class="font-display font-bold text-xl">{{ pageTitle }}</h1>
          <select v-model="filters.sort" class="text-sm px-3 py-2 rounded-lg" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" @change="applyFilters">
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="best_rated">Best Rated</option>
          </select>
        </div>

        <ProductGrid :products="productStore.products" :loading="productStore.loading" />
        <Pagination v-model="page" :total-pages="productStore.totalPages" @update:modelValue="applyFilters" />
      </div>
    </div>

    <Modal v-model="showFilters" title="Filters & Sort">
      <FilterPanel v-model:filters="filters" @apply="() => { applyFilters(); showFilters = false; }" />
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useProductStore } from '../stores/product';
import ProductGrid from '../components/products/ProductGrid.vue';
import Pagination from '../components/common/Pagination.vue';
import Modal from '../components/common/Modal.vue';
import FilterPanel from '../components/products/FilterPanel.vue';

const props = defineProps({
  categorySlug: { type: String, default: '' },
  searchQuery: { type: String, default: '' },
});

const route = useRoute();
const productStore = useProductStore();

const page = ref(1);
const showFilters = ref(false);
const filters = reactive({
  minPrice: '', maxPrice: '', brand: '', rating: '', color: '', size: '', sort: 'newest',
});

const pageTitle = computed(() => {
  if (props.searchQuery) return `Results for "${props.searchQuery}"`;
  if (props.categorySlug) return props.categorySlug.replace(/-/g, ' ');
  return 'All Products';
});

async function applyFilters() {
  const params = {
    page: page.value,
    limit: 20,
    sort: filters.sort,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
    brand: filters.brand || undefined,
    rating: filters.rating || undefined,
    color: filters.color || undefined,
    size: filters.size || undefined,
    q: props.searchQuery || undefined,
  };

  if (props.categorySlug) {
    // category slug -> id lookup happens once categories are loaded
    if (!productStore.categories.length) await productStore.fetchCategories();
    const match = productStore.categories.find((c) => c.slug === props.categorySlug)
      || productStore.categories.flatMap((c) => c.subcategories || []).find((c) => c.slug === props.categorySlug);
    if (match) params.category = match._id;
  }

  if (route.query.deal === 'true') params.isDealOfTheDay = 'true';
  if (route.query.new === 'true') params.isNewArrival = 'true';
  if (route.query.bestseller === 'true') params.isBestSeller = 'true';

  await productStore.fetchProducts(params);
}

onMounted(applyFilters);
watch(() => [props.categorySlug, props.searchQuery, route.query], applyFilters);
</script>

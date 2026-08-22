<template>
  <div>
    <Loader v-if="loading" />
    <EmptyState
      v-else-if="!products.length"
      :title="emptyTitle"
      :description="emptyDescription"
    />
    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <ProductCard v-for="product in products" :key="product._id" :product="product" />
    </div>
  </div>
</template>

<script setup>
import ProductCard from './ProductCard.vue';
import Loader from '../common/Loader.vue';
import EmptyState from '../common/EmptyState.vue';

defineProps({
  products: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'No products found' },
  emptyDescription: { type: String, default: 'Try adjusting your filters or search terms.' },
});
</script>

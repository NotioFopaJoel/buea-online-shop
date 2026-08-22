<template>
  <section v-if="products.length" class="mt-12">
    <h2 class="font-display font-bold text-xl mb-4">{{ title }}</h2>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      <ProductCard v-for="product in products" :key="product._id" :product="product" />
    </div>
  </section>
</template>

<script setup>
import ProductCard from './ProductCard.vue';

defineProps({
  products: { type: Array, default: () => [] },
  title: { type: String, default: 'Related Products' },
});
</script>

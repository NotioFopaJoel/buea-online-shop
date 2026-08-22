<template>
  <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="rounded-card overflow-hidden card-surface block">
    <div class="relative aspect-square" style="background-color: var(--bg-primary);">
      <img :src="product.images?.[0]" :alt="product.name" class="w-full h-full object-cover" />
      <span v-if="product.discount > 0" class="absolute top-2 left-2 bg-promo text-white text-xs font-bold px-2 py-0.5 rounded">-{{ product.discount }}%</span>
    </div>
    <div class="p-3">
      <p class="text-sm font-medium line-clamp-2 min-h-[2.5em]" style="color: var(--text-primary);">{{ product.name }}</p>
      <div class="flex items-baseline gap-2 mt-1">
        <span class="font-display font-bold text-sm" style="color: var(--text-primary);">{{ formatPrice(product.price) }}</span>
        <span v-if="product.comparePrice > product.price" class="text-xs line-through" style="color: var(--text-secondary);">{{ formatPrice(product.comparePrice) }}</span>
      </div>
      <div class="flex items-center gap-1 text-xs mt-1" style="color: var(--text-secondary);">
        <div class="flex text-amber-400">
          <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(product.rating) ? 'fill-current' : 'fill-none'" viewBox="0 0 20 20" stroke="currentColor" stroke-width="1"><path d="M10 15l-5.5 3 1.5-6-4.5-4h6L10 2l2.5 6h6l-4.5 4 1.5 6z" /></svg>
        </div>
        <span>({{ product.reviewCount || 0 }})</span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { formatPrice } from '../../utils/formatPrice';

defineProps({
  product: { type: Object, required: true },
});
</script>

<template>
  <div class="group rounded-card overflow-hidden card-surface transition-shadow hover:shadow-lg flex flex-col">
    <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="relative block aspect-square overflow-hidden" style="background-color: var(--bg-primary);">
      <img :src="product.images?.[0]" :alt="product.name" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <span v-if="product.discount > 0" class="absolute top-2 left-2 bg-promo text-white text-xs font-bold px-2 py-0.5 rounded">-{{ product.discount }}%</span>
      <button
        class="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow"
        style="background-color: var(--card-background);"
        @click.prevent="handleWishlistToggle"
      >
        <svg class="w-4 h-4" :class="isWishlisted ? 'text-promo fill-current' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
      </button>
    </router-link>

    <div class="p-3 flex flex-col gap-1.5 flex-1">
      <router-link :to="{ name: 'ProductDetails', params: { slug: product.slug } }" class="font-medium text-sm line-clamp-2 min-h-[2.5em]" style="color: var(--text-primary);">
        {{ product.name }}
      </router-link>

      <div class="flex items-center gap-1 text-xs" style="color: var(--text-secondary);">
        <div class="flex text-amber-400">
          <svg v-for="i in 5" :key="i" class="w-3 h-3" :class="i <= Math.round(product.rating) ? 'fill-current' : 'fill-none'" viewBox="0 0 20 20" stroke="currentColor" stroke-width="1"><path d="M10 15l-5.5 3 1.5-6-4.5-4h6L10 2l2.5 6h6l-4.5 4 1.5 6z" /></svg>
        </div>
        <span>({{ product.reviewCount || 0 }})</span>
      </div>

      <div class="flex items-baseline gap-2 mt-auto">
        <span class="font-display font-bold text-sm" style="color: var(--text-primary);">{{ formatPrice(product.price) }}</span>
        <span v-if="product.comparePrice > product.price" class="text-xs line-through" style="color: var(--text-secondary);">{{ formatPrice(product.comparePrice) }}</span>
      </div>

      <button
        class="mt-2 w-full py-2 rounded-lg text-xs font-semibold bg-navy-900 text-white hover:bg-navy-800 dark:bg-electric-500 dark:hover:bg-electric-400 disabled:opacity-50"
        :disabled="product.stock === 0"
        @click="handleAddToCart"
      >
        {{ product.stock === 0 ? uiStore.t('product.outOfStock') : uiStore.t('product.addToCart') }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../../stores/ui';
import { useCartStore } from '../../stores/cart';
import { useWishlistStore } from '../../stores/wishlist';
import { formatPrice } from '../../utils/formatPrice';

const props = defineProps({
  product: { type: Object, required: true },
});

const router = useRouter();
const uiStore = useUiStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const isWishlisted = computed(() => wishlistStore.isInWishlist(props.product._id));

function handleAddToCart() {
  cartStore.addItem(props.product, 1);
  uiStore.pushToast(`${uiStore.t('product.addedToCart')} ✓`);
}

async function handleWishlistToggle() {
  try {
    await wishlistStore.toggle(props.product);
  } catch (err) {
    if (err.requiresAuth) {
      router.push({ name: 'Login' });
    }
  }
}
</script>

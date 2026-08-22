<template>
  <div class="container-bos py-6">
    <Loader v-if="loading" full-page />

    <template v-else-if="product">
      <!-- Breadcrumb -->
      <nav class="text-xs mb-4 flex items-center gap-1.5" style="color: var(--text-secondary);">
        <router-link to="/">Home</router-link> /
        <router-link :to="{ name: 'Category', params: { slug: product.category?.slug } }">{{ product.category?.name }}</router-link> /
        <span>{{ product.name }}</span>
      </nav>

      <div class="grid md:grid-cols-2 gap-8">
        <ProductGallery :images="product.images" :alt="product.name" />

        <div>
          <h1 class="font-display font-bold text-2xl mb-2">{{ product.name }}</h1>
          <p v-if="product.brand" class="text-sm mb-2" style="color: var(--text-secondary);">{{ product.brand }}</p>
          <ProductRating :rating="product.rating" :review-count="product.reviewCount" />

          <div class="my-4">
            <ProductPrice :price="product.price" :compare-price="product.comparePrice" :discount="product.discount" />
          </div>

          <p class="text-sm mb-1" :class="product.stock > 0 ? 'text-green-600' : 'text-promo'">
            {{ product.stock > 0 ? uiStore.t('product.inStock') : uiStore.t('product.outOfStock') }}
          </p>

          <ProductOptions
            v-model:selected-color="selectedColor"
            v-model:selected-size="selectedSize"
            :colors="product.colors"
            :sizes="product.sizes"
            class="my-5"
          />

          <div class="flex items-center gap-3 mb-5">
            <span class="text-sm font-medium">{{ uiStore.t('product.quantity') }}</span>
            <div class="flex items-center border rounded-lg" style="border-color: var(--border-color);">
              <button class="w-9 h-9" @click="quantity = Math.max(1, quantity - 1)">−</button>
              <span class="w-10 text-center text-sm">{{ quantity }}</span>
              <button class="w-9 h-9" @click="quantity = Math.min(product.stock, quantity + 1)">+</button>
            </div>
          </div>

          <div class="flex gap-3 mb-3">
            <Button variant="primary" size="lg" full :disabled="product.stock === 0" @click="handleAddToCart">
              {{ uiStore.t('product.addToCart') }}
            </Button>
            <Button variant="outline" size="lg" full :disabled="product.stock === 0" @click="handleBuyNow">
              {{ uiStore.t('product.buyNow') }}
            </Button>
          </div>
          <button class="flex items-center gap-2 text-sm font-medium" style="color: var(--text-secondary);" @click="handleWishlistToggle">
            <svg class="w-5 h-5" :class="isWishlisted ? 'text-promo fill-current' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {{ uiStore.t('product.addToWishlist') }}
          </button>

          <div class="mt-6 pt-6 space-y-2 text-sm" style="border-top: 1px solid var(--border-color); color: var(--text-secondary);">
            <p class="flex items-center gap-2"><svg class="w-4 h-4 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>{{ uiStore.t('checkout.deliveryOnlyBuea') }}</p>
            <p class="flex items-center gap-2"><svg class="w-4 h-4 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>{{ uiStore.t('checkout.freeDeliveryFrom') }}</p>
            <p class="flex items-center gap-2"><svg class="w-4 h-4 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>{{ uiStore.t('checkout.payAfterDeliveryNotice') }}</p>
          </div>
        </div>
      </div>

      <!-- Description -->
      <section class="mt-10 max-w-3xl">
        <h2 class="font-display font-bold text-lg mb-3">{{ uiStore.t('product.description') }}</h2>
        <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">{{ product.description }}</p>
      </section>

      <!-- Reviews -->
      <section class="mt-10 max-w-3xl">
        <h2 class="font-display font-bold text-lg mb-4">{{ uiStore.t('product.reviews') }} ({{ product.reviewCount }})</h2>
        <div v-if="reviews.length" class="space-y-4">
          <div v-for="review in reviews" :key="review._id" class="pb-4" style="border-bottom: 1px solid var(--border-color);">
            <div class="flex items-center justify-between mb-1">
              <span class="font-medium text-sm">{{ review.user?.name }}</span>
              <ProductRating :rating="review.rating" :review-count="0" class="[&>span]:hidden" />
            </div>
            <p class="text-sm" style="color: var(--text-secondary);">{{ review.comment }}</p>
          </div>
        </div>
        <p v-else class="text-sm" style="color: var(--text-secondary);">No reviews yet.</p>
      </section>

      <RelatedProducts :products="relatedProducts" :title="uiStore.t('product.relatedProducts')" />

      <RelatedProducts
        v-if="productStore.recentlyViewed.length > 1"
        :products="productStore.recentlyViewed.filter(p => p._id !== product._id)"
        :title="uiStore.t('product.recentlyViewed')"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useProductStore } from '../stores/product';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import productService from '../services/productService';

import Loader from '../components/common/Loader.vue';
import Button from '../components/common/Button.vue';
import ProductGallery from '../components/products/ProductGallery.vue';
import ProductRating from '../components/products/ProductRating.vue';
import ProductPrice from '../components/products/ProductPrice.vue';
import ProductOptions from '../components/products/ProductOptions.vue';
import RelatedProducts from '../components/products/RelatedProducts.vue';

const route = useRoute();
const router = useRouter();
const uiStore = useUiStore();
const productStore = useProductStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const loading = ref(true);
const reviews = ref([]);
const quantity = ref(1);
const selectedColor = ref('');
const selectedSize = ref('');

const product = computed(() => productStore.currentProduct);
const relatedProducts = computed(() => productStore.relatedProducts);
const isWishlisted = computed(() => product.value && wishlistStore.isInWishlist(product.value._id));

async function loadProduct() {
  loading.value = true;
  try {
    const p = await productStore.fetchProductBySlug(route.params.slug);
    selectedColor.value = p.colors?.[0] || '';
    selectedSize.value = p.sizes?.[0] || '';
    quantity.value = 1;
    const reviewRes = await productService.getProductReviews(p._id);
    reviews.value = reviewRes.data.reviews;
  } catch {
    router.push({ name: 'NotFound' });
  } finally {
    loading.value = false;
  }
}

function handleAddToCart() {
  cartStore.addItem(product.value, quantity.value, selectedColor.value, selectedSize.value);
  uiStore.pushToast(`${uiStore.t('product.addedToCart')} ✓`);
}

function handleBuyNow() {
  cartStore.addItem(product.value, quantity.value, selectedColor.value, selectedSize.value);
  router.push({ name: 'Checkout' });
}

async function handleWishlistToggle() {
  try {
    await wishlistStore.toggle(product.value);
  } catch (err) {
    if (err.requiresAuth) router.push({ name: 'Login' });
  }
}

onMounted(loadProduct);
watch(() => route.params.slug, loadProduct);
</script>

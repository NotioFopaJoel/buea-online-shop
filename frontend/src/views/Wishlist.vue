<template>
  <div class="container-bos py-6">
    <h1 class="font-display font-bold text-2xl mb-6">{{ uiStore.t('header.wishlist') }}</h1>

    <div v-if="!authStore.isAuthenticated">
      <EmptyState title="Sign in to view your wishlist" description="Create an account or sign in to save your favorite products.">
        <template #action><Button variant="primary" :to="{ name: 'Login' }">{{ uiStore.t('header.signIn') }}</Button></template>
      </EmptyState>
    </div>

    <template v-else>
      <Loader v-if="wishlistStore.loading" />
      <EmptyState v-else-if="!wishlistStore.products.length" title="Your wishlist is empty" description="Tap the heart icon on any product to save it here.">
        <template #action><Button variant="primary" :to="{ name: 'Shop' }">{{ uiStore.t('home.shopNow') }}</Button></template>
      </EmptyState>
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <ProductCard v-for="product in wishlistStore.products" :key="product._id" :product="product" />
      </div>
    </template>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import { useWishlistStore } from '../stores/wishlist';
import ProductCard from '../components/products/ProductCard.vue';
import Loader from '../components/common/Loader.vue';
import EmptyState from '../components/common/EmptyState.vue';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const authStore = useAuthStore();
const wishlistStore = useWishlistStore();

onMounted(() => {
  if (authStore.isAuthenticated) wishlistStore.fetchWishlist();
});
</script>

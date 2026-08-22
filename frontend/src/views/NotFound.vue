<template>
  <div class="container-bos py-20 text-center">
    <p class="font-display font-bold text-6xl mb-2 text-electric-500">404</p>
    <h1 class="font-display font-bold text-xl mb-2">Page not found</h1>
    <p class="text-sm mb-6" style="color: var(--text-secondary);">The page you're looking for doesn't exist or has been moved.</p>
    <Button variant="primary" :to="{ name: 'Home' }">Back to Home</Button>
  </div>
</template>

<script setup>
import Button from '../components/common/Button.vue';
</script>

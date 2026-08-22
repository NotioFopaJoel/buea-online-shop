<template>
  <Shop :category-slug="$route.params.slug" />
</template>

<script setup>
import Shop from './Shop.vue';
</script>

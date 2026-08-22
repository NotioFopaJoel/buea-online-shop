<template>
  <Shop :search-query="$route.query.q || ''" />
</template>

<script setup>
import Shop from './Shop.vue';
</script>

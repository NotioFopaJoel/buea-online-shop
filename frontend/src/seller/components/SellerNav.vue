<template>
  <div class="flex items-center gap-1 overflow-x-auto mb-6 pb-2">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
      :class="$route.path === item.to ? 'bg-navy-900 text-white dark:bg-electric-500' : 'hover:bg-black/5 dark:hover:bg-white/10'"
    >
      {{ item.label }}
    </router-link>
  </div>
</template>

<script setup>
const items = [
  { to: '/seller', label: 'Dashboard' },
  { to: '/seller/products', label: 'My Products' },
  { to: '/seller/orders', label: 'Orders' },
  { to: '/seller/earnings', label: 'Earnings' },
];
</script>

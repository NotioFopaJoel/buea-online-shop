<template>
  <div class="flex items-center gap-1 overflow-x-auto mb-6 pb-2 -mx-1 px-1">
    <router-link
      v-for="item in items"
      :key="item.to"
      :to="item.to"
      class="px-3.5 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
      :class="$route.path === item.to ? 'bg-navy-900 text-white dark:bg-electric-500' : 'hover:bg-black/5 dark:hover:bg-white/10'"
      style="color: inherit;"
    >
      {{ item.label }}
    </router-link>
  </div>
</template>

<script setup>
const items = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/promotions', label: 'Promotions' },
  { to: '/admin/advertising', label: 'Advertising' },
  { to: '/admin/referrals', label: 'Referrals' },
  { to: '/admin/messages', label: 'Messages' },
  { to: '/admin/settings', label: 'Settings' },
];
</script>

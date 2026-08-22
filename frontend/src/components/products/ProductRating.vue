<template>
  <div class="flex items-center gap-1.5">
    <div class="flex text-amber-400">
      <svg v-for="i in 5" :key="i" class="w-4 h-4" :class="i <= Math.round(rating) ? 'fill-current' : 'fill-none'" viewBox="0 0 20 20" stroke="currentColor" stroke-width="1">
        <path d="M10 15l-5.5 3 1.5-6-4.5-4h6L10 2l2.5 6h6l-4.5 4 1.5 6z" />
      </svg>
    </div>
    <span class="text-sm" style="color: var(--text-secondary);">{{ rating.toFixed(1) }} ({{ reviewCount }})</span>
  </div>
</template>

<script setup>
defineProps({
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
});
</script>

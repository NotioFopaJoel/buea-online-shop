<template>
  <div class="rounded-card card-surface p-4">
    <p class="text-xs mb-1" style="color: var(--text-secondary);">{{ label }}</p>
    <p class="font-display font-bold text-xl" :class="accentClass">{{ value }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], required: true },
  accent: { type: String, default: '' }, // amber | green | red
});

const accentClass = computed(() => {
  const map = { amber: 'text-amber-500', green: 'text-green-600', red: 'text-promo' };
  return map[props.accent] || '';
});
</script>

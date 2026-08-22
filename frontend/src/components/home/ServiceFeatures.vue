<template>
  <div class="flex items-center gap-2.5">
    <div class="w-9 h-9 rounded-lg bg-navy-900/5 flex items-center justify-center shrink-0 text-navy-900">
      <svg v-if="icon === 'delivery'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 7h13v10H3zM16 10h3l2 3v4h-5zM6.5 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM18 20a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
      <svg v-else-if="icon === 'secure'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M9 12l2 2 4-4m5-3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5l8-3 8 3z" /></svg>
      <svg v-else-if="icon === 'returns'" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M3 10h11a5 5 0 010 10H9m-6-10l4-4m-4 4l4 4" /></svg>
      <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M18 10a6 6 0 10-12 0v4a2 2 0 002 2h1v-6H6a6 6 0 1112 0h-3v6h1a2 2 0 002-2v-4z" /></svg>
    </div>
    <div class="leading-tight">
      <p class="text-xs sm:text-sm font-semibold text-navy-900">{{ title }}</p>
      <p class="text-[11px] sm:text-xs text-navy-700/60">{{ desc }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: 'delivery' },
  title: { type: String, required: true },
  desc: { type: String, default: '' },
});
</script>

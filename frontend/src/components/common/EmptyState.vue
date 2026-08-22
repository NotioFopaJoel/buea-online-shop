<template>
  <div class="flex flex-col items-center justify-center text-center py-16 px-4">
    <div class="w-20 h-20 rounded-full flex items-center justify-center mb-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
      <slot name="icon">
        <svg class="w-9 h-9" style="color: var(--text-secondary);" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0l-2 7H6l-2-7m16 0H4" />
        </svg>
      </slot>
    </div>
    <h3 class="font-display font-semibold text-lg mb-1">{{ title }}</h3>
    <p class="text-sm max-w-xs mb-5" style="color: var(--text-secondary);">{{ description }}</p>
    <slot name="action" />
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
});
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-3" :class="fullPage ? 'min-h-[50vh]' : 'py-10'">
    <svg class="animate-spin h-8 w-8 text-electric-500" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <p v-if="label" class="text-sm" style="color: var(--text-secondary);">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  label: { type: String, default: '' },
  fullPage: { type: Boolean, default: false },
});
</script>

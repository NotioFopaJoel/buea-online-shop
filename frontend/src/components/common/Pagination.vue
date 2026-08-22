<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 mt-8">
    <button
      class="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-40"
      style="border-color: var(--border-color);"
      :disabled="modelValue <= 1"
      @click="$emit('update:modelValue', modelValue - 1)"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" /></svg>
    </button>

    <button
      v-for="page in pageNumbers"
      :key="page"
      class="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium"
      :class="page === modelValue
        ? 'bg-navy-900 text-white dark:bg-electric-500'
        : 'hover:bg-navy-900/5 dark:hover:bg-white/10'"
      style="border: 1px solid var(--border-color);"
      @click="$emit('update:modelValue', page)"
    >
      {{ page }}
    </button>

    <button
      class="w-9 h-9 flex items-center justify-center rounded-lg border disabled:opacity-40"
      style="border-color: var(--border-color);"
      :disabled="modelValue >= totalPages"
      @click="$emit('update:modelValue', modelValue + 1)"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: { type: Number, required: true },
  totalPages: { type: Number, required: true },
});
defineEmits(['update:modelValue']);

const pageNumbers = computed(() => {
  const range = [];
  const start = Math.max(1, props.modelValue - 2);
  const end = Math.min(props.totalPages, start + 4);
  for (let i = start; i <= end; i += 1) range.push(i);
  return range;
});
</script>

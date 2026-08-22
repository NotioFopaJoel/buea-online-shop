<template>
  <div class="space-y-4">
    <div v-if="colors?.length">
      <span class="text-sm font-medium block mb-2">{{ uiStore.t('product.color') }}: <span style="color: var(--text-secondary);">{{ selectedColor }}</span></span>
      <div class="flex gap-2">
        <button
          v-for="color in colors"
          :key="color"
          class="w-9 h-9 rounded-full border-2"
          :style="{ backgroundColor: color.toLowerCase(), borderColor: selectedColor === color ? 'var(--accent-color)' : 'var(--border-color)' }"
          :title="color"
          @click="$emit('update:selectedColor', color)"
        />
      </div>
    </div>

    <div v-if="sizes?.length">
      <span class="text-sm font-medium block mb-2">{{ uiStore.t('product.size') }}: <span style="color: var(--text-secondary);">{{ selectedSize }}</span></span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in sizes"
          :key="size"
          class="px-3.5 py-1.5 rounded-lg text-sm font-medium"
          :style="{
            border: '1px solid var(--border-color)',
            backgroundColor: selectedSize === size ? 'var(--accent-color)' : 'transparent',
            color: selectedSize === size ? '#fff' : 'var(--text-primary)',
          }"
          @click="$emit('update:selectedSize', size)"
        >
          {{ size }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';

defineProps({
  colors: { type: Array, default: () => [] },
  sizes: { type: Array, default: () => [] },
  selectedColor: { type: String, default: '' },
  selectedSize: { type: String, default: '' },
});
defineEmits(['update:selectedColor', 'update:selectedSize']);

const uiStore = useUiStore();
</script>

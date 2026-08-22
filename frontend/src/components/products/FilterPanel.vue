<template>
  <div class="space-y-5">
    <div>
      <h4 class="font-semibold text-sm mb-2">Price Range (FCFA)</h4>
      <div class="flex items-center gap-2">
        <input v-model="filters.minPrice" type="number" placeholder="Min" class="w-full px-2 py-1.5 text-sm rounded-lg" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
        <span>-</span>
        <input v-model="filters.maxPrice" type="number" placeholder="Max" class="w-full px-2 py-1.5 text-sm rounded-lg" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
      </div>
    </div>

    <div>
      <h4 class="font-semibold text-sm mb-2">Brand</h4>
      <input v-model="filters.brand" type="text" placeholder="e.g. BUEA ONLINE SHOP" class="w-full px-2 py-1.5 text-sm rounded-lg" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
    </div>

    <div>
      <h4 class="font-semibold text-sm mb-2">Rating</h4>
      <div class="space-y-1.5">
        <label v-for="r in [4, 3, 2, 1]" :key="r" class="flex items-center gap-2 text-sm cursor-pointer">
          <input type="radio" :value="String(r)" v-model="filters.rating" name="rating" />
          {{ r }}★ & up
        </label>
      </div>
    </div>

    <div>
      <h4 class="font-semibold text-sm mb-2">Color</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in colors"
          :key="color"
          class="w-7 h-7 rounded-full border-2"
          :style="{ backgroundColor: color.toLowerCase(), borderColor: filters.color === color ? 'var(--accent-color)' : 'var(--border-color)' }"
          @click="filters.color = filters.color === color ? '' : color"
        />
      </div>
    </div>

    <div>
      <h4 class="font-semibold text-sm mb-2">Size</h4>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in sizes"
          :key="size"
          class="px-3 py-1 rounded-lg text-xs font-medium"
          :style="{
            border: '1px solid var(--border-color)',
            backgroundColor: filters.size === size ? 'var(--accent-color)' : 'transparent',
            color: filters.size === size ? '#fff' : 'var(--text-primary)',
          }"
          @click="filters.size = filters.size === size ? '' : size"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <button class="w-full py-2.5 rounded-lg bg-navy-900 text-white text-sm font-semibold dark:bg-electric-500" @click="$emit('apply')">
      Apply Filters
    </button>
  </div>
</template>

<script setup>
import { COLORS, SIZES } from '../../utils/constants';

const filters = defineModel('filters', { type: Object, required: true });
defineEmits(['apply']);

const colors = COLORS;
const sizes = SIZES;
</script>

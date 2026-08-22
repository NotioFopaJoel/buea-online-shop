<template>
  <div>
    <div class="aspect-square rounded-card overflow-hidden mb-3" style="background-color: var(--bg-primary); border: 1px solid var(--border-color);">
      <img :src="activeImage" :alt="alt" class="w-full h-full object-cover" />
    </div>
    <div v-if="images.length > 1" class="flex gap-2">
      <button
        v-for="(img, i) in images"
        :key="i"
        class="w-16 h-16 rounded-lg overflow-hidden shrink-0"
        :style="{ border: img === activeImage ? '2px solid var(--accent-color)' : '1px solid var(--border-color)' }"
        @click="activeImage = img"
      >
        <img :src="img" :alt="`${alt} ${i + 1}`" class="w-full h-full object-cover" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  images: { type: Array, default: () => [] },
  alt: { type: String, default: '' },
});

const activeImage = ref(props.images[0] || '');

watch(() => props.images, (newImages) => {
  activeImage.value = newImages[0] || '';
});
</script>

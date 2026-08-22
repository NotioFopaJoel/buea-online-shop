<template>
  <router-link
    v-if="variant === 'compact'"
    :to="{ name: 'Category', params: { slug: category.slug } }"
    class="flex flex-col items-center gap-2 text-center shrink-0"
  >
    <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden" style="border: 1px solid var(--border-color);">
      <img :src="category.image" :alt="category.name" class="w-full h-full object-cover" />
    </div>
    <span class="text-xs sm:text-sm font-medium" style="color: var(--text-primary);">{{ displayName }}</span>
  </router-link>

  <router-link
    v-else
    :to="{ name: 'Category', params: { slug: category.slug } }"
    class="relative rounded-card overflow-hidden group h-40 flex flex-col justify-between p-5"
    :style="{ backgroundColor: bgColor }"
  >
    <div>
      <h3 class="font-display font-bold text-lg text-navy-900">{{ displayName }}</h3>
      <p class="text-xs text-navy-700/70 mt-1">{{ displayDesc }}</p>
    </div>
    <span class="inline-flex w-fit items-center px-3 py-1.5 rounded-lg bg-navy-900 text-white text-xs font-semibold">
      {{ uiStore.t('home.shopNow') }}
    </span>
    <img :src="category.image" :alt="category.name" class="absolute right-0 bottom-0 w-24 h-24 object-cover rounded-tl-2xl opacity-90 group-hover:scale-105 transition-transform" />
  </router-link>
</template>

<script setup>
import { computed } from 'vue';
import { useUiStore } from '../../stores/ui';

const props = defineProps({
  category: { type: Object, required: true },
  variant: { type: String, default: 'compact' }, // compact | banner
  bgColor: { type: String, default: '#EEF2FB' },
});

const uiStore = useUiStore();

const displayName = computed(() => (uiStore.language === 'fr' && props.category.nameFr ? props.category.nameFr : props.category.name));
const displayDesc = computed(() => (uiStore.language === 'fr' && props.category.descriptionFr ? props.category.descriptionFr : props.category.description));
</script>

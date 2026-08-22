<template>
  <form class="flex-1 flex items-stretch max-w-2xl" @submit.prevent="submitSearch">
    <select
      v-model="selectedCategory"
      class="hidden sm:block px-3 rounded-l-lg text-sm border-r focus:outline-none"
      style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);"
    >
      <option value="">{{ uiStore.t('nav.allCategories') }}</option>
      <option v-for="cat in productStore.categories" :key="cat._id" :value="cat.slug">
        {{ uiStore.language === 'fr' && cat.nameFr ? cat.nameFr : cat.name }}
      </option>
    </select>
    <input
      v-model="query"
      type="text"
      :placeholder="uiStore.t('header.searchPlaceholder')"
      class="flex-1 px-4 py-2.5 text-sm sm:rounded-none rounded-l-lg focus:outline-none"
      style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary);"
    />
    <button type="submit" class="px-4 rounded-r-lg bg-navy-900 dark:bg-electric-500 text-white flex items-center justify-center">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
    </button>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../../stores/ui';
import { useProductStore } from '../../stores/product';

const router = useRouter();
const uiStore = useUiStore();
const productStore = useProductStore();

const query = ref('');
const selectedCategory = ref('');

onMounted(() => {
  if (!productStore.categories.length) {
    productStore.fetchCategories().catch(() => {});
  }
});

function submitSearch() {
  if (!query.value.trim()) return;
  router.push({ name: 'SearchResults', query: { q: query.value, category: selectedCategory.value || undefined } });
}
</script>

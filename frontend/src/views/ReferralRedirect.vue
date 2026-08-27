<template>
  <div class="container-bos py-10 max-w-sm mx-auto text-center">
    <div class="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-4" />
    <p class="text-sm" style="color: var(--text-secondary);">{{ uiStore.t('referral.title') }}...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();

onMounted(() => {
  localStorage.setItem('bos_ref', route.params.code);
  router.replace({ name: 'Register', query: { ref: route.params.code } });
});
</script>

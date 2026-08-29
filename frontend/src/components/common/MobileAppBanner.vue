<template>
  <!-- Highly visible "Get the BUEA App" banner. Hidden automatically when the
       app is already installed (standalone) so it never shows in-app. -->
  <div v-if="visible" class="bos-app-banner">
    <div class="bos-app-banner-inner container-bos">
      <div class="bos-app-banner-brand">
        <BrandLogo :width="38" :height="39" icon-only class="shrink-0" />
        <div class="leading-tight">
          <p class="font-bold text-sm text-white">Get the BUEA Shop app</p>
          <p class="text-xs text-white/70">Faster, free &amp; works offline</p>
        </div>
      </div>
      <InstallAppButton label="Install App" size="md" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import BrandLogo from './BrandLogo.vue';
import InstallAppButton from './InstallAppButton.vue';

const visible = ref(false);

function isStandalone() {
  return (
    window.matchMedia && window.matchMedia('(display-mode: standalone)').matches
  ) || navigator.standalone === true;
}

function updateVisibility() {
  // Only show the banner on supported platforms (PWA capable), never when
  // already installed as an app, and never behind the splash.
  visible.value = !isStandalone() && window.matchMedia('(display-mode: browser)').matches;
}

function onInstallPromptAvailable() {
  updateVisibility();
}

onMounted(() => {
  updateVisibility();
  window.addEventListener('beforeinstallprompt', onInstallPromptAvailable);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onInstallPromptAvailable);
});
</script>

<style scoped>
.bos-app-banner {
  background: linear-gradient(90deg, #071F55 0%, #0B3FA8 60%, #087BFF 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.bos-app-banner-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 10px;
  padding-bottom: 10px;
}
.bos-app-banner-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>

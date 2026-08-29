<template>
  <div v-if="!isStandalone">
    <!-- Always show a button: direct install when the PWA prompt is available,
         otherwise a fallback that opens install instructions (desktop AND mobile). -->
    <button
      @click="handleInstall"
      class="inline-flex items-center gap-2 font-bold rounded-lg transition-all duration-150 shadow-lg"
      :class="[sizeClasses[props.size] || sizeClasses.md, deferredPrompt ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:brightness-110' : 'bg-white text-navy-900 hover:bg-white/90']"
    >
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10zM12 3v12m0-3l-3 3m3-3l3 3" /></svg>
      {{ label }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  label: { type: String, default: 'Download App' },
  size: { type: String, default: 'md' }, // sm | md | lg
});

const deferredPrompt = ref(null);
const isStandalone = ref(false);

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

function handleInstall() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    deferredPrompt.value.userChoice.then(() => {
      deferredPrompt.value = null;
    });
  } else {
    // Fallback instructions for platforms without the install prompt.
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const agent = isIOS ? 'Share → Add to Home Screen' : 'Menu → Add to Home screen';
    alert(`Install the BUEA ONLINE SHOP app:\n\nOpen the browser ${agent} to add it to your home screen.`);
  }
}

function onBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt.value = e;
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  isStandalone.value =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || navigator.standalone === true;
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
});
</script>

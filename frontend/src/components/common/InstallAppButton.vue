<template>
  <div v-if="!isStandalone" class="inline-block">
    <button
      @click="handleInstall"
      :disabled="pending"
      class="inline-flex items-center gap-2 font-bold rounded-lg transition-all duration-150 shadow-lg"
      :class="[sizeClasses[props.size] || sizeClasses.md, deferredPrompt ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:brightness-110' : 'bg-white text-navy-900 hover:bg-white/90']"
    >
      <svg v-if="!pending" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10zM12 3v12m0-3l-3 3m3-3l3 3" /></svg>
      <svg v-else class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
      {{ pending ? 'Preparing install…' : label }}
    </button>

    <!-- Guide modal shown when the browser won't allow a programmatic install -->
    <div v-if="showGuide" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" @click.self="showGuide = false">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" style="color: var(--text-primary);">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-2">
            <svg class="w-6 h-6 text-electric-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            <h3 class="font-bold text-lg font-display">Install the BUEA Shop app</h3>
          </div>
          <button @click="showGuide = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <ol class="space-y-3">
          <li v-for="(step, i) in guideSteps" :key="i" class="flex gap-3">
            <span class="shrink-0 w-6 h-6 rounded-full bg-electric-500/10 text-electric-600 flex items-center justify-center text-sm font-bold">{{ i + 1 }}</span>
            <span class="text-sm" style="color: var(--text-secondary);" v-html="step"></span>
          </li>
        </ol>

        <button
          class="mt-5 w-full py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-electric-500 to-electric-400 hover:brightness-110"
          @click="showGuide = false"
        >Got it</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  label: { type: String, default: 'Download App' },
  size: { type: String, default: 'md' }, // sm | md | lg
});

const deferredPrompt = ref(null);
const isStandalone = ref(false);
const pending = ref(false);
const showGuide = ref(false);

// Detect the platform once (Android / iOS / desktop + browser flavor)
const platform = (() => {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isAndroid = /Android/i.test(ua);
  const isSamsung = /SamsungBrowser/i.test(ua);
  if (isIOS) return 'ios';
  if (isAndroid && isSamsung) return 'android-samsung';
  if (isAndroid) return 'android';
  return 'desktop';
})();

const guideSteps = computed(() => {
  switch (platform) {
    case 'ios':
      return [
        'Tap the <b>Share</b> button <span style="font-size:1.35em">⎙</span> at the bottom of your browser.',
        'Scroll down and tap <b>Add to Home Screen</b>.',
        'Tap <b>Add</b> in the top-right corner. The app now appears on your home screen.',
      ];
    case 'android-samsung':
      return [
        'Tap the <b>☰ Menu</b> button at the bottom of the browser.',
        'Tap <b>Add to Home screen</b>.',
        'Tap <b>Add</b>. The app now appears on your home screen.',
      ];
    case 'android':
      return [
        'Tap the <b>⋮ Menu</b> button at the top-right of the browser.',
        'Tap <b>Add to Home screen</b>, then confirm <b>Add</b>.',
        'Open the app from your home screen — it runs full-screen like a native app.',
      ];
    default:
      return [
        'Click the <b>⊕ Install</b> icon in your browser’s address bar.',
        'Confirm <b>Install</b> in the pop-up.',
        'The app then opens from your desktop / taskbar like a native app.',
      ];
  }
});

const sizeClasses = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-5 py-2.5',
  lg: 'text-base px-6 py-3',
};

function triggerInstall() {
  const dp = deferredPrompt.value;
  if (!dp) return false;
  dp.prompt();
  dp.userChoice.then(() => {
    deferredPrompt.value = null;
  });
  return true;
}

async function handleInstall() {
  // 1) Prompt available → install directly now.
  if (triggerInstall()) return;

  // 2) On mobile browsers there is no beforeinstallprompt on iOS/Safari, and
  //    desktop may need engagement. Rebuild installability with a light reload,
  //    then auto-trigger once the prompt arrives.
  pending.value = true;
  sessionStorage.setItem('bos_wants_install', '1');

  setTimeout(() => {
    window.location.reload();
  }, 350);
}

function maybeAutoInstall() {
  if (sessionStorage.getItem('bos_wants_install') === '1' && deferredPrompt.value) {
    sessionStorage.removeItem('bos_wants_install');
    triggerInstall();
  }
}

function installFallbackGuide() {
  pending.value = false;
  showGuide.value = true;
}

function onBeforeInstallPrompt(e) {
  e.preventDefault();
  deferredPrompt.value = e;
  maybeAutoInstall();
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
  isStandalone.value =
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
    || navigator.standalone === true;

  window.addEventListener('appinstalled', () => sessionStorage.removeItem('bos_wants_install'));

  // Safety net: if the user asked to install but the browser never fires the
  // prompt after the reload, fall back to a platform guide instead of a spinner.
  if (sessionStorage.getItem('bos_wants_install') === '1') {
    setTimeout(() => {
      if (sessionStorage.getItem('bos_wants_install') === '1') {
        sessionStorage.removeItem('bos_wants_install');
        installFallbackGuide();
      }
    }, 4000);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
});
</script>

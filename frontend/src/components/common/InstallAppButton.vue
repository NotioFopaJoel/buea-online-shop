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
const pending = ref(false);

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
  // 1) Prompt already available → install directly now.
  if (triggerInstall()) return;

  // 2) No prompt yet — the browser hasn't deemed the page installable (the
  //    service worker needs to be active AND controlling the page). Rebuild
  //    installability by doing a lightweight reload, then auto-trigger once
  //    the prompt arrives.
  pending.value = true;
  sessionStorage.setItem('bos_wants_install', '1');

  // Give the UI a moment, then reload so the SW takes control.
  setTimeout(() => {
    window.location.reload();
  }, 350);
}

function maybeAutoInstall() {
  // After a reload, if the user wanted to install, trigger once the prompt fires.
  if (sessionStorage.getItem('bos_wants_install') === '1' && deferredPrompt.value) {
    sessionStorage.removeItem('bos_wants_install');
    triggerInstall();
  }
}

function installFallbackGuide() {
  // Show clear, drop-in instructions only when the browser genuinely will not
  // allow a programmatic one-click install (e.g. desktop engagement not met).
  const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const agent = isIOS ? 'Share → Add to Home Screen' : 'Menu → Add to Home screen';
  alert(`Install the BUEA ONLINE SHOP app:\n\nOpen the browser ${agent} to add it to your home screen.`);
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

  // If a previous session left the flag set (e.g. reload got interrupted), clear it.
  window.addEventListener('appinstalled', () => sessionStorage.removeItem('bos_wants_install'));

  // Safety net: if the user asked to install but the browser never fires the
  // prompt after the reload, fall back to a clear guide instead of a spinner.
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

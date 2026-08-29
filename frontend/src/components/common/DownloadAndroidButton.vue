<template>
  <a
    :href="apkUrl"
    :download="apkFileName"
    class="inline-flex items-center gap-2 font-bold rounded-lg px-4 py-2.5 text-sm shadow-lg transition-all duration-150 bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:brightness-110"
    @click="trackDownload"
  >
    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.6 9.5l-1.2-2.1-7.9 4.6 7.9 4.6 1.2-2.1 5.8-2.5-5.8-2.5z"/><path d="M3 2h3.6L9 7.4l7.9 4.6.5-.8L9 6.5 6.6 2.6c-.4-.6-1.3-1-2-1H3"/><path d="M3 20h3.6l2.4-4.8L9 14.9l1.4-.8L11.5 14l7 4.1-1.2 2.1-5.8 2.5 1.2 2.1v2.3H10v-1.6l-2.2-1.1L3 21.9c-.9-.4-1.3-1.3-.9-2.2.1-.8.5-1.5 1.5-1.7z"/></svg>
    <span>{{ label }}</span>
  </a>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  label: { type: String, default: 'Download Android App' },
});

const apkUrl = '/app/BUEA-Online-Shop.apk';
const apkFileName = 'BUEA-Online-Shop.apk';

function trackDownload() {
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'download_android_apk', { event_category: 'App', event_label: 'Android APK' });
    }
  } catch {
    // analytics optional
  }
}
</script>

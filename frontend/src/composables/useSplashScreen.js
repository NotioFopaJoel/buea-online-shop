import { ref, onMounted, onBeforeUnmount } from 'vue';

/**
 * useSplashScreen
 * Controls the professional splash screen lifecycle: LOADING -> READY -> EXIT -> APP.
 *
 * Behaviour:
 *  - First visit: plays the full animation (~2s).
 *  - Later visits: plays a short fade (~450ms).
 *  - If the system has "prefers-reduced-motion", the splash is skipped entirely.
 *  - Can be force-disabled with the URL param ?nosplash=1 or the localStorage
 *    flag `bueaSplashDisabled` (for testing / users who want it always off).
 */
const STORAGE_KEY = 'bueaSplashShown';

export function useSplashScreen() {
  const showSplash = ref(true);
  const exiting = ref(false);

  function startExit() {
    if (exiting.value) return;
    exiting.value = true;
    // Wait for the fade-out transition to finish before unmounting the splash.
    setTimeout(() => {
      showSplash.value = false;
    }, 520);
  }

  onMounted(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const disabled = new URLSearchParams(window.location.search).has('nosplash');
    const turnedOff = localStorage.getItem('bueaSplashDisabled') === '1';

    if (reduced || disabled || turnedOff) {
      // Skip the animation entirely.
      showSplash.value = false;
      return;
    }

    const alreadySeen = localStorage.getItem(STORAGE_KEY) === '1';
    // First visit: full 4s animation. Later visits: 3s.
    const holdMs = alreadySeen ? 3000 : 4000;

    const timer = setTimeout(() => {
      startExit();
    }, holdMs);

    // Keep a small off-window reference so the timer is never garbage collected early.
    window.__splashTimer = timer;

    if (!alreadySeen) {
      localStorage.setItem(STORAGE_KEY, '1');
    }
  });

  onBeforeUnmount(() => {
    if (window.__splashTimer) clearTimeout(window.__splashTimer);
  });

  return { showSplash, exiting, startExit };
}

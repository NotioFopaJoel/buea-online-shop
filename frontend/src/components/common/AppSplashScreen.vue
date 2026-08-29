<template>
  <div
    class="bos-splash"
    :class="{ 'is-exiting': exiting }"
    role="presentation"
    :aria-label="isReduced ? 'BUEA Online Shop' : 'BUEA Online Shop — Shop Local, Delivering The Best'"
  >
    <!-- subtle decorative background -->
    <div class="bos-splash-bg" aria-hidden="true"></div>

    <div class="bos-splash-inner" :class="{ 'is-exiting': exiting }">
      <!-- Logo -->
      <div class="bos-splash-logo" aria-hidden="true">
        <BrandLogo
          :width="logoSize"
          :height="logoHeight"
          :dark="true"
          icon-only
        />
      </div>

      <!-- Brand name -->
      <div class="bos-splash-title">
        <p class="bos-splash-buea"><span class="bos-splash-b">B</span>UEA</p>
        <p class="bos-splash-online">ONLINE <span class="bos-splash-shop">SHOP</span></p>
      </div>

      <!-- Slogan -->
      <p class="bos-splash-tagline">
        SHOP LOCAL, DELIVERING <span class="bos-splash-best">THE BEST</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import BrandLogo from './BrandLogo.vue';

const props = defineProps({
  exiting: { type: Boolean, default: false },
});

const isReduced = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Responsive logo size (height drives it since viewBox is 320x360).
const logoHeight = computed(() => {
  const w = window.innerWidth;
  if (w < 480) return 150;
  if (w < 768) return 190;
  if (w < 1200) return 240;
  return 280;
});
const logoSize = computed(() => Math.round((logoHeight.value / 258) * 208));

onMounted(() => {
  if (isReduced) {
    // Instantly show the mark without animation when reduced motion is requested.
    const inner = document.querySelector('.bos-splash-inner');
    if (inner) inner.style.animation = 'none';
  }
});
</script>

<style scoped>
.bos-splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #071F55 0%, #0B3FA8 50%, #0A2B78 100%);
  overflow: hidden;
  opacity: 1;
  transition: opacity .5s ease;
}

.bos-splash.is-exiting {
  opacity: 0;
}

/* subtle decorative glows */
.bos-splash-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 40% at 30% 20%, rgba(22, 139, 255, 0.18), transparent 70%),
    radial-gradient(40% 40% at 75% 80%, rgba(255, 157, 0, 0.10), transparent 70%);
  animation: bosBgIn 0.7s ease-out both;
}

.bos-splash-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: opacity .45s ease, transform .45s ease;
}

.is-exiting .bos-splash-inner {
  opacity: 0;
  transform: scale(0.96);
}

.bos-splash-logo {
  animation: bosLogoIn 1.2s ease-out both, bosShine 4s ease-in-out 0.6s infinite;
}

.bos-splash-title {
  margin-top: 14px;
  animation: bosRise 1s ease-out 0.8s both;
  color: #FFFFFF;
}

.bos-splash-buea {
  font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif;
  font-weight: 900;
  font-size: clamp(2.4rem, 9vw, 4.4rem);
  line-height: 1;
  letter-spacing: 2px;
}

.bos-splash-b {
  color: #FF9D00;
  font-weight: 900;
}

.bos-splash-online {
  margin-top: 6px;
  font-family: Arial, sans-serif;
  font-weight: 800;
  font-size: clamp(0.95rem, 3vw, 1.5rem);
  letter-spacing: 6px;
  color: #FFFFFF;
}

.bos-splash-shop {
  color: #FF9D00;
}

.bos-splash-tagline {
  margin-top: 16px;
  font-family: Arial, sans-serif;
  font-weight: 600;
  font-size: clamp(0.65rem, 2vw, 0.9rem);
  letter-spacing: 2.5px;
  color: #C7D3F0;
  animation: bosRise 1.1s ease-out 1.6s both;
}

.bos-splash-best {
  color: #67E8F9;
  font-weight: 700;
}

/* entrance / exit keyframes */
@keyframes bosBgIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes bosLogoIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
@keyframes bosRise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes bosShine {
  0%, 100% { filter: brightness(1); }
  50% { filter: brightness(1.06); }
}

@media (prefers-reduced-motion: reduce) {
  .bos-splash-inner,
  .bos-splash-logo,
  .bos-splash-title,
  .bos-splash-tagline,
  .bos-splash-bg {
    animation: none !important;
    transition: none !important;
  }
}
</style>

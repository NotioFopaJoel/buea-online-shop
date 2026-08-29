<template>
  <!--
    BUEA ONLINE SHOP — Brand logo.
    Renders the official artwork (shopping-bag "B" with integrated cart and
    fast-delivery speed lines). Used in the header, footer, install banner
    and splash screen.
  -->
  <img
    :src="src"
    :width="width"
    :height="height"
    :alt="ariaLabel"
    :class="['bos-logo', { 'bos-logo--dark': dark }]"
    draggable="false"
  />
</template>

<script setup>
import { computed } from 'vue';
import iconSrc from '../../assets/buea-logo-icon.png';
import fullSrc from '../../assets/buea-logo-full.png';
import fullNoTaglineSrc from '../../assets/buea-logo-notagline.png';

const props = defineProps({
  width: { type: [Number, String], default: 320 },
  height: { type: [Number, String], default: 360 },
  dark: { type: Boolean, default: false }, // kept for API compatibility (used on dark backgrounds); artwork already reads well on both light and dark surfaces
  iconOnly: { type: Boolean, default: false }, // just the bag/cart symbol (app icon, header)
  tagline: { type: Boolean, default: false }, // include the "SHOP LOCAL, DELIVERING THE BEST" tagline under the wordmark
});

const ariaLabel = props.iconOnly ? 'BUEA Online Shop' : 'BUEA Online Shop - Shop Local, Delivering The Best';

const src = computed(() => {
  if (props.iconOnly) return iconSrc;
  return props.tagline ? fullSrc : fullNoTaglineSrc;
});
</script>

<style scoped>
.bos-logo {
  object-fit: contain;
  /* Slight brightness lift keeps the mark punchy on dark navy surfaces. */
}
.bos-logo--dark {
  filter: brightness(1.04);
}
</style>

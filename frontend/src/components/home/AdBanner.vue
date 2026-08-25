<template>
  <section v-if="ads.length" class="mb-8 relative rounded-card overflow-hidden" style="background-color: var(--navy);">
    <transition name="ad-fade" mode="out-in">
      <component
        :is="current.linkType !== 'none' ? 'a' : 'div'"
        :key="current._id"
        class="block relative aspect-[16/7] sm:aspect-[21/7] cursor-pointer"
        @click="handleClick(current)"
      >
        <video
          v-if="current.videoUrl"
          :src="current.videoUrl"
          class="absolute inset-0 w-full h-full object-cover"
          autoplay
          muted
          loop
          playsinline
        />
        <img
          v-else-if="current.imageUrl"
          :src="current.imageUrl"
          :alt="displayTitle(current)"
          class="absolute inset-0 w-full h-full object-cover"
        />

        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent flex flex-col justify-end p-5 sm:p-8">
          <h3 class="font-display font-bold text-white text-lg sm:text-2xl mb-1">{{ displayTitle(current) }}</h3>
          <p v-if="displayDesc(current)" class="text-white/80 text-xs sm:text-sm mb-3 max-w-md">{{ displayDesc(current) }}</p>
          <span
            v-if="current.linkType !== 'none'"
            class="inline-flex items-center gap-1.5 w-fit px-4 py-2 rounded-lg bg-cyan-400 text-navy-900 font-semibold text-xs sm:text-sm"
          >
            {{ displayCta(current) }}
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </span>
        </div>
      </component>
    </transition>

    <!-- Dot indicators + manual navigation, only when there's more than one ad -->
    <div v-if="ads.length > 1" class="absolute bottom-3 right-4 flex gap-1.5">
      <button
        v-for="(ad, i) in ads"
        :key="ad._id"
        class="w-1.5 h-1.5 rounded-full transition-all"
        :class="i === activeIndex ? 'w-5 bg-white' : 'bg-white/40'"
        @click="goTo(i)"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../../stores/ui';
import advertisementService from '../../services/advertisementService';

const router = useRouter();
const uiStore = useUiStore();

const ads = ref([]);
const activeIndex = ref(0);
let rotationTimer = null;
const ROTATION_MS = 7000;

const current = computed(() => ads.value[activeIndex.value] || {});

function displayTitle(ad) {
  return uiStore.language === 'fr' && ad.titleFr ? ad.titleFr : ad.title;
}
function displayDesc(ad) {
  return uiStore.language === 'fr' && ad.descriptionFr ? ad.descriptionFr : ad.description;
}
function displayCta(ad) {
  return uiStore.language === 'fr' && ad.ctaTextFr ? ad.ctaTextFr : (ad.ctaText || 'Shop Now');
}

function startRotation() {
  stopRotation();
  if (ads.value.length > 1) {
    rotationTimer = setInterval(() => {
      activeIndex.value = (activeIndex.value + 1) % ads.value.length;
    }, ROTATION_MS);
  }
}
function stopRotation() {
  if (rotationTimer) clearInterval(rotationTimer);
}
function goTo(i) {
  activeIndex.value = i;
  startRotation(); // reset the timer on manual navigation
}

// Fire an impression once per ad shown, when it becomes the active slide
watch(current, (ad) => {
  if (ad && ad._id) {
    advertisementService.trackView(ad._id).catch(() => {});
  }
}, { immediate: false });

function handleClick(ad) {
  if (!ad._id) return;
  advertisementService.trackClick(ad._id).catch(() => {});

  if (ad.linkType === 'product' && ad.linkProduct?.slug) {
    router.push({ name: 'ProductDetails', params: { slug: ad.linkProduct.slug } });
  } else if (ad.linkType === 'category' && ad.linkCategory?.slug) {
    router.push({ name: 'Category', params: { slug: ad.linkCategory.slug } });
  } else if (ad.linkType === 'url' && ad.linkUrl) {
    window.open(ad.linkUrl, '_blank', 'noopener');
  }
}

onMounted(async () => {
  try {
    const res = await advertisementService.getActiveAds();
    ads.value = res.data.advertisements;
    if (ads.value.length) {
      advertisementService.trackView(ads.value[0]._id).catch(() => {});
      startRotation();
    }
  } catch {
    ads.value = [];
  }
});

onUnmounted(stopRotation);
</script>

<style scoped>
.ad-fade-enter-active, .ad-fade-leave-active { transition: opacity 0.4s ease; }
.ad-fade-enter-from, .ad-fade-leave-to { opacity: 0; }
</style>

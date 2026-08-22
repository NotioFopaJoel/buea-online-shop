<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="uiStore.showOnboarding" class="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
        <div class="absolute inset-0 bg-black/60" @click="handleSkip" />

        <div class="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl" style="background-color: var(--card-background); color: var(--text-primary);">
          <!-- Progress dots -->
          <div class="flex items-center gap-1.5 px-6 pt-6">
            <span
              v-for="(s, i) in steps"
              :key="i"
              class="h-1.5 rounded-full flex-1"
              :style="{ backgroundColor: i <= stepIndex ? 'var(--accent-color)' : 'var(--border-color)' }"
            />
          </div>

          <div class="p-6">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" :style="{ backgroundColor: current.iconBg }">
              <component :is="current.icon" class="w-7 h-7 text-white" />
            </div>

            <h3 class="font-display font-bold text-xl mb-2">{{ current.title }}</h3>
            <p class="text-sm leading-relaxed" style="color: var(--text-secondary);">{{ current.desc }}</p>
          </div>

          <div class="flex items-center justify-between gap-3 px-6 pb-6">
            <button class="text-xs font-medium" style="color: var(--text-secondary);" @click="handleSkip">
              {{ uiStore.t('onboarding.skip') }}
            </button>

            <div class="flex gap-2">
              <button
                v-if="stepIndex > 0"
                class="px-4 py-2 rounded-lg text-sm font-semibold"
                style="border: 1px solid var(--border-color);"
                @click="stepIndex -= 1"
              >
                {{ uiStore.t('onboarding.back') }}
              </button>
              <button
                class="px-5 py-2 rounded-lg text-sm font-semibold bg-navy-900 text-white dark:bg-electric-500"
                @click="handleNext"
              >
                {{ isLastStep ? uiStore.t('onboarding.getStarted') : uiStore.t('onboarding.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, h, ref, watch } from 'vue';
import { useUiStore } from '../../stores/ui';

const uiStore = useUiStore();
const stepIndex = ref(0);

// Reset to the first step every time the tour is (re)opened
watch(() => uiStore.showOnboarding, (open) => {
  if (open) stepIndex.value = 0;
});

const icon = (path) => ({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '1.8', d: path }),
  ]),
});

const searchIcon = icon('M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z');
const cartIcon = icon('M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z');
const themeIcon = icon('M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
const whatsappIcon = icon('M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z');
const trackIcon = icon('M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4');

const steps = computed(() => [
  {
    icon: searchIcon, iconBg: '#1755F5',
    title: uiStore.t('onboarding.step1Title'), desc: uiStore.t('onboarding.step1Desc'),
  },
  {
    icon: cartIcon, iconBg: '#22D3EE',
    title: uiStore.t('onboarding.step2Title'), desc: uiStore.t('onboarding.step2Desc'),
  },
  {
    icon: themeIcon, iconBg: '#0A1230',
    title: uiStore.t('onboarding.step3Title'), desc: uiStore.t('onboarding.step3Desc'),
  },
  {
    icon: whatsappIcon, iconBg: '#25D366',
    title: uiStore.t('onboarding.step4Title'), desc: uiStore.t('onboarding.step4Desc'),
  },
  {
    icon: trackIcon, iconBg: '#F5533D',
    title: uiStore.t('onboarding.step5Title'), desc: uiStore.t('onboarding.step5Desc'),
  },
]);

const current = computed(() => steps.value[stepIndex.value]);
const isLastStep = computed(() => stepIndex.value === steps.value.length - 1);

function handleNext() {
  if (isLastStep.value) {
    uiStore.closeOnboarding();
  } else {
    stepIndex.value += 1;
  }
}

function handleSkip() {
  uiStore.closeOnboarding();
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

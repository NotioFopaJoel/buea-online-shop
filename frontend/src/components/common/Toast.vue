<template>
  <div class="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
    <transition-group name="toast">
      <div
        v-for="toast in uiStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-sm font-medium text-white"
        :class="toast.type === 'success' ? 'bg-navy-900' : 'bg-promo'"
      >
        <svg v-if="toast.type === 'success'" class="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
        </svg>
        {{ toast.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
const uiStore = useUiStore();
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

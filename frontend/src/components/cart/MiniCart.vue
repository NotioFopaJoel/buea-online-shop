<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="uiStore.isCartDrawerOpen" class="fixed inset-0 z-[95] flex justify-end">
        <div class="absolute inset-0 bg-black/50" @click="uiStore.toggleCartDrawer(false)" />
        <div class="relative w-full max-w-sm h-full overflow-y-auto p-5" style="background-color: var(--card-background);">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-display font-semibold text-lg">{{ uiStore.t('cart.title') }}</h3>
            <button @click="uiStore.toggleCartDrawer(false)">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <EmptyState v-if="cartStore.isEmpty" :title="uiStore.t('cart.empty')" :description="uiStore.t('cart.emptyDesc')" />

          <template v-else>
            <CartItem
              v-for="item in cartStore.items"
              :key="item.id"
              :item="item"
              @update-quantity="cartStore.updateQuantity"
              @remove="cartStore.removeItem"
            />
            <Button variant="primary" full size="lg" class="mt-4" :to="{ name: 'Checkout' }" @click="uiStore.toggleCartDrawer(false)">
              {{ uiStore.t('cart.proceedToCheckout') }}
            </Button>
          </template>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import { useCartStore } from '../../stores/cart';
import CartItem from './CartItem.vue';
import EmptyState from '../common/EmptyState.vue';
import Button from '../common/Button.vue';

const uiStore = useUiStore();
const cartStore = useCartStore();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

<template>
  <div class="container-bos py-6">
    <h1 class="font-display font-bold text-2xl mb-6">{{ uiStore.t('cart.title') }}</h1>

    <EmptyState v-if="cartStore.isEmpty" :title="uiStore.t('cart.empty')" :description="uiStore.t('cart.emptyDesc')">
      <template #action>
        <Button variant="primary" :to="{ name: 'Shop' }">{{ uiStore.t('home.shopNow') }}</Button>
      </template>
    </EmptyState>

    <div v-else class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-card card-surface p-5">
        <CartItem
          v-for="item in cartStore.items"
          :key="item.id"
          :item="item"
          @update-quantity="cartStore.updateQuantity"
          @remove="cartStore.removeItem"
        />
      </div>

      <div>
        <CartSummary
          :subtotal="subtotal"
          :delivery-fee="estimatedDeliveryFee"
          :total="estimatedTotal"
          :amount-until-free="amountUntilFreeDelivery"
        >
          <template #action>
            <Button variant="primary" size="lg" full class="mt-4" :to="{ name: 'Checkout' }">
              {{ uiStore.t('cart.proceedToCheckout') }}
            </Button>
          </template>
        </CartSummary>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '../stores/ui';
import { useCartStore } from '../stores/cart';
import { useCart } from '../composables/useCart';
import CartItem from '../components/cart/CartItem.vue';
import CartSummary from '../components/cart/CartSummary.vue';
import EmptyState from '../components/common/EmptyState.vue';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const cartStore = useCartStore();
const { subtotal, estimatedDeliveryFee, estimatedTotal, amountUntilFreeDelivery } = useCart();
</script>

<template>
  <div class="container-bos py-6 max-w-3xl mx-auto">
    <h1 class="font-display font-bold text-2xl mb-2">{{ uiStore.t('checkout.step4') }}</h1>

    <!-- Step indicator -->
    <div class="flex items-center gap-2 mb-6 text-xs font-medium">
      <span v-for="(label, i) in steps" :key="label" class="flex items-center gap-2">
        <span
          class="w-6 h-6 rounded-full flex items-center justify-center"
          :class="i + 1 <= step ? 'bg-navy-900 text-white dark:bg-electric-500' : 'bg-black/5 dark:bg-white/10'"
        >{{ i + 1 }}</span>
        <span :style="{ color: i + 1 === step ? 'var(--text-primary)' : 'var(--text-secondary)' }">{{ label }}</span>
        <span v-if="i < steps.length - 1" class="w-6 h-px bg-current opacity-20" />
      </span>
    </div>

    <EmptyState v-if="cartStore.isEmpty" :title="uiStore.t('cart.empty')" :description="uiStore.t('cart.emptyDesc')">
      <template #action><Button variant="primary" :to="{ name: 'Shop' }">{{ uiStore.t('home.shopNow') }}</Button></template>
    </EmptyState>

    <div v-else class="rounded-card card-surface p-5">
      <!-- Step 2: Shipping -->
      <template v-if="step === 1">
        <AddressForm v-model="address" />
        <Button variant="primary" size="lg" full class="mt-5" @click="step = 2">{{ uiStore.t('checkout.step2') }} →</Button>
      </template>

      <!-- Step 3: Payment -->
      <template v-else-if="step === 2">
        <PaymentMethod v-model="paymentMethod" />
        <div class="flex gap-3 mt-5">
          <Button variant="ghost" size="lg" full @click="step = 1">← {{ uiStore.t('checkout.step2') }}</Button>
          <Button variant="primary" size="lg" full @click="step = 3">{{ uiStore.t('checkout.reviewOrder') }} →</Button>
        </div>
      </template>

      <!-- Step 4: Review -->
      <template v-else>
        <OrderSummary
          :items="cartStore.items"
          :address="address"
          :payment-method="paymentMethod"
          :subtotal="subtotal"
          :delivery-fee="estimatedDeliveryFee"
          :total="estimatedTotal"
        />
        <p v-if="error" class="text-sm text-promo mt-3">{{ error }}</p>
        <div class="flex gap-3 mt-5">
          <Button variant="ghost" size="lg" full @click="step = 2">← {{ uiStore.t('checkout.step3') }}</Button>
          <Button variant="primary" size="lg" full :loading="orderStore.loading" @click="handlePlaceOrder">
            {{ uiStore.t('checkout.placeOrder') }}
          </Button>
        </div>
        <p class="text-xs text-center mt-3" style="color: var(--text-secondary);">{{ uiStore.t('checkout.whatsappConfirmNotice') }}</p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/order';
import { useAuthStore } from '../stores/auth';
import { useCart } from '../composables/useCart';

import AddressForm from '../components/checkout/AddressForm.vue';
import PaymentMethod from '../components/checkout/PaymentMethod.vue';
import OrderSummary from '../components/checkout/OrderSummary.vue';
import Button from '../components/common/Button.vue';
import EmptyState from '../components/common/EmptyState.vue';

const router = useRouter();
const uiStore = useUiStore();
const cartStore = useCartStore();
const orderStore = useOrderStore();
const authStore = useAuthStore();
const { subtotal, estimatedDeliveryFee, estimatedTotal } = useCart();

const step = ref(1);
const error = ref('');
const paymentMethod = ref('MTN_MOBILE_MONEY');

const steps = computed(() => [uiStore.t('checkout.step2'), uiStore.t('checkout.step3'), uiStore.t('checkout.step4')]);

const defaultAddress = authStore.user?.addresses?.find((a) => a.isDefault) || authStore.user?.addresses?.[0];

const address = reactive({
  fullName: authStore.user?.name || '',
  phone: authStore.user?.phone || '',
  whatsappNumber: authStore.user?.whatsappNumber || authStore.user?.phone || '',
  email: authStore.user?.email || '',
  city: 'Buea',
  neighborhood: defaultAddress?.neighborhood || '',
  address: defaultAddress?.address || '',
  landmark: defaultAddress?.landmark || '',
  deliveryInstructions: defaultAddress?.deliveryInstructions || '',
});

onMounted(() => {
  orderStore.fetchDeliveryZones().catch(() => {});
});

async function handlePlaceOrder() {
  error.value = '';
  if (!address.fullName || !address.phone || !address.neighborhood || !address.address) {
    error.value = 'Please complete all required shipping fields.';
    step.value = 1;
    return;
  }

  try {
    const payload = {
      items: cartStore.toOrderItems(),
      shippingAddress: address,
      paymentMethod: paymentMethod.value,
      lang: uiStore.language,
    };
    const result = await orderStore.placeOrder(payload);
    cartStore.clearCart();
    router.push({ name: 'OrderSuccess', params: { orderNumber: result.order.orderNumber } });
  } catch (err) {
    error.value = err.message;
  }
}
</script>

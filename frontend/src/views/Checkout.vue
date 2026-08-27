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
        <AddressForm v-model="address" :errors="addressErrors" />
        <p v-if="addressError" class="text-sm text-promo mt-3">{{ addressError }}</p>
        <Button variant="primary" size="lg" full class="mt-5" @click="goToStep2">{{ uiStore.t('checkout.step2') }} →</Button>
      </template>

      <!-- Step 3: Payment -->
      <template v-else-if="step === 2">
        <PaymentMethod v-model="paymentMethod" />

        <!-- Shop Credit toggle -->
        <div v-if="authStore.isAuthenticated && authStore.user?.creditBalance > 0" class="mt-4 p-3 rounded-lg" style="border: 1px solid var(--border-color);">
          <label class="flex items-center gap-3 cursor-pointer">
            <input v-model="useCredit" type="checkbox" class="w-4 h-4 rounded" />
            <div>
              <p class="text-sm font-medium">{{ uiStore.t('referral.useCredit') }}</p>
              <p class="text-xs" style="color: var(--text-secondary);">{{ formatPrice(authStore.user.creditBalance) }} — {{ uiStore.t('referral.available') }}</p>
            </div>
          </label>
          <p v-if="useCredit" class="text-xs text-green-600 mt-2">-{{ formatPrice(creditAmount) }} {{ uiStore.t('referral.creditApplied') }}</p>
        </div>

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
          :total="finalTotal"
          :credit-used="useCredit ? creditAmount : 0"
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
import { formatPrice } from '../utils/formatPrice';

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
const addressError = ref('');
const addressErrors = reactive({ fullName: '', phone: '', neighborhood: '', address: '' });
const paymentMethod = ref('MTN_MOBILE_MONEY');
const useCredit = ref(false);

const steps = computed(() => [uiStore.t('checkout.step2'), uiStore.t('checkout.step3'), uiStore.t('checkout.step4')]);

const creditAmount = computed(() => {
  if (!authStore.user?.creditBalance) return 0;
  const merchandiseAfterDiscount = subtotal.value;
  return Math.min(authStore.user.creditBalance, merchandiseAfterDiscount);
});

const finalTotal = computed(() => {
  const credit = useCredit.value ? creditAmount.value : 0;
  return subtotal.value - credit + estimatedDeliveryFee.value;
});

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

function goToStep2() {
  addressError.value = '';
  addressErrors.fullName = '';
  addressErrors.phone = '';
  addressErrors.neighborhood = '';
  addressErrors.address = '';

  let valid = true;
  if (!address.fullName.trim()) { addressErrors.fullName = 'Full name is required'; valid = false; }
  if (!address.phone.trim()) { addressErrors.phone = 'Phone number is required'; valid = false; }
  if (!address.neighborhood) { addressErrors.neighborhood = 'Neighborhood is required'; valid = false; }
  if (!address.address.trim()) { addressErrors.address = 'Address is required'; valid = false; }

  if (!valid) {
    addressError.value = 'Please fill in all required fields.';
    return;
  }
  step.value = 2;
}

async function handlePlaceOrder() {
  error.value = '';

  try {
    const payload = {
      items: cartStore.toOrderItems(),
      shippingAddress: address,
      paymentMethod: paymentMethod.value,
      useCredit: useCredit.value && authStore.user?.creditBalance > 0,
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

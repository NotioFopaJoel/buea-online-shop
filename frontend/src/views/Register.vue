<template>
  <div class="container-bos py-10 max-w-sm mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">Create Account</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">BUEA ONLINE SHOP</p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="form.name" label="Full Name" :error="errors.name" required />
      <FormField v-model="form.email" label="Email" type="email" :error="errors.email" required />
      <FormField v-model="form.phone" label="Phone Number" type="tel" :error="errors.phone" required placeholder="+237 6XX XXX XXX" />
      <FormField v-model="form.password" label="Password" type="password" :error="errors.password" required />
      <FormField v-model="form.referralCode" label="Referral code (optional)" />
      <p v-if="error" class="text-sm text-promo">{{ error }}</p>
      <Button type="submit" variant="primary" size="lg" full :loading="authStore.loading">Create Account</Button>
    </form>

    <p class="text-sm text-center mt-4" style="color: var(--text-secondary);">
      Already have an account? <router-link to="/login" class="text-electric-500 font-medium">{{ uiStore.t('header.signIn') }}</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

const form = reactive({
  name: '',
  email: '',
  phone: '',
  password: '',
  referralCode: '',
  preferredLanguage: uiStore.language,
});
const error = ref('');
const errors = reactive({ name: '', email: '', phone: '', password: '' });

onMounted(() => {
  if (route.query.ref) {
    form.referralCode = route.query.ref;
  }
});

function validate() {
  let valid = true;
  errors.name = '';
  errors.email = '';
  errors.phone = '';
  errors.password = '';

  if (!form.name.trim()) { errors.name = 'Name is required'; valid = false; }
  if (!form.email.trim()) { errors.email = 'Email is required'; valid = false; }
  if (!form.phone.trim()) { errors.phone = 'Phone number is required'; valid = false; }
  if (!form.password) { errors.password = 'Password is required'; valid = false; }
  else if (form.password.length < 6) { errors.password = 'Password must be at least 6 characters'; valid = false; }

  return valid;
}

async function handleSubmit() {
  error.value = '';
  if (!validate()) return;

  try {
    await authStore.register(form);
    router.push({ name: 'Home' });
    uiStore.openOnboarding();
  } catch (err) {
    error.value = err.message;
  }
}
</script>

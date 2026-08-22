<template>
  <div class="container-bos py-10 max-w-sm mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">Create Account</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">BUEA ONLINE SHOP</p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="form.name" label="Full Name" required />
      <FormField v-model="form.email" label="Email" type="email" required />
      <FormField v-model="form.phone" label="Phone Number" type="tel" required placeholder="+237 6XX XXX XXX" />
      <FormField v-model="form.password" label="Password" type="password" required />
      <p v-if="error" class="text-sm text-promo">{{ error }}</p>
      <Button type="submit" variant="primary" size="lg" full :loading="authStore.loading">Create Account</Button>
    </form>

    <p class="text-sm text-center mt-4" style="color: var(--text-secondary);">
      Already have an account? <router-link to="/login" class="text-electric-500 font-medium">{{ uiStore.t('header.signIn') }}</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const router = useRouter();
const uiStore = useUiStore();
const authStore = useAuthStore();

const form = reactive({ name: '', email: '', phone: '', password: '', preferredLanguage: uiStore.language });
const error = ref('');

async function handleSubmit() {
  error.value = '';
  try {
    await authStore.register(form);
    router.push({ name: 'Home' });
    // Show the welcome guide once, right after the account is created.
    uiStore.openOnboarding();
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="container-bos py-10 max-w-sm mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">{{ uiStore.t('header.signIn') }}</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">BUEA ONLINE SHOP</p>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="form.email" label="Email" type="email" :error="errors.email" required />
      <FormField v-model="form.password" label="Password" type="password" :error="errors.password" required />
      <p v-if="error" class="text-sm text-promo">{{ error }}</p>
      <Button type="submit" variant="primary" size="lg" full :loading="authStore.loading">{{ uiStore.t('header.signIn') }}</Button>
    </form>

    <p class="text-sm text-center mt-4" style="color: var(--text-secondary);">
      <router-link to="/forgot-password" class="text-electric-500 font-medium">Forgot password?</router-link>
    </p>
    <p class="text-sm text-center mt-2" style="color: var(--text-secondary);">
      No account? <router-link to="/register" class="text-electric-500 font-medium">Create one</router-link>
    </p>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUiStore } from '../stores/ui';
import { useAuthStore } from '../stores/auth';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const router = useRouter();
const route = useRoute();
const uiStore = useUiStore();
const authStore = useAuthStore();

const form = reactive({ email: '', password: '' });
const error = ref('');
const errors = reactive({ email: '', password: '' });

function validate() {
  let valid = true;
  errors.email = '';
  errors.password = '';
  if (!form.email.trim()) { errors.email = 'Email is required'; valid = false; }
  if (!form.password) { errors.password = 'Password is required'; valid = false; }
  return valid;
}

async function handleSubmit() {
  error.value = '';
  if (!validate()) return;
  try {
    await authStore.login(form);
    router.push(route.query.redirect || { name: 'Home' });
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="container-bos py-10 max-w-sm mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">Forgot Password</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">Enter your email and we'll send you a reset link.</p>

    <form v-if="!sent" class="space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="email" label="Email" type="email" required />
      <Button type="submit" variant="primary" size="lg" full :loading="loading">Send Reset Link</Button>
    </form>
    <p v-else class="text-sm text-center px-4 py-3 rounded-lg bg-electric-500/10 text-electric-600">
      If an account exists for this email, a reset link has been sent.
    </p>

    <p class="text-sm text-center mt-4" style="color: var(--text-secondary);">
      <router-link to="/login" class="text-electric-500 font-medium">Back to sign in</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import authService from '../services/authService';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const email = ref('');
const loading = ref(false);
const sent = ref(false);

async function handleSubmit() {
  loading.value = true;
  try {
    await authService.forgotPassword(email.value);
    sent.value = true;
  } finally {
    loading.value = false;
  }
}
</script>

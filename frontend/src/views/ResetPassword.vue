<template>
  <div class="container-bos py-10 max-w-sm mx-auto">
    <h1 class="font-display font-bold text-2xl mb-1 text-center">Reset Password</h1>
    <p class="text-sm text-center mb-6" style="color: var(--text-secondary);">Enter a new password for your BUEA ONLINE SHOP account.</p>

    <form v-if="!done" class="space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="form.password" label="New Password" type="password" :error="errors.password" required />
      <FormField v-model="form.confirm" label="Confirm Password" type="password" :error="errors.confirm" required />
      <p v-if="error" class="text-sm text-promo">{{ error }}</p>
      <Button type="submit" variant="primary" size="lg" full :loading="loading">Reset Password</Button>
    </form>
    <div v-else class="text-center">
      <p class="text-sm text-center px-4 py-3 rounded-lg bg-electric-500/10 text-electric-600 mb-4">
        Your password has been reset successfully. You can now sign in.
      </p>
      <router-link to="/login">
        <Button variant="primary" size="lg" full>Go to Sign In</Button>
      </router-link>
    </div>

    <p class="text-sm text-center mt-4" style="color: var(--text-secondary);">
      <router-link to="/login" class="text-electric-500 font-medium">Back to sign in</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRoute } from 'vue-router';
import authService from '../services/authService';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const route = useRoute();
const form = reactive({ password: '', confirm: '' });
const errors = reactive({ password: '', confirm: '' });
const error = ref('');
const loading = ref(false);
const done = ref(false);

function validate() {
  let valid = true;
  errors.password = '';
  errors.confirm = '';
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
    valid = false;
  }
  if (form.confirm !== form.password) {
    errors.confirm = 'Passwords do not match';
    valid = false;
  }
  return valid;
}

async function handleSubmit() {
  error.value = '';
  if (!validate()) return;
  const token = route.params.token;
  if (!token) {
    error.value = 'Invalid or missing reset link.';
    return;
  }
  loading.value = true;
  try {
    await authService.resetPassword(token, form.password);
    done.value = true;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

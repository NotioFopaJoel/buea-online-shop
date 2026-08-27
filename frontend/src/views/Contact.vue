<template>
  <div class="container-bos py-8 max-w-2xl mx-auto">
    <h1 class="font-display font-bold text-2xl mb-6 text-center">{{ uiStore.t('footer.contact') }}</h1>

    <div class="grid sm:grid-cols-3 gap-4 mb-8 text-center">
      <div class="rounded-card card-surface p-4">
        <p class="text-xs" style="color: var(--text-secondary);">Phone</p>
        <p class="font-semibold text-sm">{{ orderStore.publicSettings?.supportPhone || '+237 670 000 000' }}</p>
      </div>
      <div class="rounded-card card-surface p-4">
        <p class="text-xs" style="color: var(--text-secondary);">Email</p>
        <p class="font-semibold text-sm">{{ orderStore.publicSettings?.supportEmail || 'support@bueaonlineshop.com' }}</p>
      </div>
      <div class="rounded-card card-surface p-4">
        <p class="text-xs" style="color: var(--text-secondary);">Location</p>
        <p class="font-semibold text-sm">Buea, Cameroon</p>
      </div>
    </div>

    <form v-if="!sent" class="rounded-card card-surface p-5 space-y-4" @submit.prevent="handleSubmit">
      <FormField v-model="form.name" label="Name" :error="errors.name" required />
      <FormField v-model="form.email" label="Email" type="email" :error="errors.email" required />
      <FormField v-model="form.phone" label="Phone" type="tel" />
      <FormField v-model="form.subject" label="Subject" :error="errors.subject" required />
      <div>
        <label class="text-sm font-medium block mb-1.5">Message</label>
        <textarea v-model="form.message" rows="4" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
        <p v-if="errors.message" class="text-xs text-promo mt-1">{{ errors.message }}</p>
      </div>
      <Button type="submit" variant="primary" full :disabled="sending">{{ sending ? 'Sending...' : 'Send Message' }}</Button>
      <p v-if="submitError" class="text-sm text-promo text-center">{{ submitError }}</p>
    </form>
    <p v-else class="text-center text-sm px-4 py-3 rounded-lg bg-electric-500/10 text-electric-600">Thank you! We'll get back to you soon.</p>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import api from '../services/api';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const orderStore = useOrderStore();
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' });
const errors = reactive({ name: '', email: '', subject: '', message: '' });
const sent = ref(false);
const sending = ref(false);
const submitError = ref('');

async function handleSubmit() {
  errors.name = '';
  errors.email = '';
  errors.subject = '';
  errors.message = '';
  submitError.value = '';

  let valid = true;
  if (!form.name.trim()) { errors.name = 'Name is required'; valid = false; }
  if (!form.email.trim()) { errors.email = 'Email is required'; valid = false; }
  if (!form.subject.trim()) { errors.subject = 'Subject is required'; valid = false; }
  if (!form.message.trim()) { errors.message = 'Message is required'; valid = false; }
  if (!valid) return;

  sending.value = true;
  try {
    await api.post('/contact', { ...form });
    sent.value = true;
  } catch (error) {
    submitError.value = error.message || 'Failed to send message. Please try again.';
  } finally {
    sending.value = false;
  }
}

onMounted(() => {
  if (!orderStore.publicSettings) orderStore.fetchPublicSettings().catch(() => {});
});
</script>

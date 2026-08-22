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

    <form v-if="!sent" class="rounded-card card-surface p-5 space-y-4" @submit.prevent="sent = true">
      <FormField v-model="form.name" label="Name" required />
      <FormField v-model="form.email" label="Email" type="email" required />
      <FormField v-model="form.phone" label="Phone" type="tel" />
      <FormField v-model="form.subject" label="Subject" required />
      <div>
        <label class="text-sm font-medium block mb-1.5">Message</label>
        <textarea v-model="form.message" required rows="4" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
      </div>
      <Button type="submit" variant="primary" full>Send Message</Button>
    </form>
    <p v-else class="text-center text-sm px-4 py-3 rounded-lg bg-electric-500/10 text-electric-600">Thank you! We'll get back to you soon.</p>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useUiStore } from '../stores/ui';
import { useOrderStore } from '../stores/order';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';

const uiStore = useUiStore();
const orderStore = useOrderStore();
const form = reactive({ name: '', email: '', phone: '', subject: '', message: '' });
const sent = ref(false);

onMounted(() => {
  if (!orderStore.publicSettings) orderStore.fetchPublicSettings().catch(() => {});
});
</script>

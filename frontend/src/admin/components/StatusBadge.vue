<template>
  <span class="text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap" :class="classes">{{ label }}</span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  status: { type: String, required: true },
  labels: { type: Object, default: () => ({}) },
});

const colorMap = {
  PENDING_CONFIRMATION: 'bg-amber-500/10 text-amber-600',
  WHATSAPP_CONTACTED: 'bg-electric-500/10 text-electric-600',
  CONFIRMED: 'bg-cyan-500/10 text-cyan-600',
  PROCESSING: 'bg-electric-500/10 text-electric-600',
  OUT_FOR_DELIVERY: 'bg-purple-500/10 text-purple-600',
  DELIVERED: 'bg-green-500/10 text-green-600',
  CANCELLED: 'bg-promo/10 text-promo',
  PENDING: 'bg-amber-500/10 text-amber-600',
  PAID: 'bg-green-500/10 text-green-600',
  FAILED: 'bg-promo/10 text-promo',
};

const classes = computed(() => colorMap[props.status] || 'bg-black/5 text-current');
const label = computed(() => props.labels[props.status] || props.status.replace(/_/g, ' '));
</script>

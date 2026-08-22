<template>
  <div>
    <label v-if="label" class="text-sm font-medium block mb-1.5">{{ label }} <span v-if="required" class="text-promo">*</span></label>
    <input
      v-model="model"
      :type="type"
      :required="required"
      :placeholder="placeholder"
      class="w-full px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-electric-500/40"
      style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
    />
    <p v-if="error" class="text-xs text-promo mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
const model = defineModel({ type: String, default: '' });
defineProps({
  label: { type: String, default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
});
</script>

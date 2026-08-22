<template>
  <div>
    <label class="text-sm font-medium block mb-1.5">{{ label }} <span v-if="required" class="text-promo">*</span></label>
    <div class="flex items-center gap-3">
      <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color: var(--bg-primary); border: 1px solid var(--border-color);">
        <img v-if="modelValue" :src="modelValue" alt="Preview" class="w-full h-full object-cover" />
        <svg v-else class="w-6 h-6" style="color: var(--text-secondary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
      </div>

      <div class="flex-1 min-w-0">
        <label
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold cursor-pointer bg-navy-900 text-white dark:bg-electric-500"
          :class="uploading ? 'opacity-70 pointer-events-none' : ''"
        >
          <svg v-if="uploading" class="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 7.5L12 3m0 0L7.5 7.5M12 3v13.5" /></svg>
          {{ uploading ? 'Uploading...' : 'Choose photo from device' }}
          <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden" :disabled="uploading" @change="handleFileChange" />
        </label>
        <p v-if="error" class="text-xs text-promo mt-1.5">{{ error }}</p>
        <p v-else class="text-xs mt-1.5" style="color: var(--text-secondary);">JPG, PNG or WEBP — up to 5MB. Works with photos from your phone or computer.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import uploadService from '../../services/uploadService';

defineProps({
  label: { type: String, default: 'Product Photo' },
  required: { type: Boolean, default: false },
  modelValue: { type: String, default: '' },
});
const emit = defineEmits(['update:modelValue']);

const uploading = ref(false);
const error = ref('');

async function handleFileChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File is too large (max 5MB).';
    event.target.value = '';
    return;
  }

  error.value = '';
  uploading.value = true;
  try {
    const res = await uploadService.uploadImage(file);
    emit('update:modelValue', res.data.url);
  } catch (err) {
    error.value = err.message || 'Upload failed, please try again.';
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
}
</script>

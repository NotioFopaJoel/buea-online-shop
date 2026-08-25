<template>
  <div>
    <label class="text-sm font-medium block mb-1.5">{{ label }} <span v-if="required" class="text-promo">*</span></label>

    <div class="flex flex-wrap gap-3">
      <div
        v-for="(img, i) in modelValue"
        :key="i"
        class="relative w-20 h-20 rounded-lg overflow-hidden shrink-0"
        style="border: 1px solid var(--border-color);"
      >
        <img :src="img" :alt="`Photo ${i + 1}`" class="w-full h-full object-cover" />
        <span v-if="i === 0" class="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">{{ uiStore.t('common.main') }}</span>
        <button
          type="button"
          class="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
          @click="removeImage(i)"
        >
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <label
        v-if="modelValue.length < max"
        class="w-20 h-20 rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
        style="border: 2px dashed var(--border-color); color: var(--text-secondary);"
        :class="uploading ? 'opacity-60 pointer-events-none' : ''"
      >
        <svg v-if="uploading" class="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
        <span class="text-[10px]">{{ uploading ? '...' : uiStore.t('common.addPhoto') }}</span>
        <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp" class="hidden" :disabled="uploading" @change="handleFileChange" />
      </label>
    </div>

    <p v-if="error" class="text-xs text-promo mt-1.5">{{ error }}</p>
    <p v-else class="text-xs mt-1.5" style="color: var(--text-secondary);">
      {{ uiStore.t('common.photoHelp') }} ({{ modelValue.length }}/{{ max }})
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUiStore } from '../../stores/ui';
import uploadService from '../../services/uploadService';

const props = defineProps({
  label: { type: String, default: 'Product Photos' },
  required: { type: Boolean, default: false },
  modelValue: { type: Array, default: () => [] },
  max: { type: Number, default: 6 },
});
const emit = defineEmits(['update:modelValue']);

const uiStore = useUiStore();
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
    emit('update:modelValue', [...props.modelValue, res.data.url]);
  } catch (err) {
    error.value = err.message || 'Upload failed, please try again.';
  } finally {
    uploading.value = false;
    event.target.value = '';
  }
}

function removeImage(index) {
  const next = props.modelValue.filter((_, i) => i !== index);
  emit('update:modelValue', next);
}
</script>

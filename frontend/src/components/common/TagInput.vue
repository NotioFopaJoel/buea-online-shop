<template>
  <div>
    <label class="text-sm font-medium block mb-1.5">{{ label }}</label>

    <div class="flex flex-wrap gap-1.5 mb-2" v-if="modelValue.length">
      <span
        v-for="(tag, i) in modelValue"
        :key="tag + i"
        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style="background-color: var(--bg-primary); border: 1px solid var(--border-color);"
      >
        {{ tag }}
        <button type="button" class="opacity-60 hover:opacity-100" @click="removeTag(i)">
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </span>
    </div>

    <div class="flex gap-2">
      <input
        v-model="draft"
        type="text"
        :placeholder="placeholder"
        class="flex-1 px-3 py-2 rounded-lg text-sm"
        style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
        @keydown.enter.prevent="addTag(draft)"
      />
      <button type="button" class="px-3 rounded-lg text-sm font-semibold" style="border: 1px solid var(--border-color);" @click="addTag(draft)">+</button>
    </div>

    <div v-if="quickAdd.length" class="flex flex-wrap gap-1.5 mt-2">
      <button
        v-for="preset in quickAdd"
        :key="preset"
        type="button"
        class="px-2.5 py-1 rounded-lg text-xs"
        :class="modelValue.includes(preset) ? 'opacity-40 pointer-events-none' : ''"
        style="border: 1px solid var(--border-color);"
        @click="addTag(preset)"
      >
        + {{ preset }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Type and press Enter' },
  quickAdd: { type: Array, default: () => [] },
});
const emit = defineEmits(['update:modelValue']);

const draft = ref('');

function addTag(value) {
  const clean = (value || '').trim();
  if (!clean || props.modelValue.includes(clean)) {
    draft.value = '';
    return;
  }
  emit('update:modelValue', [...props.modelValue, clean]);
  draft.value = '';
}

function removeTag(index) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== index));
}
</script>

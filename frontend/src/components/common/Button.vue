<template>
  <component
    :is="to ? 'router-link' : 'button'"
    :to="to"
    :type="to ? undefined : type"
    :disabled="disabled || loading"
    class="inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
    :class="[sizeClasses, variantClasses]"
  >
    <svg v-if="loading" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: { type: String, default: 'primary' }, // primary | secondary | outline | ghost | danger
  size: { type: String, default: 'md' }, // sm | md | lg
  to: { type: [String, Object], default: null },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  full: { type: Boolean, default: false },
});

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-5 py-2.5',
    lg: 'text-base px-6 py-3.5',
  };
  return `${sizes[props.size]} ${props.full ? 'w-full' : ''}`;
});

const variantClasses = computed(() => {
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 dark:bg-electric-500 dark:hover:bg-electric-400',
    secondary: 'bg-electric-500 text-white hover:bg-electric-600',
    outline: 'border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white dark:border-electric-400 dark:text-electric-300 dark:hover:bg-electric-500 dark:hover:text-white',
    ghost: 'text-navy-900 hover:bg-navy-900/5 dark:text-white dark:hover:bg-white/10',
    danger: 'bg-promo text-white hover:opacity-90',
  };
  return variants[props.variant];
});
</script>

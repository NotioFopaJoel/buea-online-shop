<template>
  <div class="flex gap-3 py-4" style="border-bottom: 1px solid var(--border-color);">
    <router-link :to="{ name: 'ProductDetails', params: { slug: item.product.slug } }" class="w-20 h-20 rounded-lg overflow-hidden shrink-0" style="background-color: var(--bg-primary);">
      <img :src="item.product.images?.[0]" :alt="item.product.name" class="w-full h-full object-cover" />
    </router-link>

    <div class="flex-1 min-w-0">
      <router-link :to="{ name: 'ProductDetails', params: { slug: item.product.slug } }" class="text-sm font-medium line-clamp-2" style="color: var(--text-primary);">
        {{ item.product.name }}
      </router-link>
      <p v-if="item.color || item.size" class="text-xs mt-0.5" style="color: var(--text-secondary);">
        <span v-if="item.color">{{ item.color }}</span><span v-if="item.color && item.size"> / </span><span v-if="item.size">{{ item.size }}</span>
      </p>
      <p class="text-sm font-semibold mt-1" style="color: var(--text-primary);">{{ formatPrice(item.product.price) }}</p>

      <div class="flex items-center justify-between mt-2">
        <div class="flex items-center border rounded-lg" style="border-color: var(--border-color);">
          <button class="w-7 h-7 text-sm" @click="$emit('update-quantity', item.id, item.quantity - 1)">−</button>
          <span class="w-8 text-center text-sm">{{ item.quantity }}</span>
          <button class="w-7 h-7 text-sm" @click="$emit('update-quantity', item.id, item.quantity + 1)">+</button>
        </div>
        <button class="text-xs font-medium text-promo" @click="$emit('remove', item.id)">{{ uiStore.t('common.remove') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUiStore } from '../../stores/ui';
import { formatPrice } from '../../utils/formatPrice';

defineProps({
  item: { type: Object, required: true },
});
defineEmits(['update-quantity', 'remove']);

const uiStore = useUiStore();
</script>

import { computed } from 'vue';
import { useProductStore } from '../stores/product';

export function useProducts() {
  const productStore = useProductStore();

  return {
    products: computed(() => productStore.products),
    loading: computed(() => productStore.loading),
    total: computed(() => productStore.total),
    totalPages: computed(() => productStore.totalPages),
    fetchProducts: productStore.fetchProducts,
  };
}

import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

export function useAuth() {
  const authStore = useAuthStore();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);
  const isAdmin = computed(() => authStore.isAdmin);
  const isSeller = computed(() => authStore.isSeller);

  return {
    isAuthenticated,
    user,
    isAdmin,
    isSeller,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
  };
}

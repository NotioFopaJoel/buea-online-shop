<template>
  <div class="container-bos py-6">
    <AdminNav />
    <h1 class="font-display font-bold text-2xl mb-4">Users</h1>

    <div class="flex gap-2 mb-4">
      <button v-for="r in roles" :key="r.value" class="px-3 py-1.5 rounded-full text-xs font-medium" :class="roleFilter === r.value ? 'bg-navy-900 text-white dark:bg-electric-500' : 'card-surface'" @click="roleFilter = r.value; fetchUsers()">
        {{ r.label }}
      </button>
    </div>

    <Loader v-if="loading" />

    <div v-else class="rounded-card card-surface overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left" style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
            <th class="p-3 font-medium">Name</th>
            <th class="p-3 font-medium">Contact</th>
            <th class="p-3 font-medium">Role</th>
            <th class="p-3 font-medium">Status</th>
            <th class="p-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in users" :key="u._id" style="border-bottom: 1px solid var(--border-color);">
            <td class="p-3">{{ u.name }}</td>
            <td class="p-3" style="color: var(--text-secondary);">{{ u.email }} · {{ u.phone }}</td>
            <td class="p-3">
              <select :value="u.role" class="text-xs px-2 py-1 rounded-lg" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" @change="updateRole(u, $event.target.value)">
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </td>
            <td class="p-3">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="u.isActive ? 'bg-green-500/10 text-green-600' : 'bg-promo/10 text-promo'">
                {{ u.isActive ? 'Active' : 'Deactivated' }}
              </span>
            </td>
            <td class="p-3 text-right">
              <button class="text-xs font-medium text-electric-500" @click="toggleStatus(u)">
                {{ u.isActive ? 'Deactivate' : 'Activate' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Loader from '../components/common/Loader.vue';
import AdminNav from './components/AdminNav.vue';

const users = ref([]);
const loading = ref(true);
const roleFilter = ref('');

const roles = [
  { value: '', label: 'All' },
  { value: 'customer', label: 'Customers' },
  { value: 'seller', label: 'Sellers' },
  { value: 'admin', label: 'Admins' },
];

async function fetchUsers() {
  loading.value = true;
  try {
    const res = await api.get('/users', { params: { role: roleFilter.value || undefined, limit: 100 } });
    users.value = res.data.users;
  } finally {
    loading.value = false;
  }
}

async function updateRole(user, role) {
  await api.put(`/users/${user._id}/role`, { role });
  user.role = role;
}

async function toggleStatus(user) {
  const res = await api.put(`/users/${user._id}/status`, { isActive: !user.isActive });
  user.isActive = res.data.user.isActive;
}

onMounted(fetchUsers);
</script>

<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-display font-bold text-2xl">Categories</h1>
      <Button variant="primary" @click="openCreate">+ Add Category</Button>
    </div>

    <Loader v-if="loading" />

    <div v-else class="space-y-3">
      <div v-for="cat in categories" :key="cat._id" class="rounded-card card-surface p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <img :src="cat.image" class="w-10 h-10 rounded-lg object-cover" />
            <div>
              <p class="font-semibold text-sm">{{ cat.name }}</p>
              <p class="text-xs" style="color: var(--text-secondary);">{{ (cat.subcategories || []).length }} subcategories</p>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="text-xs font-medium text-electric-500" @click="openEdit(cat)">Edit</button>
            <button class="text-xs font-medium text-promo" @click="handleDelete(cat)">Delete</button>
          </div>
        </div>
        <div v-if="cat.subcategories?.length" class="flex flex-wrap gap-2 mt-3 pt-3" style="border-top: 1px solid var(--border-color);">
          <span v-for="sub in cat.subcategories" :key="sub._id" class="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10">{{ sub.name }}</span>
        </div>
      </div>
    </div>

    <Modal v-model="showModal" :title="editing?._id ? 'Edit Category' : 'Add Category'">
      <form class="space-y-3" @submit.prevent="handleSave">
        <FormField v-model="form.name" label="Name (English)" :error="errors.name" required />
        <FormField v-model="form.nameFr" label="Nom (Français)" />
        <FormField v-model="form.image" label="Image URL" />
        <div>
          <label class="text-sm font-medium block mb-1.5">Parent Category (optional)</label>
          <select v-model="form.parentCategory" class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="">None (top-level category)</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <Button type="submit" variant="primary" full :loading="saving">Save Category</Button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import Loader from '../components/common/Loader.vue';
import Modal from '../components/common/Modal.vue';
import FormField from '../components/common/FormField.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const categories = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const editing = ref(null);

const form = reactive({ name: '', nameFr: '', image: '', parentCategory: '' });
const errors = reactive({ name: '' });

async function fetchCategories() {
  loading.value = true;
  try {
    const res = await api.get('/categories');
    categories.value = res.data.categories;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, { name: '', nameFr: '', image: '', parentCategory: '' });
  showModal.value = true;
}

function openEdit(cat) {
  editing.value = cat;
  Object.assign(form, { name: cat.name, nameFr: cat.nameFr || '', image: cat.image || '', parentCategory: cat.parentCategory || '' });
  showModal.value = true;
}

async function handleSave() {
  errors.name = '';
  if (!form.name.trim()) {
    errors.name = 'Name is required';
    return;
  }
  saving.value = true;
  try {
    const payload = { ...form, parentCategory: form.parentCategory || null };
    if (editing.value) {
      await api.put(`/categories/${editing.value._id}`, payload);
    } else {
      await api.post('/categories', payload);
    }
    showModal.value = false;
    await fetchCategories();
  } finally {
    saving.value = false;
  }
}

async function handleDelete(cat) {
  if (!confirm(`Remove "${cat.name}"?`)) return;
  await api.delete(`/categories/${cat._id}`);
  await fetchCategories();
}

onMounted(fetchCategories);
</script>

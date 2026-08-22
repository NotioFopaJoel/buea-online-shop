<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-display font-bold text-2xl">Products</h1>
      <Button variant="primary" @click="openCreate">+ Add Product</Button>
    </div>

    <Loader v-if="loading" />

    <div v-else class="rounded-card card-surface overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left" style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary);">
            <th class="p-3 font-medium">Product</th>
            <th class="p-3 font-medium">Category</th>
            <th class="p-3 font-medium">Price</th>
            <th class="p-3 font-medium">Stock</th>
            <th class="p-3 font-medium">Status</th>
            <th class="p-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p._id" style="border-bottom: 1px solid var(--border-color);">
            <td class="p-3 flex items-center gap-2">
              <img :src="p.images?.[0]" class="w-10 h-10 rounded-lg object-cover" />
              <span class="line-clamp-2 max-w-xs">{{ p.name }}</span>
            </td>
            <td class="p-3" style="color: var(--text-secondary);">{{ p.category?.name }}</td>
            <td class="p-3 font-medium">{{ formatPrice(p.price) }}</td>
            <td class="p-3">{{ p.stock }}</td>
            <td class="p-3">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full" :class="p.isActive ? 'bg-green-500/10 text-green-600' : 'bg-black/5'">
                {{ p.isActive ? 'Active' : 'Removed' }}
              </span>
            </td>
            <td class="p-3 text-right whitespace-nowrap">
              <button class="text-xs font-medium text-electric-500 mr-3" @click="openEdit(p)">Edit</button>
              <button class="text-xs font-medium text-promo" @click="handleDelete(p)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <Modal v-model="showModal" :title="editingProduct?._id ? 'Edit Product' : 'Add Product'">
      <form class="space-y-3" @submit.prevent="handleSave">
        <FormField v-model="form.name" label="Name" required />
        <div>
          <label class="text-sm font-medium block mb-1.5">Category</label>
          <select v-model="form.category" required class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="" disabled>Select category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <FormField v-model.number="form.price" label="Price (FCFA)" type="number" required />
        <FormField v-model.number="form.comparePrice" label="Compare Price (FCFA, optional)" type="number" />
        <FormField v-model.number="form.stock" label="Stock" type="number" required />
        <ImageUploadField v-model="form.images[0]" label="Product Photo" required />
        <div>
          <label class="text-sm font-medium block mb-1.5">Description</label>
          <textarea v-model="form.description" required rows="3" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
        </div>
        <div class="flex gap-4 text-sm">
          <label class="flex items-center gap-1.5"><input type="checkbox" v-model="form.isFeatured" /> Featured</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" v-model="form.isBestSeller" /> Best Seller</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" v-model="form.isNewArrival" /> New Arrival</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" v-model="form.isDealOfTheDay" /> Deal of the Day</label>
        </div>
        <Button type="submit" variant="primary" full :loading="saving">Save Product</Button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader.vue';
import Modal from '../components/common/Modal.vue';
import FormField from '../components/common/FormField.vue';
import ImageUploadField from '../components/common/ImageUploadField.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const editingProduct = ref(null);

const emptyForm = () => ({
  name: '', category: '', price: 0, comparePrice: 0, stock: 0, images: [''], description: '',
  isFeatured: false, isBestSeller: false, isNewArrival: false, isDealOfTheDay: false,
});
const form = reactive(emptyForm());

async function fetchAll() {
  loading.value = true;
  try {
    const [prodRes, catRes] = await Promise.all([
      api.get('/products', { params: { limit: 100 } }),
      api.get('/categories'),
    ]);
    products.value = prodRes.data.products;
    categories.value = catRes.data.categories.flatMap((c) => [c, ...(c.subcategories || [])]);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingProduct.value = null;
  Object.assign(form, emptyForm());
  showModal.value = true;
}

function openEdit(product) {
  editingProduct.value = product;
  Object.assign(form, {
    name: product.name,
    category: product.category?._id || '',
    price: product.price,
    comparePrice: product.comparePrice,
    stock: product.stock,
    images: product.images.length ? [...product.images] : [''],
    description: product.description,
    isFeatured: product.isFeatured,
    isBestSeller: product.isBestSeller,
    isNewArrival: product.isNewArrival,
    isDealOfTheDay: product.isDealOfTheDay,
  });
  showModal.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    if (editingProduct.value) {
      await api.put(`/products/${editingProduct.value._id}`, form);
    } else {
      await api.post('/products', form);
    }
    showModal.value = false;
    await fetchAll();
  } finally {
    saving.value = false;
  }
}

async function handleDelete(product) {
  if (!confirm(`Remove "${product.name}"?`)) return;
  await api.delete(`/products/${product._id}`);
  await fetchAll();
}

onMounted(fetchAll);
</script>

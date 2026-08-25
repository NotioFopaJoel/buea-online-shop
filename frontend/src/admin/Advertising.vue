<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-4">
      <h1 class="font-display font-bold text-2xl">Advertising</h1>
      <Button variant="primary" @click="openCreate">+ Add Advertisement</Button>
    </div>
    <p class="text-sm mb-5" style="color: var(--text-secondary);">
      Manage the promotional video/image carousel shown on the homepage between the hero and categories. Changes appear on the site immediately - no code changes needed.
    </p>

    <Loader v-if="loading" />

    <div v-else class="space-y-3">
      <div v-for="ad in ads" :key="ad._id" class="rounded-card card-surface p-4 flex gap-4">
        <div class="w-28 h-20 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style="background-color: var(--bg-primary);">
          <video v-if="ad.videoUrl" :src="ad.videoUrl" class="w-full h-full object-cover" muted />
          <img v-else-if="ad.imageUrl" :src="ad.imageUrl" class="w-full h-full object-cover" />
          <svg v-else class="w-6 h-6" style="color: var(--text-secondary);" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 10l4.55-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.45.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        </div>

        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <p class="font-semibold text-sm truncate">{{ ad.title }}</p>
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0" :class="ad.isActive ? 'bg-green-500/10 text-green-600' : 'bg-black/5'">
              {{ ad.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          <p class="text-xs mb-2 truncate" style="color: var(--text-secondary);">{{ ad.description || 'No description' }}</p>
          <div class="flex gap-4 text-xs" style="color: var(--text-secondary);">
            <span>👁 {{ ad.views }} views</span>
            <span>🖱 {{ ad.clicks }} clicks</span>
            <span>{{ ctr(ad) }}% CTR</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 shrink-0">
          <button class="text-xs font-medium text-electric-500" @click="openEdit(ad)">Edit</button>
          <button class="text-xs font-medium" style="color: var(--text-secondary);" @click="toggleActive(ad)">
            {{ ad.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button class="text-xs font-medium text-promo" @click="handleDelete(ad)">Delete</button>
        </div>
      </div>

      <p v-if="!ads.length" class="text-sm text-center py-10" style="color: var(--text-secondary);">No advertisements yet. Add one to feature it on the homepage.</p>
    </div>

    <Modal v-model="showModal" :title="editing?._id ? 'Edit Advertisement' : 'Add Advertisement'">
      <form class="space-y-3" @submit.prevent="handleSave">
        <FormField v-model="form.title" label="Title (English)" required placeholder="e.g. Summer Fashion Sale" />
        <FormField v-model="form.titleFr" label="Titre (Français)" placeholder="ex: Soldes d'été" />
        <div>
          <label class="text-sm font-medium block mb-1.5">Description (English)</label>
          <textarea v-model="form.description" rows="2" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
        </div>
        <div>
          <label class="text-sm font-medium block mb-1.5">Description (Français)</label>
          <textarea v-model="form.descriptionFr" rows="2" class="w-full px-3 py-2.5 rounded-lg text-sm resize-none" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);" />
        </div>

        <VideoUploadField v-model="form.videoUrl" label="Advertisement Video (optional)" />
        <ImageUploadField v-model="form.imageUrl" label="Fallback Image (used if no video)" />

        <div class="grid grid-cols-2 gap-3">
          <FormField v-model="form.ctaText" label="Button Text (EN)" placeholder="Shop Now" />
          <FormField v-model="form.ctaTextFr" label="Bouton (FR)" placeholder="Acheter maintenant" />
        </div>

        <div>
          <label class="text-sm font-medium block mb-1.5">Links to</label>
          <select v-model="form.linkType" class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="none">Nothing (informational only)</option>
            <option value="product">A specific product</option>
            <option value="category">A category</option>
            <option value="url">A custom link</option>
          </select>
        </div>

        <div v-if="form.linkType === 'product'">
          <label class="text-sm font-medium block mb-1.5">Product</label>
          <select v-model="form.linkProduct" class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="">Select product</option>
            <option v-for="p in products" :key="p._id" :value="p._id">{{ p.name }}</option>
          </select>
        </div>
        <div v-if="form.linkType === 'category'">
          <label class="text-sm font-medium block mb-1.5">Category</label>
          <select v-model="form.linkCategory" class="w-full px-3 py-2.5 rounded-lg text-sm" style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);">
            <option value="">Select category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">{{ c.name }}</option>
          </select>
        </div>
        <FormField v-if="form.linkType === 'url'" v-model="form.linkUrl" label="URL" placeholder="https://..." />

        <div class="grid grid-cols-2 gap-3">
          <FormField v-model="form.startDate" label="Start Date (optional)" type="date" />
          <FormField v-model="form.endDate" label="End Date (optional)" type="date" />
        </div>

        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" v-model="form.isActive" /> Active (shown on homepage)
        </label>

        <Button type="submit" variant="primary" full :loading="saving">Save Advertisement</Button>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import api from '../services/api';
import advertisementService from '../services/advertisementService';
import Loader from '../components/common/Loader.vue';
import Modal from '../components/common/Modal.vue';
import FormField from '../components/common/FormField.vue';
import ImageUploadField from '../components/common/ImageUploadField.vue';
import VideoUploadField from '../components/common/VideoUploadField.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const ads = ref([]);
const products = ref([]);
const categories = ref([]);
const loading = ref(true);
const saving = ref(false);
const showModal = ref(false);
const editing = ref(null);

const emptyForm = () => ({
  title: '', titleFr: '', description: '', descriptionFr: '',
  ctaText: 'Shop Now', ctaTextFr: 'Acheter maintenant',
  videoUrl: '', imageUrl: '',
  linkType: 'none', linkProduct: '', linkCategory: '', linkUrl: '',
  isActive: true, startDate: '', endDate: '',
});
const form = reactive(emptyForm());

function ctr(ad) {
  if (!ad.views) return '0.0';
  return ((ad.clicks / ad.views) * 100).toFixed(1);
}

async function fetchAll() {
  loading.value = true;
  try {
    const [adRes, prodRes, catRes] = await Promise.all([
      advertisementService.getAllAds(),
      api.get('/products', { params: { limit: 100 } }),
      api.get('/categories'),
    ]);
    ads.value = adRes.data.advertisements;
    products.value = prodRes.data.products;
    categories.value = catRes.data.categories.flatMap((c) => [c, ...(c.subcategories || [])]);
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editing.value = null;
  Object.assign(form, emptyForm());
  showModal.value = true;
}

function openEdit(ad) {
  editing.value = ad;
  Object.assign(form, {
    title: ad.title, titleFr: ad.titleFr || '',
    description: ad.description || '', descriptionFr: ad.descriptionFr || '',
    ctaText: ad.ctaText || 'Shop Now', ctaTextFr: ad.ctaTextFr || 'Acheter maintenant',
    videoUrl: ad.videoUrl || '', imageUrl: ad.imageUrl || '',
    linkType: ad.linkType || 'none',
    linkProduct: ad.linkProduct?._id || '',
    linkCategory: ad.linkCategory?._id || '',
    linkUrl: ad.linkUrl || '',
    isActive: ad.isActive,
    startDate: ad.startDate ? ad.startDate.slice(0, 10) : '',
    endDate: ad.endDate ? ad.endDate.slice(0, 10) : '',
  });
  showModal.value = true;
}

async function handleSave() {
  saving.value = true;
  try {
    const payload = {
      ...form,
      linkProduct: form.linkType === 'product' ? form.linkProduct || null : null,
      linkCategory: form.linkType === 'category' ? form.linkCategory || null : null,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
    };
    if (editing.value) {
      await advertisementService.updateAd(editing.value._id, payload);
    } else {
      await advertisementService.createAd(payload);
    }
    showModal.value = false;
    await fetchAll();
  } finally {
    saving.value = false;
  }
}

async function toggleActive(ad) {
  await advertisementService.updateAd(ad._id, { isActive: !ad.isActive });
  ad.isActive = !ad.isActive;
}

async function handleDelete(ad) {
  if (!confirm(`Delete advertisement "${ad.title}"?`)) return;
  await advertisementService.deleteAd(ad._id);
  await fetchAll();
}

onMounted(fetchAll);
</script>

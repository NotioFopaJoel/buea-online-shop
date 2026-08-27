<template>
  <div class="container-bos py-6">
    <AdminNav />
    <div class="flex items-center justify-between mb-6">
      <h1 class="font-display font-bold text-2xl">Contact Messages</h1>
      <span class="text-sm rounded-full px-3 py-1 bg-green-500/15 text-green-600 font-medium">
        {{ unreadCount }} unread
      </span>
    </div>

    <Loader v-if="loading" />

    <template v-else>
      <div v-if="messages.length" class="space-y-4">
        <div
          v-for="m in messages"
          :key="m._id"
          class="rounded-card card-surface p-5"
          :class="{ 'ring-2 ring-green-500/30': !m.isRead }"
        >
          <div class="flex items-start justify-between gap-3 flex-wrap">
            <div class="min-w-0">
              <p class="font-semibold truncate">{{ m.name }}
                <span v-if="!m.isRead" class="ml-2 text-xs font-medium text-green-600 uppercase">New</span>
              </p>
              <p class="text-sm truncate" style="color: var(--text-secondary);">
                {{ m.email }}{{ m.phone ? ' · ' + m.phone : '' }}
              </p>
            </div>
          </div>
          <p class="mt-3 text-sm font-medium text-electric-600">{{ m.subject }}</p>
          <div class="mt-3 space-y-2">
            <div v-for="(entry, i) in thread(m)" :key="i" class="text-sm p-3 rounded-lg max-w-[85%]" :class="entry.from === 'admin' ? 'bg-electric-500/10 ml-auto' : 'bg-black/5 dark:bg-white/5'">
              <p class="text-xs mb-1 font-medium" style="color: var(--text-secondary);">{{ entry.from === 'admin' ? 'You' : m.name }} · {{ formatDate(entry.createdAt) }}</p>
              <p class="whitespace-pre-wrap">{{ entry.body }}</p>
            </div>
          </div>

          <form class="mt-4 flex gap-2" @submit.prevent="reply(m)">
            <input
              v-model="replyTexts[m._id]"
              :placeholder="`Reply to ${m.name}...`"
              class="flex-1 px-3 py-2 text-sm rounded-lg"
              style="border: 1px solid var(--border-color); background-color: var(--bg-secondary); color: var(--text-primary);"
            />
            <Button type="submit" variant="primary" size="sm" :disabled="!replyTexts[m._id] || !replyTexts[m._id].trim() || replySending.get(m._id)">Send</Button>
          </form>

          <div class="mt-3 flex items-center justify-between">
            <p class="text-xs" style="color: var(--text-secondary);">{{ formatDate(m.createdAt) }}</p>
            <div class="flex items-center gap-2">
              <Button variant="ghost" size="sm" @click="toggleRead(m)">{{ m.isRead ? 'Mark unread' : 'Mark read' }}</Button>
              <Button variant="danger" size="sm" @click="remove(m)">Delete</Button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="rounded-card card-surface p-10 text-center text-sm" style="color: var(--text-secondary);">
        No messages yet.
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useUiStore } from '../stores/ui';
import Loader from '../components/common/Loader.vue';
import Button from '../components/common/Button.vue';
import AdminNav from './components/AdminNav.vue';

const uiStore = useUiStore();
const loading = ref(true);
const messages = ref([]);
const replyTexts = ref({});
const replySending = ref(new Map());

const unreadCount = computed(() => messages.value.filter((m) => !m.isRead).length);

function thread(m) {
  const entries = Array.isArray(m.conversation) && m.conversation.length ? m.conversation : [{ from: 'customer', body: m.message, createdAt: m.createdAt }];
  return entries;
}

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString();
}

async function load() {
  loading.value = true;
  try {
    const res = await api.get('/admin/contact-messages');
    messages.value = res.data.messages;
  } finally {
    loading.value = false;
  }
}

async function reply(m) {
  const body = (replyTexts.value[m._id] || '').trim();
  if (!body) return;
  if (replySending.value.get(m._id)) return;
  replySending.value.set(m._id, true);
  try {
    const res = await api.post(`/admin/contact-messages/${m._id}/reply`, { body });
    m.conversation = res.data.message.conversation;
    m.isRead = res.data.message.isRead;
    replyTexts.value[m._id] = '';
    uiStore.pushToast('Reply sent');
  } catch (error) {
    uiStore.pushToast(error.message, 'error');
  } finally {
    replySending.value.set(m._id, false);
  }
}

async function toggleRead(m) {
  try {
    const res = await api.patch(`/admin/contact-messages/${m._id}`, { isRead: !m.isRead });
    m.isRead = res.data.message.isRead;
  } catch (error) {
    uiStore.pushToast(error.message, 'error');
  }
}

async function remove(m) {
  if (!confirm('Delete this message?')) return;
  try {
    await api.delete(`/admin/contact-messages/${m._id}`);
    messages.value = messages.value.filter((x) => x._id !== m._id);
  } catch (error) {
    uiStore.pushToast(error.message, 'error');
  }
}

onMounted(load);
</script>

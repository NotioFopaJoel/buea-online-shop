import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { useUiStore } from './stores/ui';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Apply persisted/system theme + language before mounting to avoid a flash of wrong theme
const uiStore = useUiStore();
uiStore.initTheme();

app.mount('#app');

// Register the service worker (PWA install / offline).
// Registered in BOTH production and development: Chrome treats localhost as a
// secure context, so registering the SW during dev lets the "beforeinstallprompt"
// fire too — enabling direct one-click app install instead of fallback instructions.
// Set localStorage "bos_register_sw" to '0' to disable in dev if it causes issues.
if ('serviceWorker' in navigator) {
  const allowDev = import.meta.env.DEV ? localStorage.getItem('bos_register_sw') !== '0' : true;
  if (allowDev) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

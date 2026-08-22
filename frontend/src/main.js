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

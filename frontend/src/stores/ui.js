import { defineStore } from 'pinia';
import { translate, DEFAULT_LANGUAGE } from '../i18n';

const LANGUAGE_STORAGE_KEY = 'bos_language';
const THEME_STORAGE_KEY = 'bos_theme';
const ONBOARDING_SEEN_KEY = 'bos_onboarding_seen';

function getInitialLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (stored === 'en' || stored === 'fr') return stored;
  return DEFAULT_LANGUAGE; // English is the default on first load, per brief section 43
}

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  // Respect system theme on first visit (brief section 44)
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    language: getInitialLanguage(),
    theme: getInitialTheme(),
    isMobileMenuOpen: false,
    isCartDrawerOpen: false,
    showOnboarding: false,
    toasts: [],
  }),

  getters: {
    isDark: (state) => state.theme === 'dark',
  },

  actions: {
    /**
     * Global translation helper - used throughout the app as ui.t('checkout.placeOrder')
     */
    t(key) {
      return translate(this.language, key);
    },

    setLanguage(lang) {
      if (lang !== 'en' && lang !== 'fr') return;
      this.language = lang;
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);
    },

    toggleLanguage() {
      this.setLanguage(this.language === 'en' ? 'fr' : 'en');
    },

    setTheme(theme) {
      if (theme !== 'dark' && theme !== 'light') return;
      this.theme = theme;
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      applyThemeClass(theme);
    },

    toggleTheme() {
      this.setTheme(this.theme === 'dark' ? 'light' : 'dark');
    },

    initTheme() {
      applyThemeClass(this.theme);
      document.documentElement.setAttribute('lang', this.language);
    },

    /**
     * Lightweight toast notifications, e.g. "Added to cart ✓" (brief section 28)
     */
    pushToast(message, type = 'success') {
      const id = Date.now() + Math.random();
      this.toasts.push({ id, message, type });
      setTimeout(() => {
        this.toasts = this.toasts.filter((t) => t.id !== id);
      }, 3000);
    },

    toggleMobileMenu(value) {
      this.isMobileMenuOpen = value !== undefined ? value : !this.isMobileMenuOpen;
    },

    toggleCartDrawer(value) {
      this.isCartDrawerOpen = value !== undefined ? value : !this.isCartDrawerOpen;
    },

    /**
     * Onboarding tour - shown automatically once after a new account is
     * created (see Register.vue), and re-openable anytime from the "?"
     * button in the Header for anyone who wants a refresher.
     */
    openOnboarding() {
      this.showOnboarding = true;
    },

    closeOnboarding() {
      this.showOnboarding = false;
      localStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    },

    maybeShowOnboardingForNewUser() {
      if (!localStorage.getItem(ONBOARDING_SEEN_KEY)) {
        this.showOnboarding = true;
      }
    },
  },
});

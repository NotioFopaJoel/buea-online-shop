<template>
  <AppSplashScreen v-if="showSplash" :exiting="exiting" />
  <div v-else class="min-h-screen flex flex-col" style="background-color: var(--bg-primary); color: var(--text-primary);">
    <Header />
    <MobileAppBanner />
    <Navbar />

    <main class="flex-1 pb-16 md:pb-0">
      <router-view />
    </main>

    <Footer />
    <MobileNavbar class="md:hidden" />
    <ToastContainer />
    <OnboardingTour />
  </div>
</template>

<script setup>
import Header from './components/layout/Header.vue';
import Navbar from './components/layout/Navbar.vue';
import Footer from './components/layout/Footer.vue';
import MobileNavbar from './components/layout/MobileNavbar.vue';
import ToastContainer from './components/common/Toast.vue';
import OnboardingTour from './components/common/OnboardingTour.vue';
import AppSplashScreen from './components/common/AppSplashScreen.vue';
import MobileAppBanner from './components/common/MobileAppBanner.vue';
import { useSplashScreen } from './composables/useSplashScreen';

const { showSplash, exiting } = useSplashScreen();
</script>

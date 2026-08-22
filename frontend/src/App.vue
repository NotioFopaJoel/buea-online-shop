<template>
  <div class="min-h-screen flex flex-col" style="background-color: var(--bg-primary); color: var(--text-primary);">
    <Header />
    <Navbar />

    <main class="flex-1 pb-16 md:pb-0">
      <router-view />
    </main>

    <Footer class="hidden md:block" />
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
</script>

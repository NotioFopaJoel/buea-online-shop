import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/shop', name: 'Shop', component: () => import('../views/Shop.vue') },
  { path: '/category/:slug', name: 'Category', component: () => import('../views/Category.vue') },
  { path: '/search', name: 'SearchResults', component: () => import('../views/SearchResults.vue') },
  { path: '/product/:slug', name: 'ProductDetails', component: () => import('../views/ProductDetails.vue') },

  { path: '/cart', name: 'Cart', component: () => import('../views/Cart.vue') },
  { path: '/checkout', name: 'Checkout', component: () => import('../views/Checkout.vue') },
  { path: '/order-success/:orderNumber', name: 'OrderSuccess', component: () => import('../views/OrderSuccess.vue') },

  { path: '/orders', name: 'Orders', component: () => import('../views/Orders.vue'), meta: { requiresAuth: true } },
  { path: '/orders/:id', name: 'OrderDetails', component: () => import('../views/OrderDetails.vue'), meta: { requiresAuth: true } },
  { path: '/track-order', name: 'TrackOrder', component: () => import('../views/TrackOrder.vue') },

  { path: '/wishlist', name: 'Wishlist', component: () => import('../views/Wishlist.vue') },

  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue') },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPassword.vue') },
  { path: '/reset-password/:token', name: 'ResetPassword', component: () => import('../views/ResetPassword.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/r/:code', name: 'ReferralRedirect', component: () => import('../views/ReferralRedirect.vue') },

  { path: '/contact', name: 'Contact', component: () => import('../views/Contact.vue') },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },

  // Admin dashboard
  {
    path: '/admin',
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      { path: '', name: 'AdminDashboard', component: () => import('../admin/Dashboard.vue') },
      { path: 'products', name: 'AdminProducts', component: () => import('../admin/Products.vue') },
      { path: 'orders', name: 'AdminOrders', component: () => import('../admin/Orders.vue') },
      { path: 'users', name: 'AdminUsers', component: () => import('../admin/Users.vue') },
      { path: 'categories', name: 'AdminCategories', component: () => import('../admin/Categories.vue') },
      { path: 'promotions', name: 'AdminPromotions', component: () => import('../admin/Promotions.vue') },
      { path: 'advertising', name: 'AdminAdvertising', component: () => import('../admin/Advertising.vue') },
      { path: 'referrals', name: 'AdminReferrals', component: () => import('../admin/Referrals.vue') },
      { path: 'messages', name: 'AdminMessages', component: () => import('../admin/Messages.vue') },
      { path: 'settings', name: 'AdminSettings', component: () => import('../admin/Settings.vue') },
    ],
  },

  // Seller dashboard
  {
    path: '/seller',
    meta: { requiresAuth: true, requiresSeller: true },
    children: [
      { path: '', name: 'SellerDashboard', component: () => import('../seller/Dashboard.vue') },
      { path: 'products', name: 'SellerProducts', component: () => import('../seller/Products.vue') },
      { path: 'orders', name: 'SellerOrders', component: () => import('../seller/Orders.vue') },
      { path: 'earnings', name: 'SellerEarnings', component: () => import('../seller/Earnings.vue') },
    ],
  },

  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('../views/NotFound.vue') },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Home' });
  }
  if (to.meta.requiresSeller && !authStore.isSeller && !authStore.isAdmin) {
    return next({ name: 'Home' });
  }
  return next();
});

export default router;

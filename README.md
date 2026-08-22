# BUEA ONLINE SHOP

**Shop Everything. Delivered in Buea.**

A complete, functional e-commerce platform built for Buea, Cameroon — with local delivery, pay-after-delivery via MTN Mobile Money / Orange Money, and WhatsApp order confirmation.

## 1. Presentation

BUEA ONLINE SHOP lets customers browse clothing, jewelry, electronics, home decor, beauty products, sports gear, kids' toys, automotive accessories and books — search, filter, add to cart or wishlist, check out as a guest or registered customer, and track their order, all in English or French, in light or dark mode.

Unlike a typical international storefront, the entire ordering flow is designed around how commerce actually works in Buea today: delivery is local, payment happens **after** the customer receives and checks their order, and the seller confirms every order directly with the customer over WhatsApp.

## 2. Technologies

**Frontend:** Vue 3 (Composition API), Vite, Vue Router, Pinia, Axios, Tailwind CSS
**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, bcrypt, express-validator, multer, helmet, cors, express-rate-limit
**Architecture:** fully decoupled frontend/backend, REST API

## 3. Architecture

```
buea-online-shop/
├── frontend/     Vue 3 SPA (components, views, admin & seller dashboards, i18n, stores)
├── backend/      Express REST API (models, controllers, routes, services, middleware)
└── docs/         API.md, DATABASE.md, INSTALLATION.md
```

The backend is the **single source of truth** for money: subtotal, delivery fee, and total are always recalculated server-side from the database — never trusted from the client (see `backend/src/services/order.service.js`).

## 4. Installation

See [`docs/INSTALLATION.md`](docs/INSTALLATION.md) for full steps. Quick start:
```bash
npm run install:all
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cd backend && npm run seed && npm run dev
# in a second terminal
cd frontend && npm run dev
```

## 5. MongoDB Configuration

Set `MONGO_URI` in `backend/.env` (local or Atlas). See [`docs/DATABASE.md`](docs/DATABASE.md) for the full schema reference.

## 6. Environment Variables

See `backend/.env.example` and `frontend/.env.example`. Key ones:
- `WHATSAPP_BUSINESS_NUMBER` — the shop's WhatsApp number (also editable in Admin → Settings)
- `DELIVERY_FREE_THRESHOLD` / `DELIVERY_FEE_STANDARD` — the 10,000 FCFA free-delivery rule
- `MTN_API_KEY` / `ORANGE_API_KEY` — left empty in v1 (pay-after-delivery, no online charge)

## 7. Running Frontend & Backend

```bash
npm run dev:backend   # http://localhost:5000
npm run dev:frontend  # http://localhost:5173
```

## 8. Seeding the Database

```bash
npm run seed
```
Creates categories, 10 Buea delivery zones, 1 admin, 3 sellers, 10 customers, 50+ products, and demo orders. Login credentials are printed to the console.

## 9. API

Full reference in [`docs/API.md`](docs/API.md). Health check: `GET /api/health`.

## 10. Authentication

JWT-based, roles: `customer`, `seller`, `admin`. Guest checkout is also supported — an order can be placed without an account (`isGuestOrder: true`).

## 11. Admin

Login as `admin@bueaonlineshop.com` / `Admin@12345` (after seeding), then visit `/admin`. Manage products, categories, orders (with WhatsApp contact + status workflow), users, promotions/coupons, delivery zones, and settings (including the WhatsApp business number).

## 12. Seller

Login as `seller1@bueaonlineshop.com` / `Seller@12345`, then visit `/seller`. Manage your own products, see orders containing your items, and track earnings from paid orders.

## 13. Core Business Rules

- **Delivery:** Buea only in v1 (architecture supports adding cities later via `DeliveryZone`)
- **Delivery fee:** FREE at/above 10,000 FCFA, otherwise 1,000 FCFA — calculated server-side
- **Payment:** after delivery only, via MTN Mobile Money or Orange Money — no online charge at checkout
- **Order confirmation:** via a pre-filled WhatsApp message (`wa.me` link) generated from real order data
- **Languages:** English (default) and French, fully centralized in `frontend/src/i18n`
- **Theme:** light/dark, respects system preference on first visit, persisted after that

## 14. Production Deployment

Build the frontend (`npm run build:frontend`) and deploy the static `frontend/dist/` output to any static host. Deploy the backend (Node/Express) to a service like Render, Railway, or a VPS with PM2, pointing `VITE_API_URL` and `CLIENT_URL` at each other's public URLs.

---

Built to be extensible toward: multi-vendor marketplace, mobile app, automated Mobile Money payments, automated delivery/GPS tracking, WhatsApp Business API, SMS notifications, and expansion to Douala, Yaoundé, and other Cameroonian and African cities.

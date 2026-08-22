# Installation — BUEA ONLINE SHOP

## Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas URI

## 1. Install dependencies
```bash
npm run install:all
# or manually:
cd backend && npm install
cd ../frontend && npm install
```

## 2. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```
Edit `backend/.env`:
- `MONGO_URI` — your MongoDB connection string
- `JWT_SECRET` — a long random string
- `WHATSAPP_BUSINESS_NUMBER` — the shop's WhatsApp number (E.164, no `+`), also editable later from Admin → Settings

## 3. Seed the database (recommended for first run)
```bash
cd backend && npm run seed
```
This creates categories, Buea delivery zones, an admin account, sellers, customers, 50+ products, and demo orders. Credentials are printed at the end (admin: `admin@bueaonlineshop.com` / `Admin@12345`).

## 4. Run the backend
```bash
cd backend && npm run dev
```
API available at `http://localhost:5000/api`. Health check: `GET /api/health`.

## 5. Run the frontend
```bash
cd frontend && npm run dev
```
App available at `http://localhost:5173`. The dev server proxies `/api` to the backend automatically (see `frontend/vite.config.js`).

## 6. Production build
```bash
cd frontend && npm run build
```
Outputs static files to `frontend/dist/`, ready to deploy behind any static host, with the backend deployed separately (e.g. Render, Railway, a VPS with PM2).

## Notes
- Payments (MTN Mobile Money / Orange Money) are **pay-after-delivery** in v1 — no online charge happens at checkout. Admin marks payments as "Paid" from the Orders dashboard after delivery. Real MTN/Orange API integration is isolated in `backend/src/services/payment.service.js` for future automation.
- WhatsApp order confirmation is a `wa.me` deep link generated from real order data — no WhatsApp Business API account is required for v1.

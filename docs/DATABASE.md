# Database — BUEA ONLINE SHOP

MongoDB via Mongoose. Collections:

- **User** — customer/seller/admin accounts, addresses, wishlist ref, seller profile
- **Category** — supports `parentCategory` for subcategories
- **Product** — price/comparePrice/discount, colors/sizes, `sellerId`, feature flags (isFeatured, isBestSeller, isNewArrival, isDealOfTheDay)
- **Cart** — one document per user, embedded items with price snapshot (display only; server recalculates at checkout)
- **Order** — the core object. Embeds verified items + shipping address. Tracks `orderStatus`, `paymentStatus`, and `whatsappStatus` separately (see brief section 64).
- **Review** — one per (product, user, order) — enforced via compound unique index, requires a `DELIVERED` order containing that product
- **Wishlist** — one document per user
- **Coupon** — percentage/fixed discounts with date range and usage limits
- **Payment** — one per order, tracks manual "pay after delivery" confirmation (or future MTN/Orange automation)
- **DeliveryZone** — admin-manageable Buea neighborhoods, extensible to other cities
- **Settings** — singleton document: WhatsApp business number, delivery thresholds, support contacts

## Key business rule (order.service.js)
```
if subtotal (after discount) >= deliveryFreeThreshold (default 10,000 FCFA):
    deliveryFee = 0
else:
    deliveryFee = deliveryFeeStandard (default 1,000 FCFA)
```
This is always computed server-side from `Settings`/`.env`, never trusted from the client.

## Seeding
`npm run seed` (from `/backend`) populates categories, Buea delivery zones, an admin, 3 sellers, 10 customers, 50+ products and demo orders. See `backend/src/seed/seed.js` for credentials printed at the end of the run.

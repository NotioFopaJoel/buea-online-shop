# API Documentation — BUEA ONLINE SHOP

Base URL (development): `http://localhost:5000/api`

All responses follow this shape:
```json
{ "success": true, "message": "...", "data": { ... }, "meta": { ... } }
```
Errors:
```json
{ "success": false, "message": "...", "errors": [...] }
```

Protected routes require: `Authorization: Bearer <JWT>`

## Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /auth/register | - | Create a customer account |
| POST | /auth/login | - | Login, returns JWT |
| POST | /auth/logout | Yes | Stateless logout |
| GET | /auth/profile | Yes | Get current user |
| PUT | /auth/profile | Yes | Update profile |
| POST | /auth/addresses | Yes | Add address |
| DELETE | /auth/addresses/:id | Yes | Remove address |
| POST | /auth/forgot-password | - | Request password reset |

## Products & Categories
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | /products | - | List/search/filter products |
| GET | /products/:slug | - | Product detail + related |
| GET | /products/:id/reviews | - | Product reviews |
| POST | /products | Seller/Admin | Create product |
| PUT | /products/:id | Seller/Admin | Update product |
| DELETE | /products/:id | Seller/Admin | Soft-delete product |
| GET | /categories | - | List categories (+ subcategories) |
| POST/PUT/DELETE | /categories | Admin | Manage categories |

## Cart & Wishlist
| Method | Route | Auth |
|---|---|---|
| GET/POST /cart, PUT/DELETE /cart/:itemId | Yes |
| GET/POST /wishlist, DELETE /wishlist/:productId | Yes |

## Orders (core business logic)
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | /orders | Optional (guest checkout) | Places order. Server recalculates subtotal/delivery/total. |
| GET | /orders | Yes | My orders |
| GET | /orders/:id | Yes | Order detail |
| GET | /orders/track/:orderNumber | - | Public order tracking |
| PUT | /orders/:id/whatsapp-status | Yes | Update WhatsApp contact status |
| PUT | /orders/:id/status | Yes (staff) | Update order status |
| PUT | /orders/:id/payment-status | Yes (staff) | Mark paid/pending |

## Payments
| Method | Route | Auth |
|---|---|---|
| GET | /payments/order/:orderId | Yes |
| PUT | /payments/:id/confirm | Admin |

## Admin
`/admin/dashboard`, `/admin/orders`, `/admin/delivery-zones`, `/admin/settings`, `/admin/coupons` — all Admin-only.

## Seller
`/seller/dashboard`, `/seller/orders`, `/seller/earnings` — scoped to the logged-in seller's own products.

## Public config
`/public/delivery-zones`, `/public/settings` — used by checkout (Buea neighborhoods, free delivery threshold).

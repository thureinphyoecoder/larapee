# POS API v1

Base URL: `/api/v1`
Auth: Bearer token (Laravel Sanctum personal access token)

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me` (auth)
- `POST /auth/logout` (auth)

## Catalog
- `GET /catalog/meta`
- `GET /catalog/products?q=&shop_id=&category_id=&brand_id=&active_only=&per_page=`
- `GET /catalog/products/{product}`

## Cart (auth)
- `GET /cart`
- `POST /cart/items` `{ variant_id, quantity }`
- `PATCH /cart/items/{cartItem}` `{ quantity }`
- `DELETE /cart/items/{cartItem}`
- `DELETE /cart/clear`

## Orders (auth)
- `GET /orders`
- `GET /orders/{order}`
- `POST /orders`
  - Cart checkout: `{ phone, address, shop_id?, payment_slip? }`
  - Direct checkout: `{ phone, address, shop_id?, payment_slip?, items:[{variant_id,quantity}] }`
- `PATCH /orders/{order}/status` (staff roles only)

## Customers (auth staff)
- `GET /customers`

## Setup
1. Run migrations:
   - `php artisan migrate`
2. If using image URLs from `public` disk:
   - `php artisan storage:link`
3. Ensure roles are seeded (`admin`, `manager`, `sales`, `delivery`, `customer`).

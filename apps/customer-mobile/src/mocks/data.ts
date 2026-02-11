import type { Category, CustomerOrder, Product } from "../types/domain";

export const fallbackCategories: Category[] = [
  { id: 1, name: "Electronics", slug: "electronics" },
  { id: 2, name: "Fashion", slug: "fashion" },
  { id: 3, name: "Home", slug: "home" },
  { id: 4, name: "Groceries", slug: "groceries" },
];

export const fallbackProducts: Product[] = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    slug: "wireless-earbuds-pro",
    price: 89000,
    description: "Noise cancelling earbuds",
    image_url: null,
    shop: { id: 1, name: "LaraPee Tech Hub" },
    category: { id: 1, name: "Electronics", slug: "electronics" },
    active_variants: [{ id: 101, sku: "EARBUDS-PRO", price: 89000, stock_level: 120 }],
  },
  {
    id: 2,
    name: "Smart Casual Shirt",
    slug: "smart-casual-shirt",
    price: 42000,
    description: "Comfort fit cotton",
    image_url: null,
    shop: { id: 2, name: "Urban Wear" },
    category: { id: 2, name: "Fashion", slug: "fashion" },
    active_variants: [{ id: 102, sku: "SHIRT-CASUAL", price: 42000, stock_level: 80 }],
  },
  {
    id: 3,
    name: "Kitchen Blender 900W",
    slug: "kitchen-blender-900w",
    price: 135000,
    description: "Multi-speed blender",
    image_url: null,
    shop: { id: 3, name: "Home Plus" },
    category: { id: 3, name: "Home", slug: "home" },
    active_variants: [{ id: 103, sku: "BLENDER-900W", price: 135000, stock_level: 35 }],
  },
];

export const fallbackOrders: CustomerOrder[] = [
  {
    id: 501,
    invoice_no: "INV-2026-000501",
    status: "pending",
    total_amount: 178000,
    created_at: "2026-02-10T09:00:00.000Z",
    shop: { id: 1, name: "LaraPee Tech Hub" },
  },
  {
    id: 488,
    invoice_no: "INV-2026-000488",
    status: "delivered",
    total_amount: 42000,
    created_at: "2026-02-07T12:45:00.000Z",
    shop: { id: 2, name: "Urban Wear" },
  },
];

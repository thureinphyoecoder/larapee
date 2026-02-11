export type Locale = "en" | "mm";
export type ThemeMode = "light" | "dark";
export type CustomerTab = "home" | "orders" | "cart" | "account";

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  roles?: string[];
};

export type AuthSession = {
  token: string;
  user: ApiUser;
};

export type Category = {
  id: number;
  name: string;
  slug?: string | null;
};

export type ProductVariant = {
  id: number;
  sku: string;
  price: number;
  stock_level: number;
};

export type Product = {
  id: number;
  name: string;
  slug?: string | null;
  price: number;
  image_url?: string | null;
  description?: string | null;
  shop?: { id: number; name: string } | null;
  category?: Category | null;
  active_variants?: ProductVariant[];
};

export type CartItem = {
  id: number;
  product_id: number;
  variant_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  product?: Product;
  variant?: ProductVariant;
};

export type CustomerOrder = {
  id: number;
  invoice_no: string | null;
  status: string;
  total_amount: number;
  created_at: string | null;
  shop?: { id: number; name: string } | null;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export type ApiListResponse<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

import { useCallback, useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../config/server";
import { tr } from "../i18n/strings";
import { ApiError } from "../lib/http";
import { clearSession, loadLocale, loadSession, loadTheme, saveLocale, saveSession, saveTheme } from "../lib/storage";
import { addCartItem, fetchCart } from "../services/cartService";
import { fetchCategories, fetchProducts } from "../services/catalogService";
import { logout as logoutService, signIn } from "../services/authService";
import { fetchOrders, placeOrderFromCart } from "../services/orderService";
import type { CartItem, Category, CustomerOrder, CustomerTab, Locale, Product, ThemeMode } from "../types/domain";

export function useCustomerApp() {
  const [booting, setBooting] = useState(true);
  const [locale, setLocale] = useState<Locale>("en");
  const [theme, setTheme] = useState<ThemeMode>("light");

  const [session, setSession] = useState<Awaited<ReturnType<typeof loadSession>>>(null);
  const [activeTab, setActiveTab] = useState<CustomerTab>("home");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");

  const [query, setQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [refreshing, setRefreshing] = useState(false);
  const [addingProductId, setAddingProductId] = useState<number | null>(null);
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  const dark = theme === "dark";

  const hydratePublicCatalog = useCallback(async (search = query, categoryId = activeCategoryId) => {
    const [nextCategories, nextProducts] = await Promise.all([
      fetchCategories(API_BASE_URL),
      fetchProducts(API_BASE_URL, search, categoryId),
    ]);

    setCategories(nextCategories);
    setProducts(nextProducts);
  }, [query, activeCategoryId]);

  const hydratePrivateData = useCallback(async (token: string) => {
    const [nextOrders, nextCart] = await Promise.all([
      fetchOrders(API_BASE_URL, token),
      fetchCart(API_BASE_URL, token),
    ]);

    setOrders(nextOrders);
    setCartItems(nextCart);
  }, []);

  const bootstrap = useCallback(async () => {
    setBooting(true);

    try {
      const [savedLocale, savedTheme, savedSession] = await Promise.all([loadLocale(), loadTheme(), loadSession()]);

      setLocale(savedLocale);
      setTheme(savedTheme);
      setSession(savedSession);

      await hydratePublicCatalog("", null);

      if (savedSession?.token) {
        await hydratePrivateData(savedSession.token);
      }
    } finally {
      setBooting(false);
    }
  }, [hydratePrivateData, hydratePublicCatalog]);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    const timer = setTimeout(() => {
      void hydratePublicCatalog(query, activeCategoryId);
    }, 300);

    return () => clearTimeout(timer);
  }, [session?.token, query, activeCategoryId, hydratePublicCatalog]);

  const refreshAll = useCallback(async () => {
    setRefreshing(true);

    try {
      await hydratePublicCatalog(query, activeCategoryId);

      if (session?.token) {
        await hydratePrivateData(session.token);
      }
    } finally {
      setRefreshing(false);
    }
  }, [activeCategoryId, hydratePrivateData, hydratePublicCatalog, query, session?.token]);

  const handleSignIn = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setAuthError(tr(locale, "invalidCredentials"));
      return;
    }

    setAuthBusy(true);
    setAuthError("");

    try {
      const nextSession = await signIn(API_BASE_URL, email.trim(), password);
      await saveSession(nextSession);
      setSession(nextSession);
      setActiveTab("home");
      await hydratePrivateData(nextSession.token);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setAuthError(tr(locale, "networkError"));
        } else if (/invalid credentials/i.test(error.message)) {
          setAuthError(tr(locale, "invalidCredentials"));
        } else {
          setAuthError(error.message || tr(locale, "unknownError"));
        }
      } else {
        setAuthError(tr(locale, "unknownError"));
      }
    } finally {
      setAuthBusy(false);
    }
  }, [email, password, locale, hydratePrivateData]);

  const handleAddToCart = useCallback(async (product: Product) => {
    if (!session?.token) {
      return;
    }

    const variantId = product.active_variants?.[0]?.id;
    if (!variantId) {
      return;
    }

    setAddingProductId(product.id);

    try {
      await addCartItem(API_BASE_URL, session.token, variantId, 1);
      const nextCart = await fetchCart(API_BASE_URL, session.token);
      setCartItems(nextCart);
      setActiveTab("cart");
    } catch {
      // Keep the UX stable; auth/network errors are surfaced on next refresh/login.
    } finally {
      setAddingProductId(null);
    }
  }, [session?.token]);

  const handleCheckout = useCallback(async () => {
    if (!session?.token) {
      return;
    }

    setCheckoutBusy(true);

    try {
      await placeOrderFromCart(API_BASE_URL, session.token);
      await hydratePrivateData(session.token);
      setActiveTab("orders");
    } finally {
      setCheckoutBusy(false);
    }
  }, [session?.token, hydratePrivateData]);

  const handleLogout = useCallback(async () => {
    if (session?.token) {
      try {
        await logoutService(API_BASE_URL, session.token);
      } catch {
        // Ignore logout network errors and clear local session anyway.
      }
    }

    await clearSession();
    setSession(null);
    setOrders([]);
    setCartItems([]);
  }, [session?.token]);

  const toggleLocale = useCallback(async () => {
    const nextLocale: Locale = locale === "en" ? "mm" : "en";
    setLocale(nextLocale);
    await saveLocale(nextLocale);
  }, [locale]);

  const toggleTheme = useCallback(async () => {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    await saveTheme(nextTheme);
  }, [theme]);

  const tabItems = useMemo(
    () => [
      { key: "home" as const, label: tr(locale, "tabsHome") },
      { key: "orders" as const, label: tr(locale, "tabsOrders") },
      { key: "cart" as const, label: tr(locale, "tabsCart") },
      { key: "account" as const, label: tr(locale, "tabsAccount") },
    ],
    [locale],
  );

  return {
    booting,
    dark,
    locale,
    theme,
    session,
    activeTab,
    tabItems,
    setActiveTab,
    login: {
      email,
      password,
      busy: authBusy,
      error: authError,
      setEmail,
      setPassword,
      submit: handleSignIn,
    },
    catalog: {
      query,
      categories,
      activeCategoryId,
      products,
      addingProductId,
      setQuery,
      setActiveCategoryId,
      addToCart: handleAddToCart,
    },
    orders,
    cart: {
      items: cartItems,
      checkoutBusy,
      checkout: handleCheckout,
    },
    refreshing,
    refreshAll,
    account: {
      toggleLocale,
      toggleTheme,
      logout: handleLogout,
    },
  };
}

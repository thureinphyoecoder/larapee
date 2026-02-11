import type { Locale } from "../types/domain";

type I18nKey =
  | "appName"
  | "appTagline"
  | "loginTitle"
  | "loginSubtitle"
  | "email"
  | "password"
  | "signIn"
  | "signingIn"
  | "demoHint"
  | "tabsHome"
  | "tabsOrders"
  | "tabsCart"
  | "tabsAccount"
  | "welcomeBack"
  | "searchPlaceholder"
  | "categories"
  | "featuredProducts"
  | "addToCart"
  | "adding"
  | "ordersTitle"
  | "ordersEmpty"
  | "cartTitle"
  | "cartEmpty"
  | "subtotal"
  | "checkout"
  | "checkingOut"
  | "accountTitle"
  | "language"
  | "theme"
  | "logout"
  | "light"
  | "dark"
  | "retry"
  | "invalidCredentials"
  | "networkError"
  | "unknownError"
  | "total"
  | "itemCount"
  | "pullToRefresh"
  | "notificationTitle"
  | "notificationMsg"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled";

type Dictionary = Record<I18nKey, string>;

const en: Dictionary = {
  appName: "LaraPee",
  appTagline: "Shop smarter, checkout faster",
  loginTitle: "Customer Sign In",
  loginSubtitle: "Access your orders, cart and profile in one place.",
  email: "Email",
  password: "Password",
  signIn: "Sign In",
  signingIn: "Signing in...",
  demoHint: "Use your existing customer account.",
  tabsHome: "Home",
  tabsOrders: "Orders",
  tabsCart: "Cart",
  tabsAccount: "Account",
  welcomeBack: "Welcome back",
  searchPlaceholder: "Search products or shops",
  categories: "Categories",
  featuredProducts: "Featured Products",
  addToCart: "Add to cart",
  adding: "Adding...",
  ordersTitle: "My Orders",
  ordersEmpty: "No orders yet.",
  cartTitle: "My Cart",
  cartEmpty: "Your cart is empty.",
  subtotal: "Subtotal",
  checkout: "Place Order",
  checkingOut: "Placing order...",
  accountTitle: "Account",
  language: "Language",
  theme: "Theme",
  logout: "Logout",
  light: "Light",
  dark: "Dark",
  retry: "Retry",
  invalidCredentials: "Invalid email or password.",
  networkError: "Network unavailable. Please check API URL and connection.",
  unknownError: "Something went wrong. Please try again.",
  total: "Total",
  itemCount: "items",
  pullToRefresh: "Pull down to refresh",
  notificationTitle: "Order update",
  notificationMsg: "New status updates are available.",
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const mm: Dictionary = {
  appName: "LaraPee",
  appTagline: "ဈေးဝယ်မှုမြန်မြန်၊ Checkout လုံခြုံစိတ်ချ",
  loginTitle: "Customer Login",
  loginSubtitle: "Order၊ Cart နဲ့ Profile ကို တစ်နေရာတည်းက စီမံနိုင်ပါတယ်။",
  email: "အီးမေးလ်",
  password: "စကားဝှက်",
  signIn: "ဝင်မည်",
  signingIn: "ဝင်နေပါသည်...",
  demoHint: "ရှိပြီးသား customer account နဲ့ဝင်ပါ။",
  tabsHome: "ပင်မ",
  tabsOrders: "အော်ဒါ",
  tabsCart: "ခြင်းတောင်း",
  tabsAccount: "အကောင့်",
  welcomeBack: "ပြန်လည်ကြိုဆိုပါတယ်",
  searchPlaceholder: "ပစ္စည်း၊ ဆိုင်နာမည် ရှာမယ်",
  categories: "အမျိုးအစားများ",
  featuredProducts: "အထူးရွေးချယ်ထားသော ပစ္စည်းများ",
  addToCart: "ခြင်းတောင်းထဲထည့်မည်",
  adding: "ထည့်နေပါသည်...",
  ordersTitle: "ကျွန်တော့် အော်ဒါများ",
  ordersEmpty: "အော်ဒါမရှိသေးပါ။",
  cartTitle: "ခြင်းတောင်း",
  cartEmpty: "ခြင်းတောင်းထဲမှာ ပစ္စည်းမရှိသေးပါ။",
  subtotal: "စုစုပေါင်း",
  checkout: "အော်ဒါတင်မည်",
  checkingOut: "အော်ဒါတင်နေပါသည်...",
  accountTitle: "အကောင့်",
  language: "ဘာသာစကား",
  theme: "အရောင်ပုံစံ",
  logout: "ထွက်မည်",
  light: "Light",
  dark: "Dark",
  retry: "ပြန်စမ်းမည်",
  invalidCredentials: "Email (သို့) Password မမှန်ပါ။",
  networkError: "Network မရပါ။ API URL နဲ့ အင်တာနက်ချိတ်ဆက်မှုကို စစ်ပါ။",
  unknownError: "အမှားတစ်ခု ဖြစ်ပွားနေပါတယ်။ ထပ်စမ်းပါ။",
  total: "စုစုပေါင်း",
  itemCount: "ခု",
  pullToRefresh: "Refresh လုပ်ရန် အောက်ဆွဲပါ",
  notificationTitle: "Order အခြေအနေပြောင်းလဲမှု",
  notificationMsg: "Order status အသစ်များ ရောက်ရှိနေပါသည်။",
  pending: "စောင့်ဆိုင်း",
  confirmed: "အတည်ပြုပြီး",
  shipped: "ပို့ဆောင်နေ",
  delivered: "ပို့ပြီး",
  cancelled: "ပယ်ဖျက်",
};

const dictionaries: Record<Locale, Dictionary> = { en, mm };

export function tr(locale: Locale, key: I18nKey): string {
  return dictionaries[locale][key] || dictionaries.en[key] || key;
}

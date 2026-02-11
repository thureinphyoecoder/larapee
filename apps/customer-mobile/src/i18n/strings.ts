import type { Locale } from "../types/domain";

type I18nKey =
  | "appName"
  | "appTagline"
  | "loginTitle"
  | "loginSubtitle"
  | "name"
  | "email"
  | "password"
  | "signIn"
  | "signingIn"
  | "demoHint"
  | "tabsHome"
  | "tabsOrders"
  | "tabsCart"
  | "tabsSupport"
  | "tabsAccount"
  | "welcomeBack"
  | "homeWelcomeSubtitle"
  | "discoverProducts"
  | "itemsFound"
  | "all"
  | "searchPlaceholder"
  | "categories"
  | "featuredProducts"
  | "noProducts"
  | "addToCart"
  | "adding"
  | "sale"
  | "flashSale"
  | "inStock"
  | "outOfStock"
  | "stockLeft"
  | "fromLabel"
  | "viewDetails"
  | "variant"
  | "quantity"
  | "productDetails"
  | "orderDetails"
  | "description"
  | "customerReviews"
  | "noReviews"
  | "writeReview"
  | "reviewPlaceholder"
  | "reviewSubmitted"
  | "orderItems"
  | "noOrderItems"
  | "customerPhone"
  | "deliveryAddress"
  | "statusLabel"
  | "back"
  | "ordersTitle"
  | "ordersSubtitle"
  | "ordersEmpty"
  | "cartTitle"
  | "cartSubtitle"
  | "cartEmpty"
  | "subtotal"
  | "cartSummary"
  | "paymentMethod"
  | "scanQrToPay"
  | "scanQr"
  | "uploadSlip"
  | "qrScanned"
  | "checkout"
  | "checkingOut"
  | "remove"
  | "removing"
  | "accountTitle"
  | "accountSubtitle"
  | "accountProfile"
  | "saveProfile"
  | "savingProfile"
  | "profileUpdated"
  | "profileUpdateFailed"
  | "nameEmailRequired"
  | "phoneNumber"
  | "nrcNumber"
  | "addressLine"
  | "city"
  | "stateRegion"
  | "postalCode"
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
  | "notificationsCenterTitle"
  | "notificationsEmpty"
  | "notificationsAll"
  | "notificationsUnread"
  | "markAllRead"
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refund_requested"
  | "refunded"
  | "return_requested"
  | "returned"
  | "orderActions"
  | "cancelOrder"
  | "requestRefund"
  | "requestReturn"
  | "reasonPlaceholder"
  | "submitRequest"
  | "orderCancelledSuccess"
  | "refundRequestedSuccess"
  | "returnRequestedSuccess"
  | "supportTitle"
  | "supportSubtitle"
  | "supportEmpty"
  | "supportPlaceholder"
  | "supportAgent"
  | "assignedTo"
  | "you"
  | "loading"
  | "phoneRequired"
  | "addressRequired"
  | "paymentSlipRequired"
  | "receiptTitle"
  | "printReceipt"
  | "backToOrder"
  | "trackOrder"
  | "soldLabel";

type Dictionary = Record<I18nKey, string>;

const en: Dictionary = {
  appName: "LaraPee",
  appTagline: "Shop smarter, checkout faster",
  loginTitle: "Customer Sign In",
  loginSubtitle: "Access your orders, cart and profile in one place.",
  name: "Name",
  email: "Email",
  password: "Password",
  signIn: "Sign In",
  signingIn: "Signing in...",
  demoHint: "Use your existing customer account.",
  tabsHome: "Home",
  tabsOrders: "Orders",
  tabsCart: "Cart",
  tabsSupport: "Support",
  tabsAccount: "Account",
  welcomeBack: "Welcome",
  homeWelcomeSubtitle: "Premium deals from verified shops, updated live.",
  discoverProducts: "Discover Products",
  itemsFound: "items found",
  all: "All",
  searchPlaceholder: "Search products or shops",
  categories: "Categories",
  featuredProducts: "Featured Products",
  noProducts: "No products matched your filters.",
  addToCart: "Add to cart",
  adding: "Adding...",
  sale: "Sale",
  flashSale: "Flash Sale",
  inStock: "In stock",
  outOfStock: "Out of stock",
  stockLeft: "left",
  fromLabel: "from",
  viewDetails: "View details",
  variant: "Variant",
  quantity: "Qty",
  productDetails: "Product Details",
  orderDetails: "Order Details",
  description: "Description",
  customerReviews: "Customer Reviews",
  noReviews: "No reviews yet.",
  writeReview: "Write a Review",
  reviewPlaceholder: "Share your experience...",
  reviewSubmitted: "Thanks for your review.",
  orderItems: "Order Items",
  noOrderItems: "No order items found.",
  customerPhone: "Phone",
  deliveryAddress: "Address",
  statusLabel: "Status",
  back: "Back",
  ordersTitle: "My Orders",
  ordersSubtitle: "Track status updates grouped by date.",
  ordersEmpty: "No orders yet.",
  cartTitle: "My Cart",
  cartSubtitle: "Review your items before placing order.",
  cartEmpty: "Your cart is empty.",
  subtotal: "Subtotal",
  cartSummary: "Order Summary",
  paymentMethod: "Payment Method",
  scanQrToPay: "Scan this QR with your wallet app and upload transfer slip.",
  scanQr: "Scan QR",
  uploadSlip: "Upload Slip",
  qrScanned: "QR scanned",
  checkout: "Place Order",
  checkingOut: "Placing order...",
  remove: "Remove",
  removing: "Removing...",
  accountTitle: "Account",
  accountSubtitle: "Manage your profile and preferences.",
  accountProfile: "Profile Information",
  saveProfile: "Save Profile",
  savingProfile: "Saving...",
  profileUpdated: "Profile updated successfully.",
  profileUpdateFailed: "Unable to update profile right now.",
  nameEmailRequired: "Name and email are required.",
  phoneNumber: "Phone Number",
  nrcNumber: "NRC Number",
  addressLine: "Address",
  city: "City",
  stateRegion: "State/Region",
  postalCode: "Postal Code",
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
  notificationsCenterTitle: "Notifications",
  notificationsEmpty: "No notifications yet.",
  notificationsAll: "All",
  notificationsUnread: "Unread",
  markAllRead: "Mark all read",
  pending: "Pending",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_requested: "Refund Requested",
  refunded: "Refunded",
  return_requested: "Return Requested",
  returned: "Returned",
  orderActions: "Order Actions",
  cancelOrder: "Cancel Order",
  requestRefund: "Request Refund",
  requestReturn: "Request Return",
  reasonPlaceholder: "Write your reason here...",
  submitRequest: "Submit Request",
  orderCancelledSuccess: "Order cancelled successfully.",
  refundRequestedSuccess: "Refund request sent.",
  returnRequestedSuccess: "Return request sent.",
  supportTitle: "Support Chat",
  supportSubtitle: "Need help? Message support team.",
  supportEmpty: "No messages yet. Start chatting with support.",
  supportPlaceholder: "Type your message...",
  supportAgent: "Support",
  assignedTo: "Assigned to",
  you: "You",
  loading: "Loading...",
  phoneRequired: "Please enter a valid phone number.",
  addressRequired: "Please enter delivery address.",
  paymentSlipRequired: "Please upload payment slip.",
  receiptTitle: "Receipt",
  printReceipt: "Print Receipt",
  backToOrder: "Back to Order",
  trackOrder: "Track Order",
  soldLabel: "Sold",
};

const mm: Dictionary = {
  appName: "LaraPee",
  appTagline: "ဈေးဝယ်မှု လွယ်ကူမြန်ဆန်၊ ငွေချေမှု စိတ်ချရ",
  loginTitle: "အကောင့်ဝင်ရန်",
  loginSubtitle: "သင့်ရဲ့ အော်ဒါများ၊ ခြင်းတောင်းနဲ့ ကိုယ်ရေးအချက်အလက်ကို တစ်နေရာတည်းမှာ စီမံနိုင်ပါတယ်။",
  name: "အမည်",
  email: "အီးမေးလ်",
  password: "စကားဝှက်",
  signIn: "အကောင့်ဝင်မည်",
  signingIn: "ဝင်နေပါသည်...",
  demoHint: "ရှိပြီးသား အကောင့်ဖြင့် ဝင်ရောက်ပါ။",
  tabsHome: "ပင်မ",
  tabsOrders: "အော်ဒါများ",
  tabsCart: "ခြင်းတောင်း",
  tabsSupport: "အကူအညီ",
  tabsAccount: "အကောင့်",
  welcomeBack: "ကြိုဆိုပါတယ်",
  homeWelcomeSubtitle: "ယုံကြည်စိတ်ချရသော ဆိုင်များမှ နောက်ဆုံးပေါ် ပစ္စည်းများ",
  discoverProducts: "ပစ္စည်းများ ရှာဖွေမည်",
  itemsFound: "ခု တွေ့ရှိသည်",
  all: "အားလုံး",
  searchPlaceholder: "ပစ္စည်း သို့မဟုတ် ဆိုင်အမည် ရှာပါ",
  categories: "အမျိုးအစားများ",
  featuredProducts: "အထူးရွေးချယ်ထားသော ပစ္စည်းများ",
  noProducts: "သင်ရှာဖွေနေသော ပစ္စည်းမရှိပါ။",
  addToCart: "ခြင်းတောင်းထဲထည့်မည်",
  adding: "ထည့်နေပါသည်...",
  sale: "အထူးလျှော့ဈေး",
  flashSale: "အချိန်အကန့်အသတ် လျှော့ဈေး",
  inStock: "ပစ္စည်းရှိသည်",
  outOfStock: "ပစ္စည်းပြတ်နေသည်",
  stockLeft: "ခု ကျန်သေးသည်",
  fromLabel: "စတင်",
  viewDetails: "အသေးစိတ်ကြည့်မည်",
  variant: "အမျိုးအစားခွဲ",
  quantity: "အရေအတွက်",
  productDetails: "ပစ္စည်းအသေးစိတ်",
  orderDetails: "အော်ဒါအသေးစိတ်",
  description: "အကြောင်းအရာ",
  customerReviews: "ဝယ်သူများ၏ မှတ်ချက်များ",
  noReviews: "မှတ်ချက် မရှိသေးပါ။",
  writeReview: "မှတ်ချက်ပေးမည်",
  reviewPlaceholder: "သင့်အတွေ့အကြုံကို ရေးသားပါ...",
  reviewSubmitted: "မှတ်ချက်ပေးသည့်အတွက် ကျေးဇူးတင်ပါသည်။",
  orderItems: "မှာယူထားသော ပစ္စည်းများ",
  noOrderItems: "ပစ္စည်းမရှိပါ။",
  customerPhone: "ဖုန်းနံပါတ်",
  deliveryAddress: "ပို့ဆောင်မည့် လိပ်စာ",
  statusLabel: "အခြေအနေ",
  back: "နောက်သို့",
  ordersTitle: "ကျွန်ုပ်၏ အော်ဒါများ",
  ordersSubtitle: "အော်ဒါများ၏ အခြေအနေကို နေ့ရက်အလိုက် ကြည့်နိုင်ပါသည်။",
  ordersEmpty: "အော်ဒါမရှိသေးပါ။",
  cartTitle: "ခြင်းတောင်း",
  cartSubtitle: "အော်ဒါမတင်မီ ပစ္စည်းများကို ပြန်လည်စစ်ဆေးပါ။",
  cartEmpty: "ခြင်းတောင်းထဲတွင် ပစ္စည်းမရှိသေးပါ။",
  subtotal: "စုစုပေါင်း (အကြမ်းဖျင်း)",
  cartSummary: "အော်ဒါ အနှစ်ချုပ်",
  paymentMethod: "ငွေပေးချေမှု နည်းလမ်း",
  scanQrToPay: "QR ကို Scan ဖတ်၍ ငွေလွှဲပြီးနောက် ပြေစာ (Slip) တင်ပေးပါ။",
  scanQr: "QR ဖတ်မည်",
  uploadSlip: "ပြေစာတင်မည်",
  qrScanned: "QR ဖတ်ပြီးပါပြီ",
  checkout: "အော်ဒါတင်မည်",
  checkingOut: "အော်ဒါတင်နေပါသည်...",
  remove: "ဖယ်ရှားမည်",
  removing: "ဖယ်ရှားနေပါသည်...",
  accountTitle: "အကောင့်",
  accountSubtitle: "ကိုယ်ရေးအချက်အလက်နှင့် ဆက်တင်များကို ပြင်ဆင်ပါ။",
  accountProfile: "ကိုယ်ရေးအချက်အလက်",
  saveProfile: "အချက်အလက် သိမ်းမည်",
  savingProfile: "သိမ်းနေပါသည်...",
  profileUpdated: "ပြင်ဆင်မှု အောင်မြင်ပါသည်။",
  profileUpdateFailed: "ပြင်ဆင်၍ မရသေးပါ။ ထပ်မံကြိုးစားကြည့်ပါ။",
  nameEmailRequired: "အမည်နှင့် အီးမေးလ် ဖြည့်ရန် လိုအပ်ပါသည်။",
  phoneNumber: "ဖုန်းနံပါတ်",
  nrcNumber: "မှတ်ပုံတင်နံပါတ်",
  addressLine: "လိပ်စာ",
  city: "မြို့",
  stateRegion: "တိုင်း/ပြည်နယ်",
  postalCode: "စာတိုက်နံပါတ်",
  language: "ဘာသာစကား",
  theme: "အသွင်အပြင် (Theme)",
  logout: "အကောင့်မှ ထွက်မည်",
  light: "လင်းသော",
  dark: "မှောင်သော",
  retry: "ပြန်ကြိုးစားမည်",
  invalidCredentials: "အီးမေးလ် သို့မဟုတ် စကားဝှက် မှားယွင်းနေပါသည်။",
  networkError: "အင်တာနက် လိုင်းမကောင်းပါ။ ချိတ်ဆက်မှုကို စစ်ဆေးပါ။",
  unknownError: "အမှားတစ်ခု ဖြစ်သွားသည်။ ပြန်ကြိုးစားကြည့်ပါ။",
  total: "စုစုပေါင်း",
  itemCount: "ခု",
  pullToRefresh: "အသစ်ပြန်ကြည့်ရန် အောက်သို့ဆွဲချပါ",
  notificationTitle: "အော်ဒါ အခြေအနေ",
  notificationMsg: "အော်ဒါ အခြေအနေ ပြောင်းလဲမှုရှိပါသည်။",
  notificationsCenterTitle: "အသိပေးချက်များ",
  notificationsEmpty: "အသိပေးချက် မရှိသေးပါ။",
  notificationsAll: "အားလုံး",
  notificationsUnread: "မဖတ်ရသေး",
  markAllRead: "အားလုံး ဖတ်ပြီး",
  pending: "စောင့်ဆိုင်းဆဲ",
  confirmed: "အတည်ပြုပြီး",
  shipped: "ပို့ဆောင်နေပြီ",
  delivered: "ရောက်ရှိပြီ",
  cancelled: "ပယ်ဖျက်ပြီး",
  refund_requested: "ငွေပြန်တောင်းခံထားသည်",
  refunded: "ငွေပြန်အမ်းပြီး",
  return_requested: "ပစ္စည်းပြန်အပ်ရန် တောင်းဆိုထားသည်",
  returned: "ပစ္စည်းပြန်အပ်ပြီး",
  orderActions: "လုပ်ဆောင်ချက်များ",
  cancelOrder: "အော်ဒါ ပယ်ဖျက်မည်",
  requestRefund: "ငွေပြန်တောင်းမည်",
  requestReturn: "ပစ္စည်းပြန်အပ်မည်",
  reasonPlaceholder: "အကြောင်းပြချက် ရေးပါ...",
  submitRequest: "တင်ပြမည်",
  orderCancelledSuccess: "အော်ဒါကို ပယ်ဖျက်လိုက်ပါပြီ။",
  refundRequestedSuccess: "ငွေပြန်တောင်းခံမှုကို လက်ခံရရှိပါသည်။",
  returnRequestedSuccess: "ပစ္စည်းပြန်အပ်မှုကို လက်ခံရရှိပါသည်။",
  supportTitle: "အကူအညီ (Chat)",
  supportSubtitle: "အကူအညီ လိုအပ်ပါက ကျွန်ုပ်တို့ကို စာပို့နိုင်ပါသည်။",
  supportEmpty: "မက်ဆေ့ခ်ျ မရှိသေးပါ။ အကူအညီတောင်းရန် စာစရေးပါ။",
  supportPlaceholder: "စာရိုက်ပါ...",
  supportAgent: "ဝန်ထမ်း",
  assignedTo: "တာဝန်ယူထားသူ",
  you: "သင်",
  loading: "တင်နေပါသည်...",
  phoneRequired: "ဖုန်းနံပါတ် အမှန်ဖြည့်ပေးပါ။",
  addressRequired: "လိပ်စာ ဖြည့်ပေးရန် လိုအပ်ပါသည်။",
  paymentSlipRequired: "ငွေလွှဲပြေစာ တင်ပေးပါ။",
  receiptTitle: "ပြေစာ",
  printReceipt: "ပြေစာ ထုတ်မည်",
  backToOrder: "အော်ဒါသို့ ပြန်သွားမည်",
  trackOrder: "အော်ဒါ အခြေအနေ ကြည့်မည်",
  soldLabel: "ရောင်းပြီး",
};

const dictionaries: Record<Locale, Dictionary> = { en, mm };

export function tr(locale: Locale, key: I18nKey): string {
  return dictionaries[locale][key] || dictionaries.en[key] || key;
}

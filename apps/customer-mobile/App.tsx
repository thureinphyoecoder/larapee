import "./global.css";

import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { BackHandler, Keyboard, LogBox, Pressable, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { BottomTabs } from "./src/components/BottomTabs";
import { LoadingView } from "./src/components/LoadingView";
import { useCustomerApp } from "./src/hooks/useCustomerApp";
import { AccountScreen } from "./src/screens/AccountScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrderDetailScreen } from "./src/screens/OrderDetailScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { NotificationsCenterScreen } from "./src/screens/NotificationsCenterScreen";
import { ProductDetailScreen } from "./src/screens/ProductDetailScreen";
import { SupportScreen } from "./src/screens/SupportScreen";

LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "expo-notifications: Android Push notifications",
  "`expo-notifications` functionality is not fully supported in Expo Go",
]);

export default function App() {
  const app = useCustomerApp();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!app.session?.token || !app.session.user) {
        return true;
      }

      if (app.detail.view !== "none") {
        app.detail.close();
        return true;
      }

      if (notificationCenterOpen) {
        setNotificationCenterOpen(false);
        return true;
      }

      if (app.activeTab !== "home") {
        app.setActiveTab("home");
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [app, notificationCenterOpen]);

  if (app.booting) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`} edges={["top", "bottom", "left", "right"]}>
          <LoadingView dark={app.dark} label="Preparing app..." />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!app.session?.token || !app.session.user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView className="flex-1 bg-slate-100" edges={["top", "bottom", "left", "right"]}>
          <StatusBar style="dark" />
          <LoginScreen
            locale={app.locale}
            registerName={app.login.registerName}
            registerConfirmPassword={app.login.registerConfirmPassword}
            email={app.login.email}
            password={app.login.password}
            busy={app.login.busy}
            error={app.login.error}
            message={app.login.message}
            onRegisterNameChange={app.login.setRegisterName}
            onRegisterConfirmPasswordChange={app.login.setRegisterConfirmPassword}
            onEmailChange={app.login.setEmail}
            onPasswordChange={app.login.setPassword}
            onSubmitLogin={() => void app.login.submit()}
            onSubmitRegister={() => void app.login.submitRegister()}
            onForgotPassword={() => void app.login.forgotPassword()}
            onResendVerification={() => void app.login.resendVerification()}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (app.detail.view === "product") {
    return (
      <SafeAreaProvider>
        <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`} edges={["top", "left", "right"]}>
          <StatusBar style={app.dark ? "light" : "dark"} />
          <ProductDetailScreen
            locale={app.locale}
            dark={app.dark}
            product={app.detail.product}
            busy={app.detail.busy}
            error={app.detail.error}
            reviewBusy={app.detail.reviewBusy}
            reviewError={app.detail.reviewError}
            reviewMessage={app.detail.reviewMessage}
            adding={app.catalog.addingProductId === app.detail.product?.id}
            onBack={app.detail.close}
            onOpenCart={() => {
              app.detail.close();
              app.setActiveTab("cart");
            }}
            cartCount={app.cartCount}
            onOpenProduct={(product) => void app.catalog.openProductDetail(product)}
            onAddToCart={(product, variantId, quantity) => void app.catalog.addToCart(product, variantId, quantity)}
            onSubmitReview={(rating, comment) => void app.detail.submitReview(rating, comment)}
          />
          <BottomTabs
            activeTab={app.activeTab}
            onChange={(tab) => {
              app.detail.close();
              app.setActiveTab(tab);
            }}
            items={app.tabItems}
            dark={app.dark}
            badges={{ cart: app.cartCount, orders: app.notificationsUnreadCount, support: app.supportUnreadCount }}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (app.detail.view === "order") {
    return (
      <SafeAreaProvider>
        <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`} edges={["top", "bottom", "left", "right"]}>
          <StatusBar style={app.dark ? "light" : "dark"} />
          <OrderDetailScreen
            locale={app.locale}
            dark={app.dark}
            order={app.detail.order}
            busy={app.detail.busy}
            error={app.detail.error}
            actionBusy={app.detail.actionBusy}
            actionMessage={app.detail.actionMessage}
            onCancelOrder={(reason) => void app.detail.cancelOrder(reason)}
            onRequestRefund={() => void app.detail.requestRefund()}
            onRequestReturn={(reason) => void app.detail.requestReturn(reason)}
            onBack={app.detail.close}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (app.detail.view === "checkout") {
    return (
      <SafeAreaProvider>
        <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`} edges={["top", "bottom", "left", "right"]}>
          <StatusBar style={app.dark ? "light" : "dark"} />
          <CheckoutScreen
            locale={app.locale}
            dark={app.dark}
            cartItems={app.cart.items}
            phone={app.cart.checkoutPhone}
            address={app.cart.checkoutAddress}
            paymentSlipUri={app.cart.checkoutSlipUri}
          qrData={app.cart.checkoutQrData}
          busy={app.cart.checkoutBusy}
          error={app.cart.checkoutError}
          removingItemId={app.cart.removingItemId}
          onPhoneChange={app.cart.setCheckoutPhone}
          onAddressChange={app.cart.setCheckoutAddress}
          onSlipUriChange={app.cart.setCheckoutSlipUri}
          onQrDataChange={app.cart.setCheckoutQrData}
          onRemoveItem={(cartItemId) => void app.cart.removeItem(cartItemId)}
          onBack={app.detail.close}
          onConfirm={() => void app.cart.confirmCheckout()}
        />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`} edges={["top", "left", "right"]}>
        <StatusBar style={app.dark ? "light" : "dark"} />

      {notificationCenterOpen ? (
        <NotificationsCenterScreen
          locale={app.locale}
          dark={app.dark}
          notifications={app.notifications.list}
          onClose={() => setNotificationCenterOpen(false)}
          onMarkAllRead={app.notifications.markAllRead}
          onOpenNotification={(notification) => {
            setNotificationCenterOpen(false);
            void app.notifications.open(notification);
          }}
        />
      ) : null}

      {!notificationCenterOpen && app.activeTab === "home" ? (
        <HomeScreen
          locale={app.locale}
          dark={app.dark}
          userName={app.session.user.name}
          query={app.catalog.query}
          categories={app.catalog.categories}
          activeCategoryId={app.catalog.activeCategoryId}
          products={app.catalog.products}
          addingProductId={app.catalog.addingProductId}
          refreshing={app.refreshing}
          onQueryChange={app.catalog.setQuery}
          onSelectCategory={app.catalog.setActiveCategoryId}
          onAddToCart={(product) => void app.catalog.addToCart(product)}
          onOpenProduct={(product) => void app.catalog.openProductDetail(product)}
          onRefresh={() => void app.refreshAll()}
          notificationsUnreadCount={app.allNotificationsCount}
          onOpenNotifications={() => setNotificationCenterOpen(true)}
        />
      ) : null}

      {!notificationCenterOpen && app.activeTab === "orders" ? (
        <OrdersScreen
          locale={app.locale}
          dark={app.dark}
          orders={app.orders}
          refreshing={app.refreshing}
          onOpenOrder={(orderId) => void app.detail.openOrderDetail(orderId)}
          onRefresh={() => void app.refreshAll()}
        />
      ) : null}

      {!notificationCenterOpen && app.activeTab === "cart" ? (
        <CartScreen
          locale={app.locale}
          dark={app.dark}
          cartItems={app.cart.items}
          removingItemId={app.cart.removingItemId}
          busyCheckout={app.cart.checkoutBusy}
          onCheckout={() => void app.cart.openCheckout()}
          onRemoveItem={(cartItemId) => void app.cart.removeItem(cartItemId)}
          onOpenProduct={(productId) => void app.catalog.openProductDetailById(productId)}
        />
      ) : null}

      {!notificationCenterOpen && app.activeTab === "support" ? (
        <SupportScreen
          locale={app.locale}
          dark={app.dark}
          userId={app.session.user.id}
          assignedStaffName={app.support.assignedStaffName}
          messages={app.support.messages}
          draft={app.support.draft}
          imageUri={app.support.imageUri}
          busy={app.support.busy}
          loadingMore={app.support.loadingMore}
          hasMore={app.support.hasMore}
          sending={app.support.sending}
          error={app.support.error}
          editingMessageId={app.support.editingMessageId}
          onDraftChange={app.support.setDraft}
          onImageUriChange={app.support.setImageUri}
          onSend={() => void app.support.send()}
          onRefresh={() => void app.support.refresh()}
          onLoadMore={() => void app.support.loadMore()}
          onStartEdit={(messageId) => app.support.startEdit(messageId)}
          onCancelEdit={app.support.cancelEdit}
          onDeleteMessage={(messageId) => void app.support.deleteMessage(messageId)}
        />
      ) : null}

      {!notificationCenterOpen && app.activeTab === "account" ? (
        <AccountScreen
          locale={app.locale}
          dark={app.dark}
          userName={app.session.user.name}
          userEmail={app.session.user.email}
          theme={app.theme}
          profileBusy={app.account.profileBusy}
          profileError={app.account.profileError}
          profileMessage={app.account.profileMessage}
          profileName={app.account.profileName}
          profileEmail={app.account.profileEmail}
          profilePhone={app.account.profilePhone}
          profileNrc={app.account.profileNrc}
          profileAddress={app.account.profileAddress}
          profileCity={app.account.profileCity}
          profileState={app.account.profileState}
          profilePostalCode={app.account.profilePostalCode}
          profilePhotoUrl={app.account.profilePhotoUrl}
          profilePhotoBusy={app.account.profilePhotoBusy}
          onProfileNameChange={app.account.setProfileName}
          onProfileEmailChange={app.account.setProfileEmail}
          onProfilePhoneChange={app.account.setProfilePhone}
          onProfileNrcChange={app.account.setProfileNrc}
          onProfileAddressChange={app.account.setProfileAddress}
          onProfileCityChange={app.account.setProfileCity}
          onProfileStateChange={app.account.setProfileState}
          onProfilePostalCodeChange={app.account.setProfilePostalCode}
          onUploadProfilePhoto={(uri) => void app.account.uploadProfilePhoto(uri)}
          onProfileAddressResolved={({ address, city, state }) => {
            app.account.setProfileAddress(address);
            if (typeof city === "string") app.account.setProfileCity(city);
            if (typeof state === "string") app.account.setProfileState(state);
          }}
          onSaveProfile={() => void app.account.saveProfile()}
          onToggleLocale={() => void app.account.toggleLocale()}
          onToggleTheme={() => void app.account.toggleTheme()}
          onLogout={() => void app.account.logout()}
        />
      ) : null}

        {!keyboardVisible && !notificationCenterOpen ? (
          <BottomTabs
            activeTab={app.activeTab}
            onChange={app.setActiveTab}
            items={app.tabItems}
            dark={app.dark}
            badges={{ cart: app.cartCount, orders: app.notificationsUnreadCount, support: app.supportUnreadCount }}
          />
        ) : null}

        {!notificationCenterOpen && app.notifications.banner ? (
          <Pressable
            onPress={() => {
              app.notifications.closeBanner();
              setNotificationCenterOpen(true);
            }}
            className={`absolute left-4 right-4 top-3 rounded-2xl border px-4 py-3 ${
              app.dark ? "border-orange-500/50 bg-slate-900" : "border-orange-300 bg-white"
            }`}
          >
            <Text className={`text-[11px] font-black uppercase ${app.dark ? "text-orange-300" : "text-orange-600"}`}>Notification</Text>
            <Text className={`mt-1 text-sm font-bold ${app.dark ? "text-slate-100" : "text-slate-900"}`}>{app.notifications.banner.title}</Text>
            <Text className={`text-sm ${app.dark ? "text-slate-300" : "text-slate-700"}`}>{app.notifications.banner.message}</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

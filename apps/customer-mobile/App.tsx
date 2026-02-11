import "./global.css";

import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";

import { BottomTabs } from "./src/components/BottomTabs";
import { LoadingView } from "./src/components/LoadingView";
import { useCustomerApp } from "./src/hooks/useCustomerApp";
import { AccountScreen } from "./src/screens/AccountScreen";
import { CartScreen } from "./src/screens/CartScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";

export default function App() {
  const app = useCustomerApp();

  if (app.booting) {
    return <LoadingView dark={app.dark} label="Preparing app..." />;
  }

  if (!app.session?.token || !app.session.user) {
    return (
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />
        <LoginScreen
          locale={app.locale}
          email={app.login.email}
          password={app.login.password}
          busy={app.login.busy}
          error={app.login.error}
          onEmailChange={app.login.setEmail}
          onPasswordChange={app.login.setPassword}
          onSubmit={() => void app.login.submit()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${app.dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <StatusBar style={app.dark ? "light" : "dark"} />

      {app.activeTab === "home" ? (
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
          onRefresh={() => void app.refreshAll()}
        />
      ) : null}

      {app.activeTab === "orders" ? (
        <OrdersScreen
          locale={app.locale}
          dark={app.dark}
          orders={app.orders}
          refreshing={app.refreshing}
          onRefresh={() => void app.refreshAll()}
        />
      ) : null}

      {app.activeTab === "cart" ? (
        <CartScreen
          locale={app.locale}
          dark={app.dark}
          cartItems={app.cart.items}
          busyCheckout={app.cart.checkoutBusy}
          onCheckout={() => void app.cart.checkout()}
        />
      ) : null}

      {app.activeTab === "account" ? (
        <AccountScreen
          locale={app.locale}
          dark={app.dark}
          userName={app.session.user.name}
          userEmail={app.session.user.email}
          theme={app.theme}
          onToggleLocale={() => void app.account.toggleLocale()}
          onToggleTheme={() => void app.account.toggleTheme()}
          onLogout={() => void app.account.logout()}
        />
      ) : null}

      <BottomTabs activeTab={app.activeTab} onChange={app.setActiveTab} items={app.tabItems} dark={app.dark} />
    </SafeAreaView>
  );
}

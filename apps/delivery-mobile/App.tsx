import "./global.css";

import Ionicons from "expo/node_modules/@expo/vector-icons/Ionicons";
import { StatusBar } from "expo-status-bar";
import { LogBox, Pressable, Text, View } from "react-native";
import { useEffect, useState, type ComponentProps } from "react";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingView } from "./src/components/LoadingView";
import { useDeliveryApp } from "./src/hooks/useDeliveryApp";
import { tr } from "./src/i18n/strings";
import { configureNotificationHandler } from "./src/lib/push";
import { LoginScreen } from "./src/screens/LoginScreen";
import { NotificationsScreen } from "./src/screens/NotificationsScreen";
import { OrderDetailScreen } from "./src/screens/OrderDetailScreen";
import { OrdersListScreen } from "./src/screens/OrdersListScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";

const APP_RELEASE = "v0.6.0";

type TabKey = "home" | "notifications" | "profile";

export default function App() {
  LogBox.ignoreLogs([
    "SafeAreaView has been deprecated",
    "expo-notifications: Android Push notifications",
    "`expo-notifications` functionality is not fully supported in Expo Go",
  ]);

  return (
    <SafeAreaProvider>
      <DeliveryAppShell />
    </SafeAreaProvider>
  );
}

function DeliveryAppShell() {
  const app = useDeliveryApp();
  const dark = app.theme === "dark";
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const insets = useSafeAreaInsets();

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  useEffect(() => {
    if (activeTab === "notifications") {
      app.notifications.markRead();
    }
  }, [activeTab]);

  if (app.booting) {
    return <LoadingView label={tr(app.locale, "appPreparing")} dark={dark} />;
  }

  if (!app.session.token || !app.session.user) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
        <StatusBar style={dark ? "light" : "dark"} />
        <LoginScreen
          locale={app.locale}
          release={APP_RELEASE}
          email={app.login.email}
          password={app.login.password}
          busy={app.login.busy}
          error={app.login.error}
          onEmailChange={app.login.setEmail}
          onPasswordChange={app.login.setPassword}
          onSubmit={() => void app.login.signIn()}
        />
      </SafeAreaView>
    );
  }

  if (app.orders.selected) {
    return (
      <SafeAreaView edges={["top", "bottom"]} className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
        <StatusBar style={dark ? "light" : "dark"} />
        <OrderDetailScreen
          locale={app.locale}
          order={app.orders.selected}
          busyAction={app.orders.actionBusy}
          actionMessage={app.orders.actionMessage}
          actionError={app.orders.actionError}
          refreshing={app.orders.refreshing}
          theme={app.theme}
          onBack={app.orders.closeOrder}
          onRefresh={() => void app.orders.refreshOrders()}
          onUpdateLocation={() => void app.orders.updateCurrentLocation()}
          onUploadProof={() => void app.orders.uploadProofAndMarkShipped()}
          onMarkDelivered={() => void app.orders.markDelivered()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <StatusBar style={dark ? "light" : "dark"} />

      {activeTab === "home" ? (
        <OrdersListScreen
          locale={app.locale}
          user={app.session.user}
          orders={app.orders.list}
          refreshing={app.orders.refreshing}
          theme={app.theme}
          unreadCount={app.notifications.unreadCount}
          onRefresh={() => void app.orders.refreshOrders()}
          onOpenOrder={(order) => void app.orders.openOrder(order)}
          onOpenNotifications={() => setActiveTab("notifications")}
        />
      ) : null}

      {activeTab === "notifications" ? (
        <NotificationsScreen
          locale={app.locale}
          theme={app.theme}
          notifications={app.notifications.list}
          onMarkAllRead={app.notifications.markRead}
          onOpenNotification={(notification) => {
            void app.notifications.openOrder(notification);
            setActiveTab("home");
          }}
        />
      ) : null}

      {activeTab === "profile" ? (
        <ProfileScreen
          locale={app.locale}
          theme={app.theme}
          user={app.session.user}
          profile={app.session.profile}
          salaryPreview={app.session.salaryPreview}
          onToggleTheme={app.actions.toggleTheme}
          onLogout={app.actions.logout}
          onSetLanguage={app.actions.setLanguage}
        />
      ) : null}

      <View
        className={`absolute left-4 right-4 flex-row rounded-3xl border p-2 ${dark ? "border-slate-700 bg-slate-900/95" : "border-slate-200 bg-white"}`}
        style={{ bottom: Math.max(insets.bottom + 8, 14) }}
      >
        <TabButton
          label={tr(app.locale, "tabHome")}
          icon="home-outline"
          active={activeTab === "home"}
          onPress={() => setActiveTab("home")}
          dark={dark}
        />
        <TabButton
          label={tr(app.locale, "tabNotifications")}
          icon="notifications-outline"
          active={activeTab === "notifications"}
          onPress={() => setActiveTab("notifications")}
          dark={dark}
          badge={app.notifications.unreadCount}
        />
        <TabButton
          label={tr(app.locale, "tabProfile")}
          icon="person-outline"
          active={activeTab === "profile"}
          onPress={() => setActiveTab("profile")}
          dark={dark}
        />
      </View>

      {app.notifications.banner ? (
        <Pressable
          onPress={() => {
            setActiveTab("notifications");
            app.notifications.closeBanner();
          }}
          className={`absolute left-4 right-4 rounded-2xl border px-4 py-3 shadow-lg ${
            dark ? "border-cyan-500/60 bg-slate-900" : "border-cyan-300 bg-white"
          }`}
          style={{ top: Math.max(insets.top + 10, 12) }}
        >
          <Text className={`text-xs font-black uppercase tracking-[1.2px] ${dark ? "text-cyan-300" : "text-cyan-700"}`}>
            {tr(app.locale, "notificationsTitle")}
          </Text>
          <Text className={`mt-1 text-sm font-black ${dark ? "text-white" : "text-slate-900"}`}>{app.notifications.banner.title}</Text>
          <Text className={`mt-0.5 text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>{app.notifications.banner.body}</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}

function TabButton({
  label,
  icon,
  active,
  dark,
  onPress,
  badge = 0,
}: {
  label: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  active: boolean;
  dark: boolean;
  onPress: () => void;
  badge?: number;
}) {
  return (
    <Pressable className={`relative flex-1 items-center rounded-2xl px-2 py-2.5 ${active ? (dark ? "bg-white" : "bg-slate-900") : "bg-transparent"}`} onPress={onPress}>
      <Ionicons name={icon} size={16} color={active ? (dark ? "#0f172a" : "#fff") : dark ? "#94a3b8" : "#64748b"} />
      <Text className={`mt-1 text-[11px] font-black ${active ? (dark ? "text-slate-900" : "text-white") : dark ? "text-slate-300" : "text-slate-600"}`}>{label}</Text>
      {badge > 0 ? (
        <View className="absolute right-3 top-1 min-w-5 rounded-full bg-rose-500 px-1">
          <Text className="text-center text-[10px] font-bold text-white">{badge > 99 ? "99+" : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

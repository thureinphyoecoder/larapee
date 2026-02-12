import Ionicons from "expo/node_modules/@expo/vector-icons/Ionicons";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type Locale, tr } from "../i18n/strings";
import { formatDateTime } from "../utils/formatters";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  orderId: number | null;
  kind: "new_order" | "status_changed";
  isRead: boolean;
};

type NotificationsScreenProps = {
  locale: Locale;
  theme: "dark" | "light";
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onOpenNotification: (notification: NotificationItem) => void;
};

export function NotificationsScreen({
  locale,
  theme,
  notifications,
  onMarkAllRead,
  onOpenNotification,
}: NotificationsScreenProps) {
  const dark = theme === "dark";
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const hasUnread = unreadCount > 0;

  const filteredNotifications = useMemo(
    () => (filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications),
    [filter, notifications],
  );

  return (
    <View className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 14,
          paddingTop: Math.max(12, insets.top + 4),
          paddingBottom: Math.max(120, insets.bottom + 100),
          gap: 10,
        }}
        ListHeaderComponent={
          <View className="mb-3 gap-3">
            <View className={`rounded-3xl border p-4 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className={`text-[30px] font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "notificationsTitle")}</Text>
                  <Text className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}>Delivery updates and status alerts</Text>
                </View>
                <Pressable
                  className={`rounded-full px-4 py-2 ${hasUnread ? (dark ? "bg-cyan-500/20" : "bg-cyan-50") : dark ? "bg-slate-800" : "bg-slate-100"}`}
                  onPress={onMarkAllRead}
                  disabled={!hasUnread}
                >
                  <Text className={`text-xs font-black ${hasUnread ? (dark ? "text-cyan-300" : "text-cyan-700") : dark ? "text-slate-400" : "text-slate-500"}`}>
                    {tr(locale, "markAllRead")}
                  </Text>
                </Pressable>
              </View>

              <View className="mt-4 flex-row gap-2">
                <SummaryTile label={tr(locale, "notificationsUnreadLabel")} value={unreadCount} dark={dark} tone="rose" />
                <SummaryTile label={tr(locale, "notificationsAllLabel")} value={notifications.length} dark={dark} tone="cyan" />
              </View>
            </View>

            <View className="flex-row gap-2">
              <FilterPill
                label={tr(locale, "notificationsFilterAll")}
                active={filter === "all"}
                dark={dark}
                onPress={() => setFilter("all")}
              />
              <FilterPill
                label={tr(locale, "notificationsFilterUnread")}
                active={filter === "unread"}
                dark={dark}
                onPress={() => setFilter("unread")}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className={`rounded-3xl border p-8 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <Text className={`text-center text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>{tr(locale, "noNotifications")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenNotification(item)}
            className={`rounded-3xl border p-4 ${
              item.isRead
                ? dark
                  ? "border-slate-800 bg-slate-900"
                  : "border-slate-200 bg-white"
                : dark
                  ? "border-cyan-500/40 bg-slate-900"
                  : "border-cyan-300 bg-cyan-50/70"
            }`}
          >
            <View className="flex-row items-start justify-between">
              <View className="mr-3 flex-1">
                <Text className={`text-sm font-black ${dark ? "text-white" : "text-slate-900"}`}>{item.title}</Text>
                <Text className={`mt-1 text-sm leading-5 ${dark ? "text-slate-300" : "text-slate-700"}`}>{item.body}</Text>
              </View>
              <View className={`rounded-xl px-2 py-1 ${item.kind === "new_order" ? "bg-emerald-500/20" : "bg-sky-500/20"}`}>
                <Text className={`text-[10px] font-black uppercase ${item.kind === "new_order" ? "text-emerald-300" : "text-sky-300"}`}>
                  {item.kind === "new_order" ? tr(locale, "notificationTypeOrder") : tr(locale, "notificationTypeStatus")}
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={12} color={dark ? "#94a3b8" : "#64748b"} />
                <Text className={`ml-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                  {item.createdAt ? formatDateTime(item.createdAt) : tr(locale, "notificationNow")}
                </Text>
              </View>
              {item.orderId ? (
                <Text className={`text-xs font-bold ${dark ? "text-cyan-300" : "text-cyan-700"}`}>
                  {tr(locale, "notificationOpenOrder")} #{item.orderId}
                </Text>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

function SummaryTile({
  label,
  value,
  dark,
  tone,
}: {
  label: string;
  value: number;
  dark: boolean;
  tone: "rose" | "cyan";
}) {
  const toneClass =
    tone === "rose"
      ? dark
        ? "border-rose-500/25 bg-rose-500/10"
        : "border-rose-200 bg-rose-50"
      : dark
        ? "border-cyan-500/25 bg-cyan-500/10"
        : "border-cyan-200 bg-cyan-50";

  const textClass = tone === "rose" ? (dark ? "text-rose-300" : "text-rose-700") : dark ? "text-cyan-300" : "text-cyan-700";

  return (
    <View className={`flex-1 rounded-2xl border px-3 py-3 ${toneClass}`}>
      <Text className={`text-[10px] font-black uppercase tracking-[1.3px] ${textClass}`}>{label}</Text>
      <Text className={`mt-1 text-2xl font-black ${textClass}`}>{value}</Text>
    </View>
  );
}

function FilterPill({
  label,
  active,
  dark,
  onPress,
}: {
  label: string;
  active: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${active ? (dark ? "bg-white" : "bg-slate-900") : dark ? "bg-slate-800" : "bg-white"}`}
    >
      <Text className={`text-xs font-black ${active ? (dark ? "text-slate-900" : "text-white") : dark ? "text-slate-300" : "text-slate-600"}`}>
        {label}
      </Text>
    </Pressable>
  );
}

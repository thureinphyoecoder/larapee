import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { tr } from "../i18n/strings";
import type { AppNotification, Locale } from "../types/domain";
import { formatDate } from "../utils/format";

type Props = {
  locale: Locale;
  dark: boolean;
  notifications: AppNotification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onOpenNotification: (notification: AppNotification) => void;
};

export function NotificationsCenterScreen({
  locale,
  dark,
  notifications,
  onClose,
  onMarkAllRead,
  onOpenNotification,
}: Props) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unreadCount = notifications.filter((item) => !item.isRead).length;
  const filtered = useMemo(
    () => (filter === "unread" ? notifications.filter((item) => !item.isRead) : notifications),
    [filter, notifications],
  );

  return (
    <View className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <View className={`border-b px-4 py-4 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <View className="flex-row items-center justify-between">
          <Text className={`text-xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "notificationsCenterTitle")}</Text>
          <Pressable onPress={onClose} className={`rounded-full px-3 py-1.5 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            <Text className={`text-xs font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "back")}</Text>
          </Pressable>
        </View>
        <View className="mt-3 flex-row gap-2">
          <View className={`flex-1 rounded-xl border px-3 py-2 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
            <Text className={`text-[11px] font-bold uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}>{tr(locale, "notificationsUnread")}</Text>
            <Text className={`mt-1 text-lg font-black ${dark ? "text-orange-300" : "text-orange-600"}`}>{unreadCount}</Text>
          </View>
          <View className={`flex-1 rounded-xl border px-3 py-2 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
            <Text className={`text-[11px] font-bold uppercase ${dark ? "text-slate-400" : "text-slate-500"}`}>{tr(locale, "itemCount")}</Text>
            <Text className={`mt-1 text-lg font-black ${dark ? "text-cyan-300" : "text-cyan-700"}`}>{notifications.length}</Text>
          </View>
        </View>
        <View className="mt-3 flex-row gap-2">
          <Pressable
            onPress={() => setFilter("all")}
            className={`rounded-full px-3 py-1.5 ${filter === "all" ? "bg-orange-600" : dark ? "bg-slate-800" : "bg-slate-100"}`}
          >
            <Text className={`text-xs font-bold ${filter === "all" ? "text-white" : dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "notificationsAll")}</Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter("unread")}
            className={`rounded-full px-3 py-1.5 ${filter === "unread" ? "bg-orange-600" : dark ? "bg-slate-800" : "bg-slate-100"}`}
          >
            <Text className={`text-xs font-bold ${filter === "unread" ? "text-white" : dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "notificationsUnread")}</Text>
          </Pressable>
          <Pressable onPress={onMarkAllRead} className={`ml-auto rounded-full px-3 py-1.5 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
            <Text className={`text-xs font-bold ${dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "markAllRead")}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 24, gap: 10 }}
        ListEmptyComponent={
          <View className={`rounded-2xl border p-5 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <Text className={`text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>{tr(locale, "notificationsEmpty")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onOpenNotification(item)}
            className={`rounded-2xl border p-4 ${
              item.isRead
                ? dark
                  ? "border-slate-700 bg-slate-900"
                  : "border-slate-200 bg-white"
                : dark
                  ? "border-orange-500/50 bg-slate-900"
                  : "border-orange-300 bg-orange-50"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <Text className={`text-sm font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>{item.title}</Text>
              {item.orderId ? (
                <Text className={`text-[11px] font-bold ${dark ? "text-cyan-300" : "text-cyan-700"}`}>#{item.orderId}</Text>
              ) : null}
            </View>
            <Text className={`mt-1 text-sm ${dark ? "text-slate-300" : "text-slate-700"}`}>{item.message}</Text>
            <Text className={`mt-2 text-xs ${dark ? "text-slate-500" : "text-slate-500"}`}>{formatDate(item.createdAt)}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

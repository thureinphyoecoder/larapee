import { RefreshControl, ScrollView, Text, View } from "react-native";
import { OrderCard } from "../components/OrderCard";
import { tr } from "../i18n/strings";
import type { CustomerOrder, Locale } from "../types/domain";

type Props = {
  locale: Locale;
  dark: boolean;
  orders: CustomerOrder[];
  refreshing: boolean;
  onRefresh: () => void;
};

export function OrdersScreen({ locale, dark, orders, refreshing, onRefresh }: Props) {
  return (
    <ScrollView
      className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}
      contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "ordersTitle")}</Text>

      <View className="mt-4 gap-3">
        {orders.length ? (
          orders.map((order) => <OrderCard key={order.id} order={order} dark={dark} />)
        ) : (
          <View className={`rounded-2xl border p-6 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <Text className={`${dark ? "text-slate-300" : "text-slate-500"}`}>{tr(locale, "ordersEmpty")}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

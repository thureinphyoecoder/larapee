import { Text, View } from "react-native";
import { StatusBadge } from "./StatusBadge";
import { formatDate, formatMoney } from "../utils/format";
import type { CustomerOrder } from "../types/domain";

type Props = {
  order: CustomerOrder;
  dark: boolean;
};

export function OrderCard({ order, dark }: Props) {
  return (
    <View className={`rounded-2xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className={`text-sm font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>{order.invoice_no || `Order #${order.id}`}</Text>
          <Text className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{formatDate(order.created_at)}</Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      <View className="mt-3 rounded-xl bg-slate-50 px-3 py-2">
        <Text className="text-[11px] uppercase tracking-wider text-slate-500">Total</Text>
        <Text className="text-base font-black text-slate-900">{formatMoney(order.total_amount)}</Text>
      </View>
    </View>
  );
}

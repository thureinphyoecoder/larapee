import { Pressable, ScrollView, Text, View } from "react-native";
import { tr } from "../i18n/strings";
import { formatMoney } from "../utils/format";
import type { CartItem, Locale } from "../types/domain";

type Props = {
  locale: Locale;
  dark: boolean;
  cartItems: CartItem[];
  busyCheckout: boolean;
  onCheckout: () => void;
};

export function CartScreen({ locale, dark, cartItems, busyCheckout, onCheckout }: Props) {
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);

  return (
    <ScrollView className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`} contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
      <Text className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "cartTitle")}</Text>

      <View className="mt-4 gap-3">
        {cartItems.length ? (
          cartItems.map((item) => (
            <View key={item.id} className={`rounded-2xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
              <Text className={`text-sm font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>{item.product?.name || `Item #${item.product_id}`}</Text>
              <Text className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {item.quantity} x {formatMoney(item.unit_price)}
              </Text>
              <Text className={`mt-2 text-sm font-black ${dark ? "text-orange-300" : "text-orange-600"}`}>{formatMoney(item.line_total)}</Text>
            </View>
          ))
        ) : (
          <View className={`rounded-2xl border p-6 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
            <Text className={`${dark ? "text-slate-300" : "text-slate-500"}`}>{tr(locale, "cartEmpty")}</Text>
          </View>
        )}
      </View>

      <View className={`mt-4 rounded-2xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <View className="flex-row items-center justify-between">
          <Text className={`${dark ? "text-slate-300" : "text-slate-500"}`}>{tr(locale, "subtotal")}</Text>
          <Text className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{formatMoney(subtotal)}</Text>
        </View>

        <Pressable
          disabled={busyCheckout || cartItems.length === 0}
          onPress={onCheckout}
          className={`mt-4 rounded-xl py-3 ${busyCheckout || cartItems.length === 0 ? "bg-slate-300" : "bg-orange-600"}`}
        >
          <Text className="text-center text-sm font-black text-white">{busyCheckout ? tr(locale, "checkingOut") : tr(locale, "checkout")}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

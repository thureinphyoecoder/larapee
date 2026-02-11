import { Pressable, Text, View } from "react-native";
import { formatMoney } from "../utils/format";
import type { Product } from "../types/domain";

type Props = {
  product: Product;
  onAdd: (product: Product) => void;
  adding: boolean;
  dark: boolean;
  addLabel: string;
  addingLabel: string;
};

export function ProductCard({ product, onAdd, adding, dark, addLabel, addingLabel }: Props) {
  return (
    <View className={`rounded-2xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
      <View className="mb-3 rounded-xl bg-orange-100/60 px-3 py-1 self-start">
        <Text className="text-[10px] font-bold uppercase text-orange-700">{product.shop?.name || "Shop"}</Text>
      </View>

      <Text className={`text-base font-black ${dark ? "text-slate-100" : "text-slate-900"}`}>{product.name}</Text>
      <Text className={`mt-1 text-xs ${dark ? "text-slate-300" : "text-slate-500"}`} numberOfLines={2}>
        {product.description || "Quality product from verified shop."}
      </Text>

      <View className="mt-4 flex-row items-center justify-between">
        <Text className={`text-base font-black ${dark ? "text-orange-300" : "text-orange-600"}`}>{formatMoney(product.price)}</Text>
        <Pressable onPress={() => onAdd(product)} disabled={adding} className="rounded-xl bg-orange-600 px-3 py-2">
          <Text className="text-xs font-bold text-white">{adding ? addingLabel : addLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

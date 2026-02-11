import { RefreshControl, ScrollView, Text, View } from "react-native";
import { CategoryPills } from "../components/CategoryPills";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { tr } from "../i18n/strings";
import type { Category, Locale, Product } from "../types/domain";

type Props = {
  locale: Locale;
  dark: boolean;
  userName: string;
  query: string;
  categories: Category[];
  activeCategoryId: number | null;
  products: Product[];
  addingProductId: number | null;
  refreshing: boolean;
  onQueryChange: (value: string) => void;
  onSelectCategory: (id: number | null) => void;
  onAddToCart: (product: Product) => void;
  onRefresh: () => void;
};

export function HomeScreen({
  locale,
  dark,
  userName,
  query,
  categories,
  activeCategoryId,
  products,
  addingProductId,
  refreshing,
  onQueryChange,
  onSelectCategory,
  onAddToCart,
  onRefresh,
}: Props) {
  return (
    <ScrollView
      className={`flex-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}
      contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className={`rounded-3xl p-5 ${dark ? "bg-slate-900" : "bg-white"}`}>
        <Text className={`text-sm font-semibold ${dark ? "text-slate-400" : "text-slate-500"}`}>{tr(locale, "welcomeBack")}</Text>
        <Text className={`mt-1 text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{userName}</Text>
        <Text className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{tr(locale, "pullToRefresh")}</Text>
      </View>

      <View className="mt-4">
        <SearchBar value={query} onChange={onQueryChange} placeholder={tr(locale, "searchPlaceholder")} dark={dark} />
      </View>

      <View className="mt-4">
        <Text className={`mb-2 text-sm font-black ${dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "categories")}</Text>
        <CategoryPills categories={categories} activeCategoryId={activeCategoryId} onSelect={onSelectCategory} dark={dark} />
      </View>

      <View className="mt-5">
        <Text className={`mb-2 text-sm font-black ${dark ? "text-slate-200" : "text-slate-700"}`}>{tr(locale, "featuredProducts")}</Text>
        <View className="gap-3">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              dark={dark}
              adding={addingProductId === product.id}
              onAdd={onAddToCart}
              addLabel={tr(locale, "addToCart")}
              addingLabel={tr(locale, "adding")}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

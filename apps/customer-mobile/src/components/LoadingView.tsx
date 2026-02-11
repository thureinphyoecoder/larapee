import { ActivityIndicator, Text, View } from "react-native";

export function LoadingView({ dark, label }: { dark: boolean; label: string }) {
  return (
    <View className={`flex-1 items-center justify-center ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <ActivityIndicator size="large" color={dark ? "#fb923c" : "#ea580c"} />
      <Text className={`mt-3 text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}>{label}</Text>
    </View>
  );
}

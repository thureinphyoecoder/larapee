import { ActivityIndicator, Text, View } from "react-native";

type LoadingViewProps = {
  label?: string;
  dark?: boolean;
};

export function LoadingView({ label = "ဖွင့်နေပါတယ်...", dark = false }: LoadingViewProps) {
  return (
    <View className={`flex-1 items-center justify-center px-6 ${dark ? "bg-slate-950" : "bg-slate-50"}`}>
      <View className={`rounded-3xl border px-8 py-8 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <ActivityIndicator size="large" color={dark ? "#22d3ee" : "#0f172a"} />
        <Text className={`mt-3 text-sm ${dark ? "text-slate-300" : "text-slate-500"}`}>{label}</Text>
      </View>
    </View>
  );
}

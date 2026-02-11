import { Pressable, Text, View } from "react-native";
import { tr } from "../i18n/strings";
import type { Locale, ThemeMode } from "../types/domain";

type Props = {
  locale: Locale;
  dark: boolean;
  userName: string;
  userEmail: string;
  theme: ThemeMode;
  onToggleLocale: () => void;
  onToggleTheme: () => void;
  onLogout: () => void;
};

export function AccountScreen({
  locale,
  dark,
  userName,
  userEmail,
  theme,
  onToggleLocale,
  onToggleTheme,
  onLogout,
}: Props) {
  return (
    <View className={`flex-1 px-4 pt-4 ${dark ? "bg-slate-950" : "bg-slate-100"}`}>
      <Text className={`text-2xl font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "accountTitle")}</Text>

      <View className={`mt-4 rounded-2xl border p-5 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <Text className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{userName}</Text>
        <Text className={`mt-1 text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{userEmail}</Text>
      </View>

      <View className={`mt-3 rounded-2xl border p-4 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <Row label={tr(locale, "language")} value={locale.toUpperCase()} onPress={onToggleLocale} dark={dark} />
        <Row label={tr(locale, "theme")} value={theme === "dark" ? tr(locale, "dark") : tr(locale, "light")} onPress={onToggleTheme} dark={dark} />
      </View>

      <Pressable onPress={onLogout} className="mt-4 rounded-xl bg-rose-600 py-3">
        <Text className="text-center text-sm font-black text-white">{tr(locale, "logout")}</Text>
      </Pressable>
    </View>
  );
}

function Row({ label, value, onPress, dark }: { label: string; value: string; onPress: () => void; dark: boolean }) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center justify-between py-3">
      <Text className={`text-sm font-semibold ${dark ? "text-slate-300" : "text-slate-600"}`}>{label}</Text>
      <Text className={`text-sm font-black ${dark ? "text-orange-300" : "text-orange-600"}`}>{value}</Text>
    </Pressable>
  );
}

import Ionicons from "expo/node_modules/@expo/vector-icons/Ionicons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type Locale, tr } from "../i18n/strings";
import type { ApiUser, SalaryPreview, StaffProfile } from "../types/domain";
import { formatMMK } from "../utils/formatters";

type ProfileScreenProps = {
  locale: Locale;
  theme: "dark" | "light";
  user: ApiUser;
  profile: StaffProfile | null;
  salaryPreview: SalaryPreview | null;
  onToggleTheme: () => void;
  onLogout: () => void;
  onSetLanguage: (locale: Locale) => void;
};

export function ProfileScreen({ locale, theme, user, profile, salaryPreview, onToggleTheme, onLogout, onSetLanguage }: ProfileScreenProps) {
  const dark = theme === "dark";
  const insets = useSafeAreaInsets();

  return (
    <View className={`flex-1 px-4 ${dark ? "bg-slate-950" : "bg-slate-100"}`} style={{ paddingTop: Math.max(12, insets.top + 4), paddingBottom: Math.max(110, insets.bottom + 90) }}>
      <View className={`rounded-3xl border p-4 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className={`text-[30px] font-black ${dark ? "text-white" : "text-slate-900"}`}>{tr(locale, "profileTitle")}</Text>
            <Text className={`mt-1 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>Driver account and working preferences</Text>
          </View>
          <View className={`h-12 w-12 items-center justify-center rounded-2xl ${dark ? "bg-cyan-500/15" : "bg-cyan-100"}`}>
            <Ionicons name="person-outline" size={22} color={dark ? "#67e8f9" : "#0e7490"} />
          </View>
        </View>

        <View className={`mt-4 rounded-2xl px-3 py-3 ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
          <Text className={`text-lg font-black ${dark ? "text-white" : "text-slate-900"}`}>{user.name}</Text>
          <Text className={`mt-0.5 text-sm ${dark ? "text-slate-300" : "text-slate-600"}`}>{user.email}</Text>
          <Text className={`mt-2 text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{tr(locale, "role")}: {user.roles?.join(", ") || "-"}</Text>
          <Text className={`text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{tr(locale, "shop")}: {profile?.shop_name || "-"}</Text>
          <Text className={`text-xs ${dark ? "text-slate-300" : "text-slate-600"}`}>{tr(locale, "phone")}: {profile?.phone_number || "-"}</Text>
        </View>
      </View>

      <View className={`mt-3 rounded-3xl border p-4 ${dark ? "border-emerald-800 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"}`}>
        <Text className={`text-[11px] font-black uppercase tracking-[1.4px] ${dark ? "text-emerald-300" : "text-emerald-700"}`}>{tr(locale, "salaryPreview")}</Text>
        <Text className={`mt-2 text-3xl font-black ${dark ? "text-emerald-200" : "text-emerald-700"}`}>{formatMMK(salaryPreview?.net_salary || 0)}</Text>
      </View>

      <View className={`mt-3 rounded-3xl border p-4 ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"}`}>
        <Text className={`mb-2 text-[11px] font-black uppercase tracking-[1.4px] ${dark ? "text-slate-400" : "text-slate-600"}`}>{tr(locale, "language")}</Text>
        <View className="flex-row gap-2">
          <Pressable className={`flex-1 flex-row items-center justify-center rounded-2xl px-3 py-3 ${locale === "en" ? "bg-cyan-500" : dark ? "bg-slate-800" : "bg-slate-100"}`} onPress={() => onSetLanguage("en")}>
            <Ionicons name="globe-outline" size={14} color={locale === "en" ? "#fff" : dark ? "#e2e8f0" : "#334155"} />
            <Text className={`ml-1 text-xs font-black ${locale === "en" ? "text-white" : dark ? "text-slate-100" : "text-slate-700"}`}>English</Text>
          </Pressable>
          <Pressable className={`flex-1 flex-row items-center justify-center rounded-2xl px-3 py-3 ${locale === "mm" ? "bg-cyan-500" : dark ? "bg-slate-800" : "bg-slate-100"}`} onPress={() => onSetLanguage("mm")}>
            <Ionicons name="language-outline" size={14} color={locale === "mm" ? "#fff" : dark ? "#e2e8f0" : "#334155"} />
            <Text className={`ml-1 text-xs font-black ${locale === "mm" ? "text-white" : dark ? "text-slate-100" : "text-slate-700"}`}>မြန်မာ</Text>
          </Pressable>
        </View>
      </View>

      <View className="mt-3 flex-row gap-2">
        <Pressable className={`flex-1 flex-row items-center justify-center rounded-2xl px-4 py-3.5 ${dark ? "bg-slate-800" : "bg-white"}`} onPress={onToggleTheme}>
          <Ionicons name={dark ? "sunny-outline" : "moon-outline"} size={15} color={dark ? "#e2e8f0" : "#334155"} />
          <Text className={`ml-1 text-sm font-black ${dark ? "text-slate-100" : "text-slate-700"}`}>{dark ? tr(locale, "lightMode") : tr(locale, "darkMode")}</Text>
        </Pressable>
        <Pressable className="flex-1 flex-row items-center justify-center rounded-2xl bg-rose-500 px-4 py-3.5" onPress={onLogout}>
          <Ionicons name="log-out-outline" size={15} color="#fff" />
          <Text className="ml-1 text-sm font-black text-white">{tr(locale, "logout")}</Text>
        </Pressable>
      </View>
    </View>
  );
}

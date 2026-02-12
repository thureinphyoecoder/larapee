import Ionicons from "expo/node_modules/@expo/vector-icons/Ionicons";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, TextInput, View } from "react-native";

import { type Locale, tr } from "../i18n/strings";

type LoginScreenProps = {
  locale: Locale;
  release: string;
  email: string;
  password: string;
  busy: boolean;
  error: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
};

export function LoginScreen(props: LoginScreenProps) {
  const { locale, release, email, password, busy, error, onEmailChange, onPasswordChange, onSubmit } = props;
  const [showHelp, setShowHelp] = useState(false);

  return (
    <View className="flex-1 justify-center bg-slate-950 px-5">
      <View className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-cyan-500/20" />
      <View className="absolute -right-16 top-48 h-56 w-56 rounded-full bg-indigo-500/20" />
      <View className="absolute left-8 right-8 bottom-12 h-32 rounded-full bg-emerald-500/10" />

      <View className="overflow-hidden rounded-[28px] border border-white/20 bg-slate-900/95">
        <View className="border-b border-white/10 px-5 pb-4 pt-5">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-[30px] font-black text-white">LaraPee Delivery</Text>
              <Text className="mt-1 text-sm text-slate-300">{tr(locale, "loginSubtitle")}</Text>
            </View>
            <View className="rounded-xl bg-cyan-500/20 px-3 py-2">
              <Ionicons name="bicycle" size={18} color="#67e8f9" />
            </View>
          </View>
          <Text className="mt-3 text-xs font-bold uppercase tracking-[1.5px] text-cyan-300">{release}</Text>
        </View>

        <View className="gap-4 px-5 py-5">
          <View>
            <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.4px] text-slate-300">{tr(locale, "loginEmail")}</Text>
            <View className="flex-row items-center rounded-2xl border border-slate-700 bg-slate-800/90 px-3">
              <Ionicons name="mail-outline" size={16} color="#94a3b8" />
              <TextInput
                className="ml-2 flex-1 py-3.5 text-sm text-white"
                value={email}
                onChangeText={onEmailChange}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="you@example.com"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          <View>
            <Text className="mb-1.5 text-[11px] font-bold uppercase tracking-[1.4px] text-slate-300">{tr(locale, "loginPassword")}</Text>
            <View className="flex-row items-center rounded-2xl border border-slate-700 bg-slate-800/90 px-3">
              <Ionicons name="lock-closed-outline" size={16} color="#94a3b8" />
              <TextInput
                className="ml-2 flex-1 py-3.5 text-sm text-white"
                value={password}
                onChangeText={onPasswordChange}
                secureTextEntry
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
              />
            </View>
          </View>

          {error ? (
            <View className="rounded-2xl border border-rose-300/60 bg-rose-100 px-3 py-2.5">
              <Text className="text-sm font-semibold text-rose-700">{error}</Text>
            </View>
          ) : null}

          <Pressable
            className={`items-center rounded-2xl px-4 py-3.5 ${busy ? "bg-cyan-300" : "bg-cyan-500"}`}
            disabled={busy}
            onPress={onSubmit}
          >
            {busy ? <ActivityIndicator size="small" color="#0f172a" /> : <Text className="text-sm font-black text-slate-900">{tr(locale, "loginButton")}</Text>}
          </Pressable>

          <Pressable onPress={() => setShowHelp((prev) => !prev)}>
            <Text className="text-center text-xs font-semibold text-slate-300">{showHelp ? tr(locale, "loginHelpHide") : tr(locale, "loginHelpShow")}</Text>
          </Pressable>

          {showHelp ? (
            <View className="rounded-2xl border border-cyan-300/30 bg-cyan-900/30 p-3">
              <Text className="text-xs leading-5 text-cyan-100">{tr(locale, "loginHelpText")}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

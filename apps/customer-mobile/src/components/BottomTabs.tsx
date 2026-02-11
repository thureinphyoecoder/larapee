import { Pressable, Text, View } from "react-native";
import type { CustomerTab } from "../types/domain";

type TabItem = {
  key: CustomerTab;
  label: string;
};

type Props = {
  activeTab: CustomerTab;
  onChange: (tab: CustomerTab) => void;
  items: TabItem[];
  dark: boolean;
};

export function BottomTabs({ activeTab, onChange, items, dark }: Props) {
  return (
    <View className={`mx-4 mb-4 flex-row rounded-2xl p-2 ${dark ? "bg-slate-900" : "bg-white"}`}>
      {items.map((item) => {
        const active = activeTab === item.key;

        return (
          <Pressable
            key={item.key}
            onPress={() => onChange(item.key)}
            className={`flex-1 items-center rounded-xl px-2 py-3 ${active ? "bg-orange-600" : "bg-transparent"}`}
          >
            <Text className={`text-xs font-bold ${active ? "text-white" : dark ? "text-slate-300" : "text-slate-600"}`}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

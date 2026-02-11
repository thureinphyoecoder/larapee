import { TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  dark: boolean;
};

export function SearchBar({ value, onChange, placeholder, dark }: Props) {
  return (
    <View className={`rounded-2xl border px-4 py-2 ${dark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white"}`}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={dark ? "#94a3b8" : "#9ca3af"}
        value={value}
        onChangeText={onChange}
        className={`${dark ? "text-slate-100" : "text-slate-900"}`}
      />
    </View>
  );
}

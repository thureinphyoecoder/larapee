import { Text } from "react-native";

export function StatusBadge({ status }: { status: string }) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "pending") {
    return <Text className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase text-amber-700">Pending</Text>;
  }

  if (normalized === "confirmed") {
    return <Text className="rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase text-sky-700">Confirmed</Text>;
  }

  if (normalized === "shipped") {
    return <Text className="rounded-full bg-indigo-100 px-3 py-1 text-[10px] font-black uppercase text-indigo-700">Shipped</Text>;
  }

  if (normalized === "delivered") {
    return <Text className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">Delivered</Text>;
  }

  if (normalized === "cancelled") {
    return <Text className="rounded-full bg-rose-100 px-3 py-1 text-[10px] font-black uppercase text-rose-700">Cancelled</Text>;
  }

  return <Text className="rounded-full bg-slate-200 px-3 py-1 text-[10px] font-black uppercase text-slate-700">{status}</Text>;
}

import { requestJson } from "../lib/http";

export type AddressSuggestion = {
  label: string;
  township?: string | null;
  state?: string | null;
};

type SuggestionsResponse = {
  data: AddressSuggestion[];
};

export async function fetchAddressSuggestions(baseUrl: string, q: string, limit = 8): Promise<AddressSuggestion[]> {
  const keyword = q.trim();
  if (keyword.length < 2) {
    return [];
  }

  const params = new URLSearchParams();
  params.set("q", keyword);
  params.set("limit", String(limit));

  try {
    const payload = await requestJson<SuggestionsResponse>({
      baseUrl,
      path: `/addresses/suggest?${params.toString()}`,
      method: "GET",
    });

    const remote = payload.data || [];
    if (remote.length) {
      return remote;
    }
  } catch {
    // Fallback below.
  }

  return localFallbackSuggestions(keyword, limit);
}

function localFallbackSuggestions(q: string, limit: number): AddressSuggestion[] {
  const rows: AddressSuggestion[] = [
    { label: "ရန်ကုန်, ရန်ကုန်တိုင်း", township: "ရန်ကုန်", state: "ရန်ကုန်တိုင်း" },
    { label: "လှိုင်, ရန်ကုန်တိုင်း", township: "လှိုင်", state: "ရန်ကုန်တိုင်း" },
    { label: "သင်္ဃန်းကျွန်း, ရန်ကုန်တိုင်း", township: "သင်္ဃန်းကျွန်း", state: "ရန်ကုန်တိုင်း" },
    { label: "မရမ်းကုန်း, ရန်ကုန်တိုင်း", township: "မရမ်းကုန်း", state: "ရန်ကုန်တိုင်း" },
    { label: "တာမွေ, ရန်ကုန်တိုင်း", township: "တာမွေ", state: "ရန်ကုန်တိုင်း" },
    { label: "မန္တလေး, မန္တလေးတိုင်း", township: "မန္တလေး", state: "မန္တလေးတိုင်း" },
    { label: "အမရပူရ, မန္တလေးတိုင်း", township: "အမရပူရ", state: "မန္တလေးတိုင်း" },
    { label: "နေပြည်တော်, ပြည်ထောင်စုနယ်မြေ", township: "နေပြည်တော်", state: "ပြည်ထောင်စုနယ်မြေ" },
    { label: "တောင်ကြီး, ရှမ်းပြည်နယ်", township: "တောင်ကြီး", state: "ရှမ်းပြည်နယ်" },
    { label: "မော်လမြိုင်, မွန်ပြည်နယ်", township: "မော်လမြိုင်", state: "မွန်ပြည်နယ်" },
  ];

  const needle = q.toLowerCase();
  return rows
    .filter((item) => item.label.toLowerCase().includes(needle))
    .slice(0, limit);
}

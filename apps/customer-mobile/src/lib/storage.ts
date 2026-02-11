import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthSession, Locale, ThemeMode } from "../types/domain";

const TOKEN_KEY = "larapee.customer.token";
const USER_KEY = "larapee.customer.user";
const LOCALE_KEY = "larapee.customer.locale";
const THEME_KEY = "larapee.customer.theme";

export async function loadSession(): Promise<AuthSession | null> {
  const [token, user] = await Promise.all([AsyncStorage.getItem(TOKEN_KEY), AsyncStorage.getItem(USER_KEY)]);

  if (!token || !user) return null;

  try {
    return {
      token,
      user: JSON.parse(user),
    };
  } catch {
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await Promise.all([
    AsyncStorage.setItem(TOKEN_KEY, session.token),
    AsyncStorage.setItem(USER_KEY, JSON.stringify(session.user)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
}

export async function loadLocale(): Promise<Locale> {
  const locale = await AsyncStorage.getItem(LOCALE_KEY);
  return locale === "mm" ? "mm" : "en";
}

export async function saveLocale(locale: Locale): Promise<void> {
  await AsyncStorage.setItem(LOCALE_KEY, locale);
}

export async function loadTheme(): Promise<ThemeMode> {
  const theme = await AsyncStorage.getItem(THEME_KEY);
  return theme === "dark" ? "dark" : "light";
}

export async function saveTheme(theme: ThemeMode): Promise<void> {
  await AsyncStorage.setItem(THEME_KEY, theme);
}

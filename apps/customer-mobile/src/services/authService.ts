import { requestJson } from "../lib/http";
import type { ApiUser, AuthSession } from "../types/domain";

type LoginResponse = {
  token: string;
  user: ApiUser;
};

export async function signIn(baseUrl: string, email: string, password: string): Promise<AuthSession> {
  const payload = await requestJson<LoginResponse>({
    baseUrl,
    path: "/auth/login",
    method: "POST",
    body: {
      email,
      password,
      device_name: "larapee-customer-mobile",
    },
  });

  return {
    token: payload.token,
    user: payload.user,
  };
}

export async function logout(baseUrl: string, token: string): Promise<void> {
  await requestJson({
    baseUrl,
    path: "/auth/logout",
    method: "POST",
    token,
  });
}

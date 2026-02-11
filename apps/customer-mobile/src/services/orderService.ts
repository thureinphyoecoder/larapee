import { requestJson } from "../lib/http";
import { fallbackOrders } from "../mocks/data";
import type { ApiListResponse, CustomerOrder } from "../types/domain";

export async function fetchOrders(baseUrl: string, token: string): Promise<CustomerOrder[]> {
  try {
    const payload = await requestJson<ApiListResponse<CustomerOrder>>({
      baseUrl,
      path: "/orders",
      method: "GET",
      token,
    });

    return payload.data ?? [];
  } catch {
    return fallbackOrders;
  }
}

export async function placeOrderFromCart(baseUrl: string, token: string): Promise<void> {
  await requestJson({
    baseUrl,
    path: "/orders",
    method: "POST",
    token,
    body: {},
  });
}

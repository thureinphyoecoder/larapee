import { requestFormData, requestJson } from "../lib/http";
import type { SupportMessagesPayload } from "../types/domain";

export async function fetchSupportMessages(baseUrl: string, token: string, page = 1): Promise<SupportMessagesPayload> {
  return requestJson<SupportMessagesPayload>({
    baseUrl,
    path: `/support/messages?message_page=${page}`,
    method: "GET",
    token,
  });
}

export async function sendSupportMessage(baseUrl: string, token: string, message: string, imageUri?: string | null): Promise<void> {
  const formData = new FormData();

  if (message.trim()) {
    formData.append("message", message.trim());
  }

  if (imageUri) {
    const fileName = imageUri.split("/").pop() || `support-${Date.now()}.jpg`;
    formData.append("image", {
      uri: imageUri,
      name: fileName,
      type: "image/jpeg",
    } as any);
  }

  await requestFormData({
    baseUrl,
    path: "/support/messages",
    method: "POST",
    token,
    body: formData,
  });
}

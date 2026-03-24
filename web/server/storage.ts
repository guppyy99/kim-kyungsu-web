// 파일 스토리지 — Supabase Storage 사용
// Manus 환경에서는 Forge API, 그 외에는 Supabase Storage 버킷 사용

import { ENV } from "./_core/env";
import { getSupabase } from "./db";

const BUCKET = "uploads";

/**
 * Manus Forge API 사용 가능 여부
 */
function hasForgeStorage(): boolean {
  return !!(ENV.forgeApiUrl && ENV.forgeApiKey);
}

// ─── Supabase Storage ───

async function supabasePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const sb = getSupabase();
  if (!sb) throw new Error("DB 연결 실패: Supabase 클라이언트 없음");

  const key = relKey.replace(/^\/+/, "");
  const fileData = typeof data === "string" ? new TextEncoder().encode(data) : data;

  const { error } = await sb.storage.from(BUCKET).upload(key, fileData, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: urlData.publicUrl };
}

async function supabaseGetUrl(relKey: string): Promise<{ key: string; url: string }> {
  const sb = getSupabase();
  if (!sb) throw new Error("DB 연결 실패: Supabase 클라이언트 없음");

  const key = relKey.replace(/^\/+/, "");
  const { data } = sb.storage.from(BUCKET).getPublicUrl(key);
  return { key, url: data.publicUrl };
}

// ─── Manus Forge API (레거시) ───

function forgePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const baseUrl = ENV.forgeApiUrl!.replace(/\/+$/, "");
  const apiKey = ENV.forgeApiKey!;
  const key = relKey.replace(/^\/+/, "");

  const uploadUrl = new URL("v1/storage/upload", baseUrl + "/");
  uploadUrl.searchParams.set("path", key);

  const blob =
    typeof data === "string"
      ? new Blob([data], { type: contentType })
      : new Blob([data as any], { type: contentType });
  const form = new FormData();
  form.append("file", blob, key.split("/").pop() ?? key);

  return fetch(uploadUrl, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  }).then(async (res) => {
    if (!res.ok) {
      const msg = await res.text().catch(() => res.statusText);
      throw new Error(`Storage upload failed (${res.status}): ${msg}`);
    }
    const url = (await res.json()).url;
    return { key, url };
  });
}

async function forgeGetUrl(relKey: string): Promise<{ key: string; url: string }> {
  const baseUrl = ENV.forgeApiUrl!.replace(/\/+$/, "");
  const apiKey = ENV.forgeApiKey!;
  const key = relKey.replace(/^\/+/, "");

  const downloadUrl = new URL("v1/storage/downloadUrl", baseUrl + "/");
  downloadUrl.searchParams.set("path", key);
  const res = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const url = (await res.json()).url;
  return { key, url };
}

// ─── Public API ───

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  if (hasForgeStorage()) {
    return forgePut(relKey, data, contentType);
  }
  return supabasePut(relKey, data, contentType);
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  if (hasForgeStorage()) {
    return forgeGetUrl(relKey);
  }
  return supabaseGetUrl(relKey);
}

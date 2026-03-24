import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { ENV } from './_core/env';

let _sb: SupabaseClient | null = null;

/**
 * Supabase 클라이언트 반환 (REST API 기반)
 * PostgreSQL pooler 연결 대신 Supabase REST API 사용
 */
export function getSupabase(): SupabaseClient | null {
  if (!_sb) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn("[Database] SUPABASE_URL 또는 SUPABASE_ANON_KEY 미설정");
      return null;
    }
    _sb = createClient(url, key);
  }
  return _sb;
}

// 기존 Drizzle 호환 별칭 — 라우터에서 null 체크용
export async function getDb() {
  return getSupabase();
}

export async function upsertUser(user: {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  lastSignedIn?: Date;
}): Promise<void> {
  const sb = getSupabase();
  if (!sb) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const now = new Date().toISOString();
  const role = user.role ?? (user.openId === ENV.ownerOpenId ? 'admin' : 'user');

  // Check if user exists
  const { data: existing } = await sb
    .from("users")
    .select("id")
    .eq("openId", user.openId)
    .limit(1)
    .single();

  if (!existing) {
    await sb.from("users").insert({
      openId: user.openId,
      name: user.name ?? null,
      email: user.email ?? null,
      loginMethod: user.loginMethod ?? null,
      role,
      lastSignedIn: user.lastSignedIn?.toISOString() ?? now,
    });
  } else {
    const updateSet: Record<string, unknown> = { lastSignedIn: user.lastSignedIn?.toISOString() ?? now };
    if (user.name !== undefined) updateSet.name = user.name;
    if (user.email !== undefined) updateSet.email = user.email;
    if (user.loginMethod !== undefined) updateSet.loginMethod = user.loginMethod;
    if (user.role !== undefined) updateSet.role = user.role;
    else if (user.openId === ENV.ownerOpenId) updateSet.role = 'admin';

    await sb.from("users").update(updateSet).eq("openId", user.openId);
  }
}

export async function getUserByOpenId(openId: string) {
  const sb = getSupabase();
  if (!sb) return undefined;

  const { data } = await sb
    .from("users")
    .select("*")
    .eq("openId", openId)
    .limit(1)
    .single();

  return data ?? undefined;
}

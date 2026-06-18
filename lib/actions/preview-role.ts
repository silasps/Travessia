"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PREVIEW_RESIDENTE_COOKIE } from "@/lib/residente-preview";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";
const COOKIE = "pt_preview_role";
const OPTS = { path: "/painel", httpOnly: true, sameSite: "lax" as const };
const RESIDENTE_OPTS = { path: "/", httpOnly: true, sameSite: "lax" as const };

export async function setPreviewRole(role: string) {
  if (DEV_MODE) {
    const store = await cookies();
    store.set(COOKIE, role, OPTS);
    store.delete(PREVIEW_RESIDENTE_COOKIE);
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (roleRow?.role !== "super_admin") return;

  const store = await cookies();
  store.set(COOKIE, role, OPTS);
  store.delete(PREVIEW_RESIDENTE_COOKIE);
}

export async function clearPreviewRole() {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function setPreviewResidente(residenteId: string) {
  if (DEV_MODE) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!roleRow) return;

  const { data: residente } = await supabase
    .from("residentes")
    .select("id")
    .eq("id", residenteId)
    .single();
  if (!residente) return;

  const store = await cookies();
  store.set(PREVIEW_RESIDENTE_COOKIE, residenteId, RESIDENTE_OPTS);
  store.delete(COOKIE);
}

export async function clearPreviewResidente() {
  const store = await cookies();
  store.delete(PREVIEW_RESIDENTE_COOKIE);
}

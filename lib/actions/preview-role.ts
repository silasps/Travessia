"use server";

import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";
const COOKIE = "pt_preview_role";
const OPTS = { path: "/painel", httpOnly: true, sameSite: "lax" as const };

export async function setPreviewRole(role: string) {
  if (DEV_MODE) {
    const store = await cookies();
    store.set(COOKIE, role, OPTS);
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
}

export async function clearPreviewRole() {
  const store = await cookies();
  store.delete(COOKIE);
}

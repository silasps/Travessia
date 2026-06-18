"use server";

import { createAdminClient } from "@/lib/supabase/server";

export async function notificarStaffPorRole(
  roles: string[],
  type: string,
  payload: Record<string, unknown>,
  excludeUserId?: string,
) {
  const admin = await createAdminClient();
  const { data: staffRoles } = await admin
    .from("staff_roles")
    .select("user_id")
    .in("role", roles as ("super_admin" | "coordenacao" | "tecnico" | "cuidador")[]);

  if (!staffRoles?.length) return;

  const destinatarios = excludeUserId
    ? staffRoles.filter((r) => r.user_id !== excludeUserId)
    : staffRoles;

  if (!destinatarios.length) return;

  await admin.from("notifications").insert(
    destinatarios.map((r) => ({
      recipient_user_id: r.user_id,
      type,
      payload,
      read_at: null,
    }))
  );
}

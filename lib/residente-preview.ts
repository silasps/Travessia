import { cookies } from "next/headers";
import type { createClient } from "@/lib/supabase/server";

export const PREVIEW_RESIDENTE_COOKIE = "pt_preview_residente_id";

export async function getPreviewResidenteId(): Promise<string | null> {
  const store = await cookies();
  return store.get(PREVIEW_RESIDENTE_COOKIE)?.value ?? null;
}

/**
 * Resolve o acesso de um usuário autenticado ao portal do acolhido.
 * - Membro da equipe (staff_roles existe): residenteId vem do cookie de preview
 *   (null = nenhum acolhido escolhido ainda → quem chamou deve cair no mock).
 * - Acolhido real (residente_portals ativo): residenteId é o dele mesmo.
 * - Sem acesso: retorna null (quem chamou deve redirecionar para /login).
 */
export async function resolveResidenteAcesso(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<{ residenteId: string | null } | null> {
  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (roleRow) {
    return { residenteId: await getPreviewResidenteId() };
  }

  const { data: portal } = await supabase
    .from("residente_portals")
    .select("residente_id, is_active")
    .eq("user_id", userId)
    .single();

  if (!portal?.is_active) return null;
  return { residenteId: portal.residente_id };
}

"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function atualizarConfiguracao(
  chave: string,
  valor: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!roleRow || !["super_admin", "coordenacao"].includes(roleRow.role)) {
    return { error: "Sem permissão. Apenas coordenação ou superior." };
  }

  const admin = await createAdminClient();
  const { error } = await admin
    .from("configuracoes_sistema")
    .update({ valor })
    .eq("chave", chave);

  if (error) return { error: error.message };

  await admin.from("audit_logs").insert({
    user_id: user.id,
    user_role: roleRow.role,
    action: "update_config",
    entity: "configuracoes_sistema",
    entity_id: chave,
    entity_name: `${chave} → ${valor}`,
    details: { chave, valor },
    ip_address: null,
    user_agent: null,
  });

  revalidatePath("/painel/configuracoes");
  revalidatePath("/painel/residentes");
  revalidatePath("/painel");
  return { success: true };
}

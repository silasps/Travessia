"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StaffRole } from "@/types/database";

const PAPEIS_PERMITIDOS: StaffRole[] = ["coordenacao", "tecnico", "cuidador"];

export async function convidarStaff(input: {
  email: string;
  nomeCompleto: string;
  cargo?: string;
  papel: StaffRole;
  senha?: string;
}): Promise<{ success: true } | { error: string }> {
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

  if (!PAPEIS_PERMITIDOS.includes(input.papel)) {
    return { error: "Esse papel não pode ser atribuído por aqui." };
  }

  const admin = await createAdminClient();
  const emailLimpo = input.email.trim().toLowerCase();
  const senhaLimpa = input.senha?.trim() || null;

  // Criar auth user
  let authUserId: string;

  if (senhaLimpa) {
    // Com senha definida — conta ativa imediatamente
    const { data: authData, error: errAuth } = await admin.auth.admin.createUser({
      email: emailLimpo,
      password: senhaLimpa,
      email_confirm: true,
    });
    if (errAuth || !authData.user) {
      const msg = errAuth?.message ?? "Erro ao criar conta.";
      if (msg.includes("already registered")) {
        return { error: "Esse e-mail já possui cadastro no sistema." };
      }
      return { error: msg };
    }
    authUserId = authData.user.id;
  } else {
    // Sem senha — envia convite por e-mail para definir senha
    const { data: authData, error: errAuth } = await admin.auth.admin.inviteUserByEmail(emailLimpo);
    if (errAuth || !authData.user) {
      const msg = errAuth?.message ?? "Erro ao enviar convite.";
      if (msg.includes("already registered")) {
        return { error: "Esse e-mail já possui cadastro no sistema." };
      }
      return { error: msg };
    }
    authUserId = authData.user.id;
  }

  // Criar staff_profiles
  const { error: errProfile } = await admin.from("staff_profiles").insert({
    user_id: authUserId,
    full_name: input.nomeCompleto.trim(),
    cargo: input.cargo?.trim() || null,
    cpf: null,
    phone: null,
    avatar_url: null,
    lgpd_consent_at: null,
    lgpd_consent_ip: null,
    is_active: true,
  });

  if (errProfile) {
    // Rollback: deletar auth user criado
    await admin.auth.admin.deleteUser(authUserId);
    return { error: `Erro ao criar perfil: ${errProfile.message}` };
  }

  // Criar staff_roles
  const { error: errRole } = await admin.from("staff_roles").insert({
    user_id: authUserId,
    role: input.papel,
  });

  if (errRole) {
    await admin.from("staff_profiles").delete().eq("user_id", authUserId);
    await admin.auth.admin.deleteUser(authUserId);
    return { error: `Erro ao atribuir papel: ${errRole.message}` };
  }

  // Audit log
  await admin.from("audit_logs").insert({
    user_id: user.id,
    user_role: roleRow.role,
    action: "invite_staff",
    entity: "staff_profiles",
    entity_id: authUserId,
    entity_name: input.nomeCompleto.trim(),
    details: { email: emailLimpo, papel: input.papel, metodo: senhaLimpa ? "senha" : "convite_email" },
    ip_address: null,
    user_agent: null,
  });

  revalidatePath("/painel/usuarios");
  return { success: true };
}

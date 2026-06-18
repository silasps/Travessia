"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { criarDocumentosIniciais } from "@/lib/actions/documentos-residente";

export interface CriarResidenteInput {
  // Identificação
  nome_completo: string;
  nome_social?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  nis?: string;
  naturalidade?: string;
  // Situação
  tempo_situacao_rua?: string;
  // Entrada
  data_entrada: string;
  // LGPD
  lgpd_consent_method: "verbal_registrado" | "escrito" | "digital";
  // Portal (opcionais)
  email_portal?: string;
  senha_inicial?: string;
}

export async function criarResidente(
  dados: CriarResidenteInput
): Promise<{ success: true; numeroProntuario: string; residenteId: string } | { error: string }> {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const PODE_CADASTRAR = ["super_admin", "coordenacao", "tecnico"];
  if (!roleRow || !PODE_CADASTRAR.includes(roleRow.role)) {
    return { error: "Sem permissão para cadastrar acolhidos." };
  }

  // ── 1. Inserir residente ──────────────────────────────────────────────
  const { data: residente, error: errResidente } = await admin
    .from("residentes")
    .insert({
      nome_completo: dados.nome_completo,
      nome_social: dados.nome_social?.trim() || null,
      data_nascimento: dados.data_nascimento || null,
      naturalidade: dados.naturalidade?.trim() || null,
      nacionalidade: "Brasileira",
      cpf: dados.cpf?.replace(/\D/g, "") || null,
      rg: dados.rg?.trim() || null,
      rg_orgao_emissor: null,
      rg_uf: null,
      nis: dados.nis?.trim() || null,
      ultimo_endereco: null,
      tempo_situacao_rua: dados.tempo_situacao_rua?.trim() || null,
      foto_url: null,
      status: "ativo" as const,
      fase_atual: 1,
      data_entrada: dados.data_entrada,
      data_saida: null,
      motivo_saida: null,
      observacoes_saida: null,
      lgpd_consent_at: new Date().toISOString(),
      lgpd_consent_by: user.id,
      lgpd_consent_method: dados.lgpd_consent_method,
      cadastrado_por: user.id,
      deleted_at: null,
    })
    .select("id, numero_prontuario")
    .single();

  if (errResidente || !residente) {
    console.error("criarResidente: erro ao inserir residente", errResidente);
    const msg = errResidente?.message ?? "Erro ao criar prontuário.";
    if (msg.includes("cpf")) return { error: "CPF já cadastrado para outro acolhido." };
    return { error: msg };
  }

  // ── 2. Registrar movimento de entrada ─────────────────────────────────
  await admin.from("movimentos_residentes").insert({
    residente_id: residente.id,
    tipo: "entrada" as const,
    data_hora: `${dados.data_entrada}T08:00:00`,
    registrado_por: user.id,
    motivo: "Entrada no programa",
    destino: null,
    observacoes: null,
  });

  // ── 3. Criar residente_portals ────────────────────────────────────────
  const emailLimpo = dados.email_portal?.trim().toLowerCase() || null;
  const senhaLimpa = dados.senha_inicial?.trim() || null;

  let portalUserId: string | null = null;
  let isActive = false;
  let activatedAt: string | null = null;

  if (emailLimpo && senhaLimpa) {
    // Modo B: criar auth user com credenciais
    const { data: authData, error: errAuth } = await admin.auth.admin.createUser({
      email: emailLimpo,
      password: senhaLimpa,
      email_confirm: true,
    });

    if (errAuth || !authData.user) {
      await admin.from("residentes").delete().eq("id", residente.id);
      const authMsg = errAuth?.message ?? "Erro ao criar acesso.";
      if (authMsg.includes("already registered")) {
        return { error: "Esse e-mail já possui cadastro no sistema." };
      }
      return { error: `Erro ao criar acesso: ${authMsg}` };
    }

    portalUserId = authData.user.id;
    isActive = true;
    activatedAt = new Date().toISOString();
  }

  await admin.from("residente_portals").insert({
    residente_id: residente.id,
    user_id: portalUserId,
    email_portal: emailLimpo,
    is_active: isActive,
    activated_at: activatedAt,
  });

  // Documentos iniciais (9 tipos, todos "nao_possui")
  await criarDocumentosIniciais(residente.id);

  // Audit log
  await admin.from("audit_logs").insert({
    user_id: user.id,
    user_role: roleRow.role,
    action: "create_residente",
    entity: "residentes",
    entity_id: residente.id,
    entity_name: dados.nome_completo,
    details: null,
    ip_address: null,
    user_agent: null,
  });

  // Consentimento LGPD
  await admin.from("lgpd_consentimentos").insert({
    sujeito_tipo: "residente",
    sujeito_id: residente.id,
    finalidade: "Acolhimento institucional e acompanhamento social",
    aceito: true,
    metodo: dados.lgpd_consent_method,
    coletado_por: user.id,
    ip: null,
    revogado_em: null,
  });

  revalidatePath("/painel/residentes");
  return {
    success: true,
    numeroProntuario: residente.numero_prontuario,
    residenteId: residente.id,
  };
}

// ── Editar residente ────────────────────────────────────────────────────────

export interface EditarResidenteInput {
  id: string;
  nome_completo: string;
  nome_social?: string;
  data_nascimento?: string;
  cpf?: string;
  rg?: string;
  nis?: string;
  naturalidade?: string;
  tempo_situacao_rua?: string;
  ultimo_endereco?: string;
}

export async function editarResidente(
  dados: EditarResidenteInput
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const admin = await createAdminClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Não autenticado." };

  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!roleRow || !PODE.includes(roleRow.role)) {
    return { error: "Sem permissão para editar acolhidos." };
  }

  const { error } = await admin
    .from("residentes")
    .update({
      nome_completo: dados.nome_completo,
      nome_social: dados.nome_social?.trim() || null,
      data_nascimento: dados.data_nascimento || null,
      cpf: dados.cpf?.replace(/\D/g, "") || null,
      rg: dados.rg?.trim() || null,
      nis: dados.nis?.trim() || null,
      naturalidade: dados.naturalidade?.trim() || null,
      tempo_situacao_rua: dados.tempo_situacao_rua?.trim() || null,
      ultimo_endereco: dados.ultimo_endereco?.trim() || null,
    })
    .eq("id", dados.id);

  if (error) {
    const msg = error.message;
    if (msg.includes("cpf")) return { error: "CPF já cadastrado para outro acolhido." };
    return { error: msg };
  }

  await admin.from("audit_logs").insert({
    user_id: user.id,
    user_role: roleRow.role,
    action: "update_residente",
    entity: "residentes",
    entity_id: dados.id,
    entity_name: dados.nome_completo,
    details: null,
    ip_address: null,
    user_agent: null,
  });

  revalidatePath(`/painel/residentes/${dados.id}`);
  revalidatePath("/painel/residentes");
  return { success: true };
}

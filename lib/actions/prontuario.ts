"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { notificarStaffPorRole } from "@/lib/actions/notificar";

async function getStaffUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: roleRow } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();
  if (!roleRow) return null;
  return { id: user.id, role: roleRow.role as string };
}

function revalidar(residenteId: string) {
  revalidatePath(`/painel/residentes/${residenteId}`);
}

async function auditLog(
  admin: Awaited<ReturnType<typeof createAdminClient>>,
  staff: { id: string; role: string },
  action: string,
  entity: string,
  entityId?: string,
  entityName?: string,
  details?: Record<string, unknown>,
) {
  await admin.from("audit_logs").insert({
    user_id: staff.id,
    user_role: staff.role,
    action,
    entity,
    entity_id: entityId ?? null,
    entity_name: entityName ?? null,
    details: details ?? null,
    ip_address: null,
    user_agent: null,
  });
}

// ── Advertência ──────────────────────────────────────────────────────────────

export async function registrarAdvertencia(input: {
  residenteId: string;
  tipo: "verbal" | "escrita" | "suspensao";
  motivo: string;
  descricao?: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const admin = await createAdminClient();
  const { error } = await admin.from("advertencias").insert({
    residente_id: input.residenteId,
    tipo: input.tipo,
    motivo: input.motivo,
    descricao: input.descricao?.trim() || null,
    data_aplicacao: new Date().toISOString().split("T")[0],
    aplicado_por: staff.id,
    reconhecido_em: null,
  });

  if (error) return { error: error.message };
  await auditLog(admin, staff, "create_advertencia", "advertencias", input.residenteId, input.motivo);
  await notificarStaffPorRole(["super_admin", "coordenacao"], "advertencia_registrada", {
    residente_id: input.residenteId, tipo: input.tipo, motivo: input.motivo,
    descricao: `${input.tipo} — ${input.motivo}`,
  }, staff.id);
  revalidar(input.residenteId);
  return { success: true };
}

// ── Anotação Técnica ─────────────────────────────────────────────────────────

export async function registrarAnotacao(input: {
  residenteId: string;
  conteudo: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { error } = await admin.from("anotacoes_tecnicas").insert({
    residente_id: input.residenteId,
    conteudo: input.conteudo.trim(),
    autor_id: staff.id,
  });

  if (error) return { error: error.message };
  await auditLog(admin, staff, "create_anotacao", "anotacoes_tecnicas", input.residenteId);
  revalidar(input.residenteId);
  return { success: true };
}

// ── Marco de Evolução ────────────────────────────────────────────────────────

export async function registrarMarco(input: {
  residenteId: string;
  fase: number;
  descricao: string;
  dataMacro: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { error } = await admin.from("marcos_evolucao").insert({
    residente_id: input.residenteId,
    fase: input.fase,
    descricao: input.descricao.trim(),
    data_marco: input.dataMacro,
    registrado_por: staff.id,
  });

  if (error) return { error: error.message };
  await auditLog(admin, staff, "create_marco", "marcos_evolucao", input.residenteId, input.descricao.trim());
  revalidar(input.residenteId);
  return { success: true };
}

// ── Contato Familiar (histórico) ─────────────────────────────────────────────

export async function registrarHistoricoContato(input: {
  residenteId: string;
  tipoContato: string;
  descricao: string;
  dataContato: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { error } = await admin.from("historico_contatos_familia").insert({
    residente_id: input.residenteId,
    contato_id: null,
    data_contato: input.dataContato,
    tipo_contato: input.tipoContato,
    descricao: input.descricao.trim(),
    registrado_por: staff.id,
  });

  if (error) return { error: error.message };
  await auditLog(admin, staff, "create_contato_familiar", "historico_contatos_familia", input.residenteId);
  revalidar(input.residenteId);
  return { success: true };
}

// ── Encaminhamento ───────────────────────────────────────────────────────────

export async function registrarEncaminhamento(input: {
  residenteId: string;
  servico: string;
  descricao: string;
  retornoPrevisto?: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { error } = await admin.from("encaminhamentos").insert({
    residente_id: input.residenteId,
    servico: input.servico as "cras" | "creas" | "caps" | "saude" | "emprego_sine" | "curso_profissionalizante" | "beneficio_social" | "juridico" | "moradia" | "outros",
    descricao: input.descricao.trim(),
    data_encaminhamento: new Date().toISOString().split("T")[0],
    responsavel_id: staff.id,
    retorno_previsto: input.retornoPrevisto || null,
    status: "pendente" as const,
    observacoes_retorno: null,
  });

  if (error) return { error: error.message };
  await auditLog(admin, staff, "create_encaminhamento", "encaminhamentos", input.residenteId, input.servico);
  await notificarStaffPorRole(["super_admin", "coordenacao", "tecnico"], "novo_encaminhamento", {
    residente_id: input.residenteId, servico: input.servico,
    descricao: input.servico,
  }, staff.id);
  revalidar(input.residenteId);
  return { success: true };
}

// ── Salvar PIA ───────────────────────────────────────────────────────────────

export async function salvarPIA(input: {
  residenteId: string;
  fichaIdentificacao?: Record<string, unknown>;
  registrosAcompanhamento?: object[];
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();

  const { data: existing } = await admin
    .from("pia")
    .select("id")
    .eq("residente_id", input.residenteId)
    .maybeSingle();

  const updates: Record<string, unknown> = {
    status: "em_elaboracao",
    data_revisao: new Date().toISOString().split("T")[0],
  };
  if (input.fichaIdentificacao !== undefined) {
    updates.secao_identificacao = input.fichaIdentificacao;
  }
  if (input.registrosAcompanhamento !== undefined) {
    updates.secao_plano_acao = { registros: input.registrosAcompanhamento };
  }

  if (existing) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await admin.from("pia").update(updates as any).eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("pia").insert({
      residente_id: input.residenteId,
      tecnico_id: staff.id,
      status: "em_elaboracao" as const,
      data_inicio: new Date().toISOString().split("T")[0],
      secao_identificacao: input.fichaIdentificacao ?? {},
      secao_plano_acao: input.registrosAcompanhamento
        ? { registros: input.registrosAcompanhamento }
        : {},
    });
    if (error) return { error: error.message };
  }

  await auditLog(admin, staff, "save_pia", "pia", input.residenteId);
  revalidatePath(`/painel/residentes/${input.residenteId}`);
  return { success: true };
}

// ── Alterar Status do PIA ─────────────────────────────────────────────────────

export async function alterarStatusPIA(input: {
  residenteId: string;
  novoStatus: "rascunho" | "em_elaboracao" | "concluido" | "revisao" | "desatualizado";
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { data: pia } = await admin
    .from("pia")
    .select("id")
    .eq("residente_id", input.residenteId)
    .maybeSingle();

  if (!pia) return { error: "PIA não encontrado." };

  const dataRevisao = (input.novoStatus === "concluido" || input.novoStatus === "revisao")
    ? new Date().toISOString().split("T")[0]
    : undefined;

  const { error } = await admin
    .from("pia")
    .update({
      status: input.novoStatus,
      ...(dataRevisao ? { data_revisao: dataRevisao } : {}),
    })
    .eq("id", pia.id);
  if (error) return { error: error.message };

  await auditLog(admin, staff, "update_pia_status", "pia", input.residenteId, `Status → ${input.novoStatus}`);
  await notificarStaffPorRole(["super_admin", "coordenacao", "tecnico"], "pia_status_alterado", {
    residente_id: input.residenteId,
    descricao: `Status alterado para ${input.novoStatus}`,
  }, staff.id);
  revalidar(input.residenteId);
  return { success: true };
}

// ── Registrar Revisão do PIA ─────────────────────────────────────────────────

export async function registrarRevisaoPIA(input: {
  residenteId: string;
  descricao: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { data: pia } = await admin
    .from("pia")
    .select("id")
    .eq("residente_id", input.residenteId)
    .maybeSingle();

  if (!pia) return { error: "PIA não encontrado." };

  const { error } = await admin.from("pia_registros").insert({
    pia_id: pia.id,
    tecnico_id: staff.id,
    descricao: input.descricao.trim(),
    data_registro: new Date().toISOString().split("T")[0],
  });

  if (error) return { error: error.message };

  await admin.from("pia").update({
    data_revisao: new Date().toISOString().split("T")[0],
  }).eq("id", pia.id);

  await auditLog(admin, staff, "create_pia_registro", "pia_registros", input.residenteId, input.descricao.trim());
  revalidar(input.residenteId);
  return { success: true };
}

// ── Criar Ocorrência ─────────────────────────────────────────────────────────

export async function criarOcorrencia(input: {
  residenteId: string;
  dataOcorrencia: string;
  gravidade: "leve" | "moderada" | "grave" | "gravissima";
  descricao: string;
  local?: string;
  testemunhas?: string;
}): Promise<{ success: true; id: string } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("ocorrencias")
    .insert({
      residente_id: input.residenteId,
      aberto_por: staff.id,
      data_ocorrencia: input.dataOcorrencia,
      gravidade: input.gravidade,
      descricao: input.descricao.trim(),
      local: input.local?.trim() || null,
      testemunhas: input.testemunhas?.trim() || null,
      status: "aberta" as const,
      avaliado_por: null,
      data_avaliacao: null,
      parecer: null,
      providencias: null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: error?.message ?? "Erro ao criar ocorrência." };
  await auditLog(admin, staff, "create_ocorrencia", "ocorrencias", data.id, `Gravidade: ${input.gravidade}`);
  revalidatePath("/painel/ocorrencias");
  return { success: true, id: data.id };
}

// ── Avaliar Ocorrência ───────────────────────────────────────────────────────

export async function avaliarOcorrencia(input: {
  ocorrenciaId: string;
  decisao: "em_avaliacao" | "confirmada" | "improcedente";
  parecer: string;
  gerarAdvertencia?: {
    tipo: "verbal" | "escrita" | "suspensao";
    motivo: string;
  };
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao"];
  if (!PODE.includes(staff.role)) return { error: "Apenas coordenação ou superior pode avaliar." };

  const admin = await createAdminClient();

  const { data: oc } = await admin
    .from("ocorrencias")
    .select("id, residente_id, status")
    .eq("id", input.ocorrenciaId)
    .single();

  if (!oc) return { error: "Ocorrência não encontrada." };
  if (oc.status !== "aberta" && oc.status !== "em_avaliacao") {
    return { error: "Esta ocorrência já foi avaliada." };
  }

  const { error } = await admin
    .from("ocorrencias")
    .update({
      status: input.decisao,
      parecer: input.parecer.trim() || null,
      avaliado_por: staff.id,
      data_avaliacao: new Date().toISOString().split("T")[0],
    })
    .eq("id", oc.id);

  if (error) return { error: error.message };

  // Gerar advertência vinculada se solicitado
  if (input.gerarAdvertencia && input.decisao === "confirmada") {
    await admin.from("advertencias").insert({
      residente_id: oc.residente_id,
      tipo: input.gerarAdvertencia.tipo,
      motivo: input.gerarAdvertencia.motivo,
      descricao: `Gerada a partir da avaliação da ocorrência.`,
      data_aplicacao: new Date().toISOString().split("T")[0],
      aplicado_por: staff.id,
      reconhecido_em: null,
    });

    await auditLog(admin, staff, "create_advertencia", "advertencias", oc.residente_id, input.gerarAdvertencia.motivo);
  }

  await auditLog(admin, staff, "evaluate_ocorrencia", "ocorrencias", oc.id, `Decisão: ${input.decisao}`);
  // Notifica quem abriu a ocorrência que ela foi avaliada
  const { data: ocFull } = await admin.from("ocorrencias").select("aberto_por").eq("id", oc.id).single();
  if (ocFull?.aberto_por && ocFull.aberto_por !== staff.id) {
    const adminForNotif = await createAdminClient();
    await adminForNotif.from("notifications").insert({
      recipient_user_id: ocFull.aberto_por,
      type: "ocorrencia_avaliada",
      payload: { ocorrencia_id: oc.id, decisao: input.decisao, descricao: `Decisão: ${input.decisao}` },
      read_at: null,
    });
  }
  revalidatePath(`/painel/ocorrencias/${oc.id}`);
  revalidatePath("/painel/ocorrencias");
  revalidar(oc.residente_id);
  return { success: true };
}

// ── Mudar Fase ───────────────────────────────────────────────────────────────

export async function mudarFase(input: {
  residenteId: string;
  novaFase: number;
  justificativa: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaffUser();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  if (input.novaFase < 1 || input.novaFase > 4) return { error: "Fase inválida." };

  const admin = await createAdminClient();

  const { error: errUpdate } = await admin
    .from("residentes")
    .update({ fase_atual: input.novaFase })
    .eq("id", input.residenteId);

  if (errUpdate) return { error: errUpdate.message };

  const FASE_NOMES = ["", "Acolhimento", "Reorganização", "Autonomia", "Preparação"];
  await admin.from("marcos_evolucao").insert({
    residente_id: input.residenteId,
    fase: input.novaFase,
    descricao: `Mudança para Fase ${input.novaFase} — ${FASE_NOMES[input.novaFase]}. ${input.justificativa.trim()}`,
    data_marco: new Date().toISOString().split("T")[0],
    registrado_por: staff.id,
  });

  await auditLog(admin, staff, "update_fase", "residentes", input.residenteId, `Fase ${input.novaFase} — ${FASE_NOMES[input.novaFase]}`);
  await notificarStaffPorRole(["super_admin", "coordenacao", "tecnico"], "fase_alterada", {
    residente_id: input.residenteId,
    descricao: `Fase ${input.novaFase} — ${FASE_NOMES[input.novaFase]}`,
  }, staff.id);
  revalidar(input.residenteId);
  return { success: true };
}

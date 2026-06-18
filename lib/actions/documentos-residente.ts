"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DocumentoStatus } from "@/types/database";

const TIPOS_DOCUMENTO = [
  "rg", "cpf", "certidao_nascimento", "certidao_casamento",
  "carteira_trabalho", "titulo_eleitor", "nis_cadastro_unico",
  "cartao_sus", "foto_3x4",
] as const;

async function getStaff() {
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

export async function criarDocumentosIniciais(residenteId: string) {
  const admin = await createAdminClient();
  const registros = TIPOS_DOCUMENTO.map((tipo) => ({
    residente_id: residenteId,
    tipo,
    status: "nao_possui" as DocumentoStatus,
    arquivo_url: null,
    numero: null,
    data_obtido: null,
    observacoes: null,
    atualizado_por: null,
  }));
  await admin.from("documentos_residente").insert(registros);
}

export async function atualizarDocumento(input: {
  documentoId: string;
  residenteId: string;
  status: DocumentoStatus;
  numero?: string;
  dataObtido?: string;
  observacoes?: string;
}): Promise<{ success: true } | { error: string }> {
  const staff = await getStaff();
  if (!staff) return { error: "Não autenticado." };

  const PODE = ["super_admin", "coordenacao", "tecnico"];
  if (!PODE.includes(staff.role)) return { error: "Sem permissão." };

  const admin = await createAdminClient();
  const { error } = await admin
    .from("documentos_residente")
    .update({
      status: input.status,
      numero: input.numero?.trim() || null,
      data_obtido: input.dataObtido || null,
      observacoes: input.observacoes?.trim() || null,
      atualizado_por: staff.id,
    })
    .eq("id", input.documentoId);

  if (error) return { error: error.message };

  await admin.from("audit_logs").insert({
    user_id: staff.id,
    user_role: staff.role,
    action: "update_documento_residente",
    entity: "documentos_residente",
    entity_id: input.residenteId,
    entity_name: `Status → ${input.status}`,
    details: null,
    ip_address: null,
    user_agent: null,
  });

  revalidatePath(`/painel/residentes/${input.residenteId}`);
  return { success: true };
}

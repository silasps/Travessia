"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { DocumentoCategoria } from "@/types/database";

const BUCKET = "documentos-publicos";

async function verificarPermissao() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const { data: role } = await supabase
    .from("staff_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!role || !["super_admin", "coordenacao"].includes(role.role)) {
    throw new Error("Sem permissão");
  }
  return user;
}

function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

export async function uploadDocumento(formData: FormData) {
  const user = await verificarPermissao();
  const admin = await createAdminClient();

  const file = formData.get("arquivo") as File | null;
  const titulo = (formData.get("titulo") as string).trim();
  const descricao = ((formData.get("descricao") as string) || "").trim() || null;
  const categoria = formData.get("categoria") as DocumentoCategoria;
  const competencia = ((formData.get("competencia") as string) || "").trim() || null;
  const publicar = formData.get("publicar") === "true";

  if (!file || file.size === 0) return { error: "Nenhum arquivo selecionado." };
  if (!titulo) return { error: "Título obrigatório." };
  if (!categoria) return { error: "Categoria obrigatória." };

  const ext = file.name.split(".").pop() ?? "pdf";
  const storagePath = `${categoria}/${Date.now()}-${slugify(titulo)}.${ext}`;
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await admin.storage
    .from(BUCKET)
    .upload(storagePath, bytes, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: `Erro no upload: ${uploadError.message}` };

  const {
    data: { publicUrl },
  } = admin.storage.from(BUCKET).getPublicUrl(storagePath);

  const tamanhoKb = Math.ceil(file.size / 1024);

  const { error: dbError } = await admin.from("documentos_publicos").insert({
    titulo,
    descricao,
    categoria,
    arquivo_url: publicUrl,
    competencia,
    publicado: publicar,
    publicado_em: publicar ? new Date().toISOString() : null,
    tamanho_kb: tamanhoKb,
    criado_por: user.id,
  });

  if (dbError) {
    await admin.storage.from(BUCKET).remove([storagePath]);
    return { error: `Erro ao salvar: ${dbError.message}` };
  }

  revalidatePath("/painel/transparencia");
  revalidatePath("/transparencia");
  return { success: true };
}

export async function togglePublicado(id: string, publicar: boolean) {
  await verificarPermissao();
  const admin = await createAdminClient();

  const { error } = await admin
    .from("documentos_publicos")
    .update({
      publicado: publicar,
      publicado_em: publicar ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/painel/transparencia");
  revalidatePath("/transparencia");
  return { success: true };
}

export async function excluirDocumento(id: string) {
  await verificarPermissao();
  const admin = await createAdminClient();

  const { data: doc } = await admin
    .from("documentos_publicos")
    .select("arquivo_url")
    .eq("id", id)
    .single();

  if (doc?.arquivo_url) {
    const url = new URL(doc.arquivo_url);
    const pathParts = url.pathname.split(`/object/public/${BUCKET}/`);
    if (pathParts.length === 2) {
      await admin.storage.from(BUCKET).remove([pathParts[1]]);
    }
  }

  const { error } = await admin.from("documentos_publicos").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/painel/transparencia");
  revalidatePath("/transparencia");
  return { success: true };
}

export async function atualizarMetadata(
  id: string,
  updates: {
    titulo?: string;
    descricao?: string | null;
    competencia?: string | null;
    categoria?: DocumentoCategoria;
  }
) {
  await verificarPermissao();
  const admin = await createAdminClient();

  const { error } = await admin
    .from("documentos_publicos")
    .update(updates)
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/painel/transparencia");
  revalidatePath("/transparencia");
  return { success: true };
}

export async function listarTodosDocumentos() {
  await verificarPermissao();
  const admin = await createAdminClient();

  const { data, error } = await admin
    .from("documentos_publicos")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data ?? [];
}

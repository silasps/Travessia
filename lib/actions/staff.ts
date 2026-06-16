"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StaffRole } from "@/types/database";

const PAPEIS_ATRIBUIVEIS: StaffRole[] = ["coordenacao", "tecnico", "cuidador"];

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

export async function alterarPapelStaff(userId: string, novoPapel: StaffRole) {
  await verificarPermissao();

  // super_admin é reservado à equipe de desenvolvimento — nunca atribuível por aqui
  if (!PAPEIS_ATRIBUIVEIS.includes(novoPapel)) {
    return { error: "Esse papel não pode ser atribuído por esta tela." };
  }

  const admin = await createAdminClient();

  const { data: alvo } = await admin
    .from("staff_roles")
    .select("role")
    .eq("user_id", userId)
    .single();

  if (alvo?.role === "super_admin") {
    return { error: "O papel de um Super Admin não pode ser alterado por aqui." };
  }

  const { error } = await admin
    .from("staff_roles")
    .update({ role: novoPapel })
    .eq("user_id", userId);

  if (error) return { error: error.message };

  revalidatePath("/painel/usuarios");
  return { success: true };
}

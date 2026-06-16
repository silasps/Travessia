import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users, Plus } from "lucide-react";
import { MOCK_STAFF } from "@/lib/mock-data";
import { DevAlertButton } from "@/components/shared/dev-alert-button";
import { AlterarPapelMenu } from "@/components/usuarios/alterar-papel-menu";
import { createClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/types/database";

export const metadata: Metadata = { title: "Usuários" };

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

const ROLE_CONFIG: Record<StaffRole, { label: string; className: string; nivel: number }> = {
  super_admin: { label: "Super Admin",  className: "bg-red-100 text-red-800",       nivel: 100 },
  coordenacao: { label: "Coordenação",  className: "bg-purple-100 text-purple-800", nivel: 70  },
  tecnico:     { label: "Técnico",      className: "bg-sky-100 text-sky-800",        nivel: 50  },
  cuidador:    { label: "Cuidador",     className: "bg-green-100 text-green-800",    nivel: 20  },
};

const PAPEL_MOCK: Record<string, StaffRole> = {
  s1: "super_admin",
  s2: "coordenacao",
  s3: "tecnico",
  s4: "cuidador",
};

interface StaffRow {
  userId: string;
  fullName: string;
  cargo: string | null;
  role: StaffRole;
}

export default async function UsuariosPage() {
  let staff: StaffRow[];
  let papelAtual: StaffRole;

  if (DEV_MODE) {
    papelAtual = "super_admin";
    staff = MOCK_STAFF.map((s) => ({
      userId: s.user_id,
      fullName: s.full_name,
      cargo: s.cargo,
      role: PAPEL_MOCK[s.id] ?? "cuidador",
    }));
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: roleRow } = await supabase
      .from("staff_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();
    if (!roleRow) redirect("/meu-espaco");
    papelAtual = roleRow.role as StaffRole;

    const { data: profiles } = await supabase
      .from("staff_profiles")
      .select("user_id, full_name, cargo")
      .order("full_name");
    const { data: roles } = await supabase.from("staff_roles").select("user_id, role");

    const roleByUser = new Map((roles ?? []).map((r) => [r.user_id, r.role as StaffRole]));
    staff = (profiles ?? []).map((p) => ({
      userId: p.user_id,
      fullName: p.full_name,
      cargo: p.cargo,
      role: roleByUser.get(p.user_id) ?? "cuidador",
    }));
  }

  const nivelAtual = ROLE_CONFIG[papelAtual].nivel;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
          <Users className="size-6 text-gray-400" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Usuários</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {staff.length} funcionários cadastrados
            </p>
          </div>
        </div>
        <DevAlertButton
          message="Convidar funcionário: funcionalidade ainda não implementada."
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors min-h-[44px]"
        >
          <Plus className="size-4" />
          Convidar funcionário
        </DevAlertButton>
      </div>

      {/* Lista de funcionários */}
      <div className="space-y-2">
        {staff.map((s) => {
          const roleCfg = ROLE_CONFIG[s.role];
          const ehSuperAdmin = s.role === "super_admin";
          const podeMudar = !ehSuperAdmin && (papelAtual === "super_admin" || nivelAtual > roleCfg.nivel);

          return (
            <div
              key={s.userId}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-600">
                    {s.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.fullName}</p>
                  <p className="text-xs text-muted-foreground">{s.cargo ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleCfg.className}`}>
                  {roleCfg.label}
                </span>
                {DEV_MODE ? (
                  podeMudar && (
                    <DevAlertButton
                      message={`Alterar papel de ${s.fullName}: disponível após conexão com banco.`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gray-900 hover:border-gray-300 transition-colors min-h-[36px]"
                    >
                      Alterar papel
                    </DevAlertButton>
                  )
                ) : (
                  podeMudar && (
                    <AlterarPapelMenu userId={s.userId} nomeCompleto={s.fullName} papelAtual={s.role} />
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabela de níveis */}
      <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-900 mb-3 text-sm">Níveis de acesso</h2>
        <div className="space-y-2">
          {(Object.entries(ROLE_CONFIG) as [StaffRole, (typeof ROLE_CONFIG)[StaffRole]][])
            .sort((a, b) => b[1].nivel - a[1].nivel)
            .map(([role, cfg]) => (
              <div key={role} className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${cfg.className}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {role === "super_admin" && "Reservado à equipe de desenvolvimento — não atribuível por aqui"}
                  {role === "coordenacao" && "Avalia ocorrências, gerencia usuários, emite relatórios"}
                  {role === "tecnico" && "Gerencia prontuários, PIA, evolução e família"}
                  {role === "cuidador" && "Registra ocorrências, vê dados básicos dos acolhidos"}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

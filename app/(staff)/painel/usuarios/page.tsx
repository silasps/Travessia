import type { Metadata } from "next";
import { Users, UserCog, Plus } from "lucide-react";
import { MOCK_STAFF } from "@/lib/mock-data";
import { DevAlertButton } from "@/components/shared/dev-alert-button";
import type { StaffRole } from "@/types/database";

export const metadata: Metadata = { title: "Usuários" };

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

export default function UsuariosPage() {
  const papelAtual: StaffRole = "super_admin";
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
              {MOCK_STAFF.length} funcionários cadastrados
            </p>
          </div>
        </div>
        <DevAlertButton
          message="Convidar funcionário: disponível após conexão com banco."
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition-colors min-h-[44px]"
        >
          <Plus className="size-4" />
          Convidar funcionário
        </DevAlertButton>
      </div>

      {/* Lista de funcionários */}
      <div className="space-y-2">
        {MOCK_STAFF.map((s) => {
          const papel = PAPEL_MOCK[s.id] ?? "cuidador";
          const roleCfg = ROLE_CONFIG[papel];
          const podeMudar = nivelAtual > roleCfg.nivel;

          return (
            <div
              key={s.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="size-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-gray-600">
                    {s.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{s.full_name}</p>
                  <p className="text-xs text-muted-foreground">{s.cargo ?? "—"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleCfg.className}`}>
                  {roleCfg.label}
                </span>
                {podeMudar && (
                  <DevAlertButton
                    message={`Alterar papel de ${s.full_name}: disponível após conexão com banco.`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-input px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-gray-900 hover:border-gray-300 transition-colors min-h-[36px]"
                  >
                    <UserCog className="size-3.5" />
                    Alterar papel
                  </DevAlertButton>
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
                  {role === "super_admin" && "Acesso total ao sistema"}
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

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SidebarContent } from "@/components/shared/sidebar";
import { StaffBottomNav } from "@/components/shared/staff-bottom-nav";
import { NotificationBell } from "@/components/shared/notification-bell";
import { RolePreviewBanner } from "@/components/shared/role-preview-banner";
import { RolePreviewSelector } from "@/components/shared/role-preview-selector";
import type { StaffRole } from "@/lib/rbac";
import { isKnownRole } from "@/lib/rbac";
import { PREVIEW_RESIDENTE_COOKIE } from "@/lib/residente-preview";

const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Modo dev: usa perfil fictício sem autenticação
  if (DEV_MODE) {
    return (
      <div className="min-h-screen flex">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r border-sidebar-border bg-sidebar z-30">
          <SidebarContent role={"super_admin" as StaffRole} userName="Dev Admin" />
        </aside>
        <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen overflow-x-hidden">
          <header className="sticky top-0 z-20 bg-background border-b border-border px-4 h-14 flex min-w-0 items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">PT</span>
              </div>
              <p className="truncate text-sm font-semibold text-foreground">Projeto Travessia</p>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                DEV — sem banco
              </span>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-20 lg:pb-6">
            {children}
          </main>
        </div>
        <StaffBottomNav role={"super_admin" as StaffRole} />
      </div>
    );
  }

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

  const { data: profile } = await supabase
    .from("staff_profiles")
    .select("full_name, avatar_url")
    .eq("user_id", user.id)
    .single();

  const realRole = (roleRow?.role ?? null) as StaffRole | null;
  const userName = (profile as { full_name?: string } | null)?.full_name ?? user.email ?? "Usuário";

  // Lê o cookie de preview (só válido para super_admin)
  const cookieStore = await cookies();
  const previewCookie = cookieStore.get("pt_preview_role")?.value ?? null;
  const previewRole =
    realRole === "super_admin" && previewCookie && isKnownRole(previewCookie)
      ? (previewCookie as StaffRole)
      : null;

  const effectiveRole = previewRole ?? realRole;

  let residentesPreview: { id: string; nome: string; numeroProntuario: string; status: string }[] = [];
  let previewResidente: { id: string; nome: string } | null = null;

  if (realRole === "super_admin") {
    const { data: residentesData } = await supabase
      .from("residentes")
      .select("id, nome_completo, nome_social, numero_prontuario, status")
      .order("nome_completo");

    residentesPreview = (residentesData ?? []).map((r) => ({
      id: r.id,
      nome: r.nome_social ?? r.nome_completo,
      numeroProntuario: r.numero_prontuario,
      status: r.status,
    }));

    const previewResidenteId = cookieStore.get(PREVIEW_RESIDENTE_COOKIE)?.value ?? null;
    if (previewResidenteId) {
      const found = residentesPreview.find((r) => r.id === previewResidenteId);
      if (found) previewResidente = { id: found.id, nome: found.nome };
    }
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r border-sidebar-border bg-sidebar z-30">
        <SidebarContent role={effectiveRole} userName={userName} />
      </aside>
      <div className="flex-1 min-w-0 lg:pl-64 flex flex-col min-h-screen overflow-x-hidden">
        <header className="sticky top-0 z-20 bg-background border-b border-border px-4 h-14 flex min-w-0 items-center gap-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">PT</span>
            </div>
            <p className="truncate text-sm font-semibold text-foreground">Projeto Travessia</p>
          </div>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            {realRole === "super_admin" && (
              <RolePreviewSelector
                currentPreview={previewRole}
                residentes={residentesPreview}
                currentPreviewResidente={previewResidente}
              />
            )}
            <NotificationBell userId={user.id} />
          </div>
        </header>

        {previewRole && <RolePreviewBanner previewRole={previewRole} />}

        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-20 lg:pb-6 overflow-x-clip">
          {children}
        </main>
      </div>
      <StaffBottomNav role={effectiveRole} />
    </div>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarContent } from "@/components/shared/sidebar";
import { StaffBottomNav } from "@/components/shared/staff-bottom-nav";
import { NotificationBell } from "@/components/shared/notification-bell";
import type { StaffRole } from "@/lib/rbac";

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
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r border-border bg-background z-30">
          <SidebarContent role={"super_admin" as StaffRole} userName="Dev Admin" />
        </aside>
        <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
          <header className="sticky top-0 z-20 bg-background border-b border-border px-4 h-14 flex items-center gap-3">
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">PT</span>
              </div>
              <p className="text-sm font-semibold text-foreground">Projeto Travessia</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
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

  const role = (roleRow?.role ?? null) as StaffRole | null;
  const userName = (profile as { full_name?: string } | null)?.full_name ?? user.email ?? "Usuário";

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r border-border bg-background z-30">
        <SidebarContent role={role} userName={userName} />
      </aside>
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-background border-b border-border px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">PT</span>
            </div>
            <p className="text-sm font-semibold text-foreground">Projeto Travessia</p>
          </div>
          <div className="ml-auto">
            <NotificationBell userId={user.id} />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-20 lg:pb-6">
          {children}
        </main>
      </div>
      <StaffBottomNav role={role} />
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, AlertTriangle, BarChart2, Settings, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StaffRole } from "@/lib/rbac";
import { canVerRelatorios, canGerenciarUsuarios } from "@/lib/rbac";

const NAV_ITEMS = [
  { href: "/painel",              label: "Início",      icon: Home,          requireRole: undefined as ((r: StaffRole) => boolean) | undefined },
  { href: "/painel/residentes",   label: "Acolhidos",   icon: Users,         requireRole: undefined },
  { href: "/painel/ocorrencias",  label: "Ocorrências", icon: AlertTriangle,  requireRole: undefined },
  { href: "/painel/relatorios",   label: "Relatórios",  icon: BarChart2,     requireRole: canVerRelatorios as (r: StaffRole) => boolean },
  { href: "/painel/configuracoes",label: "Config.",     icon: Settings,      requireRole: canGerenciarUsuarios as (r: StaffRole) => boolean },
];

export function StaffBottomNav({ role }: { role: StaffRole | null }) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requireRole || (role && item.requireRole(role))
  );

  async function handleSignOut() {
    const DEV_MODE = process.env.NEXT_PUBLIC_SUPABASE_URL === "https://placeholder.supabase.co";
    if (!DEV_MODE) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    window.location.href = "/login";
  }

  return (
    <nav className="fixed bottom-0 inset-x-0 lg:hidden bg-white border-t border-border z-20 safe-area-pb">
      <div className="flex items-stretch">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors",
                isActive
                  ? "text-sky-600"
                  : "text-muted-foreground hover:text-sky-500"
              )}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-sky-500 rounded-full" />
              )}
              <item.icon className={cn("size-5", isActive && "stroke-[2.5]")} />
              <span className="w-full truncate text-center text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={handleSignOut}
          className="flex min-h-[56px] min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors hover:text-destructive"
        >
          <LogOut className="size-5" />
          <span className="w-full truncate text-center text-[10px] font-medium leading-none">Sair</span>
        </button>
      </div>
    </nav>
  );
}

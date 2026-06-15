"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  AlertTriangle,
  FileText,
  BarChart2,
  Settings,
  LogOut,
  ChevronRight,
  Bell,
  UserCog,
  FolderOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { StaffRole } from "@/lib/rbac";
import {
  canVerRelatorios,
  canGerenciarUsuarios,
  canPublicarDocumentos,
} from "@/lib/rbac";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
  requireRole?: (role: StaffRole) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/painel", label: "Início", icon: Home },
  { href: "/painel/residentes", label: "Acolhidos", icon: Users },
  { href: "/painel/ocorrencias", label: "Ocorrências", icon: AlertTriangle },
  {
    href: "/painel/relatorios",
    label: "Relatórios",
    icon: BarChart2,
    requireRole: canVerRelatorios,
  },
  {
    href: "/painel/usuarios",
    label: "Usuários",
    icon: UserCog,
    requireRole: canGerenciarUsuarios,
  },
  {
    href: "/painel/configuracoes",
    label: "Configurações",
    icon: Settings,
    requireRole: canGerenciarUsuarios,
  },
  {
    href: "/painel/transparencia",
    label: "Transparência",
    icon: FolderOpen,
    requireRole: canPublicarDocumentos,
  },
];

interface SidebarContentProps {
  role: StaffRole | null;
  userName: string;
  unreadCount?: number;
  onClose?: () => void;
}

export function SidebarContent({
  role,
  userName,
  unreadCount = 0,
  onClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const supabase = createClient();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requireRole || (role && item.requireRole(role))
  );

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">PT</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">Projeto Travessia</p>
            <p className="text-xs text-muted-foreground truncate">{userName}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive =
            item.href === "/painel"
              ? pathname === "/painel"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors min-h-[44px]",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="size-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                  {item.badge}
                </Badge>
              )}
              {isActive && <ChevronRight className="size-4 flex-shrink-0 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]"
          onClick={handleSignOut}
        >
          <LogOut className="size-5" />
          Sair
        </Button>
      </div>
    </div>
  );
}

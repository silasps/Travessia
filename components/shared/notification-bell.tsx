"use client";

import { useRouter } from "next/navigation";
import {
  Bell, AlertTriangle, ClipboardList, UserPlus, AlertOctagon,
  TrendingUp, ExternalLink, CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelative } from "@/lib/utils/format";

interface NotificationBellProps {
  userId: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string; bg: string; href?: (p: Record<string, unknown>) => string }> = {
  nova_ocorrencia: {
    label: "Nova ocorrência",
    icon: AlertTriangle,
    color: "text-red-600",
    bg: "bg-red-100",
    href: (p) => p.ocorrencia_id ? `/painel/ocorrencias/${p.ocorrencia_id}` : "/painel/ocorrencias",
  },
  advertencia_registrada: {
    label: "Advertência registrada",
    icon: AlertOctagon,
    color: "text-amber-600",
    bg: "bg-amber-100",
    href: (p) => p.residente_id ? `/painel/residentes/${p.residente_id}?aba=advertencias` : "/painel/residentes",
  },
  pia_status_alterado: {
    label: "Status do PIA alterado",
    icon: ClipboardList,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
    href: (p) => p.residente_id ? `/painel/residentes/${p.residente_id}?aba=pia` : "/painel/residentes",
  },
  novo_residente: {
    label: "Novo acolhido cadastrado",
    icon: UserPlus,
    color: "text-green-600",
    bg: "bg-green-100",
    href: (p) => p.residente_id ? `/painel/residentes/${p.residente_id}` : "/painel/residentes",
  },
  fase_alterada: {
    label: "Fase alterada",
    icon: TrendingUp,
    color: "text-purple-600",
    bg: "bg-purple-100",
    href: (p) => p.residente_id ? `/painel/residentes/${p.residente_id}?aba=evolucao` : "/painel/residentes",
  },
  novo_encaminhamento: {
    label: "Novo encaminhamento",
    icon: ExternalLink,
    color: "text-teal-600",
    bg: "bg-teal-100",
    href: (p) => p.residente_id ? `/painel/residentes/${p.residente_id}?aba=encaminhamentos` : "/painel/residentes",
  },
  ocorrencia_avaliada: {
    label: "Ocorrência avaliada",
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
    href: (p) => p.ocorrencia_id ? `/painel/ocorrencias/${p.ocorrencia_id}` : "/painel/ocorrencias",
  },
};

const DEFAULT_CONFIG = { label: "Notificação", icon: Bell, color: "text-gray-500", bg: "bg-gray-100" };

export function NotificationBell({ userId }: NotificationBellProps) {
  const { notifications, unread, markAllRead } = useNotifications(userId);
  const router = useRouter();

  function handleClick(type: string, payload: Record<string, unknown>) {
    const cfg = TYPE_CONFIG[type];
    if (cfg?.href) {
      router.push(cfg.href(payload));
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center size-9 rounded-lg hover:bg-muted transition-colors"
        aria-label={`${unread} notificações não lidas`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-0.5 flex items-center justify-center rounded-full bg-destructive text-[10px] text-white font-semibold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              Notificações
              {unread > 0 && (
                <span className="text-[10px] bg-destructive text-white rounded-full px-1.5 py-0.5 font-semibold">
                  {unread}
                </span>
              )}
            </span>
            {unread > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markAllRead(); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Marcar como lidas
              </button>
            )}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="size-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              <p className="text-xs text-muted-foreground mt-0.5">Você será notificado sobre ocorrências e atualizações</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CONFIG;
                const Icon = cfg.icon;
                const descricao = typeof n.payload?.descricao === "string" ? n.payload.descricao
                  : typeof n.payload?.numero === "string" ? n.payload.numero
                  : typeof n.payload?.nome === "string" ? n.payload.nome
                  : null;

                return (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => handleClick(n.type, n.payload)}
                    className="flex items-start gap-3 py-3 px-3 cursor-pointer"
                  >
                    <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon className={`size-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{cfg.label}</p>
                      {descricao && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{descricao}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-1">{formatRelative(n.created_at)}</p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </div>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
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

const TYPE_LABELS: Record<string, string> = {
  nova_ocorrencia: "Nova ocorrência",
  pia_pendente: "PIA pendente de revisão",
  vaga_proxima: "Vagas quase esgotadas",
};

export function NotificationBell({ userId }: NotificationBellProps) {
  const { notifications, unread, markAllRead } = useNotifications(userId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex items-center justify-center size-9 rounded-lg hover:bg-muted transition-colors"
        aria-label={`${unread} notificações não lidas`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-destructive text-[10px] text-white font-semibold">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          notifications.slice(0, 5).map((n) => (
            <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2.5">
              <span className="font-medium text-sm">
                {TYPE_LABELS[n.type] ?? n.type}
              </span>
              {typeof n.payload?.descricao === "string" && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {n.payload.descricao}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {formatRelative(n.created_at)}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

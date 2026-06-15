import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function maskCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "");
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
}

export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy", { locale: ptBR });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { locale: ptBR, addSuffix: true });
}

export function formatTempoNoPrograma(dataEntrada: string): string {
  const entrada = parseISO(dataEntrada);
  const hoje = new Date();
  const diffMs = hoje.getTime() - entrada.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDias < 30) return `${diffDias} dia${diffDias !== 1 ? "s" : ""}`;
  const meses = Math.floor(diffDias / 30);
  return `${meses} ${meses === 1 ? "mês" : "meses"}`;
}

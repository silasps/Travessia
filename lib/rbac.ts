import type { StaffRole } from "@/types/database";

export type { StaffRole };

export const ROLE_LABELS: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  coordenacao: "Coordenação",
  tecnico: "Técnico",
  cuidador: "Cuidador",
};

export const ROLE_LEVEL: Record<StaffRole, number> = {
  super_admin: 100,
  coordenacao: 70,
  tecnico: 50,
  cuidador: 20,
};

export const ROLE_OPTIONS: Array<{ value: StaffRole; label: string }> = [
  { value: "super_admin", label: ROLE_LABELS.super_admin },
  { value: "coordenacao", label: ROLE_LABELS.coordenacao },
  { value: "tecnico", label: ROLE_LABELS.tecnico },
  { value: "cuidador", label: ROLE_LABELS.cuidador },
];

export function isKnownRole(role: string | null | undefined): role is StaffRole {
  return typeof role === "string" && role in ROLE_LEVEL;
}

export function getRoleLevel(role: string | null | undefined): number {
  if (!role || !isKnownRole(role)) return 0;
  return ROLE_LEVEL[role];
}

// Permissões por funcionalidade
export function canEditResidente(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

export function canDesligarResidente(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canVerPIA(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

export function canEditPIA(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

export function canAvaliarOcorrencia(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canVerRelatorios(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canEmitirProntuario(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

export function canGerenciarUsuarios(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canPublicarDocumentos(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canVerAuditLog(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.coordenacao;
}

export function canVerDadosSensiveis(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

// Advertências: cuidador pode registrar verbal; técnico+ pode registrar escrita/suspensão
export function canRegistrarAdvertencia(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.cuidador;
}

export function canRegistrarAdvertenciaFormal(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

// Anotações técnicas: apenas técnico+
export function canVerAnotacoesTecnicas(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

// Encaminhamentos: apenas técnico+
export function canVerEncaminhamentos(role: StaffRole | null | undefined): boolean {
  return getRoleLevel(role) >= ROLE_LEVEL.tecnico;
}

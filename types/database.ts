// Tipos do banco de dados do Projeto Travessia
// Para regenerar: npx supabase gen types typescript --local > types/database.ts

export type StaffRole = "super_admin" | "coordenacao" | "tecnico" | "cuidador";
export type ResidenteStatus = "ativo" | "desligado" | "evadido" | "transferido" | "obito";
export type OcorrenciaGravidade = "leve" | "moderada" | "grave" | "gravissima";
export type OcorrenciaStatus = "aberta" | "em_avaliacao" | "confirmada" | "improcedente";
export type PiaStatus = "rascunho" | "em_elaboracao" | "concluido" | "revisao" | "desatualizado";
export type AdvertenciaTipo = "verbal" | "escrita" | "suspensao";
export type EncaminhamentoServico =
  | "cras" | "creas" | "caps" | "saude" | "emprego_sine"
  | "curso_profissionalizante" | "beneficio_social" | "juridico" | "moradia" | "outros";
export type EncaminhamentoStatus = "pendente" | "realizado" | "sem_retorno" | "cancelado";
export type DocumentoCategoria =
  | "ata"
  | "relatorio_atividades"
  | "prestacao_contas"
  | "balancete"
  | "estatuto"
  | "regimento"
  | "plano_trabalho"
  | "contrato_parceria"
  | "outros";
export type MovimentoTipo = "entrada" | "saida_temporaria" | "retorno" | "saida_definitiva";
export type DocumentoStatus = "nao_possui" | "em_processo" | "obtido" | "entregue_residente";

// ─────────────────────────────────────────
// Interfaces das entidades
// ─────────────────────────────────────────

export interface StaffProfile {
  id: string;
  user_id: string;
  full_name: string;
  cpf: string | null;
  phone: string | null;
  cargo: string | null;
  avatar_url: string | null;
  lgpd_consent_at: string | null;
  lgpd_consent_ip: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffRoleRow {
  id: string;
  user_id: string;
  role: StaffRole;
  created_at: string;
}

export interface Residente {
  id: string;
  nome_completo: string;
  nome_social: string | null;
  data_nascimento: string | null;
  naturalidade: string | null;
  nacionalidade: string;
  cpf: string | null;
  rg: string | null;
  rg_orgao_emissor: string | null;
  rg_uf: string | null;
  nis: string | null;
  ultimo_endereco: string | null;
  tempo_situacao_rua: string | null;
  foto_url: string | null;
  status: ResidenteStatus;
  numero_prontuario: string;
  fase_atual: number;
  data_entrada: string;
  data_saida: string | null;
  motivo_saida: string | null;
  observacoes_saida: string | null;
  lgpd_consent_at: string | null;
  lgpd_consent_by: string | null;
  lgpd_consent_method: string | null;
  cadastrado_por: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovimentoResidente {
  id: string;
  residente_id: string;
  tipo: MovimentoTipo;
  data_hora: string;
  motivo: string | null;
  destino: string | null;
  registrado_por: string;
  observacoes: string | null;
  created_at: string;
}

export interface DocumentoResidente {
  id: string;
  residente_id: string;
  tipo: string;
  status: DocumentoStatus;
  arquivo_url: string | null;
  numero: string | null;
  data_obtido: string | null;
  observacoes: string | null;
  atualizado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContatoFamiliar {
  id: string;
  residente_id: string;
  nome: string;
  parentesco: string | null;
  telefone: string | null;
  endereco: string | null;
  observacoes: string | null;
  created_at: string;
}

export interface HistoricoContatoFamilia {
  id: string;
  residente_id: string;
  contato_id: string | null;
  data_contato: string;
  tipo_contato: string | null;
  descricao: string;
  registrado_por: string;
  created_at: string;
}

export interface FaseEvolucao {
  id: string;
  numero: number;
  nome: string;
  descricao: string | null;
  duracao_min_dias: number | null;
  duracao_max_dias: number | null;
  objetivos: string[];
}

export interface MarcoEvolucao {
  id: string;
  residente_id: string;
  fase: number;
  descricao: string;
  data_marco: string;
  registrado_por: string;
  created_at: string;
}

export interface Pia {
  id: string;
  residente_id: string;
  status: PiaStatus;
  tecnico_id: string;
  data_inicio: string;
  data_revisao: string | null;
  secao_identificacao: Record<string, unknown>;
  secao_historico_vida: Record<string, unknown>;
  secao_saude: Record<string, unknown>;
  secao_objetivos: Record<string, unknown>;
  secao_plano_acao: Record<string, unknown>;
  secao_rede_apoio: Record<string, unknown>;
  observacoes_gerais: string | null;
  created_at: string;
  updated_at: string;
}

export interface PiaRegistro {
  id: string;
  pia_id: string;
  tecnico_id: string;
  descricao: string;
  data_registro: string;
  created_at: string;
}

export interface Ocorrencia {
  id: string;
  numero: string;
  residente_id: string;
  aberto_por: string;
  data_ocorrencia: string;
  gravidade: OcorrenciaGravidade;
  descricao: string;
  local: string | null;
  testemunhas: string | null;
  status: OcorrenciaStatus;
  avaliado_por: string | null;
  data_avaliacao: string | null;
  parecer: string | null;
  providencias: string | null;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  recipient_user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface DocumentoPublico {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: DocumentoCategoria;
  arquivo_url: string;
  competencia: string | null;
  publicado: boolean;
  publicado_em: string | null;
  tamanho_kb: number | null;
  criado_por: string | null;
  created_at: string;
  updated_at: string;
}

export interface ResidentePortal {
  id: string;
  residente_id: string;
  user_id: string | null;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  entity_name: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface LgpdConsentimento {
  id: string;
  sujeito_tipo: "residente" | "staff";
  sujeito_id: string;
  finalidade: string;
  aceito: boolean;
  metodo: string;
  coletado_por: string | null;
  ip: string | null;
  revogado_em: string | null;
  created_at: string;
}

export interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: string;
  descricao: string | null;
  updated_at: string;
}

export interface Advertencia {
  id: string;
  residente_id: string;
  tipo: AdvertenciaTipo;
  motivo: string;
  descricao: string | null;
  data_aplicacao: string;
  aplicado_por: string;
  reconhecido_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnotacaoTecnica {
  id: string;
  residente_id: string;
  conteudo: string;
  autor_id: string;
  created_at: string;
}

export interface Encaminhamento {
  id: string;
  residente_id: string;
  servico: EncaminhamentoServico;
  descricao: string;
  data_encaminhamento: string;
  responsavel_id: string;
  retorno_previsto: string | null;
  status: EncaminhamentoStatus;
  observacoes_retorno: string | null;
  created_at: string;
  updated_at: string;
}

// Helper: converte uma interface nomeada em tipo mapeado para compatibilidade com GenericTable do SDK
type AsRow<T> = { [K in keyof T]: T[K] };

// ─────────────────────────────────────────
// Database — formato esperado pelo Supabase SDK
// ─────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      staff_profiles: {
        Row: AsRow<StaffProfile>;
        Insert: Omit<StaffProfile, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<StaffProfile, "id" | "created_at">>;
        Relationships: never[];
      };
      staff_roles: {
        Row: AsRow<StaffRoleRow>;
        Insert: Omit<StaffRoleRow, "id" | "created_at">;
        Update: Partial<Omit<StaffRoleRow, "id" | "created_at">>;
        Relationships: never[];
      };
      residentes: {
        Row: AsRow<Residente>;
        Insert: Omit<Residente, "id" | "numero_prontuario" | "created_at" | "updated_at">;
        Update: Partial<Omit<Residente, "id" | "numero_prontuario" | "created_at">>;
        Relationships: never[];
      };
      movimentos_residentes: {
        Row: AsRow<MovimentoResidente>;
        Insert: Omit<MovimentoResidente, "id" | "created_at">;
        Update: Partial<Omit<MovimentoResidente, "id" | "created_at">>;
        Relationships: never[];
      };
      documentos_residente: {
        Row: AsRow<DocumentoResidente>;
        Insert: Omit<DocumentoResidente, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DocumentoResidente, "id" | "created_at">>;
        Relationships: never[];
      };
      contatos_familiares: {
        Row: AsRow<ContatoFamiliar>;
        Insert: Omit<ContatoFamiliar, "id" | "created_at">;
        Update: Partial<Omit<ContatoFamiliar, "id" | "created_at">>;
        Relationships: never[];
      };
      historico_contatos_familia: {
        Row: AsRow<HistoricoContatoFamilia>;
        Insert: Omit<HistoricoContatoFamilia, "id" | "created_at">;
        Update: Partial<Omit<HistoricoContatoFamilia, "id" | "created_at">>;
        Relationships: never[];
      };
      fases_evolucao: {
        Row: AsRow<FaseEvolucao>;
        Insert: Omit<FaseEvolucao, "id">;
        Update: Partial<Omit<FaseEvolucao, "id">>;
        Relationships: never[];
      };
      marcos_evolucao: {
        Row: AsRow<MarcoEvolucao>;
        Insert: Omit<MarcoEvolucao, "id" | "created_at">;
        Update: Partial<Omit<MarcoEvolucao, "id" | "created_at">>;
        Relationships: never[];
      };
      pia: {
        Row: AsRow<Pia>;
        Insert: Omit<Pia, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Pia, "id" | "created_at">>;
        Relationships: never[];
      };
      pia_registros: {
        Row: AsRow<PiaRegistro>;
        Insert: Omit<PiaRegistro, "id" | "created_at">;
        Update: Partial<Omit<PiaRegistro, "id" | "created_at">>;
        Relationships: never[];
      };
      ocorrencias: {
        Row: AsRow<Ocorrencia>;
        Insert: Omit<Ocorrencia, "id" | "numero" | "created_at" | "updated_at">;
        Update: Partial<Omit<Ocorrencia, "id" | "numero" | "created_at">>;
        Relationships: never[];
      };
      notifications: {
        Row: AsRow<AppNotification>;
        Insert: Omit<AppNotification, "id" | "created_at">;
        Update: Partial<Omit<AppNotification, "id" | "created_at">>;
        Relationships: never[];
      };
      documentos_publicos: {
        Row: AsRow<DocumentoPublico>;
        Insert: Omit<DocumentoPublico, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<DocumentoPublico, "id" | "created_at">>;
        Relationships: never[];
      };
      residente_portals: {
        Row: AsRow<ResidentePortal>;
        Insert: Omit<ResidentePortal, "id" | "created_at">;
        Update: Partial<Omit<ResidentePortal, "id" | "created_at">>;
        Relationships: never[];
      };
      audit_logs: {
        Row: AsRow<AuditLog>;
        Insert: Omit<AuditLog, "id" | "created_at">;
        Update: never;
        Relationships: never[];
      };
      lgpd_consentimentos: {
        Row: AsRow<LgpdConsentimento>;
        Insert: Omit<LgpdConsentimento, "id" | "created_at">;
        Update: never;
        Relationships: never[];
      };
      configuracoes_sistema: {
        Row: AsRow<ConfiguracaoSistema>;
        Insert: Omit<ConfiguracaoSistema, "id" | "updated_at">;
        Update: Partial<Omit<ConfiguracaoSistema, "id">>;
        Relationships: never[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      staff_role: StaffRole;
      residente_status: ResidenteStatus;
      ocorrencia_gravidade: OcorrenciaGravidade;
      ocorrencia_status: OcorrenciaStatus;
      pia_status: PiaStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

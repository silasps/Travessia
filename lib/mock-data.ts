// Dados fictícios para desenvolvimento — substituir por queries Supabase quando o banco estiver conectado
// Contexto: Projeto Travessia, Ribeirão Preto/SP, abrigo para homens em situação de rua

import type {
  Residente,
  Ocorrencia,
  DocumentoResidente,
  ContatoFamiliar,
  HistoricoContatoFamilia,
  MarcoEvolucao,
  FaseEvolucao,
  Pia,
  StaffProfile,
  MovimentoResidente,
  ConfiguracaoSistema,
  Advertencia,
  AnotacaoTecnica,
  Encaminhamento,
} from "@/types/database";

// ─── Fases do programa ───────────────────────────────────────────────────────

export const MOCK_FASES: FaseEvolucao[] = [
  {
    id: "f1", numero: 1, nome: "Acolhimento",
    descricao: "Estabilização inicial, conhecimento das regras e diagnóstico social",
    duracao_min_dias: 30, duracao_max_dias: 90,
    objetivos: ["Adaptação às normas da casa", "Diagnóstico de vulnerabilidades", "Início do acompanhamento técnico", "Regularização básica de documentos"],
  },
  {
    id: "f2", numero: 2, nome: "Reorganização",
    descricao: "Tratamento de dependências, regularização documental e planejamento de vida",
    duracao_min_dias: 60, duracao_max_dias: 180,
    objetivos: ["Regularização de documentos (RG, CPF, NIS)", "Tratamento de dependência química (se houver)", "Elaboração do PIA", "Restabelecimento de vínculos familiares"],
  },
  {
    id: "f3", numero: 3, nome: "Autonomia",
    descricao: "Inserção laboral, capacitação profissional e desenvolvimento de autonomia",
    duracao_min_dias: 60, duracao_max_dias: 180,
    objetivos: ["Inserção no mercado de trabalho ou curso profissionalizante", "Gestão financeira básica", "Moradia alternativa (república, aluguel social)", "Fortalecimento da rede de apoio"],
  },
  {
    id: "f4", numero: 4, nome: "Preparação para Saída",
    descricao: "Transição planejada para moradia independente e reinserção social plena",
    duracao_min_dias: 30, duracao_max_dias: 90,
    objetivos: ["Plano de saída elaborado", "Moradia definida", "Renda regular", "Rede de apoio ativa pós-saída"],
  },
];

// ─── Configurações ───────────────────────────────────────────────────────────

export const MOCK_CONFIGURACOES: ConfiguracaoSistema[] = [
  { id: "c1", chave: "capacidade_total", valor: "50", descricao: "Capacidade máxima de vagas", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c2", chave: "nome_instituicao", valor: "Projeto Travessia", descricao: "Nome da OSC", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c3", chave: "dpo_nome", valor: "Maria Aparecida Souza", descricao: "Nome do DPO", updated_at: "2024-01-01T00:00:00Z" },
  { id: "c4", chave: "dpo_email", valor: "lgpd@projetotravessia.org.br", descricao: "E-mail do DPO", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Staff ───────────────────────────────────────────────────────────────────

export const MOCK_STAFF: StaffProfile[] = [
  { id: "s1", user_id: "u1", full_name: "Maria Aparecida Souza", cpf: "111.111.111-11", phone: "(16) 99111-0001", cargo: "Assistente Social / DPO", avatar_url: null, lgpd_consent_at: "2024-01-01T08:00:00Z", lgpd_consent_ip: "192.168.0.1", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s2", user_id: "u2", full_name: "Paulo Roberto Mendes", cpf: "222.222.222-22", phone: "(16) 99222-0002", cargo: "Coordenador", avatar_url: null, lgpd_consent_at: "2024-01-01T08:00:00Z", lgpd_consent_ip: "192.168.0.2", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s3", user_id: "u3", full_name: "Ana Flávia Carvalho", cpf: "333.333.333-33", phone: "(16) 99333-0003", cargo: "Psicóloga", avatar_url: null, lgpd_consent_at: "2024-01-01T08:00:00Z", lgpd_consent_ip: "192.168.0.3", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
  { id: "s4", user_id: "u4", full_name: "Carlos Eduardo Lima", cpf: "444.444.444-44", phone: "(16) 99444-0004", cargo: "Cuidador", avatar_url: null, lgpd_consent_at: "2024-01-01T08:00:00Z", lgpd_consent_ip: "192.168.0.4", is_active: true, created_at: "2024-01-01T00:00:00Z", updated_at: "2024-01-01T00:00:00Z" },
];

// ─── Residentes ──────────────────────────────────────────────────────────────

export const MOCK_RESIDENTES: Residente[] = [
  { id: "r01", nome_completo: "José Carlos Santos Filho", nome_social: null, data_nascimento: "1975-03-15", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "123.456.789-01", rg: "12.345.678-9", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "12345678901", ultimo_endereco: "Rua das Magnólias, 123 - Bonfim Paulista", tempo_situacao_rua: "2 anos e 3 meses", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-001", fase_atual: 2, data_entrada: "2024-01-15", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-01-15T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-01-15T09:00:00Z", updated_at: "2026-01-10T14:00:00Z" },
  { id: "r02", nome_completo: "Antônio Francisco Almeida", nome_social: "Toninho", data_nascimento: "1968-07-22", naturalidade: "Franca", nacionalidade: "brasileira", cpf: "234.567.890-12", rg: "23.456.789-0", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "23456789012", ultimo_endereco: null, tempo_situacao_rua: "5 anos", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-002", fase_atual: 3, data_entrada: "2024-02-01", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-02-01T10:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-02-01T10:00:00Z", updated_at: "2026-03-15T09:00:00Z" },
  { id: "r03", nome_completo: "Pedro Henrique Ferreira", nome_social: null, data_nascimento: "1982-11-08", naturalidade: "São Paulo", nacionalidade: "brasileira", cpf: "345.678.901-23", rg: "34.567.890-1", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: "Av. Costábile Romano, 456 - Ribeirão Preto", tempo_situacao_rua: "8 meses", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-003", fase_atual: 1, data_entrada: "2024-03-10", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-03-10T08:30:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2024-03-10T08:30:00Z", updated_at: "2024-03-10T08:30:00Z" },
  { id: "r04", nome_completo: "Francisco Barbosa Lima", nome_social: null, data_nascimento: "1971-05-30", naturalidade: "Belo Horizonte", nacionalidade: "brasileira", cpf: "456.789.012-34", rg: "45.678.901-2", rg_orgao_emissor: "SSP", rg_uf: "MG", nis: "45678901234", ultimo_endereco: "Rua Visconde de Inhaúma, 789 - Ribeirão Preto", tempo_situacao_rua: "3 anos", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-004", fase_atual: 4, data_entrada: "2024-01-20", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-01-20T09:15:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-01-20T09:15:00Z", updated_at: "2026-04-01T11:00:00Z" },
  { id: "r05", nome_completo: "João Batista Rodrigues Souza", nome_social: "João", data_nascimento: "1990-09-14", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "567.890.123-45", rg: "56.789.012-3", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "56789012345", ultimo_endereco: null, tempo_situacao_rua: "1 ano", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-005", fase_atual: 2, data_entrada: "2024-04-05", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-04-05T14:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2024-04-05T14:00:00Z", updated_at: "2025-11-01T10:00:00Z" },
  { id: "r06", nome_completo: "Carlos Eduardo Oliveira Neto", nome_social: null, data_nascimento: "1965-12-01", naturalidade: "Jaboticabal", nacionalidade: "brasileira", cpf: "678.901.234-56", rg: "67.890.123-4", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "67890123456", ultimo_endereco: "Rua Santa Cruz, 12 - Ribeirão Preto", tempo_situacao_rua: "7 anos", foto_url: null, status: "ativo", numero_prontuario: "PT-2024-006", fase_atual: 3, data_entrada: "2024-02-14", data_saida: null, motivo_saida: null, observacoes_saida: null, lgpd_consent_at: "2024-02-14T11:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-02-14T11:00:00Z", updated_at: "2025-12-10T09:00:00Z" },
  { id: "r07", nome_completo: "Luiz Roberto Nascimento", nome_social: "Luizão", data_nascimento: "1978-02-19", naturalidade: "Sertãozinho", nacionalidade: "brasileira", cpf: "789.012.345-67", rg: "78.901.234-5", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: "Rua Abrahão Issa Halack, 300 - Ribeirão Preto", tempo_situacao_rua: "4 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-007", fase_atual: 3, data_entrada: "2024-05-03", data_saida: "2025-03-12", motivo_saida: "retorno_familiar", observacoes_saida: "Retornou à família em Sertãozinho após reconciliação com a esposa.", lgpd_consent_at: "2024-05-03T08:45:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2024-05-03T08:45:00Z", updated_at: "2025-03-12T14:00:00Z" },
  { id: "r08", nome_completo: "Marcos Antônio da Silva", nome_social: null, data_nascimento: "1988-06-25", naturalidade: "Guariba", nacionalidade: "brasileira", cpf: "890.123.456-78", rg: "89.012.345-6", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "89012345678", ultimo_endereco: null, tempo_situacao_rua: "2 anos e 8 meses", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-008", fase_atual: 4, data_entrada: "2024-06-12", data_saida: "2025-06-20", motivo_saida: "emprego_moradia_propria", observacoes_saida: "Concluiu o programa. Obteve emprego como auxiliar de serviços gerais e alugou quarto próprio.", lgpd_consent_at: "2024-06-12T09:30:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2024-06-12T09:30:00Z", updated_at: "2025-06-20T10:00:00Z" },
  { id: "r09", nome_completo: "Roberto Carlos Mendes Pereira", nome_social: null, data_nascimento: "1972-04-07", naturalidade: "Barretos", nacionalidade: "brasileira", cpf: "901.234.567-89", rg: "90.123.456-7", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "90123456789", ultimo_endereco: "Av. Brasil, 1500 - Ribeirão Preto", tempo_situacao_rua: "18 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2024-009", fase_atual: 2, data_entrada: "2024-03-01", data_saida: "2024-11-08", motivo_saida: "evasao", observacoes_saida: "Saiu sem comunicar a equipe. Não atendeu às tentativas de contato.", lgpd_consent_at: "2024-03-01T10:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2024-03-01T10:00:00Z", updated_at: "2024-11-08T08:00:00Z" },
  { id: "r10", nome_completo: "Paulo Sérgio Campos Freitas", nome_social: "Paulão", data_nascimento: "1984-08-18", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "012.345.678-90", rg: "01.234.567-8", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "6 meses", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-010", fase_atual: 4, data_entrada: "2024-07-20", data_saida: "2025-07-10", motivo_saida: "conclusao_programa", observacoes_saida: "Concluiu todas as fases. Encaminhado ao CRAS para acompanhamento pós-saída.", lgpd_consent_at: "2024-07-20T14:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2024-07-20T14:00:00Z", updated_at: "2025-07-10T11:00:00Z" },
  { id: "r11", nome_completo: "Edilson Aparecido Rocha Junior", nome_social: null, data_nascimento: "1980-10-10", naturalidade: "Araraquara", nacionalidade: "brasileira", cpf: "111.222.333-44", rg: "11.222.333-4", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "11122233344", ultimo_endereco: "Rua Lafaiete, 55 - Ribeirão Preto", tempo_situacao_rua: "3 anos e 5 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2024-011", fase_atual: 1, data_entrada: "2024-01-28", data_saida: "2024-08-15", motivo_saida: "evasao", observacoes_saida: "Saiu durante a madrugada levando pertences. Histórico de recaída anterior.", lgpd_consent_at: "2024-01-28T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-01-28T09:00:00Z", updated_at: "2024-08-15T06:00:00Z" },
  { id: "r12", nome_completo: "Valdivino José Cardoso", nome_social: null, data_nascimento: "1961-01-30", naturalidade: "Goiânia", nacionalidade: "brasileira", cpf: "222.333.444-55", rg: "22.333.444-5", rg_orgao_emissor: "SSP", rg_uf: "GO", nis: "22233344455", ultimo_endereco: "Rua Treze de Maio, 88 - Ribeirão Preto", tempo_situacao_rua: "10 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-012", fase_atual: 4, data_entrada: "2024-02-07", data_saida: "2025-04-30", motivo_saida: "retorno_familiar", observacoes_saida: "Filho adulto veio de Goiânia buscá-lo. Retorno positivo com apoio familiar estruturado.", lgpd_consent_at: "2024-02-07T08:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2024-02-07T08:00:00Z", updated_at: "2025-04-30T09:00:00Z" },
  { id: "r13", nome_completo: "Raimundo Nonato Cruz Santos", nome_social: "Raimundinho", data_nascimento: "1973-03-22", naturalidade: "Fortaleza", nacionalidade: "brasileira", cpf: "333.444.555-66", rg: "33.444.555-6", rg_orgao_emissor: "SSP", rg_uf: "CE", nis: "33344455566", ultimo_endereco: null, tempo_situacao_rua: "6 anos", foto_url: null, status: "evadido", numero_prontuario: "PT-2024-013", fase_atual: 2, data_entrada: "2024-08-15", data_saida: "2025-01-22", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2024-08-15T10:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2024-08-15T10:00:00Z", updated_at: "2025-01-22T07:00:00Z" },
  { id: "r14", nome_completo: "Benedito Alves Moreira Filho", nome_social: null, data_nascimento: "1969-09-05", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "444.555.666-77", rg: "44.555.666-7", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "44455566677", ultimo_endereco: "Rua Campos Salles, 200 - Ribeirão Preto", tempo_situacao_rua: "4 anos e 2 meses", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-014", fase_atual: 4, data_entrada: "2024-03-22", data_saida: "2025-09-10", motivo_saida: "emprego_moradia_propria", observacoes_saida: "Contratado como ajudante de pedreiro. Divide kitnet com colega de trabalho.", lgpd_consent_at: "2024-03-22T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2024-03-22T09:00:00Z", updated_at: "2025-09-10T10:00:00Z" },
  { id: "r15", nome_completo: "Sebastião Ferreira Gomes", nome_social: "Seu Sebá", data_nascimento: "1958-11-15", naturalidade: "São José do Rio Preto", nacionalidade: "brasileira", cpf: "555.666.777-88", rg: "55.666.777-8", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: "Av. Independência, 456 - Ribeirão Preto", tempo_situacao_rua: "12 anos", foto_url: null, status: "transferido", numero_prontuario: "PT-2024-015", fase_atual: 2, data_entrada: "2024-09-10", data_saida: "2025-05-18", motivo_saida: "encaminhamento_outro_servico", observacoes_saida: "Encaminhado ao serviço de acolhimento para idosos (ILPI) por necessidades de saúde contínua.", lgpd_consent_at: "2024-09-10T08:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2024-09-10T08:00:00Z", updated_at: "2025-05-18T09:00:00Z" },
  { id: "r16", nome_completo: "Genivaldo Pereira Lima da Silva", nome_social: null, data_nascimento: "1976-06-28", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "666.777.888-99", rg: "66.777.888-9", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "66677788899", ultimo_endereco: null, tempo_situacao_rua: "2 anos", foto_url: null, status: "evadido", numero_prontuario: "PT-2024-016", fase_atual: 1, data_entrada: "2024-04-18", data_saida: "2024-12-05", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2024-04-18T11:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2024-04-18T11:00:00Z", updated_at: "2024-12-05T07:00:00Z" },
  { id: "r17", nome_completo: "Wanderley Santos Costa Ribeiro", nome_social: "Wander", data_nascimento: "1983-07-14", naturalidade: "Pitangueiras", nacionalidade: "brasileira", cpf: "777.888.999-00", rg: "77.888.999-0", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "77788899900", ultimo_endereco: "Rua Duque de Caxias, 99 - Ribeirão Preto", tempo_situacao_rua: "3 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-017", fase_atual: 4, data_entrada: "2024-05-20", data_saida: "2025-08-28", motivo_saida: "conclusao_programa", observacoes_saida: "Concluiu o programa com êxito. Inserido no mercado de trabalho via SINE.", lgpd_consent_at: "2024-05-20T14:30:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2024-05-20T14:30:00Z", updated_at: "2025-08-28T11:00:00Z" },
  { id: "r18", nome_completo: "Claudinho Batista Vieira Nunes", nome_social: null, data_nascimento: "1995-02-03", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "888.999.000-11", rg: "88.999.000-1", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "4 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2025-001", fase_atual: 1, data_entrada: "2025-01-08", data_saida: "2025-07-30", motivo_saida: "evasao", observacoes_saida: "Saiu alegando que não se adaptava à rotina do abrigo.", lgpd_consent_at: "2025-01-08T09:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2025-01-08T09:00:00Z", updated_at: "2025-07-30T08:00:00Z" },
  { id: "r19", nome_completo: "Neivaldo Rodrigues Pires Júnior", nome_social: null, data_nascimento: "1967-04-20", naturalidade: "Cravinhos", nacionalidade: "brasileira", cpf: "999.000.111-22", rg: "99.000.111-2", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "99900011122", ultimo_endereco: "Rua Floriano Peixoto, 33 - Ribeirão Preto", tempo_situacao_rua: "8 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-002", fase_atual: 4, data_entrada: "2025-02-12", data_saida: "2026-02-05", motivo_saida: "retorno_familiar", observacoes_saida: "Irmão assumiu a guarda. Retornou a Cravinhos com suporte familiar.", lgpd_consent_at: "2025-02-12T10:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2025-02-12T10:00:00Z", updated_at: "2026-02-05T10:00:00Z" },
  { id: "r20", nome_completo: "Sidinei Aparecido Tavares", nome_social: "Sidão", data_nascimento: "1979-08-30", naturalidade: "Brodowski", nacionalidade: "brasileira", cpf: "100.200.300-40", rg: "10.020.030-4", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "10020030040", ultimo_endereco: "Av. Nove de Julho, 740 - Ribeirão Preto", tempo_situacao_rua: "5 anos", foto_url: null, status: "transferido", numero_prontuario: "PT-2025-003", fase_atual: 3, data_entrada: "2025-03-05", data_saida: "2025-12-18", motivo_saida: "encaminhamento_outro_servico", observacoes_saida: "Encaminhado ao Centro de Atenção Psicossocial (CAPS) por quadro de saúde mental que exige acompanhamento especializado.", lgpd_consent_at: "2025-03-05T08:30:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2025-03-05T08:30:00Z", updated_at: "2025-12-18T09:00:00Z" },
  { id: "r21", nome_completo: "Gilmar dos Santos Freitas", nome_social: null, data_nascimento: "1986-12-12", naturalidade: "Batatais", nacionalidade: "brasileira", cpf: "200.300.400-50", rg: "20.030.040-5", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "1 ano e 8 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2025-004", fase_atual: 1, data_entrada: "2025-04-01", data_saida: "2025-09-14", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2025-04-01T09:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2025-04-01T09:00:00Z", updated_at: "2025-09-14T07:00:00Z" },
  { id: "r22", nome_completo: "Edivaldo Luiz Monteiro Cardoso", nome_social: null, data_nascimento: "1970-05-16", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "300.400.500-60", rg: "30.040.050-6", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "30040050060", ultimo_endereco: "Rua Tibiriçá, 15 - Ribeirão Preto", tempo_situacao_rua: "3 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-005", fase_atual: 4, data_entrada: "2025-04-15", data_saida: "2026-01-20", motivo_saida: "emprego_moradia_propria", observacoes_saida: "Obteve emprego formal com carteira assinada. Alugou moradia própria com apoio do programa.", lgpd_consent_at: "2025-04-15T10:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2025-04-15T10:00:00Z", updated_at: "2026-01-20T10:00:00Z" },
  { id: "r23", nome_completo: "Claudionor José Ribeiro Souza", nome_social: "Claudinho", data_nascimento: "1963-09-25", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "400.500.600-70", rg: "40.050.060-7", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "40050060070", ultimo_endereco: "Rua Santo André, 890 - Ribeirão Preto", tempo_situacao_rua: "9 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-006", fase_atual: 4, data_entrada: "2025-05-02", data_saida: "2026-03-15", motivo_saida: "conclusao_programa", observacoes_saida: "Concluiu o programa. Participou de grupo de geração de renda e retomou contato com família.", lgpd_consent_at: "2025-05-02T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2025-05-02T09:00:00Z", updated_at: "2026-03-15T10:00:00Z" },
  { id: "r24", nome_completo: "Nilson Pereira da Cruz Lima", nome_social: null, data_nascimento: "1985-01-18", naturalidade: "Ituverava", nacionalidade: "brasileira", cpf: "500.600.700-80", rg: "50.060.070-8", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "2 anos e 6 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2025-007", fase_atual: 1, data_entrada: "2025-06-18", data_saida: "2025-11-30", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2025-06-18T08:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2025-06-18T08:00:00Z", updated_at: "2025-11-30T07:00:00Z" },
  { id: "r25", nome_completo: "Valdeci Aparecido Leite Neves", nome_social: null, data_nascimento: "1977-03-08", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "600.700.800-90", rg: "60.070.080-9", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "60070080090", ultimo_endereco: "Rua Sete de Setembro, 123 - Ribeirão Preto", tempo_situacao_rua: "4 anos", foto_url: null, status: "transferido", numero_prontuario: "PT-2025-008", fase_atual: 2, data_entrada: "2025-07-10", data_saida: "2026-01-08", motivo_saida: "encaminhamento_outro_servico", observacoes_saida: "Transferido para república terapêutica conveniada para continuidade do tratamento de dependência química.", lgpd_consent_at: "2025-07-10T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2025-07-10T09:00:00Z", updated_at: "2026-01-08T09:00:00Z" },
  { id: "r26", nome_completo: "Gilberto Ferreira Matos Sousa", nome_social: "Gil", data_nascimento: "1992-10-22", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "700.800.900-01", rg: "70.080.090-0", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "10 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2025-009", fase_atual: 1, data_entrada: "2025-08-05", data_saida: "2025-12-20", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2025-08-05T10:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2025-08-05T10:00:00Z", updated_at: "2025-12-20T07:00:00Z" },
  { id: "r27", nome_completo: "Severino Alves Barbosa Filho", nome_social: "Sev", data_nascimento: "1959-07-10", naturalidade: "Caruaru", nacionalidade: "brasileira", cpf: "800.900.011-12", rg: "80.090.001-1", rg_orgao_emissor: "SSP", rg_uf: "PE", nis: "80090001112", ultimo_endereco: "Rua Marília, 44 - Ribeirão Preto", tempo_situacao_rua: "15 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-010", fase_atual: 4, data_entrada: "2025-09-01", data_saida: "2026-04-28", motivo_saida: "retorno_familiar", observacoes_saida: "Sobrinha se responsabilizou. Desligamento planejado com visita prévia à família.", lgpd_consent_at: "2025-09-01T08:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2025-09-01T08:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "r28", nome_completo: "Jovino dos Santos Lima Pereira", nome_social: null, data_nascimento: "1974-11-30", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "900.011.122-23", rg: "90.001.112-2", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "90001112223", ultimo_endereco: "Av. Presidente Kennedy, 600 - Ribeirão Preto", tempo_situacao_rua: "3 anos e 9 meses", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-011", fase_atual: 4, data_entrada: "2025-09-20", data_saida: "2026-05-10", motivo_saida: "emprego_moradia_propria", observacoes_saida: "Conseguiu emprego via curso de qualificação promovido pelo abrigo. Saiu com perspectiva positiva.", lgpd_consent_at: "2025-09-20T09:00:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2025-09-20T09:00:00Z", updated_at: "2026-05-10T10:00:00Z" },
  { id: "r29", nome_completo: "Agnaldo Batista Cardoso Santos", nome_social: null, data_nascimento: "1981-04-14", naturalidade: "Jardinópolis", nacionalidade: "brasileira", cpf: "011.122.233-34", rg: "01.112.223-3", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "1 ano e 4 meses", foto_url: null, status: "transferido", numero_prontuario: "PT-2025-012", fase_atual: 2, data_entrada: "2025-10-08", data_saida: "2026-02-25", motivo_saida: "encaminhamento_outro_servico", observacoes_saida: "Transferido para serviço especializado em dependência química com internação.", lgpd_consent_at: "2025-10-08T10:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2025-10-08T10:00:00Z", updated_at: "2026-02-25T09:00:00Z" },
  { id: "r30", nome_completo: "Manoel Ferreira Costa Neto", nome_social: "Manoel", data_nascimento: "1966-02-27", naturalidade: "São Simão", nacionalidade: "brasileira", cpf: "122.233.344-45", rg: "12.223.334-4", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "12223334445", ultimo_endereco: "Rua Visconde do Rio Branco, 77 - Ribeirão Preto", tempo_situacao_rua: "6 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-013", fase_atual: 4, data_entrada: "2025-11-01", data_saida: "2026-05-30", motivo_saida: "conclusao_programa", observacoes_saida: "Destaque do programa — concluiu as 4 fases em 7 meses. Inserido em programa de habitação social.", lgpd_consent_at: "2025-11-01T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2025-11-01T09:00:00Z", updated_at: "2026-05-30T11:00:00Z" },
  { id: "r31", nome_completo: "Oziel dos Santos Pereira Filho", nome_social: null, data_nascimento: "1989-08-06", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "233.344.455-56", rg: "23.334.445-5", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "8 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2025-014", fase_atual: 1, data_entrada: "2025-11-20", data_saida: "2026-03-08", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2025-11-20T08:30:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2025-11-20T08:30:00Z", updated_at: "2026-03-08T07:00:00Z" },
  { id: "r32", nome_completo: "Dirceu Aparecido Nunes da Silva", nome_social: null, data_nascimento: "1962-06-15", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "344.455.566-67", rg: "34.445.556-6", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "34445556667", ultimo_endereco: "Rua Chile, 222 - Ribeirão Preto", tempo_situacao_rua: "11 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2025-015", fase_atual: 4, data_entrada: "2025-12-10", data_saida: "2026-05-15", motivo_saida: "retorno_familiar", observacoes_saida: "Filha acolheu em sua residência após processo de reaproximação mediado pela assistente social.", lgpd_consent_at: "2025-12-10T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2025-12-10T09:00:00Z", updated_at: "2026-05-15T10:00:00Z" },
  { id: "r33", nome_completo: "Elias Ferreira Borges Carvalho", nome_social: null, data_nascimento: "1987-12-18", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "455.566.677-78", rg: "45.556.667-7", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "2 anos", foto_url: null, status: "evadido", numero_prontuario: "PT-2026-001", fase_atual: 1, data_entrada: "2026-01-05", data_saida: "2026-05-02", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2026-01-05T08:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2026-01-05T08:00:00Z", updated_at: "2026-05-02T07:00:00Z" },
  { id: "r34", nome_completo: "Erivaldo José Santos Melo", nome_social: null, data_nascimento: "1993-05-28", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "566.677.788-89", rg: "56.667.778-8", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "56667778889", ultimo_endereco: "Av. João Fiúsa, 1100 - Ribeirão Preto", tempo_situacao_rua: "6 meses", foto_url: null, status: "desligado", numero_prontuario: "PT-2026-002", fase_atual: 3, data_entrada: "2026-02-18", data_saida: "2026-06-10", motivo_saida: "emprego_moradia_propria", observacoes_saida: "Mais jovem a concluir — conseguiu emprego CLT e dividiu apartamento com amigo.", lgpd_consent_at: "2026-02-18T09:30:00Z", lgpd_consent_by: "s3", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s3", deleted_at: null, created_at: "2026-02-18T09:30:00Z", updated_at: "2026-06-10T10:00:00Z" },
  { id: "r35", nome_completo: "Marivaldo dos Santos Cruz", nome_social: null, data_nascimento: "1980-09-12", naturalidade: "Serrana", nacionalidade: "brasileira", cpf: "677.788.899-90", rg: "67.778.889-9", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "67778889990", ultimo_endereco: "Rua Floresta, 50 - Serrana", tempo_situacao_rua: "1 ano e 10 meses", foto_url: null, status: "evadido", numero_prontuario: "PT-2026-003", fase_atual: 1, data_entrada: "2026-04-10", data_saida: "2026-06-05", motivo_saida: "evasao", observacoes_saida: null, lgpd_consent_at: "2026-04-10T10:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s1", deleted_at: null, created_at: "2026-04-10T10:00:00Z", updated_at: "2026-06-05T07:00:00Z" },
  // Desligados
  { id: "r36", nome_completo: "Geraldo Pereira Figueiredo", nome_social: null, data_nascimento: "1972-10-05", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "788.899.900-01", rg: "78.889.990-0", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: "78889990001", ultimo_endereco: "Rua Joinville, 14 - Ribeirão Preto", tempo_situacao_rua: "4 anos", foto_url: null, status: "desligado", numero_prontuario: "PT-2024-020", fase_atual: 4, data_entrada: "2024-02-01", data_saida: "2025-04-30", motivo_saida: "Reinserção social — moradia com familiar", observacoes_saida: "Encaminhado para família em São Paulo. Acompanhamento pós-saída agendado.", lgpd_consent_at: "2024-02-01T09:00:00Z", lgpd_consent_by: "s1", lgpd_consent_method: "escrito", cadastrado_por: "s1", deleted_at: null, created_at: "2024-02-01T09:00:00Z", updated_at: "2025-04-30T16:00:00Z" },
  // Evadido
  { id: "r37", nome_completo: "Adelson Luiz Machado", nome_social: null, data_nascimento: "1991-03-17", naturalidade: "Ribeirão Preto", nacionalidade: "brasileira", cpf: "899.000.111-12", rg: "89.900.011-1", rg_orgao_emissor: "SSP", rg_uf: "SP", nis: null, ultimo_endereco: null, tempo_situacao_rua: "1 ano", foto_url: null, status: "evadido", numero_prontuario: "PT-2024-025", fase_atual: 1, data_entrada: "2024-06-01", data_saida: "2024-07-15", motivo_saida: "Evasão espontânea", observacoes_saida: "Saiu sem comunicar durante plantão noturno. Pertences deixados no quarto.", lgpd_consent_at: "2024-06-01T10:00:00Z", lgpd_consent_by: "s4", lgpd_consent_method: "verbal_registrado", cadastrado_por: "s4", deleted_at: null, created_at: "2024-06-01T10:00:00Z", updated_at: "2024-07-15T06:00:00Z" },
];

// ─── Documentos por residente ─────────────────────────────────────────────────

const TIPOS_DOC = ["rg", "cpf", "certidao_nascimento", "carteira_trabalho", "titulo_eleitor", "nis_cadastro_unico", "cartao_sus", "foto_3x4"] as const;

function mockDocsForResidente(residenteId: string, fase: number): DocumentoResidente[] {
  const now = "2026-06-14";
  return TIPOS_DOC.map((tipo, i) => ({
    id: `doc-${residenteId}-${tipo}`,
    residente_id: residenteId,
    tipo,
    status: (
      fase >= 4 ? "entregue_residente" :
      fase >= 3 ? (i < 7 ? "obtido" : "em_processo") :
      fase >= 2 ? (i < 5 ? "obtido" : i < 7 ? "em_processo" : "nao_possui") :
      (i < 3 ? "obtido" : i < 5 ? "em_processo" : "nao_possui")
    ) as DocumentoResidente["status"],
    arquivo_url: null,
    numero: tipo === "rg" ? "12.345.678-9" : tipo === "cpf" ? "123.456.789-01" : null,
    data_obtido: (fase >= 2 && i < 3) ? "2024-03-01" : null,
    observacoes: null,
    atualizado_por: "s1",
    created_at: now + "T00:00:00Z",
    updated_at: now + "T00:00:00Z",
  }));
}

export function getMockDocumentos(residenteId: string): DocumentoResidente[] {
  const r = MOCK_RESIDENTES.find((x) => x.id === residenteId);
  if (!r) return [];
  return mockDocsForResidente(residenteId, r.fase_atual);
}

// ─── Contatos familiares ──────────────────────────────────────────────────────

export const MOCK_CONTATOS: Record<string, ContatoFamiliar[]> = {
  r01: [
    { id: "cf01a", residente_id: "r01", nome: "Maria das Graças Santos", parentesco: "Mãe", telefone: "(16) 99101-1111", endereco: "Rua das Magnólias, 45 - Ribeirão Preto", observacoes: "Possui contato esporádico. Disposta a receber o filho após alta.", created_at: "2024-02-01T00:00:00Z" },
    { id: "cf01b", residente_id: "r01", nome: "Josué Santos Filho", parentesco: "Irmão", telefone: "(16) 99201-2222", endereco: null, observacoes: "Mora em São Paulo. Raramente atende ligações.", created_at: "2024-02-01T00:00:00Z" },
  ],
  r02: [
    { id: "cf02a", residente_id: "r02", nome: "Ana Lúcia Almeida", parentesco: "Ex-esposa", telefone: "(16) 99102-3333", endereco: "Av. Dom Pedro I, 500 - Franca", observacoes: "Possui filhos em comum. Relacionamento cordial.", created_at: "2024-03-01T00:00:00Z" },
  ],
  r04: [
    { id: "cf04a", residente_id: "r04", nome: "Tereza Barbosa Lima", parentesco: "Irmã", telefone: "(31) 98104-4444", endereco: "Rua das Acácias, 78 - Belo Horizonte", observacoes: "Mantém contato regular. Planeja receber o irmão após a fase 4.", created_at: "2024-01-25T00:00:00Z" },
    { id: "cf04b", residente_id: "r04", nome: "José Barbosa Lima Filho", parentesco: "Pai", telefone: null, endereco: "Rua das Acácias, 78 - Belo Horizonte", observacoes: "Idoso, dificuldade para atender telefone.", created_at: "2024-01-25T00:00:00Z" },
  ],
};

export const MOCK_HISTORICO_CONTATOS: HistoricoContatoFamilia[] = [
  { id: "hc01", residente_id: "r01", contato_id: "cf01a", data_contato: "2026-05-10", tipo_contato: "Ligação telefônica", descricao: "Ligamos para a mãe para atualizar sobre o progresso do José. Ela demonstrou interesse em receber a visita do filho.", registrado_por: "s1", created_at: "2026-05-10T14:00:00Z" },
  { id: "hc02", residente_id: "r01", contato_id: "cf01a", data_contato: "2026-03-15", tipo_contato: "Visita familiar", descricao: "A mãe visitou o José na instituição. Encontro emocionante e positivo para ambos.", registrado_por: "s3", created_at: "2026-03-15T11:00:00Z" },
  { id: "hc03", residente_id: "r04", contato_id: "cf04a", data_contato: "2026-06-01", tipo_contato: "Ligação telefônica", descricao: "Irmã confirmou disponibilidade para receber Francisco após conclusão do programa.", registrado_por: "s1", created_at: "2026-06-01T15:00:00Z" },
];

// ─── Marcos de evolução ───────────────────────────────────────────────────────

export const MOCK_MARCOS: Record<string, MarcoEvolucao[]> = {
  r01: [
    { id: "m01a", residente_id: "r01", fase: 1, descricao: "Ingresso no programa. Diagnóstico inicial realizado.", data_marco: "2024-01-15", registrado_por: "s1", created_at: "2024-01-15T09:00:00Z" },
    { id: "m01b", residente_id: "r01", fase: 1, descricao: "RG e CPF obtidos.", data_marco: "2024-02-20", registrado_por: "s1", created_at: "2024-02-20T10:00:00Z" },
    { id: "m01c", residente_id: "r01", fase: 1, descricao: "Conclusão da fase 1. Sem uso de substâncias em 45 dias.", data_marco: "2024-03-10", registrado_por: "s3", created_at: "2024-03-10T14:00:00Z" },
    { id: "m01d", residente_id: "r01", fase: 2, descricao: "Início de tratamento no CAPS para dependência de álcool.", data_marco: "2024-03-25", registrado_por: "s3", created_at: "2024-03-25T09:00:00Z" },
    { id: "m01e", residente_id: "r01", fase: 2, descricao: "NIS cadastrado. CadÚnico atualizado.", data_marco: "2024-05-12", registrado_por: "s1", created_at: "2024-05-12T11:00:00Z" },
    { id: "m01f", residente_id: "r01", fase: 2, descricao: "Visita familiar realizada. Reaproximação com a mãe.", data_marco: "2026-03-15", registrado_por: "s3", created_at: "2026-03-15T11:00:00Z" },
  ],
  r02: [
    { id: "m02a", residente_id: "r02", fase: 1, descricao: "Ingresso e diagnóstico. Situação de dependência química identificada.", data_marco: "2024-02-01", registrado_por: "s1", created_at: "2024-02-01T10:00:00Z" },
    { id: "m02b", residente_id: "r02", fase: 2, descricao: "Internação voluntária por 30 dias para desintoxicação.", data_marco: "2024-04-01", registrado_por: "s3", created_at: "2024-04-01T09:00:00Z" },
    { id: "m02c", residente_id: "r02", fase: 2, descricao: "Alta da internação. Retorno ao programa com acompanhamento CAPS.", data_marco: "2024-05-03", registrado_por: "s3", created_at: "2024-05-03T14:00:00Z" },
    { id: "m02d", residente_id: "r02", fase: 3, descricao: "Conclusão da fase 2. Documentação completa.", data_marco: "2025-01-10", registrado_por: "s1", created_at: "2025-01-10T10:00:00Z" },
    { id: "m02e", residente_id: "r02", fase: 3, descricao: "Início em curso de panificação pelo SENAI.", data_marco: "2025-03-01", registrado_por: "s1", created_at: "2025-03-01T09:00:00Z" },
    { id: "m02f", residente_id: "r02", fase: 3, descricao: "Emprego informal em padaria 3x por semana.", data_marco: "2026-02-15", registrado_por: "s1", created_at: "2026-02-15T10:00:00Z" },
  ],
  r04: [
    { id: "m04a", residente_id: "r04", fase: 1, descricao: "Ingresso. Diagnóstico: desemprego estrutural e perda de moradia.", data_marco: "2024-01-20", registrado_por: "s1", created_at: "2024-01-20T09:15:00Z" },
    { id: "m04b", residente_id: "r04", fase: 2, descricao: "Documentação completa regularizada.", data_marco: "2024-03-15", registrado_por: "s1", created_at: "2024-03-15T10:00:00Z" },
    { id: "m04c", residente_id: "r04", fase: 3, descricao: "Curso de manutenção elétrica concluído.", data_marco: "2025-01-20", registrado_por: "s1", created_at: "2025-01-20T10:00:00Z" },
    { id: "m04d", residente_id: "r04", fase: 3, descricao: "Emprego formal como assistente de manutenção.", data_marco: "2025-04-10", registrado_por: "s1", created_at: "2025-04-10T10:00:00Z" },
    { id: "m04e", residente_id: "r04", fase: 4, descricao: "Ingresso na fase 4. Plano de saída em elaboração.", data_marco: "2026-01-15", registrado_por: "s1", created_at: "2026-01-15T09:00:00Z" },
    { id: "m04f", residente_id: "r04", fase: 4, descricao: "Moradia definida: república popular no Bonfim Paulista.", data_marco: "2026-04-20", registrado_por: "s1", created_at: "2026-04-20T11:00:00Z" },
  ],
};

// ─── Ocorrências ──────────────────────────────────────────────────────────────

export const MOCK_OCORRENCIAS: Ocorrencia[] = [
  { id: "oc01", numero: "OC-2026-001", residente_id: "r07", aberto_por: "s4", data_ocorrencia: "2026-06-12", gravidade: "moderada", descricao: "Acolhido encontrado com odor de álcool ao retornar do período de saída. Negou ter ingerido bebida. Comportamento agitado durante registro.", local: "Entrada principal", testemunhas: "Carlos Eduardo Lima (cuidador)", status: "aberta", avaliado_por: null, data_avaliacao: null, parecer: null, providencias: null, created_at: "2026-06-12T21:30:00Z", updated_at: "2026-06-12T21:30:00Z" },
  { id: "oc02", numero: "OC-2026-002", residente_id: "r13", aberto_por: "s4", data_ocorrencia: "2026-06-10", gravidade: "leve", descricao: "Conflito verbal com outro acolhido durante o jantar. Desentendimento sobre uso da televisão. Situação resolvida no momento pelo cuidador.", local: "Refeitório", testemunhas: "Outros acolhidos presentes", status: "em_avaliacao", avaliado_por: null, data_avaliacao: null, parecer: null, providencias: null, created_at: "2026-06-10T19:45:00Z", updated_at: "2026-06-11T09:00:00Z" },
  { id: "oc03", numero: "OC-2026-003", residente_id: "r29", aberto_por: "s1", data_ocorrencia: "2026-06-08", gravidade: "grave", descricao: "Acolhido relatou ameaças de outro acolhido não identificado do lado de fora da instituição. Demonstrou medo e pediu proteção. Caso encaminhado para Delegacia de Polícia.", local: "Área externa — calçada", testemunhas: null, status: "em_avaliacao", avaliado_por: null, data_avaliacao: null, parecer: null, providencias: "B.O. registrado. Contato com equipe da SEMDES.", created_at: "2026-06-08T16:00:00Z", updated_at: "2026-06-09T10:00:00Z" },
  { id: "oc04", numero: "OC-2026-004", residente_id: "r03", aberto_por: "s4", data_ocorrencia: "2026-05-30", gravidade: "leve", descricao: "Acolhido descumpriu horário de retorno (limite 22h, retornou 23h20). Afirmou que perdeu o ônibus.", local: "Entrada principal", testemunhas: null, status: "confirmada", avaliado_por: "s2", data_avaliacao: "2026-06-01", parecer: "Ocorrência confirmada. Acolhido orientado sobre as normas da casa. Advertência verbal registrada.", providencias: "Advertência verbal e registro no prontuário.", created_at: "2026-05-30T23:30:00Z", updated_at: "2026-06-01T10:00:00Z" },
  { id: "oc05", numero: "OC-2026-005", residente_id: "r22", aberto_por: "s3", data_ocorrencia: "2026-05-20", gravidade: "leve", descricao: "Acolhido relatou mal-estar e pressão alta durante atendimento psicológico. Encaminhado à UPA Santa Felícia.", local: "Sala de atendimento", testemunhas: "Ana Flávia Carvalho", status: "confirmada", avaliado_por: "s2", data_avaliacao: "2026-05-21", parecer: "Situação de saúde confirmada. Não há questão disciplinar. Registro para acompanhamento médico.", providencias: "Agendado acompanhamento no posto de saúde.", created_at: "2026-05-20T14:30:00Z", updated_at: "2026-05-21T09:00:00Z" },
  { id: "oc06", numero: "OC-2026-006", residente_id: "r07", aberto_por: "s3", data_ocorrencia: "2026-04-15", gravidade: "moderada", descricao: "Acolhido admitiu ter usado maconha fora da instituição durante saída para curso. Demonstrou arrependimento e pediu apoio.", local: "Sala de atendimento", testemunhas: null, status: "confirmada", avaliado_por: "s2", data_avaliacao: "2026-04-17", parecer: "Uso confirmado pelo próprio acolhido. Encaminhado para reforço no tratamento do CAPS.", providencias: "Agendamento de consulta adicional no CAPS. PIA revisado.", created_at: "2026-04-15T16:00:00Z", updated_at: "2026-04-17T11:00:00Z" },
  { id: "oc07", numero: "OC-2025-018", residente_id: "r11", aberto_por: "s4", data_ocorrencia: "2025-11-03", gravidade: "leve", descricao: "Acolhido reclamou de barulho excessivo do quarto ao lado impedindo seu sono. Pediu intervenção da equipe.", local: "Dormitório 3", testemunhas: null, status: "improcedente", avaliado_por: "s2", data_avaliacao: "2025-11-04", parecer: "Após investigação, verificou-se que o barulho era mínimo e dentro do horário permitido. Queixa não procedente.", providencias: null, created_at: "2025-11-03T23:00:00Z", updated_at: "2025-11-04T14:00:00Z" },
  { id: "oc08", numero: "OC-2025-015", residente_id: "r17", aberto_por: "s1", data_ocorrencia: "2025-10-22", gravidade: "grave", descricao: "Briga física entre dois acolhidos no pátio. Wanderley envolvido. Lesões leves. Polícia acionada.", local: "Pátio interno", testemunhas: "Carlos Eduardo Lima; outros 3 acolhidos", status: "confirmada", avaliado_por: "s2", data_avaliacao: "2025-10-23", parecer: "Ocorrência grave confirmada. Acolhido advertido formalmente. Monitoramento intensificado.", providencias: "Advertência formal. B.O. registrado. Acolhido do outro envolvido também notificado.", created_at: "2025-10-22T16:30:00Z", updated_at: "2025-10-23T10:00:00Z" },
];

// ─── PIAs ─────────────────────────────────────────────────────────────────────

export const MOCK_PIAS: Record<string, Pia> = {
  r01: {
    id: "pia01", residente_id: "r01", status: "em_elaboracao", tecnico_id: "s1",
    data_inicio: "2024-04-01", data_revisao: "2026-01-10",
    secao_identificacao: { naturalidade: "Ribeirão Preto", situacao_civil: "solteiro", escolaridade: "Ensino Médio Completo", profissao_anterior: "Motorista de entrega" },
    secao_historico_vida: { historico_rua: "Perdeu emprego em 2021 após acidente. Separação conjugal em seguida. Começou a beber e perdeu a moradia.", situacoes_vulnerabilidade: ["dependência de álcool", "desemprego"], historico_violencia: "Não relatado" },
    secao_saude: { condicoes_cronicas: "Hipertensão arterial", medicamentos: "Losartana 50mg", tratamento_saude_mental: "Sim — CAPS Centro desde março/2024", uso_substancias: "Álcool (em tratamento)" },
    secao_objetivos: { objetivo_principal: "Retomada da vida autônoma e reaproximação familiar", metas_curto_prazo: ["Manter abstinência de álcool", "Regularizar documentação"], metas_medio_prazo: ["Retomar trabalho como motorista", "Reaproximação com a mãe"], metas_longo_prazo: ["Moradia independente", "Relação familiar estável"] },
    secao_plano_acao: { acoes: ["Acompanhamento semanal CAPS", "Visita familiar mensal", "Busca ativa de emprego (habilitação válida)"] },
    secao_rede_apoio: { rede_familiar: "Mãe (Maria das Graças) — contato positivo", rede_institucional: "CAPS Centro; CRAS Sumaré", rede_comunitaria: "Igreja Presbiteriana no bairro" },
    observacoes_gerais: "Acolhido demonstra boa adesão ao tratamento. Progresso consistente.",
    created_at: "2024-04-01T09:00:00Z", updated_at: "2026-01-10T14:00:00Z",
  },
  r02: {
    id: "pia02", residente_id: "r02", status: "concluido", tecnico_id: "s3",
    data_inicio: "2024-06-01", data_revisao: "2026-04-01",
    secao_identificacao: { situacao_civil: "divorciado", escolaridade: "Ensino Fundamental Incompleto", profissao_anterior: "Auxiliar de serviços gerais" },
    secao_historico_vida: { historico_rua: "Uso de crack desde 2018 levou à perda de emprego e abandono familiar.", situacoes_vulnerabilidade: ["dependência de crack/álcool"], historico_violencia: "Vítima de violência na rua" },
    secao_saude: { condicoes_cronicas: "Nenhuma identificada", medicamentos: "Nenhum no momento", tratamento_saude_mental: "CAPS AD — em acompanhamento", uso_substancias: "Crack e álcool — em remissão" },
    secao_objetivos: { objetivo_principal: "Inserção laboral formal e moradia independente", metas_curto_prazo: ["Manter 6 meses de sobriedade", "Concluir curso SENAI"], metas_medio_prazo: ["Emprego formal", "Independência financeira"], metas_longo_prazo: ["Moradia própria"] },
    secao_plano_acao: { acoes: ["Curso panificação SENAI", "Acompanhamento CAPS semanal", "Emprego informal em padaria"] },
    secao_rede_apoio: { rede_familiar: "Ex-esposa — contato ocasional; 2 filhos menores", rede_institucional: "CAPS AD; CRAS Santa Cruz", rede_comunitaria: "Grupo de apoio NA" },
    observacoes_gerais: "Caso de grande evolução. Pronto para fase 4.",
    created_at: "2024-06-01T09:00:00Z", updated_at: "2026-04-01T11:00:00Z",
  },
  r04: {
    id: "pia04", residente_id: "r04", status: "concluido", tecnico_id: "s1",
    data_inicio: "2024-03-01", data_revisao: "2026-05-10",
    secao_identificacao: { situacao_civil: "casado (separado de fato)", escolaridade: "Ensino Médio Completo", profissao_anterior: "Eletricista" },
    secao_historico_vida: { historico_rua: "Demissão em 2020 seguida de endividamento. Perda do imóvel alugado.", situacoes_vulnerabilidade: ["desemprego prolongado", "endividamento"], historico_violencia: "Não relatado" },
    secao_saude: { condicoes_cronicas: "Diabetes tipo 2 leve", medicamentos: "Metformina 500mg", tratamento_saude_mental: "Não necessário", uso_substancias: "Nenhum" },
    secao_objetivos: { objetivo_principal: "Retorno ao mercado de trabalho e moradia própria", metas_curto_prazo: ["Curso de elétrica residencial", "Documentação regularizada"], metas_medio_prazo: ["Emprego formal como eletricista", "Poupança para moradia"], metas_longo_prazo: ["Moradia estável"] },
    secao_plano_acao: { acoes: ["Curso de manutenção elétrica (concluído)", "Emprego formal (conquistado)", "Pesquisa de república"] },
    secao_rede_apoio: { rede_familiar: "Irmã (Tereza) em BH — apoio confirmado", rede_institucional: "CRAS Bonfim Paulista", rede_comunitaria: "Nenhuma" },
    observacoes_gerais: "Caso de sucesso. Francisco está pronto para saída planejada.",
    created_at: "2024-03-01T09:00:00Z", updated_at: "2026-05-10T10:00:00Z",
  },
};

// ─── Movimentos ───────────────────────────────────────────────────────────────

export const MOCK_MOVIMENTOS: MovimentoResidente[] = [
  { id: "mv01", residente_id: "r01", tipo: "entrada", data_hora: "2024-01-15T09:00:00Z", motivo: "Encaminhamento pelo CREAS", destino: null, registrado_por: "s1", observacoes: "Acolhido chegou com vestimentas em estado precário. Atendimento inicial realizado.", created_at: "2024-01-15T09:00:00Z" },
  { id: "mv02", residente_id: "r02", tipo: "entrada", data_hora: "2024-02-01T10:00:00Z", motivo: "Busca espontânea", destino: null, registrado_por: "s1", observacoes: "Acolhido veio por conta própria após indicação de usuário.", created_at: "2024-02-01T10:00:00Z" },
  { id: "mv03", residente_id: "r36", tipo: "entrada", data_hora: "2024-02-01T09:00:00Z", motivo: "Encaminhamento pela Prefeitura", destino: null, registrado_por: "s1", observacoes: null, created_at: "2024-02-01T09:00:00Z" },
  { id: "mv04", residente_id: "r36", tipo: "saida_definitiva", data_hora: "2025-04-30T16:00:00Z", motivo: "Reinserção social — moradia com familiar", destino: "Residência familiar em São Paulo/SP", registrado_por: "s2", observacoes: "Alta planejada e assistida.", created_at: "2025-04-30T16:00:00Z" },
  { id: "mv05", residente_id: "r37", tipo: "entrada", data_hora: "2024-06-01T10:00:00Z", motivo: "Encaminhamento pelo CRAS", destino: null, registrado_por: "s4", observacoes: null, created_at: "2024-06-01T10:00:00Z" },
  { id: "mv06", residente_id: "r37", tipo: "saida_definitiva", data_hora: "2024-07-15T06:00:00Z", motivo: "Evasão espontânea", destino: null, registrado_por: "s4", observacoes: "Não comunicou saída. Pertences encontrados no quarto.", created_at: "2024-07-15T06:00:00Z" },
];

// ─── Helpers de consulta ──────────────────────────────────────────────────────

export function getMockResidentes(statusFiltro?: string): Residente[] {
  if (statusFiltro && statusFiltro !== "todos") {
    return MOCK_RESIDENTES.filter((r) => r.status === statusFiltro);
  }
  return MOCK_RESIDENTES;
}

export function getMockResidente(id: string): Residente | undefined {
  return MOCK_RESIDENTES.find((r) => r.id === id);
}

export function getMockOcorrencias(residenteId?: string): Ocorrencia[] {
  if (residenteId) return MOCK_OCORRENCIAS.filter((o) => o.residente_id === residenteId);
  return MOCK_OCORRENCIAS;
}

export function getMockPia(residenteId: string): Pia | undefined {
  return MOCK_PIAS[residenteId];
}

export function getMockMarcos(residenteId: string): MarcoEvolucao[] {
  return MOCK_MARCOS[residenteId] ?? [];
}

export function getMockContatosFamiliares(residenteId: string): ContatoFamiliar[] {
  return MOCK_CONTATOS[residenteId] ?? [];
}

export function getMockHistoricoContatos(residenteId: string): HistoricoContatoFamilia[] {
  return MOCK_HISTORICO_CONTATOS.filter((h) => h.residente_id === residenteId);
}

export const MOCK_STATS = {
  totalAtivos: MOCK_RESIDENTES.filter((r) => r.status === "ativo").length,
  capacidade: 50,
  ocorrenciasAbertas: MOCK_OCORRENCIAS.filter((o) => o.status === "aberta" || o.status === "em_avaliacao").length,
  piasPendentes: Object.values(MOCK_PIAS).filter((p) => p.status === "rascunho" || p.status === "revisao").length,
};

// ─── Advertências ────────────────────────────────────────────────────────────

export const MOCK_ADVERTENCIAS: Advertencia[] = [
  {
    id: "adv01", residente_id: "r01", tipo: "verbal",
    motivo: "Descumprimento de horário",
    descricao: "Retornou ao abrigo após o horário limite (23h) sem justificativa prévia.",
    data_aplicacao: "2024-02-10", aplicado_por: "s4",
    reconhecido_em: "2024-02-10T20:30:00Z",
    created_at: "2024-02-10T20:00:00Z", updated_at: "2024-02-10T20:30:00Z",
  },
  {
    id: "adv02", residente_id: "r01", tipo: "escrita",
    motivo: "Uso de linguagem agressiva com funcionário",
    descricao: "Dirigiu palavras ofensivas ao cuidador de plantão durante orientação sobre normas da casa.",
    data_aplicacao: "2024-04-03", aplicado_por: "s1",
    reconhecido_em: "2024-04-04T09:00:00Z",
    created_at: "2024-04-03T16:00:00Z", updated_at: "2024-04-04T09:00:00Z",
  },
  {
    id: "adv03", residente_id: "r02", tipo: "verbal",
    motivo: "Barulho excessivo no dormitório",
    descricao: "Perturbou o descanso dos demais acolhidos após o horário de silêncio.",
    data_aplicacao: "2024-05-15", aplicado_por: "s4",
    reconhecido_em: null,
    created_at: "2024-05-15T23:30:00Z", updated_at: "2024-05-15T23:30:00Z",
  },
  {
    id: "adv04", residente_id: "r04", tipo: "suspensao",
    motivo: "Porte de bebida alcoólica nas dependências",
    descricao: "Foi encontrado com garrafa de cachaça escondida no armário pessoal, infringindo as regras de sobriedade da casa.",
    data_aplicacao: "2024-03-20", aplicado_por: "s2",
    reconhecido_em: "2024-03-21T08:00:00Z",
    created_at: "2024-03-20T19:00:00Z", updated_at: "2024-03-21T08:00:00Z",
  },
];

export function getMockAdvertencias(residenteId: string): Advertencia[] {
  return MOCK_ADVERTENCIAS.filter((a) => a.residente_id === residenteId);
}

// ─── Anotações Técnicas ──────────────────────────────────────────────────────

export const MOCK_ANOTACOES: AnotacaoTecnica[] = [
  {
    id: "anot01", residente_id: "r01", autor_id: "s1",
    conteudo: "Atendimento individual com assistente social. José demonstrou preocupação com a situação financeira da mãe idosa. Orientado sobre possibilidade de BPC/LOAS para ela. Ficou calmo e receptivo. Progride bem na fase 2.",
    created_at: "2024-03-05T10:30:00Z",
  },
  {
    id: "anot02", residente_id: "r01", autor_id: "s3",
    conteudo: "Sessão de acompanhamento psicológico. Abordamos padrões de comportamento relacionados ao uso de álcool no passado. José revelou que iniciou o consumo após separação conjugal em 2019. Indica boa capacidade de insight. Encaminhado para CAPS para acompanhamento especializado.",
    created_at: "2024-04-12T14:00:00Z",
  },
  {
    id: "anot03", residente_id: "r02", autor_id: "s1",
    conteudo: "Visita de campo ao SINE com Antônio. Realizou cadastro para oportunidades em jardinagem e manutenção. Demonstrou iniciativa e boa apresentação pessoal. Mantém evolução consistente para fase 3.",
    created_at: "2024-06-01T09:00:00Z",
  },
];

export function getMockAnotacoes(residenteId: string): AnotacaoTecnica[] {
  return MOCK_ANOTACOES.filter((a) => a.residente_id === residenteId);
}

// ─── Encaminhamentos ─────────────────────────────────────────────────────────

export const MOCK_ENCAMINHAMENTOS: Encaminhamento[] = [
  {
    id: "enc01", residente_id: "r01", servico: "caps",
    descricao: "Encaminhamento para acompanhamento especializado em saúde mental e prevenção de recaída.",
    data_encaminhamento: "2024-04-12", responsavel_id: "s3",
    retorno_previsto: "2024-04-26", status: "realizado",
    observacoes_retorno: "Retornou com confirmação de matrícula no grupo terapêutico às terças e quintas.",
    created_at: "2024-04-12T14:00:00Z", updated_at: "2024-04-30T10:00:00Z",
  },
  {
    id: "enc02", residente_id: "r01", servico: "beneficio_social",
    descricao: "Solicitação de BPC/LOAS para mãe idosa dependente. Orientação sobre documentação necessária.",
    data_encaminhamento: "2024-03-05", responsavel_id: "s1",
    retorno_previsto: "2024-03-20", status: "pendente",
    observacoes_retorno: null,
    created_at: "2024-03-05T10:30:00Z", updated_at: "2024-03-05T10:30:00Z",
  },
  {
    id: "enc03", residente_id: "r02", servico: "emprego_sine",
    descricao: "Cadastro no SINE para vagas em jardinagem e manutenção predial.",
    data_encaminhamento: "2024-06-01", responsavel_id: "s1",
    retorno_previsto: "2024-06-15", status: "realizado",
    observacoes_retorno: "Recebeu 2 indicações de vagas. Vai a entrevista na próxima semana.",
    created_at: "2024-06-01T09:00:00Z", updated_at: "2024-06-10T11:00:00Z",
  },
  {
    id: "enc04", residente_id: "r04", servico: "moradia",
    descricao: "Contato com Secretaria de Habitação para programa de aluguel social — fase de preparação para saída.",
    data_encaminhamento: "2024-05-10", responsavel_id: "s1",
    retorno_previsto: "2024-05-24", status: "sem_retorno",
    observacoes_retorno: "Não houve resposta da secretaria no prazo. Reagendado para 10/06.",
    created_at: "2024-05-10T10:00:00Z", updated_at: "2024-06-02T09:00:00Z",
  },
];

export function getMockEncaminhamentos(residenteId: string): Encaminhamento[] {
  return MOCK_ENCAMINHAMENTOS.filter((e) => e.residente_id === residenteId);
}

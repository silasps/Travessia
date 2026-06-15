-- =============================================
-- Projeto Travessia — Schema Inicial
-- =============================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ─────────────────────────────────────────
-- FUNÇÕES UTILITÁRIAS
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────

CREATE TYPE staff_role AS ENUM (
  'super_admin',
  'coordenacao',
  'tecnico',
  'cuidador'
);

-- ─────────────────────────────────────────
-- STAFF — PERFIS E PAPÉIS
-- ─────────────────────────────────────────

CREATE TABLE staff_profiles (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name         TEXT NOT NULL,
  cpf               TEXT,
  phone             TEXT,
  cargo             TEXT,
  avatar_url        TEXT,
  lgpd_consent_at   TIMESTAMPTZ,
  lgpd_consent_ip   TEXT,
  is_active         BOOLEAN NOT NULL DEFAULT true,
  created_at        TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE staff_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role        staff_role NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_staff_profiles_updated_at
  BEFORE UPDATE ON staff_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- CONFIGURAÇÕES DO SISTEMA
-- ─────────────────────────────────────────

CREATE TABLE configuracoes_sistema (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chave       TEXT NOT NULL UNIQUE,
  valor       TEXT NOT NULL,
  descricao   TEXT,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TRIGGER trg_configuracoes_updated_at
  BEFORE UPDATE ON configuracoes_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─────────────────────────────────────────
-- RLS — ROW LEVEL SECURITY
-- ─────────────────────────────────────────

ALTER TABLE staff_profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Função helper: verificar papel do usuário atual
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS staff_role AS $$
  SELECT role FROM staff_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION has_staff_role(check_role staff_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid() AND role = check_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_coordenacao_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'coordenacao')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_tecnico_or_above()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'coordenacao', 'tecnico')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_any_staff()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM staff_roles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas: staff_profiles
CREATE POLICY "staff_profiles_own" ON staff_profiles
  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "staff_profiles_coordenacao_read" ON staff_profiles
  FOR SELECT USING (is_coordenacao_or_above());

-- Políticas: staff_roles
CREATE POLICY "staff_roles_own" ON staff_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "staff_roles_coordenacao_read" ON staff_roles
  FOR SELECT USING (is_coordenacao_or_above());
CREATE POLICY "staff_roles_super_admin_write" ON staff_roles
  FOR ALL USING (has_staff_role('super_admin'));

-- Políticas: configuracoes_sistema
CREATE POLICY "configuracoes_staff_read" ON configuracoes_sistema
  FOR SELECT USING (is_any_staff());
CREATE POLICY "configuracoes_coordenacao_write" ON configuracoes_sistema
  FOR ALL USING (is_coordenacao_or_above());

-- ─────────────────────────────────────────
-- DADOS INICIAIS
-- ─────────────────────────────────────────

INSERT INTO configuracoes_sistema (chave, valor, descricao) VALUES
  ('dpo_nome',            'Responsável pela OSC',             'Nome do Encarregado de Dados (DPO)'),
  ('dpo_email',           'dpo@projetotravessia.org.br',      'E-mail do DPO para requisições LGPD'),
  ('capacidade_total',    '50',                               'Número máximo de vagas do abrigo'),
  ('nome_osc',            'Projeto Travessia',                'Nome da Organização da Sociedade Civil'),
  ('cnpj_osc',            '00.000.000/0001-00',               'CNPJ da OSC — atualizar'),
  ('endereco_osc',        'Ribeirão Preto, SP',               'Endereço do abrigo'),
  ('telefone_osc',        '',                                 'Telefone de contato da OSC'),
  ('email_osc',           'contato@projetotravessia.org.br',  'E-mail de contato da OSC');

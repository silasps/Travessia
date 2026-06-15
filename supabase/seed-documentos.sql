-- =============================================
-- Projeto Travessia — Seed: Documentos Públicos
-- Execute no Supabase Dashboard → SQL Editor
-- após rodar run-all.sql
--
-- IMPORTANTE: Os arquivo_url abaixo apontam para a pasta geral do Drive.
-- Após adicionar cada arquivo ao Supabase Storage ou obter links diretos,
-- atualize as URLs com:
--   UPDATE documentos_publicos SET arquivo_url = 'URL_DIRETA' WHERE titulo = '...';
-- =============================================

INSERT INTO documentos_publicos (titulo, descricao, categoria, arquivo_url, competencia, publicado, publicado_em, tamanho_kb)
VALUES

-- ── ESTATUTO E REGIMENTO ──────────────────────────────────────────────

('Estatuto Social do Projeto Travessia',
 'Estatuto Social atualizado da OSC, aprovado em Assembleia Geral.',
 'estatuto',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2025',
 true, '2025-01-01', 27700),

('Estatuto Social do Projeto Travessia (versão 2024)',
 'Versão anterior do Estatuto Social, vigente até janeiro/2025.',
 'estatuto',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2024',
 true, '2024-03-01', 5600),

('Regulamento de Compras e Contratação de Serviços',
 'Normas internas para processos de compra e contratação.',
 'regimento',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2023',
 true, '2023-07-01', NULL),

('Regulamento de Contratação de Pessoal',
 'Normas para seleção, contratação e gestão de pessoal da OSC.',
 'regimento',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2025',
 true, '2025-10-01', NULL),

-- ── ATAS ──────────────────────────────────────────────────────────────

('Ata de Eleição da Diretoria',
 'Ata da assembleia que elegeu a diretoria atual do Projeto Travessia.',
 'ata',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 'Jan/2025',
 true, '2025-01-01', 9200),

('Ata de Eleição da Diretoria (2024)',
 'Ata da assembleia de eleição anterior.',
 'ata',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 'Jan/2024',
 true, '2024-01-01', 8600),

('Relação dos Diretores — 2025',
 'Lista nominal dos membros da diretoria eleita em 2025, com funções e CPFs.',
 'ata',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2025',
 true, '2025-01-15', NULL),

('Relação dos Diretores — 2024',
 'Lista nominal dos membros da diretoria de 2024.',
 'ata',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2024',
 true, '2024-01-15', NULL),

-- ── TERMOS DE COLABORAÇÃO / PARCERIAS ─────────────────────────────────

('Termo de Fomento SEDS-SP — Processo Nº SEDS-PRC-2025-00944-DM',
 'Instrumento de parceria com a Secretaria de Desenvolvimento Social do Estado de São Paulo para execução dos serviços socioassistenciais.',
 'contrato_parceria',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2025-2026',
 true, '2025-12-01', NULL),

('Termo de Colaboração — Projeto Travessia (2024–2026)',
 'Convênio com a Prefeitura de Ribeirão Preto para o Serviço de Acolhimento Institucional para adultos.',
 'contrato_parceria',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2024-2026',
 true, '2024-01-01', NULL),

('Termo de Colaboração — Pertencer SAICA II (2022–2024)',
 'Convênio para o Serviço de Acolhimento Institucional para Crianças e Adolescentes.',
 'contrato_parceria',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2022-2024',
 true, '2022-01-01', NULL),

('Termo de Colaboração — Casa Abrigo SRV',
 'Convênio para o Serviço Residencial de Vida.',
 'contrato_parceria',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2020-2024',
 true, '2020-01-01', NULL),

('Termo de Colaboração — Projeto Criança Feliz SRV',
 'Convênio para o Serviço de Visita Domiciliar à primeira infância.',
 'contrato_parceria',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 '2020-2024',
 true, '2020-01-01', NULL),

-- ── DEMONSTRATIVOS CONTÁBEIS ──────────────────────────────────────────

('Balanço e Demonstrativo Contábil',
 'Balanço patrimonial e demonstrativo de resultado do exercício.',
 'balancete',
 'https://drive.google.com/drive/folders/1Hx6i0P999t-MVFoArlKhb9Sh6Y0QoAMt',
 'Jul/2024',
 true, '2024-07-01', NULL);

-- Confirma
SELECT categoria, count(*) FROM documentos_publicos GROUP BY categoria ORDER BY categoria;
